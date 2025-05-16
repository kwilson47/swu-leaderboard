#!/bin/bash

# Exit on error
set -e

echo "Setting up SWU Tournament Dashboard..."

# Install dependencies
echo "Installing dependencies..."
npm install

# Check if .env file exists
if [ ! -f .env ]; then
  echo "Creating .env file from example..."
  cp .env.example .env
  echo "Please update your .env file with the correct credentials before continuing."
  echo "Press any key to continue once you've updated the .env file..."
  read -n 1
fi

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

# Ask about resetting the database
read -p "Do you want to reset the Prisma database? This will clear all Prisma data and re-migrate from MongoDB. [y/N]: " reset_answer
if [[ "$reset_answer" =~ ^[Yy]$ ]]; then
  echo "Resetting Prisma database..."
  # Reset the database collections that Prisma manages
  npx prisma db push --force-reset
  
  # Run data migration to repopulate from MongoDB
  echo "Re-migrating data from MongoDB..."
  npm run migrate-data
else
  echo "Skipping database reset."
  
  # Push schema to database
  echo "Pushing database schema..."
  npx prisma db push
fi

# Data migration
read -p "Do you want to migrate existing MongoDB data to Prisma format? (required for first setup) [Y/n]: " answer
if [[ "$answer" =~ ^[Nn]$ ]]; then
  echo "Skipping data migration."
else
  echo "Migrating existing data from MongoDB to Prisma format..."
  npm run migrate-data
fi

# Ask about seeding
read -p "Do you want to seed the database with sample data? (Only needed for fresh development databases) [y/N]: " answer
if [[ "$answer" =~ ^[Yy]$ ]]; then
  echo "Seeding database with initial data..."
  npm run seed
else
  echo "Skipping database seeding. Using existing data."
fi

echo "Setup complete! Run 'npm run dev' to start the development server." 