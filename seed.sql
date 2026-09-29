-- ===================================================
-- Employee Leave Management System
-- Seed / Sample Data
-- ===================================================

USE employee_leave_management;

-- Clear existing data
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE leave_requests;
TRUNCATE TABLE leave_balances;
TRUNCATE TABLE users;
TRUNCATE TABLE leave_types;
TRUNCATE TABLE departments;
SET FOREIGN_KEY_CHECKS = 1;

-- ---------------------------------------------------
-- 1. Insert Departments
-- ---------------------------------------------------
INSERT INTO departments (id, name, description) VALUES
(1, 'Human Resources', 'HR management, talent acquisition, employee relations and organizational development'),
(2, 'Engineering', 'Software engineering, quality assurance, system architecture and devops'),
(3, 'Finance', 'Financial planning, accounting, payroll, budgeting and tax compliance'),
(4, 'Marketing', 'Digital marketing, brand management, content strategy and public relations'),
(5, 'Sales', 'Enterprise sales, client acquisition, customer relations and revenue operations'),
(6, 'Operations', 'Business operations, facilities, IT infrastructure and administration');

-- ---------------------------------------------------
-- 2. Insert Users
-- Passwords:
-- Admin:    Admin@123    -> $2a$10$Vu.nSdbSophuek9krwB3JeREq4B8zPai8QUz0.0p3TtKFRBUWttvi
-- Manager:  Manager@123  -> $2a$10$InqPq.qYb5mwsh/fatKQjOx2HnfW29BDqG79iZtwnjT37KPGaiAhO
-- Employee: Employee@123 -> $2a$10$ZKwjqkKpOTgPHqSo8dy12OWvbd8vRSGyKgVYOWBHRS9l2YT3xNZLO
-- ---------------------------------------------------
INSERT INTO users (id, employee_id, name, email, password, phone, role, department_id, manager_id, joining_date, status) VALUES
-- Admin
(1, 'ADM001', 'System Administrator', 'admin@company.com', '$2a$10$Vu.nSdbSophuek9krwB3JeREq4B8zPai8QUz0.0p3TtKFRBUWttvi', '9876543210', 'ADMIN', 1, NULL, '2023-01-10', 'ACTIVE'),

-- Managers
(2, 'MGR001', 'Rajesh Sharma', 'manager.eng@company.com', '$2a$10$InqPq.qYb5mwsh/fatKQjOx2HnfW29BDqG79iZtwnjT37KPGaiAhO', '9876543211', 'MANAGER', 2, NULL, '2023-02-15', 'ACTIVE'),
(3, 'MGR002', 'Priya Patel', 'manager.hr@company.com', '$2a$10$InqPq.qYb5mwsh/fatKQjOx2HnfW29BDqG79iZtwnjT37KPGaiAhO', '9876543212', 'MANAGER', 1, NULL, '2023-03-01', 'ACTIVE'),
(4, 'MGR003', 'Suresh Menon', 'manager.fin@company.com', '$2a$10$InqPq.qYb5mwsh/fatKQjOx2HnfW29BDqG79iZtwnjT37KPGaiAhO', '9876543213', 'MANAGER', 3, NULL, '2023-04-10', 'ACTIVE'),

-- Employees
(5, 'EMP001', 'Rahul Verma', 'rahul.verma@company.com', '$2a$10$ZKwjqkKpOTgPHqSo8dy12OWvbd8vRSGyKgVYOWBHRS9l2YT3xNZLO', '9876543214', 'EMPLOYEE', 2, 2, '2024-01-15', 'ACTIVE'),
(6, 'EMP002', 'Sneha Reddy', 'sneha.reddy@company.com', '$2a$10$ZKwjqkKpOTgPHqSo8dy12OWvbd8vRSGyKgVYOWBHRS9l2YT3xNZLO', '9876543215', 'EMPLOYEE', 2, 2, '2024-02-01', 'ACTIVE'),
(7, 'EMP003', 'Amit Kumar', 'amit.kumar@company.com', '$2a$10$ZKwjqkKpOTgPHqSo8dy12OWvbd8vRSGyKgVYOWBHRS9l2YT3xNZLO', '9876543216', 'EMPLOYEE', 1, 3, '2024-03-10', 'ACTIVE'),
(8, 'EMP004', 'Ananya Das', 'ananya.das@company.com', '$2a$10$ZKwjqkKpOTgPHqSo8dy12OWvbd8vRSGyKgVYOWBHRS9l2YT3xNZLO', '9876543217', 'EMPLOYEE', 3, 4, '2024-04-05', 'ACTIVE'),
(9, 'EMP005', 'Vikram Singh', 'vikram.singh@company.com', '$2a$10$ZKwjqkKpOTgPHqSo8dy12OWvbd8vRSGyKgVYOWBHRS9l2YT3xNZLO', '9876543218', 'EMPLOYEE', 4, 2, '2024-05-12', 'ACTIVE'),
(10, 'EMP006', 'Pooja Hegde', 'pooja.hegde@company.com', '$2a$10$ZKwjqkKpOTgPHqSo8dy12OWvbd8vRSGyKgVYOWBHRS9l2YT3xNZLO', '9876543219', 'EMPLOYEE', 2, 2, '2023-08-01', 'INACTIVE');

-- ---------------------------------------------------
-- 3. Insert Leave Types
-- ---------------------------------------------------
INSERT INTO leave_types (id, name, description, default_days, paid) VALUES
(1, 'Casual Leave', 'Leave for personal, urgent or unexpected domestic matters', 12, TRUE),
(2, 'Sick Leave', 'Leave for medical recovery, doctor appointments and health concerns', 10, TRUE),
(3, 'Annual/Earned Leave', 'Earned paid vacation leave accumulated for recreation and travel', 15, TRUE),
(4, 'Optional Leave', 'Restricted and optional festival or cultural holiday leave', 3, TRUE),
(5, 'Unpaid Leave', 'Authorized leave without pay for extended personal absence', 30, FALSE);

-- ---------------------------------------------------
-- 4. Insert Leave Balances (Year 2026)
-- ---------------------------------------------------
-- Rahul Verma (User 5):
-- CL: 12 total, 0 used, 12 remaining
-- SL: 10 total, 2 used, 8 remaining (due to approved request)
-- AL: 15 total, 0 used, 15 remaining
-- OL: 3 total, 0 used, 3 remaining
-- UL: 30 total, 0 used, 30 remaining
INSERT INTO leave_balances (user_id, leave_type_id, total_days, used_days, remaining_days, year) VALUES
(5, 1, 12, 0, 12, 2026),
(5, 2, 10, 2, 8, 2026),
(5, 3, 15, 0, 15, 2026),
(5, 4, 3, 0, 3, 2026),
(5, 5, 30, 0, 30, 2026);

-- Sneha Reddy (User 6):
-- AL: 15 total, 5 used, 10 remaining (due to approved request)
INSERT INTO leave_balances (user_id, leave_type_id, total_days, used_days, remaining_days, year) VALUES
(6, 1, 12, 0, 12, 2026),
(6, 2, 10, 0, 10, 2026),
(6, 3, 15, 5, 10, 2026),
(6, 4, 3, 0, 3, 2026),
(6, 5, 30, 0, 30, 2026);

-- Amit Kumar (User 7):
INSERT INTO leave_balances (user_id, leave_type_id, total_days, used_days, remaining_days, year) VALUES
(7, 1, 12, 0, 12, 2026),
(7, 2, 10, 0, 10, 2026),
(7, 3, 15, 0, 15, 2026),
(7, 4, 3, 0, 3, 2026),
(7, 5, 30, 0, 30, 2026);

-- Ananya Das (User 8):
-- CL: 12 total, 2 used, 10 remaining (due to approved request)
INSERT INTO leave_balances (user_id, leave_type_id, total_days, used_days, remaining_days, year) VALUES
(8, 1, 12, 2, 10, 2026),
(8, 2, 10, 0, 10, 2026),
(8, 3, 15, 0, 15, 2026),
(8, 4, 3, 0, 3, 2026),
(8, 5, 30, 0, 30, 2026);

-- Vikram Singh (User 9):
INSERT INTO leave_balances (user_id, leave_type_id, total_days, used_days, remaining_days, year) VALUES
(9, 1, 12, 0, 12, 2026),
(9, 2, 10, 0, 10, 2026),
(9, 3, 15, 0, 15, 2026),
(9, 4, 3, 0, 3, 2026),
(9, 5, 30, 0, 30, 2026);

-- Managers also have leave balances
INSERT INTO leave_balances (user_id, leave_type_id, total_days, used_days, remaining_days, year) VALUES
(2, 1, 12, 0, 12, 2026), (2, 2, 10, 0, 10, 2026), (2, 3, 15, 0, 15, 2026), (2, 4, 3, 0, 3, 2026), (2, 5, 30, 0, 30, 2026),
(3, 1, 12, 0, 12, 2026), (3, 2, 10, 0, 10, 2026), (3, 3, 15, 0, 15, 2026), (3, 4, 3, 0, 3, 2026), (3, 5, 30, 0, 30, 2026),
(4, 1, 12, 0, 12, 2026), (4, 2, 10, 0, 10, 2026), (4, 3, 15, 0, 15, 2026), (4, 4, 3, 0, 3, 2026), (4, 5, 30, 0, 30, 2026);

-- ---------------------------------------------------
-- 5. Insert Sample Leave Requests
-- ---------------------------------------------------
INSERT INTO leave_requests (id, user_id, leave_type_id, start_date, end_date, number_of_days, reason, optional_comments, status, manager_remarks, rejection_reason, approved_by, approved_at, created_at) VALUES
-- Pending Request from Rahul Verma (assigned to Rajesh Sharma)
(1, 5, 1, '2026-10-05', '2026-10-07', 3, 'Attending family religious ceremony and sister engagement in hometown.', 'Handover given to teammate Sneha', 'PENDING', NULL, NULL, NULL, NULL, '2026-09-20 10:15:00'),

-- Approved Request from Rahul Verma
(2, 5, 2, '2026-08-10', '2026-08-11', 2, 'Severe viral fever and doctor consultation prescribed bed rest.', 'Medical prescription submitted via email', 'APPROVED', 'Approved. Take care and get well soon.', NULL, 2, '2026-08-09 17:30:00', '2026-08-09 09:00:00'),

-- Rejected Request from Rahul Verma
(3, 5, 3, '2026-07-01', '2026-07-10', 10, 'Long road trip and vacation with college friends.', 'Will be reachable on phone', 'REJECTED', 'Cannot grant extended leave during critical Q3 release week.', 'Critical project delivery sprint and client demos scheduled during this period.', 2, '2026-06-25 14:00:00', '2026-06-24 11:00:00'),

-- Cancelled Request from Rahul Verma
(4, 5, 1, '2026-09-01', '2026-09-02', 2, 'Vehicle registration and municipal documentation work.', NULL, 'CANCELLED', NULL, NULL, NULL, NULL, '2026-08-28 12:00:00'),

-- Pending Request from Sneha Reddy (assigned to Rajesh Sharma)
(5, 6, 2, '2026-10-12', '2026-10-13', 2, 'Severe migraine and dental procedure.', 'Will catch up on pending tasks immediately on return', 'PENDING', NULL, NULL, NULL, NULL, '2026-09-22 14:40:00'),

-- Approved Request from Sneha Reddy
(6, 6, 3, '2026-08-18', '2026-08-22', 5, 'Annual family pilgrimage to Tirupati and domestic travel.', 'Sprint items completed in advance', 'APPROVED', 'Enjoy your vacation. Approved.', NULL, 2, '2026-08-10 11:20:00', '2026-08-08 16:00:00'),

-- Pending Request from Amit Kumar (assigned to Priya Patel)
(7, 7, 1, '2026-10-20', '2026-10-21', 2, 'Apartment shifting, relocation and broadband setup.', 'Will monitor urgent emails', 'PENDING', NULL, NULL, NULL, NULL, '2026-09-23 09:30:00'),

-- Approved Request from Ananya Das (assigned to Suresh Menon)
(8, 8, 1, '2026-09-15', '2026-09-16', 2, 'Passport renewal appointment and bank KYC verification.', 'Financial entries reconciled for the week', 'APPROVED', 'Approved by Finance lead.', NULL, 4, '2026-09-14 16:45:00', '2026-09-13 10:00:00'),

-- Pending Request from Vikram Singh (assigned to Rajesh Sharma)
(9, 9, 3, '2026-11-02', '2026-11-06', 5, 'Diwali celebrations and visiting grandparents in village.', 'Campaigns scheduled on auto-publish', 'PENDING', NULL, NULL, NULL, NULL, '2026-09-24 08:30:00');
