import { useState, useEffect } from "react";
import { Horizon } from "@stellar/stellar-sdk";

const server = new Horizon.Server("https://horizon-testnet.stellar.org");

export default function Balance({ publicKey }) {
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchBalance = async () => {
    if (!publicKey) return;
    setLoading(true);
    setError("");
    try {
      const account = await server.loadAccount(publicKey);
      const xlm = account.balances.find((b) => b.asset_type === "native");
      setBalance(xlm ? parseFloat(xlm.balance).toFixed(4) : "0.0000");
    } catch (err) {
      if (err?.response?.status === 404) {
        setError("Account not found on testnet. Fund it using Friendbot.");
      } else {
        setError("Failed to load balance.");
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    if (publicKey) fetchBalance();
    else { setBalance(null); setError(""); }
  }, [publicKey]);

  if (!publicKey) return (
    <div className="card">
      <div className="card-title">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="12" y1="1" x2="12" y2="23"/>
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
        </svg>
        Balance
      </div>
      <div className="not-connected">Connect wallet to view balance</div>
    </div>
  );

  return (
    <div className="card">
      <div className="card-title">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="12" y1="1" x2="12" y2="23"/>
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
        </svg>
        Balance
      </div>
      {loading ? (
        <div style={{ display:"flex", justifyContent:"center", padding:"20px 0" }}>
          <div className="spinner" style={{ borderTopColor:"#7c3aed", borderColor:"rgba(124,58,237,0.2)", width:28, height:28 }} />
        </div>
      ) : error ? (
        <div className="alert alert-warning">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{flexShrink:0}}>
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <div>
            {error}
            {error.includes("Fund") && (
              <a href={`https://friendbot.stellar.org?addr=${publicKey}`} target="_blank" rel="noreferrer"
                style={{ color:"#0ea5e9", fontSize:12, marginTop:6, display:"inline-block" }}>
                Fund with Friendbot →
              </a>
            )}
          </div>
        </div>
      ) : (
        <div className="balance-display">
          <div className="balance-amount">{balance ?? "—"}</div>
          <div className="balance-currency">XLM · Testnet</div>
        </div>
      )}
      <div className="balance-refresh">
        <button className="btn btn-secondary btn-sm" onClick={fetchBalance} disabled={loading}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="23 4 23 10 17 10"/>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
          </svg>
          Refresh
        </button>
      </div>
    </div>
  );
}
