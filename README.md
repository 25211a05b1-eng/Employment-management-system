# Employee Leave Management System

The **Employee Leave Management System (ELMS)** is a full-stack web-based application designed to simplify and automate the process of managing employee leave within an organization. The system provides a centralized platform where employees can apply for leave, managers can review and approve or reject requests, and administrators can manage employees, departments, leave types, leave balances, and reports.

The application is developed using **React.js** for the frontend, **Node.js and Express.js** for the backend, and **MySQL/MariaDB** for database management. The frontend communicates with the backend through RESTful APIs, enabling smooth and secure data exchange between different modules of the system.

## Key Features

* **Employee Management:** Employees can securely log in, view their profiles, check available leave balances, apply for leave, view leave history, and track the status of their requests.
* **Manager Management:** Managers can view leave requests submitted by their team members and approve or reject requests with appropriate remarks.
* **Admin Management:** Administrators can manage employees, departments, leave types, leave balances, and overall system information.
* **Leave Management:** The system supports leave applications, date validation, leave balance checking, request tracking, approval, rejection, and eligible cancellation.
* **Authentication & Authorization:** JWT-based authentication and role-based access control ensure that users can access only the features permitted for their roles.
* **Password Security:** User passwords are securely hashed using bcrypt before being stored in the database.
* **Dashboard & Reports:** Interactive dashboards provide useful information about leave requests, leave types, departments, and request statuses using charts and statistics.
* **Database Management:** MySQL/MariaDB is used to store employee details, departments, leave types, leave balances, and leave requests.

## User Roles

### Employee

* Login securely
* View dashboard
* Check leave balance
* Apply for leave
* View leave history
* Track request status
* Cancel eligible requests
* Update profile information

### Manager

* View team members
* View employee leave requests
* Approve or reject leave requests
* Add remarks during the approval/rejection process
* Monitor team leave information

### Administrator

* Manage employees
* Manage departments
* Manage leave types
* Manage leave balances
* Monitor leave requests
* View system statistics and reports

## Technology Stack

**Frontend**

* React.js
* React Router
* Bootstrap
* Chart.js

**Backend**

* Node.js
* Express.js
* REST APIs

**Database**

* MySQL / MariaDB

**Security**

* JWT Authentication
* bcrypt Password Hashing
* Role-Based Authorization

## System Workflow

The basic workflow of the application is:

**Employee Login → Check Leave Balance → Apply for Leave → Backend Validation → Manager Review → Approve/Reject → Update Leave Status and Balance**

The system helps reduce manual paperwork, improves transparency in leave processing, and provides an organized way to maintain employee leave records.

## Project Objective

The primary objective of this project is to develop a secure, efficient, and user-friendly platform that automates employee leave management and reduces the need for manual leave tracking through emails, spreadsheets, or paper-based processes.

This project demonstrates the implementation of a complete **full-stack application**, including frontend development, backend API development, database integration, authentication, authorization, validation, and role-based functionality.
