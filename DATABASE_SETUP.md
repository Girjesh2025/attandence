# 🗄️ Database Setup Guide for AttendEase

## 🚀 Quick Setup with MongoDB Atlas (Recommended)

### Step 1: Create MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Click "Start Free" and create an account
3. Verify your email address

### Step 2: Create a New Cluster
1. Click "Build a Database"
2. Choose **Shared (Free)** option
3. Select **M0 Sandbox** (Free tier)
4. Choose a cloud provider and region (closest to you)
5. Name your cluster (e.g., "AttendEase-Cluster")
6. Click "Create Cluster"

### Step 3: Create Database User
1. Go to "Database Access" in the left sidebar
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Set username: `attendease_user`
5. Generate a secure password (save it!)
6. Set permissions to "Read and write to any database"
7. Click "Add User"

### Step 4: Configure Network Access
1. Go to "Network Access" in the left sidebar
2. Click "Add IP Address"
3. For development: Click "Allow Access from Anywhere" (0.0.0.0/0)
4. For production: Add your specific IP addresses
5. Click "Confirm"

### Step 5: Get Connection String
1. Go to "Database" in the left sidebar
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Select "Node.js" and version "4.1 or later"
5. Copy the connection string

Example connection string:
```
mongodb+srv://attendease_user:<password>@attendease-cluster.xxxxx.mongodb.net/attendance_system?retryWrites=true&w=majority
```

### Step 6: Update Environment Variables

**Backend (.env file):**
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://attendease_user:YOUR_PASSWORD@attendease-cluster.xxxxx.mongodb.net/attendance_system?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_complex_for_production_use_2024
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:3000
```

**Frontend (.env file):**
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

## 🔧 Alternative: Local MongoDB Setup

### Step 1: Install MongoDB Locally
**macOS (using Homebrew):**
```bash
brew tap mongodb/brew
brew install mongodb-community@7.0
```

**Windows:**
1. Download MongoDB from [official website](https://www.mongodb.com/try/download/community)
2. Follow the installation wizard
3. Install MongoDB as a service

**Ubuntu:**
```bash
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | sudo gpg --dearmor -o /etc/apt/trusted.gpg.d/mongodb.gpg
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu $(lsb_release -cs)/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
```

### Step 2: Start MongoDB Service
**macOS:**
```bash
brew services start mongodb/brew/mongodb-community@7.0
```

**Windows:**
MongoDB should start automatically as a service

**Ubuntu:**
```bash
sudo systemctl start mongod
sudo systemctl enable mongod
```

### Step 3: Update Environment Variables
```env
MONGODB_URI=mongodb://localhost:27017/attendance_system
```

## 🧪 Testing Database Connection

### Step 1: Start Backend Server
```bash
cd backend
npm run dev
```

### Step 2: Check Console Output
You should see:
```
🚀 Server running on port 5000
✅ MongoDB Connected: cluster-name.xxxxx.mongodb.net
```

### Step 3: Test API Endpoints
```bash
# Health check
curl http://localhost:5000/health

# Demo endpoint
curl http://localhost:5000/api/demo
```

## 🔐 Security Best Practices

### For Development:
- Use strong passwords
- Limit IP access when possible
- Keep connection strings in .env files
- Never commit .env files to Git

### For Production:
- Use environment variables on hosting platforms
- Enable MongoDB Atlas IP whitelisting
- Use strong JWT secrets
- Enable MongoDB Atlas monitoring and backups
- Consider using MongoDB Atlas dedicated clusters

## 🚀 Deployment Database Configuration

### Vercel (Frontend)
Environment Variables:
```
REACT_APP_API_URL=https://your-backend-domain.herokuapp.com/api
REACT_APP_SOCKET_URL=https://your-backend-domain.herokuapp.com
```

### Heroku/Render (Backend)
Environment Variables:
```
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/attendance_system
JWT_SECRET=your_production_jwt_secret_very_long_and_complex
JWT_EXPIRE=7d
CLIENT_URL=https://your-frontend-domain.vercel.app
```

## 🔧 Troubleshooting

### Common Issues:

1. **"MongooseError: Operation `users.findOne()` buffering timed out"**
   - Check internet connection
   - Verify connection string
   - Check IP whitelist in MongoDB Atlas

2. **"MongoParseError: Invalid connection string"**
   - Ensure password doesn't contain special characters (URL encode if needed)
   - Check cluster name and region

3. **"Authentication failed"**
   - Verify username and password
   - Check database user permissions

4. **"Connection refused"**
   - For local MongoDB: Ensure MongoDB service is running
   - For Atlas: Check network access settings

### Getting Help:
- Check MongoDB Atlas documentation
- Verify network connectivity
- Use MongoDB Compass for GUI database management
- Check server logs for detailed error messages

## 📈 Database Management

### Recommended Tools:
1. **MongoDB Compass** - Official GUI tool
2. **MongoDB Atlas Dashboard** - Web-based management
3. **Studio 3T** - Advanced MongoDB IDE
4. **Robo 3T** - Lightweight MongoDB manager

### Monitoring:
- Enable MongoDB Atlas monitoring
- Set up alerts for performance issues
- Monitor database size and connection limits
- Regular backups (automatic in Atlas)

---

**🎯 Once your database is connected, restart your backend server and you'll see real data persistence instead of demo mode!** 