import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import { boardEvents } from "./data/boardEvents";
import { buildBoardPositions } from "./logic/gameUtils";

const socket = io("http://localhost:4000"); // Adjust port if needed

function AppSocketIO() {
  const [players, setPlayers] = useState([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [joined, setJoined] = useState(false);
  const [tzedakahAmount, setTzedakahAmount] = useState(0);
  const [zchutFundAmount, setZchutFundAmount] = useState(0);
  const [boardPositions] = useState(buildBoardPositions(1200, 100, 11));

  useEffect(() => {
    // Listen for state updates
    socket.on("state", (state) => {
      setPlayers(state.players || []);
      setCurrentPlayerIndex(state.currentPlayerIndex || 0);
      setTzedakahAmount(state.tzedakahAmount || 0);
      setZchutFundAmount(state.zchutFundAmount || 0);
    });
    // Request latest state on connect
    socket.on("connect", () => {
      socket.emit("getState");
    });
    return () => {
      socket.off("state");
      socket.off("connect");
    };
  }, []);

  const handleJoin = () => {
    if (!playerName) return;
    socket.emit("join", { name: playerName, position: 0, zchutPoints: 1000, money: 2000, missTurn: false, index: players.length });
    setJoined(true);
    // Request latest state after joining, and again after a short delay to ensure sync
    socket.emit("getState");
    setTimeout(() => {
      socket.emit("getState");
    }, 500);
  };

  return (
    <div style={{ textAlign: "center", marginTop: 60 }}>
      <h1>TorahPoly (Socket.IO)</h1>
      {!joined ? (
        <div>
          <input
            placeholder="Your Name"
            value={playerName}
            onChange={e => setPlayerName(e.target.value)}
            style={{ margin: 8, padding: 8, fontSize: 18 }}
          />
          <button onClick={handleJoin} style={{ margin: 12, padding: '10px 32px', fontSize: 20 }} disabled={!playerName}>
            Join Game
          </button>
        </div>
      ) : (
        <>
          <h2>Players</h2>
          <ul>
            {players.map((p, i) => (
              <li key={i} style={{ fontWeight: i === currentPlayerIndex ? "bold" : "normal" }}>
                {p.name} - Position: {p.position}, Zchut: {p.zchutPoints}, Money: ${p.money} {i === currentPlayerIndex && "(Your Turn)"}
              </li>
            ))}
          </ul>
          <div style={{ marginTop: 40 }}>
            <h3>Game Board</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', maxWidth: 600, margin: '0 auto' }}>
              {boardPositions.map((pos, idx) => (
                <div key={idx} style={{
                  width: 48, height: 48, border: '1px solid #ccc', margin: 2, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: players.some(p => p.position === idx) ? '#ffe082' : '#fff',
                  fontWeight: players.some(p => p.position === idx) ? 'bold' : 'normal',
                  fontSize: 14
                }}>
                  {idx}
                  {players.map((p, i) => p.position === idx && (
                    <span key={i} style={{ color: i === currentPlayerIndex ? 'red' : 'blue', marginLeft: 2 }}>
                      {p.name[0]}
                    </span>
                  ))}
                </div>
              ))}
            </div>
            {players.length > 0 && (
              <button
                style={{ marginTop: 24, padding: '10px 32px', fontSize: 18 }}
                disabled={players[currentPlayerIndex]?.name !== playerName}
                onClick={() => {
                  // Move player by 1 (for now, for demo)
                  socket.emit('updateState', {
                    players: players.map((p, i) => i === currentPlayerIndex ? { ...p, position: (p.position + 1) % boardPositions.length } : p),
                    currentPlayerIndex: (currentPlayerIndex + 1) % players.length
                  });
                }}
              >
                {players[currentPlayerIndex]?.name === playerName ? 'Move Forward' : 'Waiting...'}
              </button>
            )}
          </div>
          <div style={{ marginTop: 30, fontSize: 14, color: '#aaa' }}>
            <div>tzedakahAmount: {tzedakahAmount}</div>
            <div>zchutFundAmount: {zchutFundAmount}</div>
          </div>
        </>
      )}
    </div>
  );
}

export default AppSocketIO;