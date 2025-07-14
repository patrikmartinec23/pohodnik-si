# Step-by-Step Deployment Guide for Pohodnik Project

This guide will walk you through the process of deploying the Pohodnik application, which consists of a Node.js/Express backend, a client-side frontend, and a PostgreSQL database on Supabase.

## Prerequisites

-   GitHub account
-   Vercel account (for frontend hosting)
-   Supabase account (for database)
-   Render.com account (for backend hosting)
-   Node.js and npm installed on your local machine

## Part 1: Database Setup with Supabase

1. **Create a Supabase Project**

    - Go to [Supabase](https://supabase.com/) and sign up/log in
    - Create a new project and give it a name (e.g., "pohodnik")
    - Choose a region close to your target audience
    - Set a secure database password (keep it safe)
    - Wait for the project to be created (usually takes a minute)

2. **Set Up the Database Schema**

    - In the Supabase dashboard, go to the "SQL Editor" tab
    - Copy and paste the contents of `supabase-migration.sql` into the SQL editor
    - Run the script to create the tables

3. **Export Data from MySQL**

    - Use the MySQL Workbench or command line to export your data:
        ```
        # Export each table to a CSV file
        mysql -u root -p -e "SELECT * FROM Uporabnik INTO OUTFILE 'C:/temp/uporabnik.csv' FIELDS TERMINATED BY ',' OPTIONALLY ENCLOSED BY '\"' LINES TERMINATED BY '\n' FROM pohodniki.Uporabnik;"
        # Repeat for other tables
        ```

4. **Import Data to Supabase**

    - In the Supabase dashboard, go to "Table Editor"
    - For each table, click on the table name, then "Import Data" and upload the corresponding CSV
    - After importing all data, reset the sequences in the SQL editor:
        ```sql
        SELECT setval('uporabnik_iduporabnik_seq', (SELECT MAX(IDUporabnik) FROM Uporabnik));
        -- Repeat for all tables with SERIAL columns
        ```

5. **Get Database Connection Details**
    - In the Supabase dashboard, go to "Settings" > "Database"
    - Copy the connection string and credentials
    - Save these values for later use in environment variables

## Part 2: Backend Deployment with Render

1. **Prepare the Backend Code**

    - Create a new GitHub repository for the backend
    - Push your backend code to this repository
    - Rename `backend-package.json` to `package.json` for the backend repo
    - Make sure `server.prod.js` is your main entry file

2. **Set Up Render.com for Backend Hosting**

    - Go to [Render](https://render.com/) and sign up/log in
    - Click "New" > "Web Service"
    - Connect your GitHub repository
    - Configure the service:
        - Name: "pohodnik-backend"
        - Environment: "Node"
        - Build Command: `npm install`
        - Start Command: `npm start`
        - Instance Type: Free (or select a paid plan for production)

3. **Configure Environment Variables on Render**

    - In the Render dashboard, go to your web service
    - Click on "Environment" and add the following variables:
        ```
        NODE_ENV=production
        PORT=10000
        SUPABASE_URL=https://your-project-url.supabase.co
        SUPABASE_KEY=your-supabase-key
        DB_HOST=db.your-project-url.supabase.co
        DB_PORT=5432
        DB_USER=postgres
        DB_PASSWORD=your-postgres-password
        DB_NAME=postgres
        JWT_SECRET=generate-a-secure-random-string
        FRONTEND_URL=https://your-vercel-app.vercel.app
        ```
    - Save the changes and deploy

4. **Test the Backend**
    - After deployment, check if your backend is working by visiting:
        ```
        https://your-render-service-name.onrender.com/api/health
        ```
    - If you see `{"status":"ok"}`, your backend is running correctly

## Part 3: Frontend Deployment with Vercel

1. **Prepare the Frontend Code**

    - Update API endpoints to point to your backend:
        ```
        node update-api-endpoints.js https://your-render-service-name.onrender.com
        ```
    - Push your frontend code to a GitHub repository

2. **Deploy to Vercel**

    - Go to [Vercel](https://vercel.com/) and sign up/log in
    - Click "New Project" and import your GitHub repository
    - Configure the project:
        - Framework Preset: Other
        - Root Directory: `./` (or specify the directory with your frontend code)
        - Build Command: `npm run sass:build`
        - Output Directory: `public`
        - Install Command: `npm install`

3. **Configure Environment Variables on Vercel**

    - In the Vercel dashboard, go to your project settings
    - Click on "Environment Variables" and add:
        ```
        BACKEND_URL=https://your-render-service-name.onrender.com
        ```
    - Save and deploy

4. **Test the Frontend**
    - After deployment, visit your Vercel URL to check if the frontend is working
    - Try to log in and use the application

## Part 4: Finalizing and Testing

1. **Update CORS Settings**

    - If you have CORS issues, make sure the `FRONTEND_URL` in your backend environment variables matches your actual Vercel URL

2. **Test All Features**

    - Log in as different user types
    - Create and browse pohodi (hikes)
    - Test all CRUD operations

3. **Set Up Custom Domain (Optional)**

    - In the Vercel dashboard, go to your project settings
    - Click on "Domains" and add your custom domain
    - Follow the instructions to verify ownership and update DNS settings

4. **Monitor and Maintain**
    - Set up logging and monitoring for your backend on Render
    - Keep an eye on database usage on Supabase
    - Consider setting up backups for your database

## Troubleshooting

-   **Database Connection Issues**: Double check your environment variables and make sure your IP is allowed in Supabase settings
-   **CORS Errors**: Ensure the backend is configured to accept requests from your frontend domain
-   **404 Errors on Frontend**: Make sure your Vercel configuration correctly serves your static files
-   **Authentication Problems**: Check JWT configuration and cookie settings

## Next Steps and Improvements

-   Set up CI/CD for automated deployments
-   Implement database migrations for future schema changes
-   Add monitoring and logging
-   Set up SSL certificates and HTTPS
-   Optimize frontend assets for performance
