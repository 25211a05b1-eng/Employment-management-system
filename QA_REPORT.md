# Final QA Report

Date: 2026-09-27

## Verified
- Complete frontend/backend/database/Postman project structure is present.
- Production frontend compilation succeeds with webpack.
- Frontend development server starts successfully on port 3000.
- Backend starts successfully on port 5000.
- `GET /api` returns HTTP 200 with the expected success response.
- React history fallback is configured.
- API routes cover authentication, employees, departments, leave types, leave balances, leave requests and dashboards.
- MySQL schema contains all core tables, foreign keys and indexes.
- Seed data contains Admin, Manager and Employee demo accounts.
- Postman collection is included.

## Environment limitation
This verification environment does not contain a MySQL/MariaDB server, so live database CRUD/login/approval transactions could not be executed here. The supplied schema and seed files are ready for execution on the target machine.

## Result
Application source/build and HTTP smoke checks: PASS.
Database-dependent end-to-end execution: requires MySQL/MariaDB running on the target machine.
