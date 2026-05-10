import './style.css';
import { renderLanding } from './src/landing.js';
import { renderBuilder } from './src/builder.js';

const app = document.getElementById('app');
let currentView = 'landing';

window.navigateTo = function(view, templateId) {
  currentView = view;
  app.innerHTML = '';
  if (view === 'landing') renderLanding(app);
  else if (view === 'builder') renderBuilder(app, templateId);
};

renderLanding(app);
