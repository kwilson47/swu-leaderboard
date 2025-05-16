import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { getPlayers } from "../../../lib/tournamentService"

export const metadata = {
  title: "Players | SWU Tournament Dashboard",
  description: "Browse all SWU tournament players and their stats",
}

export default async function PlayersPage() {
  const players = await getPlayers();
  
  return (
    <div className="container py-8">
      <h1 className="mb-6 text-4xl font-bold">Players</h1>
      
      <Card>
        <CardContent className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b text-left">
                  <th className="px-4 py-2">Player</th>
                  <th className="px-4 py-2">Match Record</th>
                  <th className="px-4 py-2">Game Record</th>
                  <th className="px-4 py-2">Win %</th>
                  <th className="px-4 py-2">Tournaments</th>
                  <th className="px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {players.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                      No players found
                    </td>
                  </tr>
                ) : (
                  players.map((player) => {
                    const totalMatches = player.matchWins + player.matchLosses + player.matchDraws;
                    const winPercentage = totalMatches > 0 
                      ? ((player.matchWins / totalMatches) * 100).toFixed(1) 
                      : "0.0";
                    
                    return (
                      <tr 
                        key={player.discordId} 
                        className="border-b hover:bg-muted/50"
                      >
                        <td className="px-4 py-3">
                          <Link 
                            href={`/players/by-discord/${player.discordId}`}
                            className="font-medium hover:underline"
                          >
                            {player.username}
                          </Link>
                        </td>
                        <td className="px-4 py-3">
                          {`${player.matchWins}-${player.matchLosses}-${player.matchDraws}`}
                        </td>
                        <td className="px-4 py-3">
                          {`${player.gameWins}-${player.gameLosses}-${player.gameDraws}`}
                        </td>
                        <td className="px-4 py-3">
                          {`${winPercentage}%`}
                        </td>
                        <td className="px-4 py-3">
                          {`${player.tournamentsPlayed} played (${player.tournamentsWon} won)`}
                        </td>
                        <td className="px-4 py-3">
                          <Link 
                            href={`/players/by-discord/${player.discordId}`}
                            className="rounded-md bg-primary px-2 py-1 text-xs text-primary-foreground hover:bg-primary/90"
                          >
                            View Details
                          </Link>
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