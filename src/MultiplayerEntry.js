// Update a player's color in Firestore
import { arrayRemove } from "firebase/firestore";

async function updatePlayerColor(gameId, playerName, color) {
  const gameRef = doc(collection(db, "games"), gameId.toUpperCase());
  const gameSnap = await getDoc(gameRef);
  if (!gameSnap.exists()) return;
  const data = gameSnap.data();
  const players = data.players || [];
  // Remove old player object
  const oldPlayer = players.find((p) => p.name === playerName);
  if (!oldPlayer) return;
  await updateDoc(gameRef, {
    players: arrayRemove(oldPlayer)
  });
  // Add updated player object with new color
  await updateDoc(gameRef, {
    players: arrayUnion({ ...oldPlayer, color })
  });
}
import React, { useState } from "react";
import { db } from "./firebase";
import { collection, doc, setDoc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";

export default function MultiplayerEntry({ onJoin }) {
  const [gameId, setGameId] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [joined, setJoined] = useState(false);
  const [showContinue, setShowContinue] = useState(false);
  const [error, setError] = useState('');

  function generateGameId() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (!playerName.trim()) { setError("Enter your name"); return; }
    setLoading(true);
    try {
      const newGameId = generateGameId();
      const gameRef = doc(collection(db, "games"), newGameId);
      await setDoc(gameRef, {
        players: [{ name: playerName, color: null, position: 0, zchutPoints: 1000, money: 2000, missTurn: false, index: 0 }],
        currentPlayerIndex: 0,
        gameStarted: false,
        created: Date.now(),
      });
      setLoading(false);
      onJoin(newGameId, playerName);
    } catch (err) {
      setError("Failed to create game");
      setLoading(false);
    }
  }

  async function handleJoin(e) {
    e.preventDefault();
    setError("");
    if (!gameId || !playerName) return;
    try {
      const gameRef = doc(collection(db, "games"), gameId.toUpperCase());
      const gameSnap = await getDoc(gameRef);
      if (!gameSnap.exists()) {
        setError("Game not found");
        return;
      }
      const data = gameSnap.data();
      const already = (data.players || []).some((p) => p.name === playerName);
      if (!already) {
        await updateDoc(gameRef, {
          players: arrayUnion({ name: playerName, color: null, position: 0, zchutPoints: 1000, money: 2000, missTurn: false, index: data.players.length })
        });
      }
      setJoined(true);
      setShowContinue(true);
    } catch (e) {
      setError("Failed to join or create game. Try again.");
    }
  }

  const handleContinue = () => {
    onJoin(gameId, playerName);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 80 }}>
      <h2>Join Multiplayer Game</h2>
      {!joined && (
        <>
          <input
            placeholder="Game ID"
            value={gameId}
            onChange={e => setGameId(e.target.value)}
            style={{ margin: 8, padding: 8, fontSize: 18 }}
          />
          <input
            placeholder="Your Name"
            value={playerName}
            onChange={e => setPlayerName(e.target.value)}
            style={{ margin: 8, padding: 8, fontSize: 18 }}
          />
          <button
            onClick={handleJoin}
            style={{ margin: 12, padding: '10px 32px', fontSize: 20 }}
            disabled={!gameId || !playerName}
          >
            Join Game
          </button>
          {error && <div style={{ color: "red", marginTop: 8 }}>{error}</div>}
        </>
      )}
      {joined && (
        <>
          <div style={{ margin: 16, fontSize: 20, color: "#007bff" }}>
            <b>Game ID:</b> {gameId}
          </div>
          <div style={{ margin: 8 }}>Share this code with other players to join the same game.</div>
          {/* Color selection UI */}
          <div style={{ margin: 12 }}>
            <label htmlFor="color-select">Choose your color: </label>
            <select id="color-select" onChange={async (e) => {
              const color = e.target.value;
              if (color) {
                await updatePlayerColor(gameId, playerName, color);
                // Optionally, you can force a refresh or notify parent to reload player list
              }
            }} defaultValue="">
              <option value="" disabled>Pick a color</option>
              <option value="red">Red</option>
              <option value="blue">Blue</option>
              <option value="green">Green</option>
              <option value="yellow">Yellow</option>
              <option value="purple">Purple</option>
              <option value="black">Black</option>
            </select>
          </div>
          <button
            onClick={handleContinue}
            style={{ margin: 18, padding: "10px 32px", fontSize: 20, background: "#28a745", color: "#fff", border: "none", borderRadius: 8 }}
          >
            Continue to Game
          </button>
        </>
      )}
    </div>
  );

  function generateGameId() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (!playerName.trim()) { setError("Enter your name"); return; }
    setLoading(true);
    try {
      const newGameId = generateGameId();
      const gameRef = doc(collection(db, "games"), newGameId);
      await setDoc(gameRef, {
        players: [{ name: playerName, color: null, position: 0, zchutPoints: 1000, money: 2000, missTurn: false, index: 0 }],
        currentPlayerIndex: 0,
        gameStarted: false,
        created: Date.now(),
      });
      setLoading(false);
      onGameReady(newGameId, playerName);
    } catch (err) {
      setError("Failed to create game");
      setLoading(false);
    }
  }

  async function handleJoin(e) {
    e.preventDefault();
    if (!playerName.trim() || !gameId.trim()) { setError("Enter your name and game code"); return; }
    setLoading(true);
    try {
      const gameRef = doc(collection(db, "games"), gameId.toUpperCase());
      const snap = await getDoc(gameRef);
      if (!snap.exists()) { setError("Game not found"); setLoading(false); return; }
      const data = snap.data();
      const playerIndex = data.players.length;
      await updateDoc(gameRef, {
        players: arrayUnion({ name: playerName, color: null, position: 0, zchutPoints: 1000, money: 2000, missTurn: false, index: playerIndex })
      });
      setLoading(false);
      onGameReady(gameId.toUpperCase(), playerName);
    } catch (err) {
      setError("Failed to join game");
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: "40px auto", padding: 24, border: "1px solid #ccc", borderRadius: 12, background: "#f9f9f9" }}>
      <h2>Multiplayer Entry</h2>
      <div style={{ marginBottom: 12 }}>
        <label>
          <input type="radio" checked={mode === "join"} onChange={() => setMode("join")}/> Join Game
        </label>
        <label style={{ marginLeft: 16 }}>
          <input type="radio" checked={mode === "create"} onChange={() => setMode("create")}/> Create Game
        </label>
      </div>
      <form onSubmit={mode === "join" ? handleJoin : handleCreate}>
        {mode === "join" && (
          <div style={{ marginBottom: 10 }}>
            <input
              type="text"
              placeholder="Game ID"
              value={gameId}
              onChange={e => setGameId(e.target.value)}
              style={{ width: "100%", padding: 8 }}
            />
          </div>
        )}
        <div style={{ marginBottom: 10 }}>
          <input
            type="text"
            placeholder="Your Name"
            value={playerName}
            onChange={e => setPlayerName(e.target.value)}
            style={{ width: "100%", padding: 8 }}
          />
        </div>
        <button type="submit" style={{ width: "100%", padding: 10, background: "#007bff", color: "#fff", border: "none", borderRadius: 6 }} disabled={loading}>
          {loading ? "Please wait..." : mode === "join" ? "Join Game" : "Create Game"}
        </button>
      </form>
      {error && <div style={{ color: "red", marginTop: 10 }}>{error}</div>}
    </div>
  );
}
