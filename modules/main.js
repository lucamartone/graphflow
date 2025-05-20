import { initGraph } from './graph.js';
import { setupPropertiesPanel, listenerRandomGraph ,setupEventInteractions,setupSwitchDirUndir} from './eventInterazione.js';
import { setupZoom } from './zoom.js';
import { setupAlgorithms } from './eventInterazione.js';
import { setupAuth } from './auth.js';
import { initResponsiveMenu } from './responsive.js';
import { initWelcomeModal } from './welcome.js';

document.addEventListener('DOMContentLoaded', () => {
  initGraph();
  setupEventInteractions();
  setupPropertiesPanel();
  listenerRandomGraph();
  setupZoom();
  setupAlgorithms();
  setupAuth();
  initResponsiveMenu();
  initWelcomeModal();
  setupSwitchDirUndir();
});
