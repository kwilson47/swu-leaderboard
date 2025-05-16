import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { prisma } from "@/lib/prisma"

export const metadata = {
  title: "Statistics | SWU Tournament Dashboard",
  description: "Aggregate tournament statistics and data trends",
}

async function getStats() {
  const totalTournaments = await prisma.tournament.count();
  const totalPlayers = await prisma.player.count();
  const totalMatches = await prisma.match.count();
  
  const players = await prisma.player.findMany({
    select: {
      matchWins: true,
      matchLosses: true,
      matchDraws: true,
      gameWins: true,
      gameLosses: true,
      gameDraws: true
    }
  });
  
  // Calculate aggregate statistics
  const totalGames = players.reduce((acc, player) => acc + player.gameWins + player.gameLosses + player.gameDraws, 0) / 2;
  const totalMatchesPlayed = players.reduce((acc, player) => acc + player.matchWins + player.matchLosses + player.matchDraws, 0) / 2;
  const drawPercentage = players.reduce((acc, player) => acc + player.matchDraws, 0) / (totalMatchesPlayed * 2) * 100;
  
  return {
    totalTournaments,
    totalPlayers,
    totalMatches,
    totalGames,
    totalMatchesPlayed,
    drawPercentage: Math.round(drawPercentage * 10) / 10
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
              {stats.totalMatchesPlayed > 0 
                ? (Math.round((stats.totalGames / stats.totalMatchesPlayed) * 10) / 10).toFixed(1) 
                : "0.0"}
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