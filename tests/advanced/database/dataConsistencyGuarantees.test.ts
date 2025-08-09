/**
 * データ整合性保証高度テスト
 * チーム2: データ整合性・トランザクション担当（1名）
 * 
 * 目標: データ破損検出・復旧テスト、分散トランザクションテスト
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fc from 'fast-check';
import { faker } from '@faker-js/faker';

interface ConstraintRule {
  id: string;
  name: string;
  type: 'CHECK' | 'UNIQUE' | 'FOREIGN_KEY' | 'NOT_NULL' | 'PRIMARY_KEY';
  table: string;
  columns: string[];
  referencedTable?: string;
  referencedColumns?: string[];
  condition?: string;
  isEnabled: boolean;
}

interface DataCorruption {
  id: string;
  type: 'CHECKSUM_MISMATCH' | 'CONSTRAINT_VIOLATION' | 'ORPHANED_RECORD' | 'DUPLICATE_KEY';
  table: string;
  recordId: string;
  detected: Date;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

interface RepairAction {
  id: string;
  corruptionId: string;
  action: 'DELETE' | 'UPDATE' | 'INSERT' | 'RECREATE_INDEX';
  table: string;
  recordId: string;
  beforeValue?: any;
  afterValue?: any;
  timestamp: Date;
}

interface IntegrityCheckResult {
  isValid: boolean;
  violations: ConstraintViolation[];
  corruptions: DataCorruption[];
  statistics: {
    totalRecords: number;
    checkedConstraints: number;
    violatedConstraints: number;
    corruptedRecords: number;
  };
}

interface ConstraintViolation {
  constraintId: string;
  table: string;
  recordId: string;
  violationType: string;
  description: string;
  severity: 'WARNING' | 'ERROR' | 'CRITICAL';
}

class DataIntegrityManager {
  private constraints: Map<string, ConstraintRule> = new Map();
  private data: Map<string, Map<string, any>> = new Map(); // table -> recordId -> data
  private checksums: Map<string, string> = new Map(); // recordKey -> checksum
  private detectedCorruptions: Map<string, DataCorruption> = new Map();
  private repairHistory: RepairAction[] = [];

  constructor() {
    // Initialize tables
    this.data.set('users', new Map());
    this.data.set('user_progress', new Map());
    this.data.set('learning_sessions', new Map());
    this.data.set('certificates', new Map());
    this.data.set('courses', new Map());
  }

  addConstraint(constraint: ConstraintRule): void {
    this.validateConstraintDefinition(constraint);
    this.constraints.set(constraint.id, constraint);
  }

  async insertRecord(table: string, recordId: string, data: any): Promise<void> {
    await this.validateConstraints(table, recordId, data, 'INSERT');
    
    const tableData = this.getTableData(table);
    tableData.set(recordId, { ...data, _created: new Date(), _modified: new Date() });
    
    this.updateChecksum(table, recordId, data);
  }

  async updateRecord(table: string, recordId: string, data: any): Promise<void> {
    const tableData = this.getTableData(table);
    const existingRecord = tableData.get(recordId);
    
    if (!existingRecord) {
      throw new Error(`Record not found: ${table}.${recordId}`);
    }

    await this.validateConstraints(table, recordId, data, 'UPDATE');
    
    const updatedData = { ...data, _created: existingRecord._created, _modified: new Date() };
    tableData.set(recordId, updatedData);
    
    this.updateChecksum(table, recordId, updatedData);
  }

  async deleteRecord(table: string, recordId: string): Promise<void> {
    const tableData = this.getTableData(table);
    const record = tableData.get(recordId);
    
    if (!record) {
      throw new Error(`Record not found: ${table}.${recordId}`);
    }

    await this.validateConstraints(table, recordId, record, 'DELETE');
    
    tableData.delete(recordId);
    this.checksums.delete(`${table}:${recordId}`);
  }

  getRecord(table: string, recordId: string): any {
    const tableData = this.getTableData(table);
    return tableData.get(recordId);
  }

  private getTableData(table: string): Map<string, any> {
    let tableData = this.data.get(table);
    if (!tableData) {
      tableData = new Map();
      this.data.set(table, tableData);
    }
    return tableData;
  }

  private validateConstraintDefinition(constraint: ConstraintRule): void {
    if (!constraint.id || !constraint.name || !constraint.table || !constraint.columns.length) {
      throw new Error('Invalid constraint definition');
    }

    if (constraint.type === 'FOREIGN_KEY' && (!constraint.referencedTable || !constraint.referencedColumns)) {
      throw new Error('Foreign key constraint must specify referenced table and columns');
    }

    if (constraint.type === 'CHECK' && !constraint.condition) {
      throw new Error('Check constraint must specify condition');
    }
  }

  private async validateConstraints(
    table: string, 
    recordId: string, 
    data: any, 
    operation: 'INSERT' | 'UPDATE' | 'DELETE'
  ): Promise<void> {
    const applicableConstraints = Array.from(this.constraints.values())
      .filter(c => c.table === table && c.isEnabled);

    for (const constraint of applicableConstraints) {
      await this.validateConstraint(constraint, table, recordId, data, operation);
    }
  }

  private async validateConstraint(
    constraint: ConstraintRule,
    table: string,
    recordId: string,
    data: any,
    operation: string
  ): Promise<void> {
    switch (constraint.type) {
      case 'NOT_NULL':
        this.validateNotNull(constraint, data);
        break;
      
      case 'UNIQUE':
        await this.validateUnique(constraint, table, recordId, data, operation);
        break;
        
      case 'PRIMARY_KEY':
        await this.validatePrimaryKey(constraint, table, recordId, data, operation);
        break;
        
      case 'FOREIGN_KEY':
        await this.validateForeignKey(constraint, data, operation);
        break;
        
      case 'CHECK':
        this.validateCheck(constraint, data);
        break;
    }
  }

  private validateNotNull(constraint: ConstraintRule, data: any): void {
    for (const column of constraint.columns) {
      if (data[column] === null || data[column] === undefined) {
        throw new Error(`NOT NULL constraint violated: ${constraint.table}.${column}`);
      }
    }
  }

  private async validateUnique(
    constraint: ConstraintRule,
    table: string,
    recordId: string,
    data: any,
    operation: string
  ): Promise<void> {
    if (operation === 'DELETE') return;

    const tableData = this.getTableData(table);
    
    for (const [existingId, existingData] of tableData) {
      if (existingId === recordId) continue; // Skip self for updates

      const hasConflict = constraint.columns.every(column => 
        existingData[column] === data[column] && data[column] !== null && data[column] !== undefined
      );

      if (hasConflict) {
        throw new Error(`UNIQUE constraint violated: ${constraint.table}.${constraint.columns.join(',')}`);
      }
    }
  }

  private async validatePrimaryKey(
    constraint: ConstraintRule,
    table: string,
    recordId: string,
    data: any,
    operation: string
  ): Promise<void> {
    // Primary key is both NOT NULL and UNIQUE
    this.validateNotNull(constraint, data);
    await this.validateUnique(constraint, table, recordId, data, operation);
  }

  private async validateForeignKey(
    constraint: ConstraintRule,
    data: any,
    operation: string
  ): Promise<void> {
    if (operation === 'DELETE') {
      // Check if there are any dependent records
      await this.checkForeignKeyReferences(constraint, data);
      return;
    }

    if (!constraint.referencedTable || !constraint.referencedColumns) {
      throw new Error('Foreign key constraint missing referenced table/columns');
    }

    const referencedTableData = this.getTableData(constraint.referencedTable);
    
    // Check if referenced record exists
    const referencedValues = constraint.columns.map(column => data[column]);
    const hasNullValue = referencedValues.some(value => value === null || value === undefined);
    
    if (hasNullValue) return; // NULL foreign keys are allowed

    let referencedRecordExists = false;
    for (const [_, referencedData] of referencedTableData) {
      const matches = constraint.referencedColumns!.every((column, index) => 
        referencedData[column] === referencedValues[index]
      );
      
      if (matches) {
        referencedRecordExists = true;
        break;
      }
    }

    if (!referencedRecordExists) {
      throw new Error(`FOREIGN KEY constraint violated: ${constraint.table} -> ${constraint.referencedTable}`);
    }
  }

  private async checkForeignKeyReferences(constraint: ConstraintRule, data: any): Promise<void> {
    // Find all tables that might reference this record
    const dependentConstraints = Array.from(this.constraints.values())
      .filter(c => c.type === 'FOREIGN_KEY' && c.referencedTable === constraint.table);

    for (const depConstraint of dependentConstraints) {
      const dependentTableData = this.getTableData(depConstraint.table);
      const referencingValues = constraint.columns.map(column => data[column]);

      for (const [_, dependentData] of dependentTableData) {
        const isReferencing = depConstraint.columns.every((column, index) => 
          dependentData[column] === referencingValues[index]
        );

        if (isReferencing) {
          throw new Error(
            `Cannot delete: record is referenced by ${depConstraint.table}`
          );
        }
      }
    }
  }

  private validateCheck(constraint: ConstraintRule, data: any): void {
    if (!constraint.condition) return;

    try {
      // Simplified check constraint evaluation
      // In a real implementation, this would use a proper expression parser
      const result = this.evaluateCheckCondition(constraint.condition, data);
      if (!result) {
        throw new Error(`CHECK constraint violated: ${constraint.condition}`);
      }
    } catch (error) {
      throw new Error(`CHECK constraint evaluation failed: ${(error as Error).message}`);
    }
  }

  private evaluateCheckCondition(condition: string, data: any): boolean {
    // Simplified condition evaluation
    // Support basic conditions like "score >= 0 AND score <= 100"
    
    // Replace column names with values
    let evaluableCondition = condition;
    for (const [column, value] of Object.entries(data)) {
      const regex = new RegExp(`\\b${column}\\b`, 'g');
      evaluableCondition = evaluableCondition.replace(regex, JSON.stringify(value));
    }

    // Basic evaluation (unsafe - for demo only)
    try {
      return Function(`"use strict"; return (${evaluableCondition})`)();
    } catch {
      return false;
    }
  }

  private updateChecksum(table: string, recordId: string, data: any): void {
    const recordKey = `${table}:${recordId}`;
    const dataString = JSON.stringify(data, Object.keys(data).sort());
    const checksum = this.calculateChecksum(dataString);
    this.checksums.set(recordKey, checksum);
  }

  private calculateChecksum(data: string): string {
    // Simple checksum calculation (in practice, use CRC32 or similar)
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }

  async performIntegrityCheck(): Promise<IntegrityCheckResult> {
    const violations: ConstraintViolation[] = [];
    const corruptions: DataCorruption[] = [];
    let totalRecords = 0;
    let checkedConstraints = 0;

    // Check all tables
    for (const [table, tableData] of this.data) {
      totalRecords += tableData.size;

      // Check each record
      for (const [recordId, record] of tableData) {
        // Checksum validation
        await this.validateChecksum(table, recordId, record, corruptions);

        // Constraint validation
        const tableConstraints = Array.from(this.constraints.values())
          .filter(c => c.table === table && c.isEnabled);

        for (const constraint of tableConstraints) {
          checkedConstraints++;
          try {
            await this.validateConstraint(constraint, table, recordId, record, 'UPDATE');
          } catch (error) {
            violations.push({
              constraintId: constraint.id,
              table,
              recordId,
              violationType: constraint.type,
              description: (error as Error).message,
              severity: this.determineSeverity(constraint.type)
            });
          }
        }
      }
    }

    // Check for orphaned records
    await this.checkForOrphanedRecords(corruptions);

    return {
      isValid: violations.length === 0 && corruptions.length === 0,
      violations,
      corruptions,
      statistics: {
        totalRecords,
        checkedConstraints,
        violatedConstraints: violations.length,
        corruptedRecords: corruptions.length
      }
    };
  }

  private async validateChecksum(
    table: string,
    recordId: string,
    record: any,
    corruptions: DataCorruption[]
  ): Promise<void> {
    const recordKey = `${table}:${recordId}`;
    const expectedChecksum = this.checksums.get(recordKey);
    
    if (!expectedChecksum) {
      // Missing checksum - could indicate corruption
      corruptions.push({
        id: `checksum_missing_${recordKey}`,
        type: 'CHECKSUM_MISMATCH',
        table,
        recordId,
        detected: new Date(),
        description: 'Missing checksum for record',
        severity: 'MEDIUM'
      });
      return;
    }

    const dataString = JSON.stringify(record, Object.keys(record).sort());
    const actualChecksum = this.calculateChecksum(dataString);

    if (actualChecksum !== expectedChecksum) {
      corruptions.push({
        id: `checksum_mismatch_${recordKey}`,
        type: 'CHECKSUM_MISMATCH',
        table,
        recordId,
        detected: new Date(),
        description: `Checksum mismatch: expected ${expectedChecksum}, got ${actualChecksum}`,
        severity: 'HIGH'
      });
    }
  }

  private async checkForOrphanedRecords(corruptions: DataCorruption[]): Promise<void> {
    const foreignKeyConstraints = Array.from(this.constraints.values())
      .filter(c => c.type === 'FOREIGN_KEY');

    for (const constraint of foreignKeyConstraints) {
      const tableData = this.getTableData(constraint.table);
      const referencedTableData = this.getTableData(constraint.referencedTable!);

      for (const [recordId, record] of tableData) {
        const referencedValues = constraint.columns.map(column => record[column]);
        const hasNullValue = referencedValues.some(value => value === null || value === undefined);
        
        if (hasNullValue) continue; // NULL foreign keys are valid

        let referencedRecordExists = false;
        for (const [_, referencedRecord] of referencedTableData) {
          const matches = constraint.referencedColumns!.every((column, index) => 
            referencedRecord[column] === referencedValues[index]
          );
          
          if (matches) {
            referencedRecordExists = true;
            break;
          }
        }

        if (!referencedRecordExists) {
          corruptions.push({
            id: `orphaned_${constraint.table}_${recordId}`,
            type: 'ORPHANED_RECORD',
            table: constraint.table,
            recordId,
            detected: new Date(),
            description: `Orphaned record: references non-existent ${constraint.referencedTable}`,
            severity: 'HIGH'
          });
        }
      }
    }
  }

  private determineSeverity(constraintType: string): 'WARNING' | 'ERROR' | 'CRITICAL' {
    switch (constraintType) {
      case 'PRIMARY_KEY':
      case 'NOT_NULL':
        return 'CRITICAL';
      case 'FOREIGN_KEY':
      case 'UNIQUE':
        return 'ERROR';
      case 'CHECK':
        return 'WARNING';
      default:
        return 'WARNING';
    }
  }

  async repairCorruption(corruptionId: string, repairStrategy: string): Promise<RepairAction> {
    const corruption = this.detectedCorruptions.get(corruptionId);
    if (!corruption) {
      throw new Error(`Corruption not found: ${corruptionId}`);
    }

    const repairAction = await this.executeRepairStrategy(corruption, repairStrategy);
    this.repairHistory.push(repairAction);
    this.detectedCorruptions.delete(corruptionId);

    return repairAction;
  }

  private async executeRepairStrategy(
    corruption: DataCorruption,
    strategy: string
  ): Promise<RepairAction> {
    const repairAction: RepairAction = {
      id: `repair_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      corruptionId: corruption.id,
      action: 'DELETE', // Default
      table: corruption.table,
      recordId: corruption.recordId,
      timestamp: new Date()
    };

    switch (corruption.type) {
      case 'ORPHANED_RECORD':
        if (strategy === 'DELETE') {
          const tableData = this.getTableData(corruption.table);
          repairAction.beforeValue = tableData.get(corruption.recordId);
          tableData.delete(corruption.recordId);
          repairAction.action = 'DELETE';
        } else if (strategy === 'CREATE_REFERENCE') {
          // Create missing referenced record
          repairAction.action = 'INSERT';
          // Implementation would depend on specific business logic
        }
        break;

      case 'CHECKSUM_MISMATCH':
        if (strategy === 'RECALCULATE') {
          const tableData = this.getTableData(corruption.table);
          const record = tableData.get(corruption.recordId);
          if (record) {
            this.updateChecksum(corruption.table, corruption.recordId, record);
            repairAction.action = 'UPDATE';
            repairAction.afterValue = { checksum_recalculated: true };
          }
        }
        break;

      case 'DUPLICATE_KEY':
        if (strategy === 'DELETE_DUPLICATE') {
          const tableData = this.getTableData(corruption.table);
          repairAction.beforeValue = tableData.get(corruption.recordId);
          tableData.delete(corruption.recordId);
          repairAction.action = 'DELETE';
        }
        break;
    }

    return repairAction;
  }

  // Simulate data corruption for testing
  async simulateCorruption(type: DataCorruption['type'], table: string, recordId: string): Promise<void> {
    const tableData = this.getTableData(table);
    const record = tableData.get(recordId);
    
    if (!record) {
      throw new Error(`Record not found: ${table}.${recordId}`);
    }

    switch (type) {
      case 'CHECKSUM_MISMATCH':
        // Corrupt the checksum
        this.checksums.set(`${table}:${recordId}`, 'corrupted_checksum');
        break;

      case 'ORPHANED_RECORD':
        // Remove referenced record to create orphan
        const foreignKeyConstraints = Array.from(this.constraints.values())
          .filter(c => c.type === 'FOREIGN_KEY' && c.table === table);
        
        for (const constraint of foreignKeyConstraints) {
          if (constraint.referencedTable) {
            const referencedTableData = this.getTableData(constraint.referencedTable);
            const referencedValues = constraint.columns.map(column => record[column]);
            
            // Find and remove the referenced record
            for (const [refId, refRecord] of referencedTableData) {
              const matches = constraint.referencedColumns!.every((column, index) => 
                refRecord[column] === referencedValues[index]
              );
              
              if (matches) {
                referencedTableData.delete(refId);
                break;
              }
            }
          }
        }
        break;

      case 'DUPLICATE_KEY':
        // Create a duplicate record
        const duplicateId = `${recordId}_duplicate`;
        tableData.set(duplicateId, { ...record });
        break;

      case 'CONSTRAINT_VIOLATION':
        // Violate a constraint
        if (record.score !== undefined) {
          record.score = -1; // Violate check constraint
        }
        break;
    }

    const corruption: DataCorruption = {
      id: `corruption_${type}_${table}_${recordId}`,
      type,
      table,
      recordId,
      detected: new Date(),
      description: `Simulated ${type} corruption`,
      severity: 'HIGH'
    };

    this.detectedCorruptions.set(corruption.id, corruption);
  }

  // Diagnostic methods
  getConstraints(): Map<string, ConstraintRule> {
    return new Map(this.constraints);
  }

  getDetectedCorruptions(): Map<string, DataCorruption> {
    return new Map(this.detectedCorruptions);
  }

  getRepairHistory(): RepairAction[] {
    return [...this.repairHistory];
  }

  getAllData(): Map<string, Map<string, any>> {
    return new Map(this.data);
  }
}

describe('Data Consistency Guarantees - Advanced Testing', () => {
  let manager: DataIntegrityManager;

  beforeEach(() => {
    manager = new DataIntegrityManager();
    
    // Setup common constraints
    manager.addConstraint({
      id: 'users_pk',
      name: 'Users Primary Key',
      type: 'PRIMARY_KEY',
      table: 'users',
      columns: ['id'],
      isEnabled: true
    });

    manager.addConstraint({
      id: 'users_email_unique',
      name: 'Users Email Unique',
      type: 'UNIQUE',
      table: 'users',
      columns: ['email'],
      isEnabled: true
    });

    manager.addConstraint({
      id: 'progress_user_fk',
      name: 'Progress User Foreign Key',
      type: 'FOREIGN_KEY',
      table: 'user_progress',
      columns: ['userId'],
      referencedTable: 'users',
      referencedColumns: ['id'],
      isEnabled: true
    });

    manager.addConstraint({
      id: 'progress_score_check',
      name: 'Progress Score Check',
      type: 'CHECK',
      table: 'user_progress',
      columns: ['score'],
      condition: 'score >= 0 AND score <= 100',
      isEnabled: true
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  /**
   * Constraint Validation Testing
   */
  describe('Constraint Validation', () => {
    it('should enforce primary key constraints', async () => {
      await manager.insertRecord('users', 'user1', { 
        id: 'user1', 
        name: 'Alice', 
        email: 'alice@example.com' 
      });

      // Should fail - duplicate primary key
      await expect(
        manager.insertRecord('users', 'user1', { 
          id: 'user1', 
          name: 'Bob', 
          email: 'bob@example.com' 
        })
      ).rejects.toThrow('UNIQUE constraint violated');
    });

    it('should enforce unique constraints', async () => {
      await manager.insertRecord('users', 'user1', { 
        id: 'user1', 
        name: 'Alice', 
        email: 'alice@example.com' 
      });

      // Should fail - duplicate email
      await expect(
        manager.insertRecord('users', 'user2', { 
          id: 'user2', 
          name: 'Bob', 
          email: 'alice@example.com' 
        })
      ).rejects.toThrow('UNIQUE constraint violated');
    });

    it('should enforce foreign key constraints', async () => {
      // Should fail - referenced user doesn't exist
      await expect(
        manager.insertRecord('user_progress', 'progress1', {
          userId: 'nonexistent',
          score: 85
        })
      ).rejects.toThrow('FOREIGN KEY constraint violated');

      // Should succeed after creating referenced user
      await manager.insertRecord('users', 'user1', { 
        id: 'user1', 
        name: 'Alice', 
        email: 'alice@example.com' 
      });

      await manager.insertRecord('user_progress', 'progress1', {
        userId: 'user1',
        score: 85
      });

      const progress = manager.getRecord('user_progress', 'progress1');
      expect(progress.userId).toBe('user1');
    });

    it('should enforce check constraints', async () => {
      await manager.insertRecord('users', 'user1', { 
        id: 'user1', 
        name: 'Alice', 
        email: 'alice@example.com' 
      });

      // Should fail - invalid score
      await expect(
        manager.insertRecord('user_progress', 'progress1', {
          userId: 'user1',
          score: 150
        })
      ).rejects.toThrow('CHECK constraint violated');

      // Should succeed with valid score
      await manager.insertRecord('user_progress', 'progress1', {
        userId: 'user1',
        score: 85
      });

      const progress = manager.getRecord('user_progress', 'progress1');
      expect(progress.score).toBe(85);
    });

    it('should prevent deletion of referenced records', async () => {
      await manager.insertRecord('users', 'user1', { 
        id: 'user1', 
        name: 'Alice', 
        email: 'alice@example.com' 
      });

      await manager.insertRecord('user_progress', 'progress1', {
        userId: 'user1',
        score: 85
      });

      // Should fail - user is referenced
      await expect(
        manager.deleteRecord('users', 'user1')
      ).rejects.toThrow('Cannot delete: record is referenced');

      // Should succeed after removing dependent record
      await manager.deleteRecord('user_progress', 'progress1');
      await manager.deleteRecord('users', 'user1');

      expect(manager.getRecord('users', 'user1')).toBeUndefined();
    });
  });

  /**
   * Data Corruption Detection
   */
  describe('Corruption Detection', () => {
    it('should detect checksum mismatches', async () => {
      await manager.insertRecord('users', 'user1', { 
        id: 'user1', 
        name: 'Alice', 
        email: 'alice@example.com' 
      });

      // Simulate corruption
      await manager.simulateCorruption('CHECKSUM_MISMATCH', 'users', 'user1');

      const integrityCheck = await manager.performIntegrityCheck();
      
      expect(integrityCheck.isValid).toBe(false);
      expect(integrityCheck.corruptions).toHaveLength(1);
      expect(integrityCheck.corruptions[0].type).toBe('CHECKSUM_MISMATCH');
    });

    it('should detect orphaned records', async () => {
      await manager.insertRecord('users', 'user1', { 
        id: 'user1', 
        name: 'Alice', 
        email: 'alice@example.com' 
      });

      await manager.insertRecord('user_progress', 'progress1', {
        userId: 'user1',
        score: 85
      });

      // Simulate corruption - create orphan
      await manager.simulateCorruption('ORPHANED_RECORD', 'user_progress', 'progress1');

      const integrityCheck = await manager.performIntegrityCheck();
      
      expect(integrityCheck.isValid).toBe(false);
      expect(integrityCheck.corruptions).toHaveLength(1);
      expect(integrityCheck.corruptions[0].type).toBe('ORPHANED_RECORD');
    });

    it('should detect constraint violations in existing data', async () => {
      await manager.insertRecord('users', 'user1', { 
        id: 'user1', 
        name: 'Alice', 
        email: 'alice@example.com' 
      });

      await manager.insertRecord('user_progress', 'progress1', {
        userId: 'user1',
        score: 85
      });

      // Simulate corruption - violate constraint
      await manager.simulateCorruption('CONSTRAINT_VIOLATION', 'user_progress', 'progress1');

      const integrityCheck = await manager.performIntegrityCheck();
      
      expect(integrityCheck.isValid).toBe(false);
      expect(integrityCheck.violations.length).toBeGreaterThan(0);
      
      const checkViolation = integrityCheck.violations.find(v => v.violationType === 'CHECK');
      expect(checkViolation).toBeDefined();
    });

    it('should detect duplicate key violations', async () => {
      await manager.insertRecord('users', 'user1', { 
        id: 'user1', 
        name: 'Alice', 
        email: 'alice@example.com' 
      });

      // Simulate corruption - create duplicate
      await manager.simulateCorruption('DUPLICATE_KEY', 'users', 'user1');

      const integrityCheck = await manager.performIntegrityCheck();
      
      expect(integrityCheck.isValid).toBe(false);
      expect(integrityCheck.violations.length).toBeGreaterThan(0);
      
      const uniqueViolation = integrityCheck.violations.find(v => 
        v.violationType === 'UNIQUE' || v.violationType === 'PRIMARY_KEY'
      );
      expect(uniqueViolation).toBeDefined();
    });
  });

  /**
   * Data Repair and Recovery
   */
  describe('Data Repair', () => {
    it('should repair checksum mismatches', async () => {
      await manager.insertRecord('users', 'user1', { 
        id: 'user1', 
        name: 'Alice', 
        email: 'alice@example.com' 
      });

      await manager.simulateCorruption('CHECKSUM_MISMATCH', 'users', 'user1');
      
      const corruptions = manager.getDetectedCorruptions();
      const corruptionId = Array.from(corruptions.keys())[0];
      
      const repairAction = await manager.repairCorruption(corruptionId, 'RECALCULATE');
      
      expect(repairAction.action).toBe('UPDATE');
      expect(repairAction.corruptionId).toBe(corruptionId);

      // Verify corruption is resolved
      const integrityCheck = await manager.performIntegrityCheck();
      expect(integrityCheck.corruptions).toHaveLength(0);
    });

    it('should repair orphaned records', async () => {
      await manager.insertRecord('users', 'user1', { 
        id: 'user1', 
        name: 'Alice', 
        email: 'alice@example.com' 
      });

      await manager.insertRecord('user_progress', 'progress1', {
        userId: 'user1',
        score: 85
      });

      await manager.simulateCorruption('ORPHANED_RECORD', 'user_progress', 'progress1');
      
      const corruptions = manager.getDetectedCorruptions();
      const corruptionId = Array.from(corruptions.keys())[0];
      
      const repairAction = await manager.repairCorruption(corruptionId, 'DELETE');
      
      expect(repairAction.action).toBe('DELETE');
      expect(manager.getRecord('user_progress', 'progress1')).toBeUndefined();

      // Verify corruption is resolved
      const integrityCheck = await manager.performIntegrityCheck();
      const orphanCorruptions = integrityCheck.corruptions.filter(c => c.type === 'ORPHANED_RECORD');
      expect(orphanCorruptions).toHaveLength(0);
    });

    it('should maintain repair history', async () => {
      await manager.insertRecord('users', 'user1', { 
        id: 'user1', 
        name: 'Alice', 
        email: 'alice@example.com' 
      });

      await manager.simulateCorruption('CHECKSUM_MISMATCH', 'users', 'user1');
      
      const corruptions = manager.getDetectedCorruptions();
      const corruptionId = Array.from(corruptions.keys())[0];
      
      await manager.repairCorruption(corruptionId, 'RECALCULATE');
      
      const repairHistory = manager.getRepairHistory();
      expect(repairHistory).toHaveLength(1);
      expect(repairHistory[0].corruptionId).toBe(corruptionId);
      expect(repairHistory[0].timestamp).toBeDefined();
    });
  });

  /**
   * Property-Based Testing for Data Consistency
   */
  it('property: data consistency should be maintained under any sequence of operations', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            operation: fc.constantFrom('insert', 'update', 'delete'),
            table: fc.constantFrom('users', 'user_progress'),
            recordId: fc.string({ minLength: 1, maxLength: 10 }),
            data: fc.record({
              id: fc.string({ minLength: 1, maxLength: 10 }),
              name: fc.string({ minLength: 1, maxLength: 20 }),
              email: fc.emailAddress(),
              score: fc.integer({ min: -10, max: 110 }) // Include invalid values
            })
          }),
          { minLength: 1, maxLength: 20 }
        ),
        async (operations) => {
          const successfulOps: string[] = [];

          for (const op of operations) {
            try {
              switch (op.operation) {
                case 'insert':
                  if (op.table === 'users') {
                    await manager.insertRecord(op.table, op.recordId, {
                      id: op.data.id,
                      name: op.data.name,
                      email: op.data.email
                    });
                  } else if (op.table === 'user_progress') {
                    await manager.insertRecord(op.table, op.recordId, {
                      userId: op.data.id,
                      score: op.data.score
                    });
                  }
                  successfulOps.push(`insert_${op.table}_${op.recordId}`);
                  break;

                case 'update':
                  if (op.table === 'users') {
                    await manager.updateRecord(op.table, op.recordId, {
                      name: op.data.name,
                      email: op.data.email
                    });
                  } else if (op.table === 'user_progress') {
                    await manager.updateRecord(op.table, op.recordId, {
                      score: op.data.score
                    });
                  }
                  successfulOps.push(`update_${op.table}_${op.recordId}`);
                  break;

                case 'delete':
                  await manager.deleteRecord(op.table, op.recordId);
                  successfulOps.push(`delete_${op.table}_${op.recordId}`);
                  break;
              }
            } catch (error) {
              // Constraint violations are expected and acceptable
              const errorMessage = (error as Error).message;
              const isExpectedError = [
                'constraint violated',
                'not found',
                'already exists',
                'Cannot delete'
              ].some(msg => errorMessage.includes(msg));
              
              if (!isExpectedError) {
                throw error;
              }
            }
          }

          // Invariant: After all operations, system should be consistent
          const integrityCheck = await manager.performIntegrityCheck();
          
          // Allow for constraint violations in test data, but no corruptions
          expect(integrityCheck.corruptions).toHaveLength(0);
          
          // If there are violations, they should be from invalid test data
          for (const violation of integrityCheck.violations) {
            expect(['CHECK', 'FOREIGN_KEY', 'UNIQUE', 'PRIMARY_KEY']).toContain(violation.violationType);
          }
        }
      ),
      { numRuns: 10 }
    );
  });

  /**
   * Stress Testing
   */
  describe('Stress Testing', () => {
    it('should maintain integrity under high load', async () => {
      const promises: Promise<void>[] = [];
      const results: Array<{ success: boolean; error?: string }> = [];

      // Create base users first
      for (let i = 0; i < 10; i++) {
        await manager.insertRecord('users', `user${i}`, {
          id: `user${i}`,
          name: `User ${i}`,
          email: `user${i}@example.com`
        });
      }

      // Concurrent operations
      for (let i = 0; i < 100; i++) {
        promises.push(async function() {
          try {
            const userId = `user${i % 10}`;
            await manager.insertRecord('user_progress', `progress${i}`, {
              userId,
              score: Math.floor(Math.random() * 100)
            });
            results.push({ success: true });
          } catch (error) {
            results.push({ 
              success: false, 
              error: (error as Error).message 
            });
          }
        }());
      }

      await Promise.allSettled(promises);

      // Verify integrity
      const integrityCheck = await manager.performIntegrityCheck();
      expect(integrityCheck.corruptions).toHaveLength(0);

      const successCount = results.filter(r => r.success).length;
      expect(successCount).toBeGreaterThan(0);
    });

    it('should handle large datasets efficiently', async () => {
      const startTime = Date.now();

      // Insert large amount of data
      for (let i = 0; i < 1000; i++) {
        await manager.insertRecord('users', `user${i}`, {
          id: `user${i}`,
          name: `User ${i}`,
          email: `user${i}@example.com`
        });
      }

      const insertTime = Date.now() - startTime;
      expect(insertTime).toBeLessThan(10000); // Should complete within 10 seconds

      // Perform integrity check
      const checkStart = Date.now();
      const integrityCheck = await manager.performIntegrityCheck();
      const checkTime = Date.now() - checkStart;

      expect(checkTime).toBeLessThan(5000); // Should complete within 5 seconds
      expect(integrityCheck.isValid).toBe(true);
      expect(integrityCheck.statistics.totalRecords).toBe(1000);
    });
  });

  /**
   * Advanced Consistency Scenarios
   */
  describe('Advanced Consistency', () => {
    it('should handle cascading constraint checks', async () => {
      // Add cascading constraint
      manager.addConstraint({
        id: 'sessions_progress_fk',
        name: 'Sessions Progress Foreign Key',
        type: 'FOREIGN_KEY',
        table: 'learning_sessions',
        columns: ['progressId'],
        referencedTable: 'user_progress',
        referencedColumns: ['id'],
        isEnabled: true
      });

      await manager.insertRecord('users', 'user1', {
        id: 'user1',
        name: 'Alice',
        email: 'alice@example.com'
      });

      await manager.insertRecord('user_progress', 'progress1', {
        id: 'progress1',
        userId: 'user1',
        score: 85
      });

      await manager.insertRecord('learning_sessions', 'session1', {
        id: 'session1',
        progressId: 'progress1',
        duration: 120
      });

      // Should fail - cannot delete progress referenced by session
      await expect(
        manager.deleteRecord('user_progress', 'progress1')
      ).rejects.toThrow('Cannot delete: record is referenced');

      // Should succeed after removing session
      await manager.deleteRecord('learning_sessions', 'session1');
      await manager.deleteRecord('user_progress', 'progress1');
    });

    it('should validate complex check constraints', async () => {
      manager.addConstraint({
        id: 'complex_check',
        name: 'Complex Business Rule',
        type: 'CHECK',
        table: 'user_progress',
        columns: ['score', 'attempts'],
        condition: '(score >= 70 AND attempts <= 3) OR (score >= 50 AND attempts <= 5)',
        isEnabled: true
      });

      await manager.insertRecord('users', 'user1', {
        id: 'user1',
        name: 'Alice',
        email: 'alice@example.com'
      });

      // Should succeed - meets first condition
      await manager.insertRecord('user_progress', 'progress1', {
        userId: 'user1',
        score: 75,
        attempts: 2
      });

      // Should succeed - meets second condition
      await manager.insertRecord('user_progress', 'progress2', {
        userId: 'user1',
        score: 60,
        attempts: 4
      });

      // Should fail - meets neither condition
      await expect(
        manager.insertRecord('user_progress', 'progress3', {
          userId: 'user1',
          score: 40,
          attempts: 6
        })
      ).rejects.toThrow('CHECK constraint violated');
    });
  });

  /**
   * Recovery and Repair Edge Cases
   */
  describe('Recovery Edge Cases', () => {
    it('should handle multiple simultaneous corruptions', async () => {
      await manager.insertRecord('users', 'user1', {
        id: 'user1',
        name: 'Alice',
        email: 'alice@example.com'
      });

      await manager.insertRecord('users', 'user2', {
        id: 'user2',
        name: 'Bob',
        email: 'bob@example.com'
      });

      // Simulate multiple corruptions
      await manager.simulateCorruption('CHECKSUM_MISMATCH', 'users', 'user1');
      await manager.simulateCorruption('DUPLICATE_KEY', 'users', 'user2');

      const integrityCheck = await manager.performIntegrityCheck();
      expect(integrityCheck.isValid).toBe(false);
      expect(integrityCheck.corruptions.length + integrityCheck.violations.length).toBeGreaterThanOrEqual(2);

      // Repair all issues
      const detectedCorruptions = manager.getDetectedCorruptions();
      for (const [corruptionId] of detectedCorruptions) {
        await manager.repairCorruption(corruptionId, 'RECALCULATE');
      }

      // System should be consistent after repairs
      const finalCheck = await manager.performIntegrityCheck();
      expect(finalCheck.corruptions).toHaveLength(0);
    });

    it('should maintain referential integrity during repairs', async () => {
      await manager.insertRecord('users', 'user1', {
        id: 'user1',
        name: 'Alice',
        email: 'alice@example.com'
      });

      await manager.insertRecord('user_progress', 'progress1', {
        userId: 'user1',
        score: 85
      });

      // Simulate orphaned record
      await manager.simulateCorruption('ORPHANED_RECORD', 'user_progress', 'progress1');

      const corruptions = manager.getDetectedCorruptions();
      const corruptionId = Array.from(corruptions.keys())[0];

      // Repair by deletion
      await manager.repairCorruption(corruptionId, 'DELETE');

      // Verify system integrity
      const integrityCheck = await manager.performIntegrityCheck();
      expect(integrityCheck.isValid).toBe(true);
    });
  });
});