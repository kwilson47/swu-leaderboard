import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import clientPromise from '../../../lib/mongodb'

export const metadata = {
  title: "Statistics | SWU Tournament Dashboard",
  description: "Aggregate tournament statistics and data trends",
}

// Define types for the tournament data
interface Player {
  discordId: string;
  username?: string;
  matchWins?: number;
  matchLosses?: number;
  matchDraws?: number;
  gameWins?: number;
  gameLosses?: number;
  gameDraws?: number;
}

interface Match {
  player1Id?: string;
  player2Id?: string;
  player1Score?: number;
  player2Score?: number;
  winnerId?: string;
  isBye?: boolean;
}

interface Round {
  number?: number;
  matches?: Match[];
}

interface Tournament {
  _id: string | any; // Allow MongoDB ObjectId
  name: string;
  date: Date | string;
  players?: Player[];
  rounds?: Round[];
  [key: string]: any; // Allow for additional properties
}

async function getStats() {
  const client = await clientPromise;
  const db = client.db();
  
  // Count tournaments
  const totalTournaments = await db.collection('tournaments').countDocuments();
  
  // Get all players from tournaments to calculate stats
  const tournamentsData = await db.collection('tournaments').find({}).toArray();
  // Safely cast to Tournament[] as we know the structure
  const tournaments = tournamentsData as unknown as Tournament[];
  
  // Extract unique players
  const playerMap = new Map<string, {
    matchWins: number;
    matchLosses: number;
    matchDraws: number;
    gameWins: number;
    gameLosses: number;
    gameDraws: number;
  }>();
  let totalMatches = 0;
  let totalGames = 0;
  let totalDraws = 0;
  
  // Process tournament data
  tournaments.forEach(tournament => {
    if (!tournament.players || !tournament.rounds) return;
    
    // Add unique players to map
    tournament.players.forEach((player: Player) => {
      if (!player.discordId) return;
      
      if (!playerMap.has(player.discordId)) {
        playerMap.set(player.discordId, {
          matchWins: 0,
          matchLosses: 0,
          matchDraws: 0,
          gameWins: 0,
          gameLosses: 0,
          gameDraws: 0
        });
      }
      
      // Aggregate player stats
      const playerStats = playerMap.get(player.discordId)!;
      playerStats.matchWins += player.matchWins || 0;
      playerStats.matchLosses += player.matchLosses || 0;
      playerStats.matchDraws += player.matchDraws || 0;
      playerStats.gameWins += player.gameWins || 0;
      playerStats.gameLosses += player.gameLosses || 0;
      playerStats.gameDraws += player.gameDraws || 0;
    });
    
    // Count matches and games
    tournament.rounds.forEach((round: Round) => {
      if (!round.matches) return;
      
      round.matches.forEach((match: Match) => {
        // Skip byes
        if (match.isBye) return;
        
        totalMatches++;
        
        // Count games (player1Score + player2Score)
        const gamesInMatch = (match.player1Score || 0) + (match.player2Score || 0);
        totalGames += gamesInMatch;
        
        // Check for draw
        if (match.player1Score === match.player2Score) {
          totalDraws++;
        }
      });
    });
  });
  
  const totalPlayers = playerMap.size;
  const drawPercentage = totalMatches > 0 ? (totalDraws / totalMatches) * 100 : 0;
  
  return {
    totalTournaments,
    totalPlayers,
    totalMatches,
    totalGames,
    drawPercentage: Math.round(drawPercentage * 10) / 10,
    avgGamesPerMatch: totalMatches > 0 ? totalGames / totalMatches : 0
  };
}

export default async function StatsPage() {
  const stats = await getStats();
  
  return (
    <div className="container py-8">
      <h1 className="mb-6 text-4xl font-bold">Statistics</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tournaments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTournaments}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Players</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPlayers}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Matches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMatches}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Games</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(stats.totalGames)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Draw Percentage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.drawPercentage}%</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Games per Match</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(Math.round(stats.avgGamesPerMatch * 10) / 10).toFixed(1)}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-12">
        <h2 className="mb-4 text-2xl font-bold">Data Trends</h2>
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">Advanced statistics will be available soon.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 