# Vercel Deployment Guide for Live Polling Platform

## 🚀 Step-by-Step Deployment to Vercel

### Prerequisites
1. **MongoDB Atlas Account**: You'll need a MongoDB Atlas database
2. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
3. **GitHub Account**: Your code should be in a GitHub repository

### Step 1: Set Up MongoDB Atlas

1. **Create MongoDB Atlas Account**:
   - Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Sign up for a free account
   - Create a new cluster (M0 Free tier is perfect)

2. **Configure Database**:
   - Go to Database Access → Add new database user
   - Set username and password (save these!)
   - Go to Network Access → Add IP Address: `0.0.0.0/0`
   - Go to Clusters → Connect → "Connect your application"
   - Copy the connection string

3. **Update Connection String**:
   - Replace `<password>` with your actual password
   - Replace `<dbname>` with `live-polling`

### Step 2: Deploy to Vercel

1. **Install Vercel CLI** (optional):
   ```bash
   npm install -g vercel
   ```

2. **Deploy via Vercel Dashboard** (Recommended):
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will automatically detect the configuration

3. **Or Deploy via CLI**:
   ```bash
   vercel
   ```

### Step 3: Configure Environment Variables

In your Vercel project dashboard, go to Settings → Environment Variables and add:

**Required Variables:**
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/live-polling?retryWrites=true&w=majority
NODE_ENV=production
```

**Important Notes:**
- Replace `username:password` with your actual MongoDB Atlas credentials
- Replace `cluster.mongodb.net` with your actual cluster URL
- You do NOT need to set `REACT_APP_API_URL` or `REACT_APP_SOCKET_URL` in production
- The app automatically uses relative URLs when deployed to Vercel

### Step 4: Deploy

1. **Automatic Deployment**: Vercel will automatically deploy when you push to your main branch
2. **Manual Deployment**: Use the Vercel dashboard or CLI

### Step 5: Test Your Deployment

1. **Check the URL**: Vercel will provide you with a URL like `https://your-app.vercel.app`
2. **Test Features**:
   - Create a new poll
   - Share the poll link
   - Vote on the poll
   - Check real-time updates

## 🔧 Configuration Files

### vercel.json
This file tells Vercel how to build and route your application:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "server/index.js",
      "use": "@vercel/node"
    },
    {
      "src": "client/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "build"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "server/index.js"
    },
    {
      "src": "/socket.io/(.*)",
      "dest": "server/index.js"
    },
    {
      "src": "/(.*)",
      "dest": "client/build/$1"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

### Environment Variables
- `MONGODB_URI`: Your MongoDB Atlas connection string
- `NODE_ENV`: Set to `production`

## 🚨 Troubleshooting

### Common Issues:

1. **Build Errors**:
   - Check that all dependencies are in `package.json`
   - Ensure Node.js version is compatible (14+)

2. **MongoDB Connection Issues**:
   - Verify your connection string
   - Check IP whitelist in MongoDB Atlas
   - Ensure database user has correct permissions

3. **Socket.IO Issues**:
   - Check that Socket.IO routes are properly configured
   - Verify CORS settings

4. **API 404 Errors**:
   - Ensure API routes are properly configured in `vercel.json`
   - Check that server is running correctly

### Debugging:

1. **Check Vercel Logs**:
   - Go to your project dashboard
   - Click on a deployment
   - Check "Functions" tab for server logs

2. **Test Locally**:
   ```bash
   npm run build
   npm start
   ```

## 🔄 Updates

To update your deployed application:

1. **Push to GitHub**: Your changes will automatically deploy
2. **Manual Deploy**: Use Vercel dashboard or CLI
3. **Rollback**: Use Vercel dashboard to rollback to previous versions

## 📊 Monitoring

1. **Vercel Analytics**: Built-in analytics in your dashboard
2. **MongoDB Atlas**: Monitor database performance
3. **Error Tracking**: Consider adding Sentry for error tracking

## 🎉 Success!

Your Live Polling Platform is now deployed and accessible worldwide! 

**Next Steps**:
- Set up a custom domain (optional)
- Configure monitoring and alerts
- Set up automated backups for your database

---

**Your app is live at**: `https://your-app.vercel.app` 