-- Migration script to add OAuth support to users table
-- Run this after importing amazon_eptw_db.sql

USE amazon_eptw_db;

-- Add google_id column for Google OAuth
ALTER TABLE users 
ADD COLUMN google_id VARCHAR(255) DEFAULT NULL AFTER login_id,
ADD COLUMN auth_provider ENUM('local', 'google') DEFAULT 'local' AFTER google_id,
ADD UNIQUE KEY google_id (google_id);

-- Make login_id nullable for Google OAuth users
ALTER TABLE users 
MODIFY COLUMN login_id VARCHAR(50) NULL;

-- Add password column for local authentication (optional)
-- ALTER TABLE users 
-- ADD COLUMN password_hash VARCHAR(255) DEFAULT NULL AFTER email;

-- Update existing users to have auth_provider set to 'local'
UPDATE users SET auth_provider = 'local' WHERE auth_provider IS NULL;

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_permits_status ON permits(status);
CREATE INDEX idx_permits_created_at ON permits(created_at);
CREATE INDEX idx_permit_approvals_status ON permit_approvals(status);

-- Create a view for active permits summary
CREATE OR REPLACE VIEW v_active_permits AS
SELECT 
    p.id,
    p.permit_serial,
    p.permit_type,
    p.work_location,
    p.start_time,
    p.end_time,
    p.status,
    s.name as site_name,
    u.full_name as created_by,
    TIMESTAMPDIFF(HOUR, NOW(), p.end_time) as hours_remaining
FROM permits p
LEFT JOIN sites s ON p.site_id = s.id
LEFT JOIN users u ON p.created_by_user_id = u.id
WHERE p.status = 'Active';

-- Create a view for pending approvals summary
CREATE OR REPLACE VIEW v_pending_approvals AS
SELECT 
    p.id as permit_id,
    p.permit_serial,
    p.permit_type,
    p.work_location,
    p.created_at,
    pa.id as approval_id,
    pa.role as approver_role,
    u.full_name as approver_name,
    u.email as approver_email,
    pa.status as approval_status
FROM permits p
JOIN permit_approvals pa ON p.id = pa.permit_id
JOIN users u ON pa.approver_user_id = u.id
WHERE pa.status = 'Pending';

-- Success message
SELECT 'Migration completed successfully!' as message;