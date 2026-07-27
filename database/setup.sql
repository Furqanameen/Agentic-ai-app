-- Create the application database
CREATE DATABASE supplier_ai_agent;


-- run this now
-- psql -U furqan -d postgres -h localhost -f database/setup.sql

-- test your database
-- psql -U furqan -d supplier_ai_agent -h localhost


-- run this to create tables.
-- npx prisma migrate dev --name init