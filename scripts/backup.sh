#!/bin/bash

# ============================================================================
# Database Backup Script for PMP Learning Management
# ============================================================================

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
BACKUP_DIR="${PROJECT_ROOT}/database/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="${BACKUP_DIR}/backup_${TIMESTAMP}.log"

# Load environment variables
if [ -f "${PROJECT_ROOT}/.env" ]; then
    export $(cat "${PROJECT_ROOT}/.env" | grep -v '^#' | xargs)
fi

# Database configuration
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-pmplearning}"
DB_USER="${DB_USER:-pmpuser}"
DB_PASSWORD="${DB_PASSWORD:-pmppassword}"

# Backup settings
BACKUP_TYPE="${1:-full}"  # full, schema, data
COMPRESSION="${2:-gzip}"  # gzip, none
RETENTION_DAYS="${RETENTION_DAYS:-30}"

# Create backup directory if it doesn't exist
mkdir -p "${BACKUP_DIR}"

# Logging function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "${LOG_FILE}"
}

# Error handling
handle_error() {
    log "ERROR: Backup failed at line $1"
    exit 1
}

trap 'handle_error $LINENO' ERR

# ============================================================================
# Functions
# ============================================================================

# Perform database backup
perform_backup() {
    local backup_file="${BACKUP_DIR}/${DB_NAME}_${BACKUP_TYPE}_${TIMESTAMP}"
    
    log "Starting ${BACKUP_TYPE} backup of database ${DB_NAME}"
    
    export PGPASSWORD="${DB_PASSWORD}"
    
    case "${BACKUP_TYPE}" in
        "full")
            log "Creating full database backup..."
            if [ "${COMPRESSION}" = "gzip" ]; then
                pg_dump -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" \
                    --format=custom --no-acl --no-owner \
                    --file="${backup_file}.dump"
                gzip -9 "${backup_file}.dump"
                backup_file="${backup_file}.dump.gz"
            else
                pg_dump -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" \
                    --format=custom --no-acl --no-owner \
                    --file="${backup_file}.dump"
                backup_file="${backup_file}.dump"
            fi
            ;;
            
        "schema")
            log "Creating schema-only backup..."
            pg_dump -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" \
                --schema-only --format=plain \
                --file="${backup_file}_schema.sql"
            if [ "${COMPRESSION}" = "gzip" ]; then
                gzip -9 "${backup_file}_schema.sql"
                backup_file="${backup_file}_schema.sql.gz"
            else
                backup_file="${backup_file}_schema.sql"
            fi
            ;;
            
        "data")
            log "Creating data-only backup..."
            pg_dump -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" \
                --data-only --format=custom \
                --file="${backup_file}_data.dump"
            if [ "${COMPRESSION}" = "gzip" ]; then
                gzip -9 "${backup_file}_data.dump"
                backup_file="${backup_file}_data.dump.gz"
            else
                backup_file="${backup_file}_data.dump"
            fi
            ;;
            
        *)
            log "ERROR: Invalid backup type: ${BACKUP_TYPE}"
            exit 1
            ;;
    esac
    
    unset PGPASSWORD
    
    # Get file size
    local file_size=$(ls -lh "${backup_file}" | awk '{print $5}')
    log "Backup completed: ${backup_file} (${file_size})"
    
    return 0
}

# Verify backup integrity
verify_backup() {
    local latest_backup=$(ls -t "${BACKUP_DIR}"/*.dump* 2>/dev/null | head -n 1)
    
    if [ -z "${latest_backup}" ]; then
        log "WARNING: No backup file found to verify"
        return 1
    fi
    
    log "Verifying backup: ${latest_backup}"
    
    export PGPASSWORD="${DB_PASSWORD}"
    
    # For compressed files, decompress first
    if [[ "${latest_backup}" == *.gz ]]; then
        gunzip -t "${latest_backup}" 2>/dev/null
        if [ $? -eq 0 ]; then
            log "Compression integrity check passed"
        else
            log "ERROR: Compression integrity check failed"
            return 1
        fi
    fi
    
    # Test restore capability (list only, don't actually restore)
    if [[ "${latest_backup}" == *.dump* ]]; then
        local test_file="${latest_backup}"
        if [[ "${latest_backup}" == *.gz ]]; then
            test_file="${latest_backup%.gz}"
            gunzip -k "${latest_backup}" 2>/dev/null
        fi
        
        pg_restore --list "${test_file}" > /dev/null 2>&1
        if [ $? -eq 0 ]; then
            log "Backup verification passed"
        else
            log "ERROR: Backup verification failed"
            return 1
        fi
        
        # Clean up temporary decompressed file
        if [[ "${latest_backup}" == *.gz ]]; then
            rm -f "${test_file}"
        fi
    fi
    
    unset PGPASSWORD
    
    return 0
}

# Clean up old backups
cleanup_old_backups() {
    log "Cleaning up backups older than ${RETENTION_DAYS} days..."
    
    local deleted_count=0
    
    # Find and delete old backup files
    while IFS= read -r file; do
        if [ -f "$file" ]; then
            rm -f "$file"
            ((deleted_count++))
            log "Deleted: $(basename "$file")"
        fi
    done < <(find "${BACKUP_DIR}" -type f \( -name "*.dump*" -o -name "*.sql*" -o -name "*.log" \) -mtime +${RETENTION_DAYS})
    
    log "Cleanup completed. Deleted ${deleted_count} old backup files."
}

# Create backup metadata
create_metadata() {
    local metadata_file="${BACKUP_DIR}/backup_metadata_${TIMESTAMP}.json"
    
    cat > "${metadata_file}" <<EOF
{
    "timestamp": "${TIMESTAMP}",
    "database": "${DB_NAME}",
    "host": "${DB_HOST}",
    "backup_type": "${BACKUP_TYPE}",
    "compression": "${COMPRESSION}",
    "postgresql_version": "$(psql -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USER} -d ${DB_NAME} -t -c 'SELECT version()' 2>/dev/null | head -n 1 | xargs)",
    "database_size": "$(psql -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USER} -d ${DB_NAME} -t -c "SELECT pg_size_pretty(pg_database_size('${DB_NAME}'))" 2>/dev/null | xargs)",
    "tables_count": "$(psql -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USER} -d ${DB_NAME} -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public'" 2>/dev/null | xargs)",
    "backup_tool": "pg_dump",
    "backup_user": "${USER}",
    "backup_host": "$(hostname)"
}
EOF
    
    log "Metadata saved to ${metadata_file}"
}

# ============================================================================
# Main Execution
# ============================================================================

main() {
    log "============================================================"
    log "Database Backup Script Started"
    log "============================================================"
    log "Backup Type: ${BACKUP_TYPE}"
    log "Compression: ${COMPRESSION}"
    log "Database: ${DB_NAME}@${DB_HOST}:${DB_PORT}"
    log "Backup Directory: ${BACKUP_DIR}"
    
    # Check PostgreSQL client tools
    if ! command -v pg_dump &> /dev/null; then
        log "ERROR: pg_dump command not found. Please install PostgreSQL client tools."
        exit 1
    fi
    
    # Test database connection
    export PGPASSWORD="${DB_PASSWORD}"
    psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" -c '\q' 2>/dev/null
    if [ $? -ne 0 ]; then
        log "ERROR: Cannot connect to database"
        exit 1
    fi
    unset PGPASSWORD
    
    log "Database connection successful"
    
    # Perform backup
    perform_backup
    
    # Verify backup
    verify_backup
    
    # Create metadata
    create_metadata
    
    # Clean up old backups
    cleanup_old_backups
    
    log "============================================================"
    log "Backup Process Completed Successfully"
    log "============================================================"
}

# Run main function
main

exit 0