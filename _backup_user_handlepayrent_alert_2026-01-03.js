// Step 3: Replace the old alert in handlePayRent
// Find and replace this part in your CardModal:
if (currentPlayer.money < rentAmount) {
  alert(
    `${currentPlayer.name}, you cannot pay $${rentAmount} rent!\n\n` +
    `Options:\n` +
    `- Trade properties with other players to raise money\n` +
    `- Call the game and tally money + Zchut points\n` +
    `- Give Money → Earn Zchut. A player with more money may pay you for Zchut.\n` +
    `  Zchut is automatically calculated as: Zchut = Money x 2 (so $500 → 1000 Zchut, $1000 → 2000 Zchut, etc.)`
  );
  onClose();
}
