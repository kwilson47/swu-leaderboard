#!/bin/bash

# Exit on error
set -e

echo "Resetting SWU Tournament Dashboard Database..."

# Confirm reset
read -p "⚠️ WARNING: This will delete all data managed by Prisma and re-migrate from MongoDB. Continue? [y/N]: " reset_answer
if [[ ! "$reset_answer" =~ ^[Yy]$ ]]; then
  echo "Operation cancelled."
  exit 0
fi

# Generate Prisma client if needed
echo "Generating Prisma client..."
npx prisma generate

# Reset the database collections that Prisma manages
echo "Resetting Prisma database..."
npx prisma db push --force-reset

# Run data migration to repopulate from MongoDB
echo "Re-migrating data from MongoDB..."
npm run migrate-data

echo "✅ Database reset complete! The dashboard will now reflect the current state of your MongoDB database."
echo "Run 'npm run dev' to start the development server." 