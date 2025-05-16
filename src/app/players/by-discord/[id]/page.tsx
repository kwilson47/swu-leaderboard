import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { format } from 'date-fns'
import { getPlayerById, getPlayerHeadToHead } from '../../../../../lib/tournamentService'

export async function generateMetadata({ params }: { params: { id: string } }) {
  const player = await getPlayerById(params.id)
  
  if (!player) {
    return {
      title: "Player Not Found",
      description: "The player you're looking for doesn't exist."
    }
  }
  
  return {
    title: `${player.username} | SWU Tournament Dashboard`,
    description: `View tournament history and statistics for ${player.username}.`
  }
}

export default async function PlayerDetailPage({ params }: { params: { id: string } }) {
  const player = await getPlayerById(params.id)
  const headToHeadRecords = await getPlayerHeadToHead(params.id)
  
  if (!player) {
    notFound()
  }
  
  // Calculate win percentage
  const totalMatches = player.matchWins + player.matchLosses + player.matchDraws
  const winPercentage = totalMatches > 0 
    ? ((player.matchWins / totalMatches) * 100).toFixed(1) 
    : "0.0"
  
  const gameTotal = player.gameWins + player.gameLosses + player.gameDraws
  const gameWinPercentage = gameTotal > 0 
    ? ((player.gameWins / gameTotal) * 100).toFixed(1) 
    : "0.0"
  
  return (
    <div className="container py-8">
      <div className="mb-6 flex flex-col gap-1">
        <Link 
          href="/players" 
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to players
        </Link>
        <h1 className="text-4xl font-bold">{player.username}</h1>
        <p className="text-lg text-muted-foreground">
          {player.tournamentsPlayed} tournaments played • {player.tournamentsWon} tournaments won
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 mb-6">
        {/* Player Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Player Stats (All Tournaments)</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Match Record</dt>
                <dd className="text-2xl font-bold">
                  {player.matchWins}-{player.matchLosses}-{player.matchDraws}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Game Record</dt>
                <dd className="text-2xl font-bold">
                  {player.gameWins}-{player.gameLosses}-{player.gameDraws}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Match Win %</dt>
                <dd className="text-2xl font-bold">{winPercentage}%</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Game Win %</dt>
                <dd className="text-2xl font-bold">{gameWinPercentage}%</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Tournaments Played</dt>
                <dd className="text-2xl font-bold">{player.tournamentsPlayed}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Tournaments Won</dt>
                <dd className="text-2xl font-bold">{player.tournamentsWon}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
        
        {/* Best Finishes */}
        <Card>
          <CardHeader>
            <CardTitle>Best Tournament Finishes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {player.tournamentHistory
                .filter(t => t.rank <= 3)
                .sort((a, b) => a.rank - b.rank)
                .slice(0, 4)
                .map(tournament => (
                  <div 
                    key={tournament.tournamentId.toString()}
                    className="flex items-center justify-between rounded-md border p-3 hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-2">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-full
                        ${tournament.rank === 1 ? 'bg-amber-100 text-amber-600' : 
                          tournament.rank === 2 ? 'bg-slate-100 text-slate-600' : 
                            'bg-amber-50 text-amber-800'}`}
                      >
                        {tournament.rank}
                      </div>
                      <div>
                        <div className="font-medium">
                          <Link href={`/tournaments/${tournament.tournamentId}`} className="hover:underline">
                            {tournament.name}
                          </Link>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {format(new Date(tournament.date), 'PP')}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm font-medium">
                      {tournament.matchWins}-{tournament.matchLosses}-{tournament.matchDraws}
                    </div>
                  </div>
                ))}
              
              {player.tournamentHistory.filter(t => t.rank <= 3).length === 0 && (
                <div className="py-8 text-center text-muted-foreground">
                  No top 3 finishes yet
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Full Tournament History */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Tournament History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b text-left">
                  <th className="px-4 py-2">Tournament</th>
                  <th className="px-4 py-2">Date</th>
                  <th className="px-4 py-2">Rank</th>
                  <th className="px-4 py-2">Players</th>
                  <th className="px-4 py-2">Match Record</th>
                  <th className="px-4 py-2">Game Record</th>
                  <th className="px-4 py-2">Points</th>
                </tr>
              </thead>
              <tbody>
                {player.tournamentHistory.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                      No tournament history
                    </td>
                  </tr>
                ) : (
                  player.tournamentHistory.map((tournament) => (
                    <tr 
                      key={tournament.tournamentId.toString()} 
                      className="border-b hover:bg-muted/50"
                    >
                      <td className="px-4 py-3">
                        <Link 
                          href={`/tournaments/${tournament.tournamentId}`}
                          className="font-medium hover:underline"
                        >
                          {tournament.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {format(new Date(tournament.date), 'PP')}
                      </td>
                      <td className="px-4 py-3">
                        {tournament.rank === 1 ? (
                          <span className="font-bold text-amber-500">1st</span>
                        ) : tournament.rank === 2 ? (
                          <span className="font-bold text-slate-400">2nd</span>
                        ) : tournament.rank === 3 ? (
                          <span className="font-bold text-amber-700">3rd</span>
                        ) : (
                          <span>{tournament.rank}th</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {tournament.playerCount}
                      </td>
                      <td className="px-4 py-3">
                        {`${tournament.matchWins}-${tournament.matchLosses}-${tournament.matchDraws}`}
                      </td>
                      <td className="px-4 py-3">
                        {`${tournament.gameWins}-${tournament.gameLosses}-${tournament.gameDraws}`}
                      </td>
                      <td className="px-4 py-3">
                        {tournament.points}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      
      {/* Head-to-Head Records */}
      <Card>
        <CardHeader>
          <CardTitle>Player vs. Player Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b text-left">
                  <th className="px-4 py-2">Opponent</th>
                  <th className="px-4 py-2">Match Record</th>
                  <th className="px-4 py-2">Game Record</th>
                  <th className="px-4 py-2">Win %</th>
                </tr>
              </thead>
              <tbody>
                {headToHeadRecords.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                      No head-to-head records found
                    </td>
                  </tr>
                ) : (
                  headToHeadRecords.map((record, index) => {
                    // Calculate win percentage including draws in total matches
                    const totalMatches = record.matchWins + record.matchLosses + record.matchDraws;
                    const winPercentage = totalMatches > 0 
                      ? ((record.matchWins / totalMatches) * 100).toFixed(1) 
                      : "0.0";
                    
                    return (
                      <tr 
                        key={index} 
                        className="border-b hover:bg-muted/50"
                      >
                        <td className="px-4 py-3">
                          <Link 
                            href={`/players/by-discord/${record.discordId}`}
                            className="font-medium hover:underline"
                          >
                            {record.username}
                          </Link>
                        </td>
                        <td className="px-4 py-3">
                          {`${record.matchWins}-${record.matchLosses}-${record.matchDraws}`}
                        </td>
                        <td className="px-4 py-3">
                          {`${record.gameWins}-${record.gameLosses}`}
                        </td>
                        <td className="px-4 py-3">
                          {`${winPercentage}%`}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 