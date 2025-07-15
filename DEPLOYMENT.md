# Live Polling Platform - Deployment Guide

## 🚀 MongoDB Atlas Setup

### 1. Create MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Sign up for a free account
3. Create a new cluster (M0 Free tier is perfect for starting)

### 2. Configure Database
1. **Create Database User**:
   - Go to Database Access
   - Add new database user
   - Choose "Password" authentication
   - Set username and password (save these!)

2. **Configure Network Access**:
   - Go to Network Access
   - Add IP Address: `0.0.0.0/0` (allows all IPs)
   - Or add your specific IP for security

3. **Get Connection String**:
   - Go to Clusters → Connect
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your actual password

## 🌐 Deployment Options

### Option A: Railway (Recommended)

1. **Install Railway CLI**:
   ```bash
   npm install -g @railway/cli
   ```

2. **Login and Deploy**:
   ```bash
   railway login
   railway init
   railway up
   ```

3. **Set Environment Variables**:
   ```bash
   railway variables set MONGODB_URI="your-mongodb-atlas-connection-string"
   railway variables set NODE_ENV="production"
   ```

### Option B: Render

1. **Connect GitHub Repository**
2. **Create New Web Service**
3. **Configure**:
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Environment Variables:
     - `MONGODB_URI`: Your MongoDB Atlas connection string
     - `NODE_ENV`: `production`

### Option C: Heroku

1. **Install Heroku CLI**
2. **Deploy**:
   ```bash
   heroku create your-app-name
   heroku config:set MONGODB_URI="your-mongodb-atlas-connection-string"
   heroku config:set NODE_ENV="production"
   git push heroku main
   ```

### Option D: Vercel + Railway

1. **Deploy Backend to Railway** (as above)
2. **Deploy Frontend to Vercel**:
   ```bash
   npm install -g vercel
   cd client
   vercel
   ```
3. **Update Frontend API URLs** to point to your Railway backend

## 🔧 Environment Variables

Create a `.env` file in your project root:

```env
# Development
PORT=5001
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/live-polling

# Production (replace with your MongoDB Atlas connection string)
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/live-polling?retryWrites=true&w=majority
# NODE_ENV=production
```

## 📦 Production Build

1. **Build the React App**:
   ```bash
   cd client
   npm run build
   cd ..
   ```

2. **Start Production Server**:
   ```bash
   npm start
   ```

## 🔒 Security Considerations

1. **Environment Variables**: Never commit `.env` files
2. **Database Access**: Use IP whitelisting in MongoDB Atlas
3. **HTTPS**: Enable SSL in production
4. **Rate Limiting**: Consider adding rate limiting for API endpoints

## 🚨 Troubleshooting

### Common Issues:

1. **MongoDB Connection Failed**:
   - Check connection string format
   - Verify IP whitelist in MongoDB Atlas
   - Ensure database user has correct permissions

2. **Build Errors**:
   - Run `npm install` in both root and client directories
   - Check Node.js version compatibility

3. **Port Issues**:
   - Ensure ports are not in use
   - Check firewall settings

## 📊 Monitoring

1. **MongoDB Atlas**: Monitor database performance
2. **Application Logs**: Check deployment platform logs
3. **Error Tracking**: Consider adding error tracking (Sentry, etc.)

## 🔄 Updates

To update your deployed application:

1. **Push changes to GitHub**
2. **Redeploy** (automatic with Railway/Render)
3. **Or manually redeploy**:
   ```bash
   railway up
   # or
   vercel --prod
   ```

---

**Your Live Polling Platform is now production-ready! 🎉** 