import { getCy } from './graph.js';
import { Dijkstra } from './algorithms.js';



// Mostra la lista dei nodi raggiungibili e permette di evidenziare il cammino minimo
export async function runDijkstraWithUI(start) {
    const { distances, previous } = await Dijkstra(start);
    const cy = getCy();
  
  // Crea il pannello laterale
  let panel = document.getElementById('dijkstra-panel');
  document.getElementById('userIcon').classList.add('hidden');
  if (!panel) {
    
   
    panel = document.createElement('div');
    panel.id = 'dijkstra-panel';
    panel.style.position = 'fixed';
    panel.style.top = '0';
    panel.style.right = '0';
    panel.style.width = '250px';
    panel.style.height = '100%';
    panel.style.background = 'var(--bg-dark)';
    panel.style.borderLeft = '2px solid var(--red-color)';
    panel.style.padding = '16px';
    panel.style.boxShadow = 'var(--vintage-shadow)';
    panel.style.overflowY = 'auto';
    panel.style.zIndex = 1000;
    panel.style.fontFamily = "'VT323', monospace";
    document.body.appendChild(panel);
  }

  // Aggiungi intestazione e bottone di chiusura
  panel.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center;">
      <h3 style="margin: 0; color: var(--blue-color); text-shadow: var(--vintage-shadow); font-size: 1.5rem; border-bottom: 1px solid var(--blue-color); padding-bottom: 0.5rem;">Percorsi da Nodo ${start.data("label")}</h3>
      <button id="close-dijkstra-panel" style="background: var(--bg-dark); border: 2px solid var(--red-color); color: var(--red-color); width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 1.2rem; transition: all 0.3s ease; box-shadow: var(--vintage-shadow);">&times;</button>
    </div>
    <hr style="margin: 10px 0; border: 1px solid var(--blue-color);">
  `;

  document.getElementById('close-dijkstra-panel').onclick = () => {
    if(document.getElementById('userIcon').classList.contains('hidden')){
      document.getElementById('userIcon').classList.remove('hidden');
    }
    panel.remove();
  };

  // Elenco dei nodi raggiungibili
  cy.nodes().forEach(node => {
    if (node.id() === start.id()) return;
    if (distances[node.id()] === Infinity) return;

    const button = document.createElement('button');
    button.textContent = "Nodo " + node.data("label") + ' (distanza=' + distances[node.id()] + ')';
    button.style.display = 'block';
    button.style.margin = '6px 0';
    button.style.padding = '8px';
    button.style.width = '100%';
    button.style.background = 'var(--bg-dark)';
    button.style.border = '2px solid var(--red-color)';
    button.style.color = 'var(--red-color)';
    button.style.cursor = 'pointer';
    button.style.fontFamily = "'VT323', monospace";
    button.style.fontSize = '1.1rem';
    button.style.transition = 'all 0.3s ease';
    button.style.textTransform = 'uppercase';
    button.style.letterSpacing = '1px';
    button.style.boxShadow = 'var(--vintage-shadow)';
    button.onmouseover = () => {
      button.style.background = 'var(--red-color)';
      button.style.color = 'var(--bg-dark)';
      button.style.transform = 'translateY(-2px)';
    };
    button.onmouseout = () => {
      button.style.background = 'var(--bg-dark)';
      button.style.color = 'var(--red-color)';
      button.style.transform = 'translateY(0)';
    };

    button.onclick = () => {
      const path = getPathTo(node.id(), previous);
      highlightPath(path);
    };

    panel.appendChild(button);
  });
}
  
  export function getPathTo(targetId, previous) {
    const path = [];
    let current = previous[targetId];
  
    // Se non c'è un predecessore, il nodo è isolato
    if (!current) {
      return []; // Nessun cammino
    }
  
    // Ricostruiamo il percorso all'indietro
    path.unshift(targetId); // aggiungiamo il target stesso
    while (current !== null) {
      path.unshift(current.id()); // inserisce l'ID del predecessore
      current = previous[current.id()];
    }
  
    return path; // array di ID nodo da start a target
  }

  
  export function highlightPath(path) {
    const cy = getCy();
  
    // Rimuovi eventuali evidenziazioni precedenti
    cy.nodes().removeClass('path-node');
    cy.edges().removeClass('path-edge');
  
    for (let i = 0; i < path.length; i++) {
      const node = cy.getElementById(path[i]);
      node.addClass('path-node');
  
      if (i < path.length - 1) {
        const next = cy.getElementById(path[i + 1]);
        const edge = node.edgesTo(next)[0] || next.edgesTo(node)[0];
        if (edge) edge.addClass('path-edge');
      }
    }
  }

  

