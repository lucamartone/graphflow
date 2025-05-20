let cy;
//inizializzazione del grafo con cytoscape, definendo gli stili di nodi e archi

export function initGraph(containerId="graph-container") {
    cy = cytoscape({
        container: document.getElementById(containerId),
        elements: [],
        style: [
            {
            selector: 'node',
            style: {
                'width': 40,
                'height': 40,
                'background-color': '#ff6b6b',
                'label': 'data(label)',
                'color': '#f5f6fa',
                'font-size': '16px',
                'text-valign': 'center',
                'text-halign': 'center',
                'text-outline-color': '#2d3436',
                'text-outline-width': 2
            }
            },
            {
            selector: 'edge',
            style: {
                'width': 3,
                'line-color': '#4ecdc4',
                'target-arrow-color': '#4ecdc4',
                'target-arrow-shape': 'triangle',
                'curve-style': 'bezier',
                'label': 'data(weight)',
                'text-rotation': 'autorotate',
                'text-margin-y': -10,
                'color': '#4ecdc4',
                'font-size': '16px',
                'text-outline-color': '#2d3436',
                'text-outline-width': 2,
                'text-outline-opacity': 0.8
            }
            },
            
            {
                selector: '.path-edge',
                style: {
                  'line-color': '#FF4136', // rosso brillante
                  'width': 4,
                  'target-arrow-color': '#FF4136',
                  'target-arrow-shape': 'triangle'
                }
              },   
              {
                selector: '.candidate-edge', //per nodi candidati in Prim
                style: {
                  'line-color': '#FFD700', 
                  'width': 3,
                  'target-arrow-color': '#FFD700',
                  'target-arrow-shape': 'triangle'
                }
              },           
            {
            selector: '.visited',
            style: {
                'line-color': '#ffe66d',
                'target-arrow-color': '#ffe66d'
            }
            },
            {
            selector: '.active',
            style: {
                'background-color': '#4ecdc4',
                'line-color': '#e1ff00',
                'target-arrow-color': '#e1ff00'
            }
            },
            {
            selector: '.exploring',
            style: {
                'background-color': 'yellow',
                'line-color': '#e1ff00',
                'target-arrow-color': '#e1ff00'
            }
            },
            {
            selector: 'node.visited',
            style: {
                'background-color': 'blue',
                'border-color': 'red',
                'border-width': 3
            }
            },
            {
            selector: '.undirected',
            style: {
                'target-arrow-shape': 'none'
            }
            }
        ],
        layout: {
            name: 'preset',
            animate: true,
            animationDuration: 700,
            animationEasing: 'ease-in-out'
        },
        wheelSensitivity: 0.2,
        minZoom: 0.3,
        maxZoom: 5
    });
    // Abilita interazione utente
    cy.userZoomingEnabled(true);
    cy.userPanningEnabled(true);
    cy.autoungrabify(false);
}

//funzione principale per ottenere l'istanza cy
export function getCy() {
    if (!cy) {
        throw new Error("Cytoscape instance not initialized. Call initGraph() first.");
      }
    return cy;
  }