alled // Backup of working App.js before further multiplayer changes
// Saved on 2026-04-07

// --- Firebase Firestore Multiplayer Sync ---
import { db } from "./firebase";
import { doc, setDoc, updateDoc, arrayUnion, getDoc } from "firebase/firestore";
// --- Multiplayer Entry Minimal UI ---
import React, { useState, useEffect } from 'react';

function MultiplayerEntry({ onJoin }) {
  const [gameId, setGameId] = useState('');
  const [playerName, setPlayerName] = useState('');
  // Save player info to Firestore on join
  const handleJoin = async () => {
    if (!gameId || !playerName) return;
    const gameRef = doc(db, "games", gameId);
    const gameSnap = await getDoc(gameRef);
    if (!gameSnap.exists()) {
      // Create new game doc with this player
      await setDoc(gameRef, {
        players: [{ name: playerName, joined: Date.now() }],
        created: Date.now(),
      });
    } else {
      // Add player to existing game (if not already present)
      const data = gameSnap.data();
      const already = (data.players || []).some(p => p.name === playerName);
      if (!already) {
        await updateDoc(gameRef, {
          players: arrayUnion({ name: playerName, joined: Date.now() })
        });
      }
    }
    onJoin(gameId, playerName);
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 80 }}>
      <h2>Join Multiplayer Game</h2>
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
    </div>
  );
}


// --- Manna Foods Modal ---
function MannaFoodsModal({ open, onClose, currentPlayer, onPay }) {
  if (!open) return null;

  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    const amount = parseInt(inputValue);
    if (isNaN(amount) || amount <= 0) {
      setError("Invalid amount.");
      return;
            {players[currentPlayerIndex]?.name === multiplayer.playerName ? (
              <div style={{ marginTop: 20 }}>
                <h2>Roll Dice</h2>
                <div style={{ display: "flex", justifyContent: "center", gap: 20 }}>
                  <Dice sides={6} onRoll={rollDice} rollTime={1} />
                  <Dice sides={6} onRoll={rollDice} rollTime={1} />
                </div>
                <button onClick={endTurn} style={{ ...styles.button, marginTop: 15 }}>End Turn</button>
              </div>
            ) : (
              <div style={{ marginTop: 20, color: "#888" }}>
                <h2>Waiting for your turn...</h2>
              </div>
            )}
  };

  return (
    <div style={modalStyles.overlay}>
      <div style={modalStyles.modal}>
        <h2>Manna Foods</h2>
        <h3>The Gift That Keeps on Giving</h3>
        <p>Cover the cost of a Manna Foods Banquet</p>
        <p>Pay whatever price you like</p>
        <p>
          The next player that lands here returns your expense.<br />
          But the players after that? That is the gift that keeps on giving.
        </p>
        <input
          type="number"
          min="1"
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          placeholder="Enter amount"
          style={{ marginBottom: 8, padding: 6, fontSize: 16, borderRadius: 4, border: '1px solid #ccc' }}
        />
        <div style={{ color: 'red', minHeight: 20 }}>{error}</div>
        <button style={modalStyles.button} onClick={handleSubmit}>Pay</button>
        <button style={modalStyles.button} onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}

// src/App.js
// Duplicate import removed; already imported at the top
import { TorahPolyBoardButtons } from "./TorahPolyBoardButtons";
import MannaFoodsPayModal from "./MannaFoodsPayModal";

// --- Mazal Card Modal ---
import { mazalCards, harHaBayitCards, tzadikCard, parshaCard, tzadikCards } from "./TorahPolyBoardButtons";
// --- Parsha Card Modal ---
function ParshaCardModal({ open, onClose, currentPlayer, setPlayers }) {
  const [shownAnswers, setShownAnswers] = useState([]);
  const [claimedQuestions, setClaimedQuestions] = useState([]);
  const [cardIndex, setCardIndex] = useState(0); // 0: Noach, 1: Bereshit, etc.
  const [shuffled, setShuffled] = useState(false);
  const [cardsState, setCardsState] = useState(null);
  const [originalCards, setOriginalCards] = useState(null);
  useEffect(() => {
    if (open && !cardsState) {
      setCardsState(cards);
      setOriginalCards(cards);
      setShuffled(false);
      // Do not reset cardIndex here
    }
    if (!open && cardsState) {
      setCardsState(null);
      setOriginalCards(null);
      setShuffled(false);
      // Do not reset cardIndex here
    }
    // eslint-disable-next-line
  }, [open]);

  // Shuffle only the qa cards, keep deck cards in place
  const handleShuffle = () => {
    if (!cardsState) return;
    // Separate qa and deck cards
    const qaCards = cardsState.filter(card => card.type === 'qa');
    const deckCards = cardsState.filter(card => card.type === 'deck');
    // Shuffle qa cards
    const shuffledQa = [...qaCards];
    for (let i = shuffledQa.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledQa[i], shuffledQa[j] ] = [shuffledQa[j], shuffledQa[i]];
    }
    // Rebuild alternating array
    const newCards = [];
    let qaIdx = 0, deckIdx = 0;
    for (let i = 0; i < cardsState.length; i++) {
      if (cardsState[i].type === 'qa') {
        newCards.push(shuffledQa[qaIdx++]);
      } else {
        newCards.push(deckCards[deckIdx++]);
      }
    }
    setCardsState(newCards);
    setShuffled(true);
    setCardIndex(0);
    setShownAnswers([]);
    setClaimedQuestions([]);
  };

  // Restore original order
  const handleReturn = () => {
    if (originalCards) {
      setCardsState(originalCards);
      setShuffled(false);
      setCardIndex(0);
      setShownAnswers([]);
      setClaimedQuestions([]);
    }
  };

  if (!open) return null;
  // ...existing code...
}

// --- FIXED: Multiplayer lobby sync ---
  // Always use Firestore waitingRoom for lobbyPlayers in multiplayer mode
  const [lobbyPlayers, setLobbyPlayers] = useState([]);
  useEffect(() => {
    if (multiplayer.enabled && multiplayer.gameId) {
      let unsub = null;
      import('firebase/firestore').then(({ onSnapshot, doc }) => {
        const gameRef = doc(db, "games", multiplayer.gameId);
        unsub = onSnapshot(gameRef, (snap) => {
          const data = snap.data();
          if (data && data.gameState && Array.isArray(data.gameState.waitingRoom)) {
            setLobbyPlayers(data.gameState.waitingRoom);
          }
        });
      });
      return () => { if (unsub) unsub(); };
    } else {
      setLobbyPlayers(players);
    }
  }, [multiplayer.enabled, multiplayer.gameId, players]);

  // When adding a player in multiplayer, always update Firestore waitingRoom
  const addPlayer = async () => {
    if (!newPlayerName || !newPlayerColor) return;
    if (multiplayer.enabled && multiplayer.gameId) {
      const gameRef = doc(db, "games", multiplayer.gameId);
      const gameSnap = await getDoc(gameRef);
      let waitingRoom = [];
      if (gameSnap.exists()) {
        const data = gameSnap.data();
        const gs = data.gameState || {};
        waitingRoom = Array.isArray(gs.waitingRoom) ? gs.waitingRoom : [];
        // Prevent duplicate names/colors
        if (waitingRoom.some(p => p.name === newPlayerName)) {
          alert("Name already taken in this game!");
          return;
        }
        if (waitingRoom.some(p => p.color === newPlayerColor)) {
          alert("Color taken in this game! Please choose another.");
          return;
        }
      }
      // Add player to waitingRoom in Firestore
      await updateDoc(gameRef, {
        'gameState.waitingRoom': [...waitingRoom, { name: newPlayerName, color: newPlayerColor, joined: Date.now() }]
      });
      setNewPlayerName("");
      setNewPlayerColor("");
      return;
    }
    // Local mode fallback
    if (players.some((p) => p.color === newPlayerColor)) { alert("Color taken!"); return; }
    setPlayers([...players, { name: newPlayerName, color: newPlayerColor, position: 0, zchutPoints: 1000, money: 2000, missTurn: false, index: players.length }]);
    setNewPlayerName("");
    setNewPlayerColor("");
  };

      // After Firestore update, trigger special square logic on the client
      setTimeout(() => {
        const landedIndex = (players[currentPlayerIndex]?.position + steps) % boardPositions.length;
        // Only the current client whose turn it is should trigger events
        if (landedIndex === 0) {
          // Go: handled by money update above, but you can add a message if desired
        } else if (landedIndex === 10) {
          alert(`${players[currentPlayerIndex].name} has been exiled! Go back to Egypt and miss a turn. Slavery sucks.`);
          // Move to square 30 and set missTurn
          setPlayers(prevPlayers => {
            const updated = [...prevPlayers];
            updated[currentPlayerIndex].position = 30;
            updated[currentPlayerIndex].missTurn = true;
            return updated;
          });
        } else if (landedIndex === 16) {
          if (players[currentPlayerIndex].money >= 100) {
            setPlayers(prev => {
              const updated = [...prev];
              updated[currentPlayerIndex].money -= 100;
              return updated;
            });
            setTzedakahAmount(prev => prev + 100);
            alert(`${players[currentPlayerIndex].name} paid $100 to Tzedakah!`);
          } else {
            alert(`${players[currentPlayerIndex].name} does not have enough money to pay Tzedakah!`);
          }
        } else if (landedIndex === 17 || landedIndex === 31) {
          const stay = window.confirm(
            "Welcome to the Jewish Idea Yeshiva! You can leave the material world for a while and come and learn with us. You will miss next turn but get a stipend of 200 Torahpoly money and 400 Zchut. If you miss another turn your reward is doubled. And a third turn your reward is tripled. You will have to move on after the 3rd turn so we can make room for new students.\n\nDo you want to stay in Yeshiva this turn? (OK = Yes, Cancel = No)"
          );
          if (stay) {
            setYeshivaState(prev => ({ ...prev, [currentPlayerIndex]: { count: 1, active: true } }));
            setPlayers(prevPlayers => prevPlayers.map((p, idx) =>
              idx === currentPlayerIndex
                ? { ...p, money: (typeof p.money === 'number' ? p.money : 0) + 200, zchutPoints: (p.zchutPoints || 0) + 400, missTurn: true }
                : p
            ));
            setCurrentPlayerIndex(prev => (players.length > 0 ? (prev + 1) % players.length : 0));
          }
          // If player chooses not to stay, do nothing special and let the turn continue
        } else if (landedIndex === 20) {
          if (tzedakahAmount > 0 || zchutFundAmount > 0) {
            setPlayers(prev => {
              const updated = [...prev];
              if (tzedakahAmount > 0) {
                updated[currentPlayerIndex].money += tzedakahAmount;
              }
              if (zchutFundAmount > 0) {
                updated[currentPlayerIndex].zchutPoints = (updated[currentPlayerIndex].zchutPoints || 0) + zchutFundAmount;
              }
              return updated;
            });
            let msg = `${players[currentPlayerIndex].name} collected`;
            if (tzedakahAmount > 0) msg += ` $${tzedakahAmount}`;
            if (zchutFundAmount > 0) msg += `${tzedakahAmount > 0 ? ' and' : ''} ${zchutFundAmount} Zchut`;
            msg += ' from the fund!';
            alert(msg);
            setTzedakahAmount(0);
            setZchutFundAmount(0);
          } else {
            alert("Both the Tzedakah and Zchut funds are empty.");
          }
        } else if (landedIndex === 21) {
          alert("How could you sell your brother for 20 shekels?? Roll the dice and pay 50 times the amount in zchut and torahpoly money to the Tzedakah fund. Maybe you will find some atonement.");
          setPendingSellBrother(true);
          setSellBrotherPlayerIndex(currentPlayerIndex);
        } else if (landedIndex === 25) {
          if (mannaPayer === null) {
            setPendingMannaPay(true);
          } else if (currentPlayerIndex === mannaPayer) {
            // Owner landed again, do nothing
          } else {
            setPendingMannaPay(true);
          }
        } else if (boardEvents[landedIndex]?.type === "property") {
          setQaMode("property");
          setCurrentCard(boardEvents[landedIndex].card);
        }
      }, 400); // Wait for Firestore sync
  // Use lobbyPlayers for lobby UI everywhere

// --- Multiplayer Firestore real-time sync (main game state) ---
useEffect(() => {
  if (!multiplayer.enabled || !multiplayer.gameId) return;
  let unsub = null;
  import('firebase/firestore').then(({ onSnapshot, doc }) => {
    const gameRef = doc(db, "games", multiplayer.gameId);
    unsub = onSnapshot(gameRef, (snap) => {
      const data = snap.data();
      if (data && data.gameState) {
        // Always update all relevant state from Firestore
        const gs = data.gameState;
        setPlayers((gs.players || []).map((p, i) => ({
          ...p,
          color: p.color || ["black","purple","blue","brown","orange","red","green"][i % 7],
          index: i
        })));
        setCurrentPlayerIndex(typeof gs.currentPlayerIndex === 'number' ? gs.currentPlayerIndex : 0);
        setTzedakahAmount(typeof gs.tzedakahAmount === 'number' ? gs.tzedakahAmount : 0);
        setZchutFundAmount(typeof gs.zchutFundAmount === 'number' ? gs.zchutFundAmount : 0);
        // --- Tzedakah event-driven logic: handle deduction and modal ---
        if (gs.tzedakahEvent) {
          const { playerIndex, timestamp } = gs.tzedakahEvent;
          if (!window.lastTzedakahEvent || window.lastTzedakahEvent !== timestamp) {
            window.lastTzedakahEvent = timestamp;
            if (playerIndex === gs.currentPlayerIndex) {
              setPlayers(prevPlayers => {
                const updated = [...prevPlayers];
                if (updated[playerIndex].money >= 100) {
                  updated[playerIndex].money -= 100;
                  setTzedakahAmount(prev => prev + 100);
                  alert(`${updated[playerIndex].name} paid $100 to Tzedakah!`);
                } else {
                  alert(`${updated[playerIndex].name} does not have enough money to pay Tzedakah!`);
                }
                return updated;
              });
              import('firebase/firestore').then(({ doc, updateDoc }) => {
                const gameRef = doc(db, "games", multiplayer.gameId);
                updateDoc(gameRef, { 'gameState.tzedakahEvent': null });
              });
            }
          }
        }
      }
    });
  });
  return () => { if (unsub) unsub(); };
}, [multiplayer.enabled, multiplayer.gameId]);

// --- Push local game state to Firestore when changed (multiplayer only) ---
useEffect(() => {
  if (!multiplayer.enabled || !multiplayer.gameId) return;
  if (!players || players.length === 0) return;
  import('firebase/firestore').then(({ doc, updateDoc, getDoc }) => {
    const gameRef = doc(db, "games", multiplayer.gameId);
    getDoc(gameRef).then((snap) => {
      const data = snap.data();
      const firestorePlayers = (data && data.gameState && Array.isArray(data.gameState.players)) ? data.gameState.players : [];
      // Merge local and Firestore colors, prefer local if set
      const mergedPlayers = players.map((p, i) => ({
        ...p,
        color: p.color || firestorePlayers[i]?.color || ["black","purple","blue","brown","orange","red","green"][i % 7]
      }));
      updateDoc(gameRef, {
        gameState: {
          players: mergedPlayers.map(p => ({
            name: p.name,
            position: typeof p.position === 'number' ? p.position : 0,
            money: typeof p.money === 'number' ? p.money : 2000,
            zchutPoints: typeof p.zchutPoints === 'number' ? p.zchutPoints : 1000,
            missTurn: !!p.missTurn,
            color: p.color || players[i]?.color || ["black","purple","blue","brown","orange","red","green"][i % 7],
            prevPosition: typeof p.prevPosition === 'number' ? p.prevPosition : 0
          })),
          currentPlayerIndex: typeof currentPlayerIndex === 'number' ? currentPlayerIndex : 0,
          tzedakahAmount,
          zchutFundAmount,
          // Always preserve tzedakahEvent from Firestore, never overwrite with null
          tzedakahEvent: data && data.gameState && typeof data.gameState.tzedakahEvent !== 'undefined' ? data.gameState.tzedakahEvent : null
        }
      });
    });
  });
}, [players, currentPlayerIndex, multiplayer.enabled, multiplayer.gameId]);

const movePlayerBy = (steps) => {
  if (steps <= 0 || players.length === 0) return;
  if (multiplayer.enabled) {
    import('firebase/firestore').then(async ({ doc, updateDoc, getDoc }) => {
      const gameRef = doc(db, "games", multiplayer.gameId);
      const snap = await getDoc(gameRef);
      const data = snap.data();
      let updatedPlayers = (data && data.gameState && Array.isArray(data.gameState.players)) ? [...data.gameState.players] : [...players];
      let tzedakahAmount = (data && data.gameState && typeof data.gameState.tzedakahAmount === 'number') ? data.gameState.tzedakahAmount : 0;
      let zchutFundAmount = (data && data.gameState && typeof data.gameState.zchutFundAmount === 'number') ? data.gameState.zchutFundAmount : 0;
      // Add event state for Yoseph pit
      let pendingSellBrother = (data && data.gameState && typeof data.gameState.pendingSellBrother === 'boolean') ? data.gameState.pendingSellBrother : false;
      let sellBrotherPlayerIndex = (data && data.gameState && typeof data.gameState.sellBrotherPlayerIndex === 'number') ? data.gameState.sellBrotherPlayerIndex : null;
      const boardLen = boardPositions.length;
      // Track previous position for correct event logic
      let prevPosition = updatedPlayers[currentPlayerIndex].position;
      let newPosition = (prevPosition + steps) % boardLen;
      let passedGo = newPosition < prevPosition;
      let newMoney = updatedPlayers[currentPlayerIndex].money + (passedGo ? 200 : 0);
      if (newPosition === 0) newMoney += 200;
      updatedPlayers[currentPlayerIndex] = {
        ...updatedPlayers[currentPlayerIndex],
        position: newPosition,
        money: newMoney,
        color: updatedPlayers[currentPlayerIndex].color || players[currentPlayerIndex]?.color || ["black","purple","blue","brown","orange","red","green"][currentPlayerIndex % 7],
        prevPosition: prevPosition // Store previous position for event logic
      };


      // Handle special squares
      // Square 16: Tzedakah (event-driven logic for multiplayer)
      if (newPosition === 16) {
        // Trigger tzedakahEvent for all players to handle deduction, fund update, and popup
        await updateDoc(gameRef, {
          'gameState.tzedakahEvent': {
            playerIndex: currentPlayerIndex,
            timestamp: Date.now()
          }
        });
        return; // Do not update players/funds directly here; let event-driven logic handle it
      }

      // Square 20: Collect tzedakah/zchut
      if (newPosition === 20) {
        let collectedMoney = tzedakahAmount;
        let collectedZchut = zchutFundAmount;
        if (collectedMoney > 0 || collectedZchut > 0) {
          if (collectedMoney > 0) {
            updatedPlayers[currentPlayerIndex].money += collectedMoney;
          }
          if (collectedZchut > 0) {
            updatedPlayers[currentPlayerIndex].zchutPoints = (updatedPlayers[currentPlayerIndex].zchutPoints || 0) + collectedZchut;
          }
          // Reset both funds
          tzedakahAmount = 0;
          zchutFundAmount = 0;
        }
        // Alert logic is local only; not synced
      }

      // Square 21: Yoseph pit (Sell Brother event)
      if (pendingSellBrother && sellBrotherPlayerIndex === currentPlayerIndex && newPosition === 21) {
        // Use last dice roll as penalty basis if available, else default to 1
        let lastDiceRoll = (data && data.gameState && typeof data.gameState.lastDiceRoll === 'number') ? data.gameState.lastDiceRoll : 1;
        const penalty = lastDiceRoll * 50;
        updatedPlayers[currentPlayerIndex] = {
          ...updatedPlayers[currentPlayerIndex],
          money: Math.max((typeof updatedPlayers[currentPlayerIndex].money === 'number' ? updatedPlayers[currentPlayerIndex].money : 0) - penalty, 0),
          zchutPoints: Math.max((updatedPlayers[currentPlayerIndex].zchutPoints || 0) - penalty, 0)
        };
        tzedakahAmount += penalty;
        zchutFundAmount += penalty;
        pendingSellBrother = false;
        sellBrotherPlayerIndex = null;
        // Alert logic is local only; not synced
      }

      updateDoc(gameRef, {
        'gameState.players': updatedPlayers.map((p, i) => ({
          name: p.name,
          position: typeof p.position === 'number' ? p.position : 0,
          money: typeof p.money === 'number' ? p.money : 2000,
          zchutPoints: typeof p.zchutPoints === 'number' ? p.zchutPoints : 1000,
          missTurn: !!p.missTurn,
          color: p.color || players[i]?.color || ["black","purple","blue","brown","orange","red","green"][i % 7],
          prevPosition: typeof p.prevPosition === 'number' ? p.prevPosition : 0
        })),
        'gameState.currentPlayerIndex': currentPlayerIndex,
        'gameState.tzedakahAmount': tzedakahAmount,
        'gameState.zchutFundAmount': zchutFundAmount,
        'gameState.pendingSellBrother': pendingSellBrother,
        'gameState.sellBrotherPlayerIndex': sellBrotherPlayerIndex
      });
    });
    return;
  }
  // Local (single player) logic remains unchanged
  // ...existing code...
};

// --- Debug logging for multiplayer state ---
useEffect(() => {
  if (multiplayer.enabled) {
    console.log("[DEBUG] currentPlayerIndex:", currentPlayerIndex);
    console.log("[DEBUG] multiplayer.playerName:", multiplayer.playerName);
    console.log("[DEBUG] players:", players);
  }
}, [currentPlayerIndex, players, multiplayer]);

// --- TEMPORARY TEST BUTTONS FOR SPECIAL SQUARES ---
function TestSpecialSquares() {
  // Helper to calculate steps to target square
  const getStepsTo = (target) => {
    if (!players || players.length === 0) return 0;
    const pos = players[currentPlayerIndex]?.position || 0;
    const boardLen = boardPositions.length;
    return (target - pos + boardLen) % boardLen;
  };
  return (
    <div style={{ margin: '16px 0', display: 'flex', gap: 12 }}>
      <button onClick={() => movePlayerBy(getStepsTo(16))}>Test Square 16</button>
      <button onClick={() => movePlayerBy(getStepsTo(20))}>Test Square 20</button>
      <button onClick={() => movePlayerBy(getStepsTo(21))}>Test Square 21</button>
      <span style={{ color: 'red', marginLeft: 12 }}><b>Temporary test buttons - remove before release!</b></span>
    </div>
  );
}

// --- TEST MODE TOGGLE ---
const TEST_MODE = true; // Set to false to hide test buttons

// Main App wrapper with conditional test buttons
function AppWithTestButtons(props) {
  return (
    <>
      {TEST_MODE && <TestSpecialSquares />}
      {/* ...existing main app UI... */}
    </>
  );
}

export default AppWithTestButtons;
