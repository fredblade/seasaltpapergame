Create a complete, modern single-page web application for the card game Sea Salt & Paper (the origami sea-themed card game by Bombyx / Pandasaurus Games).
Core Requirements:

Local multiplayer support: One player hosts a game on their device (acts as server). Other players on the same local network (WiFi) join via browser by entering the host's IP:port or scanning a QR code. Use WebSockets for real-time sync (no external servers needed).
Tech stack: Vanilla JavaScript / TypeScript + HTML + CSS (Tailwind or plain modern CSS). Use Node.js + Express + Socket.io for the backend if needed, or pure browser WebRTC / WebSockets with a simple local server option. Make it easy to run locally (provide clear setup instructions).
Fully playable for 2–4 players.
Responsive design: Works great on desktop, tablets, and mobile (portrait for players).

Game Features to Implement:

Deck & Cards:
Faithful digital representation of the cards (describe or placeholder with text + emoji/art descriptions initially; use beautiful SVG or image assets for origami sea themes: fish, crabs, boats, mermaids, etc.).
Card values/points, colors, and special Duo (pair) effects: Crab (take from discard), Boat (extra turn), Fish (draw extra), etc.
Two discard piles (visible to all).

Game Flow:
Setup: Shuffle deck, deal cards, create two discard piles.
Turn structure: Draw 2 from deck (keep 1, discard 1) OR take from a discard pile → Play any Duo pairs for effects → Option to call STOP or LAST CHANCE.
Scoring: Hand points + color bonus. Handle "Last Chance" risk/reward properly.
Special rules: 4 Mermaids instant win, event cards if included, etc.
Multiple rounds until a player reaches the target score (30/35/40 depending on player count).

Multiplayer Mechanics:
Host creates lobby → generates shareable link/QR code with local IP.
Players join and see their private hand + shared table (deck, discards, played cards).
Real-time turn indicator, animations for draws/discards/plays.
Chat for table talk.
Spectators optional.

UI/UX:
Beautiful ocean/origami aesthetic (soft blues, paper textures, subtle animations for folding/revealing cards).
Drag-and-drop or click-to-play cards.
Clear player areas, score tracking, round history.
Tutorial / rules popover with official rules summary.
Sound effects optional (draw, play, win).

Technical Details:
Persistent game state on host.
Handle disconnections gracefully.
Offline/single-player vs AI mode as bonus (simple greedy AI).
Provide full project structure with package.json, server file, client files.
Easy local run: npm install && npm run dev (or similar).
No external dependencies beyond what's needed for local WebSockets.


Output the complete code in a well-organized way (separate files via markdown code blocks), with comments, and a README.md with setup + how to host locally for friends.
Make it fun, polished, and as close as possible to the physical game experience.

rules.md for game rules