# Development and Production Environment Setup for Pohodnik

This guide explains how to set up development and production environments for the Pohodnik application.

## Development Environment

1. **Install Dependencies**

    ```bash
    npm install
    ```

2. **Set Up Environment Variables**

    - Create a `.env` file in the root directory with the following content:

    ```
    # Development Environment Variables
    NODE_ENV=development
    PORT=3000

    # MySQL configuration
    DB_HOST=localhost
    DB_USER=root
    DB_PASSWORD=your_password
    DB_NAME=pohodniki

    # JWT Secret for authentication
    JWT_SECRET=your_development_secret
    ```

3. **Set Up MySQL Database**

    - Install MySQL if not already installed
    - Create a database named `pohodniki`
    - Run the SQL script to create tables:

    ```bash
    mysql -u root -p pohodniki < Pohodnik_Baza.sql
    ```

4. **Start Development Server**

    ```bash
    npm start
    ```

5. **Access the Application**
    - Frontend: `http://localhost:3000`
    - API: `http://localhost:3000/api`

## Production Environment

For production deployment, follow these steps:

1. **Split Backend and Frontend**

    - Backend: Use `server.prod.js` and `backend-package.json`
    - Frontend: Deploy the `public` folder separately

2. **Set Up Supabase Database**

    - Follow the instructions in the `DEPLOYMENT_GUIDE.md` file to set up your Supabase database
    - Run `supabase-migration.sql` to create the schema

3. **Deploy Backend**

    - Use a service like Render.com to deploy the backend
    - Configure environment variables as per `.env.production`

4. **Deploy Frontend**

    - Use Vercel to deploy the frontend
    - Run `node update-api-endpoints.js https://your-backend-url.com` before deploying

5. **Connect Frontend and Backend**
    - Update CORS settings to allow requests from your frontend domain
    - Set the `BACKEND_URL` environment variable in Vercel

## Switching Between Environments

To switch between development and production code:

1. **For the backend:**

    - Development: `npm run dev` (uses `server.js`)
    - Production: `npm start` (uses `server.prod.js`)

2. **For the database:**

    - Development: Uses local MySQL (configured in `.env`)
    - Production: Uses Supabase PostgreSQL (configured in `.env.production`)

3. **For the frontend:**
    - Development: Served by Express from the `public` folder
    - Production: Served by Vercel as static files

## Important Notes

-   Never commit sensitive information like database passwords or JWT secrets to your repository
-   Use different JWT secrets for development and production
-   Regularly backup your production database
-   Monitor your production environment for errors and performance issues
