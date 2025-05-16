import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { format } from 'date-fns'
import { getTournamentById } from '../../../../lib/tournamentService'
import { ObjectId } from 'mongodb'

// Define interfaces for type safety
interface Player {
  discordId: string;
  username: string;
  rank: number;
  matchWins: number;
  matchLosses: number;
  matchDraws: number;
  gameWins: number;
  gameLosses: number;
  gameDraws: number;
  points: number;
  [key: string]: any; // Allow for additional properties
}

interface Match {
  player1Id: string;
  player2Id: string | null;
  player1Score: number;
  player2Score: number;
  winnerId: string | null;
  isBye: boolean;
  isIntentionalDraw: boolean;
  isTie: boolean;
  status: string;
  [key: string]: any;
}

interface Round {
  number: number;
  status: string;
  matches: Match[];
  [key: string]: any;
}

interface Tournament {
  _id: string | ObjectId;
  name: string;
  date: Date;
  guildId: string;
  guildName?: string;
  channelId: string;
  playerCount: number;
  players: Player[];
  rounds: Round[];
  [key: string]: any;
}

export async function generateMetadata({ params }: { params: { id: string } }) {
  const tournament = await getTournamentById(params.id)
  
  if (!tournament) {
    return {
      title: "Tournament Not Found",
      description: "The tournament you're looking for doesn't exist."
    }
  }
  
  return {
    title: `${tournament.name} | SWU Tournament Dashboard`,
    description: `View results and matches from the ${tournament.name} tournament.`
  }
}

export default async function TournamentDetailPage({ params }: { params: { id: string } }) {
  const tournament = await getTournamentById(params.id) as Tournament | null
  
  if (!tournament) {
    notFound()
  }
  
  // Create a map of Discord IDs to player objects for username lookup
  const playerMap = new Map<string, Player>();
  tournament.players.forEach(player => {
    playerMap.set(player.discordId, player);
  });
  
  // Helper function to get player name from Discord ID
  const getPlayerName = (discordId: string | null): string => {
    if (!discordId) return 'BYE';
    const player = playerMap.get(discordId);
    return player ? player.username : discordId.substring(0, 8);
  };
  
  return (
    <div className="container py-8">
      <div className="mb-6 flex flex-col gap-1">
        <Link 
          href="/tournaments" 
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to tournaments
        </Link>
        <h1 className="text-4xl font-bold">{tournament.name}</h1>
        <p className="text-lg text-muted-foreground">
          {format(new Date(tournament.date), 'PPP')} • {tournament.playerCount || tournament.players.length} players
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        {/* Standings */}
        <Card>
          <CardHeader>
            <CardTitle>Final Standings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b text-left">
                    <th className="px-4 py-2">Rank</th>
                    <th className="px-4 py-2">Player</th>
                    <th className="px-4 py-2">Record</th>
                    <th className="px-4 py-2">Points</th>
                  </tr>
                </thead>
                <tbody>
                  {tournament.players
                    .sort((a, b) => (a.rank || 999) - (b.rank || 999))
                    .map((player) => (
                      <tr key={player.discordId} className="border-b hover:bg-muted/50">
                        <td className="px-4 py-2">{player.rank}</td>
                        <td className="px-4 py-2">
                          <span className="font-medium">
                            {player.username}
                          </span>
                        </td>
                        <td className="px-4 py-2">{`${player.matchWins || 0}-${player.matchLosses || 0}-${player.matchDraws || 0}`}</td>
                        <td className="px-4 py-2">{player.points || 0}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
        
        {/* Rounds */}
        <div className="space-y-6">
          {tournament.rounds && tournament.rounds.map((round) => (
            <Card key={round.number}>
              <CardHeader>
                <CardTitle>Round {round.number}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {round.matches && round.matches.map((match, idx) => (
                    <li 
                      key={`${round.number}-${idx}`}
                      className="rounded-md border p-3 hover:bg-muted/50"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium">
                            {getPlayerName(match.player1Id)}
                          </span>
                          {match.status === 'complete' && (
                            <span className="mx-2">
                              vs {match.player2Id ? getPlayerName(match.player2Id) : 'BYE'}
                              {" "}
                              {match.isBye ? "(BYE)" : 
                                match.isIntentionalDraw ? "(ID)" : 
                                  `(${match.player1Score}-${match.player2Score})`}
                            </span>
                          )}
                          {match.status !== 'complete' && (
                            <span className="mx-2">
                              vs {match.player2Id ? getPlayerName(match.player2Id) : 'BYE'}
                              {" "}(Pending)
                            </span>
                          )}
                        </div>
                        {match.status === 'complete' && match.winnerId && !match.isIntentionalDraw && !match.isTie && (
                          <span className="text-sm text-muted-foreground">
                            Winner: {getPlayerName(match.winnerId)}
                          </span>
                        )}
                        {match.status === 'complete' && match.isIntentionalDraw && (
                          <span className="text-sm text-muted-foreground">
                            Intentional Draw
                          </span>
                        )}
                        {match.status === 'complete' && match.isTie && !match.isIntentionalDraw && (
                          <span className="text-sm text-muted-foreground">
                            Draw
                          </span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
} 