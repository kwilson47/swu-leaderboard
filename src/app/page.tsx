import Link from 'next/link'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { getTournamentCount, getPlayerCount, getRecentTournaments, getLeaderboard } from '../../lib/tournamentService'
import { ObjectId } from 'mongodb'

export const metadata = {
  title: 'SWU Tournament Dashboard',
  description: 'Track tournament results, player statistics, and match outcomes',
}

// Define types for the homepage
interface TournamentDisplay {
  _id: string | ObjectId;
  name: string;
  date: Date | string;
  playerCount: number;
  status?: string;
  players?: Array<{
    discordId: string;
    username: string;
    rank?: number;
  }>;
}

export default async function Home() {
  const tournamentCount = await getTournamentCount()
  const playerCount = await getPlayerCount()
  const recentTournaments = await getRecentTournaments(3)
  const leaderboard = await getLeaderboard()
  const topPlayers = leaderboard.slice(0, 3)

  return (
    <main className="container mx-auto py-8 px-4">
      <div className="flex flex-col items-center justify-center mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight mb-4">SWU Tournament Dashboard</h1>
        <p className="text-xl text-muted-foreground max-w-2xl">
          Track tournament results, player statistics, and match outcomes for Star Wars: Unlimited tournaments.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <Card>
          <CardHeader>
            <CardTitle>Tournaments</CardTitle>
            <CardDescription>Browse all tournaments</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{tournamentCount}</p>
            <p className="text-muted-foreground">Total tournaments in database</p>
          </CardContent>
          <CardFooter>
            <Link href="/tournaments" className="text-blue-600 hover:underline">View all tournaments</Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Players</CardTitle>
            <CardDescription>Browse player statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{playerCount}</p>
            <p className="text-muted-foreground">Registered players</p>
          </CardContent>
          <CardFooter>
            <Link href="/players" className="text-blue-600 hover:underline">View all players</Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Leaderboard</CardTitle>
            <CardDescription>Tournament rankings</CardDescription>
          </CardHeader>
          <CardContent>
            {topPlayers.length > 0 ? (
              <ul className="space-y-2">
                {topPlayers.map((player, index) => (
                  <li key={player.discordId} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className={`inline-flex h-6 w-6 mr-2 items-center justify-center rounded-full 
                        ${index === 0 ? 'bg-amber-100 text-amber-600' : 
                          index === 1 ? 'bg-slate-100 text-slate-600' : 
                          'bg-amber-50 text-amber-800'} text-xs font-bold`}>
                        {index + 1}
                      </span>
                      <Link href={`/players/by-discord/${player.discordId}`} className="hover:underline">
                        {player.username}
                      </Link>
                    </div>
                    <span className="font-medium">{player.leaderboardPoints} pts</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">No players ranked yet</p>
            )}
          </CardContent>
          <CardFooter>
            <Link href="/leaderboard" className="text-blue-600 hover:underline">View full leaderboard</Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Statistics</CardTitle>
            <CardDescription>Tournament data and trends</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-lg">Analyze tournament data</p>
            <p className="text-muted-foreground">View match and game statistics</p>
          </CardContent>
          <CardFooter>
            <Link href="/stats" className="text-blue-600 hover:underline">View statistics</Link>
          </CardFooter>
        </Card>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Recent Tournaments</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentTournaments.map((tournament: any) => (
            <Card key={String(tournament._id)}>
              <CardHeader>
                <CardTitle>{tournament.name}</CardTitle>
                <CardDescription>{new Date(tournament.date).toLocaleDateString()}</CardDescription>
              </CardHeader>
              <CardContent>
                <p>{tournament.playerCount} players</p>
                {tournament.status === 'complete' && tournament.players && tournament.players.some((p: any) => p.rank === 1) && (
                  <p className="mt-2">
                    Winner: <span className="text-amber-600 font-medium">
                      {tournament.players.find((p: any) => p.rank === 1)?.username || 'Unknown'}
                    </span>
                  </p>
                )}
              </CardContent>
              <CardFooter>
                <Link href={`/tournaments/${tournament._id}`} className="text-blue-600 hover:underline">
                  View details
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </main>
  )
} 