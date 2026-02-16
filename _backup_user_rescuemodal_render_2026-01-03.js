// Step 4: Render the RescueModal in App
// Add this below your other modals:
{/* Rescue Modal */}
{rescueMode && currentCard && (
  <RescueModal
    currentPlayer={players[currentPlayerIndex]}
    players={players}
    updatePlayers={setPlayers}
    card={currentCard}
    onClose={() => setRescueMode(false)}
  />
)}
