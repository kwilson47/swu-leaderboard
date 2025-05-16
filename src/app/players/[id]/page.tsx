import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { format } from 'date-fns'

export async function generateMetadata({ params }: { params: { id: string } }) {
  const player = await getPlayer(params.id)
  
  if (!player) {
    return {
      title: "Player Not Found",
      description: "The player you're looking for doesn't exist."
    }
  }
  
  return {
    title: `${player.displayName || player.username} | SWU Tournament Dashboard`,
    description: `View tournament history and statistics for ${player.displayName || player.username}.`
  }
}

async function getPlayer(id: string) {
  try {
    return await prisma.player.findUnique({
      where: { id },
      include: {
        standings: {
          include: {
            tournament: true
          },
          orderBy: {
            tournament: {
              date: 'desc'
            }
          }
        }
      }
    })
  } catch (error) {
    console.error("Error fetching player:", error)
    return null
  }
}

// Get player's head-to-head records against other players
async function getPlayerHeadToHead(playerId: string) {
  try {
    // Get all tournaments this player participated in
    const playerData = await prisma.player.findUnique({
      where: { id: playerId },
      select: { discordId: true }
    });
    
    if (!playerData) return [];
    
    const playerDiscordId = playerData.discordId;
    
    // Find all tournaments where this player participated
    const tournaments = await prisma.tournament.findMany({
      where: {
        rounds: {
          some: {
            matches: {
              some: {
                OR: [
                  { player1Id: playerDiscordId },
                  { player2Id: playerDiscordId }
                ]
              }
            }
          }
        }
      },
      include: {
        rounds: {
          include: {
            matches: {
              where: {
                OR: [
                  { player1Id: playerDiscordId },
                  { player2Id: playerDiscordId }
                ],
                AND: {
                  status: 'complete',
                  isBye: false
                }
              }
            }
          }
        }
      }
    });
    
    // Track opponents and records
    const opponentRecords: Record<string, { 
      id?: string,
      username: string, 
      matchWins: number,
      matchLosses: number,
      matchDraws: number,
      gameWins: number,
      gameLosses: number
    }> = {};
    
    // Get all unique opponent Discord IDs
    const opponentIds = new Set<string>();
    
    // Process all matches
    tournaments.forEach(tournament => {
      tournament.rounds.forEach(round => {
        round.matches.forEach(match => {
          // Skip bye matches
          if (match.isBye) return;
          
          // Determine opponent
          const isPlayer1 = match.player1Id === playerDiscordId;
          const opponentId = isPlayer1 ? match.player2Id : match.player1Id;
          
          if (!opponentId) return; // Skip if no opponent
          
          opponentIds.add(opponentId);
          
          // Initialize opponent record if not exists
          if (!opponentRecords[opponentId]) {
            opponentRecords[opponentId] = {
              username: opponentId, // Will be updated later
              matchWins: 0,
              matchLosses: 0,
              matchDraws: 0,
              gameWins: 0,
              gameLosses: 0
            };
          }
          
          // Update match record
          if (match.winnerId === playerDiscordId) {
            opponentRecords[opponentId].matchWins++;
          } else if (match.winnerId === opponentId) {
            opponentRecords[opponentId].matchLosses++;
          } else {
            opponentRecords[opponentId].matchDraws++;
          }
          
          // Update game record
          if (isPlayer1) {
            opponentRecords[opponentId].gameWins += match.player1Score || 0;
            opponentRecords[opponentId].gameLosses += match.player2Score || 0;
          } else {
            opponentRecords[opponentId].gameWins += match.player2Score || 0;
            opponentRecords[opponentId].gameLosses += match.player1Score || 0;
          }
        });
      });
    });
    
    // Get player usernames
    if (opponentIds.size > 0) {
      const players = await prisma.player.findMany({
        where: {
          discordId: {
            in: Array.from(opponentIds)
          }
        }
      });
      
      // Update usernames in records
      players.forEach(player => {
        if (opponentRecords[player.discordId]) {
          opponentRecords[player.discordId].id = player.id;
          opponentRecords[player.discordId].username = player.displayName || player.username;
        }
      });
    }
    
    // Convert to array and sort by most games played
    return Object.values(opponentRecords)
      .sort((a, b) => 
        (b.matchWins + b.matchLosses + b.matchDraws) - 
        (a.matchWins + a.matchLosses + a.matchDraws)
      );
    
  } catch (error) {
    console.error("Error fetching head-to-head records:", error);
    return [];
  }
}

export default async function PlayerDetailPage({ params }: { params: { id: string } }) {
  const player = await getPlayer(params.id)
  const headToHeadRecords = await getPlayerHeadToHead(params.id)
  
  if (!player) {
    notFound()
  }
  
  // Calculate aggregate stats from all tournaments
  let totalMatchWins = 0;
  let totalMatchLosses = 0;
  let totalMatchDraws = 0;
  let totalGameWins = 0;
  let totalGameLosses = 0;
  let totalGameDraws = 0;
  
  player.standings.forEach((standing) => {
    totalMatchWins += standing.matchWins || 0;
    totalMatchLosses += standing.matchLosses || 0;
    totalMatchDraws += standing.matchDraws || 0;
    totalGameWins += standing.gameWins || 0;
    totalGameLosses += standing.gameLosses || 0;
    totalGameDraws += standing.gameDraws || 0;
  });
  
  // Calculate win percentage
  const totalMatches = totalMatchWins + totalMatchLosses + totalMatchDraws;
  const winPercentage = totalMatches > 0 
    ? ((totalMatchWins / totalMatches) * 100).toFixed(1) 
    : "0.0";
  
  const gameTotal = totalGameWins + totalGameLosses + totalGameDraws;
  const gameWinPercentage = gameTotal > 0 
    ? ((totalGameWins / gameTotal) * 100).toFixed(1) 
    : "0.0";
  
  // Calculate total tournaments played
  const totalTournamentsPlayed = player.standings.length;
  // Count tournaments won (rank 1)
  const totalTournamentsWon = player.standings.filter(s => s.rank === 1).length;
  
  return (
    <div className="container py-8">
      <div className="mb-6 flex flex-col gap-1">
        <Link 
          href="/players" 
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to players
        </Link>
        <h1 className="text-4xl font-bold">{player.displayName || player.username}</h1>
        <p className="text-lg text-muted-foreground">
          {totalTournamentsPlayed} tournaments played • {totalTournamentsWon} tournaments won
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
                  {totalMatchWins}-{totalMatchLosses}-{totalMatchDraws}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Game Record</dt>
                <dd className="text-2xl font-bold">
                  {totalGameWins}-{totalGameLosses}-{totalGameDraws}
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
                <dd className="text-2xl font-bold">{totalTournamentsPlayed}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Tournaments Won</dt>
                <dd className="text-2xl font-bold">{totalTournamentsWon}</dd>
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
              {player.standings
                .filter(s => s.rank <= 3)
                .sort((a, b) => a.rank - b.rank)
                .slice(0, 4)
                .map(standing => (
                  <div 
                    key={standing.id}
                    className="flex items-center justify-between rounded-md border p-3 hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-2">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-full
                        ${standing.rank === 1 ? 'bg-amber-100 text-amber-600' : 
                          standing.rank === 2 ? 'bg-slate-100 text-slate-600' : 
                            'bg-amber-50 text-amber-800'}`}
                      >
                        {standing.rank}
                      </div>
                      <div>
                        <div className="font-medium">
                          <Link href={`/tournaments/${standing.tournament.id}`} className="hover:underline">
                            {standing.tournament.name}
                          </Link>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {format(new Date(standing.tournament.date), 'PP')}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm font-medium">
                      {standing.matchWins}-{standing.matchLosses}-{standing.matchDraws}
                    </div>
                  </div>
                ))}
              
              {player.standings.filter(s => s.rank <= 3).length === 0 && (
                <div className="py-8 text-center text-muted-foreground">
                  No top 3 finishes yet
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Full Tournament History */}
      <Card>
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
                {player.standings.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                      No tournament history
                    </td>
                  </tr>
                ) : (
                  player.standings.map((standing) => (
                    <tr 
                      key={standing.id} 
                      className="border-b hover:bg-muted/50"
                    >
                      <td className="px-4 py-3">
                        <Link 
                          href={`/tournaments/${standing.tournament.id}`}
                          className="font-medium hover:underline"
                        >
                          {standing.tournament.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {format(new Date(standing.tournament.date), 'PP')}
                      </td>
                      <td className="px-4 py-3">
                        {standing.rank === 1 ? (
                          <span className="font-bold text-amber-500">1st</span>
                        ) : standing.rank === 2 ? (
                          <span className="font-bold text-slate-400">2nd</span>
                        ) : standing.rank === 3 ? (
                          <span className="font-bold text-amber-700">3rd</span>
                        ) : (
                          <span>{standing.rank}th</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {standing.tournament.playerCount}
                      </td>
                      <td className="px-4 py-3">
                        {`${standing.matchWins}-${standing.matchLosses}-${standing.matchDraws}`}
                      </td>
                      <td className="px-4 py-3">
                        {`${standing.gameWins}-${standing.gameLosses}-${standing.gameDraws}`}
                      </td>
                      <td className="px-4 py-3">
                        {standing.points}
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
      <Card className="mt-6">
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
                    const totalMatches = record.matchWins + record.matchLosses;
                    const winPercentage = totalMatches > 0 
                      ? ((record.matchWins / totalMatches) * 100).toFixed(1) 
                      : "0.0";
                    
                    return (
                      <tr 
                        key={index} 
                        className="border-b hover:bg-muted/50"
                      >
                        <td className="px-4 py-3">
                          {record.id ? (
                            <Link 
                              href={`/players/${record.id}`}
                              className="font-medium hover:underline"
                            >
                              {record.username}
                            </Link>
                          ) : (
                            <span className="font-medium">{record.username}</span>
                          )}
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