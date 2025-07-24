# 🕐 AttendEase - Employee Attendance Management System

[![React](https://img.shields.io/badge/React-18.0-blue.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18.0-green.svg)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.0-brightgreen.svg)](https://mongodb.com/)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.7-orange.svg)](https://socket.io/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.3-cyan.svg)](https://tailwindcss.com/)

A modern, full-stack employee attendance management system built with React, Node.js, and MongoDB. Features real-time updates, beautiful UI, and comprehensive analytics.

## ✨ Features

### 👥 Employee Features
- **User Registration & Login** with JWT authentication
- **Mark Attendance** with timestamp and location tracking
- **View Personal Records** with filtering and search
- **Profile Management** with editable information
- **Real-time Dashboard** with today's status
- **Responsive Design** for mobile and desktop

### 👨‍💼 Admin Features
- **Real-time Monitoring** with live attendance updates
- **Comprehensive Analytics** with charts and statistics
- **Employee Management** with detailed records
- **Attendance Reports** with export functionality
- **Role-based Access Control**
- **Interactive Dashboard** with key metrics

### 🛠️ Technical Features
- **Real-time Updates** via Socket.io
- **JWT Authentication** with secure token management
- **MongoDB Integration** with Mongoose ODM
- **RESTful API** with comprehensive endpoints
- **Responsive UI** with TailwindCSS
- **Data Visualization** with Recharts
- **Error Handling** with user-friendly messages
- **Demo Mode** for testing without database

## 🚀 Quick Start

### Prerequisites
- Node.js 16.0 or higher
- MongoDB 4.4 or higher (or MongoDB Atlas)
- npm or yarn package manager

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Girjesh2025/EMP_ATTND_SYS.git
cd EMP_ATTND_SYS
```

2. **Install backend dependencies**
```bash
cd backend
npm install
```

3. **Install frontend dependencies**
```bash
cd ../frontend
npm install
```

4. **Environment Setup**

**Backend (.env file in backend folder):**
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/attendance_system
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_complex
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:3000
```

**Frontend (.env file in frontend folder):**
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

5. **Start the applications**

**Backend:**
```bash
cd backend
npm run dev
```

**Frontend:**
```bash
cd frontend
npm start
```

6. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- API Demo: http://localhost:5000/api/demo

## 🗄️ Database Setup

### Option 1: Local MongoDB
1. Install MongoDB locally
2. Start MongoDB service
3. Use `mongodb://localhost:27017/attendance_system` in .env

### Option 2: MongoDB Atlas (Recommended)
1. Create account at [MongoDB Atlas](https://cloud.mongodb.com)
2. Create a new cluster
3. Get connection string and add to .env
4. Whitelist your IP address

Example Atlas connection string:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/attendance_system?retryWrites=true&w=majority
```

## 📁 Project Structure

```
EMP_ATTND_SYS/
├── backend/
│   ├── config/
│   │   └── database.js          # MongoDB connection
│   ├── middleware/
│   │   └── auth.js              # JWT authentication
│   ├── models/
│   │   ├── User.js              # User schema
│   │   └── Attendance.js        # Attendance schema
│   ├── routes/
│   │   ├── auth.js              # Authentication routes
│   │   └── attendance.js        # Attendance routes
│   ├── server.js                # Express server
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/             # Login/Register components
│   │   │   ├── common/           # Shared components
│   │   │   └── layout/           # Layout components
│   │   ├── context/
│   │   │   └── AuthContext.js    # Authentication context
│   │   ├── pages/
│   │   │   ├── admin/            # Admin dashboard pages
│   │   │   └── employee/         # Employee dashboard pages
│   │   ├── utils/
│   │   │   ├── api.js            # API client
│   │   │   └── socket.js         # Socket.io client
│   │   └── App.js
│   └── package.json
├── .gitignore
├── README.md
└── env.example
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Attendance
- `POST /api/attendance/checkin` - Mark check-in
- `PUT /api/attendance/checkout` - Mark check-out
- `GET /api/attendance/today` - Today's attendance
- `GET /api/attendance/my-records` - User records
- `GET /api/attendance/stats` - Statistics (Admin)
- `GET /api/attendance/all` - All records (Admin)

### Health Check
- `GET /health` - Server health status
- `GET /api/demo` - Demo mode status

## 🎨 Technology Stack

### Frontend
- **React 18** - UI library
- **TailwindCSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Socket.io Client** - Real-time communication
- **Recharts** - Data visualization
- **React Toastify** - Notifications
- **Lucide React** - Icons
- **Moment.js** - Date/time handling

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **Socket.io** - Real-time communication
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin requests
- **dotenv** - Environment variables

## 👤 Default Admin Account

For testing purposes, you can create an admin account:
- Email: `admin@example.com`
- Password: `admin123`
- Role: `admin`

## 🔒 Security Features

- JWT token-based authentication
- Password hashing with bcryptjs
- CORS protection
- Input validation and sanitization
- Role-based access control
- Secure environment variable handling

## 📱 UI/UX Features

- **Responsive Design** - Works on all devices
- **Modern Interface** - Clean and intuitive
- **Real-time Updates** - Live attendance tracking
- **Interactive Charts** - Visual data representation
- **Toast Notifications** - User feedback
- **Loading States** - Smooth user experience
- **Error Handling** - Graceful error messages

## 🚀 Deployment

### Frontend (Vercel)
1. Connect GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push

### Backend (Render/Heroku)
1. Create account on Render or Heroku
2. Connect GitHub repository
3. Set environment variables
4. Deploy with auto-deploy on push

### Environment Variables for Production
```env
NODE_ENV=production
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_production_jwt_secret
CLIENT_URL=https://your-frontend-domain.vercel.app
```

## 🧪 Testing

### Demo Mode
The application includes a demo mode that works without a database:
- In-memory data storage
- All features functional
- Perfect for testing and development

### Running Tests
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- React team for the amazing framework
- MongoDB team for the excellent database
- TailwindCSS for the utility-first CSS approach
- Socket.io for real-time communication
- All contributors and testers

## 📞 Support

For support, email girjesh2025@gmail.com or create an issue on GitHub.

---

**Built with ❤️ by [Girjesh](https://github.com/Girjesh2025)** 