import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getLeaderboard } from '../../../lib/tournamentService'

export const metadata = {
  title: "Leaderboard | SWU Tournament Dashboard",
  description: "View the Star Wars: Unlimited tournament leaderboard rankings",
}

export default async function LeaderboardPage() {
  const leaderboard = await getLeaderboard()
  
  return (
    <div className="container py-8">
      <div className="mb-6">
        <h1 className="text-4xl font-bold">Leaderboard</h1>
        <p className="mt-2 text-muted-foreground">
          Tournament rankings based on placements (5 pts for 1st, 3 pts for 2nd, 1 pt for 3rd)
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Player Rankings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b text-left">
                  <th className="px-4 py-2 w-16">Rank</th>
                  <th className="px-4 py-2">Player</th>
                  <th className="px-4 py-2 text-center">Points</th>
                  <th className="px-4 py-2 text-center">1st</th>
                  <th className="px-4 py-2 text-center">2nd</th>
                  <th className="px-4 py-2 text-center">3rd</th>
                  <th className="px-4 py-2 text-center">Tournaments</th>
                  <th className="px-4 py-2">Match Record</th>
                  <th className="px-4 py-2">Win %</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-muted-foreground">
                      No players found
                    </td>
                  </tr>
                ) : (
                  leaderboard.map((player, index) => {
                    const matchTotal = player.matchWins + player.matchLosses + player.matchDraws;
                    const winPercentage = matchTotal > 0 
                      ? ((player.matchWins / matchTotal) * 100).toFixed(1) 
                      : "0.0";
                    
                    return (
                      <tr 
                        key={player.discordId} 
                        className="border-b hover:bg-muted/50"
                      >
                        <td className="px-4 py-3 text-center">
                          {index === 0 ? (
                            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-600 font-bold">
                              1
                            </span>
                          ) : index === 1 ? (
                            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600 font-bold">
                              2
                            </span>
                          ) : index === 2 ? (
                            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-amber-50 text-amber-800 font-bold">
                              3
                            </span>
                          ) : (
                            <span>{index + 1}</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <Link 
                            href={`/players/by-discord/${player.discordId}`}
                            className="font-medium hover:underline"
                          >
                            {player.username}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-center font-bold">
                          {player.leaderboardPoints}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {player.firstPlace > 0 ? (
                            <span className="font-medium text-amber-600">{player.firstPlace}</span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {player.secondPlace > 0 ? (
                            <span className="font-medium">{player.secondPlace}</span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {player.thirdPlace > 0 ? (
                            <span className="font-medium">{player.thirdPlace}</span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {player.tournamentsPlayed}
                        </td>
                        <td className="px-4 py-3">
                          {`${player.matchWins}-${player.matchLosses}-${player.matchDraws}`}
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