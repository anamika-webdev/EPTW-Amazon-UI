-- Updated schema for Amazon EPTW Database
-- Add google_id and password_hash columns to users table
-- Add permit_hazards table

-- Modify users table to add google_id and password_hash
ALTER TABLE users 
ADD COLUMN google_id VARCHAR(255) DEFAULT NULL AFTER email,
ADD COLUMN password_hash VARCHAR(255) DEFAULT NULL AFTER google_id;

-- Create permit_hazards table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS `permit_hazards` (
  `permit_id` int NOT NULL,
  `hazard_id` int NOT NULL,
  PRIMARY KEY (`permit_id`,`hazard_id`),
  KEY `hazard_id` (`hazard_id`),
  CONSTRAINT `permit_hazards_ibfk_1` FOREIGN KEY (`permit_id`) REFERENCES `permits` (`id`) ON DELETE CASCADE,
  CONSTRAINT `permit_hazards_ibfk_2` FOREIGN KEY (`hazard_id`) REFERENCES `master_hazards` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Add indexes for better query performance
CREATE INDEX idx_permit_status ON permits(status);
CREATE INDEX idx_permit_type ON permits(permit_type);
CREATE INDEX idx_permit_created_at ON permits(created_at);
CREATE INDEX idx_user_role ON users(role);
CREATE INDEX idx_user_email ON users(email);