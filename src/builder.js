import { componentCategories, getComponentDef, getDefaultProps, getPropsConfig } from './components.js';
import { generateCode } from './codegen.js';
import { getTemplates } from './landing.js';

let droppedComponents = [];
let selectedId = null;
let currentView = 'design';
let projectName = 'My Autonomys dApp';
let projectId = localStorage.getItem('autobuild_project_id') || 'proj_' + Math.random().toString(36).substring(2, 9);
localStorage.setItem('autobuild_project_id', projectId);

// Undo/Redo System
let undoStack = [];
let redoStack = [];
let isUndoRedoInProgress = false;
const MAX_UNDO_STACK = 50;

function saveToUndoStack() {
  if (isUndoRedoInProgress) return;
  undoStack.push(JSON.stringify(droppedComponents));
  if (undoStack.length > MAX_UNDO_STACK) undoStack.shift();
  redoStack = []; // Clear redo stack on new action
  updateUndoRedoButtons();
}

window.undo = function() {
  if (undoStack.length === 0) return;
  redoStack.push(JSON.stringify(droppedComponents));
  droppedComponents = JSON.parse(undoStack.pop());
  isUndoRedoInProgress = true;
  selectedId = null;
  refreshCanvas();
  refreshPanel();
  isUndoRedoInProgress = false;
  updateUndoRedoButtons();
};

window.redo = function() {
  if (redoStack.length === 0) return;
  undoStack.push(JSON.stringify(droppedComponents));
  droppedComponents = JSON.parse(redoStack.pop());
  isUndoRedoInProgress = true;
  selectedId = null;
  refreshCanvas();
  refreshPanel();
  isUndoRedoInProgress = false;
  updateUndoRedoButtons();
};

function updateUndoRedoButtons() {
  const undoBtn = document.getElementById('undoBtn');
  const redoBtn = document.getElementById('redoBtn');
  if (undoBtn) undoBtn.disabled = undoStack.length === 0;
  if (redoBtn) redoBtn.disabled = redoStack.length === 0;
}

// Keyboard Shortcuts
document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
    e.preventDefault();
    window.undo();
  }
  if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
    e.preventDefault();
    window.redo();
  }
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    e.preventDefault();
    window.saveProject();
  }
  if (e.key === 'Delete' && selectedId) {
    e.preventDefault();
    droppedComponents = droppedComponents.filter(c => c.id !== selectedId);
    selectedId = null;
    refreshCanvas();
    refreshPanel();
    saveToUndoStack();
  }
});

const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
  ? 'http://localhost:3001/api' 
  : '/api';

// Validation utilities
const validators = {
  isEthAddress: (addr) => /^0x[a-fA-F0-9]{40}$/.test(addr),
  isNonEmpty: (str) => str && str.trim().length > 0,
  isPositiveNumber: (num) => !isNaN(num) && parseFloat(num) > 0,
  isNonNegativeNumber: (num) => !isNaN(num) && parseFloat(num) >= 0,
};

// Toast notification system
function showToast(message, type = 'info') {
  const existing = document.querySelector('.toast-container');
  if (existing) existing.remove();

  const container = document.createElement('div');
  container.className = 'toast-container';
  container.style.cssText = 'position:fixed;top:80px;right:20px;z-index:9999;display:flex;flex-direction:column;gap:8px;';

  const toast = document.createElement('div');
  const colors = { info: '#06b6d4', success: '#22c55e', error: '#ef4444', warning: '#f59e0b' };
  toast.style.cssText = `padding:12px 20px;border-radius:8px;background:${colors[type] || colors.info};color:#fff;font-size:.85rem;font-weight:500;animation:slideIn .3s ease;max-width:320px;box-shadow:0 4px 20px rgba(0,0,0,.3);`;
  toast.textContent = message;

  container.appendChild(toast);
  document.body.appendChild(container);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100px)';
    toast.style.transition = 'all .3s ease';
    setTimeout(() => container.remove(), 300);
  }, 3000);
}

// Add toast animation to style
const toastStyle = document.createElement('style');
toastStyle.textContent = `
  @keyframes slideIn { from { opacity:0; transform:translateX(100px); } to { opacity:1; transform:translateX(0); } }
`;
document.head.appendChild(toastStyle);

// Enhanced save with validation
window.saveProject = async function() {
  if (droppedComponents.length === 0) {
    showToast('Add at least one component before saving', 'warning');
    return;
  }

  if (!validators.isNonEmpty(projectName)) {
    showToast('Project name cannot be empty', 'error');
    return;
  }

  try {
    const res = await fetch(`${API_URL}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: projectId, name: projectName, components: droppedComponents })
    });
    if (res.ok) {
      showToast('Project saved successfully!', 'success');
    } else {
      const err = await res.json();
      showToast('Error saving: ' + (err.error || 'Unknown error'), 'error');
    }
  } catch(e) {
    console.error(e);
    showToast('Failed to connect to server. Is the backend running?', 'error');
  }
};

// Enhanced compile with validation
window.compileContract = async function() {
  const code = generateCode(droppedComponents, projectName);
  if (!code.sol) {
    showToast('No smart contracts to compile. Add NFT or Staking components.', 'info');
    return;
  }

  const statusEl = document.getElementById('compileStatus');
  if (statusEl) statusEl.innerText = "Compiling on backend...";
  
  try {
    const res = await fetch(`${API_URL}/compile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sourceCode: code.sol, contractName: projectName.replace(/\s/g,'') + 'NFT' })
    });
    const data = await res.json();
    if(data.error || data.errors) throw new Error(data.error || 'Compilation errors');
    window.compiledData = data;
    if (statusEl) statusEl.innerText = "✅ Compilation successful! Ready to deploy.";
    showToast('Contract compiled successfully!', 'success');
  } catch(e) {
    if (statusEl) statusEl.innerText = "❌ Compilation failed: " + e.message;
    showToast('Compilation failed: ' + e.message, 'error');
  }
};

// Enhanced deploy with validation
window.deployToEVM = async function() {
  if (!window.compiledData) {
    showToast('Please compile the contract first!', 'warning');
    return;
  }
  if (!window.ethereum) {
    showToast('Please install MetaMask!', 'error');
    return;
  }
  
  const statusEl = document.getElementById('evmStatus');
  if (statusEl) statusEl.innerText = "Requesting MetaMask approval...";
  
  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    
    // Check network is Auto EVM Chronos (490000)
    const network = await provider.getNetwork();
    if (network.chainId !== 490000) {
      showToast('Please switch to Auto EVM Testnet (Chain ID: 490000)', 'warning');
      if (statusEl) statusEl.innerText = "";
      return;
    }

    if (statusEl) statusEl.innerText = "Deploying transaction...";
    
    const factory = new ethers.ContractFactory(window.compiledData.abi, window.compiledData.bytecode, signer);
    const contract = await factory.deploy();
    
    if (statusEl) statusEl.innerText = "Waiting for confirmation...";
    await contract.deployTransaction.wait();
    
    if (statusEl) statusEl.innerHTML = `✅ Deployed! <br/>Address: <b>${contract.address}</b>`;
    showToast('Contract deployed successfully!', 'success');
  } catch(e) {
    console.error(e);
    if (statusEl) statusEl.innerText = "❌ Deployment failed: " + e.message;
    showToast('Deployment failed: ' + e.message, 'error');
  }
};

// Enhanced DSN upload with validation
window.publishToDSN = async function() {
  const code = generateCode(droppedComponents, projectName);
  if (droppedComponents.length === 0) {
    showToast('Add components before deploying', 'warning');
    return;
  }

  const statusEl = document.getElementById('dsnStatus');
  if (statusEl) statusEl.innerText = "Uploading to Autonomys DSN...";
  
  try {
    const res = await fetch(`${API_URL}/deploy-dsn`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ html: code.html, js: code.js })
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error);
    if (statusEl) statusEl.innerHTML = `✅ Uploaded! <br/><a href="${data.url}" target="_blank" style="color:var(--accent-4)">View Live</a>`;
    showToast('Published to DSN successfully!', 'success');
  } catch(e) {
    console.error(e);
    if (statusEl) statusEl.innerText = "❌ Upload failed: " + e.message;
    showToast('DSN upload failed: ' + e.message, 'error');
  }
};

export function renderBuilder(app, templateId) {
  if (templateId && templateId !== 'blank') loadTemplate(templateId);
  else loadProject();
  app.innerHTML = buildLayout();
  bindEvents();
  refreshCanvas();
  refreshPanel();
}

function buildLayout() {
  return `<div class="builder" id="builderRoot">
    <header class="builder-header">
      <div class="logo" style="cursor:pointer" onclick="navigateTo('landing')">
        <div class="logo-icon">A</div><span>AutoBuild</span>
      </div>
      <div class="header-center">
        <input class="project-name" id="projectName" value="${projectName}" />
        <div class="view-tabs">
          <button class="view-tab ${currentView==='design'?'active':''}" data-view="design">Design</button>
          <button class="view-tab ${currentView==='code'?'active':''}" data-view="code">Code</button>
          <button class="view-tab ${currentView==='deploy'?'active':''}" data-view="deploy">Deploy</button>
        </div>
      </div>
      <div class="header-right">
        <button class="btn btn-secondary btn-sm" id="undoBtn" onclick="undo()" title="Undo (Ctrl+Z)" disabled>↩ Undo</button>
        <button class="btn btn-secondary btn-sm" id="redoBtn" onclick="redo()" title="Redo (Ctrl+Y)" disabled>↪ Redo</button>
        <button class="btn btn-secondary btn-sm" onclick="saveProject()">💾 Save</button>
        <button class="btn btn-secondary btn-sm" onclick="previewProject()" title="Preview dApp">👁 Preview</button>
        <button class="btn btn-wallet-sm" id="walletBtn" onclick="connectBuilderWallet()">👛 Connect</button>
        <div class="network-badge"><span class="dot"></span> Auto EVM Testnet</div>
        <button class="btn btn-primary btn-sm" id="deployBtn">🚀 Deploy</button>
      </div>
    </header>
    <aside class="builder-sidebar">${buildSidebar()}</aside>
    <main class="builder-canvas" id="canvasMain">${buildCanvas()}</main>
    <aside class="builder-panel" id="propsPanel">${buildPanel()}</aside>
  </div>`;
}

function buildSidebar() {
  return `<div class="sidebar-tabs">
    <button class="sidebar-tab active" data-stab="components">Components</button>
    <button class="sidebar-tab" data-stab="layers">Layers</button>
  </div>
  <div class="sidebar-content" id="sidebarContent">
    ${componentCategories.map(cat => `
      <div class="sidebar-section">
        <div class="sidebar-section-title">${cat.title}</div>
        ${cat.items.map(item => `
          <div class="component-item" draggable="true" data-type="${item.type}">
            <div class="component-icon ${item.cls}">${item.icon}</div>
            <div><div class="component-name">${item.name}</div><div class="component-desc">${item.desc}</div></div>
          </div>
        `).join('')}
      </div>
    `).join('')}
  </div>`;
}

function buildCanvas() {
  if (currentView === 'code') return buildCodeView();
  if (currentView === 'deploy') return buildDeployView();
  return `<div class="canvas-area" id="canvasArea">
    ${droppedComponents.length === 0 ? '<div class="canvas-empty"><div class="icon float-anim">🧩</div><p>Drag components here</p><span>Build your dApp visually</span></div>' : ''}
    <div id="droppedList">${renderDropped()}</div>
  </div>`;
}

function renderDropped() {
  return droppedComponents.map((c, i) => {
    const def = getComponentDef(c.type);
    if (!def) return '';
    return `<div class="dropped-component ${selectedId===c.id?'selected':''}" data-id="${c.id}" data-idx="${i}">
      <div class="comp-label">${def.name}</div>
      <div class="comp-actions">
        <button class="move-btn" data-dir="up" data-id="${c.id}" title="Move up">↑</button>
        <button class="move-btn" data-dir="down" data-id="${c.id}" title="Move down">↓</button>
        <button class="dup-btn" data-id="${c.id}" title="Duplicate">⧉</button>
        <button class="delete-btn" data-id="${c.id}" title="Delete">✕</button>
      </div>
      ${def.render(c.props)}
    </div>`;
  }).join('');
}

function buildPanel() {
  if (!selectedId) return `<div class="panel-header">Properties</div><div class="panel-content"><div class="panel-empty"><div class="icon">⚙️</div><p>Select a component</p><span style="font-size:.85rem">Click on any component in the canvas to edit its properties</span></div></div>`;
  const comp = droppedComponents.find(c => c.id === selectedId);
  if (!comp) return '';
  const def = getComponentDef(comp.type);
  const propsConfig = getPropsConfig(comp.type);
  let fields = '';
  if (propsConfig.length > 0) {
    fields = `<div class="prop-group"><div class="prop-group-title">Properties</div>${propsConfig.map(p => {
      if (p.type === 'textarea') return `<div class="prop-field"><label>${p.label}</label><textarea data-key="${p.key}">${comp.props[p.key]||''}</textarea></div>`;
      if (p.type === 'select') return `<div class="prop-field"><label>${p.label}</label><select data-key="${p.key}">${p.options.map(o=>`<option value="${o}" ${comp.props[p.key]===o?'selected':''}>${o}</option>`).join('')}</select></div>`;
      return `<div class="prop-field"><label>${p.label}</label><input data-key="${p.key}" value="${comp.props[p.key]||''}"/></div>`;
    }).join('')}</div>`;
  }
  return `<div class="panel-header">${def?.name||comp.type} <span style="font-size:.75rem;color:var(--text-muted)">#${comp.id.slice(0,6)}</span></div>
    <div class="panel-content">
      <div class="prop-group"><div class="prop-group-title">Component</div>
        <div class="prop-field"><label>Type</label><input value="${comp.type}" disabled/></div>
      </div>${fields}
    </div>`;
}

function buildCodeView() {
  const code = generateCode(droppedComponents, projectName);
  return `<div class="code-view">
    <div style="display:flex;justify-content:flex-end;margin-bottom:16px"><button class="btn-download btn" onclick="downloadAll()">📥 Download All Files</button></div>
    <div class="code-block" style="margin-bottom:20px"><div class="code-block-header"><span>index.html</span><button class="btn btn-secondary btn-sm" onclick="copyCode('html')">Copy</button></div><pre id="codeHTML">${escapeHtml(code.html)}</pre></div>
    <div class="code-block" style="margin-bottom:20px"><div class="code-block-header"><span>app.js</span><button class="btn btn-secondary btn-sm" onclick="copyCode('js')">Copy</button></div><pre id="codeJS">${escapeHtml(code.js)}</pre></div>
    ${code.sol ? `<div class="code-block"><div class="code-block-header"><span>Contract.sol</span><button class="btn btn-secondary btn-sm" onclick="copyCode('sol')">Copy</button></div><pre id="codeSol">${escapeHtml(code.sol)}</pre></div>` : ''}
  </div>`;
}

function buildDeployView() {
  const hasContracts = generateCode(droppedComponents, projectName).sol !== null;
  return `<div class="deploy-view">
    <div class="deploy-card" style="max-width:800px;text-align:left">
      <h2 style="text-align:center">🚀 Deploy to Autonomys</h2>
      <p style="text-align:center">Deploy your dApp to the Auto EVM network and host your frontend on the Distributed Storage Network (DSN).</p>
      
      <div class="deploy-steps">
        <div class="deploy-step">
          <div class="step-num">1</div>
          <div class="step-info" style="flex:1">
            <h4>Compile Smart Contracts</h4>
            <p>Compile your auto-generated Solidity code to ABI and Bytecode via our backend.</p>
            ${hasContracts ? `<button class="btn btn-secondary btn-sm" style="margin-top:10px" onclick="compileContract()">⚙️ Compile Now</button>` : `<p style="color:var(--text-muted);font-size:0.8rem;margin-top:5px">No smart contracts needed for current components.</p>`}
            <div id="compileStatus" style="font-size:0.8rem;color:var(--accent-2);margin-top:5px"></div>
          </div>
        </div>

        <div class="deploy-step">
          <div class="step-num">2</div>
          <div class="step-info" style="flex:1">
            <h4>Deploy to Auto EVM (Chain ID 490000)</h4>
            <p>Deploy the compiled bytecode to the Autonomys Execution Domain using your browser wallet.</p>
            ${hasContracts ? `<button class="btn btn-secondary btn-sm" style="margin-top:10px" onclick="deployToEVM()">⛓️ Deploy Contract</button>` : `<p style="color:var(--text-muted);font-size:0.8rem;margin-top:5px">Skip this step.</p>`}
            <div id="evmStatus" style="font-size:0.8rem;color:var(--accent-2);margin-top:5px"></div>
          </div>
        </div>

        <div class="deploy-step">
          <div class="step-num">3</div>
          <div class="step-info" style="flex:1">
            <h4>Publish Frontend to DSN</h4>
            <p>Upload your static HTML/JS files permanently to Autonomys Auto-Drive.</p>
            <button class="btn btn-primary btn-sm" style="margin-top:10px" onclick="publishToDSN()">💾 Upload to DSN</button>
            <div id="dsnStatus" style="font-size:0.8rem;color:var(--accent-2);margin-top:5px"></div>
          </div>
        </div>
      </div>
    </div>
  </div>`;
}

function escapeHtml(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

window.copyCode = function(type) {
  const code = generateCode(droppedComponents, projectName);
  const text = type === 'html' ? code.html : type === 'js' ? code.js : code.sol;
  navigator.clipboard.writeText(text).then(() => alert('Copied!')).catch(() => {});
};

window.downloadAll = function() {
  const code = generateCode(droppedComponents, projectName);
  const files = [
    { name: 'index.html', content: code.html },
    { name: 'app.js', content: code.js },
  ];
  if (code.sol) files.push({ name: 'Contract.sol', content: code.sol });
  files.forEach(f => {
    const blob = new Blob([f.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = f.name; a.click();
    URL.revokeObjectURL(url);
  });
};

let nextId = 1;
function addComponent(type, props) {
  droppedComponents.push({ id: 'c' + (nextId++), type, props: props || getDefaultProps(type) });
  saveToUndoStack();
}

async function loadProject() {
  try {
    const res = await fetch(`${API_URL}/projects/${projectId}`);
    if(res.ok) {
      const data = await res.json();
      projectName = data.name;
      droppedComponents = data.components;
      refreshCanvas();
    }
  } catch(e) { console.log("No saved project found, starting fresh."); }
}

// Global scope deployment variables
window.compiledData = null;

// Builder wallet connection
// Auto EVM Testnet network params
const AUTO_EVM_CHAIN_ID = 490000;
const AUTO_EVM_CHAIN_HEX = '0x' + AUTO_EVM_CHAIN_ID.toString(16); // 0x77a40
const AUTO_EVM_PARAMS = {
  chainId: AUTO_EVM_CHAIN_HEX,
  chainName: 'Autonomys Auto EVM Testnet',
  nativeCurrency: { name: 'TAU', symbol: 'TAU', decimals: 18 },
  rpcUrls: ['https://auto-evm.taurus.autonomys.xyz/ws'],
  blockExplorerUrls: ['https://blockscout.taurus.autonomys.xyz/']
};

async function ensureAutoEvmNetwork() {
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: AUTO_EVM_CHAIN_HEX }]
    });
  } catch (switchError) {
    // 4902 = chain not added yet
    if (switchError && (switchError.code === 4902 || switchError.code === -32603)) {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [AUTO_EVM_PARAMS]
      });
    } else {
      throw switchError;
    }
  }
}

window.connectBuilderWallet = async function() {
  if (!window.ethereum) {
    showToast('Please install MetaMask!', 'error');
    return;
  }
  if (typeof ethers === 'undefined') {
    showToast('ethers.js failed to load. Check your internet connection and reload.', 'error');
    console.error('ethers is not defined - CDN script failed to load.');
    return;
  }

  try {
    // Request accounts BEFORE constructing the provider, and pass "any"
    // so ethers tolerates MetaMask switching networks under us.
    await window.ethereum.request({ method: 'eth_requestAccounts' });

    // Make sure MetaMask is on Auto EVM before we lock the provider in.
    await ensureAutoEvmNetwork();

    const provider = new ethers.providers.Web3Provider(window.ethereum, 'any');
    const signer = provider.getSigner();
    const account = await signer.getAddress();

    const walletBtn = document.getElementById('walletBtn');
    if (walletBtn) {
      walletBtn.textContent = '👛 ' + account.slice(0, 6) + '...';
      walletBtn.style.background = 'rgba(34, 197, 94, 0.2)';
      walletBtn.style.borderColor = 'rgba(34, 197, 94, 0.5)';
    }

    showToast('Wallet connected: ' + account.slice(0, 6) + '...' + account.slice(-4), 'success');

    const network = await provider.getNetwork();
    if (network.chainId !== AUTO_EVM_CHAIN_ID) {
      showToast('Connected, but not on Auto EVM (chain ' + network.chainId + ')', 'warning');
    }
  } catch (error) {
    console.error('Wallet connection failed:', error);
    const msg = error?.data?.message || error?.message || String(error);
    showToast('Failed to connect wallet: ' + msg, 'error');
  }
};

window.previewProject = function() {
  const code = generateCode(droppedComponents, projectName);
  const previewWindow = window.open('', '_blank', 'width=1024,height=768');
  if (previewWindow) {
    // Create a blob URL for the preview
    const blob = new Blob([code.html + '<script>' + code.js + '<\/script>'], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    previewWindow.location.href = url;
  } else {
    alert('Please allow popups to preview your dApp');
  }
};

window.exportAsZIP = async function() {
  const code = generateCode(droppedComponents, projectName);
  // Simple ZIP implementation (minimal, no external dependency)
  const files = [
    { name: 'index.html', content: code.html },
    { name: 'app.js', content: code.js },
    { name: 'README.md', content: `# ${projectName}\n\nGenerated by AutoBuild for Autonomys Network.\n\n## How to use\n1. Open index.html in a browser\n2. Connect your MetaMask wallet\n3. Switch to Auto EVM Testnet (Chain ID: 490000)\n\n## Features\n- Built with AutoBuild Low-Code Platform\n- Powered by Autonomys Network\n` },
  ];
  if (code.sol) files.push({ name: 'Contract.sol', content: code.sol });

  // Download each file (simple approach without ZIP library)
  files.forEach(f => {
    const blob = new Blob([f.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${projectName.replace(/\s/g, '_')}_${f.name}`;
    a.click();
    URL.revokeObjectURL(url);
  });
};

function loadTemplate(id) {
  droppedComponents = [];
  nextId = 1;
  const presets = {
    'defi': ['heading','wallet-connect','token-balance','tx-form','staking'],
    'nft': ['heading','wallet-connect','nft-mint','dsn-upload','dsn-viewer'],
    'dao': ['heading','wallet-connect','card','button','token-balance'],
    'ai-agent': ['heading','wallet-connect','ai-agent','ai-chat','token-balance'],
    'storage': ['heading','wallet-connect','dsn-upload','dsn-viewer','card'],
  };
  const types = presets[id] || [];
  types.forEach(t => addComponent(t));
  const tpl = getTemplates().find(t => t.id === id);
  if (tpl) projectName = tpl.name;
}

function refreshCanvas() {
  const main = document.getElementById('canvasMain');
  if (main) main.innerHTML = buildCanvas();
  bindCanvasEvents();
}

function refreshPanel() {
  const panel = document.getElementById('propsPanel');
  if (panel) panel.innerHTML = buildPanel();
  bindPanelEvents();
}

function bindEvents() {
  // Drag from sidebar
  document.querySelectorAll('.component-item[draggable]').forEach(el => {
    el.addEventListener('dragstart', e => {
      e.dataTransfer.setData('componentType', el.dataset.type);
      el.style.opacity = '0.5';
    });
    el.addEventListener('dragend', () => el.style.opacity = '1');
    // Click to add
    el.addEventListener('click', () => {
      addComponent(el.dataset.type);
      selectedId = droppedComponents[droppedComponents.length - 1].id;
      refreshCanvas();
      refreshPanel();
    });
  });

  // View tabs
  document.querySelectorAll('.view-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      currentView = btn.dataset.view;
      document.querySelectorAll('.view-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      refreshCanvas();
    });
  });

  // Sidebar tabs
  document.querySelectorAll('.sidebar-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.sidebar-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const content = document.getElementById('sidebarContent');
      if (btn.dataset.stab === 'layers') {
        content.innerHTML = droppedComponents.length === 0
          ? '<div style="padding:20px;text-align:center;color:var(--text-muted)">No components yet</div>'
          : droppedComponents.map(c => {
              const def = getComponentDef(c.type);
              return `<div class="component-item" style="cursor:pointer" onclick="document.querySelector('[data-id=${c.id}]')?.click()">
                <div class="component-icon ${def?.cls||'ui'}">${def?.icon||'?'}</div>
                <div><div class="component-name">${def?.name||c.type}</div></div>
              </div>`;
            }).join('');
      } else {
        const sidebar = document.querySelector('.builder-sidebar');
        sidebar.innerHTML = buildSidebar();
        bindEvents();
      }
    });
  });

  // Project name
  const pn = document.getElementById('projectName');
  if (pn) pn.addEventListener('change', e => { projectName = e.target.value; });

  // Deploy button
  const db = document.getElementById('deployBtn');
  if (db) db.addEventListener('click', () => {
    currentView = 'deploy';
    document.querySelectorAll('.view-tab').forEach(b => b.classList.remove('active'));
    document.querySelector('[data-view="deploy"]')?.classList.add('active');
    refreshCanvas();
  });

  bindCanvasEvents();
}

function bindCanvasEvents() {
  const area = document.getElementById('canvasArea');
  if (!area) return;

  area.addEventListener('dragover', e => { e.preventDefault(); area.classList.add('drag-over'); });
  area.addEventListener('dragleave', () => area.classList.remove('drag-over'));
  area.addEventListener('drop', e => {
    e.preventDefault();
    area.classList.remove('drag-over');
    const type = e.dataTransfer.getData('componentType');
    if (type) {
      addComponent(type);
      selectedId = droppedComponents[droppedComponents.length - 1].id;
      refreshCanvas();
      refreshPanel();
    }
  });

  // Select component
  document.querySelectorAll('.dropped-component').forEach(el => {
    el.addEventListener('click', e => {
      if (e.target.closest('.comp-actions')) return;
      selectedId = el.dataset.id;
      document.querySelectorAll('.dropped-component').forEach(d => d.classList.remove('selected'));
      el.classList.add('selected');
      refreshPanel();
    });
  });

  // Delete
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      droppedComponents = droppedComponents.filter(c => c.id !== id);
      if (selectedId === id) selectedId = null;
      refreshCanvas();
      refreshPanel();
      saveToUndoStack();
    });
  });

  // Duplicate
  document.querySelectorAll('.dup-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const src = droppedComponents.find(c => c.id === btn.dataset.id);
      if (src) {
        addComponent(src.type, { ...src.props });
        saveToUndoStack();
      }
    });
  });

  // Move
  document.querySelectorAll('.move-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = droppedComponents.findIndex(c => c.id === btn.dataset.id);
      if (idx < 0) return;
      const dir = btn.dataset.dir;
      if (dir === 'up' && idx > 0) {
        [droppedComponents[idx], droppedComponents[idx-1]] = [droppedComponents[idx-1], droppedComponents[idx]];
        refreshCanvas();
        saveToUndoStack();
      }
      if (dir === 'down' && idx < droppedComponents.length-1) {
        [droppedComponents[idx], droppedComponents[idx+1]] = [droppedComponents[idx+1], droppedComponents[idx]];
        refreshCanvas();
        saveToUndoStack();
      }
    });
  });
}

function bindPanelEvents() {
  document.querySelectorAll('.panel-content input:not([disabled]), .panel-content textarea, .panel-content select').forEach(el => {
    const handler = () => {
      const comp = droppedComponents.find(c => c.id === selectedId);
      if (comp && el.dataset.key) {
        comp.props[el.dataset.key] = el.value;
        refreshCanvas();
        saveToUndoStack();
      }
    };
    el.addEventListener('input', handler);
    el.addEventListener('change', handler);
  });
}
