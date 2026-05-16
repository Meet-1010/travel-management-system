-- ============================================================
-- TRAVEL MANAGEMENT SYSTEM - MySQL Database Schema
-- Author: Auto-generated
-- Description: Full schema for TMS with all tables and relations
-- ============================================================

CREATE DATABASE IF NOT EXISTS travel_management_db;
USE travel_management_db;

-- ============================================================
-- TABLE: users
-- Stores all system users with their roles
-- ============================================================
CREATE TABLE users (
  id         BIGINT PRIMARY KEY AUTO_INCREMENT,
  name       VARCHAR(100)  NOT NULL,
  email      VARCHAR(100)  NOT NULL UNIQUE,
  password   VARCHAR(255)  NOT NULL,            -- BCrypt hashed
  role       ENUM('ADMIN','EMPLOYEE','MANAGER','FINANCE') NOT NULL,
  department VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- TABLE: travel_requests
-- Stores every travel request submitted by employees
-- ============================================================
CREATE TABLE travel_requests (
  id          BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id     BIGINT       NOT NULL,
  destination VARCHAR(100) NOT NULL,
  start_date  DATE         NOT NULL,
  end_date    DATE         NOT NULL,
  purpose     TEXT         NOT NULL,
  budget      DECIMAL(10,2),
  status      ENUM('DRAFT','SUBMITTED','MANAGER_APPROVED','FINANCE_APPROVED','APPROVED','REJECTED') DEFAULT 'DRAFT',
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================
-- TABLE: approvals
-- Stores approval/rejection records for each travel request
-- Level 1 = Manager, Level 2 = Finance Manager
-- ============================================================
CREATE TABLE approvals (
  id          BIGINT PRIMARY KEY AUTO_INCREMENT,
  request_id  BIGINT NOT NULL,
  approver_id BIGINT NOT NULL,
  level       INT    NOT NULL COMMENT '1=Manager, 2=Finance',
  status      ENUM('PENDING','APPROVED','REJECTED') DEFAULT 'PENDING',
  comments    TEXT,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (request_id)  REFERENCES travel_requests(id) ON DELETE CASCADE,
  FOREIGN KEY (approver_id) REFERENCES users(id)
);

-- ============================================================
-- TABLE: expenses
-- Tracks expenses linked to approved travel requests
-- ============================================================
CREATE TABLE expenses (
  id           BIGINT PRIMARY KEY AUTO_INCREMENT,
  request_id   BIGINT       NOT NULL,
  category     VARCHAR(50)  NOT NULL COMMENT 'food, travel, stay, misc',
  amount       DECIMAL(10,2) NOT NULL,
  description  VARCHAR(255),
  receipt_path VARCHAR(255) COMMENT 'Simulated file path for receipt',
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (request_id) REFERENCES travel_requests(id) ON DELETE CASCADE
);

-- ============================================================
-- TABLE: itinerary_segments
-- Stores individual travel segments (flights, hotels, etc.)
-- ============================================================
CREATE TABLE itinerary_segments (
  id           BIGINT PRIMARY KEY AUTO_INCREMENT,
  request_id   BIGINT      NOT NULL,
  segment_type VARCHAR(50) COMMENT 'flight, hotel, cab, train',
  description  VARCHAR(255),
  from_location VARCHAR(100),
  to_location   VARCHAR(100),
  segment_date  DATE,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (request_id) REFERENCES travel_requests(id) ON DELETE CASCADE
);

-- ============================================================
-- TABLE: policies
-- Company travel policies (budget limits, allowed class, etc.)
-- ============================================================
CREATE TABLE policies (
  id            BIGINT PRIMARY KEY AUTO_INCREMENT,
  policy_name   VARCHAR(100) NOT NULL,
  max_budget    DECIMAL(10,2),
  allowed_class VARCHAR(50) COMMENT 'economy, business, first',
  description   TEXT,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- TABLE: reimbursements
-- Tracks reimbursement status for each travel request
-- ============================================================
CREATE TABLE reimbursements (
  id            BIGINT PRIMARY KEY AUTO_INCREMENT,
  request_id    BIGINT NOT NULL UNIQUE,
  total_amount  DECIMAL(10,2),
  status        ENUM('PENDING','APPROVED','PAID') DEFAULT 'PENDING',
  processed_by  BIGINT COMMENT 'Finance Manager user ID',
  processed_at  TIMESTAMP,
  FOREIGN KEY (request_id)   REFERENCES travel_requests(id),
  FOREIGN KEY (processed_by) REFERENCES users(id)
);

-- ============================================================
-- TABLE: audit_logs
-- Immutable log of every significant system action
-- ============================================================
CREATE TABLE audit_logs (
  id         BIGINT PRIMARY KEY AUTO_INCREMENT,
  action     TEXT  NOT NULL,
  entity     VARCHAR(50) COMMENT 'travel_request, expense, approval, user',
  entity_id  BIGINT,
  user_id    BIGINT,
  ip_address VARCHAR(45),
  timestamp  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- ============================================================
-- NOTE: Seed data (users + policy) is now handled automatically
-- by DataInitializer.java at application startup.
-- It uses BCryptPasswordEncoder directly, so passwords are
-- always hashed correctly.
--
-- Default credentials (all use password: admin123):
--   admin@tms.com    → ADMIN
--   john@tms.com     → EMPLOYEE
--   manager@tms.com  → MANAGER
--   finance@tms.com  → FINANCE
-- ============================================================
