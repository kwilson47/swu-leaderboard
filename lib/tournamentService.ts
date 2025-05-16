import clientPromise from './mongodb';
import { ObjectId } from 'mongodb';

// Define types
interface Player {
  discordId: string;
  username: string;
  matchWins?: number;
  matchLosses?: number;
  matchDraws?: number;
  gameWins?: number;
  gameLosses?: number;
  gameDraws?: number;
  rank?: number;
  points?: number;
  [key: string]: any; // Allow for additional properties
}

interface Match {
  player1Id: string;
  player2Id: string;
  player1Score: number;
  player2Score: number;
  winnerId: string;
  isBye: boolean;
  [key: string]: any; // Allow for additional properties
}

interface Round {
  number: number;
  matches: Match[];
  [key: string]: any; // Allow for additional properties
}

interface Tournament {
  _id: string | ObjectId;
  name: string;
  date: Date;
  playerCount: number;
  players: Player[];
  rounds: Round[];
  [key: string]: any; // Allow for additional properties
}

interface OpponentRecord {
  discordId: string;
  username: string;
  matchWins: number;
  matchLosses: number;
  matchDraws: number;
  gameWins: number;
  gameLosses: number;
  [key: string]: any;
}

// Get the total count of tournaments
export async function getTournamentCount() {
  const client = await clientPromise;
  const db = client.db();
  
  try {
    const count = await db.collection('tournaments').countDocuments();
    return count;
  } catch (error) {
    console.error('Error counting tournaments:', error);
    return 0;
  }
}

// Get the total count of unique players across all tournaments
export async function getPlayerCount() {
  const client = await clientPromise;
  const db = client.db();
  
  try {
    const result = await db.collection('tournaments').aggregate([
      { $unwind: '$players' },
      { $group: { _id: '$players.discordId' } },
      { $count: 'total' }
    ]).toArray();
    
    return result.length > 0 ? result[0].total : 0;
  } catch (error) {
    console.error('Error counting players:', error);
    return 0;
  }
}

// Get recent tournaments with limit
export async function getRecentTournaments(limit: number = 3) {
  const client = await clientPromise;
  const db = client.db();
  
  try {
    const tournaments = await db
      .collection('tournaments')
      .find({})
      .sort({ date: -1 })
      .limit(limit)
      .toArray();
    
    return tournaments as Tournament[];
  } catch (error) {
    console.error('Error fetching recent tournaments:', error);
    return [];
  }
}

// Get all tournaments from MongoDB, sorted by date
export async function getTournaments() {
  const client = await clientPromise;
  const db = client.db();
  
  // Get tournaments directly from the tournaments collection
  const tournaments = await db
    .collection('tournaments')
    .find({})
    .sort({ date: -1 })
    .toArray();
  
  return tournaments as Tournament[];
}

// Get a single tournament by ID
export async function getTournamentById(id: string) {
  const client = await clientPromise;
  const db = client.db();
  
  try {
    // Get a single tournament by its ObjectId
    const tournament = await db
      .collection('tournaments')
      .findOne({ _id: new ObjectId(id) });
    
    return tournament as Tournament;
  } catch (error) {
    console.error('Error fetching tournament:', error);
    return null;
  }
}

// Get player data from the players in tournaments collection
export async function getPlayers() {
  const client = await clientPromise;
  const db = client.db();
  
  try {
    // Aggregate all unique players from tournaments collection
    const players = await db
      .collection('tournaments')
      .aggregate([
        // Unwind the players array to work with individual player documents
        { $unwind: '$players' },
        // Group by discordId to get unique players with stats
        {
          $group: {
            _id: '$players.discordId',
            username: { $first: '$players.username' },
            matchWins: { $sum: '$players.matchWins' },
            matchLosses: { $sum: '$players.matchLosses' },
            matchDraws: { $sum: '$players.matchDraws' },
            gameWins: { $sum: '$players.gameWins' },
            gameLosses: { $sum: '$players.gameLosses' },
            gameDraws: { $sum: '$players.gameDraws' },
            tournaments: { $sum: 1 },
            tournamentsWon: { 
              $sum: { $cond: [{ $eq: ['$players.rank', 1] }, 1, 0] } 
            }
          }
        },
        // Sort by match wins descending
        { $sort: { matchWins: -1 } }
      ])
      .toArray();
    
    return players.map(player => ({
      discordId: player._id,
      username: player.username,
      matchWins: player.matchWins || 0,
      matchLosses: player.matchLosses || 0,
      matchDraws: player.matchDraws || 0,
      gameWins: player.gameWins || 0,
      gameLosses: player.gameLosses || 0,
      gameDraws: player.gameDraws || 0,
      tournamentsPlayed: player.tournaments || 0,
      tournamentsWon: player.tournamentsWon || 0
    }));
  } catch (error) {
    console.error('Error fetching players:', error);
    return [];
  }
}

// Get player details including tournament history
export async function getPlayerById(discordId: string) {
  const client = await clientPromise;
  const db = client.db();
  
  try {
    // Find all tournaments where this player participated
    const tournaments = await db
      .collection('tournaments')
      .find({ 'players.discordId': discordId })
      .sort({ date: -1 })
      .toArray() as Tournament[];
    
    if (tournaments.length === 0) {
      return null;
    }
    
    // Get player data from the first tournament
    const playerData = tournaments[0].players.find((p: Player) => p.discordId === discordId);
    
    // Extract and aggregate stats
    let totalMatchWins = 0;
    let totalMatchLosses = 0;
    let totalMatchDraws = 0;
    let totalGameWins = 0;
    let totalGameLosses = 0;
    let totalGameDraws = 0;
    let tournamentsWon = 0;
    
    // Tournament history
    const tournamentHistory = tournaments.map((tournament: Tournament) => {
      const playerInTournament = tournament.players.find((p: Player) => p.discordId === discordId);
      
      // Aggregate stats
      if (playerInTournament) {
        totalMatchWins += playerInTournament.matchWins || 0;
        totalMatchLosses += playerInTournament.matchLosses || 0;
        totalMatchDraws += playerInTournament.matchDraws || 0;
        totalGameWins += playerInTournament.gameWins || 0;
        totalGameLosses += playerInTournament.gameLosses || 0;
        totalGameDraws += playerInTournament.gameDraws || 0;
        
        if (playerInTournament.rank === 1) {
          tournamentsWon++;
        }
      }
      
      return {
        tournamentId: tournament._id,
        name: tournament.name,
        date: tournament.date,
        playerCount: tournament.playerCount || tournament.players.length,
        rank: playerInTournament?.rank || 0,
        matchWins: playerInTournament?.matchWins || 0,
        matchLosses: playerInTournament?.matchLosses || 0,
        matchDraws: playerInTournament?.matchDraws || 0,
        gameWins: playerInTournament?.gameWins || 0,
        gameLosses: playerInTournament?.gameLosses || 0,
        gameDraws: playerInTournament?.gameDraws || 0,
        points: playerInTournament?.points || 0
      };
    });
    
    return {
      discordId,
      username: playerData?.username || 'Unknown Player',
      matchWins: totalMatchWins,
      matchLosses: totalMatchLosses,
      matchDraws: totalMatchDraws,
      gameWins: totalGameWins,
      gameLosses: totalGameLosses,
      gameDraws: totalGameDraws,
      tournamentsPlayed: tournaments.length,
      tournamentsWon,
      tournamentHistory
    };
  } catch (error) {
    console.error('Error fetching player:', error);
    return null;
  }
}

// Get head-to-head records for a player
export async function getPlayerHeadToHead(discordId: string) {
  const client = await clientPromise;
  const db = client.db();
  
  try {
    // Find all tournaments where this player participated
    const tournaments = await db
      .collection('tournaments')
      .find({ 'players.discordId': discordId })
      .toArray() as Tournament[];
    
    // Track opponents and records
    const opponentRecords: Record<string, OpponentRecord> = {};
    
    // Process all tournaments to extract head-to-head records
    tournaments.forEach((tournament: Tournament) => {
      if (!tournament.rounds) return;
      
      tournament.rounds.forEach((round: Round) => {
        if (!round.matches) return;
        
        round.matches.forEach((match: Match) => {
          // Skip bye matches
          if (match.isBye) return;
          
          // Determine if player is player1 or player2
          const isPlayer1 = match.player1Id === discordId;
          const isPlayer2 = match.player2Id === discordId;
          
          // Skip if player is not involved
          if (!isPlayer1 && !isPlayer2) return;
          
          // Determine opponent
          const opponentId = isPlayer1 ? match.player2Id : match.player1Id;
          
          if (!opponentId) return; // Skip if no opponent
          
          // Get opponent name
          const opponent = tournament.players.find((p: Player) => p.discordId === opponentId);
          if (!opponent) return;
          
          // Initialize opponent record if not exists
          if (!opponentRecords[opponentId]) {
            opponentRecords[opponentId] = {
              discordId: opponentId,
              username: opponent.username,
              matchWins: 0,
              matchLosses: 0,
              matchDraws: 0,
              gameWins: 0,
              gameLosses: 0
            };
          }
          
          // Update match record
          if (match.winnerId === discordId) {
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
    
    // Convert to array and sort by most games played
    return Object.values(opponentRecords)
      .sort((a: OpponentRecord, b: OpponentRecord) => 
        (b.matchWins + b.matchLosses + b.matchDraws) - 
        (a.matchWins + a.matchLosses + a.matchDraws)
      );
  } catch (error) {
    console.error('Error fetching head-to-head records:', error);
    return [];
  }
}

// Get leaderboard rankings based on tournament placements
export async function getLeaderboard() {
  const client = await clientPromise;
  const db = client.db();
  
  try {
    // Get all tournaments
    const tournaments = await db
      .collection('tournaments')
      .find({})
      .toArray();
    
    // Create a map to track player scores and stats
    const playerMap: Record<string, {
      discordId: string;
      username: string;
      leaderboardPoints: number;
      tournamentsPlayed: number;
      firstPlace: number;
      secondPlace: number;
      thirdPlace: number;
      matchWins: number;
      matchLosses: number;
      matchDraws: number;
      gameWins: number;
      gameLosses: number;
      gameDraws: number;
    }> = {};
    
    // Process each tournament to extract player points
    tournaments.forEach(tournament => {
      if (!tournament.players || tournament.players.length === 0) return;
      
      // Process each player in the tournament
      tournament.players.forEach((player: Player) => {
        if (!player.discordId || !player.username) return;
        
        // Initialize player in map if not exists
        if (!playerMap[player.discordId]) {
          playerMap[player.discordId] = {
            discordId: player.discordId,
            username: player.username,
            leaderboardPoints: 0,
            tournamentsPlayed: 0,
            firstPlace: 0,
            secondPlace: 0,
            thirdPlace: 0,
            matchWins: 0,
            matchLosses: 0,
            matchDraws: 0,
            gameWins: 0,
            gameLosses: 0,
            gameDraws: 0
          };
        }
        
        // Increment tournaments played
        playerMap[player.discordId].tournamentsPlayed++;
        
        // Add points based on placement
        if (player.rank === 1) {
          playerMap[player.discordId].leaderboardPoints += 5;
          playerMap[player.discordId].firstPlace++;
        } else if (player.rank === 2) {
          playerMap[player.discordId].leaderboardPoints += 3;
          playerMap[player.discordId].secondPlace++;
        } else if (player.rank === 3) {
          playerMap[player.discordId].leaderboardPoints += 1;
          playerMap[player.discordId].thirdPlace++;
        }
        
        // Accumulate match and game stats
        playerMap[player.discordId].matchWins += player.matchWins || 0;
        playerMap[player.discordId].matchLosses += player.matchLosses || 0;
        playerMap[player.discordId].matchDraws += player.matchDraws || 0;
        playerMap[player.discordId].gameWins += player.gameWins || 0;
        playerMap[player.discordId].gameLosses += player.gameLosses || 0;
        playerMap[player.discordId].gameDraws += player.gameDraws || 0;
      });
    });
    
    // Convert to array and sort by leaderboard points
    const leaderboard = Object.values(playerMap).sort((a, b) => {
      // First sort by points (descending)
      if (b.leaderboardPoints !== a.leaderboardPoints) {
        return b.leaderboardPoints - a.leaderboardPoints;
      }
      
      // Tiebreaker 1: First place finishes
      if (b.firstPlace !== a.firstPlace) {
        return b.firstPlace - a.firstPlace;
      }
      
      // Tiebreaker 2: Second place finishes
      if (b.secondPlace !== a.secondPlace) {
        return b.secondPlace - a.secondPlace;
      }
      
      // Tiebreaker 3: Third place finishes
      if (b.thirdPlace !== a.thirdPlace) {
        return b.thirdPlace - a.thirdPlace;
      }
      
      // Tiebreaker 4: Match win percentage
      const aMatchTotal = a.matchWins + a.matchLosses + a.matchDraws;
      const bMatchTotal = b.matchWins + b.matchLosses + b.matchDraws;
      
      const aWinPct = aMatchTotal > 0 ? (a.matchWins / aMatchTotal) : 0;
      const bWinPct = bMatchTotal > 0 ? (b.matchWins / bMatchTotal) : 0;
      
      return bWinPct - aWinPct;
    });
    
    return leaderboard;
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return [];
  }
} 