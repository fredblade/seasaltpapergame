// Client WebSocket Controller
const socket = io();

// State variables
let currentRoomCode = null;
let myId = null;
let currentGameState = null;
let selectedHandCardIds = [];
let wasMyTurnLastState = false;
let hostNetworkInfo = null;

// Web Audio Synth Sound Effects
function playSound(type) {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;

    if (type === 'click') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
      osc.start(now);
      osc.stop(now + 0.08);
    } else if (type === 'draw') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(660, now + 0.25);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.25);
    } else if (type === 'play') {
      osc.type = 'sine';
      // Play a quick 3-tone arpeggio
      osc.frequency.setValueAtTime(261.63, now); // C4
      osc.frequency.setValueAtTime(329.63, now + 0.06); // E4
      osc.frequency.setValueAtTime(392.00, now + 0.12); // G4
      osc.frequency.exponentialRampToValueAtTime(784.00, now + 0.35); // G5
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.35);
    } else if (type === 'chime') {
      osc.type = 'sine';
      // High bell chime
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.setValueAtTime(1320, now + 0.08);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
      osc.start(now);
      osc.stop(now + 0.4);
    }
  } catch (e) {
    console.warn('Audio context creation blocked or failed:', e);
  }
}

// Show game alert/toast notifications
function showToast(message) {
  let toast = document.getElementById('toast-notification');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast-notification';
    toast.className = 'toast-msg';
    document.body.appendChild(toast);
  }
  toast.innerText = message;
  toast.classList.add('show');
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3500);
}

// Generate QR code for local network sharing
function generateLobbyQR(ip, port, roomCode) {
  const joinUrl = `http://${ip}:${port}/?room=${roomCode}`;
  const canvas = document.getElementById('lobby-qr');
  if (!canvas) return;

  new QRious({
    element: canvas,
    value: joinUrl,
    size: 150,
    background: 'white',
    foreground: '#020b1e',
    level: 'M'
  });
  
  const urlDisplay = document.getElementById('lobby-url');
  if (urlDisplay) {
    urlDisplay.innerText = joinUrl;
  }
}

function updateLobbyShareLink(roomCode) {
  const urlDisplay = document.getElementById('lobby-url');
  if (!roomCode || !hostNetworkInfo) {
    return;
  }

  generateLobbyQR(hostNetworkInfo.ip, hostNetworkInfo.port, roomCode);

  if (urlDisplay) {
    urlDisplay.innerText = `http://${hostNetworkInfo.ip}:${hostNetworkInfo.port}/?room=${roomCode}`;
  }
}

// Document ready entry
document.addEventListener('DOMContentLoaded', () => {
  // Populate Room Code from query parameters if present
  const urlParams = new URLSearchParams(window.location.search);
  const urlRoomCode = urlParams.get('room');
  if (urlRoomCode) {
    document.getElementById('input-room-code').value = urlRoomCode.toUpperCase();
  }

  // Socket setup
  socket.on('connect', () => {
    myId = socket.id;
    console.log('Connected to server, Socket ID:', myId);
    socket.emit('request_host_info');
  });

  socket.on('host_info', ({ ip, port }) => {
    hostNetworkInfo = { ip, port };
    if (currentRoomCode) {
      updateLobbyShareLink(currentRoomCode);
    }
  });

  socket.on('room_created', (roomCode) => {
    currentRoomCode = roomCode;
    document.getElementById('screen-login').classList.remove('active');
    document.getElementById('screen-lobby').classList.add('active');
    document.getElementById('lobby-room-code').innerText = roomCode;

    updateLobbyShareLink(roomCode);
  });

  socket.on('join_error', (errorMsg) => {
    showToast(errorMsg);
  });

  socket.on('alert_message', (msg) => {
    showToast(msg);
  });

  socket.on('crab_choice_pending', () => {
    openCrabModal();
  });

  socket.on('game_state', (state) => {
    currentGameState = state;
    currentRoomCode = state.code;
    myId = socket.id;
    updateGameUI(state);
  });

  // Welcome Screen actions
  document.getElementById('btn-create-room').addEventListener('click', () => {
    const name = document.getElementById('input-nickname').value.trim();
    const avatar = document.querySelector('.avatar-option.selected').dataset.avatar;
    socket.emit('create_room', { name, avatar });
  });

  document.getElementById('btn-join-room').addEventListener('click', () => {
    const name = document.getElementById('input-nickname').value.trim();
    const roomCode = document.getElementById('input-room-code').value.trim().toUpperCase();
    const avatar = document.querySelector('.avatar-option.selected').dataset.avatar;
    
    if (!roomCode || roomCode.length !== 4) {
      showToast('Please enter a valid 4-letter Room Code.');
      return;
    }
    
    socket.emit('join_room', { roomCode, name, avatar });
  });

  // Avatar Selection toggle
  document.querySelectorAll('.avatar-option').forEach(opt => {
    opt.addEventListener('click', (e) => {
      document.querySelectorAll('.avatar-option').forEach(el => el.classList.remove('selected'));
      e.target.classList.add('selected');
    });
  });

  // Lobby actions
  document.getElementById('btn-ready-toggle').addEventListener('click', () => {
    if (currentRoomCode) {
      socket.emit('ready_toggle', currentRoomCode);
    }
  });

  document.getElementById('btn-lobby-exit').addEventListener('click', () => {
    window.location.reload();
  });

  // Game Board action handlers
  document.getElementById('draw-deck').addEventListener('click', () => {
    if (!isMyTurn() || currentGameState.drawChoice.length > 0) return;
    playSound('draw');
    socket.emit('draw_deck', currentRoomCode);
  });

  document.getElementById('discard-pile-0').addEventListener('click', () => {
    if (!isMyTurn() || currentGameState.drawChoice.length > 0) return;
    if (document.getElementById('discard-pile-0').classList.contains('empty')) return;
    playSound('draw');
    socket.emit('draw_discard', { roomCode: currentRoomCode, pileIndex: 0 });
  });

  document.getElementById('discard-pile-1').addEventListener('click', () => {
    if (!isMyTurn() || currentGameState.drawChoice.length > 0) return;
    if (document.getElementById('discard-pile-1').classList.contains('empty')) return;
    playSound('draw');
    socket.emit('draw_discard', { roomCode: currentRoomCode, pileIndex: 1 });
  });

  // Duo cards playing button
  document.getElementById('btn-play-duo').addEventListener('click', () => {
    if (selectedHandCardIds.length !== 2) return;
    
    const cardId1 = selectedHandCardIds[0];
    const cardId2 = selectedHandCardIds[1];
    
    const c1 = currentGameState.myHand.find(c => c.id === cardId1);
    const c2 = currentGameState.myHand.find(c => c.id === cardId2);

    if ((c1.name === 'Shark' && c2.name === 'Swimmer') || (c1.name === 'Swimmer' && c2.name === 'Shark')) {
      // Steal: Open player selection modal
      openStealModal(cardId1, cardId2);
    } else {
      playSound('play');
      socket.emit('play_duo', { roomCode: currentRoomCode, cardId1, cardId2 });
      selectedHandCardIds = [];
      updateSelectionBar();
    }
  });

  // End turn controls
  document.getElementById('btn-end-turn').addEventListener('click', () => {
    if (!isMyTurn()) return;
    selectedHandCardIds = [];
    updateSelectionBar();
    if (currentGameState.status === 'last_chance') {
      socket.emit('end_turn_last_chance', currentRoomCode);
    } else {
      socket.emit('end_turn', currentRoomCode);
    }
  });

  document.getElementById('btn-call-stop').addEventListener('click', () => {
    if (!isMyTurn()) return;
    socket.emit('end_round_call', { roomCode: currentRoomCode, type: 'STOP' });
  });

  document.getElementById('btn-call-last-chance').addEventListener('click', () => {
    if (!isMyTurn()) return;
    socket.emit('end_round_call', { roomCode: currentRoomCode, type: 'LAST_CHANCE' });
  });

  // Exit scores modal
  document.getElementById('btn-scores-ready').addEventListener('click', () => {
    socket.emit('ready_toggle', currentRoomCode);
    document.getElementById('modal-scores').classList.remove('active');
  });

  // Sidebar Log controls
  document.getElementById('btn-toggle-log').addEventListener('click', () => {
    document.getElementById('modal-log').classList.add('active');
  });

  document.getElementById('btn-close-log').addEventListener('click', () => {
    document.getElementById('modal-log').classList.remove('active');
  });
});

// Check if socket matches active turn index
function isMyTurn() {
  if (!currentGameState) return false;
  return currentGameState.waitingPlayerId === myId;
}

// Update the Game Layout DOM
function updateGameUI(state) {
  // Screen routing
  if (state.status === 'lobby') {
    const gameScreenActive = document.getElementById('screen-game').classList.contains('active');
    // Check if we have scoring totals to display (round ended)
    const hasScores = state.players.some(p => p.score > 0 || p.roundScore > 0);
    if (hasScores && gameScreenActive) {
      openScoresModal(state);
    } else {
      document.getElementById('screen-login').classList.remove('active');
      document.getElementById('screen-game').classList.remove('active');
      document.getElementById('screen-lobby').classList.add('active');
      document.getElementById('lobby-room-code').innerText = state.code;
      currentRoomCode = state.code;
      updateLobbyPlayers(state.players);
      updateLobbyShareLink(state.code);
    }
    return;
  }

  if (state.status === 'game_over') {
    document.getElementById('screen-lobby').classList.remove('active');
    document.getElementById('screen-game').classList.add('active');
    openScoresModal(state, true);
    return;
  }

  // Active game play phase
  document.getElementById('screen-login').classList.remove('active');
  document.getElementById('screen-lobby').classList.remove('active');
  document.getElementById('screen-game').classList.add('active');

  // Header stats
  document.getElementById('game-room-code-display').innerText = state.code;
  document.getElementById('game-target-score').innerText = state.targetScore;

  // Turn index banner message
  const activePlayer = state.players.find(p => p.id === state.waitingPlayerId);
  const banner = document.getElementById('turn-banner');
  if (activePlayer) {
    if (state.waitingPlayerId === myId) {
      banner.innerText = "⭐ YOUR TURN ⭐";
      banner.className = "active-turn-banner my-turn";
    } else {
      banner.innerText = `${activePlayer.avatar} ${activePlayer.name}'s turn`;
      banner.className = "active-turn-banner";
    }
  }

  // Draw Deck Count
  document.getElementById('deck-count').innerText = state.deckCount;
  if (state.deckCount === 0) {
    document.getElementById('draw-deck').classList.add('disabled');
  } else {
    document.getElementById('draw-deck').classList.remove('disabled');
  }

  // Discard Piles
  for (let i = 0; i < 2; i++) {
    const pile = state.discardPiles[i];
    const el = document.getElementById(`discard-pile-${i}`);
    const sizeEl = document.getElementById(`pile-${i}-size`);
    
    sizeEl.innerText = `${pile.length} cards`;

    if (pile.topCard) {
      el.classList.remove('empty');
      el.innerHTML = renderCardMarkup(pile.topCard);
    } else {
      el.classList.add('empty');
      el.innerHTML = '<span class="empty-text">Empty</span>';
    }
  }

  // Opponents list row
  const opponentsContainer = document.getElementById('opponents-panel');
  opponentsContainer.innerHTML = '';
  state.players.forEach(p => {
    if (p.id === myId) return;

    const opCard = document.createElement('div');
    opCard.className = `opponent-card ${p.id === state.waitingPlayerId ? 'active-turn' : ''}`;
    
    // Group opponent played cards visually
    let playedMarkup = '';
    if (p.playedCards && p.playedCards.length > 0) {
      // Group them by pairs
      for (let i = 0; i < p.playedCards.length; i += 2) {
        const c1 = p.playedCards[i];
        const c2 = p.playedCards[i + 1];
        if (c1 && c2) {
          playedMarkup += `
            <div class="opp-tableau-card" style="background-color: var(--color-${c1.color.toLowerCase().replace(' ', '-')}); border-color: rgba(255,255,255,0.15);">
              ${c1.emoji}${c2.emoji}
            </div>
          `;
        }
      }
    } else {
      playedMarkup = '<span style="font-size:0.7rem; color: rgba(255,255,255,0.15)">No played cards</span>';
    }

    opCard.innerHTML = `
      <div class="opponent-summary">
        <span class="opp-avatar">${p.avatar}</span>
        <div class="opp-meta">
          <span class="opp-name">${p.name} ${p.isCaller ? '📣' : ''}</span>
          <span class="opp-stats">Score: <strong>${p.score}</strong> | Hand: <strong>${p.handCount}</strong> cards</span>
        </div>
      </div>
      <div class="opp-tableau">
        ${playedMarkup}
      </div>
    `;
    opponentsContainer.appendChild(opCard);
  });

  // Player Hand
  const handContainer = document.getElementById('player-hand');
  handContainer.innerHTML = '';
  state.myHand.forEach(card => {
    const cardEl = document.createElement('div');
    cardEl.className = `card-item ${selectedHandCardIds.includes(card.id) ? 'selected' : ''}`;
    cardEl.dataset.color = card.color;
    cardEl.dataset.id = card.id;
    cardEl.innerHTML = renderCardInnerMarkup(card);

    cardEl.addEventListener('click', () => {
      toggleCardSelection(card.id);
    });

    handContainer.appendChild(cardEl);
  });

  document.getElementById('hand-count').innerText = state.myHand.length;
  document.getElementById('hand-points-preview').innerText = `${state.myRoundPoints} pts`;

  // Player Played Tableau
  const tableauContainer = document.getElementById('player-tableau');
  tableauContainer.innerHTML = '';
  if (state.myPlayed && state.myPlayed.length > 0) {
    for (let i = 0; i < state.myPlayed.length; i += 2) {
      const c1 = state.myPlayed[i];
      const c2 = state.myPlayed[i + 1];
      if (c1 && c2) {
        const setWrapper = document.createElement('div');
        setWrapper.className = 'played-set-wrapper';
        
        const card1 = document.createElement('div');
        card1.className = 'card-item';
        card1.dataset.color = c1.color;
        card1.innerHTML = renderCardInnerMarkup(c1);

        const card2 = document.createElement('div');
        card2.className = 'card-item';
        card2.dataset.color = c2.color;
        card2.innerHTML = renderCardInnerMarkup(c2);

        setWrapper.appendChild(card1);
        setWrapper.appendChild(card2);
        tableauContainer.appendChild(setWrapper);
      }
    }
  } else {
    tableauContainer.innerHTML = '<span class="empty-notice">No pairs played this round yet.</span>';
  }

  // Sidebar Log History
  const logContainer = document.getElementById('actions-log-container');
  logContainer.innerHTML = '';
  state.actionsLog.forEach(log => {
    const logEl = document.createElement('div');
    logEl.className = 'log-entry';
    logEl.innerText = log;
    logContainer.appendChild(logEl);
  });
  logContainer.scrollTop = logContainer.scrollHeight;

  // Turn phases and Button enables
  const myTurn = isMyTurn();
  
  // Chime when it's the player's turn for the first time
  if (myTurn && !wasMyTurnLastState) {
    playSound('chime');
  }
  wasMyTurnLastState = myTurn;
  
  // Enable/disable draw clicks
  const drawDeckEl = document.getElementById('draw-deck');
  const d0 = document.getElementById('discard-pile-0');
  const d1 = document.getElementById('discard-pile-1');

  if (myTurn && state.drawChoice.length === 0 && selectedHandCardIds.length === 0 && !state.myHasDrawnThisTurn) {
    drawDeckEl.classList.remove('disabled');
    d0.classList.remove('disabled');
    d1.classList.remove('disabled');
  } else {
    drawDeckEl.classList.add('disabled');
    d0.classList.add('disabled');
    d1.classList.add('disabled');
  }

  // End turn, STOP, and LAST CHANCE button status
  const btnEndTurn = document.getElementById('btn-end-turn');
  const btnStop = document.getElementById('btn-call-stop');
  const btnLastChance = document.getElementById('btn-call-last-chance');

  if (myTurn && isActionPhase(state)) {
    btnEndTurn.removeAttribute('disabled');
    
    // Enable STOP and LAST CHANCE if score >= 7
    if (state.myRoundPoints >= 7 && state.status === 'playing') {
      btnStop.removeAttribute('disabled');
      btnLastChance.removeAttribute('disabled');
    } else {
      btnStop.setAttribute('disabled', 'true');
      btnLastChance.setAttribute('disabled', 'true');
    }
  } else {
    btnEndTurn.setAttribute('disabled', 'true');
    btnStop.setAttribute('disabled', 'true');
    btnLastChance.setAttribute('disabled', 'true');
  }

  // Open drawn choice picker modal if active choice list exists
  if (myTurn && state.drawChoice.length === 2) {
    openDrawChoiceModal(state.drawChoice);
  } else {
    closeDrawChoiceModal();
  }

  updateSelectionBar();
}

// Update lobby screen list of connected players
function updateLobbyPlayers(players) {
  const container = document.getElementById('lobby-players-list');
  container.innerHTML = '';
  document.getElementById('lobby-players-count').innerText = players.length;

  players.forEach(p => {
    const el = document.createElement('div');
    el.className = `player-item ${p.ready ? 'ready' : ''}`;
    el.innerHTML = `
      <span class="player-item-avatar">${p.avatar}</span>
      <div class="player-item-info">
        <span class="player-item-name">${p.name} ${p.id === socket.id ? '(You)' : ''}</span>
        <span class="player-item-status">${p.ready ? 'Ready' : 'Joining...'}</span>
      </div>
    `;
    container.appendChild(el);
  });
}

// Determines if draw was completed and player is in action phase
function isActionPhase(state) {
  // Action phase starts only after the mandatory draw option is completed.
  return !!state.myHasDrawnThisTurn && state.drawChoice.length === 0;
}

// Card render templates
function renderCardMarkup(card) {
  return `
    <div class="card-item" data-color="${card.color}">
      ${renderCardInnerMarkup(card)}
    </div>
  `;
}

function renderCardInnerMarkup(card) {
  return `
    <div class="card-header-info">
      <span>${card.name}</span>
    </div>
    <div class="card-emoji">${card.emoji}</div>
    <div class="card-footer-info">
      <span class="card-symbol">${card.symbol}</span>
      <span style="font-size:0.55rem; font-weight: 700;">${card.type.toUpperCase().substring(0,4)}</span>
    </div>
  `;
}

// Handles selecting/toggling cards in player hand
function toggleCardSelection(cardId) {
  const idx = selectedHandCardIds.indexOf(cardId);
  if (idx === -1) {
    selectedHandCardIds.push(cardId);
  } else {
    selectedHandCardIds.splice(idx, 1);
  }

  // Rerender selected class toggles directly on hand row to avoid full payload redraw delay
  const handChildren = document.getElementById('player-hand').children;
  for (const child of handChildren) {
    const id = child.dataset.id;
    if (selectedHandCardIds.includes(id)) {
      child.classList.add('selected');
    } else {
      child.classList.remove('selected');
    }
  }

  updateSelectionBar();
}

// Update the duo card play bar
function updateSelectionBar() {
  const bar = document.getElementById('action-control-bar');
  const text = document.getElementById('selection-status-text');
  const btn = document.getElementById('btn-play-duo');

  if (selectedHandCardIds.length === 2 && isMyTurn()) {
    const c1 = currentGameState.myHand.find(c => c.id === selectedHandCardIds[0]);
    const c2 = currentGameState.myHand.find(c => c.id === selectedHandCardIds[1]);
    
    if (c1 && c2) {
      const isCrabs = c1.name === 'Crab' && c2.name === 'Crab';
      const isBoats = c1.name === 'Boat' && c2.name === 'Boat';
      const isFish = c1.name === 'Fish' && c2.name === 'Fish';
      const isSharkSwimmer = (c1.name === 'Shark' && c2.name === 'Swimmer') || (c1.name === 'Swimmer' && c2.name === 'Shark');

      if (isCrabs || isBoats || isFish || isSharkSwimmer) {
        bar.classList.add('active');
        text.innerText = `Ready to play Duo pair: ${c1.emoji} + ${c2.emoji}!`;
        btn.removeAttribute('disabled');
        return;
      }
    }
  }
  
  bar.classList.remove('active');
  btn.setAttribute('disabled', 'true');
}

// MODAL: Rules Modal toggle
function toggleRulesModal() {
  const el = document.getElementById('modal-rules');
  el.classList.toggle('active');
}

// MODAL: Drawn 2 Keep 1 choice modal
function openDrawChoiceModal(choiceCards) {
  const modal = document.getElementById('modal-draw-picker');
  
  const c0 = document.getElementById('draw-card-0');
  const c1 = document.getElementById('draw-card-1');

  c0.className = 'draw-choice-card';
  c0.innerHTML = renderCardMarkup(choiceCards[0]);

  c1.className = 'draw-choice-card';
  c1.innerHTML = renderCardMarkup(choiceCards[1]);

  modal.classList.add('active');

  // Keep actions
  document.getElementById('btn-keep-0').onclick = () => {
    showPileDiscardOptions(choiceCards[0].id, choiceCards[1].id);
  };
  document.getElementById('btn-keep-1').onclick = () => {
    showPileDiscardOptions(choiceCards[1].id, choiceCards[0].id);
  };
}

function showPileDiscardOptions(keepId, discardId) {
  document.getElementById('draw-discard-pile-selection').style.display = 'block';
  
  document.getElementById('btn-discard-pile-0').onclick = () => {
    socket.emit('resolve_draw_choice', {
      roomCode: currentRoomCode,
      keepId,
      discardId,
      pileIndex: 0
    });
  };

  document.getElementById('btn-discard-pile-1').onclick = () => {
    socket.emit('resolve_draw_choice', {
      roomCode: currentRoomCode,
      keepId,
      discardId,
      pileIndex: 1
    });
  };
}

function closeDrawChoiceModal() {
  document.getElementById('modal-draw-picker').classList.remove('active');
  document.getElementById('draw-discard-pile-selection').style.display = 'none';
}

// MODAL: Crab selector from discard piles
function openCrabModal() {
  const modal = document.getElementById('modal-crab-picker');
  modal.classList.add('active');

  const showPile = (pileIdx) => {
    const grid = document.getElementById('crab-cards-grid');
    grid.innerHTML = '';
    
    const pile = currentGameState.discardPiles[pileIdx];
    if (pile && pile.length > 0) {
      // Loop through all cards in the discard pile (crabs can fetch any!)
      socket.emit('request_full_discard_pile', { roomCode: currentRoomCode, pileIndex: pileIdx });
    } else {
      grid.innerHTML = '<span class="empty-notice">Discard pile is empty.</span>';
    }
  };

  // Setup tabs
  const tab1 = document.getElementById('tab-pile-1');
  const tab2 = document.getElementById('tab-pile-2');

  tab1.onclick = () => {
    tab1.classList.add('active');
    tab2.classList.remove('active');
    renderCrabList(0);
  };

  tab2.onclick = () => {
    tab2.classList.add('active');
    tab1.classList.remove('active');
    renderCrabList(1);
  };

  renderCrabList(0);
}

// Requesting entire discard pile cards list from server
// In server.js we can listen to this request and reply with raw list
socket.on('full_discard_pile_response', ({ pileIndex, cards }) => {
  const grid = document.getElementById('crab-cards-grid');
  grid.innerHTML = '';
  
  if (cards.length === 0) {
    grid.innerHTML = '<span class="empty-notice">Discard pile is empty.</span>';
    return;
  }

  cards.forEach(card => {
    const el = document.createElement('div');
    el.className = 'card-item';
    el.dataset.color = card.color;
    el.innerHTML = renderCardInnerMarkup(card);
    
    el.addEventListener('click', () => {
      socket.emit('resolve_crab_choice', {
        roomCode: currentRoomCode,
        pileIndex,
        cardId: card.id
      });
      document.getElementById('modal-crab-picker').classList.remove('active');
    });
    grid.appendChild(el);
  });
});

function renderCrabList(pileIdx) {
  socket.emit('request_full_discard_pile', { roomCode: currentRoomCode, pileIndex: pileIdx });
}

// Add simple handler on server to reply with full discard cards (since client obfuscates state)
// Let's ensure server has list handler. Wait!
// In client.js, we requested 'request_full_discard_pile'.
// Let's add the socket listener in server.js! Let's do that in a follow-up or check if we already have it.
// Oh, we didn't add the server socket handler for 'request_full_discard_pile' in server.js!
// Let's make sure we add it to the server.js file. I will check the file edits for server.js to add it.

// MODAL: Steal random card modal (Shark + Swimmer)
function openStealModal(cardId1, cardId2) {
  const modal = document.getElementById('modal-steal-picker');
  const container = document.getElementById('steal-opponents-list');
  container.innerHTML = '';
  
  modal.classList.add('active');

  currentGameState.players.forEach(p => {
    if (p.id === myId) return;

    const btn = document.createElement('button');
    btn.className = 'btn btn-steal-target';
    btn.innerHTML = `
      <span>${p.avatar} ${p.name}</span>
      <span class="points-badge">${p.handCount} cards in hand</span>
    `;

    btn.onclick = () => {
      socket.emit('play_duo', {
        roomCode: currentRoomCode,
        cardId1,
        cardId2,
        targetId: p.id
      });
      modal.classList.remove('active');
      selectedHandCardIds = [];
      updateSelectionBar();
    };

    container.appendChild(btn);
  });

  if (container.children.length === 0) {
    container.innerHTML = '<span class="empty-notice">No opponents to steal from.</span>';
  }
}

// MODAL: Scores breakdown modal
function openScoresModal(state, isGameOver = false) {
  const modal = document.getElementById('modal-scores');
  const title = document.getElementById('scores-title');
  const body = document.getElementById('scores-table-body');
  
  title.innerText = isGameOver ? "🏆 FINAL GAME STANDINGS 🏆" : "Round Scoring Breakdown";
  body.innerHTML = '';

  state.players.forEach(p => {
    const row = document.createElement('tr');
    
    // We can't calculate breakdown on the client directly since we don't have opponents' hands,
    // but the server can calculate and send the breakdown!
    // Wait, did we send player points breakdown in game_state?
    // Let's update server.js to calculate and send scores breakdown for each player in game_state at round end!
    // Yes! Let's double check server.js for how we resolve round:
    // In server.js:
    // We update p.score, p.roundScore, p.colorBonus, etc.
    // Let's send the breakdown fields along with playersState!

    row.innerHTML = `
      <td>
        <div class="score-row-player">
          <span>${p.avatar}</span>
          <span>${p.name}</span>
        </div>
      </td>
      <td>${p.playedCards ? p.playedCards.length / 2 : 0}</td>
      <td>-</td>
      <td>-</td>
      <td>-</td>
      <td>${p.colorBonus}</td>
      <td><strong>${p.roundScore}</strong></td>
      <td><strong>${p.score}</strong></td>
    `;
    body.appendChild(row);
  });

  modal.classList.add('active');

  const btnReady = document.getElementById('btn-scores-ready');
  if (isGameOver) {
    btnReady.innerText = "Back to Main Menu";
    btnReady.onclick = () => {
      window.location.reload();
    };
  } else {
    btnReady.innerText = "Ready for Next Round";
    btnReady.onclick = () => {
      socket.emit('ready_toggle', currentRoomCode);
      modal.classList.remove('active');
    };
  }
}
