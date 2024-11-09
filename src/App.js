import { useState } from 'react';
import { ethers } from 'ethers';
import './App.css';

function App() {
  const [name, setName] = useState('');
  const [submittedNames, setSubmittedNames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [connected, setConnected] = useState(false);

  const contractAddress = "0x57111581c40c0D54Cd9c363EC28B0Ba56660d9Bf";
  const abi = [
    "function greet(string name) public returns (string)",
    "function getSubmittedNames() public view returns (string[] memory)"
  ];

  const checkAndSwitchNetwork = async (provider) => {
    const network = await provider.getNetwork();
    if (network.chainId !== 355113n) {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x56BD9' }], // 355113 in hex
        });
      } catch (switchError) {
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0x56BD9',
              chainName: 'Bitfinity Testnet',
              nativeCurrency: { name: 'BFT', symbol: 'BFT', decimals: 18 },
              rpcUrls: ['https://testnet.bitfinity.network'],
              blockExplorerUrls: ['https://explorer.bitfinity.network']
            }]
          });
        } else {
          throw switchError;
        }
      }
    }
  };

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        throw new Error('Please install MetaMask or another Web3 wallet');
      }
      setLoading(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      await checkAndSwitchNetwork(provider);
      await provider.send("eth_requestAccounts", []);
      setConnected(true);
      await fetchSubmittedNames();
    } catch (err) {
      setError('Failed to connect wallet. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGreet = async () => {
    if (!name) return;
    setLoading(true);
    setError('');
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      await checkAndSwitchNetwork(provider);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, abi, signer);
      const tx = await contract.greet(name);
      await tx.wait();
      setName('');
      await fetchSubmittedNames();
    } catch (err) {
      setError('Failed to submit name. Please ensure you are connected to Bitfinity network.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmittedNames = async () => {
    setLoading(true);
    setError('');
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      await checkAndSwitchNetwork(provider);
      const contract = new ethers.Contract(contractAddress, abi, provider);
      const names = await contract.getSubmittedNames();
      setSubmittedNames(names);
    } catch (err) {
      setError('Failed to fetch names. Please ensure you are connected to Bitfinity network.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h1 className="title">Hello World dApp</h1>
        
        {!connected ? (
          <button 
            className="button primary"
            onClick={connectWallet}
            disabled={loading}
          >
            {loading ? 'Connecting...' : 'Connect Wallet'}
          </button>
        ) : (
          <>
            <div className="input-section">
              <input 
                className="input-field"
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="Enter your name"
                disabled={loading}
              />
              <button 
                className="button primary"
                onClick={handleGreet}
                disabled={loading || !name}
              >
                {loading ? 'Submitting...' : 'Greet'}
              </button>
            </div>

            <button 
              className="button secondary"
              onClick={fetchSubmittedNames}
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Fetch Names'}
            </button>
          </>
        )}

        {error && <p className="error">{error}</p>}

        {submittedNames.length > 0 && (
          <div className="names-section">
            <h2 className="subtitle">Submitted Names</h2>
            <div className="names-grid">
              {submittedNames.map((n, index) => (
                <div key={index} className="name-card">
                  {n}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;