import { useState } from "react";
import {
  isConnected,
  getPublicKey,
  requestAccess,
} from "@stellar/freighter-api";

const shortenAddress = (addr) =>
  addr ? `${addr.slice(0, 6)}...${addr.slice(-6)}` : "";

export default function WalletConnect({ publicKey, onConnect, onDisconnect }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const handleConnect = async () => {
    setLoading(true);
    setError("");
    try {
      const connected = await isConnected();
      if (!connected) {
        setError("Freighter wallet not found. Please install the extension.");
        setLoading(false);
        return;
      }
      // requestAccess triggers the Freighter popup
      const accessObj = await requestAccess();
      // freighter-api v3+ returns an object with address field
      const address =
        typeof accessObj === "string" ? accessObj : accessObj?.address;

      if (!address) {
        setError("Access denied or no account found in Freighter.");
        setLoading(false);
        return;
      }
      onConnect(address);
    } catch (err) {
      setError(err?.message || "Failed to connect wallet.");
    }
    setLoading(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(publicKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="card">
      <div className="card-title">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="7" width="20" height="14" rx="2"/>
          <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
          <line x1="12" y1="12" x2="12" y2="16"/>
          <circle cx="12" cy="12" r="1" fill="currentColor"/>
        </svg>
        Wallet
      </div>

      {!publicKey ? (
        <div className="wallet-disconnected">
          <p>Connect your Freighter wallet to get started on Stellar Testnet.</p>
          <button
            className="btn btn-primary"
            onClick={handleConnect}
            disabled={loading}
          >
            {loading ? (
              <><div className="spinner" /> Connecting...</>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                </svg>
                Connect Freighter
              </>
            )}
          </button>
          {error && (
            <div className="alert alert-warning" style={{ marginTop: 16, textAlign: "left" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{flexShrink:0}}>
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}
        </div>
      ) : (
        <div className="wallet-connected">
          <div className="wallet-address-row">
            <div>
              <div className="wallet-address-label">Connected Address</div>
              <div className="wallet-address">{shortenAddress(publicKey)}</div>
            </div>
            <button className="copy-btn" onClick={handleCopy} title="Copy address">
              {copied ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2"/>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                </svg>
              )}
            </button>
          </div>
          <button
            className="btn btn-danger btn-sm"
            style={{ width: "100%" }}
            onClick={onDisconnect}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
}