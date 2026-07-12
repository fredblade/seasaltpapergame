const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const os = require('os');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 3000;

// Serve static assets from public folder
app.use(express.static(path.join(__dirname, 'public')));

// Fetch local IP address for networking
function getLocalIp() {
  const interfaces = os.networkInterfaces();
  const ipv4Addresses = [];

  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        ipv4Addresses.push(iface.address);
      }
    }
  }

  const privateAddress = ipv4Addresses.find((address) => {
    return (
      address.startsWith('10.') ||
      address.startsWith('192.168.') ||
      /^172\.(1[6-9]|2\d|3[0-1])\./.test(address)
    );
  });

  return privateAddress || ipv4Addresses[0] || 'localhost';
}

const LOCAL_IP = getLocalIp();

// Complete 58-card base deck matching cards.json and verify-deck.js
const DECK = [
  // 4 Mermaids (White)
  { id: 'm1', name: 'Mermaid', type: 'special', color: 'White', emoji: '🧜‍♀️', symbol: 'W' },
  { id: 'm2', name: 'Mermaid', type: 'special', color: 'White', emoji: '🧜‍♀️', symbol: 'W' },
  { id: 'm3', name: 'Mermaid', type: 'special', color: 'White', emoji: '🧜‍♀️', symbol: 'W' },
  { id: 'm4', name: 'Mermaid', type: 'special', color: 'White', emoji: '🧜‍♀️', symbol: 'W' },

  // Multipliers (4 cards)
  { id: 'mu1', name: 'Lighthouse', type: 'multiplier', color: 'Yellow', emoji: '🏠💡', symbol: 'Y' },
  { id: 'mu2', name: 'Shoal of Fish', type: 'special', color: 'Dark Blue', emoji: '🐠🐟', symbol: 'DB' },
  { id: 'mu3', name: 'Penguin Colony', type: 'special', color: 'Black', emoji: '🐧🐧🐧', symbol: 'B' },
  { id: 'mu4', name: 'Captain', type: 'multiplier', color: 'Lavender', emoji: '👨‍✈️', symbol: 'L' },

  // Sailors (2 cards)
  { id: 'sa1', name: 'Sailor', type: 'collector', color: 'Lavender', emoji: '🧭', symbol: 'L' },
  { id: 'sa2', name: 'Sailor', type: 'collector', color: 'Dark Blue', emoji: '🧭', symbol: 'DB' },

  // Penguins (3 cards)
  { id: 'pe1', name: 'Penguin', type: 'collector', color: 'Black', emoji: '🐧', symbol: 'B' },
  { id: 'pe2', name: 'Penguin', type: 'collector', color: 'Gray', emoji: '🐧', symbol: 'G' },
  { id: 'pe3', name: 'Penguin', type: 'collector', color: 'Turquoise', emoji: '🐧', symbol: 'T' },

  // Octopuses (5 cards)
  { id: 'oc1', name: 'Octopus', type: 'collector', color: 'Lavender', emoji: '🐙', symbol: 'L' },
  { id: 'oc2', name: 'Octopus', type: 'collector', color: 'Turquoise', emoji: '🐙', symbol: 'T' },
  { id: 'oc3', name: 'Octopus', type: 'collector', color: 'Green', emoji: '🐙', symbol: 'Gr' },
  { id: 'oc4', name: 'Octopus', type: 'collector', color: 'Black', emoji: '🐙', symbol: 'B' },
  { id: 'oc5', name: 'Octopus', type: 'collector', color: 'Dark Blue', emoji: '🐙', symbol: 'DB' },

  // Shells (6 cards)
  { id: 'sh1', name: 'Shell', type: 'collector', color: 'Turquoise', emoji: '🐚', symbol: 'T' },
  { id: 'sh2', name: 'Shell', type: 'collector', color: 'Yellow', emoji: '🐚', symbol: 'Y' },
  { id: 'sh3', name: 'Shell', type: 'collector', color: 'Green', emoji: '🐚', symbol: 'Gr' },
  { id: 'sh4', name: 'Shell', type: 'collector', color: 'Gray', emoji: '🐚', symbol: 'G' },
  { id: 'sh5', name: 'Shell', type: 'collector', color: 'Lavender', emoji: '🐚', symbol: 'L' },
  { id: 'sh6', name: 'Shell', type: 'collector', color: 'Pink', emoji: '🐚', symbol: 'P' },

  // Sharks (5 cards)
  { id: 'sk1', name: 'Shark', type: 'duo', color: 'Gray', emoji: '🦈', symbol: 'G' },
  { id: 'sk2', name: 'Shark', type: 'duo', color: 'Black', emoji: '🦈', symbol: 'B' },
  { id: 'sk3', name: 'Shark', type: 'duo', color: 'Dark Blue', emoji: '🦈', symbol: 'DB' },
  { id: 'sk4', name: 'Shark', type: 'duo', color: 'Gray', emoji: '🦈', symbol: 'G' },
  { id: 'sk5', name: 'Shark', type: 'duo', color: 'Green', emoji: '🦈', symbol: 'Gr' },

  // Swimmers (5 cards)
  { id: 'sw1', name: 'Swimmer', type: 'duo', color: 'Pink', emoji: '🏊', symbol: 'P' },
  { id: 'sw2', name: 'Swimmer', type: 'duo', color: 'Peach', emoji: '🏊', symbol: 'Pe' },
  { id: 'sw3', name: 'Swimmer', type: 'duo', color: 'Yellow', emoji: '🏊', symbol: 'Y' },
  { id: 'sw4', name: 'Swimmer', type: 'duo', color: 'Turquoise', emoji: '🏊', symbol: 'T' },
  { id: 'sw5', name: 'Swimmer', type: 'duo', color: 'Green', emoji: '🏊', symbol: 'Gr' },

  // Fish (7 cards)
  { id: 'fi1', name: 'Fish', type: 'duo', color: 'Dark Blue', emoji: '🐟', symbol: 'DB' },
  { id: 'fi2', name: 'Fish', type: 'duo', color: 'Dark Blue', emoji: '🐟', symbol: 'DB' },
  { id: 'fi3', name: 'Fish', type: 'duo', color: 'Turquoise', emoji: '🐟', symbol: 'T' },
  { id: 'fi4', name: 'Fish', type: 'duo', color: 'Turquoise', emoji: '🐟', symbol: 'T' },
  { id: 'fi5', name: 'Fish', type: 'duo', color: 'Yellow', emoji: '🐟', symbol: 'Y' },
  { id: 'fi6', name: 'Fish', type: 'duo', color: 'Green', emoji: '🐟', symbol: 'Gr' },
  { id: 'fi7', name: 'Fish', type: 'duo', color: 'Black', emoji: '🐟', symbol: 'B' },

  // Boats (8 cards)
  { id: 'bo1', name: 'Boat', type: 'duo', color: 'Dark Blue', emoji: '⛵', symbol: 'DB' },
  { id: 'bo2', name: 'Boat', type: 'duo', color: 'Dark Blue', emoji: '⛵', symbol: 'DB' },
  { id: 'bo3', name: 'Boat', type: 'duo', color: 'Turquoise', emoji: '⛵', symbol: 'T' },
  { id: 'bo4', name: 'Boat', type: 'duo', color: 'Turquoise', emoji: '⛵', symbol: 'T' },
  { id: 'bo5', name: 'Boat', type: 'duo', color: 'Yellow', emoji: '⛵', symbol: 'Y' },
  { id: 'bo6', name: 'Boat', type: 'duo', color: 'Black', emoji: '⛵', symbol: 'B' },
  { id: 'bo7', name: 'Boat', type: 'duo', color: 'Peach', emoji: '⛵', symbol: 'Pe' },
  { id: 'bo8', name: 'Boat', type: 'duo', color: 'Yellow', emoji: '⛵', symbol: 'Y' },

  // Crabs (9 cards)
  { id: 'cr1', name: 'Crab', type: 'duo', color: 'Dark Blue', emoji: '🦀', symbol: 'DB' },
  { id: 'cr2', name: 'Crab', type: 'duo', color: 'Turquoise', emoji: '🦀', symbol: 'T' },
  { id: 'cr3', name: 'Crab', type: 'duo', color: 'Yellow', emoji: '🦀', symbol: 'Y' },
  { id: 'cr4', name: 'Crab', type: 'duo', color: 'Yellow', emoji: '🦀', symbol: 'Y' },
  { id: 'cr5', name: 'Crab', type: 'duo', color: 'Black', emoji: '🦀', symbol: 'B' },
  { id: 'cr6', name: 'Crab', type: 'duo', color: 'Black', emoji: '🦀', symbol: 'B' },
  { id: 'cr7', name: 'Crab', type: 'duo', color: 'Green', emoji: '🦀', symbol: 'Gr' },
  { id: 'cr8', name: 'Crab', type: 'duo', color: 'Orange', emoji: '🦀', symbol: 'O' },
  { id: 'cr9', name: 'Crab', type: 'duo', color: 'Tan', emoji: '🦀', symbol: 'Ta' }
];

const rooms = {};

// Helper to shuffle a list of elements
function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Calculate the points of a player's hand and table cards
function calculateScore(hand, playedCards) {
  const allCards = [...hand, ...playedCards];
  const counts = {};
  const colors = {};

  allCards.forEach(c => {
    counts[c.name] = (counts[c.name] || 0) + 1;
    colors[c.color] = (colors[c.color] || 0) + 1;
  });

  let score = 0;
  const breakdown = {
    duos: 0,
    collectors: 0,
    multipliers: 0,
    mermaids: 0,
    total: 0
  };

  // 1. Duo Pairs (1 pt per pair)
  const duoPairs = {
    Crab: Math.floor((counts['Crab'] || 0) / 2),
    Boat: Math.floor((counts['Boat'] || 0) / 2),
    Fish: Math.floor((counts['Fish'] || 0) / 2),
    SharkSwimmer: Math.min(counts['Shark'] || 0, counts['Swimmer'] || 0)
  };
  const duoPoints = Object.values(duoPairs).reduce((sum, v) => sum + v, 0);
  score += duoPoints;
  breakdown.duos = duoPoints;

  // 2. Collector Sets
  // Shell: 2->2, 3->4, 4->6, 5->8, 6->10
  const shellCount = counts['Shell'] || 0;
  const shellPoints = shellCount >= 2 ? (shellCount - 1) * 2 : 0;
  score += shellPoints;

  // Octopus: 2->3, 3->6, 4->9, 5->12
  const octopusCount = counts['Octopus'] || 0;
  const octopusPoints = octopusCount >= 2 ? (octopusCount - 1) * 3 : 0;
  score += octopusPoints;

  // Penguin: 1->1, 2->3, 3->5
  const penguinCount = counts['Penguin'] || 0;
  const penguinPoints = penguinCount === 1 ? 1 : penguinCount === 2 ? 3 : penguinCount === 3 ? 5 : 0;
  score += penguinPoints;

  // Sailor: 2->5
  const sailorCount = counts['Sailor'] || 0;
  const sailorPoints = sailorCount === 2 ? 5 : 0;
  score += sailorPoints;

  breakdown.collectors = shellPoints + octopusPoints + penguinPoints + sailorPoints;

  // 3. Multiplier Cards
  let multiplierPoints = 0;
  if (counts['Lighthouse']) {
    multiplierPoints += (counts['Boat'] || 0); // +1 per Boat
  }
  if (counts['Shoal of Fish']) {
    multiplierPoints += (counts['Fish'] || 0); // +1 per Fish
  }
  if (counts['Penguin Colony']) {
    multiplierPoints += (counts['Penguin'] || 0) * 2; // +2 per Penguin
  }
  if (counts['Captain']) {
    multiplierPoints += (counts['Sailor'] || 0) * 3; // +3 per Sailor
  }
  score += multiplierPoints;
  breakdown.multipliers = multiplierPoints;

  // 4. Mermaid Cards
  // White is treated as a valid color group (includes Mermaids themselves)
  const mermaidCount = counts['Mermaid'] || 0;
  let mermaidPoints = 0;
  if (mermaidCount > 0) {
    // Sort color groups by size in descending order
    const sortedColorGroups = Object.entries(colors)
      .map(([color, qty]) => ({ color, qty }))
      .sort((a, b) => b.qty - a.qty);

    // Score successive color sets for each mermaid card
    for (let i = 0; i < mermaidCount; i++) {
      if (sortedColorGroups[i]) {
        mermaidPoints += sortedColorGroups[i].qty;
      }
    }
  }
  score += mermaidPoints;
  breakdown.mermaids = mermaidPoints;

  breakdown.total = score;
  return { score, breakdown, mermaidCount };
}

// Calculate the Color Bonus for a hand/played set
function calculateColorBonus(hand, playedCards) {
  const allCards = [...hand, ...playedCards];
  const colors = {};
  allCards.forEach(c => {
    colors[c.color] = (colors[c.color] || 0) + 1;
  });
  const maxQty = Math.max(0, ...Object.values(colors));
  return maxQty;
}

// Check if a player has achieved the 4-Mermaid Instant Win
function checkInstantWin(players) {
  for (const player of players) {
    const allCards = [...player.hand, ...player.playedCards];
    const mermaids = allCards.filter(c => c.name === 'Mermaid');
    if (mermaids.length === 4) {
      return player; // returns winning player object
    }
  }
  return null;
}

// Broadcast updated game state to all players in a room
function broadcastState(roomCode) {
  const room = rooms[roomCode];
  if (!room) return;

  // Obfuscate opponent hands
  const playersState = room.players.map(p => ({
    id: p.id,
    name: p.name,
    avatar: p.avatar,
    ready: p.ready,
    score: p.score,
    roundScore: p.roundScore,
    colorBonus: p.colorBonus,
    playedCards: p.playedCards,
    handCount: p.hand.length,
    isCaller: room.lastChanceCaller === p.id,
    totalPoints: p.score + p.roundScore
  }));

  // Send state individually to each socket so they see their own private hand
  room.players.forEach(p => {
    const fullState = {
      code: room.code,
      status: room.status,
      players: playersState,
      deckCount: room.deck.length,
      discardPiles: room.discardPiles.map(pile => ({
        topCard: pile.length > 0 ? pile[pile.length - 1] : null,
        length: pile.length
      })),
      turnIndex: room.turnIndex,
      extraTurn: room.extraTurn,
      lastChanceCaller: room.lastChanceCaller,
      lastChanceTurnsLeft: room.lastChanceTurnsLeft,
      actionsLog: room.actionsLog,
      targetScore: room.targetScore,
      drawChoice: room.drawChoice,
      myHasDrawnThisTurn: room.players[room.turnIndex] ? (room.players[room.turnIndex].id === p.id && room.hasDrawnThisTurn) : false,
      waitingPlayerId: room.players[room.turnIndex] ? room.players[room.turnIndex].id : null,
      myHand: p.hand,
      myPlayed: p.playedCards,
      myRoundPoints: calculateScore(p.hand, p.playedCards).score
    };
    io.to(p.id).emit('game_state', fullState);
  });
}

// Log a game action message
function logAction(room, message) {
  room.actionsLog.push(`[${new Date().toLocaleTimeString()}] ${message}`);
  // Cap history size to 100 entries
  if (room.actionsLog.length > 100) room.actionsLog.shift();
}

// Start a new round
function startRound(room) {
  room.deck = shuffle(DECK);
  room.discardPiles = [[], []];

  // Set up discard piles
  room.discardPiles[0].push(room.deck.pop());
  room.discardPiles[1].push(room.deck.pop());

  // Reset player round hands
  room.players.forEach(p => {
    p.hand = [];
    p.playedCards = [];
    p.roundScore = 0;
    p.colorBonus = 0;
  });

  room.status = 'playing';
  room.lastChanceCaller = null;
  room.lastChanceTurnsLeft = 0;
  room.extraTurn = false;
  room.hasDrawnThisTurn = false;
  room.drawChoice = [];

  // Determine target score based on player count
  const n = room.players.length;
  room.targetScore = n === 2 ? 40 : n === 3 ? 35 : 30;

  logAction(room, "A new round has started. Draw deck shuffled, discard piles initialized.");
  broadcastState(room.code);
}

// Run the score calculations at the end of a round
function resolveRound(room, wasVoid = false) {
  if (wasVoid) {
    logAction(room, "The draw pile ran out of cards! No points are scored this round.");
    room.players.forEach(p => {
      p.roundScore = 0;
    });
  } else {
    // Check if an instant win occurred (4 mermaids)
    const instantWinner = checkInstantWin(room.players);
    if (instantWinner) {
      logAction(room, `INSTANT VICTORY! ${instantWinner.name} collected all 4 Mermaid cards!`);
      room.players.forEach(p => {
        if (p.id === instantWinner.id) {
          p.score += 100; // Large score bump to guarantee match win
          p.roundScore = 100;
        } else {
          p.roundScore = 0;
        }
      });
      room.status = 'game_over';
      broadcastState(room.code);
      return;
    }

    if (room.lastChanceCaller) {
      // LAST CHANCE evaluation
      const caller = room.players.find(p => p.id === room.lastChanceCaller);
      const callerScore = calculateScore(caller.hand, caller.playedCards).score;

      // Find highest score among everyone
      const scores = room.players.map(p => ({
        id: p.id,
        score: calculateScore(p.hand, p.playedCards).score,
        name: p.name
      }));
      const maxScore = Math.max(...scores.map(s => s.score));

      const isCallerHighest = callerScore >= maxScore;

      if (isCallerHighest) {
        logAction(room, `${caller.name} successfully won their Last Chance bet with ${callerScore} points!`);
        room.players.forEach(p => {
          const colorBonus = calculateColorBonus(p.hand, p.playedCards);
          p.colorBonus = colorBonus;
          if (p.id === caller.id) {
            p.roundScore = callerScore + colorBonus;
            p.score += p.roundScore;
          } else {
            p.roundScore = colorBonus;
            p.score += p.roundScore;
          }
        });
      } else {
        const bestOpponent = scores.find(s => s.score === maxScore && s.id !== caller.id);
        logAction(room, `${caller.name} failed their Last Chance bet! ${bestOpponent.name} has the highest score of ${maxScore} points.`);
        room.players.forEach(p => {
          const colorBonus = calculateColorBonus(p.hand, p.playedCards);
          p.colorBonus = colorBonus;
          if (p.id === caller.id) {
            p.roundScore = colorBonus;
            p.score += p.roundScore;
          } else {
            const cardScore = calculateScore(p.hand, p.playedCards).score;
            p.roundScore = cardScore;
            p.score += p.roundScore;
          }
        });
      }
    } else {
      // STOP evaluation
      logAction(room, "Standard round scoring (STOP called). All players reveal and score cards.");
      room.players.forEach(p => {
        const cardScore = calculateScore(p.hand, p.playedCards).score;
        p.roundScore = cardScore;
        p.score += p.roundScore;
      });
    }
  }

  // Check match end condition
  const matchWinner = room.players.find(p => p.score >= room.targetScore);
  if (matchWinner) {
    // Find the player with the highest total score
    let highestScorer = room.players[0];
    room.players.forEach(p => {
      if (p.score > highestScorer.score) highestScorer = p;
    });
    logAction(room, `MATCH OVER! ${highestScorer.name} wins the match with ${highestScorer.score} total points!`);
    room.status = 'game_over';
  } else {
    room.status = 'lobby';
    room.players.forEach(p => {
      p.ready = false;
    });
    logAction(room, "Round scoring complete. Returning to Lobby. Ready up to start the next round!");
  }

  broadcastState(room.code);
}

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  // Handle client requesting host network URL
  socket.on('request_host_info', () => {
    socket.emit('host_info', { ip: LOCAL_IP, port: PORT });
  });

  // Host room creation
  socket.on('create_room', ({ name, avatar }) => {
    let roomCode = '';
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    do {
      roomCode = '';
      for (let i = 0; i < 4; i++) {
        roomCode += chars.charAt(Math.floor(Math.random() * chars.length));
      }
    } while (rooms[roomCode]);

    rooms[roomCode] = {
      code: roomCode,
      status: 'lobby',
      players: [
        {
          id: socket.id,
          name: name || 'Host',
          avatar: avatar || '🐙',
          ready: false,
          score: 0,
          roundScore: 0,
          colorBonus: 0,
          hand: [],
          playedCards: []
        }
      ],
      deck: [],
      discardPiles: [[], []],
      turnIndex: 0,
      extraTurn: false,
      hasDrawnThisTurn: false,
      drawChoice: [],
      lastChanceCaller: null,
      lastChanceTurnsLeft: 0,
      actionsLog: [`Room ${roomCode} created by ${name || 'Host'}.`],
      targetScore: 40
    };

    socket.join(roomCode);
    socket.emit('room_created', roomCode);
    console.log(`Room created: ${roomCode} by client ${socket.id}`);
    broadcastState(roomCode);
  });

  // Client joining room
  socket.on('join_room', ({ roomCode, name, avatar }) => {
    const room = rooms[roomCode];
    if (!room) {
      socket.emit('join_error', 'Room not found.');
      return;
    }
    if (room.status !== 'lobby') {
      socket.emit('join_error', 'Game is already in progress.');
      return;
    }
    if (room.players.length >= 4) {
      socket.emit('join_error', 'Room is full (max 4 players).');
      return;
    }

    // Map socket to player seat
    room.players.push({
      id: socket.id,
      name: name || `Player ${room.players.length + 1}`,
      avatar: avatar || '🐟',
      ready: false,
      score: 0,
      roundScore: 0,
      colorBonus: 0,
      hand: [],
      playedCards: []
    });

    socket.join(roomCode);
    logAction(room, `${name || `Player ${room.players.length}`} joined the room.`);
    console.log(`Client ${socket.id} joined room ${roomCode}`);
    broadcastState(roomCode);
  });

  // Toggle ready status
  socket.on('ready_toggle', (roomCode) => {
    const room = rooms[roomCode];
    if (!room) return;

    const player = room.players.find(p => p.id === socket.id);
    if (player) {
      player.ready = !player.ready;
      logAction(room, `${player.name} is ${player.ready ? 'READY' : 'NOT READY'}.`);
      broadcastState(roomCode);

      // Check if all players are ready and there are at least 2 players
      const allReady = room.players.every(p => p.ready);
      if (allReady && room.players.length >= 2) {
        startRound(room);
      }
    }
  });

  // Action: Draw cards
  socket.on('draw_deck', (roomCode) => {
    const room = rooms[roomCode];
    if (!room || (room.status !== 'playing' && room.status !== 'last_chance')) return;

    // Check if it's player's turn
    const activePlayer = room.players[room.turnIndex];
    if (activePlayer.id !== socket.id) return;

    if (room.hasDrawnThisTurn || room.drawChoice.length > 0) {
      socket.emit('alert_message', 'You can only perform one draw option per turn.');
      return;
    }

    if (room.deck.length < 2) {
      // Less than 2 cards in deck: round ends immediately as a void round
      logAction(room, "Draw pile has depleted below 2 cards.");
      resolveRound(room, true);
      return;
    }

    // Draw 2 cards for player choice
    const c1 = room.deck.pop();
    const c2 = room.deck.pop();
    room.drawChoice = [c1, c2];

    logAction(room, `${activePlayer.name} drew 2 cards from the deck.`);
    broadcastState(roomCode);
  });

  // Action: Choose drawn card
  socket.on('resolve_draw_choice', ({ roomCode, keepId, discardId, pileIndex }) => {
    const room = rooms[roomCode];
    if (!room || room.drawChoice.length === 0) return;

    const activePlayer = room.players[room.turnIndex];
    if (activePlayer.id !== socket.id) return;

    if (room.hasDrawnThisTurn) {
      socket.emit('alert_message', 'You have already completed your draw for this turn.');
      return;
    }

    if (pileIndex !== 0 && pileIndex !== 1) return;

    const keepCard = room.drawChoice.find(c => c.id === keepId);
    const discardCard = room.drawChoice.find(c => c.id === discardId);

    if (!keepCard || !discardCard) return;

    const otherPileIndex = pileIndex === 0 ? 1 : 0;
    if (room.discardPiles[pileIndex].length > 0 && room.discardPiles[otherPileIndex].length === 0) {
      socket.emit('alert_message', `You must discard onto Pile ${otherPileIndex + 1} because it is empty.`);
      return;
    }

    // Add selected card to hand
    activePlayer.hand.push(keepCard);

    // Place other card on chosen discard pile
    room.discardPiles[pileIndex].push(discardCard);

    // Clear choices
    room.drawChoice = [];
    room.hasDrawnThisTurn = true;

    logAction(room, `${activePlayer.name} kept one card and discarded ${discardCard.emoji} to Pile ${pileIndex + 1}.`);

    // Check for 4 Mermaids instant win
    const instantWinner = checkInstantWin(room.players);
    if (instantWinner) {
      resolveRound(room);
      return;
    }

    broadcastState(roomCode);
  });

  // Action: Take from discard pile
  socket.on('draw_discard', ({ roomCode, pileIndex }) => {
    const room = rooms[roomCode];
    if (!room || (room.status !== 'playing' && room.status !== 'last_chance')) return;

    const activePlayer = room.players[room.turnIndex];
    if (activePlayer.id !== socket.id) return;

    if (room.hasDrawnThisTurn || room.drawChoice.length > 0) {
      socket.emit('alert_message', 'You can only perform one draw option per turn.');
      return;
    }

    const pile = room.discardPiles[pileIndex];
    if (!pile || pile.length === 0) return;

    const card = pile.pop();
    activePlayer.hand.push(card);
    room.hasDrawnThisTurn = true;

    logAction(room, `${activePlayer.name} took the top card ${card.emoji} from Discard Pile ${pileIndex + 1}.`);

    // Check for 4 Mermaids instant win
    const instantWinner = checkInstantWin(room.players);
    if (instantWinner) {
      resolveRound(room);
      return;
    }

    broadcastState(roomCode);
  });

  // Action: Play a Duo pair
  socket.on('play_duo', ({ roomCode, cardId1, cardId2, targetId }) => {
    const room = rooms[roomCode];
    if (!room || (room.status !== 'playing' && room.status !== 'last_chance')) return;

    const activePlayer = room.players[room.turnIndex];
    if (activePlayer.id !== socket.id) return;

    if (!room.hasDrawnThisTurn || room.drawChoice.length > 0) {
      socket.emit('alert_message', 'You must complete exactly one draw option before playing a duo.');
      return;
    }

    const c1Index = activePlayer.hand.findIndex(c => c.id === cardId1);
    let tempHand = [...activePlayer.hand];
    if (c1Index === -1) return;
    const card1 = tempHand.splice(c1Index, 1)[0];

    const c2Index = tempHand.findIndex(c => c.id === cardId2);
    if (c2Index === -1) return;
    const card2 = tempHand.splice(c2Index, 1)[0];

    // Verify valid duo combination
    const isCrabs = card1.name === 'Crab' && card2.name === 'Crab';
    const isBoats = card1.name === 'Boat' && card2.name === 'Boat';
    const isFish = card1.name === 'Fish' && card2.name === 'Fish';
    const isSharkSwimmer = (card1.name === 'Shark' && card2.name === 'Swimmer') || (card1.name === 'Swimmer' && card2.name === 'Shark');

    if (!isCrabs && !isBoats && !isFish && !isSharkSwimmer) return;

    // Remove cards from hand
    activePlayer.hand = tempHand;

    // Place them in player's playedCards tableau (safe from theft)
    activePlayer.playedCards.push(card1, card2);

    logAction(room, `${activePlayer.name} played a duo: ${card1.emoji} + ${card2.emoji}.`);

    // Trigger effect
    if (isBoats) {
      room.extraTurn = true;
      logAction(room, `${activePlayer.name} earns an extra turn!`);
      broadcastState(roomCode);
    } else if (isFish) {
      if (room.deck.length > 0) {
        const topCard = room.deck.pop();
        activePlayer.hand.push(topCard);
        logAction(room, `${activePlayer.name} drew 1 card from the deck.`);
      } else {
        logAction(room, "Fish duo played, but draw pile is empty.");
      }
      broadcastState(roomCode);
    } else if (isSharkSwimmer) {
      const target = room.players.find(p => p.id === targetId);
      if (target && target.hand.length > 0 && target.id !== activePlayer.id) {
        // Steal random card from target's hand
        const idx = Math.floor(Math.random() * target.hand.length);
        const stolenCard = target.hand.splice(idx, 1)[0];
        activePlayer.hand.push(stolenCard);
        logAction(room, `${activePlayer.name} stole a card from ${target.name}'s hand!`);
      } else {
        logAction(room, "Shark + Swimmer played, but target is invalid or has no hand cards.");
      }
      broadcastState(roomCode);
    } else if (isCrabs) {
      // Trigger Crab choice state
      room.status = 'waiting_for_crab_choice';
      // Tell client to open discard choice view
      socket.emit('crab_choice_pending');
      broadcastState(roomCode);
    }
  });

  // Action: Crab selection from discard
  socket.on('resolve_crab_choice', ({ roomCode, pileIndex, cardId }) => {
    const room = rooms[roomCode];
    if (!room || room.status !== 'waiting_for_crab_choice') return;

    const activePlayer = room.players[room.turnIndex];
    if (activePlayer.id !== socket.id) return;

    const pile = room.discardPiles[pileIndex];
    if (!pile) return;

    const cardIdx = pile.findIndex(c => c.id === cardId);
    if (cardIdx === -1) return;

    const chosenCard = pile.splice(cardIdx, 1)[0];
    activePlayer.hand.push(chosenCard);

    room.status = 'playing';
    logAction(room, `${activePlayer.name} selected ${chosenCard.emoji} from Discard Pile ${pileIndex + 1} using the Crab duo effect.`);
    broadcastState(roomCode);
  });

  // Action: Request full discard pile for Crab selection
  socket.on('request_full_discard_pile', ({ roomCode, pileIndex }) => {
    const room = rooms[roomCode];
    if (!room) return;
    const pile = room.discardPiles[pileIndex] || [];
    socket.emit('full_discard_pile_response', { pileIndex, cards: pile });
  });

  // Action: End Turn
  socket.on('end_turn', (roomCode) => {
    const room = rooms[roomCode];
    if (!room || room.status !== 'playing') return;

    const activePlayer = room.players[room.turnIndex];
    if (activePlayer.id !== socket.id) return;

    if (!room.hasDrawnThisTurn || room.drawChoice.length > 0) {
      socket.emit('alert_message', 'You must complete exactly one draw option before ending your turn.');
      return;
    }

    // Check if deck is empty: if it runs out of cards, round ends in a void
    if (room.deck.length === 0) {
      resolveRound(room, true);
      return;
    }

    if (room.extraTurn) {
      room.extraTurn = false;
      room.hasDrawnThisTurn = false;
      room.drawChoice = [];
      logAction(room, `${activePlayer.name} starts their extra turn!`);
    } else {
      room.turnIndex = (room.turnIndex + 1) % room.players.length;
      room.hasDrawnThisTurn = false;
      room.drawChoice = [];
      const nextPlayer = room.players[room.turnIndex];
      logAction(room, `It is now ${nextPlayer.name}'s turn.`);
    }

    broadcastState(roomCode);
  });

  // Action: Call STOP or LAST CHANCE
  socket.on('end_round_call', ({ roomCode, type }) => {
    const room = rooms[roomCode];
    if (!room || room.status !== 'playing') return;

    const activePlayer = room.players[room.turnIndex];
    if (activePlayer.id !== socket.id) return;

    if (!room.hasDrawnThisTurn || room.drawChoice.length > 0) {
      socket.emit('alert_message', 'You must complete exactly one draw option before ending the round.');
      return;
    }

    // Verify player has at least 7 points
    const { score } = calculateScore(activePlayer.hand, activePlayer.playedCards);
    if (score < 7) {
      socket.emit('alert_message', 'You need at least 7 points to end the round!');
      return;
    }

    if (type === 'STOP') {
      logAction(room, `${activePlayer.name} called STOP!`);
      resolveRound(room);
    } else if (type === 'LAST_CHANCE') {
      logAction(room, `${activePlayer.name} declared LAST CHANCE! Opponents get one final turn.`);
      room.status = 'last_chance';
      room.lastChanceCaller = activePlayer.id;
      room.lastChanceTurnsLeft = room.players.length - 1;
      room.hasDrawnThisTurn = false;
      room.drawChoice = [];

      // Pass turn to next player
      room.turnIndex = (room.turnIndex + 1) % room.players.length;
      broadcastState(roomCode);
    }
  });

  // Action: Take turn during LAST CHANCE phase
  socket.on('last_chance_action', ({ roomCode, actionType, pileIndex, keepId, discardId, targetId, duoId1, duoId2 }) => {
    const room = rooms[roomCode];
    if (!room || room.status !== 'last_chance') return;

    const activePlayer = room.players[room.turnIndex];
    if (activePlayer.id !== socket.id) return;

    // Implement simple automated logic or handle standard play during Last Chance
    // Standard player turn in Last Chance works similar to standard, but advances count
    // In our simplified interface, we will reuse socket handlers, but we need to track turns left
  });

  // Standard client sockets can trigger end of turn in Last Chance
  socket.on('end_turn_last_chance', (roomCode) => {
    const room = rooms[roomCode];
    if (!room || room.status !== 'last_chance') return;

    const activePlayer = room.players[room.turnIndex];
    if (activePlayer.id !== socket.id) return;

    if (!room.hasDrawnThisTurn || room.drawChoice.length > 0) {
      socket.emit('alert_message', 'You must complete exactly one draw option before ending your final turn.');
      return;
    }

    room.lastChanceTurnsLeft--;
    room.hasDrawnThisTurn = false;
    room.drawChoice = [];

    if (room.lastChanceTurnsLeft <= 0) {
      resolveRound(room);
    } else {
      room.turnIndex = (room.turnIndex + 1) % room.players.length;
      const nextPlayer = room.players[room.turnIndex];
      logAction(room, `It is ${nextPlayer.name}'s final turn (Last Chance).`);
      broadcastState(roomCode);
    }
  });

  // Chat messages
  socket.on('send_chat', ({ roomCode, message }) => {
    const room = rooms[roomCode];
    if (!room) return;

    const player = room.players.find(p => p.id === socket.id);
    if (player) {
      const msgObject = {
        sender: player.name,
        avatar: player.avatar,
        text: message,
        time: new Date().toLocaleTimeString()
      };
      io.to(roomCode).emit('chat_message', msgObject);
    }
  });

  // Handle client disconnection
  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
    // Clean up players or find matching room
    for (const code of Object.keys(rooms)) {
      const room = rooms[code];
      const idx = room.players.findIndex(p => p.id === socket.id);
      if (idx !== -1) {
        const pName = room.players[idx].name;
        room.players.splice(idx, 1);
        logAction(room, `${pName} disconnected from the game.`);

        if (room.players.length === 0) {
          delete rooms[code];
          console.log(`Room ${code} is empty. Deleted.`);
        } else {
          // If in progress and active player disconnected, reset turn index
          if (room.status === 'playing' || room.status === 'last_chance') {
            room.turnIndex = room.turnIndex % room.players.length;
          }
          broadcastState(code);
        }
        break;
      }
    }
  });
});

server.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`  SEA SALT & PAPER - Server is running!`);
  console.log(`  Local Access:   http://localhost:${PORT}`);
  console.log(`  Network Access: http://${LOCAL_IP}:${PORT}`);
  console.log(`====================================================`);
});
