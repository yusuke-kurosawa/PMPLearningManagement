# Database Setup Guide

## Overview

This guide provides comprehensive instructions for setting up the PostgreSQL database and Redis cache for the PMP Learning Management System.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Docker Setup](#docker-setup)
4. [Database Initialization](#database-initialization)
5. [Migration from LocalStorage](#migration-from-localstorage)
6. [Backup and Recovery](#backup-and-recovery)
7. [Monitoring and Health Checks](#monitoring-and-health-checks)
8. [Troubleshooting](#troubleshooting)
9. [Performance Tuning](#performance-tuning)

## Prerequisites

### Required Software

- Docker and Docker Compose (recommended)
- Node.js 18+ and npm 8+
- PostgreSQL 15+ client tools (for manual setup)
- Redis 7+ (for manual setup)

### System Requirements

- Minimum 4GB RAM
- 10GB free disk space
- Linux, macOS, or Windows with WSL2

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/PMPLearningManagement.git
cd PMPLearningManagement
```

### 2. Set Up Environment Variables

```bash
# Copy the example environment file
cp .env.example .env

# Edit the .env file with your configuration
# At minimum, update the database passwords and secrets
nano .env
```

### 3. Start Database Services

```bash
# Start PostgreSQL and Redis using Docker Compose
docker-compose up -d

# Verify services are running
docker-compose ps
```

### 4. Initialize the Database

```bash
# Install dependencies
cd server
npm install

# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Seed initial data
npm run prisma:seed
```

### 5. Verify Installation

```bash
# Run health check
node ../scripts/health-check.js

# Open Prisma Studio to view data
npm run prisma:studio
```

## Docker Setup

### Development Environment

```bash
# Start development environment with additional tools
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# Services available:
# - PostgreSQL: localhost:5433
# - Redis: localhost:6380
# - PgAdmin: localhost:5050
# - MailHog: localhost:8025
```

### Production Environment

```bash
# Build and start production containers
docker-compose -f docker-compose.yml up -d --build

# Scale services if needed
docker-compose up -d --scale postgres=2
```

### Container Management

```bash
# View logs
docker-compose logs -f postgres
docker-compose logs -f redis

# Execute commands in containers
docker-compose exec postgres psql -U pmpuser -d pmplearning
docker-compose exec redis redis-cli

# Stop services
docker-compose down

# Remove all data (WARNING: destructive)
docker-compose down -v
```

## Database Initialization

### Manual Database Creation

If not using Docker, create the database manually:

```sql
-- Connect to PostgreSQL as superuser
psql -U postgres

-- Create database and user
CREATE USER pmpuser WITH PASSWORD 'pmppassword';
CREATE DATABASE pmplearning OWNER pmpuser;
GRANT ALL PRIVILEGES ON DATABASE pmplearning TO pmpuser;

-- Enable extensions
\c pmplearning
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
```

### Run Migrations

```bash
# Apply all migrations
cd server
npx prisma migrate deploy

# Or run SQL files directly
psql -U pmpuser -d pmplearning -f ../migrations/001_initial_schema.sql
psql -U pmpuser -d pmplearning -f ../migrations/002_seed_data.sql
```

### Verify Database Structure

```sql
-- Check tables
\dt

-- Check indexes
\di

-- Check constraints
\d+ learning_progress

-- Verify seed data
SELECT COUNT(*) FROM processes;
SELECT COUNT(*) FROM knowledge_areas;
SELECT COUNT(*) FROM process_groups;
```

## Migration from LocalStorage

### Export LocalStorage Data

First, export your existing LocalStorage data from the browser:

```javascript
// Run this in browser console
const exportData = {
  learningProgress: JSON.parse(localStorage.getItem('pmp-learning-progress') || '[]'),
  studySessions: JSON.parse(localStorage.getItem('pmp-study-sessions') || '[]'),
  examResults: JSON.parse(localStorage.getItem('pmp-exam-results') || '[]'),
  flashcards: JSON.parse(localStorage.getItem('pmp-flashcards') || '[]'),
  notes: JSON.parse(localStorage.getItem('pmp-notes') || '[]'),
  userProfile: JSON.parse(localStorage.getItem('pmp-user-profile') || '{}'),
}

// Download as JSON file
const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
const url = URL.createObjectURL(blob)
const a = document.createElement('a')
a.href = url
a.download = 'pmp-localstorage-export.json'
a.click()
```

### Run Migration Script

```bash
# Run the migration script
node scripts/migrate-from-localstorage.js ./pmp-localstorage-export.json user@example.com

# Verify migration
cd server
npm run prisma:studio
```

### Migration Options

The migration script supports various data formats:

```bash
# Basic migration
node scripts/migrate-from-localstorage.js data.json user@email.com

# With custom user creation
node scripts/migrate-from-localstorage.js data.json newuser@email.com --create-user

# Dry run (no changes)
node scripts/migrate-from-localstorage.js data.json user@email.com --dry-run
```

## Backup and Recovery

### Automated Backups

```bash
# Run backup script
./scripts/backup.sh full gzip

# Backup types:
# - full: Complete database backup
# - schema: Schema only
# - data: Data only

# Schedule automated backups (crontab)
0 2 * * * /path/to/scripts/backup.sh full gzip
```

### Manual Backup

```bash
# Full backup with compression
pg_dump -h localhost -U pmpuser -d pmplearning --format=custom --file=backup.dump

# Backup specific tables
pg_dump -h localhost -U pmpuser -d pmplearning \
  --table=learning_progress \
  --table=study_sessions \
  --format=custom --file=user_data.dump
```

### Recovery

```bash
# Restore from backup
pg_restore -h localhost -U pmpuser -d pmplearning --clean --if-exists backup.dump

# Restore specific tables
pg_restore -h localhost -U pmpuser -d pmplearning \
  --table=learning_progress \
  --clean --if-exists user_data.dump
```

### Point-in-Time Recovery

```bash
# Enable WAL archiving in postgresql.conf
wal_level = replica
archive_mode = on
archive_command = 'cp %p /backup/wal/%f'

# Restore to specific time
pg_basebackup -h localhost -U replicator -D /recovery
echo "recovery_target_time = '2024-01-15 14:30:00'" >> /recovery/postgresql.conf
```

## Monitoring and Health Checks

### Run Health Check

```bash
# Comprehensive health check
node scripts/health-check.js

# Check specific components
node scripts/health-check.js --postgres
node scripts/health-check.js --redis
node scripts/health-check.js --queries
```

### Monitor Database Performance

```sql
-- Current connections
SELECT datname, count(*)
FROM pg_stat_activity
GROUP BY datname;

-- Long-running queries
SELECT pid, age(clock_timestamp(), query_start), usename, query
FROM pg_stat_activity
WHERE query != '<IDLE>'
  AND query NOT ILIKE '%pg_stat_activity%'
  AND age(clock_timestamp(), query_start) > '1 minute'::interval
ORDER BY query_start DESC;

-- Table sizes
SELECT
  schemaname AS table_schema,
  tablename AS table_name,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Cache hit ratio
SELECT
  sum(heap_blks_hit) / nullif(sum(heap_blks_hit) + sum(heap_blks_read), 0) AS cache_hit_ratio
FROM pg_statio_user_tables;
```

### Redis Monitoring

```bash
# Redis CLI monitoring
redis-cli monitor

# Redis info
redis-cli info stats
redis-cli info memory

# Check slow queries
redis-cli slowlog get 10
```

## Troubleshooting

### Common Issues

#### 1. Connection Refused

```bash
# Check if services are running
docker-compose ps
systemctl status postgresql
systemctl status redis

# Check ports
netstat -tlnp | grep 5432
netstat -tlnp | grep 6379

# Test connection
psql -h localhost -p 5432 -U pmpuser -d pmplearning -c '\q'
redis-cli ping
```

#### 2. Permission Denied

```sql
-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE pmplearning TO pmpuser;
GRANT ALL ON SCHEMA public TO pmpuser;
GRANT ALL ON ALL TABLES IN SCHEMA public TO pmpuser;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO pmpuser;
```

#### 3. Disk Space Issues

```bash
# Check disk usage
df -h
du -sh /var/lib/postgresql/data

# Clean up old logs
find /var/log/postgresql -name "*.log" -mtime +7 -delete

# Vacuum database
psql -U pmpuser -d pmplearning -c "VACUUM FULL ANALYZE;"
```

#### 4. Slow Queries

```sql
-- Enable query logging
ALTER SYSTEM SET log_min_duration_statement = 100;
SELECT pg_reload_conf();

-- Find missing indexes
SELECT
  schemaname,
  tablename,
  attname,
  n_distinct,
  most_common_vals
FROM pg_stats
WHERE schemaname = 'public'
  AND n_distinct > 100
  AND attname NOT IN (
    SELECT column_name
    FROM information_schema.key_column_usage
    WHERE table_schema = 'public'
  );
```

### Reset Database

```bash
# Complete reset (WARNING: destroys all data)
cd server
npm run db:reset

# Or manually
dropdb pmplearning
createdb pmplearning
npm run prisma:migrate
npm run prisma:seed
```

## Performance Tuning

### PostgreSQL Configuration

Edit `postgresql.conf` or add to Docker command:

```conf
# Memory settings
shared_buffers = 256MB          # 25% of RAM
effective_cache_size = 1GB      # 50-75% of RAM
maintenance_work_mem = 64MB
work_mem = 4MB

# Checkpoint settings
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1

# Connection pooling
max_connections = 200
```

### Index Optimization

```sql
-- Create indexes for common queries
CREATE INDEX CONCURRENTLY idx_progress_user_status_process
ON learning_progress(user_id, status, process_id);

CREATE INDEX CONCURRENTLY idx_sessions_user_date
ON study_sessions(user_id, started_at DESC);

-- Analyze tables after creating indexes
ANALYZE learning_progress;
ANALYZE study_sessions;
```

### Redis Optimization

```conf
# redis.conf settings
maxmemory 512mb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
save 60 10000
```

### Application-Level Optimization

```javascript
// Use connection pooling
const pool = new Pool({
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

// Implement caching
const cachedData = await redis.get(cacheKey)
if (cachedData) return JSON.parse(cachedData)

// Use batch operations
const results = await prisma.$transaction([
  prisma.learningProgress.createMany({ data: progressData }),
  prisma.studySession.createMany({ data: sessionData }),
])
```

## Maintenance Schedule

### Daily Tasks

- Backup database
- Check health status
- Monitor disk space
- Review error logs

### Weekly Tasks

- Analyze tables
- Update statistics
- Clean old logs
- Test backup recovery

### Monthly Tasks

- Full vacuum
- Reindex tables
- Review slow queries
- Update documentation

## Security Best Practices

1. **Change default passwords** immediately
2. **Enable SSL/TLS** for connections
3. **Restrict network access** using firewall rules
4. **Regular security updates** for all components
5. **Encrypt sensitive data** at rest and in transit
6. **Implement role-based access** control
7. **Audit database access** and changes
8. **Regular backup testing** and recovery drills

## Support and Resources

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Redis Documentation](https://redis.io/documentation)
- [Docker Documentation](https://docs.docker.com/)

For issues specific to this project, please open an issue on GitHub or contact the development team.
