export function generateCode(components, projectName) {
  const html = generateHTML(components, projectName);
  const sol = generateSolidity(components, projectName);
  const js = generateJS(components);
  return { html, sol, js };
}

function sanitizeHTML(str) {
  if (!str) return '';
  return str.replace(/&/g, '&').replace(/</g, '<').replace(/>/g, '>').replace(/"/g, '"');
}

function generateHTML(components, name) {
  let body = '';
  let needsWallet = false;
  let needsEthers = false;
  let needsAutoDrive = false;

  for (const c of components) {
    switch (c.type) {
      case 'heading':
        body += `    <h1 class="app-heading">${sanitizeHTML(c.props.text || 'Heading')}</h1>\n`;
        break;
      case 'text':
        body += `    <p class="app-text">${sanitizeHTML(c.props.text || 'Text')}</p>\n`;
        break;
      case 'button':
        const action = c.props.action || 'none';
        let onClick = '';
        if (action === 'navigate') onClick = 'onclick="handleClick()"';
        else if (action === 'contract-call') onClick = 'onclick="callContract()"';
        else if (action === 'emit-event') onClick = 'onclick="emitEvent()"';
        else onClick = 'onclick="handleClick()"';
        body += `    <button class="btn-primary" id="btn-${c.id}" ${onClick}>${sanitizeHTML(c.props.label || 'Button')}</button>\n`;
        break;
      case 'input':
        body += `    <div class="form-group">\n      <label>${sanitizeHTML(c.props.label || '')}</label>\n      <input id="input-${c.id}" placeholder="${sanitizeHTML(c.props.placeholder || '')}" />\n    </div>\n`;
        break;
      case 'card':
        body += `    <div class="card">\n      <h3>${sanitizeHTML(c.props.title || 'Card')}</h3>\n      <p>${sanitizeHTML(c.props.content || '')}</p>\n    </div>\n`;
        break;
      case 'image':
        body += `    <img src="${sanitizeHTML(c.props.src || '')}" alt="${sanitizeHTML(c.props.alt || 'Image')}" class="app-image" />\n`;
        break;
      case 'wallet-connect':
        needsWallet = true;
        needsEthers = true;
        body += `    <div class="wallet-section">\n      <button id="connectWallet" onclick="connectWallet()" class="btn-wallet">👛 Connect Wallet</button>\n      <div id="walletInfo" class="wallet-info" style="display:none">\n        <span>Connected: <strong id="walletAddress"></strong></span>\n      </div>\n    </div>\n`;
        break;
      case 'token-balance':
        needsWallet = true;
        needsEthers = true;
        body += `    <div class="token-balance-card">\n      <div class="token-header">\n        <span class="token-icon">💰</span>\n        <span class="token-name">${sanitizeHTML(c.props.symbol || 'AI3')} Balance</span>\n      </div>\n      <div class="token-amount" id="balanceDisplay">0.00 ${sanitizeHTML(c.props.symbol || 'AI3')}</div>\n      <button onclick="refreshBalance()" class="btn-secondary btn-sm">🔄 Refresh</button>\n    </div>\n`;
        break;
      case 'tx-form':
        needsWallet = true;
        needsEthers = true;
        body += `    <div class="tx-form-card">\n      <h3>📤 Send ${sanitizeHTML(c.props.symbol || 'AI3')}</h3>\n      <form id="txForm" onsubmit="sendTransaction(event)">\n        <div class="form-group">\n          <label>Recipient Address</label>\n          <input id="txTo" placeholder="0x..." required pattern="0x[a-fA-F0-9]{40}" />\n        </div>\n        <div class="form-group">\n          <label>Amount (${sanitizeHTML(c.props.symbol || 'AI3')})</label>\n          <input id="txAmount" type="number" step="0.0001" placeholder="0.00" required min="0" />\n        </div>\n        <button type="submit" class="btn-primary">Send Transaction</button>\n      </form>\n      <div id="txStatus" class="tx-status"></div>\n    </div>\n`;
        break;
      case 'contract-call':
        needsWallet = true;
        needsEthers = true;
        body += `    <div class="contract-call-card">\n      <h4>📜 ${sanitizeHTML(c.props.functionName || 'Contract Function')}</h4>\n      <p>Contract: <code>${sanitizeHTML(c.props.address || '0x...')}</code></p>\n      <button onclick="callContract()" class="btn-primary">Execute Function</button>\n      <div id="contractResult" class="contract-result"></div>\n    </div>\n`;
        break;
      case 'nft-mint':
        needsWallet = true;
        needsEthers = true;
        body += `    <div class="nft-mint-card">\n      <div class="nft-preview">🎨</div>\n      <h3>${sanitizeHTML(c.props.name || 'NFT Collection')}</h3>\n      <p class="nft-price">Price: ${sanitizeHTML(c.props.price || '10')} AI3</p>\n      <p class="nft-supply">Max Supply: ${sanitizeHTML(c.props.maxSupply || '1000')}</p>\n      <button onclick="mintNFT()" class="btn-primary">Mint Now</button>\n      <div id="mintStatus" class="mint-status"></div>\n    </div>\n`;
        break;
      case 'dsn-upload':
        needsAutoDrive = true;
        body += `    <div class="dsn-upload-card">\n      <h4>💾 Upload to DSN</h4>\n      <p>Upload files to Autonomys Distributed Storage Network</p>\n      <input type="file" id="fileUpload" class="file-input" />\n      <button onclick="uploadToDSN()" class="btn-primary">Upload to DSN</button>\n      <div id="uploadProgress" class="upload-progress"></div>\n      <div id="uploadResult" class="upload-result"></div>\n    </div>\n`;
        break;
      case 'dsn-viewer':
        body += `    <div class="dsn-viewer-card">\n      <h4>📂 Stored Files</h4>\n      <div class="file-list" id="fileList">\n        <div class="file-item">📄 sample.pdf — 2.4 MB</div>\n        <div class="file-item">🖼️ image.png — 1.1 MB</div>\n        <div class="file-item">📊 data.json — 0.3 MB</div>\n      </div>\n    </div>\n`;
        break;
      case 'staking':
        needsWallet = true;
        needsEthers = true;
        body += `    <div class="staking-card">\n      <h4>🥩 Stake AI3 Tokens</h4>\n      <p class="staking-info">APY: ${sanitizeHTML(c.props.apy || '12.5')}% · Min: ${sanitizeHTML(c.props.min || '100')} AI3</p>\n      <div class="form-group">\n        <label>Amount to Stake</label>\n        <input id="stakeAmount" type="number" placeholder="Enter amount" min="${sanitizeHTML(c.props.min || '100')}" />\n      </div>\n      <button onclick="stakeTokens()" class="btn-primary">Stake Now</button>\n      <div id="stakingStatus" class="staking-status"></div>\n    </div>\n`;
        break;
      case 'ai-agent':
        body += `    <div class="ai-agent-card">\n      <div class="agent-header">\n        <div class="agent-avatar">🤖</div>\n        <div class="agent-info">\n          <h4>${sanitizeHTML(c.props.name || 'AutoAgent')}</h4>\n          <span class="agent-status active">● Active</span>\n        </div>\n      </div>\n      <p class="agent-task">${sanitizeHTML(c.props.task || 'Autonomous agent running...')}</p>\n    </div>\n`;
        break;
      case 'ai-chat':
        body += `    <div class="ai-chat-card">\n      <h4>💬 AI Assistant</h4>\n      <div class="chat-messages" id="chatMessages">\n        <div class="chat-message ai">How can I help you today?</div>\n      </div>\n      <div class="chat-input-row">\n        <input id="chatInput" placeholder="Ask anything..." />\n        <button onclick="sendChatMessage()" class="btn-primary">Send</button>\n      </div>\n    </div>\n`;
        break;
    }
  }

  // Build the full HTML
  let headExtras = '';
  if (needsEthers) {
    headExtras += '  <script src="https://cdn.ethers.io/lib/ethers-5.7.umd.min.js"></script>\n';
  }
  if (needsAutoDrive) {
    headExtras += '  <script type="module">\n    import { createAutoDriveApi, uploadFileFromInput } from "https://esm.sh/@autonomys/auto-drive";\n    window.autoDriveApi = createAutoDriveApi({ apiKey: \'YOUR_API_KEY_HERE\', network: \'taurus\' });\n  </script>\n';
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${sanitizeHTML(name)}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', system-ui, sans-serif; background: #0a0a0f; color: #f0f0f5; padding: 20px; max-width: 800px; margin: 0 auto; }
    .app-heading { font-size: 2rem; font-weight: 800; margin-bottom: 1rem; background: linear-gradient(135deg, #7c3aed, #06b6d4); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .app-text { color: #a0a0b8; line-height: 1.6; margin-bottom: 1rem; }
    .btn-primary { background: linear-gradient(135deg, #7c3aed, #06b6d4); color: #fff; border: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.3s; }
    .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 4px 20px rgba(124,58,237,0.4); }
    .btn-secondary { background: transparent; color: #f0f0f5; border: 1px solid rgba(255,255,255,0.1); padding: 8px 16px; border-radius: 8px; font-weight: 600; cursor: pointer; }
    .btn-sm { padding: 6px 12px; font-size: 0.85rem; }
    .card { background: #1a1a2e; border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 20px; margin-bottom: 1rem; }
    .card h3 { margin-bottom: 8px; }
    .card p { color: #a0a0b8; font-size: 0.95rem; }
    .form-group { margin-bottom: 16px; }
    .form-group label { display: block; font-size: 0.85rem; font-weight: 600; color: #a0a0b8; margin-bottom: 6px; }
    .form-group input { width: 100%; padding: 10px 14px; border-radius: 8px; background: #12121a; border: 1px solid rgba(255,255,255,0.1); color: #f0f0f5; font-size: 1rem; }
    .form-group input:focus { outline: none; border-color: #7c3aed; }
    .app-image { max-width: 100%; border-radius: 12px; margin-bottom: 1rem; }
    .wallet-section { background: rgba(124,58,237,0.1); border: 1px solid rgba(124,58,237,0.3); border-radius: 12px; padding: 20px; margin-bottom: 1rem; }
    .btn-wallet { background: linear-gradient(135deg, #7c3aed, #06b6d4); color: #fff; border: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; cursor: pointer; }
    .wallet-info { margin-top: 12px; color: #06b6d4; }
    .token-balance-card { background: #1a1a2e; border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 20px; margin-bottom: 1rem; text-align: center; }
    .token-header { display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 12px; }
    .token-icon { font-size: 1.5rem; }
    .token-name { font-weight: 600; }
    .token-amount { font-size: 2rem; font-weight: 800; margin-bottom: 12px; }
    .tx-form-card { background: #1a1a2e; border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 20px; margin-bottom: 1rem; }
    .tx-form-card h3 { margin-bottom: 16px; }
    .tx-status { margin-top: 12px; padding: 10px; border-radius: 8px; font-size: 0.85rem; }
    .nft-mint-card { text-align: center; background: #1a1a2e; border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 24px; margin-bottom: 1rem; }
    .nft-preview { font-size: 4rem; margin-bottom: 12px; }
    .nft-price { color: #06b6d4; font-weight: 600; margin: 8px 0; }
    .nft-supply { color: #a0a0b8; font-size: 0.85rem; }
    .mint-status { margin-top: 12px; font-size: 0.85rem; }
    .contract-call-card { background: #1a1a2e; border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 20px; margin-bottom: 1rem; }
    .contract-call-card code { background: #12121a; padding: 2px 8px; border-radius: 4px; font-size: 0.85rem; }
    .contract-result { margin-top: 12px; padding: 10px; border-radius: 8px; font-size: 0.85rem; }
    .dsn-upload-card { background: #1a1a2e; border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 20px; margin-bottom: 1rem; }
    .dsn-upload-card h4 { margin-bottom: 8px; }
    .dsn-upload-card p { color: #a0a0b8; font-size: 0.85rem; margin-bottom: 16px; }
    .file-input { display: block; width: 100%; margin-bottom: 12px; }
    .upload-progress { margin-top: 12px; font-size: 0.85rem; }
    .upload-result { margin-top: 8px; font-size: 0.85rem; color: #06b6d4; }
    .dsn-viewer-card { background: #1a1a2e; border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 20px; margin-bottom: 1rem; }
    .file-list { margin-top: 12px; }
    .file-item { padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.06); font-size: 0.9rem; }
    .staking-card { background: #1a1a2e; border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 20px; margin-bottom: 1rem; }
    .staking-info { color: #06b6d4; margin-bottom: 16px; }
    .staking-status { margin-top: 12px; font-size: 0.85rem; }
    .ai-agent-card { background: linear-gradient(135deg, rgba(236,72,153,0.08), rgba(124,58,237,0.08)); border: 1px solid rgba(236,72,153,0.2); border-radius: 12px; padding: 20px; margin-bottom: 1rem; }
    .agent-header { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
    .agent-avatar { font-size: 2rem; }
    .agent-info h4 { font-weight: 700; }
    .agent-status { font-size: 0.75rem; }
    .agent-status.active { color: #ec4899; }
    .agent-task { color: #a0a0b8; font-size: 0.9rem; }
    .ai-chat-card { background: #1a1a2e; border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 20px; margin-bottom: 1rem; }
    .chat-messages { max-height: 200px; overflow-y: auto; margin: 12px 0; }
    .chat-message { padding: 10px 14px; border-radius: 8px; margin-bottom: 8px; font-size: 0.9rem; }
    .chat-message.ai { background: rgba(124,58,237,0.1); border-left: 3px solid #7c3aed; }
    .chat-message.user { background: rgba(6,182,212,0.1); border-left: 3px solid #06b6d4; text-align: right; }
    .chat-input-row { display: flex; gap: 8px; }
    .chat-input-row input { flex: 1; padding: 10px 14px; border-radius: 8px; background: #12121a; border: 1px solid rgba(255,255,255,0.1); color: #f0f0f5; }
  </style>
${headExtras}</head>
<body>
  <div id="app">
${body}  </div>
  <script src="app.js"></script>
</body>
</html>`;
}

function generateJS(components) {
  const hasWallet = components.some(c => ['wallet-connect', 'token-balance', 'tx-form', 'nft-mint', 'staking', 'contract-call'].includes(c.type));
  let code = `// Auto-generated by AutoBuild for Autonomys Network
// Chain: Auto EVM Testnet (Chain ID: 490000)
// Generated: ${new Date().toISOString()}

const RPC_URL = "https://auto-evm.chronos.autonomys.xyz/ws";
const CHAIN_ID = 490000;
const CHAIN_NAME = "Auto EVM Testnet";
let provider, signer, account;

// Network configuration
const networkConfig = {
  chainId: '0x77980', // 490000 in hex
  chainName: CHAIN_NAME,
  rpcUrls: ['https://auto-evm.chronos.autonomys.xyz/ws'],
  nativeCurrency: { name: 'AI3', symbol: 'AI3', decimals: 18 },
  blockExplorerUrls: ['https://explorer.autonomys.xyz']
};

// Check if MetaMask is installed
function isMetaMaskInstalled() {
  return typeof window.ethereum !== 'undefined';
}

// Add Auto EVM network to MetaMask
async function addAutoEVMNetwork() {
  try {
    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [networkConfig]
    });
    return true;
  } catch (error) {
    console.error('Failed to add network:', error);
    return false;
  }
}

// Switch to Auto EVM network
async function switchToAutoEVM() {
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: networkConfig.chainId }],
    });
    return true;
  } catch (error) {
    if (error.code === 4902) {
      // Chain not added, try to add it
      return await addAutoEVMNetwork();
    }
    console.error('Failed to switch network:', error);
    return false;
  }
}

// Connect wallet
async function connectWallet() {
  if (!isMetaMaskInstalled()) {
    alert('Please install MetaMask to use this dApp!');
    return;
  }

  try {
    provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send('eth_requestAccounts', []);
    signer = provider.getSigner();
    account = await signer.getAddress();

    // Update UI
    const connectBtn = document.getElementById('connectWallet');
    const walletInfo = document.getElementById('walletInfo');
    const walletAddress = document.getElementById('walletAddress');

    if (connectBtn) {
      connectBtn.textContent = account.slice(0, 6) + '...' + account.slice(-4);
      connectBtn.disabled = true;
      connectBtn.style.opacity = '0.7';
    }
    if (walletInfo) {
      walletInfo.style.display = 'block';
      walletAddress.textContent = account;
    }

    // Update balance if token-balance component exists
    if (document.getElementById('balanceDisplay')) {
      refreshBalance();
    }

    console.log('Wallet connected:', account);
  } catch (error) {
    console.error('Failed to connect wallet:', error);
    alert('Failed to connect wallet: ' + error.message);
  }
}

// Refresh balance display
async function refreshBalance() {
  if (!provider || !account) {
    console.log('Wallet not connected');
    return;
  }

  try {
    const balance = await provider.getBalance(account);
    const balanceDisplay = document.getElementById('balanceDisplay');
    if (balanceDisplay) {
      balanceDisplay.textContent = ethers.utils.formatEther(balance) + ' AI3';
    }
  } catch (error) {
    console.error('Failed to get balance:', error);
  }
}

// Send transaction
async function sendTransaction(event) {
  event.preventDefault();

  if (!signer) {
    alert('Please connect your wallet first!');
    return;
  }

  const to = document.getElementById('txTo').value;
  const amount = document.getElementById('txAmount').value;
  const txStatus = document.getElementById('txStatus');

  if (!to || !amount) {
    alert('Please fill in all fields');
    return;
  }

  // Validate address
  if (!ethers.utils.isAddress(to)) {
    alert('Invalid recipient address');
    return;
  }

  try {
    if (txStatus) txStatus.innerHTML = '⏳ Sending transaction...';
    
    const tx = await signer.sendTransaction({
      to: to,
      value: ethers.utils.parseEther(amount.toString())
    });

    if (txStatus) txStatus.innerHTML = '⏳ Transaction sent! Waiting for confirmation...<br>TX Hash: ' + tx.hash;
    
    await tx.wait();

    if (txStatus) txStatus.innerHTML = '✅ Transaction confirmed!<br>TX Hash: <a href="https://explorer.autonomys.xyz/tx/' + tx.hash + '" target="_blank">' + tx.hash + '</a>';
    
    // Reset form
    document.getElementById('txTo').value = '';
    document.getElementById('txAmount').value = '';
    
    // Refresh balance
    refreshBalance();
  } catch (error) {
    console.error('Transaction failed:', error);
    if (txStatus) txStatus.innerHTML = '❌ Transaction failed: ' + error.message;
  }
}

// Generic button click handler
function handleClick() {
  console.log('Button clicked!');
  alert('Button action triggered!');
}

// Contract call handler
async function callContract() {
  if (!signer) {
    alert('Please connect your wallet first!');
    return;
  }

  const resultDiv = document.getElementById('contractResult');
  if (resultDiv) resultDiv.textContent = '⏳ Calling contract...';

  // TODO: Add your contract ABI and address here
  // const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
  // const result = await contract.yourFunction();

  if (resultDiv) resultDiv.textContent = 'Contract call executed (configure your contract in the code)';
}

// Emit event handler
function emitEvent() {
  console.log('Event emitted!');
  alert('Event triggered!');
}

// Mint NFT
async function mintNFT() {
  if (!signer) {
    alert('Please connect your wallet first!');
    return;
  }

  const mintStatus = document.getElementById('mintStatus');
  if (mintStatus) mintStatus.textContent = '⏳ Minting NFT...';

  // TODO: Add your NFT contract address and ABI
  // const nftContract = new ethers.Contract(NFT_CONTRACT_ADDRESS, NFT_ABI, signer);
  // const tx = await nftContract.mint({ value: ethers.utils.parseEther('10') });
  // await tx.wait();

  if (mintStatus) mintStatus.textContent = 'NFT minted! (configure your contract in the code)';
}

// Upload to DSN
async function uploadToDSN() {
  const fileInput = document.getElementById('fileUpload');
  const progressDiv = document.getElementById('uploadProgress');
  const resultDiv = document.getElementById('uploadResult');

  if (!fileInput || !fileInput.files.length) {
    alert('Please select a file first');
    return;
  }

  if (progressDiv) progressDiv.textContent = '⏳ Uploading to DSN...';

  try {
    // Note: You need to configure your Auto Drive API key
    // This is a placeholder - actual implementation requires backend
    const file = fileInput.files[0];
    console.log('Uploading file:', file.name);

    // Simulate upload progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      if (progressDiv) progressDiv.textContent = '⏳ Uploading... ' + progress + '%';
      if (progress >= 100) {
        clearInterval(interval);
        if (resultDiv) resultDiv.innerHTML = '✅ File uploaded successfully!<br>CID: mock-cid-' + Date.now();
      }
    }, 200);

  } catch (error) {
    console.error('Upload failed:', error);
    if (resultDiv) resultDiv.textContent = '❌ Upload failed: ' + error.message;
  }
}

// Stake tokens
async function stakeTokens() {
  if (!signer) {
    alert('Please connect your wallet first!');
    return;
  }

  const amount = document.getElementById('stakeAmount').value;
  const statusDiv = document.getElementById('stakingStatus');

  if (!amount || amount <= 0) {
    alert('Please enter a valid amount');
    return;
  }

  if (statusDiv) statusDiv.textContent = '⏳ Staking tokens...';

  // TODO: Add your staking contract integration
  // const stakingContract = new ethers.Contract(STAKING_CONTRACT_ADDRESS, STAKING_ABI, signer);
  // const tx = await stakingContract.stake({ value: ethers.utils.parseEther(amount) });
  // await tx.wait();

  if (statusDiv) statusDiv.textContent = 'Tokens staked successfully! (configure your contract in the code)';
}

// AI Chat
function sendChatMessage() {
  const input = document.getElementById('chatInput');
  const messages = document.getElementById('chatMessages');

  if (!input || !input.value.trim()) return;

  const userMessage = input.value.trim();

  // Add user message
  const userDiv = document.createElement('div');
  userDiv.className = 'chat-message user';
  userDiv.textContent = userMessage;
  messages.appendChild(userDiv);

  input.value = '';

  // Simulate AI response
  setTimeout(() => {
    const aiDiv = document.createElement('div');
    aiDiv.className = 'chat-message ai';
    aiDiv.textContent = 'I received your message: "' + userMessage + '". This is a demo response.';
    messages.appendChild(aiDiv);
    messages.scrollTop = messages.scrollHeight;
  }, 1000);
}

// Handle Enter key in chat input
document.addEventListener('DOMContentLoaded', () => {
  const chatInput = document.getElementById('chatInput');
  if (chatInput) {
    chatInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        sendChatMessage();
      }
    });
  }

  // Auto-connect wallet on page load (optional)
  // if (isMetaMaskInstalled()) {
  //   connectWallet();
  // }
});

// Listen for account changes
if (typeof window.ethereum !== 'undefined') {
  window.ethereum.on('accountsChanged', (accounts) => {
    if (accounts.length === 0) {
      // User disconnected
      location.reload();
    } else {
      account = accounts[0];
      const walletAddress = document.getElementById('walletAddress');
      if (walletAddress) walletAddress.textContent = account;
      refreshBalance();
    }
  });

  window.ethereum.on('chainChanged', () => {
    location.reload();
  });
}
`;

  // Add DSN upload specific code if needed
  if (components.some(c => c.type === 'dsn-upload')) {
    code = `// DSN Upload requires Auto Drive API
// Import the library in your HTML:
// <script type="module">
//   import { createAutoDriveApi, uploadFileFromInput } from "https://esm.sh/@autonomys/auto-drive";
//   window.autoDriveApi = createAutoDriveApi({ apiKey: 'YOUR_API_KEY', network: 'taurus' });
// </script>

` + code;
  }

  return code;
}

function generateSolidity(components, name) {
  const hasNFT = components.some(c => c.type === 'nft-mint');
  const hasToken = components.some(c => ['token-balance', 'tx-form'].includes(c.type));
  const hasStaking = components.some(c => c.type === 'staking');

  if (!hasNFT && !hasToken && !hasStaking) return null;

  const safeName = (name || 'MyProject').replace(/\s/g, '');
  let code = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// NOTE: This contract is auto-generated by AutoBuild.
// Please review and audit before deploying to mainnet.
// Deploy to Auto EVM Testnet (Chain ID: 490000)

`;

  if (hasNFT) {
    const nft = components.find(c => c.type === 'nft-mint');
    const nftName = nft?.props?.name || safeName;
    const price = nft?.props?.price || '10';
    const maxSupply = nft?.props?.maxSupply || '1000';

    code += `import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract ${safeName}NFT is ERC721, Ownable, ReentrancyGuard {
    uint256 public totalSupply;
    uint256 public mintPrice = ${price} ether;
    uint256 public maxSupply = ${maxSupply};
    string private _baseTokenURI;

    event NFTMinted(address indexed minter, uint256 tokenId);
    event Withdrawn(address indexed owner, uint256 amount);

    constructor() ERC721("${nftName}", "${safeName.substring(0, 5).toUpperCase()}") Ownable(msg.sender) {}

    function mint() external payable nonReentrant {
        require(msg.value >= mintPrice, "Insufficient payment");
        require(totalSupply < maxSupply, "Max supply reached");

        uint256 tokenId = ++totalSupply;
        _mint(msg.sender, tokenId);

        emit NFTMinted(msg.sender, tokenId);
    }

    function mintMultiple(uint256 amount) external payable nonReentrant {
        require(amount > 0 && amount <= 10, "Invalid amount");
        require(msg.value >= mintPrice * amount, "Insufficient payment");
        require(totalSupply + amount <= maxSupply, "Would exceed max supply");

        for (uint256 i = 0; i < amount; i++) {
            uint256 tokenId = ++totalSupply;
            _mint(msg.sender, tokenId);
            emit NFTMinted(msg.sender, tokenId);
        }
    }

    function setBaseURI(string memory baseURI) external onlyOwner {
        _baseTokenURI = baseURI;
    }

    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    function withdraw() external onlyOwner nonReentrant {
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance to withdraw");

        payable(owner()).transfer(balance);
        emit Withdrawn(owner(), balance);
    }

    receive() external payable {}
    fallback() external payable {}
}

`;
  }

  if (hasStaking) {
    const staking = components.find(c => c.type === 'staking');
    const apy = staking?.props?.apy || '12.5';

    code += `import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ${safeName}Staking is ReentrancyGuard, Ownable {
    IERC20 public token;
    uint256 public apy = ${apy * 100}; // APY in basis points (e.g., 1250 = 12.5%)
    uint256 public totalStaked;

    struct Stake {
        uint256 amount;
        uint256 timestamp;
    }

    mapping(address => Stake) public stakes;
    mapping(address => uint256) public rewards;

    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount, uint256 reward);

    constructor(address _tokenAddress) Ownable(msg.sender) {
        token = IERC20(_tokenAddress);
    }

    function stake(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be > 0");

        // Claim pending rewards first
        claimRewards();

        stakes[msg.sender] = Stake({
            amount: stakes[msg.sender].amount + amount,
            timestamp: block.timestamp
        });
        totalStaked += amount;

        token.transferFrom(msg.sender, address(this), amount);
        emit Staked(msg.sender, amount);
    }

    function unstake(uint256 amount) external nonReentrant {
        require(stakes[msg.sender].amount >= amount, "Insufficient staked");

        claimRewards();

        stakes[msg.sender].amount -= amount;
        totalStaked -= amount;

        token.transfer(msg.sender, amount);
        emit Unstaked(msg.sender, amount, rewards[msg.sender]);
    }

    function claimRewards() public {
        uint256 reward = calculateReward(msg.sender);
        if (reward > 0) {
            rewards[msg.sender] = 0;
            // In production, transfer actual rewards here
            // token.transfer(msg.sender, reward);
        }
    }

    function calculateReward(address user) public view returns (uint256) {
        Stake memory stake = stakes[user];
        if (stake.amount == 0) return 0;

        uint256 timeElapsed = block.timestamp - stake.timestamp;
        uint256 reward = (stake.amount * apy * timeElapsed) / (365 days * 10000);
        return reward;
    }

    function setAPY(uint256 _apy) external onlyOwner {
        apy = _apy;
    }

    function emergencyWithdraw() external nonReentrant {
        uint256 amount = stakes[msg.sender].amount;
        require(amount > 0, "No stake found");

        stakes[msg.sender].amount = 0;
        totalStaked -= amount;

        token.transfer(msg.sender, amount);
    }
}

`;
  }

  return code;
}