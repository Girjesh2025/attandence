# 🚀 Deploying AttendEase to Vercel

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Account**: Your code should be in a GitHub repository
3. **MongoDB Atlas**: For production database (free tier available)

## 📋 Step-by-Step Deployment

### 1. Prepare Your Repository

```bash
# Commit all changes
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### 2. Deploy to Vercel

#### Option A: Vercel CLI (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from project root
vercel

# Follow the prompts:
# - Set up and deploy? Y
# - Which scope? (select your account)
# - Link to existing project? N
# - Project name: attendease-system
# - Directory: ./
# - Override settings? N
```

#### Option B: Vercel Dashboard
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Configure settings:
   - **Framework Preset**: Create React App
   - **Root Directory**: ./
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`

### 3. Configure Environment Variables

In Vercel Dashboard → Project → Settings → Environment Variables, add:

```env
NODE_ENV=production
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_super_secret_jwt_key_for_production
JWT_EXPIRE=7d
```

### 4. Set up MongoDB Atlas (Production Database)

1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create a free cluster
3. Set up database access (username/password)
4. Add your IP to whitelist (0.0.0.0/0 for Vercel)
5. Get connection string and add to Vercel environment variables

### 5. Update CORS Settings

In your Vercel dashboard, note your app URL (e.g., `https://attendease-system.vercel.app`)

Update `api/server.js` line 16:
```javascript
'https://your-actual-vercel-url.vercel.app'
```

### 6. Test Deployment

After deployment, test these URLs:
- Frontend: `https://your-app.vercel.app`
- API Health: `https://your-app.vercel.app/api/health`
- API Demo: `https://your-app.vercel.app/api/demo`

## 🔧 Troubleshooting

### Common Issues:

1. **Build Failures**: Check build logs in Vercel dashboard
2. **API 404 Errors**: Verify `vercel.json` configuration
3. **CORS Errors**: Update allowed origins in `api/server.js`
4. **Database Connection**: Verify MongoDB Atlas connection string

### Environment-Specific Settings:

- **Development**: Uses local MongoDB
- **Production**: Uses MongoDB Atlas
- **API Base URL**: Automatically configured based on environment

## 📁 Project Structure for Vercel

```
attendease-system/
├── api/                    # Serverless functions
│   └── server.js          # Main API entry point
├── backend/               # Original backend code
├── src/                   # React frontend
├── build/                 # Production build (generated)
├── vercel.json           # Vercel configuration
├── .env.production       # Production environment variables
└── package.json          # Dependencies and scripts
```

## 🌐 Custom Domain (Optional)

1. In Vercel Dashboard → Project → Domains
2. Add your custom domain
3. Configure DNS records as instructed
4. SSL certificate is automatically provisioned

## 📊 Monitoring

- **Analytics**: Available in Vercel Dashboard
- **Function Logs**: Real-time logs for API endpoints
- **Performance**: Built-in monitoring and alerts

## 🔒 Security Considerations

1. **Environment Variables**: Never commit sensitive data
2. **CORS**: Configure properly for your domain
3. **MongoDB**: Use strong passwords and IP whitelisting
4. **JWT Secret**: Use a strong, unique secret for production

## 🚀 Deployment Complete!

Your AttendEase system is now live on Vercel with:
- ✅ React frontend
- ✅ Serverless API backend
- ✅ MongoDB database
- ✅ Real-time functionality
- ✅ Global CDN
- ✅ Automatic HTTPS

Enjoy your production attendance management system! 