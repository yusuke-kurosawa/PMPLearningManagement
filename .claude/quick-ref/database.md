# Database Operations & Queries Reference / データベース操作・クエリリファレンス

> 🗄️ **Database explorer**: `npm run db:explore`  
> 📊 **Query analyzer**: `npm run db:analyze`  
> 🔄 **Migration status**: `npm run db:status`

## 🎯 Database Overview

### Quick Database Commands

```bash
# Check database connection
npm run db:ping

# Open Prisma Studio (GUI)
npx prisma studio

# Database status
npm run db:status

# Quick backup
npm run db:backup
```

## 🔧 Prisma Schema

### Core Models

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
  previewFeatures = ["jsonProtocol"]
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// User Management
model User {
  id              String    @id @default(uuid())
  email           String    @unique
  name            String?
  passwordHash    String    @map("password_hash")
  role            Role      @default(STUDENT)
  emailVerified   Boolean   @default(false) @map("email_verified")
  createdAt       DateTime  @default(now()) @map("created_at")
  updatedAt       DateTime  @updatedAt @map("updated_at")
  deletedAt       DateTime? @map("deleted_at")

  // Relations
  profile         Profile?
  progress        Progress[]
  examAttempts    ExamAttempt[]
  notes           Note[]
  groupMemberships GroupMember[]
  auditLogs       AuditLog[]

  @@index([email])
  @@index([createdAt])
  @@map("users")
}

enum Role {
  STUDENT
  INSTRUCTOR
  ADMIN
}

// User Profile
model Profile {
  id              String    @id @default(uuid())
  userId          String    @unique @map("user_id")
  avatarUrl       String?   @map("avatar_url")
  bio             String?
  timezone        String    @default("UTC")
  language        String    @default("en")
  settings        Json      @default("{}")

  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("profiles")
}

// Learning Progress
model Progress {
  id              String    @id @default(uuid())
  userId          String    @map("user_id")
  processId       String    @map("process_id")
  status          ProgressStatus
  score           Float?
  completedAt     DateTime? @map("completed_at")
  timeSpent       Int       @default(0) @map("time_spent")
  notes           String?
  createdAt       DateTime  @default(now()) @map("created_at")
  updatedAt       DateTime  @updatedAt @map("updated_at")

  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, processId])
  @@index([userId])
  @@index([processId])
  @@index([status])
  @@map("progress")
}

enum ProgressStatus {
  NOT_STARTED
  IN_PROGRESS
  COMPLETED
  REVIEWED
}

// Exam System
model Exam {
  id              String    @id @default(uuid())
  title           String
  description     String?
  questionCount   Int       @map("question_count")
  duration        Int       // in minutes
  passingScore    Float     @map("passing_score")
  isActive        Boolean   @default(true) @map("is_active")
  createdAt       DateTime  @default(now()) @map("created_at")

  questions       Question[]
  attempts        ExamAttempt[]

  @@map("exams")
}

model Question {
  id              String    @id @default(uuid())
  examId          String    @map("exam_id")
  text            String
  options         Json      // Array of {id, text}
  correctAnswer   String    @map("correct_answer")
  explanation     String?
  category        String
  difficulty      Int       @default(3) // 1-5
  points          Float     @default(1)

  exam            Exam      @relation(fields: [examId], references: [id], onDelete: Cascade)
  answers         Answer[]

  @@index([examId])
  @@index([category])
  @@map("questions")
}

model ExamAttempt {
  id              String    @id @default(uuid())
  userId          String    @map("user_id")
  examId          String    @map("exam_id")
  score           Float?
  passed          Boolean?
  startedAt       DateTime  @default(now()) @map("started_at")
  completedAt     DateTime? @map("completed_at")
  timeSpent       Int?      @map("time_spent") // in seconds

  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  exam            Exam      @relation(fields: [examId], references: [id], onDelete: Cascade)
  answers         Answer[]

  @@index([userId])
  @@index([examId])
  @@index([startedAt])
  @@map("exam_attempts")
}

model Answer {
  id              String    @id @default(uuid())
  attemptId       String    @map("attempt_id")
  questionId      String    @map("question_id")
  answer          String
  isCorrect       Boolean   @map("is_correct")
  timeSpent       Int?      @map("time_spent") // in seconds
  createdAt       DateTime  @default(now()) @map("created_at")

  attempt         ExamAttempt @relation(fields: [attemptId], references: [id], onDelete: Cascade)
  question        Question    @relation(fields: [questionId], references: [id], onDelete: Cascade)

  @@unique([attemptId, questionId])
  @@map("answers")
}

// Collaboration
model StudyGroup {
  id              String    @id @default(uuid())
  name            String
  description     String?
  code            String    @unique // Join code
  maxMembers      Int       @default(20) @map("max_members")
  isPublic        Boolean   @default(true) @map("is_public")
  createdBy       String    @map("created_by")
  createdAt       DateTime  @default(now()) @map("created_at")

  members         GroupMember[]
  notes           Note[]

  @@index([code])
  @@map("study_groups")
}

model GroupMember {
  id              String    @id @default(uuid())
  groupId         String    @map("group_id")
  userId          String    @map("user_id")
  role            GroupRole @default(MEMBER)
  joinedAt        DateTime  @default(now()) @map("joined_at")

  group           StudyGroup @relation(fields: [groupId], references: [id], onDelete: Cascade)
  user            User       @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([groupId, userId])
  @@map("group_members")
}

enum GroupRole {
  OWNER
  MODERATOR
  MEMBER
}

// Content
model Note {
  id              String    @id @default(uuid())
  userId          String    @map("user_id")
  groupId         String?   @map("group_id")
  title           String
  content         String
  format          NoteFormat @default(MARKDOWN)
  tags            String[]
  isPublic        Boolean   @default(false) @map("is_public")
  views           Int       @default(0)
  likes           Int       @default(0)
  createdAt       DateTime  @default(now()) @map("created_at")
  updatedAt       DateTime  @updatedAt @map("updated_at")

  user            User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  group           StudyGroup? @relation(fields: [groupId], references: [id], onDelete: SetNull)

  @@index([userId])
  @@index([groupId])
  @@index([tags])
  @@map("notes")
}

enum NoteFormat {
  MARKDOWN
  HTML
  PLAIN_TEXT
}

// Audit & Security
model AuditLog {
  id              String    @id @default(uuid())
  userId          String?   @map("user_id")
  action          String
  resource        String
  resourceId      String?   @map("resource_id")
  changes         Json?
  ip              String?
  userAgent       String?   @map("user_agent")
  createdAt       DateTime  @default(now()) @map("created_at")

  user            User?     @relation(fields: [userId], references: [id], onDelete: SetNull)

  @@index([userId])
  @@index([action])
  @@index([createdAt])
  @@map("audit_logs")
}
```

## 📊 Common Queries

### User Queries

```typescript
// Find user with profile
const userWithProfile = await prisma.user.findUnique({
  where: { email: 'user@example.com' },
  include: {
    profile: true,
  },
})

// Get user's progress
const progress = await prisma.progress.findMany({
  where: {
    userId: userId,
    status: 'COMPLETED',
  },
  orderBy: {
    completedAt: 'desc',
  },
})

// User statistics
const stats = await prisma.progress.aggregate({
  where: { userId },
  _count: {
    _all: true,
  },
  _avg: {
    score: true,
    timeSpent: true,
  },
})

// Active users in last 24 hours
const activeUsers = await prisma.user.findMany({
  where: {
    auditLogs: {
      some: {
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
    },
  },
})
```

### Learning Queries

```typescript
// Get process completion rate
const completionRate = await prisma.$queryRaw`
  SELECT 
    COUNT(DISTINCT CASE WHEN status = 'COMPLETED' THEN process_id END)::float / 
    COUNT(DISTINCT process_id) * 100 as completion_rate
  FROM progress
  WHERE user_id = ${userId}
`

// Top performing users
const topUsers = await prisma.user.findMany({
  select: {
    id: true,
    name: true,
    progress: {
      where: { status: 'COMPLETED' },
      select: {
        score: true,
      },
    },
  },
  orderBy: {
    progress: {
      _count: 'desc',
    },
  },
  take: 10,
})

// Knowledge area progress
const areaProgress = await prisma.$queryRaw`
  SELECT 
    SUBSTRING(process_id, 1, POSITION('_' IN process_id) - 1) as area,
    COUNT(*) as total,
    COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END) as completed,
    AVG(score) as avg_score
  FROM progress
  WHERE user_id = ${userId}
  GROUP BY area
`
```

### Exam Queries

```typescript
// Get exam with questions
const exam = await prisma.exam.findUnique({
  where: { id: examId },
  include: {
    questions: {
      select: {
        id: true,
        text: true,
        options: true,
        category: true,
        difficulty: true,
      },
    },
  },
})

// User's exam history
const examHistory = await prisma.examAttempt.findMany({
  where: { userId },
  include: {
    exam: {
      select: {
        title: true,
      },
    },
  },
  orderBy: {
    startedAt: 'desc',
  },
})

// Exam statistics
const examStats = await prisma.$queryRaw`
  SELECT 
    e.id,
    e.title,
    COUNT(ea.id) as attempts,
    AVG(ea.score) as avg_score,
    COUNT(CASE WHEN ea.passed THEN 1 END)::float / COUNT(ea.id) * 100 as pass_rate
  FROM exams e
  LEFT JOIN exam_attempts ea ON e.id = ea.exam_id
  GROUP BY e.id, e.title
`

// Question difficulty analysis
const difficultyAnalysis = await prisma.$queryRaw`
  SELECT 
    q.difficulty,
    COUNT(a.id) as total_answers,
    COUNT(CASE WHEN a.is_correct THEN 1 END)::float / COUNT(a.id) * 100 as correct_rate,
    AVG(a.time_spent) as avg_time
  FROM questions q
  JOIN answers a ON q.id = a.question_id
  GROUP BY q.difficulty
  ORDER BY q.difficulty
`
```

### Collaboration Queries

```typescript
// Find study groups
const groups = await prisma.studyGroup.findMany({
  where: {
    OR: [
      { isPublic: true },
      {
        members: {
          some: {
            userId: userId,
          },
        },
      },
    ],
  },
  include: {
    _count: {
      select: {
        members: true,
        notes: true,
      },
    },
  },
})

// Group activity feed
const groupActivity = await prisma.note.findMany({
  where: {
    groupId: groupId,
  },
  include: {
    user: {
      select: {
        name: true,
        profile: {
          select: {
            avatarUrl: true,
          },
        },
      },
    },
  },
  orderBy: {
    createdAt: 'desc',
  },
  take: 20,
})

// Popular notes
const popularNotes = await prisma.note.findMany({
  where: {
    isPublic: true,
  },
  orderBy: [{ likes: 'desc' }, { views: 'desc' }],
  take: 10,
})
```

## 🔄 Migrations

### Create Migration

```bash
# Create a new migration
npx prisma migrate dev --name add_user_settings

# Create migration without applying
npx prisma migrate dev --create-only --name add_indexes

# Apply migrations in production
npx prisma migrate deploy

# Reset database (dev only!)
npx prisma migrate reset
```

### Migration Best Practices

```sql
-- migrations/20240301_add_user_settings.sql

-- Add column with default (safe)
ALTER TABLE users
ADD COLUMN settings JSONB DEFAULT '{}';

-- Add index concurrently (non-blocking)
CREATE INDEX CONCURRENTLY idx_users_created_at
ON users(created_at);

-- Add constraint with validation
ALTER TABLE progress
ADD CONSTRAINT check_score
CHECK (score >= 0 AND score <= 100);

-- Rename column safely
ALTER TABLE users
RENAME COLUMN username TO name;

-- Drop column safely (two-step)
-- Step 1: Make nullable and stop using
ALTER TABLE users
ALTER COLUMN old_column DROP NOT NULL;

-- Step 2: Drop in next release
ALTER TABLE users
DROP COLUMN old_column;
```

## 🎯 Query Optimization

### Indexes

```sql
-- Essential indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_progress_user_process ON progress(user_id, process_id);
CREATE INDEX idx_exam_attempts_user ON exam_attempts(user_id);
CREATE INDEX idx_notes_tags ON notes USING GIN(tags);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);

-- Composite indexes for common queries
CREATE INDEX idx_progress_user_status ON progress(user_id, status);
CREATE INDEX idx_answers_attempt_question ON answers(attempt_id, question_id);

-- Partial indexes
CREATE INDEX idx_active_exams ON exams(id) WHERE is_active = true;
CREATE INDEX idx_public_notes ON notes(created_at DESC) WHERE is_public = true;
```

### Query Performance

```typescript
// Use select to limit fields
const users = await prisma.user.findMany({
  select: {
    id: true,
    name: true,
    email: true,
  },
})

// Use pagination
const notes = await prisma.note.findMany({
  skip: page * pageSize,
  take: pageSize,
  orderBy: {
    createdAt: 'desc',
  },
})

// Use transactions for consistency
const result = await prisma.$transaction(async (tx) => {
  const user = await tx.user.create({
    data: userData,
  })

  const profile = await tx.profile.create({
    data: {
      userId: user.id,
      ...profileData,
    },
  })

  return { user, profile }
})

// Batch operations
const updates = await prisma.$transaction(
  progressUpdates.map((update) =>
    prisma.progress.upsert({
      where: {
        userId_processId: {
          userId: update.userId,
          processId: update.processId,
        },
      },
      update: update,
      create: update,
    })
  )
)
```

### Connection Pooling

```javascript
// prisma/client.js
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query', 'error', 'warn'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    }
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Connection pool settings in DATABASE_URL
// postgresql://user:pass@host:5432/db?connection_limit=10&pool_timeout=30
```

## 🔒 Database Security

### Row Level Security (RLS)

```sql
-- Enable RLS
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own notes or public notes
CREATE POLICY notes_select_policy ON notes
FOR SELECT
USING (user_id = current_user_id() OR is_public = true);

-- Policy: Users can only update their own notes
CREATE POLICY notes_update_policy ON notes
FOR UPDATE
USING (user_id = current_user_id());

-- Policy: Users can only delete their own notes
CREATE POLICY notes_delete_policy ON notes
FOR DELETE
USING (user_id = current_user_id());
```

### Data Encryption

```typescript
// Encrypt sensitive data
import crypto from 'crypto'

const algorithm = 'aes-256-gcm'
const key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex')

export const encrypt = (text: string): string => {
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv(algorithm, key, iv)

  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')

  const authTag = cipher.getAuthTag()

  return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted
}

export const decrypt = (text: string): string => {
  const parts = text.split(':')
  const iv = Buffer.from(parts[0], 'hex')
  const authTag = Buffer.from(parts[1], 'hex')
  const encrypted = parts[2]

  const decipher = crypto.createDecipheriv(algorithm, key, iv)
  decipher.setAuthTag(authTag)

  let decrypted = decipher.update(encrypted, 'hex', 'utf8')
  decrypted += decipher.final('utf8')

  return decrypted
}

// Use in Prisma middleware
prisma.$use(async (params, next) => {
  if (params.model === 'User' && params.action === 'create') {
    params.args.data.email = encrypt(params.args.data.email)
  }

  const result = await next(params)

  if (params.model === 'User' && result?.email) {
    result.email = decrypt(result.email)
  }

  return result
})
```

## 📦 Backup & Recovery

### Automated Backups

```bash
#!/bin/bash
# backup.sh

# Configuration
DB_NAME="pmp_learning"
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/${DB_NAME}_${DATE}.sql.gz"

# Create backup
pg_dump $DATABASE_URL | gzip > $BACKUP_FILE

# Upload to S3
aws s3 cp $BACKUP_FILE s3://pmp-backups/

# Keep only last 30 days locally
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete

# Verify backup
if [ -f "$BACKUP_FILE" ]; then
  echo "Backup successful: $BACKUP_FILE"
else
  echo "Backup failed!"
  exit 1
fi
```

### Point-in-Time Recovery

```sql
-- Enable WAL archiving
ALTER SYSTEM SET wal_level = replica;
ALTER SYSTEM SET archive_mode = on;
ALTER SYSTEM SET archive_command = 'cp %p /archive/%f';

-- Create restore point
SELECT pg_create_restore_point('before_migration');

-- Restore to point
-- Stop database
-- Restore base backup
-- Apply WAL logs up to restore point
```

## 🔍 Database Monitoring

### Performance Monitoring

```sql
-- Slow queries
SELECT
  query,
  calls,
  total_time,
  mean_time,
  max_time
FROM pg_stat_statements
WHERE mean_time > 100
ORDER BY mean_time DESC
LIMIT 10;

-- Table sizes
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Index usage
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan;

-- Connection stats
SELECT
  datname,
  numbackends,
  xact_commit,
  xact_rollback,
  blks_read,
  blks_hit,
  tup_returned,
  tup_fetched
FROM pg_stat_database;
```

### Health Checks

```typescript
// Database health check
export const checkDatabaseHealth = async () => {
  try {
    // Check connection
    await prisma.$queryRaw`SELECT 1`

    // Check response time
    const start = Date.now()
    await prisma.user.count()
    const responseTime = Date.now() - start

    // Check connection pool
    const pool = await prisma.$queryRaw`
      SELECT count(*) as connections 
      FROM pg_stat_activity 
      WHERE datname = current_database()
    `

    return {
      status: 'healthy',
      responseTime,
      connections: pool[0].connections,
      timestamp: new Date().toISOString(),
    }
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString(),
    }
  }
}
```

## 🛠️ Database Tools

### CLI Commands

```bash
# Prisma Studio (GUI)
npx prisma studio

# Database console
psql $DATABASE_URL

# Export data
pg_dump $DATABASE_URL --table=users --data-only > users.sql

# Import data
psql $DATABASE_URL < data.sql

# Analyze queries
pgbadger /var/log/postgresql/*.log -o report.html
```

### Useful Snippets

```sql
-- Kill long-running queries
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE state = 'active'
  AND query_start < NOW() - INTERVAL '5 minutes';

-- Vacuum and analyze
VACUUM ANALYZE;

-- Reindex
REINDEX DATABASE pmp_learning;

-- Check locks
SELECT
  blocked_locks.pid AS blocked_pid,
  blocked_activity.usename AS blocked_user,
  blocking_locks.pid AS blocking_pid,
  blocking_activity.usename AS blocking_user,
  blocked_activity.query AS blocked_statement,
  blocking_activity.query AS blocking_statement
FROM pg_catalog.pg_locks blocked_locks
JOIN pg_catalog.pg_stat_activity blocked_activity ON blocked_activity.pid = blocked_locks.pid
JOIN pg_catalog.pg_locks blocking_locks ON blocking_locks.locktype = blocked_locks.locktype
JOIN pg_catalog.pg_stat_activity blocking_activity ON blocking_activity.pid = blocking_locks.pid
WHERE NOT blocked_locks.granted;
```

---

_Database schema and queries are version controlled. Last migration: Check with `npm run db:status`_
