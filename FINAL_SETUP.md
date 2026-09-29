# Employee Leave Management System — Final Setup

## Technology stack
- Frontend: React 17, React Router 6, Bootstrap 5, Chart.js
- Backend: Node.js, Express.js, REST API
- Database: MySQL / MariaDB
- Authentication: JWT + bcryptjs
- API testing: Postman

## Database
1. Start MySQL/MariaDB.
2. Execute `database/schema.sql`.
3. Execute `database/seed.sql`.
4. Check `backend/.env` and set DB credentials if required.

## Backend
```bash
cd backend
npm install
npm start
```
Backend: http://localhost:5000
Health check: http://localhost:5000/api

## Frontend
```bash
cd frontend
npm install
npm start
```
Frontend: http://localhost:3000

## Demo accounts
- Admin: `admin@company.com` / `Admin@123`
- Manager: `manager.eng@company.com` / `Manager@123`
- Employee: `rahul.verma@company.com` / `Employee@123`

## Main workflows
Employee: login → dashboard → apply leave → history/balance.
Manager: login → dashboard → team requests → approve/reject.
Admin: employees, departments, leave types, balances, reports and requests.

## Postman
Import `postman/Employee_Leave_Management_System.postman_collection.json` after starting the backend.
