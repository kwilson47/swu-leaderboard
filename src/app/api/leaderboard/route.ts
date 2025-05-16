import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    // Get all players ordered by match wins
    const players = await prisma.player.findMany({
      orderBy: [
        { matchWins: 'desc' },
        { tournamentsWon: 'desc' }
      ],
      take: 50,
    })

    return NextResponse.json(players.map(p => ({
      discordId: p.discordId,
      name: p.username,
      displayName: p.displayName,
      wins: p.matchWins,
      losses: p.matchLosses,
      draws: p.matchDraws,
      tournamentsPlayed: p.tournamentsPlayed,
      tournamentsWon: p.tournamentsWon
    })))
  } catch (error) {
    console.error("Error fetching leaderboard:", error)
    return NextResponse.json(
      { error: "Failed to fetch leaderboard data" },
      { status: 500 }
    )
  }
} 