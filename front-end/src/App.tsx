import { useState, useEffect, useRef } from "react";
import { ethers } from "ethers";
import "./App.css";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "./contract_abi.ts";

const RPC_URL = "https://rpc-mammothon-g2-testnet-4a2w8v0xqy.t.conduit.xyz";
const BLOCK_EXPLORER = "https://explorer-mammothon-g2-testnet-4a2w8v0xqy.t.conduit.xyz";
const FUND_AMOUNT = ethers.parseEther("0.001"); // 0.001 ETH

// Food crumb properties
type Crumb = {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  rotation: number;
  rotationSpeed: number;
  color: string;
};

function App() {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [sessionKey, setSessionKey] = useState<ethers.Wallet | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [bestHash, setBestHash] = useState<string | null>(null);
  const [numCalls, setNumCalls] = useState<number | null>(null);
  
  // Animation states
  const [crumbs, setCrumbs] = useState<Crumb[]>([]);
  const [isEating, setIsEating] = useState(false);
  
  // Leaderboard state
  type UserStats = {
    user: string;
    bestHash: string;
    numCalls: number;
    index: number;
  };
  const [leaderboard, setLeaderboard] = useState<UserStats[]>([]);

  useEffect(() => {
    if (!window.ethereum) return;
    setProvider(new ethers.BrowserProvider(window.ethereum));
  }, []);

  useEffect(() => {
    loadSessionKey();
  }, []);
  
  // Load leaderboard when contract is available
  useEffect(() => {
    if (contract) {
      fetchLeaderboard();
    }
  }, [contract]);

  // Animation frame effect
  useEffect(() => {
    if (crumbs.length === 0) return;
    
    const animationFrame = requestAnimationFrame(() => {
      setCrumbs(prevCrumbs => 
        prevCrumbs
          .map(crumb => ({
            ...crumb,
            y: crumb.y + crumb.speed,
            rotation: crumb.rotation + crumb.rotationSpeed,
          }))
          .filter(crumb => crumb.y < window.innerHeight) // Remove crumbs that fall out of view
      );
    });
    
    return () => cancelAnimationFrame(animationFrame);
  }, [crumbs]);
  
  // Reference to leaderboard section to prevent page jump
  const leaderboardRef = useRef(null);
  
  // Maintain scroll position when leaderboard updates
  useEffect(() => {
    if (leaderboardRef.current) {
      const currentScrollY = window.scrollY;
      // Use setTimeout to allow DOM to update before preserving scroll
      setTimeout(() => {
        window.scrollTo(0, currentScrollY);
      }, 0);
    }
  }, [leaderboard]);

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
      
      // Refresh leaderboard after user interaction
      fetchLeaderboard();
    } catch (error) {
      console.error("Error fetching user stats:", error);
    }
  };
  
  const fetchLeaderboard = async () => {
    if (!contract) return;
    
    try {
      // Create an array to store all found users
      const users: UserStats[] = [];
      
      // Keep reference to current scroll position
      const scrollPosition = window.scrollY;
      
      // Fetch first few users (start from 1 as 0 is not a valid user index)
      for (let i = 1; i <= 20; i++) {
        try {
          const stats = await contract.userStats(i);
          
          // Skip users with zero hash (inactive users)
          if (stats.bestHash === ethers.ZeroHash) continue;
          
          users.push({
            user: stats.user,
            bestHash: stats.bestHash,
            numCalls: Number(stats.numCalls),
            index: i
          });
          
          // Once we have enough users, stop fetching
          if (users.length >= 10) break;
        } catch (error) {
          // If we hit an error (likely end of users), break the loop
          break;
        }
      }
      
      // Sort users by best hash (lowest first)
      const sortedUsers = users.sort((a, b) => {
        // Convert hashes to BigInt for proper comparison
        return (
          BigInt("0x" + a.bestHash.slice(2)) < 
          BigInt("0x" + b.bestHash.slice(2)) ? -1 : 1
        );
      });
      
      // Take top 4 users
      setLeaderboard(sortedUsers.slice(0, 4));
      
      // Restore scroll position after state update
      setTimeout(() => {
        window.scrollTo(0, scrollPosition);
      }, 10);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    }
  };

  const createFoodCrumbs = (x: number, y: number) => {
    const colors = ['#8B4513', '#D2691E', '#CD853F', '#A0522D']; // Brown shades for food
    const newCrumbs: Crumb[] = [];
    
    // Create 20-30 food particles
    const numCrumbs = Math.floor(Math.random() * 11) + 20;
    
    // Ensure we position crumbs relative to document instead of container
    
    for (let i = 0; i < numCrumbs; i++) {
      newCrumbs.push({
        id: Date.now() + i,
        x: x + (Math.random() * 100 - 50), // Spread around click position
        y: y,
        size: Math.random() * 6 + 3, // Random size between 3-9px
        speed: Math.random() * 3 + 1, // Random falling speed
        rotation: Math.random() * 360, // Random initial rotation
        rotationSpeed: (Math.random() - 0.5) * 10, // Random rotation speed and direction
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }
    
    setCrumbs(prev => [...prev, ...newCrumbs]);
  };

  const callFeedMammoth = async (event: React.MouseEvent<HTMLImageElement>) => {
    if (!sessionKey || !contract) return;

    // Get exact mouse cursor position
    const x = event.clientX;
    const y = event.clientY;
    
    // Play eating sound
    const eatSound = new Audio('/eat.mp3');
    eatSound.volume = 0.6; // Adjust volume to 60%
    eatSound.play().catch(err => console.error("Error playing sound:", err));
    
    // Start eating animation
    setIsEating(true);
    createFoodCrumbs(x, y);
    
    // Reset eating animation after 500ms
    setTimeout(() => setIsEating(false), 500);

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
    <div className="app-container">
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
      <div className="mammoth-container">
        <img
          src="/viet-mammoth.jpg"
          alt="Mammoth"
          className={`mammoth-img ${isEating ? 'eating' : ''}`}
          onClick={callFeedMammoth}
        />
      </div>
      
      {/* Render food crumbs in a fixed position portal so they appear at exact cursor position */}
      <div className="food-crumbs-container">
        {crumbs.map(crumb => (
          <div
            key={crumb.id}
            className="food-crumb"
            style={{
              left: `${crumb.x}px`,
              top: `${crumb.y}px`,
              width: `${crumb.size}px`,
              height: `${crumb.size}px`,
              backgroundColor: crumb.color,
              transform: `rotate(${crumb.rotation}deg)`
            }}
          />
        ))}
      </div>
      <p>Tap the image to feed Viets mammoth!</p>
      {bestHash && <p className="best-hash"><strong>Your Best Hash:</strong> {bestHash}</p>}
      {numCalls !== null && <p><strong>Times Fed:</strong> {numCalls}</p>}
      {txHash && (
        <p className="tx-link">
          <a href={`${BLOCK_EXPLORER}/tx/${txHash}`} target="_blank" rel="noopener noreferrer">
            View Transaction on Explorer
          </a>
        </p>
      )}
      
      {/* Leaderboard */}
      <div className="leaderboard-card" ref={leaderboardRef}>
        <h2>Mammoth Feeding Leaderboard</h2>
        <p className="leaderboard-subtitle">Top 4 Players by Best Hash</p>
        
        <div className="leaderboard-list">
          {leaderboard.length === 0 ? (
            <div className="loading-container">
              <p className="loading-text">Loading leaderboard data...</p>
            </div>
          ) : (
            leaderboard.map((player, index) => (
              <div key={player.index} className="leaderboard-item">
                <div className="leaderboard-rank">{index + 1}</div>
                <div className="leaderboard-info">
                  <div className="leaderboard-address">
                    {player.user.slice(0, 6)}...{player.user.slice(-4)}
                  </div>
                  <div className="leaderboard-hash">
                    Hash: {player.bestHash.slice(0, 10)}...{player.bestHash.slice(-6)}
                  </div>
                </div>
                <div className="leaderboard-stats">
                  <div className="leaderboard-calls">
                    <span className="calls-label">Times Fed:</span> {player.numCalls}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        
        <button onClick={fetchLeaderboard} className="refresh-button">
          Refresh Leaderboard
        </button>
      </div>
    </div>
  );
}

export default App;