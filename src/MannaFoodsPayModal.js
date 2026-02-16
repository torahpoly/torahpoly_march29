import React from "react";

function MannaFoodsPayModal({ open, amount, ownerName, playerName, canAfford, onPay, onTrade, onClose }) {
  if (!open) return null;
  return (
    <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#fff", borderRadius: 12, padding: 32, maxWidth: 420, boxShadow: "0 2px 16px #0003", textAlign: "center" }}>
        <h2>Mazel Tov on your wedding!</h2>
        <p>
          Here is your bill for the banquet. You now owe Manna Foods <b>${amount}</b>.<br/>
          You will also get 200 Zchut.<br/>
          It's a big mitzvah and that money will be considered paid to the Tzedakah fund. Maybe it will come back to you.<br/>
          <br/>
          Did you know that {ownerName} covered the entire banquet cost for a couple that could not afford it? Now for every wedding he gets rewarded from Heaven.<br/>
          I don't know if {ownerName} will accept but you can make an offer to buy the mitzvah.
        </p>
        {canAfford ? (
          <button style={{ margin: 8, padding: "8px 24px", background: "#4caf50", color: "#fff", border: "none", borderRadius: 6, fontWeight: "bold", fontSize: 16, cursor: "pointer" }} onClick={onPay}>Pay Bill</button>
        ) : (
          <button style={{ margin: 8, padding: "8px 24px", background: "#f44336", color: "#fff", border: "none", borderRadius: 6, fontWeight: "bold", fontSize: 16, cursor: "pointer" }} onClick={onTrade}>Rescue</button>
        )}
        <button style={{ margin: 8, padding: "8px 24px", background: "#ff9800", color: "#fff", border: "none", borderRadius: 6, fontWeight: "bold", fontSize: 16, cursor: "pointer" }} onClick={onTrade}>Offer (Buy Mitzvah)</button>
        <button style={{ margin: 8, padding: "8px 24px", background: "#888", color: "#fff", border: "none", borderRadius: 6, fontWeight: "bold", fontSize: 16, cursor: "pointer" }} onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}

export default MannaFoodsPayModal;
