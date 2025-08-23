# Database Configuration for Power CRM

This document outlines the database configuration for the Power CRM system using PostgreSQL.

## Environment Variables

Create a `.env` file in the server package root with the following variables:

```env
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/power_crm?schema=public"

# Alternative format for separate components
DB_HOST=localhost
DB_PORT=5432
DB_NAME=power_crm
DB_USERNAME=power_user
DB_PASSWORD=your_secure_password
DB_SSL=false

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# Server Configuration
PORT=3001
NODE_ENV=development

# Redis Configuration (for session management and caching)
REDIS_URL=redis://localhost:6379

# File Upload Configuration
MAX_FILE_SIZE=10485760  # 10MB in bytes
UPLOAD_PATH=./uploads
```

## PostgreSQL Setup

### 1. Install PostgreSQL

#### On Ubuntu/Debian:
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
```

#### On macOS:
```bash
brew install postgresql
brew services start postgresql
```

#### On Windows:
Download and install from: https://www.postgresql.org/download/windows/

### 2. Create Database and User

```sql
-- Connect to PostgreSQL as superuser
sudo -u postgres psql

-- Create database
CREATE DATABASE power_crm;

-- Create user
CREATE USER power_user WITH PASSWORD 'your_secure_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE power_crm TO power_user;

-- Grant schema privileges
\c power_crm
GRANT ALL ON SCHEMA public TO power_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO power_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO power_user;

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- For full-text search
CREATE EXTENSION IF NOT EXISTS "unaccent"; -- For accent-insensitive search
```

### 3. Database Migration

```bash
# Install dependencies
cd packages/server
npm install

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma db push

# Or create and run migrations
npx prisma migrate dev --name init

# Seed database (if seed file exists)
npx prisma db seed
```

## PostgreSQL-Specific Features Used

### 1. JSONB Data Type
- Used for flexible metadata storage
- Better performance than JSON for queries
- Supports indexing and advanced queries

### 2. Array Types
- `String[]` for tags, channels, etc.
- Better than comma-separated strings
- Supports array operations and queries

### 3. Date Types
- `@db.Date` for date-only fields
- `DateTime` for timestamp fields

### 4. Full-Text Search Capabilities
- pg_trgm extension for similarity matching
- unaccent extension for accent-insensitive search

### 5. Advanced Indexing
- Composite indexes for complex queries
- Partial indexes for filtered queries
- GIN indexes for JSONB and array fields

## Performance Optimizations

### 1. Recommended Indexes

```sql
-- Additional indexes for better performance
CREATE INDEX CONCURRENTLY idx_tickets_search 
ON tickets USING gin(to_tsvector('english', title || ' ' || description));

CREATE INDEX CONCURRENTLY idx_tickets_tags 
ON tickets USING gin(tags);

CREATE INDEX CONCURRENTLY idx_user_metadata 
ON users USING gin(metadata);

CREATE INDEX CONCURRENTLY idx_notifications_channels 
ON notifications USING gin(channels);

-- Partial indexes
CREATE INDEX CONCURRENTLY idx_active_tickets 
ON tickets (status, created_at) 
WHERE deleted_at IS NULL;

CREATE INDEX CONCURRENTLY idx_unread_notifications 
ON notifications (user_id, created_at) 
WHERE is_read = false;
```

### 2. Database Connection Pool

```javascript
// In your Prisma configuration
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  // Connection pool settings
  __internal: {
    engine: {
      connection_limit: 20,
      pool_timeout: 10,
      connect_timeout: 60,
    },
  },
});
```

## Backup and Maintenance

### 1. Regular Backups

```bash
# Create backup
pg_dump -h localhost -U power_user -d power_crm > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore backup
psql -h localhost -U power_user -d power_crm < backup_file.sql
```

### 2. Maintenance Tasks

```sql
-- Analyze tables for query optimization
ANALYZE;

-- Vacuum to reclaim space
VACUUM;

-- Reindex for performance
REINDEX DATABASE power_crm;

-- Check table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

## Security Considerations

### 1. Connection Security
- Use SSL/TLS for production connections
- Restrict database access by IP
- Use strong passwords and rotate regularly

### 2. User Permissions
- Create separate users for different environments
- Use principle of least privilege
- Audit database access regularly

### 3. Data Encryption
```sql
-- Enable row-level security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY user_isolation_policy ON users
  USING (id = current_setting('app.current_user_id')::int);
```

## Monitoring and Logging

### 1. Enable Query Logging
```postgresql
# In postgresql.conf
log_statement = 'all'
log_min_duration_statement = 1000  # Log queries taking > 1s
log_line_prefix = '%t [%p-%l] %q%u@%d '
```

### 2. Performance Monitoring
```sql
-- Monitor slow queries
SELECT query, mean_time, calls, total_time 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;

-- Monitor table usage
SELECT * FROM pg_stat_user_tables 
ORDER BY seq_tup_read DESC;
```

## Production Deployment

### 1. Environment Setup
- Use managed PostgreSQL service (AWS RDS, Google Cloud SQL, etc.)
- Configure read replicas for scalability
- Set up automated backups
- Monitor database metrics

### 2. Migration Strategy
```bash
# Production migration workflow
npx prisma migrate deploy
npx prisma generate
```

### 3. Health Checks
```sql
-- Database health check query
SELECT 
  'healthy' as status,
  version() as version,
  current_timestamp as timestamp,
  pg_database_size(current_database()) as db_size;
```

This configuration provides a robust, scalable PostgreSQL setup for the Power CRM system with proper security, performance optimization, and maintenance procedures.