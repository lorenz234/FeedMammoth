import { useState, useEffect } from "react";
import { ethers } from "ethers";
import "./App.css";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "./contract_abi.ts";

const RPC_URL = "https://rpc-mammothon-g2-testnet-4a2w8v0xqy.t.conduit.xyz";
const BLOCK_EXPLORER = "https://explorer-mammothon-g2-testnet-4a2w8v0xqy.t.conduit.xyz";
const FUND_AMOUNT = ethers.parseEther("0.001"); // 0.001 ETH

function App() {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [sessionKey, setSessionKey] = useState<ethers.Wallet | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [bestHash, setBestHash] = useState<string | null>(null);
  const [numCalls, setNumCalls] = useState<number | null>(null);

  useEffect(() => {
    if (!window.ethereum) return;
    setProvider(new ethers.BrowserProvider(window.ethereum));
  }, []);

  useEffect(() => {
    loadSessionKey();
  }, []);

  const loadSessionKey = () => {
    const storedKey = localStorage.getItem("sessionKey");
    if (storedKey) {
      const wallet = new ethers.Wallet(storedKey, new ethers.JsonRpcProvider(RPC_URL));
      setSessionKey(wallet);
      console.log("Loaded session key:", wallet.address);
      fetchUserStats(wallet.address);
    }
  };

  const createSessionKey = async () => {
    if (!signer) return;
    
    // Step 1: Generate new session wallet
    const newSessionWallet = ethers.Wallet.createRandom();
    localStorage.setItem("sessionKey", newSessionWallet.privateKey);
    setSessionKey(newSessionWallet);

    console.log("Created new session key:", newSessionWallet.address);

    // Step 2: Fund session key with 0.001 ETH
    try {
      const tx = await signer.sendTransaction({
        to: newSessionWallet.address,
        value: FUND_AMOUNT,
      });

      console.log("Funding transaction sent:", tx.hash);
    } catch (error) {
      console.error("Failed to fund session key:", error);
    }

    // Fetch stats for the newly created session key
    fetchUserStats(newSessionWallet.address);
  };

  const connectWallet = async () => {
    if (!provider) return;

    try {
      const newSigner = await provider.getSigner();
      const accounts = await provider.send("eth_requestAccounts", []);
      setAccount(accounts[0]);
      setSigner(newSigner);

      const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, newSigner);
      setContract(contractInstance);
    } catch (error) {
      console.error("Wallet connection failed:", error);
    }
  };

  const fetchUserStats = async (userAddress: string) => {
    if (!contract) return;

    try {
      // Step 1: Get user index
      const userIndex = await contract.indexUser(userAddress);
      if (userIndex === 0) {
        console.log("User has not interacted yet.");
        setBestHash(null);
        setNumCalls(null);
        return;
      }

      // Step 2: Fetch user stats using the index
      const userStats = await contract.userStats(userIndex);
      setBestHash(userStats.bestHash !== ethers.ZeroHash ? userStats.bestHash : null);
      setNumCalls(userStats.numCalls);
    } catch (error) {
      console.error("Error fetching user stats:", error);
    }
  };

  const callFeedMammoth = async () => {
    if (!sessionKey || !contract) return;

    try {
      const sessionSigner = sessionKey.connect(new ethers.JsonRpcProvider(RPC_URL));
      const sessionContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, sessionSigner);

      const tx = await sessionContract.feed_mammoth();
      console.log("Transaction sent using session key:", tx.hash);
      setTxHash(tx.hash);

      // Do not await transaction confirmation, just fetch stats again immediately
      fetchUserStats(sessionKey.address);
    } catch (error) {
      console.error("Transaction failed:", error);
    }
  };

  return (
    <div>
      <h1>Feed the Mammoth</h1>
      {account ? (
        <p><strong>Connected:</strong> {account}</p>
      ) : (
        <button onClick={connectWallet}>Connect Wallet</button>
      )}
      <br />
      {sessionKey ? (
        <p><strong>Session Key:</strong> {sessionKey.address}</p>
      ) : (
        <button onClick={createSessionKey}>Create Session Key</button>
      )}
      <br />
      <img
        src="/Manny_full_size.webp"
        alt="Manny"
        className="mammoth-img"
        onClick={callFeedMammoth}
      />
      <p>Tap the image to feed the mammoth!</p>
      {bestHash && <p className="best-hash"><strong>Your Best Hash:</strong> {bestHash}</p>}
      {numCalls !== null && <p><strong>Times Fed:</strong> {numCalls}</p>}
      {txHash && (
        <p className="tx-link">
          <a href={`${BLOCK_EXPLORER}/tx/${txHash}`} target="_blank" rel="noopener noreferrer">
            View Transaction on Explorer
          </a>
        </p>
      )}
    </div>
  );
}

export default App;
