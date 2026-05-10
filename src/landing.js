export function renderLanding(app) {
  const showTutorial = !localStorage.getItem('autobuild_tutorial_seen');
  
  app.innerHTML = `
  <div class="landing">
    <div class="landing-bg"></div>
    <div class="landing-orb orb1"></div>
    <div class="landing-orb orb2"></div>
    <div class="landing-orb orb3"></div>
    <header class="landing-header">
      <div class="logo">
        <div class="logo-icon">A</div>
        <span>AutoBuild</span>
      </div>
      <nav class="landing-nav">
        <a href="#features">Features</a>
        <a href="#templates">Templates</a>
        <a href="#how-it-works">How It Works</a>
        <a href="https://docs.autonomys.xyz" target="_blank">Docs</a>
        <button class="btn btn-primary btn-sm" onclick="navigateTo('builder')">Launch Builder</button>
      </nav>
    </header>

    <section class="hero">
      <div class="hero-badge">⚡ Powered by Autonomys Network</div>
      <h1>Build dApps on <span class="gradient">Autonomys</span> Without Code</h1>
      <p>The visual low-code platform that empowers anyone to create, deploy, and manage decentralized applications on the Autonomys blockchain — no programming required.</p>
      <div class="hero-actions">
        <button class="btn btn-primary" onclick="navigateTo('builder')">🚀 Start Building</button>
        <button class="btn btn-secondary" onclick="document.getElementById('how-it-works').scrollIntoView({behavior:'smooth'})">How It Works</button>
      </div>
    </section>

    <section class="stats-section">
      <div class="stats-grid">
        <div class="stat-item"><div class="stat-value">17+</div><div class="stat-label">Components</div></div>
        <div class="stat-item"><div class="stat-value">6</div><div class="stat-label">Templates</div></div>
        <div class="stat-item"><div class="stat-value">EVM</div><div class="stat-label">Compatible</div></div>
        <div class="stat-item"><div class="stat-value">AI3</div><div class="stat-label">Native Token</div></div>
      </div>
    </section>

    <section class="how-it-works" id="how-it-works">
      <h2>How It <span class="gradient">Works</span></h2>
      <div class="steps-grid">
        <div class="step-card">
          <div class="step-number">1</div>
          <div class="step-icon">🎨</div>
          <h3>Choose a Template</h3>
          <p>Start with a pre-built template or blank canvas</p>
        </div>
        <div class="step-card">
          <div class="step-number">2</div>
          <div class="step-icon">🧩</div>
          <h3>Drag & Drop</h3>
          <p>Add components from the sidebar to build your UI</p>
        </div>
        <div class="step-card">
          <div class="step-number">3</div>
          <div class="step-icon">⚙️</div>
          <h3>Configure</h3>
          <p>Customize properties in the right panel</p>
        </div>
        <div class="step-card">
          <div class="step-number">4</div>
          <div class="step-icon">🚀</div>
          <h3>Deploy</h3>
          <p>Publish to Autonomys with one click</p>
        </div>
      </div>
    </section>

    <section class="features" id="features">
      <h2>Why <span class="gradient">AutoBuild</span>?</h2>
      <div class="features-grid">
        ${getFeatures().map(f => `
          <div class="feature-card">
            <div class="feature-icon">${f.icon}</div>
            <h3>${f.title}</h3>
            <p>${f.desc}</p>
          </div>
        `).join('')}
      </div>
    </section>

    <section class="templates-section" id="templates">
      <h2>Start with a Template</h2>
      <p class="subtitle">Pre-built templates to kickstart your dApp development</p>
      <div class="templates-grid">
        ${getTemplates().map(t => `
          <div class="template-card" onclick="navigateTo('builder','${t.id}')">
            <div class="template-preview">${t.icon}</div>
            <div class="template-info">
              <h3>${t.name}</h3>
              <p>${t.desc}</p>
              <div class="template-tags">${t.tags.map(tg => `<span class="template-tag">${tg}</span>`).join('')}</div>
            </div>
          </div>
        `).join('')}
      </div>
    </section>

    <footer class="landing-footer">
      <p>AutoBuild — Low-Code dApp Builder for Autonomys Network · Built with ❤️ for Web3</p>
    </footer>
  </div>`;

  // Show onboarding tutorial for first-time users
  if (showTutorial) {
    setTimeout(() => showOnboarding(), 1000);
  }
}

function showOnboarding() {
  const overlay = document.createElement('div');
  overlay.className = 'tutorial-overlay';
  overlay.innerHTML = `
    <div class="tutorial-modal">
      <button class="tutorial-close" onclick="this.parentElement.parentElement.remove()">✕</button>
      <div class="tutorial-content">
        <div class="tutorial-step active" data-step="1">
          <div class="tutorial-icon">👋</div>
          <h2>Welcome to AutoBuild!</h2>
          <p>Build decentralized applications on Autonomys blockchain without writing any code.</p>
          <div class="tutorial-nav">
            <button class="btn btn-secondary" onclick="skipTutorial()">Skip</button>
            <button class="btn btn-primary" onclick="nextTutorialStep()">Next →</button>
          </div>
        </div>
        <div class="tutorial-step" data-step="2">
          <div class="tutorial-icon">🧩</div>
          <h2>Drag & Drop Components</h2>
          <p>Choose from 17+ pre-built components including UI elements, Web3 widgets, and AI agents.</p>
          <div class="tutorial-nav">
            <button class="btn btn-secondary" onclick="prevTutorialStep()">← Back</button>
            <button class="btn btn-primary" onclick="nextTutorialStep()">Next →</button>
          </div>
        </div>
        <div class="tutorial-step" data-step="3">
          <div class="tutorial-icon">⛓️</div>
          <h2>Native Autonomys Integration</h2>
          <p>Built-in support for Auto EVM, AI3 tokens, DSN storage, and Auto ID identity.</p>
          <div class="tutorial-nav">
            <button class="btn btn-secondary" onclick="prevTutorialStep()">← Back</button>
            <button class="btn btn-primary" onclick="nextTutorialStep()">Next →</button>
          </div>
        </div>
        <div class="tutorial-step" data-step="4">
          <div class="tutorial-icon">🚀</div>
          <h2>One-Click Deploy</h2>
          <p>Deploy your dApp to Auto EVM and host on DSN with a single click. No DevOps needed!</p>
          <div class="tutorial-nav">
            <button class="btn btn-secondary" onclick="prevTutorialStep()">← Back</button>
            <button class="btn btn-primary" onclick="finishTutorial()">Let's Build! 🎨</button>
          </div>
        </div>
      </div>
      <div class="tutorial-dots">
        <span class="dot active" data-step="1"></span>
        <span class="dot" data-step="2"></span>
        <span class="dot" data-step="3"></span>
        <span class="dot" data-step="4"></span>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
}

window.nextTutorialStep = function() {
  const current = document.querySelector('.tutorial-step.active');
  const currentNum = parseInt(current.dataset.step);
  if (currentNum < 4) {
    current.classList.remove('active');
    document.querySelector(`.tutorial-step[data-step="${currentNum + 1}"]`).classList.add('active');
    document.querySelectorAll('.tutorial-dots .dot').forEach(d => d.classList.remove('active'));
    document.querySelector(`.tutorial-dots .dot[data-step="${currentNum + 1}"]`).classList.add('active');
  }
};

window.prevTutorialStep = function() {
  const current = document.querySelector('.tutorial-step.active');
  const currentNum = parseInt(current.dataset.step);
  if (currentNum > 1) {
    current.classList.remove('active');
    document.querySelector(`.tutorial-step[data-step="${currentNum - 1}"]`).classList.add('active');
    document.querySelectorAll('.tutorial-dots .dot').forEach(d => d.classList.remove('active'));
    document.querySelector(`.tutorial-dots .dot[data-step="${currentNum - 1}"]`).classList.add('active');
  }
};

window.skipTutorial = function() {
  localStorage.setItem('autobuild_tutorial_seen', 'true');
  document.querySelector('.tutorial-overlay')?.remove();
};

window.finishTutorial = function() {
  localStorage.setItem('autobuild_tutorial_seen', 'true');
  document.querySelector('.tutorial-overlay')?.remove();
  navigateTo('builder');
};

function getFeatures() {
  return [
    { icon: '🧩', title: 'Drag & Drop Builder', desc: 'Visually compose your dApp with pre-built UI and Web3 components. Simply drag, drop, and configure.' },
    { icon: '⛓️', title: 'Native Autonomys Integration', desc: 'Built-in support for Auto EVM smart contracts, AI3 tokens, distributed storage (DSN), and Auto ID.' },
    { icon: '🤖', title: 'AI Agent Components', desc: 'Integrate autonomous AI agents powered by Autonomys Auto Agents framework directly into your dApp.' },
    { icon: '📦', title: 'Smart Contract Templates', desc: 'Deploy ERC-20 tokens, NFT collections, DAOs, and more with pre-audited Solidity templates.' },
    { icon: '💾', title: 'Permanent Storage', desc: 'Leverage Autonomys DSN for permanent, decentralized data storage with built-in upload components.' },
    { icon: '🚀', title: 'One-Click Deploy', desc: 'Deploy your dApp to Auto EVM (Chain ID 490000) with a single click. No DevOps knowledge needed.' },
  ];
}

export function getTemplates() {
  return [
    { id: 'defi', icon: '💰', name: 'DeFi Dashboard', desc: 'Token swaps, liquidity pools, and portfolio tracking on Autonomys.', tags: ['DeFi', 'Auto EVM', 'AI3'] },
    { id: 'nft', icon: '🖼️', name: 'NFT Marketplace', desc: 'Mint, list, and trade NFTs with permanent storage on DSN.', tags: ['NFT', 'Storage', 'Marketplace'] },
    { id: 'dao', icon: '🏛️', name: 'DAO Governance', desc: 'Create a DAO with proposals, voting, and treasury management.', tags: ['DAO', 'Governance', 'Voting'] },
    { id: 'ai-agent', icon: '🤖', name: 'AI Agent Hub', desc: 'Deploy and manage autonomous AI agents on-chain.', tags: ['AI', 'Auto Agents', 'Automation'] },
    { id: 'storage', icon: '💾', name: 'Data Vault', desc: 'Decentralized file storage and sharing powered by DSN.', tags: ['Storage', 'DSN', 'Files'] },
    { id: 'blank', icon: '✨', name: 'Blank Canvas', desc: 'Start from scratch and build your custom dApp.', tags: ['Custom', 'Flexible'] },
  ];
}
