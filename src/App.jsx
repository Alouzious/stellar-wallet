import { useState } from "react";
import WalletConnect from "./components/WalletConnect";
import Balance from "./components/Balance";
import SendPayment from "./components/SendPayment";
import "./index.css";

export default function App() {
  const [publicKey, setPublicKey] = useState(null);
  const [balanceKey, setBalanceKey] = useState(0); // used to force balance refresh

  const handleConnect = (address) => setPublicKey(address);
  const handleDisconnect = () => setPublicKey(null);
  const handleTxSuccess = () => setBalanceKey((k) => k + 1); // refresh balance after send

  return (
    <div className="app">
      {/* Header */}
      <div className="header">
        <div className="header-brand">
          <div className="header-logo">S</div>
          <div>
            <div className="header-title">StellarPay</div>
            <div className="header-subtitle">Testnet Wallet</div>
          </div>
        </div>
        <div className="network-badge">
          <div className="network-dot" />
          Testnet
        </div>
      </div>

      {/* Wallet Connect */}
      <WalletConnect
        publicKey={publicKey}
        onConnect={handleConnect}
        onDisconnect={handleDisconnect}
      />

      {/* Balance */}
      <Balance key={balanceKey} publicKey={publicKey} />

      {/* Send Payment */}
      <SendPayment publicKey={publicKey} onSuccess={handleTxSuccess} />

      {/* Footer */}
      <div className="footer">
        Built on Stellar Testnet · Powered by Freighter
      </div>
    </div>
  );
}