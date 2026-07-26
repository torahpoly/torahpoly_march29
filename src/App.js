
  // Centralized special square handler
  const handleSpecialSquare = (squareIndex) => {
    // Tzedakah (16)
    if (squareIndex === 16) {
      const pay = Math.min(100, players[currentPlayerIndex]?.money || 0);
      if (pay > 0) {
        setTzedakahAmount(prevAmt => prevAmt + pay);
        setPlayers(prev => prev.map((p, idx) => idx === currentPlayerIndex ? { ...p, money: (p.money || 0) - pay, position: 16 } : p));
        alert('Paid $100 to Tzedakah fund!');
      } else {
        setPlayers(prev => prev.map((p, idx) => idx === currentPlayerIndex ? { ...p, position: 16 } : p));
        alert('Moved to square 16 (Tzedakah) but no money to pay!');
      }
      return;
    }
        // Geula (Haman's gallows) (15)
        if (squareIndex === 15) {
          alert("Geula. Yay!! Haman is hung on his own gallows! He raised lots of money to destroy the Jewish people. The study of Torah and teshuva was worth more than all of his money and brought about his downfall.  Roll the dice to see how much money he spent trying to destroy Israel. Guess where that money is going now? Your own personal Geula - 400 times your dice roll. Good luck.");
          setPendingHamanReward(true);
          setHamanPlayerIndex(currentPlayerIndex);
          setPlayers(prev => prev.map((p, idx) => idx === currentPlayerIndex ? { ...p, position: 15 } : p));
          return;
        }
        // Manna Foods (25)
        if (squareIndex === 25) {
          // If no payer, show modal to pay (first buyer)
          if (mannaPayer === null) {
            if (multiplayer.enabled && multiplayer.gameId) {
              import('firebase/firestore').then(({ doc, updateDoc }) => {
                const gameRef = doc(db, "games", multiplayer.gameId);
                updateDoc(gameRef, {
                  'gameState.mannaPayer': currentPlayerIndex,
                  'gameState.mannaAmount': 200, // or whatever the default amount is
                });
              });
            } else {
              setMannaPayer(currentPlayerIndex);
              setMannaAmount(200); // or whatever the default amount is
            }
            setPendingMannaPay(true);
          } else if (currentPlayerIndex === mannaPayer) {
            // Owner landed again, do nothing (no prompt, no payment)
          } else {
            setPendingMannaPay(true);
          }
          setPlayers(prev => prev.map((p, idx) => idx === currentPlayerIndex ? { ...p, position: 25 } : p));
          return;
        }
    // Collect Tzedakah (20)
    if (squareIndex === 20) {
      const collectMoney = tzedakahAmount;
      const collectZchut = zchutFundAmount;
      setTzedakahAmount(0);
      setZchutFundAmount(0);
      setPlayers(prev => prev.map((p, idx) => idx === currentPlayerIndex ? { ...p, money: (p.money || 0) + collectMoney, zchutPoints: (p.zchutPoints || 0) + collectZchut, position: 20 } : p));
      alert(`Collected the Tzedakah fund! $${collectMoney} and ${collectZchut} zchut have been added to your account.`);
      return;
    }
    // Yoseph Pit (21)
    if (squareIndex === 21) {
      setPendingSellBrother(true);
      setSellBrotherPlayerIndex(currentPlayerIndex);
      setPlayers(prev => prev.map((p, idx) => idx === currentPlayerIndex ? { ...p, position: 21 } : p));
      alert("How could you sell your brother for 20 shekeles? Roll the dice. You will pay 50 times the roll in both money and zchut to the Tzedakah fund for atonement.");
      return;
    }
    // Yeshiva (17, 31)
    if (squareIndex === 17 || squareIndex === 31) {
      setYeshivaState(prev => ({ ...prev, [currentPlayerIndex]: { count: 1, active: true } }));
      setYeshivaModalData({ count: 1, rewardMoney: 200, rewardZchut: 400 });
      setShowYeshivaModal(true);
      setPlayers(prev => prev.map((p, idx) => idx === currentPlayerIndex ? { ...p, position: squareIndex } : p));
      return;
    }
    // Exile (10)
    if (squareIndex === 10) {
      setPlayers(prev => prev.map((p, idx) => idx === currentPlayerIndex ? { ...p, position: 30, missTurn: true } : p));
      alert('Exiled! Go back to Egypt and miss a turn.');
      return;
    }
  };
// --- Yeshiva Modal ---
function YeshivaModal({ open, onClose, count, rewardMoney, rewardZchut, onStay, onLeave }) {
  if (!open) return null;
  let message = `Welcome to the Jewish Idea Yeshiva! You can leave the material world for a while and come and learn with us.\n\nYou will miss next turn but get a stipend of ${rewardMoney} Torahpoly money and ${rewardZchut} Zchut.\nIf you miss another turn your reward is doubled.\nAnd a third turn your reward is tripled.\nYou will have to move on after the 3rd turn so we can make room for new students.\n\nDo you want to stay in Yeshiva this turn? (OK= Yes, Cancel= No)`;
  if (count === 2) {
    message = `We are enjoying your stay in the Jewish Idea Yeshiva! We would like you to continue to learn with us. If you miss another turn we will double your original reward. Now you will receive 400 Torahpoly money and 800 Zchut.\n\nDo you want to stay in Yeshiva this turn? (OK= Yes, Cancel= No)`;
  }
  if (count === 3) {
    message = `We appreciate that you have stayed and learned with us at the Yeshiva. Since you are now almost the level of a teacher we have tripled your original stipend if you stay a final term. Now you will get 600 Torahpoly money and 1200 Zchut. After this turn you must leave to make way for new students. Mazel Tov on your commitment and B'hatzlacha (wishing you success).`;
  }
  return (
    <div style={modalStyles.overlay}>
      <div style={modalStyles.modal}>
        <h2>Jewish Idea Yeshiva</h2>
        <pre style={{ whiteSpace: 'pre-wrap', fontSize: 16, marginBottom: 16 }}>{message}</pre>
        {count < 3 ? (
          <>
            <button style={modalStyles.button} onClick={onStay}>OK</button>
            <button style={modalStyles.button} onClick={onLeave}>Cancel</button>
          </>
        ) : (
          <button style={modalStyles.button} onClick={onLeave}>Leave Yeshiva</button>
        )}
      </div>
    </div>
  );
}
// Update only the current player's color in Firestore
async function setPlayerColorInFirestore(gameId, playerName, color) {
  const gameRef = doc(db, "games", gameId);
  const gameSnap = await getDoc(gameRef);
  if (!gameSnap.exists()) return;
  const data = gameSnap.data();
  const gs = data.gameState || {};
  const players = Array.isArray(gs.players) ? gs.players : [];
  const updatedPlayers = players.map(p =>
    p.name === playerName ? { ...p, color } : p
  );
  await updateDoc(gameRef, { 'gameState.players': updatedPlayers });
}




// --- Multiplayer Entry Minimal UI ---
import { db } from "./firebase";
import { doc, setDoc, updateDoc, arrayUnion, getDoc } from "firebase/firestore";

function MultiplayerEntry({ onJoin }) {
  const [gameId, setGameId] = useState("");
  const [playerName, setPlayerName] = useState("");
  // Save player info to Firestore on join (now inside gameState)
  const handleJoin = async () => {
    if (!gameId || !playerName) return;
    const gameRef = doc(db, "games", gameId);
    const gameSnap = await getDoc(gameRef);
    if (!gameSnap.exists()) {
      // Create new game doc with this player in gameState.waitingRoom
      await setDoc(gameRef, {
        gameState: {
          players: [], // Start with empty players
          waitingRoom: [{ name: playerName, joined: Date.now() }],
          currentPlayerIndex: 0
        },
        created: Date.now(),
      });
    } else {
      // Add player to waitingRoom (if not already present)
      const data = gameSnap.data();
      const gs = data.gameState || {};
      const waitingArr = Array.isArray(gs.waitingRoom) ? gs.waitingRoom : [];
      const already = waitingArr.some(p => p.name === playerName);
      if (!already) {
        await updateDoc(gameRef, {
          'gameState.waitingRoom': [...waitingArr, { name: playerName, joined: Date.now() }]
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
    }
    if (currentPlayer.money < amount) {
      setError("You don't have enough money!");
      return;
    }
    setError("");
    onPay(amount);
    onClose();
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
import React, { useState, useEffect } from "react";
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

  const cards = [
    {
      type: 'qa',
      title: 'Parsha Bereshit (Sefer Bereshit)',
      questions: [
        {
          question: 'What day was Adam born?',
          answer: 'The 6th day',
          zchut: 50,
        },
        {
          question: "What day was not 'good' but 'very' good?",
          answer: 'The 6th day',
          zchut: 50,
        },
        {
          question: 'Where do we see adding is sometimes subtracting?',
          answer: "Adam added 'don't touch' the tree. The snake used this to fool Chava. He pushed her against the tree and said, 'See you didn't die!'",
          zchut: 50,
        },
      ],
      note: 'If you get all three answers you can pick a Har HaBayit card',
    },
    {
      type: 'deck',
      title: 'Parsha Deck',
      image: '/cards/Parsha Deck.png',
      note: '',
    },
    {
      type: 'qa',
      title: 'Parsha Noach (Sefer Bereshit)',
      questions: parshaCard.questions,
      note: 'If you get all three answers you can pick a Har HaBayit card',
    },
    {
      type: 'deck',
      title: 'Parsha Deck',
      image: '/cards/Parsha Deck.png',
      note: '',
    },
    {
      type: 'qa',
      title: 'Parsha Lech Lecha (Sefer Bereshit)',
      questions: [
        {
          question: 'What were the Canaanites doing in the Land of Canaan when Avram arrived?',
          answer: 'They were in the process of conquering the Land from the descendants of Shem.',
          zchut: 50,
        },
        {
          question: 'Who accompanied Avraham in the battle against the four kings?',
          answer: 'Eliezer',
          zchut: 50,
        },
        {
          question: 'When did the decree of 400 years exile begin?',
          answer: 'With the birth of Itzchak',
          zchut: 50,
        },
      ],
      note: 'If you get all three answers you can pick a Har HaBayit card',
    },
    {
      type: 'deck',
      title: 'Parsha Deck',
      image: '/cards/Parsha Deck.png',
      note: '',
    },
    {
      type: 'qa',
      title: 'Parsha Vayera (Sefer Bereshit)',
      questions: [
        {
          question: 'Why was Avraham sitting at the entrance of his tent?',
          answer: 'He was looking for guests.',
          zchut: 50,
        },
        {
          question: 'What were the missions of the three angels?',
          answer: "To announce Yitzchak's birth, to heal Avraham, and to destroy Sodom",
          zchut: 50,
        },
        {
          question: 'After the miraculous birth of Yitzchak why would Hashem command him to be sacrificed?',
          answer: 'Measure for measure Avraham denigrated the open miracle by making a pact with Avimelech soon after (Rashbam).',
          zchut: 50,
        },
      ],
      note: 'If you get all three answers you can pick a Har HaBayit card',
    },
    {
      type: 'deck',
      title: 'Parsha Deck',
      image: '/cards/Parsha Deck.png',
      note: '',
    },
    {
      type: 'qa',
      title: 'Parsha Chayei Sarah (Sefer Bereshit)',
      questions: [
        {
          question: 'Name the four couples buried in Kiryat Arba?',
          answer: 'Adam and Chava, Avraham and Sara, Yitzchak and Rivka, Yaakov and Leah.',
          zchut: 50,
        },
        {
          question: 'Eliezer is referred to more than ten times in this Parsha. How many times is his name mentioned?',
          answer: "None. Why? He had no self-interest, referred only as Avraham's servant interested only in fulfilling Avraham's mission",
          zchut: 50,
        },
        {
          question: 'Who was Ketura?',
          answer: 'Hagar',
          zchut: 50,
        },
      ],
      note: 'If you get all three answers you can pick a Har HaBayit card',
    },
    {
      type: 'deck',
      title: 'Parsha Deck',
      image: '/cards/Parsha Deck.png',
      note: '',
    },
    {
      type: 'qa',
      title: 'Parsha Toldot (Sefer Bereshit)',
      questions: [
        {
          question: 'What did Esav sell for a bowl of soup?',
          answer: 'The birthright',
          zchut: 50,
        },
        {
          question: 'If Esav already sold the birthright for a bowl of soup why was he so angry when Yacov stole the blessing?',
          answer: 'Envy. Envy is not only jealousy of anothers posssesions but possesions that you never valued until it passed into the hands of another more worthy than you.',
          zchut: 50,
        },
        {
          question: 'Yacov comes from the word heel. Why was he given this name?',
          answer: 'Because he was grasping on to his twin brothers heel as they were born.',
          zchut: 50,
        },
      ],
      note: 'If you get all three answers you can pick a Har HaBayit card',
    },
    {
      type: 'deck',
      title: 'Parsha Deck',
      image: '/cards/Parsha Deck.png',
      note: '',
    },
    {
      type: 'qa',
      title: 'Parsha Vayetze (Sefer Bereshit)',
      questions: [
        {
          question: 'Why did Yaakov cry when he met Rachel?',
          answer: 'He saw prophetically that they would not be buried together; or because he was penniless.',
          zchut: 50,
        },
        {
          question: 
            "Why were Leah's eyes tender?",
          answer: 'She cried continually because she thought she was destined to marry Esav.',
          zchut: 50,
        },
        {
          question: 'How old was Yaakov when he married?',
          answer: 'Eighty-four',
          zchut: 50,
        },
      ],
      note: 'If you get all three answers you can pick a Har HaBayit card',
    },
    {
      type: 'deck',
      title: 'Parsha Deck',
      image: '/cards/Parsha Deck.png',
      note: '',
    },
    {
      type: 'qa',
      title: 'Parsha Vayishlach (Sefer Bereshit)',
      questions: [
        {
          question: 'In what three ways did Yaakov prepare for his encounter with Esav?',
          answer: 'He sent gifts, he prayed, and he prepared for war',
          zchut: 50,
        },
        {
          question: 'What was the angel forced to do before Yaakov agreed to release him?',
          answer: 'Admit that the blessings given by Yitzchak rightfully belong to Yaakov.',
          zchut: 50,
        },
        {
          question: 'Where was Yacov wounded? Why?',
          answer: "The Gid Hanasheh (sciatic nerve). Yacov's weakness is running and not confronting his adversary yet he becomes a reluctant conqueror when confronted by this adversary who proclaims that from now on his name will be Israel.",
          zchut: 50,
        },
      ],
      note: 'If you get all three answers you can pick a Har HaBayit card',
    },
    {
      type: 'deck',
      title: 'Parsha Deck',
      image: '/cards/Parsha Deck.png',
      note: '',
    },
    {
      type: 'qa',
      title: 'Parsha Vayeishev (Sefer Bereshit)',
      questions: [
        {
          question: '"These are the offspring of Yaakov: Yosef...." Give three reasons why Yosef is considered Yaakov\'s main offspring?',
          answer: '(a) Yosef was the son of Rachel, Yaakov\'s primary wife. (b) Yosef looked like Yaakov. (c) All that befell Yaakov befell Yosef.',
          zchut: 50,
        },
        {
          question: 'For how long did Yaakov mourn the loss of Yosef?',
          answer: 'Twenty-two years',
          zchut: 50,
        },
        {
          question: 'How was Yosef punished for asking the butler for help?',
          answer: 'He remained in prison an additional two years',
          zchut: 50,
        },
      ],
      note: 'If you get all three answers you can pick a Har HaBayit card',
    },
    {
      type: 'deck',
      title: 'Parsha Deck',
      image: '/cards/Parsha Deck.png',
      note: '',
    },
    {
      type: 'qa',
      title: 'Parsha Mikeitz (Sefer Bereshit)',
      questions: [
        {
          question: 'When did Yosef know that his dreams were being fulfilled?',
          answer: 'When his brothers bowed to him',
          zchut: 50,
        },
        {
          question: 'What did Yosef require the Egyptians to do before he would sell them grain?',
          answer: 'Become circumcised',
          zchut: 50,
        },
        {
          question: 'Who was the interpreter between Yosef and his brothers?',
          answer: 'His son Menashe',
          zchut: 50,
        },
      ],
      note: 'If you get all three answers you can pick a Har HaBayit card',
    },
    {
      type: 'deck',
      title: 'Parsha Deck',
      image: '/cards/Parsha Deck.png',
      note: '',
    },
    {
      type: 'qa',
      title: 'Parsha Vayigash (Sefer Bereshit)',
      questions: [
        {
          question: 'What two things did the brothers see that helped prove that he was really Yosef?',
          answer: 'He was circumcised like they were, and he spoke Lashon Hakodesh',
          zchut: 50,
        },
        {
          question: 'Why did Binyamin weep on Yosef\'s neck?',
          answer: 'Binyamin wept for the destruction of Mishkan Shilo built in Yosef\'s territory.',
          zchut: 50,
        },
        {
          question: 'What returned to Yaakov when he realized Yosef was alive?',
          answer: 'His ruach hakodesh (prophetic spirit) returned',
          zchut: 50,
        },
      ],
      note: 'If you get all three answers you can pick a Har HaBayit card',
    },
    {
      type: 'deck',
      title: 'Parsha Deck',
      image: '/cards/Parsha Deck.png',
      note: '',
    },
    {
      type: 'qa',
      title: 'Parsha Vayechi (Sefer Bereshit)',
      questions: [
        {
          question: 'Why is kindness towards the dead called "chesed shel emet" — kindness of truth?',
          answer: 'Because the giver expects no reward from the recipient',
          zchut: 50,
        },
        {
          question: 'What congregation from Yaakov\'s offspring did Yaakov not want to be associated with?',
          answer: 'Korach and his congregation',
          zchut: 50,
        },
        {
          question: 'Which two sons of Yaakov did not carry his coffin? Why not?',
          answer: 'Levi, because he would carry the Aron Kodesh (Holy Ark). Yosef, because he was a king.',
          zchut: 50,
        },
      ],
      note: 'If you get all three answers you can pick a Har HaBayit card',
    },
    {
      type: 'deck',
      title: 'Parsha Deck',
      image: '/cards/Parsha Deck.png',
      note: '',
    },
    {
      type: 'qa',
      title: 'Parsha Shmot (Sefer Shmot)',
      questions: [
        {
          question: 'Which Hebrew men were fighting each other?',
          answer: 'Datan and Aviram',
          zchut: 50,
        },
        {
          question: 'About which plague was Pharoah warned first? (Shmot 4:23)',
          answer: 'Death of the first born',
          zchut: 50,
        },
        {
          question: 'How were the shotrim rewarded for accepting the beatings on behalf of their fellow Jews?',
          answer: 'They were chosen to be on the Sanhedrin.',
          zchut: 50,
        },
      ],
      note: 'If you get all three answers you can pick a Har HaBayit card',
    },
    {
      type: 'deck',
      title: 'Parsha Deck',
      image: '/cards/Parsha Deck.png',
      note: '',
    },
    {
      type: 'qa',
      title: 'Parsha Va\'eira (Sefer Shmot)',
      questions: [
        {
          question: 'Why did Pharoah go to the Nile every morning?',
          answer: 'To relieve himself. Pharoah pretended to be a god who did not need to attend to his bodily functions.',
          zchut: 50,
        },
        {
          question: "Why didn't Moshe strike the dust to initiate the plague of lice?",
          answer: 'Because the dust protected Moshe by hiding the body of the Egyptian that Moshe killed.',
          zchut: 50,
        },
        {
          question: "Who was Aaron's wife? Who was her brother?",
          answer: 'Elisheva, sister of Nachshon.',
          zchut: 50,
        },
      ],
      note: 'If you get all three answers you can pick a Har HaBayit card',
    },
    {
      type: 'deck',
      title: 'Parsha Deck',
      image: '/cards/Parsha Deck.png',
      note: '',
    },
    {
      type: 'qa',
      title: 'Parsha Bo (Sefer Shmot)',
      questions: [
        {
          question: 'Prior to the Exodus from Egypt, what two mitzvot involving blood did Hashem give to the Jewish People?',
          answer: 'Circumcision and Korban Pesach',
          zchut: 50,
        },
        {
          question: 'Why did Pharaoh ask Moshe to bless him?',
          answer: "So he wouldn't die, for he himself was a firstborn",
          zchut: 50,
        },
        {
          question: 'What three historical events occurred on the 15th of Nissan, prior to the event of the Exodus from Egypt?',
          answer: 'The angels came to promise that Sarah would have a son, Yitzchak was born, and the exile of the "covenant between the parts" was decreed',
          zchut: 50,
        },
      ],
      note: 'If you get all three answers you can pick a Har HaBayit card',
    },
    {
      type: 'deck',
      title: 'Parsha Deck',
      image: '/cards/Parsha Deck.png',
      note: '',
    },
    {
      type: 'qa',
      title: 'Parsha Beshalach (Sefer Shmot)',
      questions: [
        {
          question: 'What percentage of the Jewish people died during the plague of darknes?',
          answer: 'Eighty percent (four-fifths)',
          zchut: 50,
        },
        {
          question: 'Why did the Egyptians want to pursue the Jewish People?',
          answer: 'To regain their wealth',
          zchut: 50,
        },
        {
          question: 'Where did the Egyptians get animals to pull their chariots?',
          answer: 'From those Egyptians who feared the word of Hashem and kept their animals inside during the plagues.',
          zchut: 50,
        },
      ],
      note: 'If you get all three answers you can pick a Har HaBayit card',
    },
    {
      type: 'deck',
      title: 'Parsha Deck',
      image: '/cards/Parsha Deck.png',
      note: '',
    },
    {
      type: 'qa',
      title: 'Parsha Yitro (Sefer Shmot)',
      questions: [
        {
          question: 'How did the encampment at Sinai differ from the other encampments? What was unique among the tribes at this moment?',
          answer: 'The Jewish People were united',
          zchut: 50,
        },
        {
          question: 'What suggestion did Yitro give Moshe?',
          answer: 'That he deputize judges to assist him with his work',
          zchut: 50,
        },
        {
          question: 'How many commandments did Israel hear from the Almighty?',
          answer: 'The first two',
          zchut: 50,
        },
      ],
      note: 'If you get all three answers you can pick a Har HaBayit card',
    },
    {
      type: 'deck',
      title: 'Parsha Deck',
      image: '/cards/Parsha Deck.png',
      note: '',
    },
    {
      type: 'qa',
      title: 'Parsha Mishpatim (Sefer Shmot)',
      questions: [
        {
          question: 'In what context is a mezuza mentioned in this week\'s Parsha?',
          answer: 'If a Hebrew slave desires to remain enslaved his owner brings him "to the door post mezuza" to pierce his ear.',
          zchut: 50,
        },
        {
          question: 'An ox gores another ox. What is the maximum the owner of the damaging ox must pay, provided his animal had gored no more than twice previously?',
          answer: 'The full value of his own animal',
          zchut: 50,
        },
        {
          question: 'A person borrows his employee\'s car. The car is struck by lightning. How much must he pay?',
          answer: 'Nothing',
          zchut: 50,
        },
      ],
      note: 'If you get all three answers you can pick a Har HaBayit card',
    },
    {
      type: 'deck',
      title: 'Parsha Deck',
      image: '/cards/Parsha Deck.png',
      note: '',
    },
    {
      type: 'qa',
      title: 'Parsha Trumah (Sefer Shmot)',
      questions: [
        {
          question: 'What did the faces of the keruvim resemble?',
          answer: 'The faces of children',
          zchut: 50,
        },
        {
          question: 'How did Moshe know the shape of the menorah?',
          answer: 'Hashem showed Moshe a menorah of fire',
          zchut: 50,
        },
        {
          question: 'Describe the uses of: a) oil; b) spices; c) jewels?',
          answer: 'Anointing, Incense, Choshen',
          zchut: 50,
        },
      ],
      note: 'If you get all three answers you can pick a Har HaBayit card',
    },
    {
      type: 'deck',
      title: 'Parsha Deck',
      image: '/cards/Parsha Deck.png',
      note: '',
    },
    {
      type: 'qa',
      title: 'Parsha Tetzaveh (Sefer Shmot)',
      questions: [
        {
          question: 'In which order were the names of the Tribes inscribed on the Choshen?',
          answer: 'In order of birth',
          zchut: 50,
        },
        {
          question: 'The stones of the Choshen bore the inscription of the names of the sons of Yaakov. Why?',
          answer: 'So that Hashem would see their names and recall their righteousness.',
          zchut: 50,
        },
        {
          question: "This is the one Parsha where Moshe's name is not mentioned. Where do we see it hidden and why?",
          answer: 'The two Shoham stones spell Moshe. From these stones the Choshen is held by two chains. The Tzaddik holds Israel upon his shoulders, even when we don\'t see him',
          zchut: 50,
        },
      ],
      note: 'If you get all three answers you can pick a Har HaBayit card',
    },
    {
      type: 'deck',
      title: 'Parsha Deck',
      image: '/cards/Parsha Deck.png',
      note: '',
    },
    {
      type: 'qa',
      title: 'Parsha Ki Tissa (Sefer Shmot)',
      questions: [
        {
          question: 'How many ingredients compromise the incense of the Mishkan?',
          answer: 'Eleven',
          zchut: 50,
        },
        {
          question: 'How has the sin of the Golden Calf affected the Jewish people throughout history?',
          answer: 'Whenever Hashem punished the Jewish people, part of that punishment comes for the sin of the Golden Calf.',
          zchut: 50,
        },
        {
          question: 'How did Hashem show that He forgave the Jewish people?',
          answer: 'He agreed to let His Schechina dwell among them.',
          zchut: 50,
        },
      ],
      note: 'If you get all three answers you can pick a Har HaBayit card',
    },
    {
      type: 'deck',
      title: 'Parsha Deck',
      image: '/cards/Parsha Deck.png',
      note: '',
    },
    {
      type: 'qa',
      title: 'Parsha Vayakhel (Sefer Shmot)',
      questions: [
        {
          question: 'Why is the prohibition of work on Shabbat written prior to the instructions for building?',
          answer: 'To teach that building the Mishkan does not supersede Shabbat.',
          zchut: 50,
        },
        {
          question: 'Why did the Princes contribute last? How does the Torah show dissatisfaction with this?',
          answer: 'The princes wanted the people to contribute first, and only then would they contribute whatever was lacking. Hence the Torah omits a letter from their title.',
          zchut: 50,
        },
        {
          question: 'Who were the two primary builders of the Mishkan? What tribes were they from?',
          answer: 'Betzalel ben Uri from Yehuda, and Oholiav ben Achisamach from Dan.',
          zchut: 50,
        },
      ],
      note: 'If you get all three answers you can pick a Har HaBayit card',
    },
    {
      type: 'deck',
      title: 'Parsha Deck',
      image: '/cards/Parsha Deck.png',
      note: '',
    },
    {
      type: 'qa',
      title: 'Parsha Pekudei (Sefer Shmot)',
      questions: [
        {
          question: 'What does Betzalel mean?',
          answer: '"In the shadow of G-d"',
          zchut: 50,
        },
        {
          question: 'On which day was the Mishkan first erected and not dismantled?',
          answer: 'Rosh Chodesh Nissan of the second year. For seven days before this, Moshe erected and dismantled the Mishkan.',
          zchut: 50,
        },
        {
          question: 'On which day did Moshe and Aharon both serve as the Kohanim?',
          answer: 'On the eighth day of the Mishkan\'s consecration.',
          zchut: 50,
        },
      ],
      note: 'If you get all three answers you can pick a Har HaBayit card',
    },
    // --- MannaFoodsPayModal is now used for subsequent players ---
    // --- MannaFoodsModal (set your price) is used for first buyer ---
    {
      type: 'deck',
      title: 'Parsha Deck',
      image: '/cards/Parsha Deck.png',
      note: '',
    },
    {
      type: 'qa',
      title: 'Parsha Shmini (Sefer Vayikra)',
      questions: [
        {
          question: 'What tragic event happened to Aharon\'s sons Nadav and Avihu?',
          answer: 'They died after bringing unauthorized fire before Hashem.',
          zchut: 50,
        },
        {
          question: 'Which animals are kosher according to Parshat Shmini?',
          answer: 'Animals that have split hooves and chew their cud.',
          zchut: 50,
        },
        {
          question: 'What is the main lesson of the laws of kashrut in Shmini?',
          answer: 'To be holy and separate, as Hashem is holy.',
          zchut: 50,
        },
      ],
      note: 'If you get all three answers you can pick a Har HaBayit card',
    },
    // --- Added: Deck and Parsha Tazria (Sefer Vayikra) ---
    {
      type: 'deck',
      title: 'Parsha Deck',
      image: '/cards/Parsha Deck.png',
      note: '',
    },
    {
      type: 'qa',
      title: 'Parsha Tazria (Sefer Vayikra)',
      questions: [
        {
          question: "Who determines whether a person is a metzora tamei (person with ritually impure tzara'at) or is tahor?",
          answer: 'A kohen',
          zchut: 50,
        },
        {
          question: 'When does a woman who has given birth to a son go to the mikveh?',
          answer: 'At the end of seven days',
          zchut: 50,
        },
        {
          question: "What disqualifies a kohen from being able to give a ruling in a case of tzara'as?",
          answer: 'Poor vision',
          zchut: 50,
        },
      ],
      note: 'If you get all three answers you can pick a Har HaBayit card',
    },
      // --- Added: Deck and Parsha Metzora (Sefer Vayikra) ---
      {
        type: 'deck',
        title: 'Parsha Deck',
        image: '/cards/Parsha Deck.png',
        note: '',
      },
      {
        type: 'qa',
        title: 'Parsha Metzora (Sefer Vayikra)',
        questions: [
          {
            question: 'What is the main topic of Parshat Metzora?',
            answer: 'The laws of purification for a metzora (person afflicted with tzara’at).',
            zchut: 50,
          },
          {
            question: 'What ritual is performed with two birds for the metzora?',
            answer: 'One bird is slaughtered, the other is set free after being dipped in the blood of the first.',
            zchut: 50,
          },
          {
            question: 'What does the metzora do after being declared pure?',
            answer: 'He brings offerings and shaves his hair.',
            zchut: 50,
          },
        ],
        note: 'If you get all three answers you can pick a Har HaBayit card',
      },
        // --- Added: Deck and Parsha Acharei Mot (Sefer Vayikra) ---
        {
          type: 'deck',
          title: 'Parsha Deck',
          image: '/cards/Parsha Deck.png',
          note: '',
        },
        {
          type: 'qa',
          title: 'Parsha Acharei Mot (Sefer Vayikra)',
          questions: [
            {
              question: 'Why does the Torah emphasize that Parshat Acharei Mot was taught after the death of Aharon\'s sons?',
              answer: 'To strengthen the warning not to enter the Holy of Holies except on Yom Kippur',
              zchut: 50,
            },
            {
              question: 'How long did the first Beit Hamikdash stand?',
              answer: '410 years',
              zchut: 50,
            },
            {
              question: 'What is the difference between "mishpat" and "chok"?',
              answer: 'A "mishpat" conforms to the human sense of justice. A "chok" is a law whose reason is not given to us and can only be understood as Hashem\'s decree.',
              zchut: 50,
            },
          ],
          note: 'If you get all three answers you can pick a Har HaBayit card',
        },
          // --- Added: Deck and Parsha Kedoshim (Sefer Vayikra) ---
          {
            type: 'deck',
            title: 'Parsha Deck',
            image: '/cards/Parsha Deck.png',
            note: '',
          },
          {
            type: 'qa',
            title: 'Parsha Kedoshim (Sefer Vayikra)',
            questions: [
              {
                question: 'Why was Parshat Kedoshim said in front of all the Jewish People?',
                answer: 'Because it contains the fundamental teachings of the Torah',
                zchut: 50,
              },
              {
                question: 'Why does the Torah mention the duty to honor one\'s father before it mentions the duty to honor one\'s mother?',
                answer: 'Since it is more natural to honor one\'s mother, the Torah stresses the obligation to honor one\'s father.',
                zchut: 50,
              },
              {
                question: 'Why is the command to fear one\'s parents followed by the command to keep Shabbat?',
                answer: 'To teach that one must not violate Torah law even at the command of one\'s parents..',
                zchut: 50,
              },
            ],
            note: 'If you get all three answers you can pick a Har HaBayit card',
          },
            // --- Added: Deck and Parsha Emor (Sefer Vayikra) ---
            {
              type: 'deck',
              title: 'Parsha Deck',
              image: '/cards/Parsha Deck.png',
              note: '',
            },
            {
              type: 'qa',
              title: 'Parsha Emor (Sefer Vayikra)',
              questions: [
                {
                  question: 'Who in the household of a kohen may eat terumah?',
                  answer: 'He, his wife, his sons, his unmarried daughters and his non-Jewish slaves.',
                  zchut: 50,
                },
                {
                  question: 'Why do we begin counting the omer at night?',
                  answer: 'The Torah requires counting seven complete weeks. If we begin counting in the daytime, the seven weeks would not be complete, because according to the Torah a day starts at nightfall.',
                  zchut: 50,
                },
                {
                  question: 'What is unusual about the wood of the etrog tree?',
                  answer: 'It has the same taste as the fruit',
                  zchut: 50,
                },
              ],
              note: 'If you get all three answers you can pick a Har HaBayit card',
            },
              // --- Added: Deck and Parsha Behar (Sefer Vayikra) ---
              {
                type: 'deck',
                title: 'Parsha Deck',
                image: '/cards/Parsha Deck.png',
                note: '',
              },
              {
                type: 'qa',
                title: 'Parsha Behar (Sefer Vayikra)',
                questions: [
                  {
                    question: 'Why does the Torah specify that the laws of shemita were taught on Har Sinai?',
                    answer: 'To teach us that just as shemita was taught in detail on Har Sinai, so too, all the mitzvot were taught in detail on Har Sinai',
                    zchut: 50,
                  },
                  {
                    question: 'What is the punishment for neglecting the laws of shemita?',
                    answer: 'Exile (Vayikra 25:18)',
                    zchut: 50,
                  },
                  {
                    question: 'To what is one who leaves Eretz Yisrael compared?',
                    answer: 'To one who worships idols (Vayikra 25:38)',
                    zchut: 50,
                  },
                ],
                note: 'If you get all three answers you can pick a Har HaBayit card',
              },
                // --- Added: Deck and Parsha Bechukotai (Sefer Vayikra) ---
                {
                  type: 'deck',
                  title: 'Parsha Deck',
                  image: '/cards/Parsha Deck.png',
                  note: '',
                },
                {
                  type: 'qa',
                  title: 'Parsha Bechukotai (Sefer Vayikra)',
                  questions: [
                    {
                      question: 'The word “bechukotai”(in My statutes) is related to the word “chakikah”(engraved).  Why?',
                      answer: 'We must toil in the study of Torah until Torah becomes engraved in us. Jewish destiny is also engraved in us and we cannot escape it',
                      zchut: 50,
                    },
                    {
                      question: 'Mathematically, if five Jewish soldiers can defeat 100 enemy soldiers, how many enemy soldiers should 100 Jewish soldiers beable to defeat?',
                      answer: 'Two thousand',
                      zchut: 50,
                    },
                    {
                      question: 'Which "progression" of seven transgressions are taught in Chapter 26, and why in that particular order?',
                      answer: 'Not studying Torah, not observing mitzvot, rejecting those who observe mitzvot, hating Sages, preventing others from observing mitzvot, denying that G-d gave the mitzvot, denying the existence of G-d. They are listed in this order because each transgression leads to the next',
                      zchut: 50,
                    },
                  ],
                  note: 'If you get all three answers you can pick a Har HaBayit card',
                },
                  // --- Added: Deck and Parsha Bamidbar (Sefer Bamidbar) ---
                  {
                    type: 'deck',
                    title: 'Parsha Deck',
                    image: '/cards/Parsha Deck.png',
                    note: '',
                  },
                  {
                    type: 'qa',
                    title: 'Parsha Bamidbar (Sefer Bamidbar)',
                    questions: [
                      {
                        question: 'Why were the Jewish People counted so frequently?',
                        answer: 'They are very dear to Hashem',
                        zchut: 50,
                      },
                      {
                        question: 'Why are Aharon\'s sons called "sons of Aharon and Moshe?',
                        answer: 'Since Moshe taught them Torah, it’s as if he gave birth to them',
                        zchut: 50,
                      },
                      {
                        question: 'The firstborn males of the Jewish People were redeemed for five shekalim. Why five shekalim?',
                        answer: 'To atone for the sale of Yosef, Rachel’s firstborn, who was sold by his brothers for five shekalim (20 pieces of silver.)',
                        zchut: 50,
                      },
                    ],
                    note: 'If you get all three answers you can pick a Har HaBayit card',
                  },
                    // --- Added: Deck and Parsha Nasso (Sefer Bamidbar) ---
                    {
                      type: 'deck',
                      title: 'Parsha Deck',
                      image: '/cards/Parsha Deck.png',
                      note: '',
                    },
                    {
                      type: 'qa',
                      title: 'Parsha Nasso (Sefer Bamidbar)',
                      questions: [
                        {
                          question: 'Why are the verses about matanot kehuna followed by the verses of the Sotah?',
                          answer: 'To teach that someone who withholds the gifts due to the Kohanim is deserving of eventually bringing his wife to the Kohanim to be tried as a Sotah.',
                          zchut: 50,
                        },
                        {
                          question: 'The holy basin was made from the mirrors of the righteous women who left Egypt. What was holy about their mirors?',
                          answer: 'During slavery, they used these mirrors to awaken their husbands affection and subsequently became the mothers of many children.',
                          zchut: 50,
                        },
                        {
                          question: 'What is the meaning of the blessing "May Hashem bless you and guard you?"',
                          answer: '"May Hashem bless you that your property may increase, "and guard you" from robbery.',
                          zchut: 50,
                        },
                      ],
                      note: 'If you get all three answers you can pick a Har HaBayit card',
                    },
                      // --- Added: Deck and Parsha Beha'alotcha (Sefer Bamidbar) ---
                      {
                        type: 'deck',
                        title: 'Parsha Deck',
                        image: '/cards/Parsha Deck.png',
                        note: '',
                      },
                      {
                        type: 'qa',
                        title: "Parsha Beha'alotcha (Sefer Bamidbar)",
                        questions: [
                          {
                            question: "Why did G-d claim the first-born of the Jewish people His possesion?",
                            answer: "Because in Egypt He spared them during Makat Bechorot.",
                            zchut: 50,
                          },
                          {
                            question: "Moshe was commanded to choose 70 elders to help him lead the Jewish people. What happened to the elders who led the Jewish people in Egypt?",
                            answer: "They were consumed in the fire at Taverah.",
                            zchut: 50,
                          },
                          {
                            question: "Whom did Moshe choose as the new leadership?",
                            answer: "People who were supervisors in Egypt and had pity on Bnei Israel at risk to themselves. They took beatings for their brothers.",
                            zchut: 50,
                          },
                        ],
                            note: 'If you get all three answers you can pick a Har HaBayit card',
                          },
                            // --- Added: Deck and Parsha Shlach (Sefer Bamidbar) ---
                            {
                              type: 'deck',
                              title: 'Parsha Deck',
                              image: '/cards/Parsha Deck.png',
                              note: '',
                            },
                            {
                              type: 'qa',
                              title: 'Parsha Shlach (Sefer Bamidbar)',
                              questions: [
                                {
                                  question: "Why is the portion about the spies written immediately after the portion about Miriam's tzara'at?",
                                  answer: "To show the evil of the meraglim (spies), that they saw Miriam punished for lashon hara yet failed to take a lesson from it.",
                                  zchut: 50,
                                },
                                {
                                  question: "On what day did Bnei Yisrael cry due to the meraglim's report? How did this affect future generations?",
                                  answer: "The 9th of Av (Tisha B'av). This date therefore became a day of crying for all future generations: Both Temples were destroyed on this date",
                                  zchut: 50,
                                },
                                {
                                  question: "Why did the meraglim begin by saying the land is 'flowing with milk and honey'?",
                                  answer: "Any lie which doesn't start with an element of truth won't be believed; therefore, they began their false report with a true statement",
                                  zchut: 50,
                                },
                              ],
                              note: 'If you get all three answers you can pick a Har HaBayit card',
                            },
                          // --- Added: Deck and Parsha Korach (Sefer Bamidbar) ---
                          {
                            type: 'deck',
                            title: 'Parsha Deck',
                            image: '/cards/Parsha Deck.png',
                            note: '',
                          },
                          {
                            type: 'qa',
                            title: 'Parsha Korach (Sefer Bamidbar)',
                            questions: [
                              {
                                question: 'What motivated Korach to rebel?',
                                answer: 'Korach was jealous that Elizafan ben Uziel was appointed as leader of the family of Kehat instead of himself.',
                                zchut: 50,
                              },
                              {
                                question: 'What did Korach and company do when Moshe said that a techelet garment needs tzizit?',
                                answer: 'They laughed.',
                                zchut: 50,
                              },
                              {
                                question: 'What event did Korach not foresee?',
                                answer: 'That his sons would repent',
                                zchut: 50,
                              },
                            ],
                            note: 'If you get all three answers you can pick a Har HaBayit card',
                          },
                            // --- Added: Deck and Parsha Chukat (Sefer Bamidbar) ---
                            {
                              type: 'deck',
                              title: 'Parsha Deck',
                              image: '/cards/Parsha Deck.png',
                              note: '',
                            },
                            {
                              type: 'qa',
                              title: 'Parsha Chukat (Sefer Bamidbar)',
                              questions: [
                                {
                                  question: 'The red heifer is burned completely including ts dung. What does it represent?',
                                  answer: 'The Jewish people from the loftiest to the lowest are all burned together (Zohar)',
                                  zchut: 50,
                                  pays: 40,
                                },
                                {
                                  question: 'The water of sprinkling (Mei Nidah) makes some pure and some temporarily impure. What Hebrew word has the same letters as Mei Niddah?',
                                  answer: 'Medina (State)',
                                  zchut: 50,
                                  pays: 60,
                                },
                                {
                                  question: 'How is the persecution of a Tzadik similar to the Cohen who sprinkles?',
                                  answer: 'Many prophets were despised, considered impure and stoned but the Torah they clung to eventually purifies; even those who once persecuted the Tzadik',
                                  zchut: 50,
                                  pays: 80,
                                },
                              ],
                              note: 'If you get all three answers you can pick a Har HaBayit card',
                            },
    // --- Added: Deck and Parsha Balak (Sefer Bamidbar) ---
    {
      type: 'deck',
      title: 'Parsha Deck',
      image: '/cards/Parsha Deck.png',
      note: '',
    },
    {
      type: 'qa',
      title: 'Parsha Balak (Sefer Bamidbar)',
      questions: [
        {
          question: 'Although Balak was evil and tried to destroy Israel one of his descendents became a very holy Jew. Who was that?',
          answer: 'Ruth',
          zchut: 50,
        },
        {
          question: 'The water of sprinkling (Mei Nidah) makes some pure and some temporarily impure. What Hebrew word has the same letters as Mei Nidah?',
          answer: 'Medina (State).',
          zchut: 50,
        },
        {
          question: 'Pharoah had three advisors,Yitro,Iyov and Bilaam. What were their fates and why?',
          answer: 'Yitro protested Pharoahs decrees and had to run for his life. He later had the honor of having a Torah Parsha named after him. Iyov was silent and suffered later for that silence. Bilaam advised Pharoah to torture the Jews and died by the sword of Israel.',
          zchut: 50,
        },
      ],
      note: 'If you get all three answers you can pick a Har HaBayit card',
    },
    // --- Added: Deck and Parsha Pinchas (Sefer Bamidbar) ---
    {
      type: 'deck',
      title: 'Parsha Deck',
      image: '/cards/Parsha Deck.png',
      note: '',
    },
    {
      type: 'qa',
      title: 'Parsha Pinchas (Sefer Bamidbar)',
      questions: [
        {
          question: 'Why was Pinchas not originally a kohen?',
          answer: 'He was a grandson born before Aaron and his sons were annointed',
          zchut: 50,
        },
        {
          question: 'How does the Torah show us that Pinchas went against his nature to be zealous for Hashem?',
          answer: 'Pinchas is written with a small yud',
          zchut: 50,
        },
        {
          question: 'What trait did Tzlofchad\'s daughters exhibit that their ancestor Yosef also exhibited?',
          answer: 'Love for Eretz Yisrael',
          zchut: 50,
        },
      ],
      note: 'If you get all three answers you can pick a Har HaBayit card',
    },
    // --- Added: Deck and Parsha Matot (Sefer Bamidbar) ---
    {
      type: 'deck',
      title: 'Parsha Deck',
      image: '/cards/Parsha Deck.png',
      note: '',
    },
    {
      type: 'qa',
      title: 'Parsha Matot (Sefer Bamidbar)',
      questions: [
        {
          question: 'Those selected to fight Midian went unwillingly. Why?',
          answer: 'They knew that Moshe\'s death would follow',
          zchut: 50,
        },
        {
          question: 'How many soldiers died when they took vengeance against the Midianites?',
          answer: 'None',
          zchut: 50,
        },
        {
          question: '"We will build sheep-pens here for our livestock and cities for our little ones." What was improper about this statement?',
          answer: 'They showed more regard for their property than for their children.',
          zchut: 50,
        },
      ],
      note: 'If you get all three answers you can pick a Har HaBayit card',
    },
    // --- Added: Deck and Parsha Masei (Sefer Bamidbar) ---
    {
      type: 'deck',
      title: 'Parsha Deck',
      image: '/cards/Parsha Deck.png',
      note: '',
    },
    {
      type: 'qa',
      title: 'Parsha Masei (Sefer Bamidbar)',
      questions: [
        {
          question: 'Why did the King of Arad feel at liberty to attack the Jewish People?',
          answer: 'When Aharon died, the clouds of glory protecting the Jewish People departed.',
          zchut: 50,
        },
        {
          question: 'What did God say would happen if the Israelites did not drive out all of the inhabitants?',
          answer: 'God promises: “Those that remain will be as thorns in your eyes, as pricks in your sides, and they shall harass you in the land where you dwell”',
          zchut: 50,
        },
        {
          question: 'In order to be safe, how long must the person who has fled to a city of refuge remain?',
          answer: 'The person must remain until the death of the high priest',
          zchut: 50,
        },
      ],
      note: 'If you get all three answers you can pick a Har HaBayit card',
    },
    // --- Added: Deck and Parsha Dvarim (Sefer Dvarim) ---
    {
      type: 'deck',
      title: 'Parsha Deck',
      image: '/cards/Parsha Deck.png',
      note: '',
    },
    {
      type: 'qa',
      title: 'Parsha Dvarim (Sefer Dvarim)',
      questions: [
        {
          question: 'Moshe rebuked the Jewish People shortly before his death. From whom did he learn this?',
          answer: 'From Yaakov, who rebuked his sons shortly before his death.',
          zchut: 50,
        },
        {
          question: 'Moshe was looking for several qualities in the judges he chose. Which quality couldn\'t he find?',
          answer: 'Men of understanding',
          zchut: 50,
        },
        {
          question: 'Why were the Jewish People not permitted to conquer the Philistines?',
          answer: 'Because Avraham had made a peace treaty with Avimelech, King of the Philistines.',
          zchut: 50,
        },
      ],
      note: 'If you get all three answers you can pick a Har HaBayit card',
    },
    // --- Added: Deck and Parsha V'etchanan (Sefer Dvarim) ---
    {
      type: 'deck',
      title: 'Parsha Deck',
      image: '/cards/Parsha Deck.png',
      note: '',
    },
    {
      type: 'qa',
      title: "Parsha V'etchanan (Sefer Dvarim)",
      questions: [
        {
          question: 'And I prayed to Hashem at that time." Why "at that time"?',
          answer: 'Defeating Sichon and Og, Moshe thought perhaps Hashem had annulled the vow against his entering the Land',
          zchut: 50,
        },
        {
          question: 'The word “Va’etchanan” has the numerical value of five hundred and fifteen, what does this teaches us?',
          answer: 'Moshe prayed five hundred and fifteen prayers to Hashem to be permitted to enter Eretz Yisrael',
          zchut: 50,
        },
        {
          question: 'What is meant by "Hashem, our G-d, Hashem is One"?',
          answer: 'Hashem, who is now our G-d, but not [accepted as] G-d of the other nations, will eventually be [accepted as] the one and only G-d',
          zchut: 50,
        },
      ],
      note: 'If you get all three answers you can pick a Har HaBayit card',
    },
    // --- Added: Deck and Parsha Ekev (Sefer Dvarim) ---
    {
      type: 'deck',
      title: 'Parsha Deck',
      image: '/cards/Parsha Deck.png',
      note: '',
    },
    {
      type: 'qa',
      title: 'Parsha Ekev (Sefer Dvarim)',
      questions: [
        {
          question: 'On what day did Moshe come down from Mt. Sinai having received complete forgiveness for the Jewish People?',
          answer: 'The tenth of Tishrei, Yom Kippur',
          zchut: 50,
        },
        {
          question: 'How was Aharon punished for his role in the golden calf?',
          answer: 'His two sons died',
          zchut: 50,
        },
        {
          question: "What is meant by circumcising one's heart?",
          answer: 'To remove those things that block the words of Torah from entering.',
          zchut: 50,
        },
      ],
      note: 'If you get all three answers you can pick a Har HaBayit card',
    },
    // --- Added: Deck and Parsha Re'eh (Sefer Dvarim) ---
    {
      type: 'deck',
      title: 'Parsha Deck',
      image: '/cards/Parsha Deck.png',
      note: '',
    },
    {
      type: 'qa',
      title: "Parsha Re'eh (Sefer Dvarim)",
      questions: [
        {
          question: 'What were the sites designated for the "blessings and the curses" to be pronounced by the people?',
          answer: 'Mt. Gerizim and Mt. Eval, respectively',
          zchut: 50,
        },
        {
          question: 'In the future will poverty cease to exist in Israel?',
          answer: "No. 'For destitute people will not cease to exist within the Land' (15:11)",
          zchut: 50,
        },
        {
          question: 'Which four individuals are under Hashem\'s "special protection"?',
          answer: 'A levi, convert, orphan, and widow',
          zchut: 50,
        },
      ],
      note: 'If you get all three answers you can pick a Har HaBayit card',
    },
    // --- Added: Deck and Parsha Shoftim (Sefer Dvarim) ---
    {
      type: 'deck',
      title: 'Parsha Deck',
      image: '/cards/Parsha Deck.png',
      note: '',
    },
    {
      type: 'qa',
      title: 'Parsha Shoftim (Sefer Dvarim)',
      questions: [
        {
          question: 'What is the role of shoftim? What is the role of shotrim?',
          answer: 'Shoftim are judges who pronounce judgment. Shotrim are officers who enforce it.',
          zchut: 50,
        },
        {
          question: "What does Hashem promise a king who doesn't amass much gold, doesn't raise many horses and doesn't marry many wives?",
          answer: 'That his kingdom will endure',
          zchut: 50,
        },
        {
          question: 'Why are reasons for the mitzvot not given?',
          answer: 'Because in two places they were given even the wise King Shlomo stumbled in them.  He amassed too many horses and wives.',
          zchut: 50,
        },
      ],
      note: 'If you get all three answers you can pick a Har HaBayit card',
    },
    // --- Added: Deck and Parsha Ki Tetzei (Sefer Dvarim) ---
    {
      type: 'deck',
      title: 'Parsha Deck',
      image: '/cards/Parsha Deck.png',
      note: '',
    },
    {
      type: 'qa',
      title: 'Parsha Ki Tetzei (Sefer Dvarim)',
      questions: [
        {
          question: 'How does the Torah indirectly warn of dire consequences of marrying a captured woman by the subjects that follow in the Torah reading?',
          answer: 'If you marry her, in time you will come to hate her, and she will give you a rebellious son who may have to be executed',
          zchut: 50,
        },
        {
          question: 'Why does the Torah forbid wearing the clothing of the opposite gender?',
          answer: 'It leads to immorality',
          zchut: 50,
        },
        {
          question: 'Why does the Torah link the mitzvah of sending away the mother bird to a long life?',
          answer: 'The mother can lay more eggs and bring more life into the world. One who is sensitive to perpetuation of life should have his own life lengthened',
          zchut: 50,
        },
      ],
      note: 'If you get all three answers you can pick a Har HaBayit card',
    },
    // --- Added: Deck and Parsha Ki Tavo (Sefer Dvarim) ---
    {
      type: 'deck',
      title: 'Parsha Deck',
      image: '/cards/Parsha Deck.png',
      note: '',
    },
    {
      type: 'qa',
      title: 'Parsha Ki Tavo (Sefer Dvarim)',
      questions: [
        {
          question: 'Bikkurim are from which crops?',
          answer: 'The seven species for which Eretz Yisrael is praised',
          zchut: 50,
        },
        {
          question: 'How is the manner of expressing the curses in Parshat Bechukotai more severe than in this week\'s parsha?',
          answer: "In Bechukotai the Torah speaks in the plural, whereas in this week's Parsha the curses are mentioned in the singular.",
          zchut: 50,
        },
        {
          question: 'Which four groups benefit from the tithes?',
          answer: 'Levites, strangers, widows, and orphans benefit from tithes',
          zchut: 50,
        },
      ],
      note: 'If you get all three answers you can pick a Har HaBayit card',
    },
    // --- Added: Deck and Parsha Nitzavim (Sefer Dvarim) ---
    {
      type: 'deck',
      title: 'Parsha Deck',
      image: '/cards/Parsha Deck.png',
      note: '',
    },
    {
      type: 'qa',
      title: 'Parsha Nitzavim (Sefer Dvarim)',
      questions: [
        {
          question: 'Hashem promises that he will return us to our Land and we will enjoy more goodness than our ancestors.  What will He do to our heart at that time?',
          answer: 'He will circumsize our heart',
          zchut: 50,
        },
        {
          question: '"The hidden things are for Hashem, our G-d, and the revealed things are for us" What does this mean?',
          answer: 'There is collective culpability only for "open" sins, but not for "hidden" ones.',
          zchut: 50,
        },
        {
          question: 'Where is the Torah not to be found? Where is it to be found?',
          answer: 'The Torah is not found in heaven nor across the ocean. Rather, it is "very close to you, in your mouth and in your heart."',
          zchut: 50,
        },
      ],
      note: 'If you get all three answers you can pick a Har HaBayit card',
    },
    // --- Added: Deck and Parsha Vayelech (Sefer Dvarim) ---
    {
      type: 'deck',
      title: 'Parsha Deck',
      image: '/cards/Parsha Deck.png',
      note: '',
    },
    {
      type: 'qa',
      title: 'Parsha Vayelech (Sefer Dvarim)',
      questions: [
        {
          question: 'How old was Moshe when he died',
          answer: '120',
          zchut: 50,
        },
        {
          question: 'What did Moshe command Yehoshua to be?',
          answer: 'Strong and Courageous',
          zchut: 50,
        },
        {
          question: 'How often does the hakhel (assembly of the Jewish People) take place?',
          answer: 'Once every seven years, in the first year of the new shemitah period.',
          zchut: 50,
        },
      ],
      note: 'If you get all three answers you can pick a Har HaBayit card',
    },
    // --- Added: Deck and Parsha Ha'azinu (Sefer Dvarim) ---
    {
      type: 'deck',
      title: 'Parsha Deck',
      image: '/cards/Parsha Deck.png',
      note: '',
    },
    {
      type: 'qa',
      title: "Parsha Ha'azinu (Sefer Dvarim)",
      questions: [
        {
          question: 'What is so special about the heavens and the earth that Moshe chooses them as witnesses?',
          answer: 'They endure forever',
          zchut: 50,
        },
        {
          question: 'Why did Hashem separate the peoples of the world into exactly 70 nations?',
          answer: 'Corresponding to the 70 Bnei Yisrael who entered Egypt',
          zchut: 50,
        },
        {
          question: 'If Moshe had spoken to the rock rather than striking it, what would the Jewish People have learned?',
          answer: 'If the rock had produced water without being struck, then the Jewish People would have reasoned that if a rock, which receives no reward or punishment, obeys Hashem\'s commands, all the more so they should too',
          zchut: 50,
        },
      ],
      note: 'If you get all three answers you can pick a Har HaBayit card',
    },
    // --- Added: Deck and Parsha V'Zot HaBracha (Sefer Dvarim) ---
    {
      type: 'deck',
      title: 'Parsha Deck',
      image: '/cards/Parsha Deck.png',
      note: '',
    },
    {
      type: 'qa',
      title: "Parsha V'Zot HaBracha (Sefer Dvarim)",
      questions: [
        {
          question: 'Why was Binyamin blessed before Yosef?',
          answer: 'Because the Beit Hamikdash, built in Binyamin\'s portion, was "more beloved" than the Mishkan built in Yosef\'s portion.',
          zchut: 50,
        },
        {
          question: 'Who wrote the last eight verses in the Torah, starting with the verse "and Moshe died"?',
          answer: 'According to one opinion, Yehoshua wrote it. Rabbi Meir says Moshe himself wrote it with tears.',
          zchut: 50,
        },
        {
          question: 'Who buried Moshe?',
          answer: 'According to one opinion, Hashem buried Moshe. According to Rabbi Yishmael, Moshe buried himself.',
          zchut: 50,
        },
      ],
      note: 'If you get all three answers you can pick a Har HaBayit card',
    },
  ]; // End of cards array

  const handleShowAnswer = (idx) => {
    setShownAnswers((prev) => [...prev, idx]);
  };

  const handleClaimZchut = (idx) => {
    if (claimedQuestions.includes(idx)) return;
    setClaimedQuestions((prev) => [...prev, idx]);
    const zchut = (cardsState || cards)[cardIndex].questions[idx].zchut;
    setPlayers((prevPlayers) => {
      return prevPlayers.map((p) =>
        p.index === currentPlayer.index ? { ...p, zchutPoints: (p.zchutPoints || 0) + zchut } : p
      );
    });
    alert(`${currentPlayer.name} received ${zchut} Zchut!`);
  };

  const handleNext = () => {
    setShownAnswers([]);
    setClaimedQuestions([]);
    setCardIndex((prev) => Math.min(prev + 1, (cardsState || cards).length - 1));
  };

  const handleBack = () => {
    setShownAnswers([]);
    setClaimedQuestions([]);
    setCardIndex((prev) => Math.max(prev - 1, 0));
  };

  const safeIndex = Math.max(0, Math.min(cardIndex, (cardsState || cards).length - 1));
  const currentCard = (cardsState || cards)[safeIndex];

  if (!currentCard) return null;

  return (
    <div style={modalStyles.overlay}>
      <div style={modalStyles.modal}>
        <h2>{currentCard.title}</h2>
        {currentCard.type === 'deck' ? (
          <div style={{ textAlign: 'center', margin: '32px 0' }}>
            <img
              src={currentCard.image}
              alt="Parsha Deck"
              style={{
                maxWidth: '650px',
                width: '95%',
                maxHeight: '480px',
                height: 'auto',
                margin: '0 auto 32px auto',
                borderRadius: 16,
                boxShadow: '0 4px 24px #aaa',
                display: 'block',
              }}
            />
          </div>
        ) : (
          <>
            {currentCard.questions.map((q, idx) => (
              <div key={idx} style={{ marginBottom: 18, textAlign: 'left', borderBottom: '1px solid #eee', paddingBottom: 10 }}>
                <strong>Q{idx + 1}: {q.question}</strong><br />
                <span style={{ color: '#28a745' }}>Zchut:</span> {q.zchut}<br />
                {!shownAnswers.includes(idx) && (
                  <button style={modalStyles.button} onClick={() => handleShowAnswer(idx)}>Show Answer</button>
                )}
                {shownAnswers.includes(idx) && (
                  <>
                    <span style={{ color: '#007bff' }}>Answer:</span> {q.answer}<br />
                    <button
                      style={{ ...modalStyles.button, backgroundColor: claimedQuestions.includes(idx) ? '#ccc' : '#28a745' }}
                      onClick={() => handleClaimZchut(idx)}
                      disabled={claimedQuestions.includes(idx)}
                    >
                      {claimedQuestions.includes(idx) ? 'Zchut Claimed' : 'Claim Zchut'}
                    </button>
                  </>
                )}
              </div>
            ))}
            <div style={{ margin: '16px 0', color: '#6f42c1', fontWeight: 'bold' }}>
              {currentCard.note}
            </div>
          </>
        )}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 10 }}>
          <button style={modalStyles.button} onClick={handleBack} disabled={safeIndex === 0}>Back</button>
          <button style={modalStyles.button} onClick={handleNext} disabled={safeIndex === (cardsState || cards).length - 1}>Next</button>
          <button style={modalStyles.button} onClick={onClose}>Close</button>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 12 }}>
          <button style={{ ...modalStyles.button, backgroundColor: '#ff9800' }} onClick={handleShuffle}>Shuffle Parsha</button>
          <button style={{ ...modalStyles.button, backgroundColor: '#007bff' }} onClick={handleReturn}>Return Parsha</button>
        </div>
      </div>
    </div>
  );
}
// --- Tzadik Card Modal ---
function TzadikCardModal({ open, onClose, currentPlayer, setPlayers, cardIndex, setCardIndex }) {
  const [shownAnswers, setShownAnswers] = useState([]);
  const [claimedQuestions, setClaimedQuestions] = useState([]);
  if (!open) return null;

  const currentCard = tzadikCards[cardIndex];

  const handleShowAnswer = (idx) => {
    setShownAnswers((prev) => [...prev, idx]);
  };

  const handleClaimZchut = (idx) => {
    if (claimedQuestions.includes(idx)) return;
    setClaimedQuestions((prev) => [...prev, idx]);
    const zchut = currentCard.questions[idx].zchut;
    setPlayers((prevPlayers) => {
      return prevPlayers.map((p) =>
        p.index === currentPlayer.index ? { ...p, zchutPoints: (p.zchutPoints || 0) + zchut } : p
      );
    });
    alert(`${currentPlayer.name} received ${zchut} Zchut!`);
  };

  const handleNextCard = () => {
    setCardIndex((prev) => (prev + 1) % tzadikCards.length);
    setShownAnswers([]);
    setClaimedQuestions([]);
  };
  const handlePrevCard = () => {
    setCardIndex((prev) => (prev - 1 + tzadikCards.length) % tzadikCards.length);
    setShownAnswers([]);
    setClaimedQuestions([]);
  };

  return (
    <div style={modalStyles.overlay}>
      <div style={modalStyles.modal}>
        <h2>{currentCard.name} Card</h2>
        {currentCard.questions.map((q, idx) => (
          <div key={idx} style={{ marginBottom: 18, textAlign: 'left', borderBottom: '1px solid #eee', paddingBottom: 10 }}>
            <strong>Q{idx + 1}: {q.question}</strong><br />
            <span style={{ color: '#28a745' }}>Zchut:</span> {q.zchut}<br />
            {!shownAnswers.includes(idx) && (
              <button style={modalStyles.button} onClick={() => handleShowAnswer(idx)}>Show Answer</button>
            )}
            {shownAnswers.includes(idx) && (
              <>
                <span style={{ color: '#007bff' }}>Answer:</span> {q.answer}<br />
                <button
                  style={{ ...modalStyles.button, backgroundColor: claimedQuestions.includes(idx) ? '#ccc' : '#28a745' }}
                  onClick={() => handleClaimZchut(idx)}
                  disabled={claimedQuestions.includes(idx)}
                >
                  {claimedQuestions.includes(idx) ? 'Zchut Claimed' : 'Claim Zchut'}
                </button>
              </>
            )}
          </div>
        ))}
        <div style={{ margin: '16px 0', color: '#6f42c1', fontWeight: 'bold' }}>
          If you get all answers correct you can pick a Tzadik card
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
          <button style={modalStyles.button} onClick={handlePrevCard}>Previous</button>
          <button style={modalStyles.button} onClick={handleNextCard}>Next</button>
        </div>
        <button style={modalStyles.button} onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
// --- Har HaBayit Card Modal ---
function HarHaBayitCardModal({ open, onClose, currentPlayer, setPlayers, cardIndex, setCardIndex }) {
  const [shownAnswers, setShownAnswers] = React.useState([]);
  const [claimedQuestions, setClaimedQuestions] = React.useState([]);
  React.useEffect(() => {
    if (!open) {
      setShownAnswers([]);
      setClaimedQuestions([]);
    }
  }, [open]);
  if (!open) return null;

  const currentCard = harHaBayitCards[cardIndex];

  const handleShowAnswer = (idx) => {
    setShownAnswers((prev) => [...prev, idx]);
  };

  const handleClaimZchut = (idx) => {
    if (claimedQuestions.includes(idx)) return;
    setClaimedQuestions((prev) => [...prev, idx]);
    // Support both 'points' and 'zchut' fields for compatibility
    const q = currentCard.questions[idx];
    const zchut = q.zchut || q.points || 0;
    setPlayers((prevPlayers) => {
      return prevPlayers.map((p) =>
        p.index === currentPlayer.index ? { ...p, zchutPoints: (p.zchutPoints || 0) + zchut } : p
      );
    });
    alert(`${currentPlayer.name} received ${zchut} Zchut!`);
  };

  const handleNextCard = () => {
    setCardIndex((prev) => (prev + 1) % harHaBayitCards.length);
    setShownAnswers([]);
    setClaimedQuestions([]);
  };
  const handlePrevCard = () => {
    setCardIndex((prev) => (prev - 1 + harHaBayitCards.length) % harHaBayitCards.length);
    setShownAnswers([]);
    setClaimedQuestions([]);
  };

  return (
    <div style={modalStyles.overlay}>
      <div style={modalStyles.modal}>
        <h2>{currentCard.name} Card</h2>
        {currentCard.questions.map((q, idx) => (
          <div key={idx} style={{ marginBottom: 18, textAlign: 'left', borderBottom: '1px solid #eee', paddingBottom: 10 }}>
            <strong>Q{idx + 1}: {q.question}</strong><br />
            <span style={{ color: '#28a745' }}>Zchut:</span> {q.zchut || q.points}<br />
            {!shownAnswers.includes(idx) && (
              <button style={modalStyles.button} onClick={() => handleShowAnswer(idx)}>Show Answer</button>
            )}
            {shownAnswers.includes(idx) && (
              <>
                <span style={{ color: '#007bff' }}>Answer:</span> {q.answer}<br />
                <button
                  style={{ ...modalStyles.button, backgroundColor: claimedQuestions.includes(idx) ? '#ccc' : '#28a745' }}
                  onClick={() => handleClaimZchut(idx)}
                  disabled={claimedQuestions.includes(idx)}
                >
                  {claimedQuestions.includes(idx) ? 'Zchut Claimed' : 'Claim Zchut'}
                </button>
              </>
            )}
          </div>
        ))}
        <div style={{ margin: '16px 0', color: '#6f42c1', fontWeight: 'bold' }}>
          If you get all answers correct you can pick a Tzadik card
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
          <button style={modalStyles.button} onClick={handlePrevCard}>Previous</button>
          <button style={modalStyles.button} onClick={handleNextCard}>Next</button>
        </div>
        <button style={modalStyles.button} onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
function MazalCardModal({ open, onClose, currentPlayer, setPlayers, mazalCard, onAccept }) {
  const [showReward, setShowReward] = useState(false);
  useEffect(() => {
    if (open) {
      setShowReward(false);
    }
  }, [open, mazalCard]);
  if (!open) return null;

  return (
    <div style={modalStyles.overlay}>
      <div style={modalStyles.modal}>
        <h2>{mazalCard.name} Card</h2>
        <p>{mazalCard.text}</p>
        {!showReward ? (
          <button style={modalStyles.button} onClick={() => setShowReward(true)}>Show Mazal</button>
        ) : (
          <>
            {/* Special logic for Aliyah boom card */}
            {mazalCard.special === "aliyahBoom" ? (
              <button style={modalStyles.button} onClick={() => {
                // Get owned properties
                const ownedProps = Object.values(boardEvents)
                  .map(e => e.card)
                  .filter(card => card.ownerIndex === currentPlayer.index && card.type === "property");
                if (ownedProps.length === 0) {
                  alert("You don't own any properties!");
                  onClose();
                  return;
                }
                let propList = ownedProps.map((p, i) => (i+1) + ': ' + p.name + ' (Houses: ' + (p.houses||0) + ', Hotel: ' + (p.hotel ? 'Yes' : 'No') + ')').join('\n');
                let idx = parseInt(prompt('Choose a property for your free house/hotel (enter number):\n' + propList));
                if (isNaN(idx) || idx < 1 || idx > ownedProps.length) {
                  alert('Invalid selection.');
                  return;
                }
                let prop = ownedProps[idx-1];
                if (!prop.hotel && prop.houses < 4) {
                  prop.houses = (prop.houses || 0) + 1;
                  alert('You received a free house on ' + prop.name + '!');
                } else if (!prop.hotel && prop.houses === 4) {
                  prop.houses = 0;
                  prop.hotel = true;
                  alert('You received a free hotel on ' + prop.name + '!');
                } else {
                  alert('This property already has a hotel. No upgrade possible.');
                }
                onClose();
              }}>
                Choose Property for Free House/Hotel
              </button>
            ) : (
              <>
                {typeof mazalCard.reward !== 'undefined' && (
                  mazalCard.rewardType === "moneyAndZchut" ? (
                    <>
                      <p>Reward: $ {mazalCard.reward.money} and {mazalCard.reward.zchut} Zchut</p>
                      <button style={modalStyles.button} onClick={onAccept}>Accept Reward</button>
                    </>
                  ) : (
                    <>
                      <p>Reward: {mazalCard.rewardType === "zchut" ? (mazalCard.reward + ' Zchut') : ('$' + mazalCard.reward)}</p>
                      <button style={modalStyles.button} onClick={onAccept}>Accept Reward</button>
                    </>
                  )
                )}
              </>
            )}
            {mazalCard.penalty && (
              <>
                <p>Penalty: {mazalCard.penaltyType === "zchut" ? (mazalCard.penalty + ' Zchut') : ('$' + mazalCard.penalty)}</p>
                {/* Show Tzedaka fund note only for the two $1000 penalty cards */}
                {(mazalCard.buttonText === "Give the bank $1000") && (
                  <div style={{ fontSize: 13, color: '#555', margin: '8px 0 0 0' }}>
                    Note: The bank has given these funds to the Tzedaka fund. So you may end up getting this back.
                  </div>
                )}
                <button style={modalStyles.button} onClick={onAccept}>{mazalCard.buttonText || "Accept Penalty"}</button>
              </>
            )}
          </>
        )}
        <button style={modalStyles.button} onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
import Dice from "react-dice-roll";

// --- Board Image path ---
const boardImage = "/torahpoly_board.png";

// --- Red Properties ---
const schemRoyalEstates = { type: "property", name: "Schem Royal Estates", colorGroup: "red", price: 300, rent: { base: 60, house1: 150, house2: 350, house3: 700, hotel: 800 }, buildCost: { house: 200, hotel: 300 }, houses: 0, hotel: false, ownerIndex: null };
const schemYosephGardens = { type: "property", name: "Schem Yoseph Gardens", colorGroup: "red", price: 300, rent: { base: 60, house1: 150, house2: 350, house3: 700, hotel: 800 }, buildCost: { house: 200, hotel: 300 }, houses: 0, hotel: false, ownerIndex: null };
const schemDreamResorts = { type: "property", name: "Schem Dream Resorts", colorGroup: "red", price: 300, rent: { base: 50, house1: 100, house2: 650, house3: 750, hotel: 750 }, buildCost: { house: 150, hotel: 250 }, houses: 0, hotel: false, ownerIndex: null };

// --- Yellow Property ---
const ephraimHilltops = { type: "property", name: "Ephraim Hilltops", colorGroup: "yellow", price: 300, rent: { base: 50, house1: 300, house2: 400, house3: 500, hotel: 800 }, buildCost: { house: 50, hotel: 100 }, houses: 0, hotel: false, ownerIndex: null };

// --- Green Properties ---
const gushKatif = { type: "property", name: "Gush Katif", colorGroup: "green", price: 350, rent: { base: 60, house1: 150, house2: 350, house3: 700, hotel: 1000 }, buildCost: { house: 150, hotel: 250 }, houses: 0, hotel: false, ownerIndex: null };
const neveDekalim = { type: "property", name: "Neve Dekalim", colorGroup: "green", price: 350, rent: { base: 50, house1: 200, house2: 300, house3: 650, hotel: 800 }, buildCost: { house: 150, hotel: 200 }, houses: 0, hotel: false, ownerIndex: null };
const ganOr = { type: "property", name: "Gan Or", colorGroup: "green", price: 350, rent: { base: 50, house1: 100, house2: 300, house3: 650, hotel: 800 }, buildCost: { house: 150, hotel: 200 }, houses: 0, hotel: false, ownerIndex: null };

// --- Purple Properties ---
const jerusalemHills = { type: "property", name: "Jerusalem Hills", colorGroup: "purple", price: 150, rent: { base: 10, house1: 200, house2: 250, house3: 300, hotel: 400 }, buildCost: { house: 50, hotel: 100 }, houses: 0, hotel: false, ownerIndex: null };
const jerusalemHillsOrchard = { type: "property", name: "Jerusalem Hills Orchard", colorGroup: "purple", price: 150, rent: { base: 10, house1: 200, house2: 250, house3: 300, hotel: 400 }, buildCost: { house: 50, hotel: 100 }, houses: 0, hotel: false, ownerIndex: null };

// --- Gold Properties ---
const hevronElonMamrei = { type: "property", name: "Hevron Elon Mamrei", colorGroup: "gold", price: 240, rent: { base: 30, house1: 70, house2: 200, house3: 550, hotel: 650 }, buildCost: { house: 80, hotel: 150 }, houses: 0, hotel: false, ownerIndex: null };
const hevronLuxuryCondos = { type: "property", name: "Hevron Luxury Condos", colorGroup: "gold", price: 180, rent: { base: 25, house1: 60, house2: 175, house3: 500, hotel: 600 }, buildCost: { house: 60, hotel: 100 }, houses: 0, hotel: false, ownerIndex: null };
const hevronHiTech = { type: "property", name: "Hevron Hi Tech", colorGroup: "gold", price: 180, rent: { base: 25, house1: 60, house2: 175, house3: 500, hotel: 600 }, buildCost: { house: 60, hotel: 100 }, houses: 0, hotel: false, ownerIndex: null };

// --- Board events map ---
const initialBoardEvents = {
  1: { type: "property", card: { ...schemYosephGardens } },
  3: { type: "property", card: { ...schemRoyalEstates } },
  4: { type: "property", card: { ...schemDreamResorts } },
  7: { type: "property", card: { ...ephraimHilltops } },
  11: { type: "property", card: { ...gushKatif } },
  12: { type: "property", card: { ...neveDekalim } },
  14: { type: "property", card: { ...ganOr } },
  25: { type: "property", card: {
    type: "property",
    name: "Manna Foods",
    colorGroup: "white",
    price: 0, // Set dynamically when bought
    rent: { base: 0 },
    buildCost: { house: 0, hotel: 0 },
    houses: 0,
    hotel: false,
    ownerIndex: null
  } },
  28: { type: "property", card: { ...jerusalemHillsOrchard } },
  29: { type: "property", card: { ...jerusalemHills } },
  35: { type: "property", card: { ...hevronElonMamrei } },
  37: { type: "property", card: { ...hevronLuxuryCondos } },
  38: { type: "property", card: { ...hevronHiTech } },
};

// --- Build 44 board positions ---
function buildBoardPositions(refSize = 1200, margin = 100, spacesPerSide = 11) {
  const positions = [];
  const step = (refSize - 2 * margin) / (spacesPerSide - 1);

  const topY = margin;
  for (let i = 0; i < spacesPerSide; i++) positions.push({ x: Math.round(margin + i * step), y: topY });
  const rightX = refSize - margin;
  for (let i = 1; i < spacesPerSide; i++) positions.push({ x: rightX, y: Math.round(topY + i * step) });
  const bottomY = refSize - margin;
  for (let i = 1; i < spacesPerSide; i++) positions.push({ x: Math.round(rightX - i * step), y: bottomY });
  const leftX = margin;
  for (let i = 1; i < spacesPerSide - 1; i++) positions.push({ x: leftX, y: Math.round(bottomY - i * step) });

  return positions.slice(0, 44);
}

const referenceSize = 1200;
const defaultBoardPositions = buildBoardPositions(referenceSize, 100, 11);

// --- Helper to calculate rent ---
const calculateRent = (card) => {
  if (card.hotel) return card.rent.hotel;
  switch (card.houses) {
    case 3: return card.rent.house3;
    case 2: return card.rent.house2;
    case 1: return card.rent.house1;
    default: return card.rent.base;
  }
};



// --- Rescue Modal ---

function RescueModal({ open, onClose, currentPlayer, rentAmount, players, setPlayers }) {
  if (!open) return null;
  const shortfall = rentAmount - (currentPlayer.money || 0);
  // Zchut calculation: needy player can sell up to their zchutPoints (2 Zchut per $1)
  const zchutAvailable = currentPlayer.zchutPoints || 0;
  const maxZchutDollars = Math.min(500, Math.floor(zchutAvailable / 2));
  const maxZchut = maxZchutDollars * 2;
  // List properties at 25% discount
  const ownedProperties = Object.values(boardEvents)
    .map(e => e.card)
    .filter(card => card.ownerIndex === currentPlayer.index);

  // Handle Buy Zchut
  const handleBuyZchut = () => {
    // Prompt for rescuing player
    const rescuers = players.filter(p => p.index !== currentPlayer.index);
    if (rescuers.length === 0) {
      alert("No other players to rescue!");
      return;
    }
    const rescuerNames = rescuers.map((p, i) => `${i + 1}: ${p.name}`).join("\n");
    const rescuerIdx = parseInt(prompt(`Who wants to buy Zchut from ${currentPlayer.name}?\n${rescuerNames}\nEnter number:`));
    if (isNaN(rescuerIdx) || rescuerIdx < 1 || rescuerIdx > rescuers.length) {
      alert("Invalid player selection.");
      return;
    }
    const rescuer = rescuers[rescuerIdx - 1];
    // Max the rescuer can buy is the lesser of their money or the needy player's available Zchut
    const maxBuyableDollars = Math.min(rescuer.money, maxZchutDollars);
    if (maxBuyableDollars < 1) {
      alert("Not enough money to buy Zchut or not enough Zchut to sell.");
      return;
    }
    const amount = parseInt(prompt(`How much money do you want to give to ${currentPlayer.name}? (Max $${maxBuyableDollars})`));
    if (isNaN(amount) || amount <= 0 || amount > maxBuyableDollars) {
      alert("Invalid amount.");
      return;
    }
    // Update players: needy player loses Zchut, gets money; rescuer loses money, gains Zchut
    const updatedPlayers = players.map(p => {
      if (p.index === currentPlayer.index) {
        return { ...p, money: p.money + amount, zchutPoints: p.zchutPoints - amount * 2 };
      } else if (p.index === rescuer.index) {
        return { ...p, money: p.money - amount, zchutPoints: (p.zchutPoints || 0) + amount * 2 };
      } else {
        return p;
      }
    });
    setPlayers(updatedPlayers);
    alert(`${rescuer.name} gave $${amount} to ${currentPlayer.name}.\n${rescuer.name} receives ${amount * 2} Zchut!`);
    onClose();
  };

  return (
    <div style={modalStyles.overlay}>
      <div style={modalStyles.modal}>
        <h2>Rescue Options</h2>
        <p>
          {currentPlayer.name}, you cannot pay ${rentAmount} rent.<br />
          <b>Current Money:</b> ${currentPlayer.money || 0}<br />
          <b>Current Zchut:</b> {currentPlayer.zchutPoints || 0}<br />
          You are missing <b>${shortfall > 0 ? shortfall : 0}</b>.
        </p>
        <p style={{ marginTop: 18, fontWeight: 'bold', color: '#007bff' }}>Any offers to rescue {currentPlayer.name}?</p>

        <button style={{ ...modalStyles.button, backgroundColor: "#28a745" }} onClick={handleBuyZchut}>Buy Zchut</button>
        <div style={{ fontSize: 14, marginBottom: 10, color: '#333' }}>
          {currentPlayer.name} needs money and can sell Zchut!<br />
          <br />
          Get 2 Zchut for every $1<br />
          Get up to {maxZchut} Zchut for ${maxZchutDollars} (if you buy all available)
        </div>

        <button style={{ ...modalStyles.button, backgroundColor: "#ffc107", color: "#333" }} onClick={() => {
          if (ownedProperties.length === 0) {
            alert("This player owns no properties.");
            onClose();
            return;
          }
          // Prompt for buyer
          const buyers = players.filter(p => p.index !== currentPlayer.index);
          if (buyers.length === 0) {
            alert("No other players to buy property!");
            onClose();
            return;
          }
          const buyerNames = buyers.map((p, i) => `${i + 1}: ${p.name}`).join("\n");
          const buyerIdx = parseInt(prompt(`Who wants to buy a property from ${currentPlayer.name}?\n${buyerNames}\nEnter number:`));
          if (isNaN(buyerIdx) || buyerIdx < 1 || buyerIdx > buyers.length) {
            alert("Invalid player selection.");
            return;
          }
          const buyer = buyers[buyerIdx - 1];
          // Prompt for property
          const propList = ownedProperties.map((prop, i) => `${i + 1}: ${prop.name} ($${Math.round(prop.price * 0.75)})`).join("\n");
          const propIdx = parseInt(prompt(`Which property to buy from ${currentPlayer.name}? Enter number:\n` + propList));
          if (isNaN(propIdx) || propIdx < 1 || propIdx > ownedProperties.length) {
            alert("Invalid property selection.");
            return;
          }
          const prop = ownedProperties[propIdx - 1];
          const price = Math.round(prop.price * 0.75);
          // Offer to pay more (chesed)
          const chesedOffer = prompt(`Do a chesed for ${currentPlayer.name} and offer to pay more than the property is worth.\nEnter your offer (minimum $${price}):`);
          const offerAmount = parseInt(chesedOffer);
          if (isNaN(offerAmount) || offerAmount < price) {
            alert(`Offer must be at least $${price} and a valid number.`);
            return;
          }
          if (buyer.money < offerAmount) {
            alert(`${buyer.name} does not have enough money for this offer.`);
            return;
          }
          // Accept offer
          if (!window.confirm(`${currentPlayer.name}, do you accept this offer of $${offerAmount} for ${prop.name} from ${buyer.name}?`)) {
            alert("Offer not accepted.");
            return;
          }
          // Update property owner and player balances
          prop.ownerIndex = buyer.index;
          const updatedPlayers = players.map(p => {
            if (p.index === currentPlayer.index) {
              return { ...p, money: p.money + offerAmount };
            } else if (p.index === buyer.index) {
              return { ...p, money: p.money - offerAmount };
            } else {
              return p;
            }
          });
          setPlayers(updatedPlayers);
          alert(`${buyer.name} bought ${prop.name} from ${currentPlayer.name} for $${offerAmount}`);
          onClose();
        }}>Buy Property</button>
        <div style={{ fontSize: 14, color: '#333', marginBottom: 10 }}>
          {ownedProperties.length === 0 ? (
            <span>This player owns no properties.</span>
          ) : (
            <>
              <span>Properties available at 25% discount:</span>
              <ul style={{ textAlign: 'left', margin: '8px 0 0 20px', padding: 0 }}>
                {ownedProperties.map((prop, idx) => (
                  <li key={idx}>
                    {prop.name}: <s>${prop.price}</s> <b>${Math.round(prop.price * 0.75)}</b>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        <button style={modalStyles.button} onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}

// --- Card Modal ---
function CardModal({ card, onClose, mode, currentPlayer, updatePlayer, players, updatePlayers, onRescue, boardEvents, setBoardEvents }) {
    // Helper: Can buy house?
    const canBuyHouse = () => {
      return card.ownerIndex === currentPlayer.index && !card.hotel && card.houses < 4 && currentPlayer.money >= card.buildCost.house;
    };
    // Helper: Can buy hotel?
    const canBuyHotel = () => {
      return card.ownerIndex === currentPlayer.index && !card.hotel && card.houses === 4 && currentPlayer.money >= card.buildCost.hotel;
    };

    const handleBuyHouse = () => {
      if (!canBuyHouse()) {
        alert('Cannot buy house. Make sure you own the property, have less than 4 houses, no hotel, and enough money.');
        return;
      }
      const updatedPlayers = [...players];
      updatedPlayers[currentPlayer.index] = { ...currentPlayer, money: currentPlayer.money - card.buildCost.house };
      // Update boardEvents immutably
      const updatedBoardEvents = { ...boardEvents };
      updatedBoardEvents[card.position] = {
        ...updatedBoardEvents[card.position],
        card: { ...card, houses: (card.houses || 0) + 1 }
      };
      setBoardEvents(updatedBoardEvents);
      updatePlayers(updatedPlayers);
      alert('You bought a house on ' + card.name + ' for $' + card.buildCost.house + '.');
    };

    const handleBuyHotel = () => {
      if (!canBuyHotel()) {
        alert('Cannot buy hotel. You need 4 houses, no hotel, and enough money.');
        return;
      }
      const updatedPlayers = [...players];
      updatedPlayers[currentPlayer.index] = { ...currentPlayer, money: currentPlayer.money - card.buildCost.hotel };
      // Update boardEvents immutably
      const updatedBoardEvents = { ...boardEvents };
      updatedBoardEvents[card.position] = {
        ...updatedBoardEvents[card.position],
        card: { ...card, houses: 0, hotel: true }
      };
      setBoardEvents(updatedBoardEvents);
      updatePlayers(updatedPlayers);
      alert('You bought a hotel on ' + card.name + ' for $' + card.buildCost.hotel + '.');
    };
  if (!card) return null;
  const isProperty = mode === "property";

    // Strict local-backup logic: only allow buy if property is unowned
    const handleBuyProperty = async () => {
      // Always re-fetch property state from Firestore before allowing a buy
      if (window.multiplayer?.enabled && window.multiplayer?.gameId) {
        const { runTransaction, doc, getDoc } = await import("firebase/firestore");
        const gameRef = doc(db, "games", window.multiplayer.gameId);
        try {
          // Get the latest boardEvents from Firestore
          const snap = await getDoc(gameRef);
          const data = snap.data();
          const gs = data.gameState || {};
          const firestorePlayers = Array.isArray(gs.players) ? [...gs.players] : [];
          const firestoreBoardEvents = gs.boardEvents ? { ...gs.boardEvents } : { ...initialBoardEvents };
          const playerIdx = currentPlayer.index;
          const propertyEvent = firestoreBoardEvents[card.position];
          if (!propertyEvent || propertyEvent.card.ownerIndex !== null) {
            alert("This property is already owned!");
            return;
          }
          if (firestorePlayers[playerIdx].money < card.price) {
            alert("Not enough money!");
            return;
          }
          // Use Firestore transaction to ensure atomic buy
          await runTransaction(db, async (transaction) => {
            const gameSnap = await transaction.get(gameRef);
            const data2 = gameSnap.data();
            const gs2 = data2.gameState || {};
            const firestorePlayers2 = Array.isArray(gs2.players) ? [...gs2.players] : [];
            const firestoreBoardEvents2 = gs2.boardEvents ? { ...gs2.boardEvents } : { ...initialBoardEvents };
            const propertyEvent2 = firestoreBoardEvents2[card.position];
            if (!propertyEvent2 || propertyEvent2.card.ownerIndex !== null) {
              throw new Error("Property already owned!");
            }
            if (firestorePlayers2[playerIdx].money < card.price) {
              throw new Error("Not enough money!");
            }
            firestorePlayers2[playerIdx] = {
              ...firestorePlayers2[playerIdx],
              money: firestorePlayers2[playerIdx].money - card.price
            };
            firestoreBoardEvents2[card.position] = {
              ...propertyEvent2,
              card: { ...propertyEvent2.card, ownerIndex: playerIdx }
            };
            transaction.update(gameRef, {
              'gameState.players': firestorePlayers2,
              'gameState.boardEvents': firestoreBoardEvents2
            });
          });
          alert(`${currentPlayer.name} bought ${card.name} for $${card.price}`);
          onClose();
        } catch (e) {
          alert("Failed to buy property: " + e.message);
        }
        return;
      }
      // Local (single player) fallback
      if (card.ownerIndex !== null) {
        alert("This property is already owned!");
        return;
      }
      if (currentPlayer.money < card.price) {
        alert("Not enough money!");
        return;
      }
      const updatedPlayers = [...players];
      updatedPlayers[currentPlayer.index] = { ...currentPlayer, money: currentPlayer.money - card.price };
      const updatedBoardEvents = { ...boardEvents };
      updatedBoardEvents[card.position] = {
        ...updatedBoardEvents[card.position],
        card: { ...card, ownerIndex: currentPlayer.index }
      };
      setBoardEvents(updatedBoardEvents);
      updatePlayers(updatedPlayers);
      alert(`${currentPlayer.name} bought ${card.name} for $${card.price}`);
      onClose();
    };

  const handlePayRent = async () => {
    // Always use latest property state from boardEvents
    let latestCard = card;
    if (typeof boardEvents === 'object') {
      const found = Object.values(boardEvents).find(e => e.card && e.card.name === card.name);
      if (found && found.card) latestCard = found.card;
    }
    if (latestCard.ownerIndex === null || latestCard.ownerIndex === currentPlayer.index) {
      alert("No rent needed.");
      onClose();
      return;
    }
    const rentAmount = calculateRent(latestCard);
    if (window.multiplayer?.enabled && window.multiplayer?.gameId) {
      // Use Firestore transaction for atomic rent payment
      const { runTransaction, doc } = await import("firebase/firestore");
      const gameRef = doc(db, "games", window.multiplayer.gameId);
      try {
        await runTransaction(db, async (transaction) => {
          const gameSnap = await transaction.get(gameRef);
          const data = gameSnap.data();
          const gs = data.gameState || {};
          const firestorePlayers = Array.isArray(gs.players) ? [...gs.players] : [];
          // Always get latest owner from Firestore boardEvents
          const firestoreBoardEvents = gs.boardEvents ? { ...gs.boardEvents } : {};
          let prop = latestCard;
          const propPos = Object.keys(firestoreBoardEvents).find(pos => firestoreBoardEvents[pos].card && firestoreBoardEvents[pos].card.name === card.name);
          if (propPos && firestoreBoardEvents[propPos].card) prop = firestoreBoardEvents[propPos].card;
          const payerIdx = currentPlayer.index;
          const ownerIdx = prop.ownerIndex;
          if (ownerIdx === null || ownerIdx === payerIdx) {
            throw new Error("No rent due");
          }
          // Calculate rent from latest property state
          let rent = prop.rent.base;
          if (prop.hotel) rent = prop.rent.hotel;
          else if (prop.houses === 4) rent = prop.rent.house3;
          else if (prop.houses === 3) rent = prop.rent.house3;
          else if (prop.houses === 2) rent = prop.rent.house2;
          else if (prop.houses === 1) rent = prop.rent.house1;
          if (firestorePlayers[payerIdx].money < rent) {
            throw new Error("Not enough money to pay rent!");
          }
          firestorePlayers[payerIdx] = {
            ...firestorePlayers[payerIdx],
            money: firestorePlayers[payerIdx].money - rent
          };
          firestorePlayers[ownerIdx] = {
            ...firestorePlayers[ownerIdx],
            money: (firestorePlayers[ownerIdx].money || 0) + rent
          };
          transaction.update(gameRef, {
            'gameState.players': firestorePlayers
          });
        });
        alert(`${currentPlayer.name} paid $${rentAmount} rent to ${players[latestCard.ownerIndex].name}`);
        onClose();
      } catch (e) {
        alert("Failed to pay rent: " + e.message);
        onClose();
      }
      return;
    }
    // Local (single player) fallback
    if (currentPlayer.money >= rentAmount) {
      const updatedPlayers = [...players];
      updatedPlayers[currentPlayer.index].money -= rentAmount;
      updatedPlayers[latestCard.ownerIndex].money += rentAmount;
      updatePlayers(updatedPlayers);
      alert(`${currentPlayer.name} paid $${rentAmount} rent to ${players[latestCard.ownerIndex].name}`);
      onClose();
    } else {
      // Trigger Rescue Modal if not enough money
      onClose();
      if (onRescue) onRescue(currentPlayer, rentAmount);
    }
  };

    const handleTrade = () => {
      const targetPlayerIndex = prompt("Enter the player number you want to trade with:");
      const targetPlayer = players.find(p => p.index === parseInt(targetPlayerIndex));
      if (!targetPlayer) { alert("Invalid player!"); return; }

      const targetProps = Object.values(boardEvents).map(e => e.card).filter(c => c.ownerIndex === targetPlayer.index);
      if (targetProps.length === 0) { alert(`${targetPlayer.name} owns no properties.`); return; }

      const propIndex = prompt(`Which property to buy from ${targetPlayer.name}? Enter number:\n` +
        targetProps.map((p, i) => `${i}: ${p.name}`).join("\n")
      );
      const selectedProp = targetProps[propIndex];
      if (!selectedProp) { alert("Invalid property choice."); return; }

      const offerAmount = parseInt(prompt(`Offer how much money for ${selectedProp.name}?`));
      if (isNaN(offerAmount) || offerAmount <= 0) { alert("Invalid amount."); return; }
      if (currentPlayer.money < offerAmount) { alert("You don't have enough money."); return; }

      const updatedPlayers = [...players];
      updatedPlayers[currentPlayer.index].money -= offerAmount;
      updatedPlayers[targetPlayer.index].money += offerAmount;
      // Update boardEvents immutably
      const updatedBoardEvents = { ...boardEvents };
      // Find the property position
      const propPos = Object.keys(boardEvents).find(pos => boardEvents[pos].card === selectedProp);
      if (propPos) {
        updatedBoardEvents[propPos] = {
          ...updatedBoardEvents[propPos],
          card: { ...selectedProp, ownerIndex: currentPlayer.index }
        };
        setBoardEvents(updatedBoardEvents);
      }
      updatePlayers(updatedPlayers);
      alert(`${currentPlayer.name} bought ${selectedProp.name} from ${targetPlayer.name} for $${offerAmount}`);
      onClose();
    };

  return (
    <div style={modalStyles.overlay}>
      <div style={modalStyles.modal}>
        <h2>{card.name}</h2>
        {isProperty && (
          <>
            <div style={{ height: 20, backgroundColor: card.colorGroup, marginBottom: 10, borderRadius: 4 }}></div>
            <p>Price: ${card.price}</p>
            <p>Rent: ${card.rent.base}</p>
            <p>Rent with 1 House: ${card.rent.house1}</p>
            <p>Rent with 2 Houses: ${card.rent.house2}</p>
            <p>Rent with 3 Houses: ${card.rent.house3}</p>
            <p>Rent with Hotel: ${card.rent.hotel}</p>
            <p>Houses: {card.houses || 0} (Cost: ${card.buildCost.house} each)</p>
            <p>Hotel: {card.hotel ? 'Yes' : 'No'} (Cost: ${card.buildCost.hotel})</p>
            <p>Owner: {card.ownerIndex !== null ? `Player ${card.ownerIndex + 1}` : "None"}</p>
            <p>Your Money: ${currentPlayer.money}</p>
            <p>Your Zchut Points: {currentPlayer.zchutPoints}</p>

            {/* Multiplayer: enforce atomic buy/rent via Firestore; Local: fallback to local logic */}
            {/* Always use latest boardEvents/card.ownerIndex for button rendering */}
            {(() => {
              // Find the latest card state from boardEvents if available
              let latestCard = card;
              if (typeof boardEvents === 'object') {
                const found = Object.values(boardEvents).find(e => e.card && e.card.name === card.name);
                if (found && found.card) latestCard = found.card;
              }
              // Only show Buy if truly unowned
              if (latestCard.ownerIndex === null) {
                return (
                  <button style={{ ...modalStyles.button, backgroundColor: "green" }}
                    onClick={async () => {
                      if (window.multiplayer?.enabled && window.multiplayer?.gameId) {
                        // Firestore transaction for atomic buy
                        const { runTransaction, doc } = await import("firebase/firestore");
                        const gameRef = doc(db, "games", window.multiplayer.gameId);
                        try {
                          await runTransaction(db, async (transaction) => {
                            const gameSnap = await transaction.get(gameRef);
                            const data = gameSnap.data();
                            const gs = data.gameState || {};
                            const firestorePlayers = Array.isArray(gs.players) ? [...gs.players] : [];
                            const firestoreBoardEvents = gs.boardEvents ? { ...gs.boardEvents } : {};
                            const playerIdx = currentPlayer.index;
                            // Find property position
                            const propPos = Object.keys(firestoreBoardEvents).find(pos => firestoreBoardEvents[pos].card && firestoreBoardEvents[pos].card.name === card.name);
                            if (!propPos) throw new Error("Property not found");
                            // Check if already owned
                            if (firestoreBoardEvents[propPos].card.ownerIndex !== null && typeof firestoreBoardEvents[propPos].card.ownerIndex === 'number') {
                              throw new Error("Property already owned");
                            }
                            // Check player funds
                            if (firestorePlayers[playerIdx].money < card.price) {
                              throw new Error("Not enough money");
                            }
                            // Update property owner
                            firestoreBoardEvents[propPos] = {
                              ...firestoreBoardEvents[propPos],
                              card: { ...firestoreBoardEvents[propPos].card, ownerIndex: playerIdx }
                            };
                            // Deduct money
                            firestorePlayers[playerIdx] = {
                              ...firestorePlayers[playerIdx],
                              money: firestorePlayers[playerIdx].money - card.price
                            };
                            transaction.update(gameRef, {
                              'gameState.players': firestorePlayers,
                              'gameState.boardEvents': firestoreBoardEvents
                            });
                          });
                          alert(`You bought ${card.name} for $${card.price}`);
                          onClose(); // Immediately close modal after buy
                        } catch (e) {
                          alert("Failed to buy property: " + e.message);
                          onClose();
                        }
                      } else {
                        handleBuyProperty();
                      }
                    }}
                  >Buy Property</button>
                );
              }
              // Only show Pay Rent if property is owned by someone else
              if (latestCard.ownerIndex !== null && latestCard.ownerIndex !== currentPlayer.index) {
                return (
                  <>
                    <button style={{ ...modalStyles.button, backgroundColor: "orange" }}
                      onClick={async () => {
                        if (window.multiplayer?.enabled && window.multiplayer?.gameId) {
                          // Firestore transaction for atomic rent
                          const { runTransaction, doc } = await import("firebase/firestore");
                          const gameRef = doc(db, "games", window.multiplayer.gameId);
                          try {
                            await runTransaction(db, async (transaction) => {
                              const gameSnap = await transaction.get(gameRef);
                              const data = gameSnap.data();
                              const gs = data.gameState || {};
                              const firestorePlayers = Array.isArray(gs.players) ? [...gs.players] : [];
                              const firestoreBoardEvents = gs.boardEvents ? { ...gs.boardEvents } : {};
                              const payerIdx = currentPlayer.index;
                              // Find property position
                              const propPos = Object.keys(firestoreBoardEvents).find(pos => firestoreBoardEvents[pos].card && firestoreBoardEvents[pos].card.name === card.name);
                              if (!propPos) throw new Error("Property not found");
                              const prop = firestoreBoardEvents[propPos].card;
                              // Check if owned by someone else
                              if (prop.ownerIndex === null || prop.ownerIndex === payerIdx) {
                                throw new Error("No rent due");
                              }
                              const ownerIdx = prop.ownerIndex;
                              // Calculate rent
                              let rentAmount = prop.rent.base;
                              if (prop.hotel) rentAmount = prop.rent.hotel;
                              else if (prop.houses === 4) rentAmount = prop.rent.house3;
                              else if (prop.houses === 3) rentAmount = prop.rent.house3;
                              else if (prop.houses === 2) rentAmount = prop.rent.house2;
                              else if (prop.houses === 1) rentAmount = prop.rent.house1;
                              // Check payer funds
                              if (firestorePlayers[payerIdx].money < rentAmount) {
                                throw new Error("Not enough money to pay rent!");
                              }
                              // Transfer rent
                              firestorePlayers[payerIdx] = {
                                ...firestorePlayers[payerIdx],
                                money: firestorePlayers[payerIdx].money - rentAmount
                              };
                              firestorePlayers[ownerIdx] = {
                                ...firestorePlayers[ownerIdx],
                                money: (firestorePlayers[ownerIdx].money || 0) + rentAmount
                              };
                              transaction.update(gameRef, {
                                'gameState.players': firestorePlayers
                              });
                            });
                            alert(`You paid rent for ${card.name}`);
                            onClose();
                          } catch (e) {
                            alert("Failed to pay rent: " + e.message);
                            onClose();
                          }
                        } else {
                          handlePayRent();
                        }
                      }}
                    >Pay Rent</button>
                    <button style={{ ...modalStyles.button, backgroundColor: "purple" }} onClick={handleTrade}>Trade Property</button>
                  </>
                );
              }
              // Only show Trade if property is owned by someone else
              return null;
            })()}
            {/* Buy House/Hotel buttons for property owner */}
            {card.ownerIndex === currentPlayer.index && !card.hotel && card.houses < 4 && (
              <button style={{ ...modalStyles.button, backgroundColor: '#007bff', color: '#fff' }} onClick={handleBuyHouse}>
                Buy House (${card.buildCost.house})
              </button>
            )}
            {card.ownerIndex === currentPlayer.index && !card.hotel && card.houses === 4 && (
              <button style={{ ...modalStyles.button, backgroundColor: '#b8860b', color: '#fff' }} onClick={handleBuyHotel}>
                Buy Hotel (${card.buildCost.hotel})
              </button>
            )}
            <button style={modalStyles.button} onClick={onClose}>Close</button>
          </>
        )}
      </div>
    </div>
  );
}

// --- Player Panel Modal ---
function PlayerPanelModal({ player, onClose, boardEvents }) {
  if (!player) return null;

  const ownedProperties = Array.from(
    new Set(
      Object.values(boardEvents)
        .map((e) => e.card)
        .filter((card) => card.ownerIndex === player.index)
    )
  );

  const calculateCurrentRent = (card) => {
    if (card.hotel) return card.rent.hotel;
    switch (card.houses) {
      case 3: return card.rent.house3;
      case 2: return card.rent.house2;
      case 1: return card.rent.house1;
      default: return card.rent.base;
    }
  };

  const useTwoColumns = ownedProperties.length > 5;
  const columnStyle = useTwoColumns
    ? { display: "flex", flexWrap: "wrap", justifyContent: "space-between" }
    : { textAlign: "left" };
  const itemStyle = useTwoColumns
    ? { width: "48%", marginBottom: 12 }
    : { marginBottom: 8 };

  // Access currentPlayerIndex from window if available (since modal is outside main App scope)
  const currentPlayerIndex = window?.currentPlayerIndex;
  const isCurrentPlayer = typeof currentPlayerIndex === 'number' && player.index === currentPlayerIndex;

  const handleBuyHouseHotel = () => {
    if (ownedProperties.length === 0) {
      alert("You don't own any properties!");
      return;
    }
    // Prompt for property
    const propList = ownedProperties.map((p, i) => `${i + 1}: ${p.name} (Houses: ${p.houses || 0}, Hotel: ${p.hotel ? 'Yes' : 'No'}, House Cost: $${p.buildCost.house}, Hotel Cost: $${p.buildCost.hotel})`).join('\n');
    const idx = parseInt(prompt(`Choose a property to build on (enter number):\n${propList}`));
    if (isNaN(idx) || idx < 1 || idx > ownedProperties.length) {
      alert('Invalid selection.');
      return;
    }
    const prop = ownedProperties[idx - 1];
    // Determine build type
    let buildType = 'house';
    if (!prop.hotel && prop.houses === 4) buildType = 'hotel';
    if (prop.hotel) {
      alert('This property already has a hotel. No upgrade possible.');
      return;
    }
    // Check funds
    const cost = buildType === 'house' ? prop.buildCost.house : prop.buildCost.hotel;
    if (player.money < cost) {
      alert(`Not enough money. You need $${cost} to buy a ${buildType}.`);
      return;
    }
    // Confirm
    if (!window.confirm(`Buy a ${buildType} on ${prop.name} for $${cost}?`)) return;
    // Update player and property
    // Update boardEvents and players globally
    if (typeof window.setPlayers === 'function') {
      window.setPlayers(prevPlayers => prevPlayers.map(p =>
        p.index === player.index ? { ...p, money: p.money - cost } : p
      ));
    }
    // Update property
    prop.houses = buildType === 'house' ? (prop.houses || 0) + 1 : 0;
    prop.hotel = buildType === 'hotel';
    alert(`You bought a ${buildType} on ${prop.name}!`);
    // Force asset update by closing and reopening modal
    onClose();
    setTimeout(() => window.setShowPanel && window.setShowPanel(player.index), 300);
  };

  return (
    <div style={modalStyles.overlay}>
      <div style={modalStyles.modal}>
        <h2>{player.name}'s Properties</h2>
        {ownedProperties.length === 0 ? (
          <p>No properties owned.</p>
        ) : (
          <div style={columnStyle}>
            {ownedProperties.map((prop, idx) => (
              <div key={idx} style={itemStyle}>
                <div style={{ height: 16, width: 60, backgroundColor: prop.colorGroup, borderRadius: 4, marginBottom: 4 }}></div>
                <strong>{prop.name}</strong><br />
                Price: ${prop.price}<br />
                Houses: {prop.houses}, Hotel: {prop.hotel ? "Yes" : "No"}<br />
                House Cost: ${prop.buildCost.house}, Hotel Cost: ${prop.buildCost.hotel}<br />
                Current Rent: ${calculateCurrentRent(prop)}
              </div>
            ))}
          </div>
        )}
        <div style={{ marginTop: 16 }}>
          <button
            style={{ ...modalStyles.button, backgroundColor: isCurrentPlayer ? '#28a745' : '#ccc', marginRight: 8 }}
            onClick={handleBuyHouseHotel}
            disabled={!isCurrentPlayer}
          >
            Buy House/Hotel
          </button>
          <button style={modalStyles.button} onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

function RulesModal({ open, onClose }) {
  if (!open) return null;

  return (
    <div style={modalStyles.overlay}>
      <div style={{ ...modalStyles.modal, maxWidth: 900, width: '92%', maxHeight: '82vh', overflowY: 'auto', textAlign: 'left' }}>
        <h2 style={{ textAlign: 'center', marginTop: 0 }}>TORAHPOLY</h2>
        <h3 style={{ textAlign: 'center', marginTop: 0 }}>A GAME OF LIFE</h3>
        <h3 style={{ textAlign: 'center' }}>Rules</h3>

        <ol style={{ lineHeight: 1.6, paddingLeft: 20 }}>
          <li>Each player starts with 2000 Torahpoly money and 1000 Zchut (merit) money.</li>
          <li>The game ends when players run out of Torahpoly money, but there are other ways as well.</li>
          <li>The winner can decide to give 20% of his capital to the loser to keep playing. The bank will pay double that amount in zchut money to the winner and the game can continue.</li>
          <li>If the zchut money of the loser is more than the capital of the winner, then he is proclaimed winner instead.</li>
          <li>When you land on a Yeshiva nothing happens. However, if you decide to miss a turn and stay in Yeshiva you earn money and zchut. You can stay in Yeshiva for up to three turns.</li>
          <li>Ephrayim Hilltops, home of the hilltop youth, is the only property that does not require a set to buy a house. If the owner lands there they can buy as many additions as they like.</li>
          <li>Players earn 50 Zchut for each correct Torah answer. If they answer all three correct, they may pick a Har Habyit card. If they answer both Har Habayit questions they may pick a Tzadik card.</li>
          <li>Manna Foods is a gift that keeps giving. Cover the cost of a Manna Foods banquet and pay whatever price you like. The money goes to the Tzedaka fund. The next player that lands there returns your expense. Each additional player that lands there pays you whatever price you had set.</li>
          <li>All properties need a set before buying acquisitions. Once you have a set, acquisitions may be bought at any time. Ephrayim Hilltops is an exception. You may freely expand your settlement at any time. Note: If players wish to have a quicker game they can bypass this rule and allow all players to buy properties whenever it is their turn.</li>
          <li>Players begin from the Parnassah square and receive $200 each time they pass it. If they land on it, Bubbie sends them an extra $200.</li>
        </ol>

        <p style={{ marginTop: 18, textAlign: 'center', fontStyle: 'italic' }}>
          Torahpoly was created by Ron (Yoseph Feivel) Wiseman - Torahpoly.com
        </p>

        <div style={{ textAlign: 'center' }}>
          <button style={modalStyles.button} onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}



// --- Main App ---

function App() {
  // --- BoardEvents state for multiplayer property sync ---
  const [boardEvents, setBoardEvents] = useState(initialBoardEvents);
  // Square 21: Sell your brother event state
  const [pendingSellBrother, setPendingSellBrother] = useState(false);
  const [sellBrotherPlayerIndex, setSellBrotherPlayerIndex] = useState(null);
  // --- Jewish Idea Yeshiva event state ---
  const [yeshivaState, setYeshivaState] = useState({}); // { [playerIndex]: { count: 0, active: false } }
  // ...existing code...

  // --- Centralized special square handler (now inside App for state access) ---
  const handleSpecialSquare = (squareIndex) => {
    // Geula (Haman's gallows) (15)
    if (squareIndex === 15) {
      alert("Geula. Yay!! Haman is hung on his own gallows! He raised lots of money to destroy the Jewish people. The study of Torah and teshuva was worth more than all of his money and brought about his downfall.  Roll the dice to see how much money he spent trying to destroy Israel. Guess where that money is going now? Your own personal Geula - 400 times your dice roll. Good luck.");
      setPendingHamanReward(true);
      setHamanPlayerIndex(currentPlayerIndex);
      setPlayers(prev => prev.map((p, idx) => idx === currentPlayerIndex ? { ...p, position: 15 } : p));
      return;
    }
    // Tzedakah (16)
    if (squareIndex === 16) {
      const pay = Math.min(100, players[currentPlayerIndex]?.money || 0);
      if (pay > 0) {
        setTzedakahAmount(prevAmt => prevAmt + pay);
        setPlayers(prev => prev.map((p, idx) => idx === currentPlayerIndex ? { ...p, money: (p.money || 0) - pay, position: 16 } : p));
        alert('Paid $100 to Tzedakah fund!');
      } else {
        setPlayers(prev => prev.map((p, idx) => idx === currentPlayerIndex ? { ...p, position: 16 } : p));
        alert('Moved to square 16 (Tzedakah) but no money to pay!');
      }
      return;
    }
    // Manna Foods (25)
    if (squareIndex === 25) {
      // If no payer, show modal to pay (first buyer)
      if (mannaPayer === null) {
        setPendingMannaPay(true);
      } else if (currentPlayerIndex === mannaPayer) {
        // Owner landed again, do nothing (no prompt, no payment)
      } else {
        // If payer exists and not the payer, show new MannaFoodsPayModal
        setPendingMannaPay(true);
      }
      setPlayers(prev => prev.map((p, idx) => idx === currentPlayerIndex ? { ...p, position: 25 } : p));
      return;
    }
    // Collect Tzedakah (20)
    if (squareIndex === 20) {
      const collectMoney = tzedakahAmount;
      const collectZchut = zchutFundAmount;
      setTzedakahAmount(0);
      setZchutFundAmount(0);
      setPlayers(prev => prev.map((p, idx) => idx === currentPlayerIndex ? { ...p, money: (p.money || 0) + collectMoney, zchutPoints: (p.zchutPoints || 0) + collectZchut, position: 20 } : p));
      alert(`Collected the Tzedakah fund! $${collectMoney} and ${collectZchut} zchut have been added to your account.`);
      return;
    }
    // Yoseph Pit (21)
    if (squareIndex === 21) {
      setPendingSellBrother(true);
      setSellBrotherPlayerIndex(currentPlayerIndex);
      setPlayers(prev => prev.map((p, idx) => idx === currentPlayerIndex ? { ...p, position: 21 } : p));
      alert("How could you sell your brother for 20 shekeles? Roll the dice. You will pay 50 times the roll in both money and zchut to the Tzedakah fund for atonement.");
      return;
    }
    // Yeshiva (17, 31)
    if (squareIndex === 17 || squareIndex === 31) {
      setYeshivaState(prev => ({ ...prev, [currentPlayerIndex]: { count: 1, active: true } }));
      setYeshivaModalData({ count: 1, rewardMoney: 200, rewardZchut: 400 });
      setShowYeshivaModal(true);
      setPlayers(prev => prev.map((p, idx) => idx === currentPlayerIndex ? { ...p, position: squareIndex } : p));
      return;
    }
    // Exile (10)
    if (squareIndex === 10) {
      setPlayers(prev => prev.map((p, idx) => idx === currentPlayerIndex ? { ...p, position: 30, missTurn: true } : p));
      alert('Exiled! Go back to Egypt and miss a turn.');
      return;
    }
  };
    // --- Special event for square 15 ---
    const [pendingHamanReward, setPendingHamanReward] = useState(false);
    const [hamanPlayerIndex, setHamanPlayerIndex] = useState(null);
  const [players, setPlayers] = useState([]);
  const [newPlayerName, setNewPlayerName] = useState("");
  const [newPlayerColor, setNewPlayerColor] = useState("");
  const [gameStarted, setGameStarted] = useState(false);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  // --- Multiplayer state ---
  const [multiplayer, setMultiplayer] = useState({ enabled: false, gameId: null, playerName: null });
  // Expose currentPlayerIndex for modals
  useEffect(() => {
    window.currentPlayerIndex = currentPlayerIndex;
  }, [currentPlayerIndex]);

  // --- Multiplayer Firestore real-time sync (players list now inside gameState) ---
  // (Handled by main gameState sync below)

  // --- Multiplayer Firestore real-time sync (main game state) ---
  useEffect(() => {
    if (!multiplayer.enabled || !multiplayer.gameId) return;
    let unsub = null;
    import('firebase/firestore').then(({ onSnapshot, doc, updateDoc }) => {
      const gameRef = doc(db, "games", multiplayer.gameId);
      unsub = onSnapshot(gameRef, (snap) => {
        const data = snap.data();
        if (data && data.gameState) {
          setPlayers((prev) => {
            const prevStr = JSON.stringify((prev || []).map(p => ({ name: p.name, position: p.position, money: p.money, zchutPoints: p.zchutPoints, missTurn: p.missTurn, color: p.color })));
            const newStr = JSON.stringify((data.gameState.players || []).map(p => ({ name: p.name, position: p.position, money: p.money, zchutPoints: p.zchutPoints, missTurn: p.missTurn, color: p.color })));
            const playersArr = (data.gameState.players || []).map((p, i) => ({ ...p, index: i }));
            if (prevStr !== newStr) {
              return playersArr;
            }
            return prev;
          });
          // --- Sync boardEvents from Firestore ---
          if (data.gameState.boardEvents) {
            setBoardEvents(data.gameState.boardEvents);
          }
          setCurrentPlayerIndex((prev) => {
            if (typeof data.gameState.currentPlayerIndex === 'number' && prev !== data.gameState.currentPlayerIndex) {
              return data.gameState.currentPlayerIndex;
            }
            return prev;
          });
          // --- Sync Manna Foods state from Firestore ---
          if ('mannaPayer' in data.gameState) setMannaPayer(data.gameState.mannaPayer);
          if ('mannaAmount' in data.gameState) setMannaAmount(data.gameState.mannaAmount);
        }
      });
    });
    return () => { if (unsub) unsub(); };
  }, [multiplayer.enabled, multiplayer.gameId]);

  // --- Push local game state to Firestore when changed (multiplayer only) ---
  useEffect(() => {
    if (!multiplayer.enabled || !multiplayer.gameId) return;
    // Only push if players array is not empty
    if (!players || players.length === 0) return;
    import('firebase/firestore').then(({ doc, updateDoc }) => {
      const gameRef = doc(db, "games", multiplayer.gameId);
      updateDoc(gameRef, {
        gameState: {
          players: players.map(p => ({
            name: p.name,
            position: typeof p.position === 'number' ? p.position : 0,
            money: typeof p.money === 'number' ? p.money : 2000,
            zchutPoints: typeof p.zchutPoints === 'number' ? p.zchutPoints : 1000,
            missTurn: !!p.missTurn,
            color: p.color || null
          })),
          currentPlayerIndex: typeof currentPlayerIndex === 'number' ? currentPlayerIndex : 0,
          boardEvents: boardEvents,
          mannaPayer: mannaPayer,
          mannaAmount: mannaAmount
        }
      });
    });
  }, [players, currentPlayerIndex, multiplayer.enabled, multiplayer.gameId]);
  const [qaMode, setQaMode] = useState(false);
  const [currentCard, setCurrentCard] = useState(null);
  const [boardWidth, setBoardWidth] = useState(Math.min(window.innerWidth * 0.95, referenceSize));
  const [boardPositions, setBoardPositions] = useState(defaultBoardPositions);
  const [diceRolls, setDiceRolls] = useState([]);
  const [showPanel, setShowPanel] = useState(null);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [showRulesMenu, setShowRulesMenu] = useState(false);
  const [boardRotationDeg, setBoardRotationDeg] = useState(0);
  // Rescue modal state
  const [showRescueModal, setShowRescueModal] = useState(false);
  const [rescueInfo, setRescueInfo] = useState({ player: null, rent: 0 });
  // Manna Foods modal state
  const [showMannaModal, setShowMannaModal] = useState(false);
  // Manna Foods state
  const [mannaPayer, setMannaPayer] = useState(null);
  const [mannaAmount, setMannaAmount] = useState(0);
  // Mazal card modal state
    const [showMazalModal, setShowMazalModal] = useState(false);
    const [mazalCardIndex, setMazalCardIndex] = useState(0);

    // --- Multiplayer Mazal Card Sync ---
    // Listen for mazalCardIndex/showMazalModal changes in Firestore
    useEffect(() => {
      if (!multiplayer.enabled || !multiplayer.gameId) return;
      let unsub = null;
      import('firebase/firestore').then(({ onSnapshot, doc }) => {
        const gameRef = doc(db, "games", multiplayer.gameId);
        unsub = onSnapshot(gameRef, (snap) => {
          const data = snap.data();
          if (data && data.gameState) {
            if (typeof data.gameState.mazalCardIndex === 'number') {
              setMazalCardIndex(data.gameState.mazalCardIndex);
            }
            if (typeof data.gameState.showMazalModal === 'boolean') {
              setShowMazalModal(data.gameState.showMazalModal);
            }
          }
        });
      });
      return () => { if (unsub) unsub(); };
    }, [multiplayer.enabled, multiplayer.gameId]);
  // Har HaBayit card modal state
  const [showHarHaBayitModal, setShowHarHaBayitModal] = useState(false);
  const [harHaBayitCardIndex, setHarHaBayitCardIndex] = useState(0);

  // --- Multiplayer Har HaBayit Card Sync ---
  useEffect(() => {
    if (!multiplayer.enabled || !multiplayer.gameId) return;
    let unsub = null;
    import('firebase/firestore').then(({ onSnapshot, doc }) => {
      const gameRef = doc(db, "games", multiplayer.gameId);
      unsub = onSnapshot(gameRef, (snap) => {
        const data = snap.data();
        if (data && data.gameState) {
          if (typeof data.gameState.harHaBayitCardIndex === 'number') {
            setHarHaBayitCardIndex(data.gameState.harHaBayitCardIndex);
          }
          if (typeof data.gameState.showHarHaBayitModal === 'boolean') {
            setShowHarHaBayitModal(data.gameState.showHarHaBayitModal);
          }
        }
      });
    });
    return () => { if (unsub) unsub(); };
  }, [multiplayer.enabled, multiplayer.gameId]);
  // Tzadik card modal state
  const [showTzadikModal, setShowTzadikModal] = useState(false);
  const [tzadikCardIndex, setTzadikCardIndex] = useState(0);

  // --- Multiplayer Tzadik Card Sync ---
  useEffect(() => {
    if (!multiplayer.enabled || !multiplayer.gameId) return;
    let unsub = null;
    import('firebase/firestore').then(({ onSnapshot, doc }) => {
      const gameRef = doc(db, "games", multiplayer.gameId);
      unsub = onSnapshot(gameRef, (snap) => {
        const data = snap.data();
        if (data && data.gameState) {
          if (typeof data.gameState.tzadikCardIndex === 'number') {
            setTzadikCardIndex(data.gameState.tzadikCardIndex);
          }
          if (typeof data.gameState.showTzadikModal === 'boolean') {
            setShowTzadikModal(data.gameState.showTzadikModal);
          }
        }
      });
    });
    return () => { if (unsub) unsub(); };
  }, [multiplayer.enabled, multiplayer.gameId]);
  // Parsha card modal state
  const [showParshaModal, setShowParshaModal] = useState(false);
  const [parshaCardIndex, setParshaCardIndex] = useState(0);

  // --- Multiplayer Parsha Card Sync ---
  useEffect(() => {
    if (!multiplayer.enabled || !multiplayer.gameId) return;
    let unsub = null;
    import('firebase/firestore').then(({ onSnapshot, doc }) => {
      const gameRef = doc(db, "games", multiplayer.gameId);
      unsub = onSnapshot(gameRef, (snap) => {
        const data = snap.data();
        if (data && data.gameState) {
          if (typeof data.gameState.parshaCardIndex === 'number') {
            setParshaCardIndex(data.gameState.parshaCardIndex);
          }
          if (typeof data.gameState.showParshaModal === 'boolean') {
            setShowParshaModal(data.gameState.showParshaModal);
          }
        }
      });
    });
    return () => { if (unsub) unsub(); };
  }, [multiplayer.enabled, multiplayer.gameId]);
  // Tzedakah and Zchut fund state
  const [tzedakahAmount, setTzedakahAmount] = useState(0);
  const [zchutFundAmount, setZchutFundAmount] = useState(0);

  // Expose rescue modal setters for MannaFoodsModal
  useEffect(() => {
    window.setRescueInfo = setRescueInfo;
    window.setShowRescueModal = setShowRescueModal;
  }, []);

  // Close Har HaBayit modal when player changes
  useEffect(() => {
    setShowHarHaBayitModal(false);
  }, [currentPlayerIndex]);

  const availableColors = ["black", "purple", "blue", "brown", "orange", "red", "green"];
  const maxPlayers = 7;
  const scale = boardWidth / referenceSize;

  useEffect(() => {
    const handleResize = () => setBoardWidth(Math.min(window.innerWidth * 0.95, referenceSize));
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const addPlayer = () => {
    if (!newPlayerName || !newPlayerColor) return;
    if (players.some((p) => p.color === newPlayerColor)) { alert("Color taken!"); return; }
    setPlayers([...players, { name: newPlayerName, color: newPlayerColor, position: 0, zchutPoints: 1000, money: 2000, missTurn: false, index: players.length }]);
    setNewPlayerName("");
    setNewPlayerColor("");
  };

  const startGame = () => {
    if (players.length < 2) { alert("At least 2 players required."); return; }
    setGameStarted(true);
  };

  const updateCurrentPlayer = (updatedPlayer) => {
    const updatedPlayers = [...players];
    updatedPlayers[currentPlayerIndex] = updatedPlayer;
    setPlayers(updatedPlayers);
  };

  const [pendingMannaPay, setPendingMannaPay] = useState(false);
  const movePlayerBy = (steps) => {
    if (steps <= 0 || players.length === 0) return;
    if (multiplayer.enabled) {
      // In multiplayer, update Firestore directly and let onSnapshot update local state
      import('firebase/firestore').then(({ doc, updateDoc }) => {
        const gameRef = doc(db, "games", multiplayer.gameId);
        const updatedPlayers = [...players];
        const boardLen = boardPositions.length;
        let newPosition = (updatedPlayers[currentPlayerIndex].position + steps) % boardLen;
        let passedGo = newPosition < updatedPlayers[currentPlayerIndex].position;
        let newMoney = updatedPlayers[currentPlayerIndex].money + (passedGo ? 200 : 0);
        if (newPosition === 0) newMoney += 200;
        updatedPlayers[currentPlayerIndex] = {
          ...updatedPlayers[currentPlayerIndex],
          position: newPosition,
          money: newMoney
        };
        updateDoc(gameRef, {
          'gameState.players': updatedPlayers.map(p => ({
            name: p.name,
            position: typeof p.position === 'number' ? p.position : 0,
            money: typeof p.money === 'number' ? p.money : 2000,
            zchutPoints: typeof p.zchutPoints === 'number' ? p.zchutPoints : 1000,
            missTurn: !!p.missTurn,
            color: p.color || null
          })),
          'gameState.currentPlayerIndex': currentPlayerIndex
        });
        // --- Trigger CardModal if landed on property ---
        const boardEvents = require('./data/boardEvents').boardEvents;
        const event = boardEvents[newPosition];
        if (event && event.type === "property") {
          setTimeout(() => {
            setQaMode("property");
            setCurrentCard(event.card);
          }, 350); // Delay to allow state sync
        }
        // --- Trigger special square logic automatically ---
        setTimeout(() => handleSpecialSquare(newPosition), 350);
      });
      return;
    }
    // Local (single player) logic remains unchanged
    // --- Example: update player position and trigger special square logic ---
    const updatedPlayers = [...players];
    const boardLen = boardPositions.length;
    let newPosition = (updatedPlayers[currentPlayerIndex].position + steps) % boardLen;
    let passedGo = newPosition < updatedPlayers[currentPlayerIndex].position;
    let newMoney = updatedPlayers[currentPlayerIndex].money + (passedGo ? 200 : 0);
    if (newPosition === 0) newMoney += 200;
    updatedPlayers[currentPlayerIndex] = {
      ...updatedPlayers[currentPlayerIndex],
      position: newPosition,
      money: newMoney
    };
    setPlayers(updatedPlayers);
    // --- Trigger CardModal if landed on property ---
    const event = boardEvents[newPosition];
    if (event && event.type === "property") {
      setTimeout(() => {
        setQaMode("property");
        setCurrentCard(event.card);
      }, 350);
    }
    // --- Trigger special square logic automatically ---
    setTimeout(() => handleSpecialSquare(newPosition), 350);
  };

  // --- Yeshiva Modal State ---
  const [showYeshivaModal, setShowYeshivaModal] = useState(false);
  const [yeshivaModalData, setYeshivaModalData] = useState({ count: 1, rewardMoney: 200, rewardZchut: 400 });

  // --- Yeshiva Modal Handlers ---
  const handleYeshivaStay = () => {
    const count = yeshivaModalData.count;
    const rewardMoney = yeshivaModalData.rewardMoney;
    const rewardZchut = yeshivaModalData.rewardZchut;
    setPlayers(prevPlayers => prevPlayers.map((p, idx) =>
      idx === currentPlayerIndex
        ? { ...p, money: (typeof p.money === 'number' ? p.money : 0) + rewardMoney, zchutPoints: (p.zchutPoints || 0) + rewardZchut }
        : p
    ));
    setYeshivaState(prev => ({ ...prev, [currentPlayerIndex]: { count: count + 1, active: true } }));
    setPlayers(prevPlayers => prevPlayers.map((p, idx) =>
      idx === currentPlayerIndex ? { ...p, missTurn: true } : p
    ));
    setShowYeshivaModal(false);
    setCurrentPlayerIndex(prev => (players.length > 0 ? (prev + 1) % players.length : 0));
  };

  const handleYeshivaLeave = () => {
    const count = yeshivaModalData.count;
    const rewardMoney = yeshivaModalData.rewardMoney;
    const rewardZchut = yeshivaModalData.rewardZchut;
    setPlayers(prevPlayers => prevPlayers.map((p, idx) =>
      idx === currentPlayerIndex
        ? { ...p, money: (typeof p.money === 'number' ? p.money : 0) + rewardMoney, zchutPoints: (p.zchutPoints || 0) + rewardZchut }
        : p
    ));
    setYeshivaState(prev => ({ ...prev, [currentPlayerIndex]: { count: 0, active: false } }));
    setPlayers(prevPlayers => prevPlayers.map((p, idx) =>
      idx === currentPlayerIndex ? { ...p, missTurn: false } : p
    ));
    setShowYeshivaModal(false);
    setCurrentPlayerIndex(prev => (players.length > 0 ? (prev + 1) % players.length : 0));
  };

  const rollDice = (val) => {
    // Jewish Idea Yeshiva event: handle missed turns and prompt
    if (yeshivaState[currentPlayerIndex]?.active) {
      const count = yeshivaState[currentPlayerIndex].count;
      let rewardMoney = 200 * count;
      let rewardZchut = 400 * count;
      setYeshivaModalData({ count, rewardMoney, rewardZchut });
      setShowYeshivaModal(true);
      return;
    }
    // Prevent rolling if player should miss turn
    if (players[currentPlayerIndex]?.missTurn) {
      // Clear missTurn and skip to next player
      const updatedPlayers = [...players];
      updatedPlayers[currentPlayerIndex].missTurn = false;
      setPlayers(updatedPlayers);
      alert(`${players[currentPlayerIndex].name} misses this turn!`);
      setCurrentPlayerIndex(prev => (players.length > 0 ? (prev + 1) % players.length : 0));
      return;
    }
    // Special event: Haman's gallows reward
    if (pendingHamanReward && hamanPlayerIndex === currentPlayerIndex) {
      const reward = val * 400;
      setPlayers(prevPlayers => prevPlayers.map((p, idx) =>
        idx === currentPlayerIndex
          ? { ...p, money: (typeof p.money === 'number' ? p.money : 0) + reward, zchutPoints: (p.zchutPoints || 0) + reward }
          : p
      ));
      alert(`${players[currentPlayerIndex].name} receives $${reward} and ${reward} Zchut!`);
      setPendingHamanReward(false);
      setHamanPlayerIndex(null);
      return;
    }

    // Special event: Sell Brother (square 21)
    if (pendingSellBrother && sellBrotherPlayerIndex === currentPlayerIndex) {
      const penalty = val * 50;
      setPlayers(prevPlayers => prevPlayers.map((p, idx) =>
        idx === currentPlayerIndex
          ? { ...p,
              money: Math.max((typeof p.money === 'number' ? p.money : 0) - penalty, 0),
              zchutPoints: Math.max((p.zchutPoints || 0) - penalty, 0)
            }
          : p
      ));
      setTzedakahAmount(prev => prev + penalty);
      setZchutFundAmount(prev => prev + penalty);
      alert(`${players[currentPlayerIndex].name} pays $${penalty} and ${penalty} Zchut to the Tzedakah fund for atonement.`);
      setPendingSellBrother(false);
      setSellBrotherPlayerIndex(null);
      return;
    }
    setDiceRolls(prev => {
      const newRolls = [...prev, val];
      if (newRolls.length === 2) {
        movePlayerBy(newRolls[0] + newRolls[1]);
        return [];
      }
      return newRolls;
    });
  };

  const endTurn = () => {
    if (multiplayer.enabled) {
      import('firebase/firestore').then(({ doc, updateDoc }) => {
        const gameRef = doc(db, "games", multiplayer.gameId);
        const updatedPlayers = [...players];
        if (updatedPlayers[currentPlayerIndex].missTurn) {
          updatedPlayers[currentPlayerIndex].missTurn = false;
        }
        updateDoc(gameRef, {
          'gameState.players': updatedPlayers.map(p => ({
            name: p.name,
            position: typeof p.position === 'number' ? p.position : 0,
            money: typeof p.money === 'number' ? p.money : 2000,
            zchutPoints: typeof p.zchutPoints === 'number' ? p.zchutPoints : 1000,
            missTurn: !!p.missTurn,
            color: p.color || 'black', // Preserve color, fallback to black if missing
            // Add any other custom fields you want to preserve here
          })),
          'gameState.currentPlayerIndex': (players.length > 0 ? (currentPlayerIndex + 1) % players.length : 0)
        });
      });
      return;
    }
    // Local (single player) logic remains unchanged
    // ...existing code...
  };

  const handleSquareClick = (index) => {
    const event = boardEvents[index];
    if (event?.type === "property") {
      setQaMode("property");
      setCurrentCard(event.card);
    }
  };

  const rulesLauncher = (
    <div style={styles.rulesLauncherWrap}>
      <button
        style={styles.hamburgerButton}
        onClick={() => setShowRulesMenu((prev) => !prev)}
        aria-label="Open menu"
        title="Menu"
      >
        <span style={styles.hamburgerLine}></span>
        <span style={styles.hamburgerLine}></span>
        <span style={styles.hamburgerLine}></span>
      </button>

      {showRulesMenu && (
        <div style={styles.rulesMiniMenu}>
          <button
            style={styles.rulesMenuItem}
            onClick={() => {
              setShowRulesModal(true);
              setShowRulesMenu(false);
            }}
            aria-label="Open Rules"
            title="Rules"
          >
            <svg viewBox="0 0 64 64" width="20" height="20" aria-hidden="true">
              <polygon points="24,6 29,12 32,8 35,12 40,6 40,14 24,14" fill="#e0b74f" stroke="#8b6b2e" strokeWidth="1.5" />
              <rect x="18" y="12" width="28" height="42" rx="3" fill="#fff9e8" stroke="#8b6b2e" strokeWidth="2" />
              <path d="M18 18 C15 20, 15 24, 18 26" fill="none" stroke="#d7b87a" strokeWidth="2" />
              <path d="M46 18 C49 20, 49 24, 46 26" fill="none" stroke="#d7b87a" strokeWidth="2" />
              <rect x="10" y="14" width="6" height="38" rx="3" fill="#c99a4a" stroke="#8b6b2e" strokeWidth="2" />
              <rect x="48" y="14" width="6" height="38" rx="3" fill="#c99a4a" stroke="#8b6b2e" strokeWidth="2" />
              <circle cx="13" cy="13" r="2.8" fill="#c99a4a" stroke="#8b6b2e" strokeWidth="2" />
              <circle cx="13" cy="53" r="2.8" fill="#c99a4a" stroke="#8b6b2e" strokeWidth="2" />
              <circle cx="51" cy="13" r="2.8" fill="#c99a4a" stroke="#8b6b2e" strokeWidth="2" />
              <circle cx="51" cy="53" r="2.8" fill="#c99a4a" stroke="#8b6b2e" strokeWidth="2" />
              <line x1="23" y1="22" x2="41" y2="22" stroke="#8b6b2e" strokeWidth="2" />
              <line x1="23" y1="30" x2="41" y2="30" stroke="#8b6b2e" strokeWidth="2" />
              <line x1="23" y1="38" x2="41" y2="38" stroke="#8b6b2e" strokeWidth="2" />
              <line x1="23" y1="46" x2="36" y2="46" stroke="#8b6b2e" strokeWidth="2" />
            </svg>
            <span style={styles.rulesLabel}>Rules</span>
          </button>
          <button
            style={styles.rulesMenuItem}
            onClick={() => setBoardRotationDeg((prev) => (prev + 90) % 360)}
            aria-label="Rotate Board"
            title="Rotate Board"
          >
            <span style={styles.rotateIcon}>⟳</span>
            <span style={styles.rulesLabel}>Rotate Board</span>
          </button>
        </div>
      )}
    </div>
  );


  // --- Multiplayer Entry UI ---
  if (!multiplayer.enabled) {
    return (
      <>
        {rulesLauncher}
        <MultiplayerEntry
          onJoin={(gameId, playerName) => {
            setMultiplayer({ enabled: true, gameId, playerName });
          }}
        />
        <RulesModal open={showRulesModal} onClose={() => setShowRulesModal(false)} />
      </>
    );
  }

  // In multiplayer mode, always use Firestore-synced players for lobby and start logic
  const lobbyPlayers = multiplayer.enabled ? players : players;
  const canStartGame = lobbyPlayers.length >= 2;

  return (
    <div style={styles.container}>
      {rulesLauncher}
      <h1>TORAHPOLY</h1>
      {/* ...existing code... */}
      <YeshivaModal
        open={showYeshivaModal}
        onClose={() => setShowYeshivaModal(false)}
        count={yeshivaModalData.count}
        rewardMoney={yeshivaModalData.rewardMoney}
        rewardZchut={yeshivaModalData.rewardZchut}
        onStay={handleYeshivaStay}
        onLeave={handleYeshivaLeave}
      />
      {!gameStarted ? (
        <>
          {lobbyPlayers.length < maxPlayers && (
            <div style={styles.inputRow}>
              <input type="text" placeholder="Player Name" value={newPlayerName} onChange={(e) => setNewPlayerName(e.target.value)} style={styles.input} />
              <select
                value={newPlayerColor}
                onChange={async (e) => {
                  const color = e.target.value;
                  setNewPlayerColor(color);
                  // If multiplayer, update color in Firestore for this player only
                  if (multiplayer.enabled && multiplayer.gameId && newPlayerName) {
                    await setPlayerColorInFirestore(multiplayer.gameId, newPlayerName, color);
                  }
                }}
                style={styles.input}
              >
                <option value="">Choose Color</option>
                {availableColors.filter(c => !lobbyPlayers.some(p => p.color && p.color === c)).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <button onClick={addPlayer} style={styles.button}>Add Player</button>
            </div>
          )}
          <h2>Joined Players ({lobbyPlayers.length}/{maxPlayers})</h2>
          <ul>
            {lobbyPlayers.map((p, i) => (
              <li key={i} style={{ color: p.color, fontWeight: i === currentPlayerIndex ? "bold" : "normal" }}>
                {p.name} ({p.color})
              </li>
            ))}
          </ul>
          <button onClick={startGame} style={{ ...styles.button, marginTop: 20 }} disabled={!canStartGame}>Start Game</button>
        </>
      ) : (
        <>
          <div style={{ marginBottom: 20 }}>
            <h2>Players</h2>
            <ul>
              {players.map((p, i) => (
                <li key={i} style={{ color: p.color, fontWeight: i === currentPlayerIndex ? "bold" : "normal" }}>
                  {p.name} - Position: {p.position}, Zchut: {p.zchutPoints}, Money: ${typeof p.money === 'number' ? p.money : (p.money && p.money.money ? p.money.money : 0)} {i === currentPlayerIndex && "(Your Turn)"} {p.missTurn && "(Miss next turn)"}
                  <button onClick={() => setShowPanel(i)} style={{ marginLeft: 10 }}>View Properties</button>
                </li>
              ))}
            </ul>
          </div>

          {/* Game Board */}
          <div style={{ position: "relative", display: "inline-block", marginBottom: 20, transform: `rotate(${boardRotationDeg}deg)`, transformOrigin: "center center", transition: "transform 220ms ease" }}>
            <img src={boardImage} alt="Game Board" style={{ width: boardWidth, maxWidth: "95vw", height: "auto", border: "2px solid #333", borderRadius: 12, display: "block" }} />
            {players.map((player, idx) => {
              const pos = boardPositions[player.position % boardPositions.length];
              const left = Math.round(pos.x * scale - 12);
              const top = Math.round(pos.y * scale - 12);
              return (
                <div key={idx} title={`${player.name}`} style={{ position: "absolute", left, top, width: 24, height: 24, borderRadius: "50%", backgroundColor: player.color, border: idx === currentPlayerIndex ? "3px solid gold" : "1px solid #000", display: "flex", justifyContent: "center", alignItems: "center", fontSize: 12, color: "#fff", cursor: "pointer" }} onClick={() => handleSquareClick(player.position)}>
                  {idx + 1}
                </div>
              );
            })}
            {/* TorahPoly Board Buttons overlay - does not affect any other logic */}
            <TorahPolyBoardButtons
              startQA={async (card) => {
                if (card.name === "Mazal") {
                  if (multiplayer.enabled && multiplayer.gameId) {
                    const nextIndex = (mazalCardIndex + 1) % mazalCards.length;
                    const { doc, updateDoc } = await import('firebase/firestore');
                    const gameRef = doc(db, "games", multiplayer.gameId);
                    await updateDoc(gameRef, {
                      'gameState.mazalCardIndex': nextIndex,
                      'gameState.showMazalModal': true
                    });
                  } else {
                    setMazalCardIndex((prev) => (prev + 1) % mazalCards.length);
                    setShowMazalModal(true);
                  }
                } else if (card.name === "Har HaBayit") {
                  if (multiplayer.enabled && multiplayer.gameId) {
                    const nextIndex = (harHaBayitCardIndex + 1); // Or your own logic
                    const { doc, updateDoc } = await import('firebase/firestore');
                    const gameRef = doc(db, "games", multiplayer.gameId);
                    await updateDoc(gameRef, {
                      'gameState.harHaBayitCardIndex': nextIndex,
                      'gameState.showHarHaBayitModal': true
                    });
                  } else {
                    setHarHaBayitCardIndex((prev) => prev + 1);
                    setShowHarHaBayitModal(true);
                  }
                } else if (card.name === "Tzadik") {
                  if (multiplayer.enabled && multiplayer.gameId) {
                    const nextIndex = (tzadikCardIndex + 1); // Or your own logic
                    const { doc, updateDoc } = await import('firebase/firestore');
                    const gameRef = doc(db, "games", multiplayer.gameId);
                    await updateDoc(gameRef, {
                      'gameState.tzadikCardIndex': nextIndex,
                      'gameState.showTzadikModal': true
                    });
                  } else {
                    setTzadikCardIndex((prev) => prev + 1);
                    setShowTzadikModal(true);
                  }
                } else if (card.name && card.name.startsWith("Parsha")) {
                  if (multiplayer.enabled && multiplayer.gameId) {
                    const nextIndex = (parshaCardIndex + 1); // You may want to use your parsha card logic
                    const { doc, updateDoc } = await import('firebase/firestore');
                    const gameRef = doc(db, "games", multiplayer.gameId);
                    await updateDoc(gameRef, {
                      'gameState.parshaCardIndex': nextIndex,
                      'gameState.showParshaModal': true
                    });
                  } else {
                    setParshaCardIndex((prev) => prev + 1); // Or your own logic
                    setShowParshaModal(true);
                  }
                } else {
                  alert(card.name + " card clicked!");
                }
              }}
              onShuffleParsha={async () => {
                if (multiplayer.enabled && multiplayer.gameId) {
                  const nextIndex = (parshaCardIndex + 1); // Or your shuffle logic
                  const { doc, updateDoc } = await import('firebase/firestore');
                  const gameRef = doc(db, "games", multiplayer.gameId);
                  await updateDoc(gameRef, {
                    'gameState.parshaCardIndex': nextIndex,
                    'gameState.showParshaModal': true
                  });
                } else {
                  setParshaCardIndex((prev) => prev + 1);
                  setShowParshaModal(true);
                }
              }}
              onReturnParsha={async () => {
                if (multiplayer.enabled && multiplayer.gameId) {
                  const nextIndex = (parshaCardIndex + 1); // Or your return logic
                  const { doc, updateDoc } = await import('firebase/firestore');
                  const gameRef = doc(db, "games", multiplayer.gameId);
                  await updateDoc(gameRef, {
                    'gameState.parshaCardIndex': nextIndex,
                    'gameState.showParshaModal': true
                  });
                } else {
                  setParshaCardIndex((prev) => prev + 1);
                  setShowParshaModal(true);
                }
              }}
              tzedakahAmount={tzedakahAmount}
              zchutFundAmount={zchutFundAmount}
            />
                      {/* Parsha Card Modal */}
                      <ParshaCardModal
                        open={showParshaModal}
                        onClose={async () => {
                          setShowParshaModal(false);
                          if (multiplayer.enabled && multiplayer.gameId) {
                            const { doc, updateDoc } = await import('firebase/firestore');
                            const gameRef = doc(db, "games", multiplayer.gameId);
                            await updateDoc(gameRef, { 'gameState.showParshaModal': false });
                          }
                        }}
                        currentPlayer={players[currentPlayerIndex]}
                        setPlayers={setPlayers}
                        cardIndex={parshaCardIndex}
                        setCardIndex={setParshaCardIndex}
                      />
                {/* Tzadik Card Modal */}
                <TzadikCardModal
                  open={showTzadikModal}
                  onClose={async () => {
                    setShowTzadikModal(false);
                    if (multiplayer.enabled && multiplayer.gameId) {
                      const { doc, updateDoc } = await import('firebase/firestore');
                      const gameRef = doc(db, "games", multiplayer.gameId);
                      await updateDoc(gameRef, { 'gameState.showTzadikModal': false });
                    }
                  }}
                  currentPlayer={players[currentPlayerIndex]}
                  setPlayers={setPlayers}
                  cardIndex={tzadikCardIndex}
                  setCardIndex={setTzadikCardIndex}
                />
          </div>

          {/* Dice and Turn */}
          <div style={{ marginTop: 20 }}>
            {/* Show whose turn it is */}
            <div style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 8 }}>
              {players && players.length > 0 && typeof currentPlayerIndex === 'number' && players[currentPlayerIndex] ? (
                <>It's <span style={{ color: players[currentPlayerIndex].color || 'black' }}>{players[currentPlayerIndex].name}</span>'s turn</>
              ) : (
                'Waiting for players...'
              )}
            </div>
            <h2>Roll Dice</h2>
            <div style={{ display: "flex", justifyContent: "center", gap: 20 }}>
              <Dice sides={6} onRoll={rollDice} rollTime={1} />
              <Dice sides={6} onRoll={rollDice} rollTime={1} />
            </div>
            <button onClick={endTurn} style={{ ...styles.button, marginTop: 15 }}>End Turn</button>
          </div>
        </>
      )}

      {/* Property Modal */}
      {qaMode && currentCard && (
        <CardModal
          card={currentCard}
          mode={qaMode}
          currentPlayer={players[currentPlayerIndex]}
          updatePlayer={updateCurrentPlayer}
          players={players}
          updatePlayers={setPlayers}
          boardEvents={boardEvents}
          setBoardEvents={setBoardEvents}
          onClose={() => setQaMode(false)}
          onRescue={(player, rent) => {
            setRescueInfo({ player, rent });
            setShowRescueModal(true);
          }}
        />
      )}

      {/* Rescue Modal */}
      <RescueModal
        open={showRescueModal}
        onClose={() => setShowRescueModal(false)}
        currentPlayer={rescueInfo.player || { name: "", zchutPoints: 0, money: 0, index: -1 }}
        rentAmount={rescueInfo.rent}
        players={players}
        setPlayers={setPlayers}
      />

      {/* Manna Foods Modal logic */}
      {/* Show 'set your price' modal if unowned, else show MannaFoodsPayModal */}
      {pendingMannaPay && (mannaPayer == null) && (
        <MannaFoodsModal
          open={pendingMannaPay}
          onClose={() => setPendingMannaPay(false)}
          currentPlayer={players[currentPlayerIndex]}
          onPay={(amount) => {
            if (players[currentPlayerIndex].money < amount) {
              alert("You don't have enough money! Triggering Rescue...");
              setRescueInfo({ player: players[currentPlayerIndex], rent: amount });
              setShowRescueModal(true);
              return;
            }
            const updatedPlayers = players.map(p =>
              p.index === players[currentPlayerIndex].index
                ? { ...p, money: p.money - amount }
                : p
            );
            setPlayers(updatedPlayers);
            setMannaPayer(currentPlayerIndex);
            setMannaAmount(amount);
            // Set Manna Foods property owner and price
            setBoardEvents(prev => {
              const updated = { ...prev };
              if (updated[25] && updated[25].card) {
                updated[25] = {
                  ...updated[25],
                  card: {
                    ...updated[25].card,
                    ownerIndex: currentPlayerIndex,
                    price: amount
                  }
                };
              }
              return { ...updated }; // ensure new object reference
            });
            alert(`You paid $${amount} for the Manna Foods Banquet!\nThe next player that lands here will return your expense.`);
            setPendingMannaPay(false);
            // Force PlayerPanelModal to refresh if open
            setTimeout(() => {
              setShowPanel(null);
              setTimeout(() => setShowPanel(currentPlayerIndex), 0);
            }, 0);
          }}
        />
      )}
      {pendingMannaPay && (mannaPayer != null) && (
        <MannaFoodsPayModal
          open={pendingMannaPay}
          amount={mannaAmount || 0}
          ownerName={players[mannaPayer]?.name || ""}
          playerName={players[currentPlayerIndex]?.name || ""}
          canAfford={players[currentPlayerIndex]?.money >= (mannaAmount || 0)}
          onPay={() => {
            // Deduct money, pay owner, pay tzedakah, give zchut, etc.
            if (players[currentPlayerIndex].money < (mannaAmount || 0)) {
              alert("You don't have enough money! Triggering Rescue...");
              setRescueInfo({ player: players[currentPlayerIndex], rent: mannaAmount });
              setShowRescueModal(true);
              return;
            }
            // Pay owner and tzedakah, give zchut
            let updatedPlayers = players.map((p, idx) => {
              if (idx === currentPlayerIndex) {
                return { ...p, money: p.money - (mannaAmount || 0), zchutPoints: (p.zchutPoints || 0) + 200 };
              } else if (idx === mannaPayer && mannaPayer !== currentPlayerIndex) {
                return { ...p, money: p.money + (mannaAmount || 0) };
              }
              return p;
            });
            setPlayers(updatedPlayers);
            setTzedakahAmount(prev => prev + (mannaAmount || 0));
            // Do NOT change ownership unless trade button is used
            // setMannaPayer(currentPlayerIndex); <-- REMOVE this line
            setMannaAmount(mannaAmount);
            alert(`You paid $${mannaAmount} for the Manna Foods Banquet!\nYou also received 200 zchut points!`);
            setPendingMannaPay(false);
          }}
          onTrade={() => {
            const owner = players[mannaPayer];
            const buyer = players[currentPlayerIndex];
            if (!owner || !buyer) {
              alert("Invalid players for trade.");
              return;
            }
            const minOffer = Math.max(1, Math.floor(mannaAmount * 0.5));
            const offerStr = prompt(`How much do you want to offer to buy the mitzvah from ${owner.name}? (Minimum $${minOffer})`);
            const offer = parseInt(offerStr);
            if (isNaN(offer) || offer < minOffer) {
              alert(`Offer must be at least $${minOffer} and a valid number.`);
              return;
            }
            if (buyer.money < offer) {
              alert(`${buyer.name} does not have enough money for this offer.`);
              return;
            }
            if (!window.confirm(`${owner.name}, do you accept this offer of $${offer} from ${buyer.name}?`)) {
              alert("Offer not accepted.");
              return;
            }
            // Transfer money and ownership
            let updatedPlayers = players.map((p, idx) => {
              if (idx === currentPlayerIndex) {
                return { ...p, money: p.money - offer };
              } else if (idx === mannaPayer) {
                return { ...p, money: p.money + offer };
              }
              return p;
            });
            setPlayers(updatedPlayers);
            setMannaPayer(currentPlayerIndex);
            alert(`${buyer.name} bought the mitzvah from ${owner.name} for $${offer}!`);
            setPendingMannaPay(false);
          }}
          onClose={() => setPendingMannaPay(false)}
        />
      )}

      {/* Mazal Card Modal */}
      <MazalCardModal
        open={showMazalModal}
        onClose={async () => {
          setShowMazalModal(false);
          if (multiplayer.enabled && multiplayer.gameId) {
            const { doc, updateDoc } = await import('firebase/firestore');
            const gameRef = doc(db, "games", multiplayer.gameId);
            await updateDoc(gameRef, { 'gameState.showMazalModal': false });
          }
        }}
        currentPlayer={players[currentPlayerIndex]}
        setPlayers={setPlayers}
        mazalCard={mazalCards[mazalCardIndex]}
        onAccept={async () => {
          const card = mazalCards[mazalCardIndex];
          if (card.reward) {
            if (card.rewardType === "moneyAndZchut") {
              const rewardedPlayers = players.map((p, idx) => {
                if (idx === currentPlayerIndex) {
                  const addMoney = typeof card.reward.money === 'number' ? card.reward.money : 0;
                  const addZchut = typeof card.reward.zchut === 'number' ? card.reward.zchut : 0;
                  const currentMoney = typeof p.money === 'number'
                    ? p.money
                    : (p.money && typeof p.money.money === 'number' ? p.money.money : 0);
                  if (card.text && card.text.includes('Return to rebuild Gush Katif')) {
                    return {
                      ...p,
                      money: currentMoney + addMoney,
                      zchutPoints: (p.zchutPoints || 0) + addZchut,
                      position: 11,
                    };
                  }
                  return {
                    ...p,
                    money: currentMoney + addMoney,
                    zchutPoints: (p.zchutPoints || 0) + addZchut,
                  };
                }
                return p;
              });
              setPlayers(rewardedPlayers);

              if (multiplayer.enabled && multiplayer.gameId) {
                const { doc, updateDoc } = await import('firebase/firestore');
                const gameRef = doc(db, "games", multiplayer.gameId);
                await updateDoc(gameRef, {
                  'gameState.players': rewardedPlayers.map(p => ({
                    name: p.name,
                    position: typeof p.position === 'number' ? p.position : 0,
                    money: typeof p.money === 'number' ? p.money : (p.money && typeof p.money.money === 'number' ? p.money.money : 0),
                    zchutPoints: typeof p.zchutPoints === 'number' ? p.zchutPoints : 0,
                    missTurn: !!p.missTurn,
                    color: p.color || null
                  }))
                });
              }
              alert(`${players[currentPlayerIndex].name} received $${card.reward.money} and ${card.reward.zchut} Zchut Mazal reward!`);
            } else {
              const rewardedPlayers = players.map((p, idx) => {
                if (idx !== currentPlayerIndex) return p;
                if (card.rewardType === "zchut") {
                  return { ...p, zchutPoints: (p.zchutPoints || 0) + card.reward };
                }
                const currentMoney = typeof p.money === 'number'
                  ? p.money
                  : (p.money && typeof p.money.money === 'number' ? p.money.money : 0);
                return { ...p, money: currentMoney + card.reward };
              });
              setPlayers(rewardedPlayers);

              if (multiplayer.enabled && multiplayer.gameId) {
                const { doc, updateDoc } = await import('firebase/firestore');
                const gameRef = doc(db, "games", multiplayer.gameId);
                await updateDoc(gameRef, {
                  'gameState.players': rewardedPlayers.map(p => ({
                    name: p.name,
                    position: typeof p.position === 'number' ? p.position : 0,
                    money: typeof p.money === 'number' ? p.money : (p.money && typeof p.money.money === 'number' ? p.money.money : 0),
                    zchutPoints: typeof p.zchutPoints === 'number' ? p.zchutPoints : 0,
                    missTurn: !!p.missTurn,
                    color: p.color || null
                  }))
                });
              }
              alert(`${players[currentPlayerIndex].name} received ${card.rewardType === "zchut" ? card.reward + ' Zchut' : '$' + card.reward} Mazal reward!`);
            }
          } else if (card.penalty) {
            const penalizedPlayers = players.map((p, idx) => {
              if (idx === currentPlayerIndex) {
                if (card.penaltyType === "zchut") {
                  return { ...p, zchutPoints: Math.max(0, (p.zchutPoints || 0) - card.penalty) };
                }
                const currentMoney = typeof p.money === 'number'
                  ? p.money
                  : (p.money && typeof p.money.money === 'number' ? p.money.money : 0);
                return { ...p, money: Math.max(0, currentMoney - card.penalty) };
              }
              return p;
            });
            setPlayers(penalizedPlayers);

            if (multiplayer.enabled && multiplayer.gameId) {
              const { doc, updateDoc } = await import('firebase/firestore');
              const gameRef = doc(db, "games", multiplayer.gameId);
              await updateDoc(gameRef, {
                'gameState.players': penalizedPlayers.map(p => ({
                  name: p.name,
                  position: typeof p.position === 'number' ? p.position : 0,
                  money: typeof p.money === 'number' ? p.money : (p.money && typeof p.money.money === 'number' ? p.money.money : 0),
                  zchutPoints: typeof p.zchutPoints === 'number' ? p.zchutPoints : 0,
                  missTurn: !!p.missTurn,
                  color: p.color || null
                }))
              });
            }
            if (
              card.target === "tzedakah" ||
              card.buttonText === "Give the bank $1000" ||
              card.buttonText === "Pay 2000 Zchut (Olam Haba Fund)"
            ) {
              if (card.penaltyType === "zchut") {
                setZchutFundAmount((prev) => prev + card.penalty);
              } else {
                setTzedakahAmount((prev) => prev + card.penalty);
              }
            }
            alert(`${players[currentPlayerIndex].name} paid ${card.penaltyType === "zchut" ? card.penalty + ' Zchut' : '$' + card.penalty} as Mazal penalty!`);
          }
          setShowMazalModal(false);
          if (multiplayer.enabled && multiplayer.gameId) {
            const { doc, updateDoc } = await import('firebase/firestore');
            const gameRef = doc(db, "games", multiplayer.gameId);
            await updateDoc(gameRef, { 'gameState.showMazalModal': false });
          }
        }}
      />

      {/* Har HaBayit Card Modal */}
      <HarHaBayitCardModal
        open={showHarHaBayitModal}
        onClose={async () => {
          setShowHarHaBayitModal(false);
          if (multiplayer.enabled && multiplayer.gameId) {
            const { doc, updateDoc } = await import('firebase/firestore');
            const gameRef = doc(db, "games", multiplayer.gameId);
            await updateDoc(gameRef, { 'gameState.showHarHaBayitModal': false });
          }
        }}
        currentPlayer={players[currentPlayerIndex]}
        setPlayers={setPlayers}
        cardIndex={harHaBayitCardIndex}
        setCardIndex={setHarHaBayitCardIndex}
      />

      {/* Player Panel Modal */}
      {showPanel !== null && (
        <PlayerPanelModal player={players[showPanel]} onClose={() => setShowPanel(null)} boardEvents={boardEvents} />
      )}

      <RulesModal open={showRulesModal} onClose={() => setShowRulesModal(false)} />
    </div>
  );
}

// --- Styles ---
const styles = { 
  container: { fontFamily: "Arial, sans-serif", padding: 20, backgroundColor: "#f0f2f5", minHeight: "100vh", textAlign: "center" },
  button: { backgroundColor: "#007bff", color: "white", border: "none", borderRadius: 8, padding: "10px 20px", fontSize: 16, cursor: "pointer", margin: "5px" },
  rulesLauncherWrap: { position: "fixed", top: 12, right: 12, zIndex: 1500, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 },
  hamburgerButton: { width: 42, height: 34, backgroundColor: "#5f6773", border: "2px solid #d4d7dd", borderRadius: 8, cursor: "pointer", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 4, boxShadow: "0 3px 10px rgba(0,0,0,0.28)" },
  hamburgerLine: { width: 18, height: 2, backgroundColor: "#f4f4f4", borderRadius: 2, display: "block" },
  rulesMiniMenu: { backgroundColor: "#ffffff", border: "1px solid #d9d9d9", borderRadius: 10, padding: 6, boxShadow: "0 4px 12px rgba(0,0,0,0.18)" },
  rulesMenuItem: { backgroundColor: "#6b7280", color: "#fff", border: "1px solid #d4d7dd", borderRadius: 8, padding: "6px 8px", display: "flex", alignItems: "center", gap: 6, cursor: "pointer", width: "100%", marginTop: 6 },
  rotateIcon: { fontSize: 14, fontWeight: 700, lineHeight: 1 },
  rulesLabel: { fontSize: 13, fontWeight: 700, lineHeight: 1 },
  input: { fontSize: 16, padding: "5px 10px", borderRadius: 4, border: "1px solid #ccc" },
  inputRow: { display: "flex", justifyContent: "center", gap: 10, marginBottom: 20 }
};

// --- Modal styles ---
const modalStyles = { 
  overlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 },
  modal: { backgroundColor: "#fff", padding: 30, borderRadius: 12, minWidth: 300, maxWidth: "90%", textAlign: "center", boxShadow: "0 5px 15px rgba(0,0,0,0.3)" },
  button: { margin: "8px 5px", padding: "8px 15px", borderRadius: 6, border: "none", backgroundColor: "#007bff", color: "#fff", fontSize: 14, cursor: "pointer" }
};

export default App;

