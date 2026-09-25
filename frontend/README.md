# Gym Management System

A full-stack Gym Management System developed to manage gym members, trainers, equipment, workouts, attendance, payments, and membership plans through a secure admin dashboard.

## Features

- Admin Login
- JWT Authentication
- Protected Routes
- Dashboard with live database data
- Member Management
- Membership Plan Management
- Attendance Management
- Workout Management
- Payment Management
- Equipment Management
- Trainer Management
- Search functionality
- Add, Edit and Delete operations
- Role-based access control
- MySQL database integration
- Responsive React user interface

## Technologies Used

### Frontend
- React.js
- Vite
- React Router
- Axios
- HTML
- CSS
- JavaScript

### Backend
- Java
- Spring Boot
- Spring Data JPA
- Spring Security
- JWT Authentication
- Maven

### Database
- MySQL

## Project Modules

### Dashboard
Displays important gym statistics such as:

- Total Members
- Total Payments
- Active Workouts
- Attendance

### Members
Manage gym members with add, edit, delete and search functionality.

### Membership Plans
Manage available gym membership plans.

### Attendance
Record and manage member attendance.

### Workouts
Manage workout sessions associated with gym members.

### Payments
Record and manage gym payments.

### Equipment
Manage gym equipment inventory including:

- Equipment name
- Category
- Quantity
- Condition
- Purchase date

### Trainers
Manage gym trainers including:

- Name
- Email
- Phone
- Specialization

## Authentication

The application uses JWT-based authentication.

After successful login:

1. The backend validates the username and password.
2. A JWT access token is generated.
3. A refresh token is generated.
4. Tokens are stored in the frontend.
5. Protected pages can be accessed after authentication.

## Project Structure

### Frontend

```text
frontend/
├── public/
├── src/
│   ├── assets/
│   ├── pages/
│   ├── services/
│   │   └── api.js
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── main.jsx
├── index.html
├── package.json
├── vite.config.js
└── README.md