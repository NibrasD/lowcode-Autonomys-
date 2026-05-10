const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const solc = require('solc');
const { createAutoDriveApi } = require('@autonomys/auto-drive');
const path = require('path');
const fs = require('fs');

// Load .env from server/ first, then fall back to project root
const serverEnv = path.join(__dirname, '.env');
const rootEnv = path.join(__dirname, '..', '.env');
require('dotenv').config({ path: fs.existsSync(serverEnv) ? serverEnv : rootEnv });
console.log('AUTO_DRIVE_API_KEY loaded:', process.env.AUTO_DRIVE_API_KEY ? 'YES' : 'NO');

const app = express();
app.use(cors());
app.use(express.json());

// Serve static frontend files if they exist (for production deployment like Render)
const distPath = path.join(__dirname, '..', 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
}

// Initialize Database
const db = new sqlite3.Database('./autobuild.db', (err) => {
  if (err) console.error('Database opening error: ', err);
});

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    components TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
});

// API: Save Project
app.post('/api/projects', (req, res) => {
  const { id, name, components } = req.body;
  if (!id || !name || !components) return res.status(400).json({ error: 'Missing data' });
  
  db.get(`SELECT id FROM projects WHERE id = ?`, [id], (err, row) => {
    if (row) {
      db.run(`UPDATE projects SET name = ?, components = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, 
        [name, JSON.stringify(components), id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, message: 'Project updated' });
      });
    } else {
      db.run(`INSERT INTO projects (id, name, components) VALUES (?, ?, ?)`, 
        [id, name, JSON.stringify(components)], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, message: 'Project created' });
      });
    }
  });
});

// API: Load Project
app.get('/api/projects/:id', (req, res) => {
  db.get(`SELECT * FROM projects WHERE id = ?`, [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Project not found' });
    res.json({ ...row, components: JSON.parse(row.components) });
  });
});

// API: Compile Solidity
app.post('/api/compile', (req, res) => {
  const { sourceCode, contractName } = req.body;
  if (!sourceCode) return res.status(400).json({ error: 'Source code is required' });

  const input = {
    language: 'Solidity',
    sources: {
      'Contract.sol': { content: sourceCode }
    },
    settings: {
      outputSelection: {
        '*': { '*': ['*'] }
      }
    }
  };

  try {
    const output = JSON.parse(solc.compile(JSON.stringify(input)));
    if (output.errors) {
      const isFatal = output.errors.some(e => e.severity === 'error');
      if (isFatal) return res.status(400).json({ errors: output.errors });
    }
    const contract = output.contracts['Contract.sol'][contractName || Object.keys(output.contracts['Contract.sol'])[0]];
    res.json({
      abi: contract.abi,
      bytecode: contract.evm.bytecode.object
    });
  } catch (error) {
    res.status(500).json({ error: 'Compilation failed' });
  }
});

// API: Upload to Autonomys DSN
app.post('/api/deploy-dsn', async (req, res) => {
  const { html, js } = req.body;
  if (!html || !js) return res.status(400).json({ error: 'HTML and JS contents required' });

  if (!process.env.AUTO_DRIVE_API_KEY) {
    console.error('AUTO_DRIVE_API_KEY missing – cannot upload to DSN');
    return res.status(500).json({ error: 'Missing AUTO_DRIVE_API_KEY' });
  }

  try {
    // createAutoDriveApi correctly chains createApiRequestHandler + createApiInterface
    const api = createAutoDriveApi({
      apiKey: process.env.AUTO_DRIVE_API_KEY,
      network: 'mainnet'
    });

    // Upload JS buffer — returns a CID object, convert to string
    const jsBuffer = Buffer.from(js, 'utf-8');
    const jsCidObj = await api.uploadFileFromBuffer(jsBuffer, 'app.js');
    const jsCid = typeof jsCidObj === 'string' ? jsCidObj : jsCidObj?.toString();
    console.log('JS uploaded, CID:', jsCid);

    // Insert CID into HTML and upload HTML buffer
    const finalHtml = html.replace('src="app.js"', `src="https://mainnet.auto-drive.autonomys.xyz/api/objects/${jsCid}/download"`);
    const htmlBuffer = Buffer.from(finalHtml, 'utf-8');
    const htmlCidObj = await api.uploadFileFromBuffer(htmlBuffer, 'index.html');
    const htmlCid = typeof htmlCidObj === 'string' ? htmlCidObj : htmlCidObj?.toString();
    console.log('HTML uploaded, CID:', htmlCid);

    res.json({
      success: true,
      htmlCid,
      jsCid,
      url: `https://mainnet.auto-drive.autonomys.xyz/api/objects/${htmlCid}/download`
    });
  } catch (error) {
    console.error('DSN upload error:', error);
    res.status(500).json({ error: 'DSN Upload failed: ' + error.message });
  }
});

// Catch-all route to serve frontend for SPA routing
if (fs.existsSync(distPath)) {
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log('Backend server running on http://localhost:' + PORT);
});
