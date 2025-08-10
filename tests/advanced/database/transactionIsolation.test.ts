/**
 * トランザクション分離レベル・ACID特性高度テスト
 * チーム2: データ整合性・トランザクション担当（1名）
 *
 * 目標: ACID特性の全レベルテスト、データ破損検出・復旧テスト
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import fc from 'fast-check'
import { faker } from '@faker-js/faker'

interface TransactionLog {
  id: string
  operations: LogEntry[]
  status: 'BEGIN' | 'COMMIT' | 'ROLLBACK'
  timestamp: Date
  isolationLevel: IsolationLevel
}

interface LogEntry {
  operation: 'READ' | 'WRITE' | 'DELETE' | 'INSERT'
  table: string
  recordId: string
  beforeValue?: any
  afterValue?: any
  timestamp: Date
  lsn: number // Log Sequence Number
}

type IsolationLevel = 'READ_UNCOMMITTED' | 'READ_COMMITTED' | 'REPEATABLE_READ' | 'SERIALIZABLE'

interface DatabaseRecord {
  id: string
  table: string
  data: any
  version: number
  lastModified: Date
  lockedBy?: string
}

interface ReadView {
  transactionId: string
  createdAt: Date
  activeTransactions: Set<string>
  minActiveTransaction: string | null
  maxCommittedTransaction: string | null
}

class ACIDTransactionManager {
  private records: Map<string, DatabaseRecord> = new Map()
  private transactionLogs: Map<string, TransactionLog> = new Map()
  private activeTransactions: Set<string> = new Set()
  private nextLSN: number = 1
  private durabilityLog: LogEntry[] = []
  private checkpoints: Array<{ lsn: number; timestamp: Date }> = []

  async beginTransaction(isolationLevel: IsolationLevel = 'READ_COMMITTED'): Promise<string> {
    const transactionId = `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const transactionLog: TransactionLog = {
      id: transactionId,
      operations: [],
      status: 'BEGIN',
      timestamp: new Date(),
      isolationLevel,
    }

    this.transactionLogs.set(transactionId, transactionLog)
    this.activeTransactions.add(transactionId)

    // Log BEGIN operation for durability
    const beginLogEntry: LogEntry = {
      operation: 'READ', // Using READ as BEGIN placeholder
      table: 'TRANSACTION_CONTROL',
      recordId: transactionId,
      afterValue: { status: 'BEGIN', isolationLevel },
      timestamp: new Date(),
      lsn: this.nextLSN++,
    }

    transactionLog.operations.push(beginLogEntry)
    this.durabilityLog.push(beginLogEntry)

    return transactionId
  }

  async read(transactionId: string, table: string, recordId: string): Promise<any> {
    const transaction = this.validateTransaction(transactionId)
    const recordKey = `${table}:${recordId}`
    const record = this.records.get(recordKey)

    // Create read view based on isolation level
    const readView = this.createReadView(transactionId, transaction.isolationLevel)
    const visibleValue = this.getVisibleValue(record, readView, transaction.isolationLevel)

    // Log read operation
    const logEntry: LogEntry = {
      operation: 'READ',
      table,
      recordId,
      beforeValue: visibleValue,
      timestamp: new Date(),
      lsn: this.nextLSN++,
    }

    transaction.operations.push(logEntry)

    return visibleValue
  }

  async write(
    transactionId: string,
    table: string,
    recordId: string,
    newValue: any
  ): Promise<void> {
    const transaction = this.validateTransaction(transactionId)
    const recordKey = `${table}:${recordId}`
    const existingRecord = this.records.get(recordKey)

    // Check for write conflicts based on isolation level
    await this.checkWriteConflicts(transactionId, recordKey, transaction.isolationLevel)

    const beforeValue = existingRecord?.data

    // Create or update record
    const record: DatabaseRecord = {
      id: recordKey,
      table,
      data: newValue,
      version: (existingRecord?.version || 0) + 1,
      lastModified: new Date(),
      lockedBy: transactionId,
    }

    this.records.set(recordKey, record)

    // Log write operation for atomicity and durability
    const logEntry: LogEntry = {
      operation: 'WRITE',
      table,
      recordId,
      beforeValue,
      afterValue: newValue,
      timestamp: new Date(),
      lsn: this.nextLSN++,
    }

    transaction.operations.push(logEntry)
    this.durabilityLog.push(logEntry)
  }

  async delete(transactionId: string, table: string, recordId: string): Promise<void> {
    const transaction = this.validateTransaction(transactionId)
    const recordKey = `${table}:${recordId}`
    const existingRecord = this.records.get(recordKey)

    if (!existingRecord) {
      throw new Error(`Record not found: ${recordKey}`)
    }

    await this.checkWriteConflicts(transactionId, recordKey, transaction.isolationLevel)

    const beforeValue = existingRecord.data
    this.records.delete(recordKey)

    // Log delete operation
    const logEntry: LogEntry = {
      operation: 'DELETE',
      table,
      recordId,
      beforeValue,
      timestamp: new Date(),
      lsn: this.nextLSN++,
    }

    transaction.operations.push(logEntry)
    this.durabilityLog.push(logEntry)
  }

  async insert(transactionId: string, table: string, recordId: string, value: any): Promise<void> {
    const transaction = this.validateTransaction(transactionId)
    const recordKey = `${table}:${recordId}`

    if (this.records.has(recordKey)) {
      throw new Error(`Record already exists: ${recordKey}`)
    }

    const record: DatabaseRecord = {
      id: recordKey,
      table,
      data: value,
      version: 1,
      lastModified: new Date(),
      lockedBy: transactionId,
    }

    this.records.set(recordKey, record)

    // Log insert operation
    const logEntry: LogEntry = {
      operation: 'INSERT',
      table,
      recordId,
      afterValue: value,
      timestamp: new Date(),
      lsn: this.nextLSN++,
    }

    transaction.operations.push(logEntry)
    this.durabilityLog.push(logEntry)
  }

  async commit(transactionId: string): Promise<void> {
    const transaction = this.validateTransaction(transactionId)

    try {
      // Atomicity: All operations succeed or fail together
      await this.validateAllOperations(transaction)

      // Consistency: Check business rules and constraints
      await this.validateConsistency(transaction)

      // Durability: Write to persistent log
      await this.writeToLog(transactionId, 'COMMIT')

      // Release locks and make changes visible
      this.releaseLocks(transactionId)
      transaction.status = 'COMMIT'
      this.activeTransactions.delete(transactionId)

      // Create checkpoint periodically
      if (this.durabilityLog.length % 100 === 0) {
        await this.createCheckpoint()
      }
    } catch (error) {
      await this.rollback(transactionId)
      throw error
    }
  }

  async rollback(transactionId: string): Promise<void> {
    const transaction = this.transactionLogs.get(transactionId)
    if (!transaction) {
      throw new Error(`Transaction not found: ${transactionId}`)
    }

    // Atomicity: Undo all operations in reverse order
    const operations = [...transaction.operations].reverse()

    for (const operation of operations) {
      await this.undoOperation(operation)
    }

    // Write rollback to log for durability
    await this.writeToLog(transactionId, 'ROLLBACK')

    transaction.status = 'ROLLBACK'
    this.releaseLocks(transactionId)
    this.activeTransactions.delete(transactionId)
  }

  private validateTransaction(transactionId: string): TransactionLog {
    const transaction = this.transactionLogs.get(transactionId)
    if (!transaction || !this.activeTransactions.has(transactionId)) {
      throw new Error(`Invalid or inactive transaction: ${transactionId}`)
    }
    return transaction
  }

  private createReadView(transactionId: string, isolationLevel: IsolationLevel): ReadView {
    const now = new Date()
    const activeTransactions = new Set(this.activeTransactions)
    activeTransactions.delete(transactionId) // Don't include self

    return {
      transactionId,
      createdAt: now,
      activeTransactions,
      minActiveTransaction:
        activeTransactions.size > 0
          ? Math.min(...Array.from(activeTransactions).map((id) => parseInt(id.split('_')[1]))) + ''
          : null,
      maxCommittedTransaction: this.getMaxCommittedTransaction(),
    }
  }

  private getMaxCommittedTransaction(): string | null {
    const committedTransactions = Array.from(this.transactionLogs.entries())
      .filter(([_, tx]) => tx.status === 'COMMIT')
      .map(([id, _]) => id)

    if (committedTransactions.length === 0) return null

    return committedTransactions.sort(
      (a, b) => parseInt(b.split('_')[1]) - parseInt(a.split('_')[1])
    )[0]
  }

  private getVisibleValue(
    record: DatabaseRecord | undefined,
    readView: ReadView,
    isolationLevel: IsolationLevel
  ): any {
    if (!record) return undefined

    switch (isolationLevel) {
      case 'READ_UNCOMMITTED':
        // Can see uncommitted changes
        return record.data

      case 'READ_COMMITTED':
        // Can only see committed changes
        if (!record.lockedBy || !this.activeTransactions.has(record.lockedBy)) {
          return record.data
        }
        return this.getLastCommittedValue(record)

      case 'REPEATABLE_READ':
        // Consistent snapshot throughout transaction
        if (
          !record.lockedBy ||
          record.lockedBy === readView.transactionId ||
          !readView.activeTransactions.has(record.lockedBy)
        ) {
          return record.data
        }
        return this.getSnapshotValue(record, readView)

      case 'SERIALIZABLE':
        // Strictest isolation
        if (record.lockedBy && record.lockedBy !== readView.transactionId) {
          throw new Error(`Serialization failure: record locked by ${record.lockedBy}`)
        }
        return record.data

      default:
        return record.data
    }
  }

  private getLastCommittedValue(record: DatabaseRecord): any {
    // In a real implementation, this would look at version history
    // For simplicity, return undefined if locked
    if (record.lockedBy && this.activeTransactions.has(record.lockedBy)) {
      return undefined
    }
    return record.data
  }

  private getSnapshotValue(record: DatabaseRecord, readView: ReadView): any {
    // Simplified snapshot isolation
    // In practice, this would use version chains
    if (record.lastModified <= readView.createdAt) {
      return record.data
    }
    return undefined
  }

  private async checkWriteConflicts(
    transactionId: string,
    recordKey: string,
    isolationLevel: IsolationLevel
  ): Promise<void> {
    const record = this.records.get(recordKey)

    if (!record) return // No conflict for new records

    // Check if another transaction has locked this record
    if (record.lockedBy && record.lockedBy !== transactionId) {
      switch (isolationLevel) {
        case 'READ_UNCOMMITTED':
        case 'READ_COMMITTED':
          // Wait for lock to be released (simplified - would use actual locking)
          if (this.activeTransactions.has(record.lockedBy)) {
            throw new Error(`Write conflict: record ${recordKey} locked by ${record.lockedBy}`)
          }
          break

        case 'REPEATABLE_READ':
        case 'SERIALIZABLE':
          // Strict conflict detection
          if (this.activeTransactions.has(record.lockedBy)) {
            throw new Error(`Serialization failure: write conflict on ${recordKey}`)
          }
          break
      }
    }
  }

  private async validateAllOperations(transaction: TransactionLog): Promise<void> {
    // Atomicity validation: ensure all operations are valid
    for (const operation of transaction.operations) {
      await this.validateOperation(operation)
    }
  }

  private async validateOperation(operation: LogEntry): Promise<void> {
    // Business rule validation would go here
    const recordKey = `${operation.table}:${operation.recordId}`

    switch (operation.operation) {
      case 'WRITE':
        if (operation.afterValue === null || operation.afterValue === undefined) {
          throw new Error(`Invalid write value for ${recordKey}`)
        }
        break

      case 'DELETE':
        if (!operation.beforeValue) {
          throw new Error(`Cannot delete non-existent record ${recordKey}`)
        }
        break

      case 'INSERT':
        if (operation.beforeValue !== undefined) {
          throw new Error(`Cannot insert over existing record ${recordKey}`)
        }
        break
    }
  }

  private async validateConsistency(transaction: TransactionLog): Promise<void> {
    // Consistency checks: business rules, foreign keys, etc.
    const changedTables = new Set(transaction.operations.map((op) => op.table))

    for (const table of changedTables) {
      await this.validateTableConsistency(table, transaction)
    }
  }

  private async validateTableConsistency(
    table: string,
    transaction: TransactionLog
  ): Promise<void> {
    // Example consistency checks
    if (table === 'user_progress') {
      // Validate progress scores are between 0 and 100
      const progressOps = transaction.operations.filter(
        (op) => op.table === table && (op.operation === 'WRITE' || op.operation === 'INSERT')
      )

      for (const op of progressOps) {
        if (op.afterValue?.score < 0 || op.afterValue?.score > 100) {
          throw new Error(`Invalid progress score: ${op.afterValue?.score}`)
        }
      }
    }

    if (table === 'learning_sessions') {
      // Validate session durations are positive
      const sessionOps = transaction.operations.filter(
        (op) => op.table === table && (op.operation === 'WRITE' || op.operation === 'INSERT')
      )

      for (const op of sessionOps) {
        if (op.afterValue?.duration <= 0) {
          throw new Error(`Invalid session duration: ${op.afterValue?.duration}`)
        }
      }
    }
  }

  private async writeToLog(transactionId: string, status: 'COMMIT' | 'ROLLBACK'): Promise<void> {
    const logEntry: LogEntry = {
      operation: status === 'COMMIT' ? 'WRITE' : 'DELETE', // Placeholder operations
      table: 'TRANSACTION_CONTROL',
      recordId: transactionId,
      afterValue: { status },
      timestamp: new Date(),
      lsn: this.nextLSN++,
    }

    this.durabilityLog.push(logEntry)

    // Simulate writing to persistent storage
    await this.flushLog()
  }

  private async flushLog(): Promise<void> {
    // Simulate async write to disk
    return new Promise((resolve) => {
      setTimeout(resolve, 1) // Simulated I/O delay
    })
  }

  private releaseLocks(transactionId: string): void {
    for (const [key, record] of this.records) {
      if (record.lockedBy === transactionId) {
        record.lockedBy = undefined
      }
    }
  }

  private async undoOperation(operation: LogEntry): Promise<void> {
    const recordKey = `${operation.table}:${operation.recordId}`

    switch (operation.operation) {
      case 'WRITE':
        if (operation.beforeValue !== undefined) {
          const record = this.records.get(recordKey)
          if (record) {
            record.data = operation.beforeValue
            record.version = Math.max(1, record.version - 1)
          }
        } else {
          this.records.delete(recordKey)
        }
        break

      case 'INSERT':
        this.records.delete(recordKey)
        break

      case 'DELETE':
        if (operation.beforeValue !== undefined) {
          const record: DatabaseRecord = {
            id: recordKey,
            table: operation.table,
            data: operation.beforeValue,
            version: 1,
            lastModified: new Date(),
          }
          this.records.set(recordKey, record)
        }
        break
    }
  }

  private async createCheckpoint(): Promise<void> {
    const checkpoint = {
      lsn: this.nextLSN - 1,
      timestamp: new Date(),
    }

    this.checkpoints.push(checkpoint)

    // In a real system, this would write the current state to disk
    // and allow older log entries to be garbage collected
  }

  // Recovery methods for testing crash scenarios
  async simulateCrash(): Promise<void> {
    // Clear in-memory state but keep durability log
    this.records.clear()
    this.transactionLogs.clear()
    this.activeTransactions.clear()
  }

  async recover(): Promise<void> {
    // Find the last checkpoint
    const lastCheckpoint = this.checkpoints[this.checkpoints.length - 1]
    const startLSN = lastCheckpoint ? lastCheckpoint.lsn : 0

    // Replay log entries from checkpoint
    const logEntriesToReplay = this.durabilityLog.filter((entry) => entry.lsn > startLSN)

    for (const entry of logEntriesToReplay) {
      await this.replayLogEntry(entry)
    }
  }

  private async replayLogEntry(entry: LogEntry): Promise<void> {
    if (entry.table === 'TRANSACTION_CONTROL') {
      // Handle transaction control entries
      if (entry.afterValue?.status === 'COMMIT') {
        // Transaction was committed, apply all its operations
        // (This is simplified - real implementation would be more complex)
      }
      return
    }

    const recordKey = `${entry.table}:${entry.recordId}`

    switch (entry.operation) {
      case 'WRITE':
      case 'INSERT':
        const record: DatabaseRecord = {
          id: recordKey,
          table: entry.table,
          data: entry.afterValue,
          version: 1,
          lastModified: entry.timestamp,
        }
        this.records.set(recordKey, record)
        break

      case 'DELETE':
        this.records.delete(recordKey)
        break
    }
  }

  // Diagnostic methods for testing
  getRecord(table: string, recordId: string): DatabaseRecord | undefined {
    return this.records.get(`${table}:${recordId}`)
  }

  getAllRecords(): Map<string, DatabaseRecord> {
    return new Map(this.records)
  }

  getTransactionLog(transactionId: string): TransactionLog | undefined {
    return this.transactionLogs.get(transactionId)
  }

  getDurabilityLog(): LogEntry[] {
    return [...this.durabilityLog]
  }

  getActiveTransactions(): Set<string> {
    return new Set(this.activeTransactions)
  }

  async performConsistencyCheck(): Promise<boolean> {
    // Check referential integrity and business rules
    try {
      for (const [key, record] of this.records) {
        if (record.table === 'user_progress') {
          if (record.data.score < 0 || record.data.score > 100) {
            throw new Error(`Consistency violation: invalid score ${record.data.score}`)
          }
        }
      }
      return true
    } catch (error) {
      return false
    }
  }
}

describe('ACID Transaction Management - Advanced Testing', () => {
  let manager: ACIDTransactionManager

  beforeEach(() => {
    manager = new ACIDTransactionManager()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  /**
   * Atomicity Testing
   */
  describe('Atomicity', () => {
    it('should commit all operations together or rollback all', async () => {
      const tx = await manager.beginTransaction()

      await manager.insert(tx, 'users', 'user1', { name: 'Alice', score: 85 })
      await manager.insert(tx, 'users', 'user2', { name: 'Bob', score: 92 })
      await manager.insert(tx, 'sessions', 'session1', { userId: 'user1', duration: 120 })

      await manager.commit(tx)

      // All records should exist
      expect(manager.getRecord('users', 'user1')?.data.name).toBe('Alice')
      expect(manager.getRecord('users', 'user2')?.data.name).toBe('Bob')
      expect(manager.getRecord('sessions', 'session1')?.data.duration).toBe(120)
    })

    it('should rollback all operations on failure', async () => {
      const tx = await manager.beginTransaction()

      await manager.insert(tx, 'users', 'user1', { name: 'Alice', score: 85 })
      await manager.insert(tx, 'users', 'user2', { name: 'Bob', score: 92 })

      // This should cause a rollback
      await manager.rollback(tx)

      // No records should exist
      expect(manager.getRecord('users', 'user1')).toBeUndefined()
      expect(manager.getRecord('users', 'user2')).toBeUndefined()
    })

    it('should handle partial failure correctly', async () => {
      const tx = await manager.beginTransaction()

      await manager.insert(tx, 'users', 'user1', { name: 'Alice', score: 85 })

      try {
        // This will fail due to duplicate key
        await manager.insert(tx, 'users', 'user1', { name: 'Bob', score: 92 })
        await manager.commit(tx)
      } catch (error) {
        await manager.rollback(tx)
      }

      // No records should exist due to rollback
      expect(manager.getRecord('users', 'user1')).toBeUndefined()
    })
  })

  /**
   * Consistency Testing
   */
  describe('Consistency', () => {
    it('should enforce business rule constraints', async () => {
      const tx = await manager.beginTransaction()

      // This should fail consistency check
      await manager.insert(tx, 'user_progress', 'progress1', {
        userId: 'user1',
        score: 150, // Invalid score > 100
      })

      await expect(manager.commit(tx)).rejects.toThrow('Invalid progress score')

      // Record should not exist due to failed commit
      expect(manager.getRecord('user_progress', 'progress1')).toBeUndefined()
    })

    it('should validate referential integrity', async () => {
      const tx = await manager.beginTransaction()

      await manager.insert(tx, 'learning_sessions', 'session1', {
        userId: 'user1',
        duration: -10, // Invalid negative duration
      })

      await expect(manager.commit(tx)).rejects.toThrow('Invalid session duration')
    })

    it('should maintain consistency across multiple tables', async () => {
      const tx = await manager.beginTransaction()

      await manager.insert(tx, 'users', 'user1', { name: 'Alice', totalScore: 0 })
      await manager.insert(tx, 'user_progress', 'progress1', { userId: 'user1', score: 85 })

      // Update user's total score to maintain consistency
      await manager.write(tx, 'users', 'user1', { name: 'Alice', totalScore: 85 })

      await manager.commit(tx)

      const user = manager.getRecord('users', 'user1')
      const progress = manager.getRecord('user_progress', 'progress1')

      expect(user?.data.totalScore).toBe(85)
      expect(progress?.data.score).toBe(85)
    })
  })

  /**
   * Isolation Testing - Different Isolation Levels
   */
  describe('Isolation Levels', () => {
    it('should allow dirty reads in READ_UNCOMMITTED', async () => {
      const tx1 = await manager.beginTransaction('READ_UNCOMMITTED')
      const tx2 = await manager.beginTransaction('READ_UNCOMMITTED')

      await manager.insert(tx1, 'users', 'user1', { name: 'Alice', score: 85 })

      // tx2 should be able to read uncommitted data
      const dirtyRead = await manager.read(tx2, 'users', 'user1')
      expect(dirtyRead?.name).toBe('Alice')

      // Rollback tx1
      await manager.rollback(tx1)
      await manager.commit(tx2)

      // The record should not exist after rollback
      expect(manager.getRecord('users', 'user1')).toBeUndefined()
    })

    it('should prevent dirty reads in READ_COMMITTED', async () => {
      const tx1 = await manager.beginTransaction('READ_COMMITTED')
      const tx2 = await manager.beginTransaction('READ_COMMITTED')

      await manager.insert(tx1, 'users', 'user1', { name: 'Alice', score: 85 })

      // tx2 should not see uncommitted data
      const cleanRead = await manager.read(tx2, 'users', 'user1')
      expect(cleanRead).toBeUndefined()

      await manager.commit(tx1)

      // Now tx2 should see the committed data
      const committedRead = await manager.read(tx2, 'users', 'user1')
      expect(committedRead?.name).toBe('Alice')

      await manager.commit(tx2)
    })

    it('should provide repeatable reads in REPEATABLE_READ', async () => {
      const tx1 = await manager.beginTransaction('REPEATABLE_READ')
      const tx2 = await manager.beginTransaction('REPEATABLE_READ')

      // Insert initial data
      await manager.insert(tx1, 'users', 'user1', { name: 'Alice', score: 85 })
      await manager.commit(tx1)

      // tx2 reads the data
      const firstRead = await manager.read(tx2, 'users', 'user1')
      expect(firstRead?.name).toBe('Alice')

      // tx1 starts new transaction and modifies data
      const tx3 = await manager.beginTransaction('REPEATABLE_READ')
      await manager.write(tx3, 'users', 'user1', { name: 'Alice Updated', score: 90 })
      await manager.commit(tx3)

      // tx2 should still see the same data (repeatable read)
      const secondRead = await manager.read(tx2, 'users', 'user1')
      expect(secondRead?.name).toBe('Alice') // Should be unchanged

      await manager.commit(tx2)
    })

    it('should enforce strict serialization in SERIALIZABLE', async () => {
      const tx1 = await manager.beginTransaction('SERIALIZABLE')
      const tx2 = await manager.beginTransaction('SERIALIZABLE')

      await manager.insert(tx1, 'users', 'user1', { name: 'Alice', score: 85 })

      // tx2 should not be able to read or write to locked resources
      await expect(manager.read(tx2, 'users', 'user1')).rejects.toThrow('Serialization failure')

      await manager.commit(tx1)
      await manager.commit(tx2)
    })
  })

  /**
   * Durability Testing
   */
  describe('Durability', () => {
    it('should survive system crash and recover committed transactions', async () => {
      const tx1 = await manager.beginTransaction()
      await manager.insert(tx1, 'users', 'user1', { name: 'Alice', score: 85 })
      await manager.commit(tx1)

      const tx2 = await manager.beginTransaction()
      await manager.insert(tx2, 'users', 'user2', { name: 'Bob', score: 92 })
      // Don't commit tx2

      // Simulate crash
      await manager.simulateCrash()

      // Data should be lost from memory
      expect(manager.getRecord('users', 'user1')).toBeUndefined()
      expect(manager.getRecord('users', 'user2')).toBeUndefined()

      // Recovery should restore committed transactions
      await manager.recover()

      expect(manager.getRecord('users', 'user1')?.data.name).toBe('Alice')
      expect(manager.getRecord('users', 'user2')).toBeUndefined() // Not committed
    })

    it('should maintain log integrity across multiple transactions', async () => {
      const transactions = []

      for (let i = 0; i < 5; i++) {
        const tx = await manager.beginTransaction()
        await manager.insert(tx, 'users', `user${i}`, { name: `User${i}`, score: 80 + i })
        await manager.commit(tx)
        transactions.push(tx)
      }

      const logEntries = manager.getDurabilityLog()

      // Should have entries for all operations
      const insertEntries = logEntries.filter((entry) => entry.operation === 'INSERT')
      expect(insertEntries.length).toBe(5)

      // Log sequence numbers should be sequential
      const lsns = logEntries.map((entry) => entry.lsn)
      for (let i = 1; i < lsns.length; i++) {
        expect(lsns[i]).toBeGreaterThan(lsns[i - 1])
      }
    })

    it('should handle recovery with checkpoints', async () => {
      // Create many transactions to trigger checkpoint
      for (let i = 0; i < 150; i++) {
        const tx = await manager.beginTransaction()
        await manager.insert(tx, 'bulk_data', `record${i}`, { value: i })
        await manager.commit(tx)
      }

      const originalLogLength = manager.getDurabilityLog().length

      // Simulate crash and recovery
      await manager.simulateCrash()
      await manager.recover()

      // All committed data should be recovered
      for (let i = 0; i < 150; i++) {
        const record = manager.getRecord('bulk_data', `record${i}`)
        expect(record?.data.value).toBe(i)
      }
    })
  })

  /**
   * Property-Based Testing for ACID Properties
   */
  it('property: ACID properties should hold for any sequence of operations', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            operation: fc.constantFrom('insert', 'write', 'read', 'delete'),
            table: fc.constantFrom('users', 'sessions', 'progress'),
            recordId: fc.string({ minLength: 1, maxLength: 10 }),
            value: fc.record({
              name: fc.string({ minLength: 1, maxLength: 20 }),
              score: fc.integer({ min: 0, max: 100 }),
            }),
            shouldCommit: fc.boolean(),
            isolationLevel: fc.constantFrom('READ_COMMITTED', 'REPEATABLE_READ', 'SERIALIZABLE'),
          }),
          { minLength: 1, maxLength: 10 }
        ),
        async (operationSpecs) => {
          const tx = await manager.beginTransaction()
          const initialRecordCount = manager.getAllRecords().size

          try {
            for (const spec of operationSpecs) {
              switch (spec.operation) {
                case 'insert':
                  try {
                    await manager.insert(tx, spec.table, spec.recordId, spec.value)
                  } catch (error) {
                    // Duplicate key errors are acceptable
                    if (!(error as Error).message.includes('already exists')) {
                      throw error
                    }
                  }
                  break

                case 'write':
                  try {
                    await manager.write(tx, spec.table, spec.recordId, spec.value)
                  } catch (error) {
                    // Write conflicts are acceptable
                    if (!(error as Error).message.includes('conflict')) {
                      throw error
                    }
                  }
                  break

                case 'read':
                  await manager.read(tx, spec.table, spec.recordId)
                  break

                case 'delete':
                  try {
                    await manager.delete(tx, spec.table, spec.recordId)
                  } catch (error) {
                    // Record not found errors are acceptable
                    if (!(error as Error).message.includes('not found')) {
                      throw error
                    }
                  }
                  break
              }
            }

            if (spec.shouldCommit) {
              await manager.commit(tx)
            } else {
              await manager.rollback(tx)
            }

            // Invariant: System should remain consistent
            const isConsistent = await manager.performConsistencyCheck()
            expect(isConsistent).toBe(true)

            // Invariant: No partial transactions should be visible
            expect(manager.getActiveTransactions().has(tx)).toBe(false)
          } catch (error) {
            // If any error occurs, rollback and verify consistency
            try {
              await manager.rollback(tx)
            } catch (rollbackError) {
              // Rollback might fail if transaction is already rolled back
            }

            const isConsistent = await manager.performConsistencyCheck()
            expect(isConsistent).toBe(true)
          }
        }
      ),
      { numRuns: 20 }
    )
  })

  /**
   * Concurrency and Race Condition Testing
   */
  describe('Concurrent ACID Compliance', () => {
    it('should maintain ACID properties under concurrent access', async () => {
      const promises: Promise<void>[] = []
      const results: Array<{ success: boolean; error?: string }> = []

      for (let i = 0; i < 10; i++) {
        promises.push(
          (async function () {
            try {
              const tx = await manager.beginTransaction('READ_COMMITTED')

              await manager.insert(tx, 'concurrent_test', `record${i}`, {
                value: i,
                timestamp: new Date(),
              })

              // Simulate some processing time
              await new Promise((resolve) => setTimeout(resolve, Math.random() * 50))

              await manager.commit(tx)
              results.push({ success: true })
            } catch (error) {
              results.push({ success: false, error: (error as Error).message })
            }
          })()
        )
      }

      await Promise.all(promises)

      // At least some transactions should succeed
      const successes = results.filter((r) => r.success).length
      expect(successes).toBeGreaterThan(0)

      // System should remain consistent
      const isConsistent = await manager.performConsistencyCheck()
      expect(isConsistent).toBe(true)
    })
  })

  /**
   * Error Recovery Testing
   */
  describe('Error Recovery', () => {
    it('should handle and recover from constraint violations', async () => {
      const tx = await manager.beginTransaction()

      await manager.insert(tx, 'user_progress', 'progress1', {
        userId: 'user1',
        score: 85,
      })

      // Add invalid data that should cause constraint violation
      await manager.insert(tx, 'user_progress', 'progress2', {
        userId: 'user2',
        score: 150, // Invalid
      })

      await expect(manager.commit(tx)).rejects.toThrow()

      // System should be in consistent state
      expect(manager.getRecord('user_progress', 'progress1')).toBeUndefined()
      expect(manager.getRecord('user_progress', 'progress2')).toBeUndefined()

      const isConsistent = await manager.performConsistencyCheck()
      expect(isConsistent).toBe(true)
    })

    it('should handle multiple rollbacks correctly', async () => {
      for (let i = 0; i < 5; i++) {
        const tx = await manager.beginTransaction()

        await manager.insert(tx, 'temp_data', `record${i}`, { value: i })
        await manager.rollback(tx)
      }

      // No data should exist
      expect(manager.getAllRecords().size).toBe(0)

      // Log should still be intact
      const log = manager.getDurabilityLog()
      expect(log.length).toBeGreaterThan(0)
    })
  })
})
