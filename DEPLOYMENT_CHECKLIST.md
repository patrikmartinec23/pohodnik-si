# Pohodnik Deployment Checklist

Use this checklist to ensure you've completed all necessary steps for migrating your application to the cloud.

## 1. Database Migration (Supabase)

### Schema Creation

-   [ ] Created Supabase project
-   [ ] Executed `supabase-migration-updated.sql` script to create tables

### Data Import

-   [ ] Fixed CSV headers using `fix-csv-headers.js` script (output in `db_export_fixed` directory)
-   [ ] Imported tables in the correct order:
    -   [ ] Uporabnik.csv
    -   [ ] Pohodnik.csv
    -   [ ] PohodniskoDrustvo.csv
    -   [ ] Pohod.csv
    -   [ ] Clanarina.csv
    -   [ ] Prijava.csv
    -   [ ] Komentar.csv
    -   [ ] Zahteve_Za_Vclanitev.csv
    -   [ ] Ocena_Drustva.csv
    -   [ ] Fotografija.csv
-   [ ] Run `reset_sequences.sql` to fix auto-increment sequences

### Connection Verification

-   [ ] Updated `.env.production` with correct Supabase credentials
-   [ ] Ran `test-supabase-connection.js` to verify database connectivity
-   [ ] Verified record counts match the original database

## 2. Backend Deployment (Render.com)

### Preparation

-   [ ] Ensured `render.yaml` is properly configured
-   [ ] Created production-ready Node.js backend (`server.prod.js`)
-   [ ] Added environment variables to Render dashboard:
    -   [ ] DB_CLIENT
    -   [ ] DB_HOST
    -   [ ] DB_USER
    -   [ ] DB_PASSWORD
    -   [ ] DB_NAME
    -   [ ] DB_PORT
    -   [ ] JWT_SECRET
    -   [ ] SUPABASE_URL
    -   [ ] SUPABASE_KEY
    -   [ ] SUPABASE_SERVICE_KEY
    -   [ ] NODE_ENV=production
    -   [ ] PORT

### Deployment

-   [ ] Connected GitHub repository to Render
-   [ ] Deployed backend service
-   [ ] Verified API endpoints are accessible
-   [ ] Confirmed backend can connect to Supabase

## 3. Frontend Deployment (Vercel)

### Preparation

-   [ ] Ensured `vercel.json` is properly configured
-   [ ] Updated API endpoint URLs in frontend code to point to deployed backend
-   [ ] Added environment variables to Vercel dashboard:
    -   [ ] API_URL (URL to your Render backend)

### Deployment

-   [ ] Connected GitHub repository to Vercel
-   [ ] Deployed frontend
-   [ ] Tested all frontend functionality with new backend
-   [ ] Verified image uploads and retrievals work correctly

## 4. Post-Deployment Verification

### Core Functionality

-   [ ] User registration works
-   [ ] User login works
-   [ ] Creating new hikes (pohodi) works
-   [ ] Uploading images works
-   [ ] User profiles load correctly
-   [ ] Hiking club (drustva) pages load correctly

### Error Handling

-   [ ] Application handles database connection issues gracefully
-   [ ] Application handles API errors properly
-   [ ] Form validation works as expected

### Performance

-   [ ] Page load times are acceptable
-   [ ] Database queries are performing well
-   [ ] Images are loading in reasonable time

## 5. Documentation

-   [ ] Updated README.md with deployment information
-   [ ] Documented any changes made during migration
-   [ ] Added troubleshooting guide for common issues
-   [ ] Provided instructions for future updates

## Notes and Issues

Use this section to document any issues or special considerations:

-
-
-

## Next Steps

-   [ ] Set up monitoring for the application
-   [ ] Configure automatic backups for the database
-   [ ] Consider implementing CI/CD for future updates
