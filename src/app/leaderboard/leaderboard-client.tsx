"use client"

import { useEffect, useState } from "react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

type Player = {
  discordId: string
  name: string
  displayName?: string
  wins: number
  losses: number
  draws?: number
}

export default function LeaderboardClient() {
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true)
        const res = await fetch("/api/leaderboard")
        if (!res.ok) {
          throw new Error(`Error fetching leaderboard: ${res.status}`)
        }
        const data = await res.json()
        setPlayers(data)
      } catch (err) {
        console.error("Error loading leaderboard:", err)
        setError("Failed to load leaderboard data")
      } finally {
        setLoading(false)
      }
    }

    fetchLeaderboard()
  }, [])

  if (loading) {
    return <p className="p-4 text-center">Loading leaderboard data...</p>
  }

  if (error) {
    return <p className="p-4 text-center text-destructive">{error}</p>
  }

  const getWinPercentage = (player: Player) => {
    const total = player.wins + player.losses + (player.draws || 0)
    if (total === 0) return 0
    return ((player.wins / total) * 100).toFixed(1)
  }

  return (
    <div>
      <table className="w-full text-left">
        <thead>
          <tr className="border-b">
            <th className="p-2">#</th>
            <th className="p-2">Player</th>
            <th className="p-2">Wins</th>
            <th className="p-2">Losses</th>
            {players.some(p => p.draws) && <th className="p-2">Draws</th>}
            <th className="p-2">Win %</th>
          </tr>
        </thead>
        <tbody>
          {players.map((player, index) => (
            <tr key={player.discordId} className="border-b hover:bg-muted/50">
              <td className="p-2">{index + 1}</td>
              <td className="p-2">{player.displayName || player.name}</td>
              <td className="p-2">{player.wins}</td>
              <td className="p-2">{player.losses}</td>
              {players.some(p => p.draws) && <td className="p-2">{player.draws || 0}</td>}
              <td className="p-2">{getWinPercentage(player)}%</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 className="mt-8 mb-4 text-xl font-bold">📈 Win Distribution</h2>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={players.slice(0, 10)}>
            <XAxis dataKey="displayName" tickFormatter={(value) => {
              if (!value) return "";
              return value.length > 8 ? `${value.slice(0, 8)}...` : value;
            }} />
            <YAxis />
            <Tooltip 
              formatter={(value, name) => [value, name === "wins" ? "Wins" : "Losses"]}
              labelFormatter={(label) => `Player: ${label}`}
            />
            <Bar dataKey="wins" fill="#4f46e5" name="Wins" />
            <Bar dataKey="losses" fill="#ef4444" name="Losses" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
} 