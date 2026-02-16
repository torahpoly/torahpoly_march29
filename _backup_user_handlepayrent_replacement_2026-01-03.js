// Step 3: Replacement code for handlePayRent in CardModal
if (currentPlayer.money < rentAmount) {
  setRescueMode(true);
  onClose();
  return;
}
