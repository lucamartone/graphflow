import { getCy } from './graph.js';

// Function to get container center
export function getContainerCenter() {
    const cy = getCy();
    const container = cy.container();
    return {
      x: container.clientWidth / 2,
      y: container.clientHeight / 2
    };
  }

export function setupZoom(){
  const cy = getCy();
    // Zoom Controls
  const zoomInBtn = document.getElementById('zoomIn');
  const zoomOutBtn = document.getElementById('zoomOut');
  const resetZoomBtn = document.getElementById('resetZoom');

  // Enable zooming and panning
  cy.userZoomingEnabled(true);
  cy.userPanningEnabled(true);

  // Zoom in function with center focus
  zoomInBtn.addEventListener('click', function() {
    const currentZoom = cy.zoom();
    const newZoom = Math.min(currentZoom * 1.2, cy.maxZoom());
    const center = getContainerCenter();
    
    cy.animate({
      zoom: newZoom,
      pan: {
        x: center.x - (center.x - cy.pan().x) * (newZoom / currentZoom),
        y: center.y - (center.y - cy.pan().y) * (newZoom / currentZoom)
      },
      duration: 150,
      easing: 'ease-out'
    });
  });

  // Zoom out function with center focus
  zoomOutBtn.addEventListener('click', function() {
    const currentZoom = cy.zoom();
    const newZoom = Math.max(currentZoom / 1.2, cy.minZoom());
    const center = getContainerCenter();
    
    cy.animate({
      zoom: newZoom,
      pan: {
        x: center.x - (center.x - cy.pan().x) * (newZoom / currentZoom),
        y: center.y - (center.y - cy.pan().y) * (newZoom / currentZoom)
      },
      duration: 150,
      easing: 'ease-out'
    });
  });

  // Reset zoom and center with smooth animation
  resetZoomBtn.addEventListener('click', function() {
    const center = getContainerCenter();
    cy.animate({
      zoom: 1,
      pan: { x: 0, y: 0 },
      duration: 500,
      easing: 'ease-out'
    });
  });

  // Add mouse wheel zoom with center focus
  cy.on('mousewheel', function(event) {
    event.preventDefault();
    const currentZoom = cy.zoom();
    const factor = event.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.min(Math.max(currentZoom * factor, cy.minZoom()), cy.maxZoom());
    const center = getContainerCenter();
    
    cy.animate({
      zoom: newZoom,
      pan: {
        x: center.x - (center.x - cy.pan().x) * (newZoom / currentZoom),
        y: center.y - (center.y - cy.pan().y) * (newZoom / currentZoom)
      },
      duration: 200,
      easing: 'ease-out'
    });
  });

  // Add double click to reset zoom
  cy.on('dblclick', function() {
    cy.animate({
      zoom: 1,
      pan: { x: 0, y: 0 },
      duration: 500,
      easing: 'ease-out'
    });
  });

  // Add keyboard shortcuts for zoom
  document.addEventListener('keydown', function(event) {
    if (event.key === '+') {
      zoomInBtn.click();
    } else if (event.key === '-') {
      zoomOutBtn.click();
    } else if (event.key === '0') {
      resetZoomBtn.click();
    }
  });
}