import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"

async function getPlayers() {
  // Fetch players with their tournament standings
  const players = await prisma.player.findMany({
    include: {
      standings: true
    },
    take: 100
  })
  
  // Process players to calculate aggregated stats
  const processedPlayers = players.map(player => {
    // Initialize aggregate stats
    let totalMatchWins = 0;
    let totalMatchLosses = 0;
    let totalMatchDraws = 0;
    let totalGameWins = 0;
    let totalGameLosses = 0;
    let totalGameDraws = 0;
    
    // Aggregate from each tournament
    player.standings.forEach(standing => {
      totalMatchWins += standing.matchWins || 0;
      totalMatchLosses += standing.matchLosses || 0;
      totalMatchDraws += standing.matchDraws || 0;
      totalGameWins += standing.gameWins || 0;
      totalGameLosses += standing.gameLosses || 0;
      totalGameDraws += standing.gameDraws || 0;
    });
    
    // If there are no standings, use the player's stats (for backwards compatibility)
    if (player.standings.length === 0) {
      totalMatchWins = player.matchWins;
      totalMatchLosses = player.matchLosses;
      totalMatchDraws = player.matchDraws;
      totalGameWins = player.gameWins;
      totalGameLosses = player.gameLosses;
      totalGameDraws = player.gameDraws;
    }
    
    // Return player with calculated stats
    return {
      ...player,
      totalMatchWins,
      totalMatchLosses,
      totalMatchDraws,
      totalGameWins,
      totalGameLosses,
      totalGameDraws
    };
  });
  
  // Sort by total match wins
  return processedPlayers.sort((a, b) => b.totalMatchWins - a.totalMatchWins);
}

export default async function PlayersTable() {
  const players = await getPlayers()
  
  return (
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
              const totalMatches = player.totalMatchWins + player.totalMatchLosses + player.totalMatchDraws
              const winPercentage = totalMatches > 0 
                ? ((player.totalMatchWins / totalMatches) * 100).toFixed(1) 
                : "0.0"
              
              return (
                <tr 
                  key={player.id} 
                  className="border-b hover:bg-muted/50"
                >
                  <td className="px-4 py-3">
                    <Link 
                      href={`/players/${player.id}`}
                      className="font-medium hover:underline"
                    >
                      {player.displayName || player.username}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    {`${player.totalMatchWins}-${player.totalMatchLosses}-${player.totalMatchDraws}`}
                  </td>
                  <td className="px-4 py-3">
                    {`${player.totalGameWins}-${player.totalGameLosses}-${player.totalGameDraws}`}
                  </td>
                  <td className="px-4 py-3">
                    {`${winPercentage}%`}
                  </td>
                  <td className="px-4 py-3">
                    {`${player.tournamentsPlayed} played (${player.tournamentsWon} won)`}
                  </td>
                  <td className="px-4 py-3">
                    <Link 
                      href={`/players/${player.id}`}
                      className="rounded-md bg-primary px-2 py-1 text-xs text-primary-foreground hover:bg-primary/90"
                    >
                      View Details
                    </Link>
                  </td>
                </tr>
              )
            })
          )}
        </tbody>
      </table>
    </div>
  )
} 