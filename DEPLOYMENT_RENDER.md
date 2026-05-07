# Deployment Guide: Render

This guide explains how to deploy the Parent-Child Communication Analyzer on Render.

## Prerequisites

- GitHub account (with the repository pushed to GitHub)
- Render account (https://render.com)
- A version of the code committed and pushed to GitHub

## Deployment Steps

### Step 1: Connect GitHub Repository to Render

1. Go to https://render.com and sign up or log in
2. Click **"New +"** and select **"Web Service"**
3. Select **"Build and deploy from a Git repository"**
4. Connect your GitHub account and authorize Render
5. Select the repository containing this project

### Step 2: Deploy the Backend

1. **Create Web Service for Backend:**
   - Name: `parent-child-analyzer-backend`
   - Environment: `Python 3`
   - Region: Choose the closest to your users (e.g., Oregon)
   - Build Command: `bash build.sh`
   - Start Command: `gunicorn communication_analyzer.wsgi:application`
   - Plan: Free or Starter (as needed)

2. **Add Environment Variables:**
   - Go to the service settings → Environment
   - Add the following:
     - `DEBUG`: `false`
     - `SECRET_KEY`: Generate a strong key (e.g., using Django's `get_random_secret_key()`)
     - `ALLOWED_HOSTS`: `*.render.com,yourdomain.com` (will auto-populate with your Render URL)
     - `CORS_ALLOWED_ORIGINS`: Will be set after frontend deployment
     - `CSRF_TRUSTED_ORIGINS`: Will be set after frontend deployment

3. **Deploy:**
   - Click **"Create Web Service"**
   - Wait for the build to complete (may take 5-10 minutes)
   - Once deployed, you'll get a URL like `https://parent-child-analyzer-backend.onrender.com`

### Step 3: Deploy the Frontend

1. **Create Static Site for Frontend:**
   - Name: `parent-child-analyzer-frontend`
   - Environment: `Static Site`
   - Region: Same as backend
   - Root Directory: `frontend`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `build`
   - Plan: Free or Starter (as needed)

2. **Add Environment Variables:**
   - Go to the service settings → Environment
   - Add:
     - `REACT_APP_API_URL`: `https://parent-child-analyzer-backend.onrender.com`

3. **Deploy:**
   - Click **"Create Static Site"**
   - Wait for the build to complete
   - You'll get a URL like `https://parent-child-analyzer-frontend.onrender.com`

### Step 4: Update Backend with Frontend URL

1. Go back to your backend service settings
2. Update the `CORS_ALLOWED_ORIGINS` environment variable to include your frontend URL:
   - `https://parent-child-analyzer-frontend.onrender.com,https://yourdomain.com`
3. Redeploy the backend

### Step 5: Test the Deployment

1. Visit `https://parent-child-analyzer-frontend.onrender.com`
2. Test the registration and login functionality
3. Check the browser console for any CORS errors
4. Monitor the backend logs for any issues

## Database Configuration

Currently, the project uses SQLite. For production, consider:

1. **PostgreSQL on Render:**
   - Create a PostgreSQL database on Render
   - Get the connection string from Render
   - Update settings.py to use PostgreSQL (psycopg2 is already in requirements.txt)
   - Add DB connection environment variables

2. **Temporary SQLite:**
   - SQLite will work but data resets on redeploy
   - Only suitable for testing/demo

## Environment Variables Summary

### Backend (.env)
```
DEBUG=false
SECRET_KEY=<generate-strong-key>
ALLOWED_HOSTS=*.render.com,yourdomain.com
CORS_ALLOWED_ORIGINS=https://parent-child-analyzer-frontend.onrender.com
```

### Frontend (.env)
```
REACT_APP_API_URL=https://parent-child-analyzer-backend.onrender.com
```

## Troubleshooting

### Build Fails
- Check build logs in Render dashboard
- Verify `build.sh` file exists and is executable
- Ensure all dependencies are in `requirements.txt`

### Static Files Not Loading
- WhiteNoise is configured to serve static files
- Ensure Django collectstatic runs (in build.sh)
- Check `STATIC_ROOT` settings

### CORS Errors
- Verify `CORS_ALLOWED_ORIGINS` includes your frontend URL
- Ensure backend has `django-cors-headers` installed
- Check frontend URL doesn't have trailing slash

### Database Migrations Fail
- Verify migrations are in version control
- Check database configuration
- Try running migrations manually in Render shell

## Custom Domain Setup (Optional)

1. Go to your Render service settings
2. Click **"Custom Domain"**
3. Add your domain (requires DNS configuration)
4. Follow Render's DNS setup instructions
5. Update `ALLOWED_HOSTS` and `CORS_ALLOWED_ORIGINS` with your custom domain

## Updating Your Application

1. Push changes to GitHub
2. Render automatically redeploys on push to main branch
3. For frontend-only changes, auto-deploy updates just the frontend
4. For backend changes, the build script runs migrations automatically

## Monitoring and Logs

- View logs in Render dashboard under "Logs"
- Enable email alerts for deployment failures
- Monitor service health from the dashboard

## Performance Optimization

- Upgrade to Starter plan for better performance
- Consider caching with Redis
- Use CDN for static files
- Optimize database queries

---

For more help, visit: https://render.com/docs
