# Deployment Guide for SSC CMS & Frontend

## Architecture Overview
- **Frontend**: Deployed at `https://ssc-web-pearl.vercel.app`
- **CMS Backend**: This project (needs to be deployed to access content)

## Required Deployments

### 1. Deploy the CMS Backend
You need to deploy this CMS project to Vercel to get a public URL:

1. Push this project to a GitHub repository
2. Deploy to Vercel: `https://vercel.com/new`
3. Connect your GitHub repository
4. After deployment, you'll get a URL like: `https://[your-project-name].vercel.app`

### 2. Configure Frontend Environment Variables
After deploying the CMS, you need to update the frontend to use the CMS URL:

In the **frontend project**, you need to set the CMS API URL in environment variables or configuration files.

The frontend needs to access content from:
- `https://[your-cms-deployed-url].vercel.app/api/content/academy/[slug]`
- `https://[your-cms-deployed-url].vercel.app/api/content/explorer/[slug]`
- etc.

### 3. Vercel Environment Variables for CMS
In your deployed CMS project settings on Vercel, set these environment variables:

```
NEXT_PUBLIC_WEBSITE_URL=https://ssc-web-pearl.vercel.app
```

## Frontend Configuration
The frontend likely has a configuration file that specifies where to fetch content from. You'll need to update it to point to your deployed CMS URL.

## Example API Calls from Frontend
The frontend probably makes calls like:
```javascript
// Instead of localhost
fetch('https://[your-cms-deployed-url].vercel.app/api/content/academy/some-slug')

// Instead of other backend
fetch('https://[your-cms-deployed-url].vercel.app/api/content/explorer/some-slug')
```

## Troubleshooting
- If you still see "Using fallback data due to network failure", check:
  1. Is the CMS deployed and accessible at its URL?
  2. Are the frontend API calls pointing to the correct CMS URL?
  3. Are the environment variables correctly set in both deployments?

## Test Endpoints
After deployment, you can test these endpoints directly:
- `https://[your-cms-deployed-url].vercel.app/api/content/academy`
- `https://[your-cms-deployed-url].vercel.app/api/content/test.json` (for testing)