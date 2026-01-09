# SSC CMS

A content management system for the SSC project.

## Overview

Lightweight JSON-based CMS content store for Sufi Science Explorer and Digital Academy.

Structure:
- `content/`
  - `prod/`
    - `explorer/`
    - `academy/`
    - `index/`
- `schemas/`
  - `contentItem.ts`

## Deployment

### Prerequisites
- Node.js 18+
- Vercel account for deployment

### Local Development
1. Install dependencies: `npm install`
2. Run the development server: `npm run dev`
3. Visit `http://localhost:3000`

### Environment Variables
Copy `.env.local` from `.env.example` and set your environment variables:
- `NEXT_PUBLIC_BACKEND_URL`: The backend API URL
- `NEXT_PUBLIC_WEBSITE_URL`: The frontend website URL (important for CORS)

### Production Deployment
This CMS needs to be deployed to Vercel to serve content to the frontend.

1. Push to GitHub
2. Deploy to Vercel
3. Set environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_WEBSITE_URL=https://ssc-web-pearl.vercel.app`

### Frontend Integration
After deploying this CMS, update your frontend project to fetch content from the deployed CMS URL:
- API endpoints: `https://[your-cms-deployed-url].vercel.app/api/content/[path]`
- Example: `https://[your-cms-deployed-url].vercel.app/api/content/academy/[slug]`

See `DEPLOYMENT_GUIDE.md` for complete integration instructions.

## Publishing Flow (MVP)
- Backend reads JSON files directly from the content folder
- Frontend fetches from backend endpoints: `/api/content/:path`
- S3 integration can be added later if needed

## Environment Variables
- `CONTENT_ENV=prod` (default)
- `CONTENT_BASE_PATH` can override the absolute path to `content/` if needed
