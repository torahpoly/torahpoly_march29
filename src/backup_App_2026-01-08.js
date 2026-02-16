// Backup of App.js created on 2026-01-08
// If you need to restore, copy this file over App.js

/*
================== BACKUP OF APP.JS ==================
*/
// --- Manna Foods Modal ---
function MannaFoodsModal({ open, onClose, currentPlayer, players, setPlayers }) {
	if (!open) return null;

	const handlePay = () => {
		const amountStr = prompt("Enter the amount you want to pay for the Manna Foods Banquet:");
		const amount = parseInt(amountStr);
		if (isNaN(amount) || amount <= 0) {
			alert("Invalid amount.");
			return;
		}
		if (currentPlayer.money < amount) {
			alert("You don't have enough money! Triggering Rescue...");
			if (typeof window.setRescueInfo === 'function' && typeof window.setShowRescueModal === 'function') {
				window.setRescueInfo({ player: currentPlayer, rent: amount });
				window.setShowRescueModal(true);
			}
			onClose();
			return;
		}
		const updatedPlayers = players.map(p => {
			if (p.index === currentPlayer.index) {
				return { ...p, money: p.money - amount };
			}
			return p;
		});
		setPlayers(updatedPlayers);
		alert(`You paid $${amount} for the Manna Foods Banquet!\nThe next player that lands here will return your expense.`);
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
				<button style={modalStyles.button} onClick={handlePay}>Pay</button>
				<button style={modalStyles.button} onClick={onClose}>Cancel</button>
			</div>
		</div>
	);
}

// src/App.js
import React, { useState, useEffect } from "react";
import { TorahPolyBoardButtons } from "./TorahPolyBoardButtons";

// --- Mazal Card Modal ---
import { mazalCard, harHaBayitCard, tzadikCard, parshaCard } from "./TorahPolyBoardButtons";
// --- Parsha Card Modal ---
function ParshaCardModal({ open, onClose, currentPlayer, setPlayers }) {
	const [shownAnswers, setShownAnswers] = useState([]);
	const [claimedQuestions, setClaimedQuestions] = useState([]);
	const [cardIndex, setCardIndex] = useState(0); // 0: Noach, 1: Bereshit, etc.
	if (!open) return null;

	const cards = [
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
			title: 'Lech Lecha (Sefer Bereshit)',
			questions: [
				{
					question: 'What were the Canaanites doing in the Land of Canaan when Avram arrived?',
					answer: 'They were in the process of conquering the Land from the descendants of Shem.',
					zchut: 50,
				},
				{
					question: 'Who accompanied Avraham in the battle against the four kings?',
					answer: '',
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
	];

	const handleShowAnswer = (idx) => {
		setShownAnswers((prev) => [...prev, idx]);
	};

	const handleClaimZchut = (idx) => {
		if (claimedQuestions.includes(idx)) return;
		setClaimedQuestions((prev) => [...prev, idx]);
		const zchut = cards[cardIndex].questions[idx].zchut;
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
		setCardIndex((prev) => Math.min(prev + 1, cards.length - 1));
	};

	const handleBack = () => {
		setShownAnswers([]);
		setClaimedQuestions([]);
		setCardIndex((prev) => Math.max(prev - 1, 0));
	};

	const safeIndex = Math.max(0, Math.min(cardIndex, cards.length - 1));
	const currentCard = cards[safeIndex];

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
					<button style={modalStyles.button} onClick={handleNext} disabled={safeIndex === cards.length - 1}>Next</button>
					<button style={modalStyles.button} onClick={onClose}>Close</button>
				</div>
			</div>
		</div>
	);
}
// --- Tzadik Card Modal ---
function TzadikCardModal({ open, onClose, currentPlayer, setPlayers }) {
	const [shownAnswers, setShownAnswers] = useState([]);
	const [claimedQuestions, setClaimedQuestions] = useState([]);
	if (!open) return null;

	const handleShowAnswer = (idx) => {
		setShownAnswers((prev) => [...prev, idx]);
	};

	const handleClaimZchut = (idx) => {
		if (claimedQuestions.includes(idx)) return;
		setClaimedQuestions((prev) => [...prev, idx]);
		const zchut = tzadikCard.questions[idx].zchut;
		setPlayers((prevPlayers) => {
			return prevPlayers.map((p) =>
				p.index === currentPlayer.index ? { ...p, zchutPoints: (p.zchutPoints || 0) + zchut } : p
			);
		});
		alert(`${currentPlayer.name} received ${zchut} Zchut!`);
	};

	return (
		<div style={modalStyles.overlay}>
			<div style={modalStyles.modal}>
				<h2>{tzadikCard.name} Card</h2>
				{tzadikCard.questions.map((q, idx) => (
					<div key={idx} style={{ marginBottom: 18, textAlign: 'left', borderBottom: '1px solid #eee', paddingBottom: 10 }}>
						<strong>Q{idx + 1}: {q.question}</strong><br />
						<span style={{ color: '#28a745' }}>Zchut:</span> {q.zchut}<br />
						{!shownAnswers.includes(idx) ? (
							<button style={modalStyles.button} onClick={() => handleShowAnswer(idx)}>Show Answer</button>
						) : (
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
				<button style={modalStyles.button} onClick={onClose}>Close</button>
			</div>
		</div>
	);
}
// --- Har HaBayit Card Modal ---
// ...existing code...
function HarHaBayitCardModal({ open, onClose, currentPlayer, setPlayers }) {
	const [shownAnswers, setShownAnswers] = useState([]);
	const [claimedQuestions, setClaimedQuestions] = useState([]);
	if (!open) return null;

	const handleShowAnswer = (idx) => {
		setShownAnswers((prev) => [...prev, idx]);
	};

	const handleClaimZchut = (idx) => {
		if (claimedQuestions.includes(idx)) return;
		setClaimedQuestions((prev) => [...prev, idx]);
		const zchut = harHaBayitCard.questions[idx].points;
		setPlayers((prevPlayers) => {
			return prevPlayers.map((p) =>
				p.index === currentPlayer.index ? { ...p, zchutPoints: (p.zchutPoints || 0) + zchut } : p
			);
		});
		alert(`${currentPlayer.name} received ${zchut} Zchut!`);
	};

	return (
		<div style={modalStyles.overlay}>
			<div style={modalStyles.modal}>
				<h2>{harHaBayitCard.name} Card</h2>
				{harHaBayitCard.questions.map((q, idx) => (
					<div key={idx} style={{ marginBottom: 18, textAlign: 'left', borderBottom: '1px solid #eee', paddingBottom: 10 }}>
						<strong>Q{idx + 1}: {q.question}</strong><br />
						<span style={{ color: '#28a745' }}>Zchut:</span> {q.points}<br />
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
				<button style={modalStyles.button} onClick={onClose}>Close</button>
			</div>
		</div>
	);
}
function MazalCardModal({ open, onClose, currentPlayer, setPlayers }) {
	const [showReward, setShowReward] = useState(false);
	if (!open) return null;

	const handleAcceptReward = () => {
		const reward = mazalCard.reward;
		setPlayers((prevPlayers) => {
			return prevPlayers.map((p) =>
				p.index === currentPlayer.index ? { ...p, money: p.money + reward } : p
			);
		});
		alert(`${currentPlayer.name} received $${reward} Mazal reward!`);
		onClose();
	};

	return (
		<div style={modalStyles.overlay}>
			<div style={modalStyles.modal}>
				<h2>{mazalCard.name} Card</h2>
				<p>{mazalCard.text}</p>
				{!showReward ? (
					<button style={modalStyles.button} onClick={() => setShowReward(true)}>Show Mazal</button>
				) : (
					<>
						<p>Reward: ${mazalCard.reward}</p>
						<button style={modalStyles.button} onClick={handleAcceptReward}>Accept Reward</button>
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
const boardEvents = {
	1: { type: "property", card: schemYosephGardens },
	3: { type: "property", card: schemRoyalEstates },
	4: { type: "property", card: schemDreamResorts },
	7: { type: "property", card: ephraimHilltops },
	11: { type: "property", card: gushKatif },
	12: { type: "property", card: neveDekalim },
	14: { type: "property", card: ganOr },
	28: { type: "property", card: jerusalemHillsOrchard },
	29: { type: "property", card: jerusalemHills },
	35: { type: "property", card: hevronElonMamrei },
	37: { type: "property", card: hevronLuxuryCondos },
	38: { type: "property", card: hevronHiTech },
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

// ...existing code...
export default App;
/*
================ END BACKUP ==========================
*/

