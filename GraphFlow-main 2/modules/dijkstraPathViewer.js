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
    panel.style.zIndex = '1000';
    panel.style.fontFamily = "'VT323', monospace";
    panel.style.transition = 'all 0.3s ease';
    panel.style.minWidth = '200px';
    panel.style.minHeight = '200px';
    panel.style.maxHeight = '90vh';
    document.body.appendChild(panel);

    // Aggiungi stili per i media query
    const style = document.createElement('style');
    style.textContent = `
      @media (max-width: 768px) {
        #dijkstra-panel {
          width: 100% !important;
          height: 50% !important;
          bottom: 0 !important;
          top: auto !important;
          right: 0 !important;
          left: 0 !important;
          border-left: none !important;
          border-top: 2px solid var(--red-color) !important;
          transform: translateY(100%);
          transition: transform 0.3s ease, height 0.3s ease;
          z-index: 1000 !important;
        }
        #dijkstra-panel.active {
          transform: translateY(0);
        }
        #dijkstra-panel.minimized {
          height: 60px !important;
          overflow: hidden;
        }
        #dijkstra-panel.closing {
          transform: translateY(100%);
        }
      }
    `;
    document.head.appendChild(style);
  }

  // Aggiungi intestazione e bottoni di controllo
  panel.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 10px;">
      <h3 style="margin: 0; color: var(--blue-color); text-shadow: var(--vintage-shadow); font-size: 1.5rem; border-bottom: 1px solid var(--blue-color); padding-bottom: 0.5rem;">Percorsi da Nodo ${start.data("label")}</h3>
      <div style="display: flex; gap: 5px;">
        <button id="minimize-dijkstra-panel" style="background: var(--bg-dark); border: 2px solid var(--yellow-color); color: var(--yellow-color); width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 1.2rem; transition: all 0.3s ease; box-shadow: var(--vintage-shadow);">−</button>
        <button id="close-dijkstra-panel" style="background: var(--bg-dark); border: 2px solid var(--red-color); color: var(--red-color); width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 1.2rem; transition: all 0.3s ease; box-shadow: var(--vintage-shadow);">&times;</button>
      </div>
    </div>
    <div id="dijkstra-content">
      <hr style="margin: 10px 0; border: 1px solid var(--blue-color);">
  `;

  const content = document.getElementById('dijkstra-content');

  // Crea il pulsante di riapertura se non esiste
  let reopenButton = document.getElementById('reopen-dijkstra-panel');
  if (!reopenButton) {
    reopenButton = document.createElement('button');
    reopenButton.id = 'reopen-dijkstra-panel';
    reopenButton.textContent = 'Mostra Percorsi';
    reopenButton.style.position = 'fixed';
    reopenButton.style.top = '100px';
    reopenButton.style.right = '10px';
    reopenButton.style.zIndex = '1000';
    reopenButton.style.padding = '8px 16px';
    reopenButton.style.background = 'var(--bg-dark)';
    reopenButton.style.border = '2px solid var(--yellow-color)';
    reopenButton.style.color = 'var(--yellow-color)';
    reopenButton.style.cursor = 'pointer';
    reopenButton.style.fontFamily = "'VT323', monospace";
    reopenButton.style.fontSize = '1.1rem';
    reopenButton.style.transition = 'all 0.3s ease';
    reopenButton.style.boxShadow = 'var(--vintage-shadow)';
    reopenButton.style.display = 'none';
    reopenButton.style.opacity = '0';
    reopenButton.style.transform = 'translateY(-20px)';
    
    // Aggiungi effetti hover
    reopenButton.onmouseover = () => {
      reopenButton.style.background = 'var(--yellow-color)';
      reopenButton.style.color = 'var(--bg-dark)';
      reopenButton.style.transform = 'translateY(-2px)';
      reopenButton.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
    };
    
    reopenButton.onmouseout = () => {
      reopenButton.style.background = 'var(--bg-dark)';
      reopenButton.style.color = 'var(--yellow-color)';
      reopenButton.style.transform = 'translateY(0)';
      reopenButton.style.boxShadow = 'var(--vintage-shadow)';
    };
    
    document.body.appendChild(reopenButton);

    reopenButton.onclick = () => {
      panel.style.display = 'block';
      if (window.innerWidth <= 768) {
        panel.style.transform = 'translateY(0)';
      } else {
        panel.style.transform = 'translateX(0)';
        panel.style.opacity = '1';
      }
      document.getElementById('userIcon').classList.add('hidden');
      reopenButton.style.display = 'none';
      reopenButton.style.opacity = '0';
      reopenButton.style.transform = 'translateY(-20px)';
    };
  }

  document.getElementById('close-dijkstra-panel').onclick = () => {
    document.getElementById('userIcon').classList.remove('hidden');
    const reopenBtn = document.getElementById('reopen-dijkstra-panel');
    if (reopenBtn) reopenBtn.remove();
    
    if (window.innerWidth <= 768) {
      panel.style.transform = 'translateY(100%)';
      setTimeout(() => {
        panel.remove();
        const styleElement = document.querySelector('style');
        if (styleElement) styleElement.remove();
      }, 300);
    } else {
      panel.style.opacity = '0';
      panel.style.transform = 'translateX(100%)';
      setTimeout(() => {
        panel.remove();
        const styleElement = document.querySelector('style');
        if (styleElement) styleElement.remove();
      }, 300);
    }
  };

  // Gestore del pulsante di minimizzazione
  document.getElementById('minimize-dijkstra-panel').onclick = () => {
    document.getElementById('userIcon').classList.remove('hidden');
    
    if (window.innerWidth <= 768) {
      panel.style.transform = 'translateY(100%)';
      setTimeout(() => {
        panel.style.display = 'none';
        const reopenBtn = document.getElementById('reopen-dijkstra-panel');
        if (reopenBtn) {
          reopenBtn.style.display = 'block';
          // Forza un reflow per far partire l'animazione
          void reopenBtn.offsetWidth;
          reopenBtn.style.opacity = '1';
          reopenBtn.style.transform = 'translateY(0)';
        }
      }, 300);
    } else {
      panel.style.transform = 'translateX(100%)';
      panel.style.opacity = '0';
      setTimeout(() => {
        panel.style.display = 'none';
        const reopenBtn = document.getElementById('reopen-dijkstra-panel');
        if (reopenBtn) {
          reopenBtn.style.display = 'block';
          // Forza un reflow per far partire l'animazione
          void reopenBtn.offsetWidth;
          reopenBtn.style.opacity = '1';
          reopenBtn.style.transform = 'translateY(0)';
        }
      }, 300);
    }
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

    content.appendChild(button);
  });

  // Aggiungi classe active per l'animazione mobile
  if (window.innerWidth <= 768) {
    setTimeout(() => {
      panel.classList.add('active');
    }, 50);
  }
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


