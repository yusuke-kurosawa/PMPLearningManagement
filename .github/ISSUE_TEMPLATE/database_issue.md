---
name: 🗄️ Database Issue
about: Report database-related issues, schema changes, or performance problems
title: '[Database] '
labels: ['type:database', 'area:backend', 'priority:medium']
assignees: ''
---

## 📋 Database Issue Description
<!-- Provide a clear description of the database issue -->

## 🎯 Issue Type
- [ ] **Schema Change** - New tables, columns, or relationships needed
- [ ] **Performance Issue** - Slow queries, optimization needed
- [ ] **Data Integrity** - Constraint violations, data corruption
- [ ] **Migration Issue** - Database migration problems
- [ ] **Connection Issue** - Connection pooling, timeouts
- [ ] **Security Issue** - Access control, permissions
- [ ] **Backup/Recovery** - Backup failures, restore issues

## 🔍 Database Environment
### Database Information
- Database System: [PostgreSQL/MySQL/MongoDB/SQLite]
- Version: [e.g., PostgreSQL 13.7]
- Environment: [Development/Staging/Production]
- Host: [e.g., localhost, AWS RDS, Supabase]

### Connection Details
- Connection Pool Size: [e.g., 10]
- Max Connections: [e.g., 100]
- Timeout Settings: [e.g., 30s]
- SSL Enabled: [Yes/No]

## 📊 Current Schema (if applicable)
### Affected Tables
- [ ] `users` - User account information
- [ ] `profiles` - User profile data
- [ ] `user_roles` - Role assignments
- [ ] `audit_logs` - System audit trail
- [ ] `learning_progress` - Learning progress tracking
- [ ] `exam_results` - Mock exam results
- [ ] `flashcard_progress` - Flashcard learning data
- [ ] `study_groups` - Group collaboration data
- [ ] Other: `[table_name]`

### Current Schema Structure
```sql
-- Paste current table structure here
CREATE TABLE example_table (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 🔧 Proposed Changes (for schema changes)
### New Tables
```sql
-- Define new table structures
CREATE TABLE new_table (
  id SERIAL PRIMARY KEY,
  -- Add columns here
);
```

### Table Modifications
```sql
-- Define alterations to existing tables
ALTER TABLE existing_table 
ADD COLUMN new_column VARCHAR(255);

-- Add indexes
CREATE INDEX idx_table_column ON table_name(column_name);

-- Add constraints
ALTER TABLE table_name 
ADD CONSTRAINT fk_constraint FOREIGN KEY (column) REFERENCES other_table(id);
```

### Data Migrations
```sql
-- Define data transformation queries
UPDATE table_name 
SET new_column = old_column 
WHERE condition;
```

## 🐌 Performance Issues (if applicable)
### Slow Queries
```sql
-- Paste slow query here
SELECT * FROM large_table 
WHERE unindexed_column = 'value';
```

### Query Execution Plan
```
-- Paste EXPLAIN ANALYZE output here
```

### Performance Metrics
- Query Execution Time: [e.g., 2.3s]
- Rows Examined: [e.g., 1,000,000]
- Rows Returned: [e.g., 10]
- CPU Usage: [e.g., 95%]
- Memory Usage: [e.g., 512MB]
- Disk I/O: [High/Medium/Low]

## 📈 Expected Performance Improvements
- Target Query Time: [e.g., <100ms]
- Expected Throughput: [e.g., 1000 req/sec]
- Memory Reduction: [e.g., 50%]
- CPU Reduction: [e.g., 30%]

## 🛡️ Data Integrity Requirements
### Constraints Needed
- [ ] Primary Key constraints
- [ ] Foreign Key constraints
- [ ] Unique constraints
- [ ] Check constraints
- [ ] Not NULL constraints

### Data Validation Rules
- [ ] Email format validation
- [ ] Date range validation
- [ ] Enum value validation
- [ ] Custom validation rules

## 🔒 Security Considerations
### Access Control
- [ ] Row-level security (RLS) needed
- [ ] Column-level permissions
- [ ] Role-based access control
- [ ] API key restrictions

### Data Privacy
- [ ] PII data encryption
- [ ] Audit logging requirements
- [ ] Data retention policies
- [ ] GDPR compliance

## 📋 Migration Plan
### Pre-Migration Steps
1. [ ] Create database backup
2. [ ] Test migration on staging
3. [ ] Verify data integrity
4. [ ] Performance testing
5. [ ] Rollback plan ready

### Migration Scripts
```sql
-- Migration UP script
-- Add your migration code here

-- Migration DOWN script (rollback)
-- Add rollback code here
```

### Post-Migration Verification
1. [ ] Verify table structures
2. [ ] Check data integrity
3. [ ] Run performance tests
4. [ ] Validate application functionality
5. [ ] Monitor for issues

## 🧪 Testing Requirements
### Unit Tests
- [ ] Schema validation tests
- [ ] Data integrity tests
- [ ] Constraint violation tests
- [ ] Migration rollback tests

### Performance Tests
- [ ] Query performance benchmarks
- [ ] Load testing with realistic data
- [ ] Concurrent connection tests
- [ ] Memory usage monitoring

### Integration Tests
- [ ] API endpoint tests
- [ ] End-to-end workflow tests
- [ ] Cross-service data consistency
- [ ] Backup/restore functionality

## 📊 Monitoring & Alerting
### Metrics to Track
- [ ] Query response times
- [ ] Connection pool usage
- [ ] Database size growth
- [ ] Error rates
- [ ] Resource utilization

### Alerts to Configure
- [ ] Slow query alerts (>1s)
- [ ] High connection usage (>80%)
- [ ] Disk space warnings
- [ ] Replication lag alerts
- [ ] Backup failure notifications

## 🔗 Related Issues
<!-- Link any related issues, dependencies, or blockers -->
- Related to: #
- Depends on: #
- Blocks: #
- Follow-up to: #

## 📝 Additional Context
<!-- Add any other context about the database issue -->

## ✅ Definition of Done
- [ ] Database changes are designed and reviewed
- [ ] Migration scripts are written and tested
- [ ] Schema changes are applied successfully
- [ ] Data integrity is verified
- [ ] Performance benchmarks are met
- [ ] Security requirements are satisfied
- [ ] Documentation is updated
- [ ] Monitoring and alerts are configured
- [ ] Rollback procedures are tested
- [ ] Changes are deployed to production