import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"

async function getTournaments() {
  const tournaments = await prisma.tournament.findMany({
    orderBy: {
      date: 'desc',
    },
    take: 50,
    include: {
      standings: {
        where: {
          rank: 1
        },
        include: {
          player: true
        }
      }
    }
  })
  
  return tournaments
}

export default async function TournamentsTable() {
  const tournaments = await getTournaments()
  
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b text-left">
            <th className="px-4 py-2">Tournament</th>
            <th className="px-4 py-2">Date</th>
            <th className="px-4 py-2">Players</th>
            <th className="px-4 py-2">Winner</th>
            <th className="px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {tournaments.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                No tournaments found
              </td>
            </tr>
          ) : (
            tournaments.map((tournament) => {
              const winner = tournament.standings[0]?.player
              
              return (
                <tr 
                  key={tournament.id} 
                  className="border-b hover:bg-muted/50"
                >
                  <td className="px-4 py-3">
                    <Link 
                      href={`/tournaments/${tournament.id}`}
                      className="font-medium hover:underline"
                    >
                      {tournament.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatDistanceToNow(new Date(tournament.date), { addSuffix: true })}
                  </td>
                  <td className="px-4 py-3">
                    {tournament.playerCount}
                  </td>
                  <td className="px-4 py-3">
                    {winner ? (
                      <Link 
                        href={`/players/${winner.id}`}
                        className="font-medium hover:underline"
                      >
                        {winner.displayName || winner.username}
                      </Link>
                    ) : (
                      <span className="text-muted-foreground">
                        Unknown
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Link 
                      href={`/tournaments/${tournament.id}`}
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