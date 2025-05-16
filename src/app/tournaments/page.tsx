import Link from 'next/link'
import { format } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getTournaments } from '../../../lib/tournamentService'
import { ObjectId } from 'mongodb'

// Use type instead of interface to avoid conflicts with imported types
type TournamentDisplay = {
  _id: string | ObjectId;
  name: string;
  date: Date;
  status?: string;
  playerCount?: number;
  players: Array<{
    discordId: string;
    username: string;
    rank?: number;
    [key: string]: any;
  }>;
}

export const metadata = {
  title: "Tournaments | SWU Tournament Dashboard",
  description: "View all Star Wars: Unlimited tournaments from the SWU Discord bot",
}

export default async function TournamentsPage() {
  const tournaments = await getTournaments()
  
  // Helper function to find the winner of a tournament
  const getWinner = (tournament: any) => {
    if (!tournament.players || tournament.players.length === 0) return null;
    return tournament.players.find((player: any) => player.rank === 1);
  };
  
  return (
    <div className="container py-8">
      <h1 className="mb-6 text-4xl font-bold">Tournaments</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {tournaments.length === 0 ? (
          <p className="col-span-full py-8 text-center text-muted-foreground">
            No tournaments found. Create a tournament using the Discord bot.
          </p>
        ) : (
          tournaments.map((tournament: any) => {
            const winner = getWinner(tournament);
            
            return (
              <Link 
                key={tournament._id.toString()}
                href={`/tournaments/${tournament._id.toString()}`}
                className="transition-colors hover:bg-muted/50"
              >
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="line-clamp-1">{tournament.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col gap-1">
                      <p className="text-muted-foreground">
                        {format(new Date(tournament.date), 'PPP')}
                      </p>
                      <p>
                        <span className="font-medium">{tournament.playerCount || tournament.players.length}</span> players
                      </p>
                      {winner && (
                        <p>
                          Winner: <span className="font-medium text-amber-600">{winner.username}</span>
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground">
                        Status: {tournament.status || 'Complete'}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })
        )}
      </div>
    </div>
  )
} 