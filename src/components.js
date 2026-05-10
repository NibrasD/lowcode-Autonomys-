export const componentCategories = [
  {
    title: 'UI Elements',
    items: [
      { type:'heading', icon:'📝', cls:'ui', name:'Heading', desc:'Title text', render:p=>`<div class="render-heading">${p.text||'Your Heading'}</div>` },
      { type:'text', icon:'📄', cls:'ui', name:'Text Block', desc:'Paragraph', render:p=>`<div class="render-text">${p.text||'Add your text content here...'}</div>` },
      { type:'button', icon:'🔘', cls:'ui', name:'Button', desc:'Action button', render:p=>`<div class="render-button">${p.label||'Click Me'}</div>` },
      { type:'input', icon:'✏️', cls:'ui', name:'Input Field', desc:'User input', render:p=>`<input class="render-input" placeholder="${p.placeholder||'Enter value...'}" disabled/>` },
      { type:'card', icon:'🃏', cls:'ui', name:'Card', desc:'Content card', render:p=>`<div class="render-card"><h4>${p.title||'Card Title'}</h4><p>${p.content||'Card content goes here'}</p></div>` },
      { type:'image', icon:'🖼️', cls:'ui', name:'Image', desc:'Display image', render:p=>`<div style="height:100px;border-radius:8px;background:var(--gradient-card);display:flex;align-items:center;justify-content:center;color:var(--text-muted)">🖼️ ${p.src||'Image Placeholder'}</div>` },
    ]
  },
  {
    title: 'Web3 / Blockchain',
    items: [
      { type:'wallet-connect', icon:'👛', cls:'web3', name:'Wallet Connect', desc:'Connect wallet', render:()=>`<div class="render-wallet"><span class="wallet-icon">👛</span> Connect Wallet (MetaMask)</div>` },
      { type:'token-balance', icon:'💰', cls:'web3', name:'Token Balance', desc:'AI3 balance', render:p=>`<div class="render-token"><div class="token-info"><div class="token-symbol">${p.symbol||'AI3'}</div><div><div style="font-weight:700">${p.symbol||'AI3'} Token</div><div style="font-size:.75rem;color:var(--text-muted)">Autonomys Network</div></div></div><div class="token-amount">${p.amount||'0.00'}</div></div>` },
      { type:'tx-form', icon:'📤', cls:'web3', name:'Transaction Form', desc:'Send tokens', render:p=>`<div class="render-form"><label>Recipient Address</label><input placeholder="0x..." disabled/><label>Amount (${p.symbol||'AI3'})</label><input placeholder="0.00" disabled/><div class="render-button" style="text-align:center;margin-top:8px">Send Transaction</div></div>` },
      { type:'contract-call', icon:'📜', cls:'web3', name:'Contract Call', desc:'Call smart contract', render:p=>`<div class="render-card"><h4>📜 ${p.functionName||'Contract Function'}</h4><p>Contract: ${p.address||'0x...'}</p><div class="render-button" style="margin-top:10px;text-align:center">Execute</div></div>` },
      { type:'nft-mint', icon:'🎨', cls:'web3', name:'NFT Mint', desc:'Mint NFTs', render:p=>`<div class="render-nft"><div class="nft-preview">🎨</div><div style="font-weight:700">${p.name||'My NFT Collection'}</div><div style="color:var(--text-muted);font-size:.85rem;margin:4px 0">Price: ${p.price||'10'} AI3</div><div class="render-button" style="margin-top:10px">Mint Now</div></div>` },
    ]
  },
  {
    title: 'Autonomys Native',
    items: [
      { type:'dsn-upload', icon:'💾', cls:'data', name:'DSN Upload', desc:'Permanent storage', render:()=>`<div class="render-storage"><div class="storage-icon">💾</div><div class="storage-info"><div style="font-weight:600">DSN Permanent Storage</div><div style="font-size:.8rem;color:var(--text-muted)">Upload files to Autonomys DSN</div><div class="storage-bar"><div class="storage-fill"></div></div></div></div>` },
      { type:'dsn-viewer', icon:'📂', cls:'data', name:'DSN File Viewer', desc:'Browse stored files', render:()=>`<div class="render-card"><h4>📂 Stored Files</h4><div style="margin-top:10px;font-size:.85rem;color:var(--text-muted)"><div style="padding:6px 0;border-bottom:1px solid var(--border-color)">📄 document.pdf — 2.4 MB</div><div style="padding:6px 0;border-bottom:1px solid var(--border-color)">🖼️ image.png — 1.1 MB</div><div style="padding:6px 0">📊 data.json — 0.3 MB</div></div></div>` },
      { type:'staking', icon:'🥩', cls:'data', name:'Staking Panel', desc:'Stake AI3 tokens', render:p=>`<div class="render-card"><h4>🥩 Stake AI3</h4><p>APY: ${p.apy||'12.5'}% · Min: ${p.min||'100'} AI3</p><div class="render-form" style="margin-top:12px"><input placeholder="Amount to stake" disabled/><div class="render-button" style="text-align:center;margin-top:8px">Stake Now</div></div></div>` },
      { type:'auto-id', icon:'🆔', cls:'data', name:'Auto ID', desc:'Digital identity', render:()=>`<div class="render-card"><h4>🆔 Auto ID — Self-Sovereign Identity</h4><p>Verify your identity on Autonomys Network</p><div class="render-button" style="margin-top:10px;text-align:center">Create Auto ID</div></div>` },
    ]
  },
  {
    title: 'AI Components',
    items: [
      { type:'ai-agent', icon:'🤖', cls:'ai', name:'AI Agent', desc:'Autonomous agent', render:p=>`<div class="render-agent"><div class="agent-header"><div class="agent-avatar">🤖</div><div><div style="font-weight:700">${p.name||'AutoAgent'}</div><div class="agent-status">● Active</div></div></div><div style="font-size:.85rem;color:var(--text-secondary)">${p.task||'Monitoring on-chain events and executing automated trades'}</div></div>` },
      { type:'ai-chat', icon:'💬', cls:'ai', name:'AI Chat', desc:'Chat interface', render:()=>`<div class="render-card"><h4>💬 AI Assistant</h4><div style="margin:10px 0;padding:10px;background:var(--bg-secondary);border-radius:8px;font-size:.85rem;color:var(--text-secondary)">How can I help you today?</div><div style="display:flex;gap:8px"><input style="flex:1;padding:8px 12px;border-radius:6px;background:var(--bg-secondary);border:1px solid var(--border-color);color:var(--text-primary)" placeholder="Ask anything..." disabled/><div class="render-button" style="padding:8px 16px">Send</div></div></div>` },
    ]
  }
];

export function getComponentDef(type) {
  for (const cat of componentCategories) {
    const found = cat.items.find(i => i.type === type);
    if (found) return found;
  }
  return null;
}

export function getDefaultProps(type) {
  const defaults = {
    'heading': { text: 'Your Heading' },
    'text': { text: 'Add your text content here. You can customize this in the properties panel.' },
    'button': { label: 'Click Me', action: 'none' },
    'input': { placeholder: 'Enter value...', label: 'Field Label' },
    'card': { title: 'Card Title', content: 'Card content goes here' },
    'image': { src: 'Image Placeholder', alt: 'Image' },
    'wallet-connect': {},
    'token-balance': { symbol: 'AI3', amount: '0.00' },
    'tx-form': { symbol: 'AI3' },
    'contract-call': { address: '0x...', functionName: 'myFunction', abi: '' },
    'nft-mint': { name: 'My NFT Collection', price: '10', maxSupply: '1000' },
    'dsn-upload': {},
    'dsn-viewer': {},
    'staking': { apy: '12.5', min: '100' },
    'auto-id': {},
    'ai-agent': { name: 'AutoAgent', task: 'Monitoring on-chain events and executing automated trades' },
    'ai-chat': {},
  };
  return { ...(defaults[type] || {}) };
}

export function getPropsConfig(type) {
  const configs = {
    'heading': [{ key:'text', label:'Text', type:'text' }],
    'text': [{ key:'text', label:'Content', type:'textarea' }],
    'button': [{ key:'label', label:'Label', type:'text' },{ key:'action', label:'Action', type:'select', options:['none','navigate','contract-call','emit-event'] }],
    'input': [{ key:'placeholder', label:'Placeholder', type:'text' },{ key:'label', label:'Label', type:'text' }],
    'card': [{ key:'title', label:'Title', type:'text' },{ key:'content', label:'Content', type:'textarea' }],
    'image': [{ key:'src', label:'Source URL', type:'text' },{ key:'alt', label:'Alt Text', type:'text' }],
    'token-balance': [{ key:'symbol', label:'Token Symbol', type:'text' },{ key:'amount', label:'Default Amount', type:'text' }],
    'tx-form': [{ key:'symbol', label:'Token Symbol', type:'text' }],
    'contract-call': [{ key:'address', label:'Contract Address', type:'text' },{ key:'functionName', label:'Function Name', type:'text' }],
    'nft-mint': [{ key:'name', label:'Collection Name', type:'text' },{ key:'price', label:'Mint Price (AI3)', type:'text' },{ key:'maxSupply', label:'Max Supply', type:'text' }],
    'staking': [{ key:'apy', label:'APY (%)', type:'text' },{ key:'min', label:'Min Stake (AI3)', type:'text' }],
    'ai-agent': [{ key:'name', label:'Agent Name', type:'text' },{ key:'task', label:'Task Description', type:'textarea' }],
  };
  return configs[type] || [];
}
