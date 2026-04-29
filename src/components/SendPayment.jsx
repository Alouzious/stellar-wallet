import { useState } from "react";
import { Horizon, Networks, TransactionBuilder, Operation, Asset, BASE_FEE } from "@stellar/stellar-sdk";
import { signTransaction } from "@stellar/freighter-api";

const server = new Horizon.Server("https://horizon-testnet.stellar.org");

export default function SendPayment({ publicKey, onSuccess }) {
  const [destination, setDestination] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSend = async (e) => {
    e.preventDefault();
    setResult(null);
    if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      setResult({ type: "error", message: "Enter a valid positive amount." });
      return;
    }
    setLoading(true);
    try {
      const sourceAccount = await server.loadAccount(publicKey);
      const tx = new TransactionBuilder(sourceAccount, {
        fee: BASE_FEE,
        networkPassphrase: Networks.TESTNET,
      })
        .addOperation(Operation.payment({
          destination: destination.trim(),
          asset: Asset.native(),
          amount: parseFloat(amount).toFixed(7),
        }))
        .setTimeout(180)
        .build();

      const signResult = await signTransaction(tx.toXDR(), {
        networkPassphrase: Networks.TESTNET,
      });
      const signedXdr = typeof signResult === "string" ? signResult : signResult?.signedTxXdr;
      if (!signedXdr) throw new Error("Signing was cancelled or failed.");

      const response = await server.submitTransaction(
        TransactionBuilder.fromXDR(signedXdr, Networks.TESTNET)
      );
      setResult({ type: "success", hash: response.hash });
      setDestination("");
      setAmount("");
      if (onSuccess) onSuccess();
    } catch (err) {
      let msg = err?.message || "Transaction failed.";
      const extras = err?.response?.data?.extras;
      if (extras?.result_codes?.operations) msg = `Operation error: ${extras.result_codes.operations.join(", ")}`;
      else if (extras?.result_codes?.transaction) msg = `Transaction error: ${extras.result_codes.transaction}`;
      setResult({ type: "error", message: msg });
    }
    setLoading(false);
  };

  if (!publicKey) return (
    <div className="card">
      <div className="card-title">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="22" y1="2" x2="11" y2="13"/>
          <polygon points="22 2 15 22 11 13 2 9 22 2"/>
        </svg>
        Send XLM
      </div>
      <div className="not-connected">Connect wallet to send XLM</div>
    </div>
  );

  return (
    <div className="card">
      <div className="card-title">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="22" y1="2" x2="11" y2="13"/>
          <polygon points="22 2 15 22 11 13 2 9 22 2"/>
        </svg>
        Send XLM
      </div>
      <form onSubmit={handleSend}>
        <div className="form-group">
          <label className="form-label">Destination Address</label>
          <input className="form-input" type="text" placeholder="G... Stellar public key"
            value={destination} onChange={(e) => setDestination(e.target.value)} disabled={loading} required />
        </div>
        <div className="form-group">
          <label className="form-label">Amount (XLM)</label>
          <input className="form-input" type="number" placeholder="0.00" min="0.0000001" step="any"
            value={amount} onChange={(e) => setAmount(e.target.value)} disabled={loading} required />
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading || !destination || !amount}>
          {loading ? <><div className="spinner" /> Sending...</> : <>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
            Send XLM
          </>}
        </button>
      </form>
      {result && (
        <div className={`tx-result ${result.type}`}>
          {result.type === "success" ? (
            <>
              <div className="tx-result-header">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                Transaction Successful
              </div>
              <div className="tx-hash-label">Transaction Hash</div>
              <div className="tx-hash">{result.hash}</div>
              <a className="tx-hash-link" href={`https://stellar.expert/explorer/testnet/tx/${result.hash}`} target="_blank" rel="noreferrer">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                  <polyline points="15 3 21 3 21 9"/>
                  <line x1="10" y1="14" x2="21" y2="3"/>
                </svg>
                View on Stellar Expert
              </a>
            </>
          ) : (
            <>
              <div className="tx-result-header">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="15" y1="9" x2="9" y2="15"/>
                  <line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
                Transaction Failed
              </div>
              <div className="tx-error-msg">{result.message}</div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
