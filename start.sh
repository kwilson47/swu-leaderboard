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
  echo "Please update your .env file with the correct credentials."
fi

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

# Start development server
echo "Starting development server..."
npm run dev 