/**
 * 並行処理制御・競合状態高度テスト
 * チーム2: データ整合性・トランザクション担当（1名）
 * 
 * 目標: Race condition、Dead lock、分散ロック機能テスト
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fc from 'fast-check';
import { faker } from '@faker-js/faker';
import * as sinon from 'sinon';

interface DatabaseConnection {
  id: string;
  isActive: boolean;
  transactionId?: string;
  lockHeld: Set<string>;
}

interface TransactionContext {
  id: string;
  operations: DatabaseOperation[];
  isolationLevel: 'READ_UNCOMMITTED' | 'READ_COMMITTED' | 'REPEATABLE_READ' | 'SERIALIZABLE';
  startTime: Date;
  status: 'ACTIVE' | 'COMMITTED' | 'ABORTED';
}

interface DatabaseOperation {
  type: 'READ' | 'WRITE' | 'DELETE' | 'CREATE';
  table: string;
  recordId: string;
  data?: any;
  timestamp: Date;
}

interface LockRequest {
  transactionId: string;
  resourceId: string;
  lockType: 'SHARED' | 'EXCLUSIVE';
  requestTime: Date;
}

interface ResourceLock {
  resourceId: string;
  lockType: 'SHARED' | 'EXCLUSIVE';
  holders: Set<string>; // transaction IDs
  waitQueue: LockRequest[];
  acquiredAt: Date;
}

class ConcurrencyController {
  private connections: Map<string, DatabaseConnection> = new Map();
  private transactions: Map<string, TransactionContext> = new Map();
  private locks: Map<string, ResourceLock> = new Map();
  private deadlockDetectionEnabled: boolean = true;
  private lockTimeout: number = 30000; // 30 seconds

  async beginTransaction(
    connectionId: string,
    isolationLevel: TransactionContext['isolationLevel'] = 'READ_COMMITTED'
  ): Promise<string> {
    const connection = this.connections.get(connectionId);
    if (!connection || !connection.isActive) {
      throw new Error(`Invalid connection: ${connectionId}`);
    }

    if (connection.transactionId) {
      throw new Error(`Connection ${connectionId} already has an active transaction`);
    }

    const transactionId = `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const transaction: TransactionContext = {
      id: transactionId,
      operations: [],
      isolationLevel,
      startTime: new Date(),
      status: 'ACTIVE'
    };

    this.transactions.set(transactionId, transaction);
    connection.transactionId = transactionId;

    return transactionId;
  }

  async acquireLock(
    transactionId: string,
    resourceId: string,
    lockType: 'SHARED' | 'EXCLUSIVE'
  ): Promise<boolean> {
    const transaction = this.transactions.get(transactionId);
    if (!transaction || transaction.status !== 'ACTIVE') {
      throw new Error(`Invalid or inactive transaction: ${transactionId}`);
    }

    const existingLock = this.locks.get(resourceId);

    if (!existingLock) {
      // No existing lock, grant immediately
      const newLock: ResourceLock = {
        resourceId,
        lockType,
        holders: new Set([transactionId]),
        waitQueue: [],
        acquiredAt: new Date()
      };
      this.locks.set(resourceId, newLock);
      return true;
    }

    // Check lock compatibility
    if (this.isLockCompatible(existingLock, lockType, transactionId)) {
      existingLock.holders.add(transactionId);
      return true;
    }

    // Lock conflict - check for deadlock before queueing
    if (this.deadlockDetectionEnabled) {
      if (await this.wouldCauseDeadlock(transactionId, resourceId)) {
        throw new Error(`Deadlock detected: transaction ${transactionId} requesting ${resourceId}`);
      }
    }

    // Queue the request
    const lockRequest: LockRequest = {
      transactionId,
      resourceId,
      lockType,
      requestTime: new Date()
    };

    existingLock.waitQueue.push(lockRequest);

    // Wait for lock (with timeout)
    return this.waitForLock(lockRequest);
  }

  private isLockCompatible(
    existingLock: ResourceLock,
    requestedType: 'SHARED' | 'EXCLUSIVE',
    transactionId: string
  ): boolean {
    // Already holds the lock
    if (existingLock.holders.has(transactionId)) {
      return true;
    }

    // No one in wait queue and compatible lock types
    if (existingLock.waitQueue.length === 0) {
      if (existingLock.lockType === 'SHARED' && requestedType === 'SHARED') {
        return true;
      }
    }

    return false;
  }

  private async wouldCauseDeadlock(transactionId: string, resourceId: string): Promise<boolean> {
    const visitedTransactions = new Set<string>();
    const currentPath = new Set<string>();

    const detectCycle = (currentTx: string): boolean => {
      if (currentPath.has(currentTx)) {
        return true; // Cycle detected
      }

      if (visitedTransactions.has(currentTx)) {
        return false; // Already processed, no cycle from here
      }

      visitedTransactions.add(currentTx);
      currentPath.add(currentTx);

      // Find what resources this transaction is waiting for
      const waitingFor = this.getResourcesWaitedBy(currentTx);
      
      for (const resource of waitingFor) {
        const lock = this.locks.get(resource);
        if (lock) {
          // Check who is holding the lock this transaction is waiting for
          for (const holder of lock.holders) {
            if (holder !== currentTx && detectCycle(holder)) {
              return true;
            }
          }
        }
      }

      currentPath.delete(currentTx);
      return false;
    };

    return detectCycle(transactionId);
  }

  private getResourcesWaitedBy(transactionId: string): string[] {
    const waitingFor: string[] = [];
    
    for (const [resourceId, lock] of this.locks) {
      const isWaiting = lock.waitQueue.some(req => req.transactionId === transactionId);
      if (isWaiting) {
        waitingFor.push(resourceId);
      }
    }

    return waitingFor;
  }

  private async waitForLock(request: LockRequest): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        this.removeLockRequest(request);
        reject(new Error(`Lock timeout for ${request.resourceId} by ${request.transactionId}`));
      }, this.lockTimeout);

      // Simulate waiting - in real implementation, this would be event-driven
      const checkLockAvailability = () => {
        const lock = this.locks.get(request.resourceId);
        if (!lock) {
          clearTimeout(timeoutId);
          resolve(false);
          return;
        }

        if (this.isLockCompatible(lock, request.lockType, request.transactionId)) {
          lock.holders.add(request.transactionId);
          this.removeLockRequest(request);
          clearTimeout(timeoutId);
          resolve(true);
        } else {
          // Keep waiting
          setTimeout(checkLockAvailability, 100);
        }
      };

      setTimeout(checkLockAvailability, 100);
    });
  }

  private removeLockRequest(request: LockRequest): void {
    const lock = this.locks.get(request.resourceId);
    if (lock) {
      lock.waitQueue = lock.waitQueue.filter(req => 
        req.transactionId !== request.transactionId || req.requestTime !== request.requestTime
      );
    }
  }

  async releaseLock(transactionId: string, resourceId: string): Promise<void> {
    const lock = this.locks.get(resourceId);
    if (!lock || !lock.holders.has(transactionId)) {
      return; // Lock not held by this transaction
    }

    lock.holders.delete(transactionId);

    // If no more holders, process wait queue
    if (lock.holders.size === 0) {
      await this.processWaitQueue(resourceId);
    }
  }

  private async processWaitQueue(resourceId: string): Promise<void> {
    const lock = this.locks.get(resourceId);
    if (!lock || lock.waitQueue.length === 0) {
      if (lock && lock.holders.size === 0) {
        this.locks.delete(resourceId);
      }
      return;
    }

    // Process wait queue in FIFO order
    const nextRequest = lock.waitQueue.shift();
    if (nextRequest) {
      // Check if transaction is still active
      const transaction = this.transactions.get(nextRequest.transactionId);
      if (transaction && transaction.status === 'ACTIVE') {
        lock.lockType = nextRequest.lockType;
        lock.holders.add(nextRequest.transactionId);
        lock.acquiredAt = new Date();

        // If it's a shared lock, grant to other compatible waiting requests
        if (nextRequest.lockType === 'SHARED') {
          const compatibleRequests = lock.waitQueue.filter(req => 
            req.lockType === 'SHARED' && 
            this.transactions.get(req.transactionId)?.status === 'ACTIVE'
          );

          for (const req of compatibleRequests) {
            lock.holders.add(req.transactionId);
            lock.waitQueue = lock.waitQueue.filter(r => r !== req);
          }
        }
      } else {
        // Transaction no longer active, skip and process next
        await this.processWaitQueue(resourceId);
      }
    }
  }

  async commitTransaction(transactionId: string): Promise<void> {
    const transaction = this.transactions.get(transactionId);
    if (!transaction) {
      throw new Error(`Transaction not found: ${transactionId}`);
    }

    if (transaction.status !== 'ACTIVE') {
      throw new Error(`Transaction ${transactionId} is not active`);
    }

    try {
      // Release all locks held by this transaction
      await this.releaseAllLocks(transactionId);

      // Mark transaction as committed
      transaction.status = 'COMMITTED';

      // Remove from active transactions (cleanup)
      setTimeout(() => {
        this.transactions.delete(transactionId);
        this.clearConnectionTransaction(transactionId);
      }, 5000); // Keep for 5 seconds for debugging

    } catch (error) {
      await this.rollbackTransaction(transactionId);
      throw error;
    }
  }

  async rollbackTransaction(transactionId: string): Promise<void> {
    const transaction = this.transactions.get(transactionId);
    if (!transaction) {
      throw new Error(`Transaction not found: ${transactionId}`);
    }

    // Release all locks held by this transaction
    await this.releaseAllLocks(transactionId);

    // Mark transaction as aborted
    transaction.status = 'ABORTED';

    // Remove from active transactions
    setTimeout(() => {
      this.transactions.delete(transactionId);
      this.clearConnectionTransaction(transactionId);
    }, 1000);
  }

  private async releaseAllLocks(transactionId: string): Promise<void> {
    const resourcesToRelease: string[] = [];

    // Find all resources locked by this transaction
    for (const [resourceId, lock] of this.locks) {
      if (lock.holders.has(transactionId)) {
        resourcesToRelease.push(resourceId);
      }
    }

    // Release locks and process wait queues
    for (const resourceId of resourcesToRelease) {
      await this.releaseLock(transactionId, resourceId);
    }
  }

  private clearConnectionTransaction(transactionId: string): void {
    for (const connection of this.connections.values()) {
      if (connection.transactionId === transactionId) {
        connection.transactionId = undefined;
        break;
      }
    }
  }

  createConnection(): string {
    const connectionId = `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const connection: DatabaseConnection = {
      id: connectionId,
      isActive: true,
      lockHeld: new Set()
    };

    this.connections.set(connectionId, connection);
    return connectionId;
  }

  closeConnection(connectionId: string): void {
    const connection = this.connections.get(connectionId);
    if (connection) {
      // Rollback active transaction if any
      if (connection.transactionId) {
        this.rollbackTransaction(connection.transactionId);
      }
      
      connection.isActive = false;
      this.connections.delete(connectionId);
    }
  }

  // Diagnostic methods for testing
  getActiveLocks(): Map<string, ResourceLock> {
    return new Map(this.locks);
  }

  getActiveTransactions(): Map<string, TransactionContext> {
    return new Map(this.transactions);
  }

  getLockWaitQueue(resourceId: string): LockRequest[] {
    const lock = this.locks.get(resourceId);
    return lock ? [...lock.waitQueue] : [];
  }

  setDeadlockDetection(enabled: boolean): void {
    this.deadlockDetectionEnabled = enabled;
  }

  setLockTimeout(timeoutMs: number): void {
    this.lockTimeout = timeoutMs;
  }
}

describe('Concurrency Control - Advanced Testing', () => {
  let controller: ConcurrencyController;
  let connection1: string;
  let connection2: string;
  let connection3: string;

  beforeEach(() => {
    controller = new ConcurrencyController();
    connection1 = controller.createConnection();
    connection2 = controller.createConnection();
    connection3 = controller.createConnection();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    sinon.restore();
  });

  /**
   * Property-Based Testing: 並行性の数学的不変条件
   */
  it('property: concurrent transactions should maintain data consistency invariants', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            isolationLevel: fc.constantFrom('READ_UNCOMMITTED', 'READ_COMMITTED', 'REPEATABLE_READ', 'SERIALIZABLE'),
            operations: fc.array(
              fc.record({
                type: fc.constantFrom('READ', 'WRITE', 'DELETE', 'CREATE'),
                resourceId: fc.constantFrom('resource1', 'resource2', 'resource3', 'resource4'),
                lockType: fc.constantFrom('SHARED', 'EXCLUSIVE')
              }),
              { minLength: 1, maxLength: 5 }
            )
          }),
          { minLength: 2, maxLength: 4 }
        ),
        async (transactionSpecs) => {
          const connections = transactionSpecs.map(() => controller.createConnection());
          const transactions: string[] = [];

          try {
            // Begin all transactions
            for (let i = 0; i < transactionSpecs.length; i++) {
              const txId = await controller.beginTransaction(
                connections[i], 
                transactionSpecs[i].isolationLevel as any
              );
              transactions.push(txId);
            }

            // Execute operations concurrently
            const operationPromises = transactions.map(async (txId, index) => {
              const spec = transactionSpecs[index];
              
              for (const op of spec.operations) {
                try {
                  await controller.acquireLock(txId, op.resourceId, op.lockType as any);
                } catch (error) {
                  // Deadlock or timeout is acceptable in concurrent scenarios
                  if ((error as Error).message.includes('Deadlock') || 
                      (error as Error).message.includes('timeout')) {
                    return 'blocked';
                  }
                  throw error;
                }
              }
              
              return 'completed';
            });

            const results = await Promise.allSettled(operationPromises);

            // Invariant: At least some transactions should complete or be blocked (not crash)
            const validResults = results.every(result => 
              result.status === 'fulfilled' || 
              (result.status === 'rejected' && 
               (result.reason.message.includes('Deadlock') || 
                result.reason.message.includes('timeout')))
            );

            expect(validResults).toBe(true);

            // Cleanup: commit or rollback all transactions
            for (const txId of transactions) {
              try {
                await controller.commitTransaction(txId);
              } catch (error) {
                await controller.rollbackTransaction(txId);
              }
            }

          } catch (error) {
            // Cleanup on test failure
            for (const txId of transactions) {
              try {
                await controller.rollbackTransaction(txId);
              } catch (cleanupError) {
                // Ignore cleanup errors
              }
            }
            
            // Allow certain concurrency-related errors
            if (!(error as Error).message.includes('Deadlock') && 
                !(error as Error).message.includes('timeout')) {
              throw error;
            }
          }
        }
      ),
      { numRuns: 20, timeout: 10000 }
    );
  });

  /**
   * Race Condition Testing
   */
  describe('Race Conditions', () => {
    it('should handle simultaneous lock requests correctly', async () => {
      const tx1 = await controller.beginTransaction(connection1);
      const tx2 = await controller.beginTransaction(connection2);

      // Both transactions try to acquire exclusive lock on same resource
      const promises = [
        controller.acquireLock(tx1, 'resource1', 'EXCLUSIVE'),
        controller.acquireLock(tx2, 'resource1', 'EXCLUSIVE')
      ];

      const results = await Promise.allSettled(promises);

      // One should succeed, one should fail or wait
      const successes = results.filter(r => r.status === 'fulfilled' && r.value === true).length;
      expect(successes).toBe(1);

      await controller.commitTransaction(tx1);
      await controller.commitTransaction(tx2);
    });

    it('should handle rapid transaction creation and destruction', async () => {
      const promises: Promise<void>[] = [];

      for (let i = 0; i < 10; i++) {
        promises.push(async function() {
          const conn = controller.createConnection();
          const tx = await controller.beginTransaction(conn);
          
          try {
            await controller.acquireLock(tx, `resource${i % 3}`, 'SHARED');
            // Simulate some work
            await new Promise(resolve => setTimeout(resolve, 10));
            await controller.commitTransaction(tx);
          } catch (error) {
            await controller.rollbackTransaction(tx);
          } finally {
            controller.closeConnection(conn);
          }
        }());
      }

      await Promise.allSettled(promises);

      // All locks should be released
      expect(controller.getActiveLocks().size).toBe(0);
      expect(controller.getActiveTransactions().size).toBe(0);
    });

    it('should prevent lost updates in concurrent writes', async () => {
      controller.setLockTimeout(5000); // Increase timeout for this test

      const tx1 = await controller.beginTransaction(connection1);
      const tx2 = await controller.beginTransaction(connection2);

      // Both try to acquire exclusive lock for write
      const lock1Promise = controller.acquireLock(tx1, 'shared_resource', 'EXCLUSIVE');
      const lock2Promise = controller.acquireLock(tx2, 'shared_resource', 'EXCLUSIVE');

      const lock1 = await lock1Promise;
      expect(lock1).toBe(true);

      // Second transaction should wait
      const startTime = Date.now();
      
      // Commit first transaction to release lock
      setTimeout(async () => {
        await controller.commitTransaction(tx1);
      }, 500);

      const lock2 = await lock2Promise;
      const waitTime = Date.now() - startTime;

      expect(lock2).toBe(true);
      expect(waitTime).toBeGreaterThan(400); // Should have waited

      await controller.commitTransaction(tx2);
    });
  });

  /**
   * Deadlock Detection and Prevention
   */
  describe('Deadlock Management', () => {
    it('should detect simple deadlock scenarios', async () => {
      const tx1 = await controller.beginTransaction(connection1);
      const tx2 = await controller.beginTransaction(connection2);

      // Create deadlock scenario
      await controller.acquireLock(tx1, 'resource1', 'EXCLUSIVE');
      await controller.acquireLock(tx2, 'resource2', 'EXCLUSIVE');

      // Now both try to acquire the other's resource
      const deadlockPromise1 = controller.acquireLock(tx1, 'resource2', 'EXCLUSIVE');
      const deadlockPromise2 = controller.acquireLock(tx2, 'resource1', 'EXCLUSIVE');

      // At least one should detect deadlock
      const results = await Promise.allSettled([deadlockPromise1, deadlockPromise2]);
      const deadlockDetected = results.some(result => 
        result.status === 'rejected' && 
        (result.reason as Error).message.includes('Deadlock')
      );

      expect(deadlockDetected).toBe(true);

      // Cleanup
      await controller.rollbackTransaction(tx1);
      await controller.rollbackTransaction(tx2);
    });

    it('should handle complex deadlock chains', async () => {
      const tx1 = await controller.beginTransaction(connection1);
      const tx2 = await controller.beginTransaction(connection2);
      const conn3 = controller.createConnection();
      const tx3 = await controller.beginTransaction(conn3);

      // Create circular wait: tx1 -> resource1, tx2 -> resource2, tx3 -> resource3
      // Then: tx1 wants resource2, tx2 wants resource3, tx3 wants resource1
      await controller.acquireLock(tx1, 'resource1', 'EXCLUSIVE');
      await controller.acquireLock(tx2, 'resource2', 'EXCLUSIVE');
      await controller.acquireLock(tx3, 'resource3', 'EXCLUSIVE');

      // Create circular dependency
      const promises = [
        controller.acquireLock(tx1, 'resource2', 'EXCLUSIVE'),
        controller.acquireLock(tx2, 'resource3', 'EXCLUSIVE'),
        controller.acquireLock(tx3, 'resource1', 'EXCLUSIVE')
      ];

      const results = await Promise.allSettled(promises);
      
      // At least one transaction should detect the deadlock
      const deadlockDetected = results.some(result => 
        result.status === 'rejected' && 
        (result.reason as Error).message.includes('Deadlock')
      );

      expect(deadlockDetected).toBe(true);

      // Cleanup
      await Promise.allSettled([
        controller.rollbackTransaction(tx1),
        controller.rollbackTransaction(tx2),
        controller.rollbackTransaction(tx3)
      ]);
    });

    it('should function correctly with deadlock detection disabled', async () => {
      controller.setDeadlockDetection(false);
      controller.setLockTimeout(1000); // Short timeout for this test

      const tx1 = await controller.beginTransaction(connection1);
      const tx2 = await controller.beginTransaction(connection2);

      await controller.acquireLock(tx1, 'resource1', 'EXCLUSIVE');
      await controller.acquireLock(tx2, 'resource2', 'EXCLUSIVE');

      // Create deadlock scenario - should timeout instead of detecting deadlock
      const results = await Promise.allSettled([
        controller.acquireLock(tx1, 'resource2', 'EXCLUSIVE'),
        controller.acquireLock(tx2, 'resource1', 'EXCLUSIVE')
      ]);

      // Should timeout, not detect deadlock
      const timeoutErrors = results.filter(result => 
        result.status === 'rejected' && 
        (result.reason as Error).message.includes('timeout')
      ).length;

      expect(timeoutErrors).toBeGreaterThan(0);

      await controller.rollbackTransaction(tx1);
      await controller.rollbackTransaction(tx2);
    });
  });

  /**
   * Lock Compatibility and Wait Queue Testing
   */
  describe('Lock Management', () => {
    it('should allow multiple shared locks on same resource', async () => {
      const tx1 = await controller.beginTransaction(connection1);
      const tx2 = await controller.beginTransaction(connection2);

      const lock1 = await controller.acquireLock(tx1, 'shared_resource', 'SHARED');
      const lock2 = await controller.acquireLock(tx2, 'shared_resource', 'SHARED');

      expect(lock1).toBe(true);
      expect(lock2).toBe(true);

      const activeLocks = controller.getActiveLocks();
      const resourceLock = activeLocks.get('shared_resource');
      
      expect(resourceLock?.holders.size).toBe(2);
      expect(resourceLock?.holders.has(tx1)).toBe(true);
      expect(resourceLock?.holders.has(tx2)).toBe(true);

      await controller.commitTransaction(tx1);
      await controller.commitTransaction(tx2);
    });

    it('should queue exclusive lock requests properly', async () => {
      const tx1 = await controller.beginTransaction(connection1);
      const tx2 = await controller.beginTransaction(connection2);
      const conn3 = controller.createConnection();
      const tx3 = await controller.beginTransaction(conn3);

      // First transaction gets shared lock
      await controller.acquireLock(tx1, 'contested_resource', 'SHARED');

      // Second and third want exclusive locks - should be queued
      const exclusiveLock1Promise = controller.acquireLock(tx2, 'contested_resource', 'EXCLUSIVE');
      const exclusiveLock2Promise = controller.acquireLock(tx3, 'contested_resource', 'EXCLUSIVE');

      // Check wait queue
      const waitQueue = controller.getLockWaitQueue('contested_resource');
      expect(waitQueue.length).toBe(2);

      // Release first lock
      await controller.commitTransaction(tx1);

      // One of the exclusive locks should be granted
      const results = await Promise.allSettled([exclusiveLock1Promise, exclusiveLock2Promise]);
      const grantedLocks = results.filter(r => r.status === 'fulfilled' && r.value === true).length;
      expect(grantedLocks).toBe(1);

      // Cleanup
      await Promise.allSettled([
        controller.rollbackTransaction(tx2),
        controller.rollbackTransaction(tx3)
      ]);
    });

    it('should handle lock upgrades correctly', async () => {
      const tx1 = await controller.beginTransaction(connection1);

      // Acquire shared lock first
      const sharedLock = await controller.acquireLock(tx1, 'upgrade_resource', 'SHARED');
      expect(sharedLock).toBe(true);

      // Try to upgrade to exclusive - should succeed since same transaction
      const exclusiveLock = await controller.acquireLock(tx1, 'upgrade_resource', 'EXCLUSIVE');
      expect(exclusiveLock).toBe(true);

      const activeLocks = controller.getActiveLocks();
      const resourceLock = activeLocks.get('upgrade_resource');
      expect(resourceLock?.lockType).toBe('EXCLUSIVE');

      await controller.commitTransaction(tx1);
    });
  });

  /**
   * Transaction Isolation Level Testing
   */
  describe('Isolation Levels', () => {
    it('should respect SERIALIZABLE isolation level', async () => {
      const tx1 = await controller.beginTransaction(connection1, 'SERIALIZABLE');
      const tx2 = await controller.beginTransaction(connection2, 'SERIALIZABLE');

      // In SERIALIZABLE, all reads and writes should be locked
      await controller.acquireLock(tx1, 'serializable_resource', 'SHARED');
      
      // Any conflicting access should wait
      const startTime = Date.now();
      const writePromise = controller.acquireLock(tx2, 'serializable_resource', 'EXCLUSIVE');

      // Release first transaction after delay
      setTimeout(async () => {
        await controller.commitTransaction(tx1);
      }, 500);

      const writeLock = await writePromise;
      const waitTime = Date.now() - startTime;

      expect(writeLock).toBe(true);
      expect(waitTime).toBeGreaterThan(400);

      await controller.commitTransaction(tx2);
    });

    it('should handle READ_UNCOMMITTED appropriately', async () => {
      const tx1 = await controller.beginTransaction(connection1, 'READ_UNCOMMITTED');
      const tx2 = await controller.beginTransaction(connection2, 'READ_UNCOMMITTED');

      // READ_UNCOMMITTED allows dirty reads, but still needs write locks
      await controller.acquireLock(tx1, 'dirty_resource', 'EXCLUSIVE');
      
      // Another transaction should be able to read (if implemented)
      // But not write
      const writeAttempt = controller.acquireLock(tx2, 'dirty_resource', 'EXCLUSIVE');
      const startTime = Date.now();

      setTimeout(async () => {
        await controller.rollbackTransaction(tx1); // Rollback to test dirty read scenario
      }, 300);

      try {
        await writeAttempt;
        const waitTime = Date.now() - startTime;
        expect(waitTime).toBeGreaterThan(200);
      } catch (error) {
        // Timeout is acceptable in this scenario
        expect((error as Error).message).toContain('timeout');
      }

      await controller.rollbackTransaction(tx2);
    });
  });

  /**
   * Stress Testing and Performance
   */
  describe('Performance and Stress', () => {
    it('should handle high-concurrency scenarios', async () => {
      const numTransactions = 50;
      const connections = Array.from({ length: numTransactions }, () => controller.createConnection());
      const promises: Promise<void>[] = [];

      const startTime = Date.now();

      for (let i = 0; i < numTransactions; i++) {
        promises.push(async function() {
          try {
            const tx = await controller.beginTransaction(connections[i]);
            const resourceId = `resource${i % 5}`; // 5 contested resources
            
            await controller.acquireLock(tx, resourceId, Math.random() > 0.5 ? 'SHARED' : 'EXCLUSIVE');
            
            // Simulate work
            await new Promise(resolve => setTimeout(resolve, Math.random() * 50));
            
            await controller.commitTransaction(tx);
          } catch (error) {
            // Acceptable in high-concurrency scenarios
          }
        }());
      }

      await Promise.allSettled(promises);
      const duration = Date.now() - startTime;

      // Should complete within reasonable time
      expect(duration).toBeLessThan(10000); // 10 seconds max

      // All resources should be clean
      expect(controller.getActiveLocks().size).toBe(0);

      connections.forEach(conn => controller.closeConnection(conn));
    });

    it('should maintain performance with many resources', async () => {
      const numResources = 1000;
      const tx = await controller.beginTransaction(connection1);

      const startTime = Date.now();

      // Acquire locks on many resources
      for (let i = 0; i < numResources; i++) {
        await controller.acquireLock(tx, `perf_resource_${i}`, 'SHARED');
      }

      const acquisitionTime = Date.now() - startTime;
      expect(acquisitionTime).toBeLessThan(5000); // Should be fast for non-contested resources

      const commitStart = Date.now();
      await controller.commitTransaction(tx);
      const commitTime = Date.now() - commitStart;

      expect(commitTime).toBeLessThan(1000); // Cleanup should be efficient
      expect(controller.getActiveLocks().size).toBe(0);
    });
  });

  /**
   * Error Handling and Edge Cases
   */
  describe('Error Handling', () => {
    it('should handle invalid transaction operations', async () => {
      // Try to acquire lock with non-existent transaction
      await expect(
        controller.acquireLock('invalid_tx', 'resource1', 'SHARED')
      ).rejects.toThrow('Invalid or inactive transaction');

      // Try to commit non-existent transaction
      await expect(
        controller.commitTransaction('invalid_tx')
      ).rejects.toThrow('Transaction not found');
    });

    it('should handle connection failures gracefully', async () => {
      const tx = await controller.beginTransaction(connection1);
      await controller.acquireLock(tx, 'resource_before_failure', 'EXCLUSIVE');

      // Simulate connection failure
      controller.closeConnection(connection1);

      // Lock should be released
      const activeLocks = controller.getActiveLocks();
      expect(activeLocks.size).toBe(0);
    });

    it('should prevent operations on committed/aborted transactions', async () => {
      const tx = await controller.beginTransaction(connection1);
      await controller.commitTransaction(tx);

      // Should not allow operations on committed transaction
      await expect(
        controller.acquireLock(tx, 'resource1', 'SHARED')
      ).rejects.toThrow('Invalid or inactive transaction');
    });

    it('should handle resource cleanup after timeout', async () => {
      controller.setLockTimeout(500); // Short timeout

      const tx1 = await controller.beginTransaction(connection1);
      const tx2 = await controller.beginTransaction(connection2);

      await controller.acquireLock(tx1, 'timeout_resource', 'EXCLUSIVE');

      // This should timeout
      await expect(
        controller.acquireLock(tx2, 'timeout_resource', 'EXCLUSIVE')
      ).rejects.toThrow('Lock timeout');

      // Resource should still be locked by tx1
      const activeLocks = controller.getActiveLocks();
      const resourceLock = activeLocks.get('timeout_resource');
      expect(resourceLock?.holders.has(tx1)).toBe(true);

      await controller.commitTransaction(tx1);
      await controller.commitTransaction(tx2);
    });
  });
});