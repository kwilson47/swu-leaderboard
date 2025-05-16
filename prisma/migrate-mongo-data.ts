import { PrismaClient } from '@prisma/client'
import { MongoClient, ObjectId } from 'mongodb'
import * as dotenv from 'dotenv'

dotenv.config()

const prisma = new PrismaClient()
const mongoUri = process.env.DATABASE_URL
if (!mongoUri) {
  throw new Error('DATABASE_URL environment variable is not set')
}

async function main() {
  console.log('Starting data migration...')

  // Connect directly to MongoDB to read the original data format
  const mongoClient = new MongoClient(mongoUri as string)
  await mongoClient.connect()
  
  const db = mongoClient.db() // The database name should be part of the connection string
  const tournamentsCollection = db.collection('tournaments')
  
  // Get all tournaments
  const tournaments = await tournamentsCollection.find({}).toArray()
  console.log(`Found ${tournaments.length} tournaments to migrate`)
  
  for (const tournament of tournaments) {
    console.log(`Migrating tournament: ${tournament.name}`)
    
    try {
      // Create tournament
      const createdTournament = await prisma.tournament.create({
        data: {
          id: tournament._id.toString(), // Keep the same ID
          name: tournament.name,
          guildId: tournament.guildId,
          guildName: tournament.guildName || 'Unknown',
          channelId: tournament.channelId,
          date: tournament.date,
          playerCount: tournament.playerCount || tournament.players?.length || 0,
        }
      })
      
      // Map to track created players
      const playerMap = new Map()
      
      // Create players if they don't exist
      if (tournament.players && tournament.players.length > 0) {
        for (const player of tournament.players) {
          // Check if player already exists by discordId
          let dbPlayer = await prisma.player.findUnique({
            where: { discordId: player.discordId }
          })
          
          if (!dbPlayer) {
            dbPlayer = await prisma.player.create({
              data: {
                discordId: player.discordId,
                username: player.username,
                matchWins: player.matchWins || 0,
                matchLosses: player.matchLosses || 0,
                matchDraws: player.matchDraws || 0,
                gameWins: player.gameWins || 0,
                gameLosses: player.gameLosses || 0,
                gameDraws: player.gameDraws || 0,
                tournamentsPlayed: 1,
                tournamentsWon: player.rank === 1 ? 1 : 0
              }
            })
          } else {
            // Update player stats
            await prisma.player.update({
              where: { id: dbPlayer.id },
              data: {
                tournamentsPlayed: { increment: 1 },
                tournamentsWon: player.rank === 1 ? { increment: 1 } : undefined
              }
            })
          }
          
          playerMap.set(player.discordId, dbPlayer.id)
          
          // Create standing
          await prisma.standing.create({
            data: {
              tournamentId: createdTournament.id,
              playerId: dbPlayer.id,
              rank: player.rank || 0,
              matchWins: player.matchWins || 0,
              matchLosses: player.matchLosses || 0,
              matchDraws: player.matchDraws || 0,
              gameWins: player.gameWins || 0,
              gameLosses: player.gameLosses || 0,
              gameDraws: player.gameDraws || 0,
              points: player.points || 0,
              opponentMatchWinPercentage: player.opponentMatchWinPercentage || 0,
              gameWinPercentage: player.gameWinPercentage || 0,
              opponentGameWinPercentage: player.opponentGameWinPercentage || 0
            }
          })
        }
      }
      
      // Create rounds and matches
      if (tournament.rounds && tournament.rounds.length > 0) {
        for (const round of tournament.rounds) {
          const createdRound = await prisma.round.create({
            data: {
              tournamentId: createdTournament.id,
              number: round.number,
              status: round.status || 'complete'
            }
          })
          
          // Create matches for this round
          if (round.matches && round.matches.length > 0) {
            for (const match of round.matches) {
              await prisma.match.create({
                data: {
                  roundId: createdRound.id,
                  player1Id: match.player1Id,
                  player2Id: match.player2Id,
                  player1Score: match.player1Score || 0,
                  player2Score: match.player2Score || 0,
                  winnerId: match.winnerId,
                  isTie: match.isTie || false,
                  isBye: match.isBye || false,
                  isIntentionalDraw: match.isIntentionalDraw || false,
                  status: match.status || 'complete'
                }
              })
            }
          }
        }
      }
      
      console.log(`Successfully migrated tournament: ${tournament.name}`)
    } catch (error) {
      console.error(`Error migrating tournament ${tournament.name}:`, error)
    }
  }
  
  await mongoClient.close()
  console.log('Migration completed')
}

main()
  .catch((e) => {
    console.error('Migration error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 