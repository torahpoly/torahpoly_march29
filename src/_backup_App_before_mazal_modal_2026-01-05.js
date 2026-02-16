// Backup of App.js before Mazal card modal integration
// Created on 2026-01-05

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

