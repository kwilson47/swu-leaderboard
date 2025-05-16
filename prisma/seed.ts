import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting seed...')

  // Check if we have any existing players
  const existingPlayersCount = await prisma.player.count()
  
  if (existingPlayersCount > 0) {
    console.log(`Found ${existingPlayersCount} existing players. Skipping seed data creation to preserve existing data.`)
    return
  }
  
  console.log('No existing data found. Creating sample data for development...')

  // Create players
  const player1 = await prisma.player.create({
    data: {
      discordId: '123456789012345678',
      username: 'player1',
      displayName: 'John Doe',
      matchWins: 10,
      matchLosses: 5,
      matchDraws: 2,
      gameWins: 25,
      gameLosses: 15,
      gameDraws: 4,
      tournamentsPlayed: 4,
      tournamentsWon: 1
    }
  })

  const player2 = await prisma.player.create({
    data: {
      discordId: '223456789012345678',
      username: 'player2',
      displayName: 'Jane Smith',
      matchWins: 12,
      matchLosses: 3,
      matchDraws: 1,
      gameWins: 30,
      gameLosses: 10,
      gameDraws: 2,
      tournamentsPlayed: 4,
      tournamentsWon: 2
    }
  })

  const player3 = await prisma.player.create({
    data: {
      discordId: '323456789012345678',
      username: 'player3',
      displayName: 'Bob Johnson',
      matchWins: 8,
      matchLosses: 8,
      matchDraws: 0,
      gameWins: 20,
      gameLosses: 20,
      gameDraws: 0,
      tournamentsPlayed: 4,
      tournamentsWon: 0
    }
  })

  const player4 = await prisma.player.create({
    data: {
      discordId: '423456789012345678',
      username: 'player4',
      displayName: 'Alice Brown',
      matchWins: 6,
      matchLosses: 10,
      matchDraws: 0,
      gameWins: 15,
      gameLosses: 25,
      gameDraws: 0,
      tournamentsPlayed: 4,
      tournamentsWon: 0
    }
  })

  console.log('Players created')

  // Create a tournament
  const tournament1 = await prisma.tournament.create({
    data: {
      name: 'Weekly Tournament #1',
      guildId: '987654321098765432',
      guildName: 'SWU Discord',
      channelId: '876543210987654321',
      date: new Date('2023-10-01'),
      playerCount: 4
    }
  })

  const tournament2 = await prisma.tournament.create({
    data: {
      name: 'Weekly Tournament #2',
      guildId: '987654321098765432',
      guildName: 'SWU Discord',
      channelId: '876543210987654322',
      date: new Date('2023-10-08'),
      playerCount: 4
    }
  })

  console.log('Tournaments created')

  // Create rounds for tournament 1
  const tournament1Round1 = await prisma.round.create({
    data: {
      tournamentId: tournament1.id,
      number: 1,
      status: 'complete'
    }
  })

  const tournament1Round2 = await prisma.round.create({
    data: {
      tournamentId: tournament1.id,
      number: 2,
      status: 'complete'
    }
  })

  // Create rounds for tournament 2
  const tournament2Round1 = await prisma.round.create({
    data: {
      tournamentId: tournament2.id,
      number: 1,
      status: 'complete'
    }
  })

  const tournament2Round2 = await prisma.round.create({
    data: {
      tournamentId: tournament2.id,
      number: 2,
      status: 'complete'
    }
  })

  console.log('Rounds created')

  // Create matches for tournament 1, round 1
  await prisma.match.createMany({
    data: [
      {
        roundId: tournament1Round1.id,
        player1Id: player1.discordId,
        player2Id: player2.discordId,
        player1Score: 2,
        player2Score: 1,
        winnerId: player1.discordId,
        status: 'complete'
      },
      {
        roundId: tournament1Round1.id,
        player1Id: player3.discordId,
        player2Id: player4.discordId,
        player1Score: 2,
        player2Score: 0,
        winnerId: player3.discordId,
        status: 'complete'
      }
    ]
  })

  // Create matches for tournament 1, round 2
  await prisma.match.createMany({
    data: [
      {
        roundId: tournament1Round2.id,
        player1Id: player1.discordId,
        player2Id: player3.discordId,
        player1Score: 2,
        player2Score: 0,
        winnerId: player1.discordId,
        status: 'complete'
      },
      {
        roundId: tournament1Round2.id,
        player1Id: player2.discordId,
        player2Id: player4.discordId,
        player1Score: 2,
        player2Score: 0,
        winnerId: player2.discordId,
        status: 'complete'
      }
    ]
  })

  // Create matches for tournament 2, round 1
  await prisma.match.createMany({
    data: [
      {
        roundId: tournament2Round1.id,
        player1Id: player1.discordId,
        player2Id: player2.discordId,
        player1Score: 0,
        player2Score: 2,
        winnerId: player2.discordId,
        status: 'complete'
      },
      {
        roundId: tournament2Round1.id,
        player1Id: player3.discordId,
        player2Id: player4.discordId,
        player1Score: 2,
        player2Score: 1,
        winnerId: player3.discordId,
        status: 'complete'
      }
    ]
  })

  // Create matches for tournament 2, round 2
  await prisma.match.createMany({
    data: [
      {
        roundId: tournament2Round2.id,
        player1Id: player2.discordId,
        player2Id: player3.discordId,
        player1Score: 2,
        player2Score: 1,
        winnerId: player2.discordId,
        status: 'complete'
      },
      {
        roundId: tournament2Round2.id,
        player1Id: player1.discordId,
        player2Id: player4.discordId,
        player1Score: 2,
        player2Score: 0,
        winnerId: player1.discordId,
        status: 'complete'
      }
    ]
  })

  console.log('Matches created')

  // Create standings for tournament 1
  await prisma.standing.createMany({
    data: [
      {
        tournamentId: tournament1.id,
        playerId: player1.id,
        rank: 1,
        matchWins: 2,
        matchLosses: 0,
        matchDraws: 0,
        gameWins: 4,
        gameLosses: 1,
        gameDraws: 0,
        points: 6,
        opponentMatchWinPercentage: 33.3,
        gameWinPercentage: 80.0
      },
      {
        tournamentId: tournament1.id,
        playerId: player2.id,
        rank: 2,
        matchWins: 1,
        matchLosses: 1,
        matchDraws: 0,
        gameWins: 3,
        gameLosses: 2,
        gameDraws: 0,
        points: 3,
        opponentMatchWinPercentage: 50.0,
        gameWinPercentage: 60.0
      },
      {
        tournamentId: tournament1.id,
        playerId: player3.id,
        rank: 3,
        matchWins: 1,
        matchLosses: 1,
        matchDraws: 0,
        gameWins: 2,
        gameLosses: 2,
        gameDraws: 0,
        points: 3,
        opponentMatchWinPercentage: 50.0,
        gameWinPercentage: 50.0
      },
      {
        tournamentId: tournament1.id,
        playerId: player4.id,
        rank: 4,
        matchWins: 0,
        matchLosses: 2,
        matchDraws: 0,
        gameWins: 0,
        gameLosses: 4,
        gameDraws: 0,
        points: 0,
        opponentMatchWinPercentage: 66.7,
        gameWinPercentage: 0.0
      }
    ]
  })

  // Create standings for tournament 2
  await prisma.standing.createMany({
    data: [
      {
        tournamentId: tournament2.id,
        playerId: player2.id,
        rank: 1,
        matchWins: 2,
        matchLosses: 0,
        matchDraws: 0,
        gameWins: 4,
        gameLosses: 1,
        gameDraws: 0,
        points: 6,
        opponentMatchWinPercentage: 50.0,
        gameWinPercentage: 80.0
      },
      {
        tournamentId: tournament2.id,
        playerId: player1.id,
        rank: 2,
        matchWins: 1,
        matchLosses: 1,
        matchDraws: 0,
        gameWins: 2,
        gameLosses: 2,
        gameDraws: 0,
        points: 3,
        opponentMatchWinPercentage: 33.3,
        gameWinPercentage: 50.0
      },
      {
        tournamentId: tournament2.id,
        playerId: player3.id,
        rank: 3,
        matchWins: 1,
        matchLosses: 1,
        matchDraws: 0,
        gameWins: 3,
        gameLosses: 3,
        gameDraws: 0,
        points: 3,
        opponentMatchWinPercentage: 66.7,
        gameWinPercentage: 50.0
      },
      {
        tournamentId: tournament2.id,
        playerId: player4.id,
        rank: 4,
        matchWins: 0,
        matchLosses: 2,
        matchDraws: 0,
        gameWins: 1,
        gameLosses: 4,
        gameDraws: 0,
        points: 0,
        opponentMatchWinPercentage: 50.0,
        gameWinPercentage: 20.0
      }
    ]
  })

  console.log('Standings created')
  console.log('Seed completed')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 