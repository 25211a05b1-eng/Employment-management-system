
# 𝗘𝗠𝗣𝗟𝗢𝗬𝗘𝗘 𝗟𝗘𝗔𝗩𝗘 𝗠𝗔𝗡𝗔𝗚𝗘𝗠𝗘𝗡𝗧 𝗦𝗬𝗦𝗧𝗘𝗠

A **full-stack Employee Leave Management System (ELMS)** designed to automate and simplify employee leave management within an organization. The system provides separate functionality for **Employees, Managers, and Administrators**, covering leave applications, approvals, balances, employee management, and reports.

---

# 𝗣𝗥𝗢𝗝𝗘𝗖𝗧 𝗢𝗩𝗘𝗥𝗩𝗜𝗘𝗪

The Employee Leave Management System provides a centralized platform for managing employee leave requests.

Employees can apply for leave and track their applications, managers can review and approve or reject requests, and administrators can manage employees, departments, leave types, leave balances, and system reports.

The application uses a **React.js frontend**, **Node.js and Express.js backend**, and **MySQL/MariaDB database**, with communication between frontend and backend through REST APIs.

---

# 𝗣𝗥𝗢𝗝𝗘𝗖𝗧 𝗢𝗕𝗝𝗘𝗖𝗧𝗜𝗩𝗘𝗦

* Automate the employee leave application process.
* Reduce manual paperwork and spreadsheet-based tracking.
* Provide a structured leave approval workflow.
* Maintain accurate employee leave balances.
* Provide role-based access to system functionality.
* Allow employees to track leave status and history.
* Provide administrators with reports and analytics.
* Improve transparency and efficiency in leave management.

---

# 𝗞𝗘𝗬 𝗙𝗘𝗔𝗧𝗨𝗥𝗘𝗦

## 𝗔𝘂𝘁𝗵𝗲𝗻𝘁𝗶𝗰𝗮𝘁𝗶𝗼𝗻 & 𝗔𝘂𝘁𝗵𝗼𝗿𝗶𝘇𝗮𝘁𝗶𝗼𝗻

* Secure user login.
* Role-based access control.
* JWT-based authentication.
* Password hashing using bcrypt.
* Protected application routes.
* Separate access for Employee, Manager, and Administrator.

## 𝗟𝗲𝗮𝘃𝗲 𝗠𝗮𝗻𝗮𝗴𝗲𝗺𝗲𝗻𝘁

* Apply for leave.
* Select leave type.
* Select start and end dates.
* Automatically calculate leave duration.
* Check available leave balance.
* Validate leave applications.
* Prevent overlapping leave requests.
* Track application status.
* Cancel eligible pending applications.

## 𝗠𝗮𝗻𝗮𝗴𝗲𝗿 𝗠𝗮𝗻𝗮𝗴𝗲𝗺𝗲𝗻𝘁

* View team members.
* View employee leave requests.
* Review leave applications.
* Approve leave requests.
* Reject leave requests.
* Add remarks during approval/rejection.
* Monitor team leave information.

## 𝗔𝗱𝗺𝗶𝗻𝗶𝘀𝘁𝗿𝗮𝘁𝗶𝗼𝗻

* Manage employees.
* Manage departments.
* Manage leave types.
* Manage leave balances.
* Monitor leave applications.
* View system statistics.
* Generate and view reports.

## 𝗥𝗲𝗽𝗼𝗿𝘁𝘀 & 𝗔𝗻𝗮𝗹𝘆𝘁𝗶𝗰𝘀

* Total leave requests.
* Approval ratio.
* Active employee/headcount information.
* Department-wise approved leaves.
* Leave category breakdown.
* Application status statistics.
* Monthly leave application trends.
* Graphical representation using charts.

---

# 𝗨𝗦𝗘𝗥 𝗥𝗢𝗟𝗘𝗦

## 👨‍💻 𝗘𝗺𝗽𝗹𝗼𝘆𝗲𝗲

Employees can:

* Login to the system.
* View their dashboard.
* Check available leave balance.
* Apply for leave.
* View leave history.
* Track application status.
* Cancel eligible requests.
* View/update profile information.

## 👨‍💼 𝗠𝗮𝗻𝗮𝗴𝗲𝗿

Managers can:

* View team members.
* View employee leave applications.
* Review leave requests.
* Approve requests.
* Reject requests.
* Add approval/rejection remarks.
* Monitor team leave information.

## 👨‍💻 𝗔𝗱𝗺𝗶𝗻𝗶𝘀𝘁𝗿𝗮𝘁𝗼𝗿

Administrators can:

* Manage employees.
* Manage departments.
* Manage leave types.
* Manage leave balances.
* Monitor leave requests.
* View dashboards.
* View reports and analytics.

---

# 𝗦𝗬𝗦𝗧𝗘𝗠 𝗔𝗥𝗖𝗛𝗜𝗧𝗘𝗖𝗧𝗨𝗥𝗘

The system follows a **three-tier architecture** consisting of the **Presentation Layer, Application/Backend Layer, and Database Layer**.

```text
                         USERS
                           │
          ┌────────────────┼────────────────┐
          │                │                │
       Employee          Manager          Admin
          │                │                │
          └────────────────┼────────────────┘
                           ▼
              ┌─────────────────────────┐
              │     FRONTEND LAYER      │
              │                         │
              │ React.js                │
              │ React Router            │
              │ Bootstrap 5             │
              │ Chart.js                │
              │                         │
              │ Login                   │
              │ Dashboard               │
              │ Leave Forms             │
              │ Approvals               │
              │ Reports                 │
              └────────────┬────────────┘
                           │
                    HTTP / REST API
                           │
                           ▼
              ┌─────────────────────────┐
              │      BACKEND LAYER      │
              │                         │
              │ Node.js                 │
              │ Express.js              │
              │                         │
              │ Authentication          │
              │ Authorization           │
              │ Business Logic          │
              │ Validation              │
              │ Leave Processing        │
              │ Approval Workflow       │
              └────────────┬────────────┘
                           │
                      SQL Queries
                           │
                           ▼
              ┌─────────────────────────┐
              │     DATABASE LAYER      │
              │                         │
              │ MySQL / MariaDB         │
              │                         │
              │ Employees               │
              │ Departments             │
              │ Leave Types             │
              │ Leave Balances          │
              │ Leave Applications      │
              │ User Information        │
              └─────────────────────────┘
```

## 𝗔𝗿𝗰𝗵𝗶𝘁𝗲𝗰𝘁𝘂𝗿𝗲 𝗪𝗼𝗿𝗸𝗳𝗹𝗼𝘄

1. The user logs into the system through the frontend.
2. The frontend sends authentication information to the backend.
3. The backend verifies the credentials and user role.
4. After authentication, the user accesses role-specific features.
5. Employees can submit leave applications.
6. The backend validates dates, leave balance, and application rules.
7. The request is stored in the database.
8. Managers review the submitted request.
9. The manager approves or rejects the request.
10. The system updates the leave status and relevant balance.
11. Updated information is displayed on the frontend.
12. Administrators can view overall statistics and reports.

---

# 𝗦𝗬𝗦𝗧𝗘𝗠 𝗪𝗢𝗥𝗞𝗙𝗟𝗢𝗪

```text
Login
  ↓
Authentication
  ↓
Role Verification
  ↓
Dashboard
  ↓
Check Leave Balance
  ↓
Apply for Leave
  ↓
Backend Validation
  ↓
Save Leave Request
  ↓
Manager Review
  ↓
 ┌───────────────┐
 │               │
Approve        Reject
 │               │
 ↓               ↓
Update          Update
Balance         Status
 │               │
 └───────┬───────┘
         ↓
   Leave Status
         ↓
 Reports & History
```

---

# 𝗧𝗘𝗖𝗛𝗡𝗢𝗟𝗢𝗚𝗬 𝗦𝗧𝗔𝗖𝗞

| Layer             | Technologies                                  |
| ----------------- | --------------------------------------------- |
| Frontend          | React.js, React Router, Bootstrap 5, Chart.js |
| Backend           | Node.js, Express.js                           |
| API               | REST API                                      |
| Database          | MySQL / MariaDB                               |
| Authentication    | JWT                                           |
| Password Security | bcrypt                                        |
| API Testing       | Postman                                       |
| Development       | npm, dotenv, CORS                             |

---

# 𝗣𝗥𝗢𝗝𝗘𝗖𝗧 𝗠𝗢𝗗𝗨𝗟𝗘𝗦

### 𝟭. 𝗔𝘂𝘁𝗵𝗲𝗻𝘁𝗶𝗰𝗮𝘁𝗶𝗼𝗻 𝗠𝗼𝗱𝘂𝗹𝗲

Handles login, authentication, password security, and role-based access.

### 𝟮. 𝗘𝗺𝗽𝗹𝗼𝘆𝗲𝗲 𝗠𝗼𝗱𝘂𝗹𝗲

Manages employee profiles, employee information, and employee-related operations.

### 𝟯. 𝗠𝗮𝗻𝗮𝗴𝗲𝗿 𝗠𝗼𝗱𝘂𝗹𝗲

Allows managers to review and process employee leave requests.

### 𝟰. 𝗟𝗲𝗮𝘃𝗲 𝗔𝗽𝗽𝗹𝗶𝗰𝗮𝘁𝗶𝗼𝗻 𝗠𝗼𝗱𝘂𝗹𝗲

Allows employees to submit leave applications with leave type, dates, reason, and comments.

### 𝟱. 𝗟𝗲𝗮𝘃𝗲 𝗔𝗽𝗽𝗿𝗼𝘃𝗮𝗹 𝗠𝗼𝗱𝘂𝗹𝗲

Provides managers with the ability to approve or reject employee requests.

### 𝟲. 𝗟𝗲𝗮𝘃𝗲 𝗕𝗮𝗹𝗮𝗻𝗰𝗲 𝗠𝗼𝗱𝘂𝗹𝗲

Maintains available, used, and remaining leave balances.

### 𝟳. 𝗗𝗲𝗽𝗮𝗿𝘁𝗺𝗲𝗻𝘁 𝗠𝗼𝗱𝘂𝗹𝗲

Allows administrators to manage organizational departments.

### 𝟴. 𝗟𝗲𝗮𝘃𝗲 𝗧𝘆𝗽𝗲 𝗠𝗼𝗱𝘂𝗹𝗲

Manages different leave categories such as Casual Leave, Sick Leave, and Annual/Earned Leave.

### 𝟵. 𝗟𝗲𝗮𝘃𝗲 𝗛𝗶𝘀𝘁𝗼𝗿𝘆 𝗠𝗼𝗱𝘂𝗹𝗲

Displays previous and current leave applications with their statuses.

### 𝟭𝟬. 𝗥𝗲𝗽𝗼𝗿𝘁𝘀 & 𝗔𝗻𝗮𝗹𝘆𝘁𝗶𝗰𝘀 𝗠𝗼𝗱𝘂𝗹𝗲

Provides statistics, charts, department-wise information, leave trends, and application outcomes.

## 👤 𝗘𝗺𝗽𝗹𝗼𝘆𝗲𝗲 𝗗𝗮𝘀𝗵𝗯𝗼𝗮𝗿𝗱

The dashboard provides an overview of leave balances, pending requests, approved requests, rejected requests, and leave usage.

![Employee Dashboard](screenshots/05-employee-dashboard.png)

---

# 𝗗𝗘𝗠𝗢 𝗟𝗢𝗚𝗜𝗡 𝗔𝗖𝗖𝗢𝗨𝗡𝗧𝗦

| Role          | Email                     | Password       |
| ------------- | ------------------------- | -------------- |
| Administrator | `admin@company.com`       | `Admin@123`    |
| Manager       | `manager.eng@company.com` | `Manager@123`  |
| Employee      | `rahul.verma@company.com` | `Employee@123` |

> These accounts are intended for the project's demo/seed environment. Change credentials before using the application in a real deployment.

---

# 𝗣𝗥𝗢𝗝𝗘𝗖𝗧 𝗦𝗧𝗥𝗨𝗖𝗧𝗨𝗥𝗘

```text
Employee-management-system/
│
├── backend/
│   ├── routes/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── config/
│   └── server.js
│
├── frontend/
│   ├── public/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── services/
│       ├── context/
│       └── App.js
│
├── postman/
│   └── API Collection
│
├── FINAL_SETUP.md
├── QA_REPORT.md
└── README.md
```

---

# 𝗜𝗡𝗦𝗧𝗔𝗟𝗟𝗔𝗧𝗜𝗢𝗡 & 𝗦𝗘𝗧𝗨𝗣

## 𝗣𝗿𝗲𝗿𝗲𝗾𝘂𝗶𝘀𝗶𝘁𝗲𝘀

Install the following software:

* Node.js
* npm
* MySQL or MariaDB
* Modern web browser
* Postman *(optional)*

## 𝟭. 𝗖𝗹𝗼𝗻𝗲 𝘁𝗵𝗲 𝗥𝗲𝗽𝗼𝘀𝗶𝘁𝗼𝗿𝘆

```bash
git clone https://github.com/25211a05b1-eng/Employment-management-system.git
```

```bash
cd Employment-management-system
```

## 𝟮. 𝗖𝗼𝗻𝗳𝗶𝗴𝘂𝗿𝗲 𝘁𝗵𝗲 𝗗𝗮𝘁𝗮𝗯𝗮𝘀𝗲

1. Start MySQL/MariaDB.
2. Create the project database.
3. Import the provided database/schema files.
4. Configure database credentials in the backend environment file.

Example:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=employee_leave_management
PORT=5000
```

> Use the actual environment variable names provided by the project configuration.

## 𝟯. 𝗦𝘁𝗮𝗿𝘁 𝘁𝗵𝗲 𝗕𝗮𝗰𝗸𝗲𝗻𝗱

```bash
cd backend
npm install
npm start
```

The backend runs on:

```text
http://localhost:5000
```

## 𝟰. 𝗦𝘁𝗮𝗿𝘁 𝘁𝗵𝗲 𝗙𝗿𝗼𝗻𝘁𝗲𝗻𝗱

Open another terminal:

```bash
cd frontend
npm install
npm start
```

The frontend runs on:

```text
http://localhost:3000
```

---

# 𝗔𝗣𝗜 𝗧𝗘𝗦𝗧𝗜𝗡𝗚

The project includes a Postman collection for testing backend APIs.

### Steps:

1. Start the backend server.
2. Open Postman.
3. Import the project's Postman collection.
4. Test authentication APIs.
5. Test employee APIs.
6. Test leave application APIs.
7. Test approval/rejection APIs.
8. Verify API responses.

---

# 𝗦𝗘𝗖𝗨𝗥𝗜𝗧𝗬 𝗙𝗘𝗔𝗧𝗨𝗥𝗘𝗦

The application includes several security mechanisms:

* JWT-based authentication.
* Role-based authorization.
* Password hashing using bcrypt.
* Protected routes.
* Backend validation.
* Environment-based configuration.
* CORS configuration.
* Restricted access to role-specific functions.

---

# 𝗥𝗘𝗣𝗢𝗥𝗧𝗦 & 𝗔𝗡𝗔𝗟𝗬𝗧𝗜𝗖𝗦

The system provides an analytics dashboard containing:

* **Total System Requests**
* **Approval Ratio**
* **Active Headcount**
* **Covered Departments**
* **Leave Application Trends**
* **Approved Leaves by Department**
* **Leave Categories Breakdown**
* **Application Status Outcomes**

These reports help administrators understand leave usage and application patterns.

---

# 𝗕𝗘𝗡𝗘𝗙𝗜𝗧𝗦 𝗢𝗙 𝗧𝗛𝗘 𝗦𝗬𝗦𝗧𝗘𝗠

* Reduces manual leave management.
* Saves time for employees and managers.
* Centralizes employee leave information.
* Provides transparent approval workflows.
* Reduces errors in leave calculations.
* Maintains organized leave records.
* Provides quick access to leave history.
* Supports role-based access.
* Provides visual reports and analytics.
* Improves overall leave-management efficiency.

---

# 𝗙𝗨𝗧𝗨𝗥𝗘 𝗘𝗡𝗛𝗔𝗡𝗖𝗘𝗠𝗘𝗡𝗧𝗦

Possible future improvements include:

* Email notifications for leave status changes.
* Mobile application.
* HR payroll integration.
* Calendar integration.
* Advanced attendance management.
* Export reports to PDF/Excel.
* Multi-level approval workflows.
* Automated holiday calendar integration.
* Cloud deployment.
* Advanced audit logs and activity tracking.

---

# 👨‍👩‍👧‍👦 𝗧𝗘𝗔𝗠 𝗠𝗘𝗠𝗕𝗘𝗥𝗦

| Member | Name             | Roll Number  |
| ------ | ---------------- | ------------ |
| 1      | **Mayank Sai**   | `25211A05B1` |
| 2      | **Monika**       | `25211A05B2` |
| 3      | **Purvi**        | `25211A05B3` |
| 4      | **Harshith**     | `25211A05B4` |
| 5      | **Nikhil Yadav** | `25211A05B5` |

---

# 🎓 𝗔𝗖𝗔𝗗𝗘𝗠𝗜𝗖 𝗣𝗥𝗢𝗝𝗘𝗖𝗧

This project was developed as an academic full-stack web application to demonstrate practical implementation of:

* Frontend development
* Backend development
* REST API integration
* Database management
* Authentication
* Authorization
* CRUD operations
* Form validation
* Role-based access control
* Business logic
* Data visualization
* Software testing

---

# 🌐 𝗥𝗘𝗣𝗢𝗦𝗜𝗧𝗢𝗥𝗬

**GitHub Repository:**

[https://github.com/25211a05b1-eng/Employment-management-system](https://github.com/25211a05b1-eng/Employment-management-system)

---

# ⭐ 𝗣𝗥𝗢𝗝𝗘𝗖𝗧 𝗦𝗨𝗠𝗠𝗔𝗥𝗬

The **Employee Leave Management System** provides a centralized digital platform for managing employee leave. It connects **Employees, Managers, and Administrators** through a structured workflow:

```text
Employee
   ↓
Apply for Leave
   ↓
System Validation
   ↓
Manager Review
   ↓
Approve / Reject
   ↓
Update Leave Status
   ↓
Update Leave Balance
   ↓
History & Reports
```

The project demonstrates how a full-stack web application can combine a modern frontend, RESTful backend APIs, relational database, authentication, role-based authorization, and data visualization to create a complete employee leave-management solution.


📌 Project Overview

The Employee Leave Management System provides a centralized platform for managing employee leave requests.

Employees can apply for leave and track their applications, managers can review and approve or reject requests, and administrators can manage employees, departments, leave types, leave balances, and system reports.

The application uses a React.js frontend, Node.js and Express.js backend, and MySQL/MariaDB database, with communication between frontend and backend through REST APIs. 


---

🎯 Project Objectives

Automate the employee leave application process.

Reduce manual paperwork and spreadsheet-based tracking.

Provide a structured leave approval workflow.

Maintain accurate employee leave balances.

Provide role-based access to system functionality.

Allow employees to track leave status and history.

Provide administrators with reports and analytics.

Improve transparency and efficiency in leave management.



---

✨ Key Features

🔐 Authentication & Authorization

Secure user login.

Role-based access control.

JWT-based authentication.

Password hashing using bcrypt.

Protected application routes.

Separate access for Employee, Manager, and Administrator.


📝 Leave Management

Apply for leave.

Select leave type.

Select start and end dates.

Automatically calculate leave duration.

Check available leave balance.

Validate leave applications.

Prevent overlapping leave requests.

Track application status.

Cancel eligible pending applications.


👨‍💼 Manager Management

View team members.

View employee leave requests.

Review leave applications.

Approve leave requests.

Reject leave requests.

Add remarks during approval/rejection.

Monitor team leave information.


🛠️ Administration

Manage employees.

Manage departments.

Manage leave types.

Manage leave balances.

Monitor leave applications.

View system statistics.

Generate/view reports.


📊 Reports & Analytics

Total leave requests.

Approval ratio.

Active employee/headcount information.

Department-wise approved leaves.

Leave category breakdown.

Application status statistics.

Monthly leave application trends.

Graphical representation using charts.



---

👥 User Roles

👨‍💻 Employee

Employees can:

Login to the system.

View their dashboard.

Check available leave balance.

Apply for leave.

View leave history.

Track application status.

Cancel eligible requests.

View/update profile information.


👨‍💼 Manager

Managers can:

View team members.

View employee leave applications.

Review leave requests.

Approve requests.

Reject requests.

Add approval/rejection remarks.

Monitor team leave information.


👨‍💻 Administrator

Administrators can:

Manage employees.

Manage departments.

Manage leave types.

Manage leave balances.

Monitor leave requests.

View dashboards.

View reports and analytics.



---

🏗️ System Architecture

The system follows a three-tier architecture consisting of the Presentation Layer, Application/Backend Layer, and Database Layer.

USERS
                           │
          ┌────────────────┼────────────────┐
          │                │                │
       Employee          Manager          Admin
          │                │                │
          └────────────────┼────────────────┘
                           ▼
              ┌─────────────────────────┐
              │     FRONTEND LAYER      │
              │                         │
              │ React.js                │
              │ React Router            │
              │ Bootstrap 5             │
              │ Chart.js                │
              │                         │
              │ Login                   │
              │ Dashboard               │
              │ Leave Forms             │
              │ Approvals               │
              │ Reports                 │
              └────────────┬────────────┘
                           │
                    HTTP / REST API
                           │
                           ▼
              ┌─────────────────────────┐
              │      BACKEND LAYER      │
              │                         │
              │ Node.js                 │
              │ Express.js              │
              │                         │
              │ Authentication          │
              │ Authorization           │
              │ Business Logic          │
              │ Validation              │
              │ Leave Processing        │
              │ Approval Workflow       │
              └────────────┬────────────┘
                           │
                      SQL Queries
                           │
                           ▼
              ┌─────────────────────────┐
              │     DATABASE LAYER      │
              │                         │
              │ MySQL / MariaDB         │
              │                         │
              │ Employees               │
              │ Departments             │
              │ Leave Types             │
              │ Leave Balances          │
              │ Leave Applications      │
              │ User Information        │
              └─────────────────────────┘

🔄 Architecture Workflow

1. The user logs into the system through the frontend.


2. The frontend sends authentication information to the backend.


3. The backend verifies the credentials and user role.


4. After authentication, the user accesses role-specific features.


5. Employees can submit leave applications.


6. The backend validates dates, leave balance, and application rules.


7. The request is stored in the database.


8. Managers review the submitted request.


9. The manager approves or rejects the request.


10. The system updates the leave status and relevant balance.


11. Updated information is displayed on the frontend.


12. Administrators can view overall statistics and reports.




---

🔄 System Workflow

Login
  ↓
Authentication
  ↓
Role Verification
  ↓
Dashboard
  ↓
Check Leave Balance
  ↓
Apply for Leave
  ↓
Backend Validation
  ↓
Save Leave Request
  ↓
Manager Review
  ↓
 ┌───────────────┐
 │               │
Approve        Reject
 │               │
 ↓               ↓
Update          Update
Balance         Status
 │               │
 └───────┬───────┘
         ↓
   Leave Status
         ↓
 Reports & History


---

💻 Technology Stack

Layer	Technologies

Frontend	React.js, React Router, Bootstrap 5, Chart.js
Backend	Node.js, Express.js
API	REST API
Database	MySQL / MariaDB
Authentication	JWT
Password Security	bcrypt
API Testing	Postman
Development	npm, dotenv, CORS


The repository currently documents React, React Router, Bootstrap, Chart.js, Node.js, Express.js, REST APIs, MySQL/MariaDB, JWT, bcrypt, and role-based authorization as the main technologies. 


---

📚 Project Modules

1. Authentication Module

Handles login, authentication, password security, and role-based access.

2. Employee Module

Manages employee profiles, employee information, and employee-related operations.

3. Manager Module

Allows managers to review and process employee leave requests.

4. Leave Application Module

Allows employees to submit leave applications with leave type, dates, reason, and comments.

5. Leave Approval Module

Provides managers with the ability to approve or reject employee requests.

6. Leave Balance Module

Maintains available, used, and remaining leave balances.

7. Department Module

Allows administrators to manage organizational departments.

8. Leave Type Module

Manages different leave categories such as Casual Leave, Sick Leave, and Annual/Earned Leave.

9. Leave History Module

Displays previous and current leave applications with their statuses.

10. Reports & Analytics Module

Provides statistics, charts, department-wise information, leave trends, and application outcomes.


---

🖥️ Application Screenshots

🔐 Login Page

The login page provides secure access to the Employee Leave Management System. Users can sign in according to their assigned role.




---

📝 Apply for Leave

Employees can select the leave type, specify start and end dates, enter the reason, and provide optional handover notes before submitting a request.




---

📊 Reports & Leave Analytics

The reports dashboard provides graphical information about leave requests, approval ratios, departments, leave categories, and application outcomes.




---

📋 Leave History & Status

Employees can view their previous leave applications, requested duration, reasons, application dates, and current status.




---

👤 Employee Dashboard

The dashboard provides an overview of leave balances, pending requests, approved requests, rejected requests, and leave usage.




---

🔑 Demo Login Accounts

Role	Email	Password

Administrator	admin@company.com	Admin@123
Manager	manager.eng@company.com	Manager@123
Employee	rahul.verma@company.com	Employee@123


> These accounts are intended for the project's demo/seed environment. Change credentials before using the application in a real deployment.




---

📁 Project Structure

Employee-management-system/
│
├── backend/
│   ├── routes/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── config/
│   └── server.js
│
├── frontend/
│   ├── public/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── services/
│       ├── context/
│       └── App.js
│
├── postman/
│   └── API Collection
│
├── FINAL_SETUP.md
├── QA_REPORT.md
└── README.md

The repository currently contains dedicated backend, frontend, postman, setup, QA, and README files. 


---

⚙️ Installation & Setup

Prerequisites

Install the following software:

Node.js

npm

MySQL or MariaDB

Modern web browser

Postman (optional)



---

1. Clone the Repository

git clone https://github.com/25211a05b1-eng/Employment-management-system.git

cd Employment-management-system


---

2. Configure the Database

1. Start MySQL/MariaDB.


2. Create the project database.


3. Import the provided database/schema files.


4. Configure database credentials in the backend environment file.



Example:

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=employee_leave_management
PORT=5000

> Use the actual environment variable names provided by the project configuration.




---

3. Start the Backend

cd backend
npm install
npm start

The backend runs on:

http://localhost:5000


---

4. Start the Frontend

Open another terminal:

cd frontend
npm install
npm start

The frontend runs on:

http://localhost:3000


---

🧪 API Testing

The project includes a Postman collection for testing backend APIs.

Steps:

1. Start the backend server.


2. Open Postman.


3. Import the project's Postman collection.


4. Test authentication APIs.


5. Test employee APIs.


6. Test leave application APIs.


7. Test approval/rejection APIs.


8. Verify API responses.




---

🔐 Security Features

The application includes several security mechanisms:

JWT-based authentication.

Role-based authorization.

Password hashing using bcrypt.

Protected routes.

Backend validation.

Environment-based configuration.

CORS configuration.

Restricted access to role-specific functions.



---

📊 Reports & Analytics

The system provides an analytics dashboard containing:

Total System Requests

Approval Ratio

Active Headcount

Covered Departments

Leave Application Trends

Approved Leaves by Department

Leave Categories Breakdown

Application Status Outcomes


These reports help administrators understand leave usage and application patterns.


---

✅ Benefits of the System

Reduces manual leave management.

Saves time for employees and managers.

Centralizes employee leave information.

Provides transparent approval workflows.

Reduces errors in leave calculations.

Maintains organized leave records.

Provides quick access to leave history.

Supports role-based access.

Provides visual reports and analytics.

Improves overall leave-management efficiency.



---

🚀 Future Enhancements

Possible future improvements include:

Email notifications for leave status changes.

Mobile application.

HR payroll integration.

Calendar integration.

Advanced attendance management.

Export reports to PDF/Excel.

Multi-level approval workflows.

Automated holiday calendar integration.

Cloud deployment.

Advanced audit logs and activity tracking.



---

👨‍👩‍👧‍👦 Team Members

Member	Name	Roll Number

1	Mayank Sai	25211A05B1
2	Monika	25211A05B2
3	Purvi	25211A05B3
4	Harshith	25211A05B4
5	Nikhil Yadav	25211A05B5



---

🎓 Academic Project

This project was developed as an academic full-stack web application to demonstrate practical implementation of:

Frontend development

Backend development

REST API integration

Database management

Authentication

Authorization

CRUD operations

Form validation

Role-based access control

Business logic

Data visualization

Software testing



---

🌐 Repository

GitHub Repository:

https://github.com/25211a05b1-eng/Employment-management-system


---

⭐ Project Summary

The Employee Leave Management System provides a centralized digital platform for managing employee leave. It connects Employees, Managers, and Administrators through a structured workflow:

Employee
   ↓
Apply for Leave
   ↓
System Validation
   ↓
Manager Review
   ↓
Approve / Reject
   ↓
Update Leave Status
   ↓
Update Leave Balance
   ↓
History & Reports

The project demonstrates how a full-stack web application can combine a modern frontend, RESTful backend APIs, relational database, authentication, role-based authorization, and data visualization to create a complete employee leave-management solution.

APPLICATION OUTPUTS:
🖥️ Application Screenshots
🔐 Login Page

The login page provides secure access to the Employee Leave Management System. Users can sign in according to their assigned role.
<img width="1600" height="723" alt="image" src="https://github.com/user-attachments/assets/0653c674-beab-46db-80e6-c9f83202c094" />

📝 Apply for Leave

Employees can select the leave type, specify start and end dates, enter the reason, and provide optional handover notes before submitting a request.
<img width="1600" height="726" alt="image" src="https://github.com/user-attachments/assets/2e8eae05-ca76-4f2f-8171-6f54a0acdfed" />

📊 Reports & Leave Analytics

The reports dashboard provides graphical information about leave requests, approval ratios, departments, leave categories, and application outcomes.
<img width="1600" height="724" alt="image" src="https://github.com/user-attachments/assets/897f2858-5c18-4642-98bc-b0392d7b4939" />

👤 Admin Dashboard
<img width="1600" height="724" alt="image" src="https://github.com/user-attachments/assets/7ecb5ca5-9b1c-4925-b98d-b411d09dbe74" />

📋 Leave History & Status

Employees can view their previous leave applications, requested duration, reasons, application dates, and current status.

<img width="1600" height="726" alt="image" src="https://github.com/user-attachments/assets/09acde8f-6c4d-4627-80f6-2248a26b3242" />





