# Deployment instructions for the Pohodnik application

## Database Setup (Supabase)

1. Create a Supabase account at https://supabase.com
2. Create a new project
3. Get your connection details from the project dashboard
4. Run the database migration:
    - Export your MySQL database: `mysqldump -u root -p pohodniki > mysql-export.sql`
    - Convert MySQL export to PostgreSQL format (use the `supabase-migration.sql` as a guide)
    - Run the migration script in the Supabase SQL editor

## Backend Deployment (Render.com or similar)

1. Create an account at https://render.com
2. Create a new Web Service
3. Connect to your GitHub repository
4. Configure the service:
    - Build Command: `npm install`
    - Start Command: `npm run server`
    - Environment Variables: Copy from `.env.production` and update with your actual values

## Frontend Deployment (Vercel)

1. Create an account at https://vercel.com
2. Install Vercel CLI: `npm i -g vercel`
3. Login to Vercel: `vercel login`
4. Deploy the frontend: `vercel`
5. Configure environment variables in Vercel dashboard

## Connecting Everything

1. Update the `BACKEND_URL` environment variable in Vercel to point to your backend service
2. Update the `FRONTEND_URL` environment variable in your backend service to allow CORS from your Vercel domain

## CORS Configuration

Make sure to update the CORS configuration in your backend to allow requests from your Vercel frontend domain.
