# SWU Tournament Dashboard

A web dashboard for viewing Star Wars: Unlimited card game tournament results from the SWU Discord bot.

## Features

- View all tournaments and their details
- Browse player statistics and performance
- Track tournament standings and results
- View match history and outcomes
- Aggregate statistics for all tournaments
- Leaderboard with point-based rankings for tournament placements

## Database Structure

The dashboard now directly reads from the same MongoDB database that the Discord bot writes to. This means:

1. When the Discord bot creates or updates tournaments, they are immediately available in the dashboard
2. Deleting tournaments from MongoDB will remove them from the dashboard
3. No migration or sync process is needed

## Leaderboard System

The dashboard includes a leaderboard that ranks players based on their tournament placements:

- 5 points for 1st place finish
- 3 points for 2nd place finish
- 1 point for 3rd place finish

Tiebreakers are determined by:
1. Total points
2. Number of 1st place finishes
3. Number of 2nd place finishes
4. Number of 3rd place finishes
5. Win percentage

## Setup

1. Clone the repository
2. Run the setup script:
   ```
   bash setup.sh
   ```
3. Update your .env file with the MongoDB connection string pointing to the same database your Discord bot uses
4. Run the development server:
   ```
   npm run dev
   ```

## Environment Variables

Create a `.env` file with the following:

```
DATABASE_URL="mongodb://username:password@host:port/database?authSource=admin"
```

Make sure to use the same database URL as your Discord bot.

## Development

- The web app reads directly from the bot's original data format
- This removes the need for any migration, syncing, or data duplication

## Troubleshooting

If you don't see data in the web app:
1. Make sure your MongoDB connection string is correct and includes the database name
2. Check that you're connecting to the same database the Discord bot uses

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- MongoDB database

### Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Set up your environment variables by copying the example file:
```bash
cp .env.example .env
```

4. Edit the `.env` file with your database credentials and Discord API settings

5. Run the development server:
```bash
npm run dev
```