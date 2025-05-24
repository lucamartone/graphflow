import { getCy } from './graph.js';
import {showSortPanel} from './eventInterazione.js'
import {attivaListenerReset} from './eventInterazione.js'
import {enableAlgorithmButtons} from './eventInterazione.js'
import {disableAlgorithmAllButtons} from './eventInterazione.js'


var shouldStopAlgorithm = false;


//funzione per trovare i vicini di un nodo, gestendo il caso di archi diretti e indiretti
export function getNeighborsHybrid(node) {
    const edges = node.connectedEdges();
  
    const neighbors = new Set(); //insieme dei nodi vicini
  
    edges.forEach(edge => {
      const source = edge.source().id();
      const target = edge.target().id();
      const directed = edge.data('directed');
      
      //per ogni arco connesso al nodo, facciamo distinzione tra diretto e indiretto
      if (directed) {
        // Se diretto, prendiamo il vicino solo se l'arco parte da node
        if (source === node.id()) {
          neighbors.add(target);
        }
      } else {
        // Se non diretto, prendiamo consideriamo entrambi i nodi e prendiamo quello che non è il nodo attuale
        if (source === node.id()) {
          neighbors.add(target);
        } else if (target === node.id()) {
          neighbors.add(source);
        }
      }
    });
  
    // ritorna gli oggetti nodo
    return Array.from(neighbors).map(id => node.cy().getElementById(id));
  }
  

  // Funzione per ottenere il delay in base alla velocità
  function getDelay() {
    const speed = parseInt(document.getElementById('algorithmSpeed').value);
    // Converti la velocità (1-10) in un delay (1000ms - 100ms)
    return 1100 - (speed * 100);
  }

//--------------------------------------------------------------------------------
//BFS

let bfsTimeouts = []; //array per gestire i tempi delle animazioni

export function BFSalgorithm(startNode) {
    document.getElementById('statusBar').textContent = 'BFS in corso';
    resExpl();
    const visited = new Set();
    const queue = [];
    const visitOrder = [];
    const bfsSteps = []; //array con tutti i passi della bfs, per gestire animazioni
    const cy = getCy();

    queue.push(startNode);
    visited.add(startNode.id());

    function checkStop() {
        if (shouldStopAlgorithm) {
            document.getElementById('statusBar').textContent = "BFS interrotto";
            attivaListenerReset();
            return true;
        }
        return false;
    }

    while (queue.length > 0) {
        const node = queue.shift();

        // evidenzia source
        bfsSteps.push(() => {
            if (checkStop()) return;
            node.removeClass('visited');
            node.addClass('exploring');
        });

        const neighbors = getNeighborsHybrid(node);

        // Mostra tutti gli archi uscenti dal source
        bfsSteps.push(() => {
            if (checkStop()) return;
            neighbors.forEach(neighbor => {
                const edge = node.edgesTo(neighbor)[0] || node.edgesWith(neighbor)[0];
                if (edge) edge.addClass('candidate-edge');
            });
        });

        neighbors.forEach(neighbor => {
            const id = neighbor.id();
            const edge = node.edgesTo(neighbor)[0] || node.edgesWith(neighbor)[0];

            if (!visited.has(id)) {
                visited.add(id);
                queue.push(neighbor);

                bfsSteps.push(() => {
                    if (checkStop()) return;
                    neighbor.addClass('visited');
                });
            }

            bfsSteps.push(() => {
                if (checkStop()) return;
                if (edge) edge.removeClass('candidate-edge');
            });
        });

        // Fine visita del nodo corrente
        bfsSteps.push(() => {
            if (checkStop()) return;
            node.removeClass('exploring');
            node.addClass('visited');
            visitOrder.push(node.id());
        });
    }

    // Avvia tutti i passi della BFS con ritardo
    bfsSteps.forEach((stepFn, i) => {
        const timeoutId = setTimeout(() => {
            if (shouldStopAlgorithm) return;
            stepFn();
        }, i * getDelay());
        bfsTimeouts.push(timeoutId);
    });

    // Mostra ordine di visita finale
    const finalTimeout = setTimeout(() => {
        if (shouldStopAlgorithm) return;
        const ordine = visitOrder.join(', ');
        document.getElementById('statusBar').textContent = `Ordine di visita: ${ordine}`;
        enableAlgorithmButtons();
        document.getElementById('resetAnimation').disabled = false;
    }, bfsSteps.length * getDelay());
    bfsTimeouts.push(finalTimeout);
}

//-------------------------------------------------------------------------------------------------

  export function resExpl(){

    for (const timeoutId of bfsTimeouts) {
    clearTimeout(timeoutId); // Cancella ciascun setTimeout della bfs
    }
    bfsTimeouts = []; // Svuota l'array
    shouldStopAlgorithm = true; // Ferma eventuali step ancora in attesa

    shouldStopAlgorithm = false;
    
    const cy = getCy();
    for(const edge of cy.edges()){
      edge.data('type','none');
      if(edge.hasClass('path-edge')){
        edge.removeClass('path-edge');
      }
    }
    for(const nodo of cy.nodes()){
      //console.log("sono "+nodo.id());
      nodo.data("state","UNEXPLORED");
      //cy.getElementById('${nodo.id()}').style('background-color', '#FF4136'); // rosso
      if(nodo.hasClass('exploring')){
        console.log(nodo.id()+" è active");
      cy.getElementById(nodo.id()).removeClass('exploring');
      }
      if(nodo.hasClass('visited')){
        console.log(nodo.id()+" è visited");
      cy.getElementById(nodo.id()).removeClass('visited');
      }
      //console.log("dopo"+nodo.data("state"));
    }
    for(const edge of cy.edges()){
      if(edge.hasClass("path-edge")){
        edge.data("type","none"); 
        edge.removeClass("path-edge");
      }
      if (edge.hasClass('candidate-edge')) {
        edge.removeClass('candidate-edge');
    }
    }
    
    resetStraightEdges();

  }
  
  var sort=[];
  var delay=300;
  var totalDelay=0;
  var istop=false;

//-------------------------------------------------------------------------------------------------------
//DFS
  
  export function DFS(start) {
    resExpl();
    const cy = getCy();
    const stack = [{ node: start, stato: "init" }];
    
    //delay=1000;
    function schedule(fn) {
      setTimeout(fn, getDelay());
    }
  
    function step() {
      if (shouldStopAlgorithm) {
        document.getElementById('statusBar').textContent = "DFS interrotto";
        attivaListenerReset();
        return;
      }
        if (stack.length === 0) {
          // DFS finita registra delay finale in variabile globale
          totalDelay = delay;
          document.getElementById('statusBar').textContent="DFS terminato";
          attivaListenerReset();
          enableAlgorithmButtons();
          document.getElementById('resetAnimation').disabled = false;
          return;
        }
      
  
      const top = stack.pop();
      const node = top.node;
      const stato = top.stato;
      if (stato === "init") {
        if (node.data("state") !== "UNEXPLORED") {
          step();
          return;
        }
      
        schedule(() => {
          node.data("state", "EXPLORING");
          cy.getElementById(node.id()).addClass("exploring");
      
          if (top.edgeProvenienza) {
            top.edgeProvenienza.addClass("path-edge");
          }
      
          console.log("Exploring " + node.id());
        });
      
        stack.push({ node: node, stato: "return" });
      
        const vicini = getNeighborsHybrid(node).reverse();
        for (let vicino of vicini) {
          if (vicino.data("state") === "UNEXPLORED") {
            const edge = node.edgesTo(vicino)[0] || vicino.edgesTo(node)[0];
            stack.push({ node: vicino, stato: "init", edgeProvenienza: edge });
          } else if (vicino.data("state") === "EXPLORING") {
            schedule(() => {
              const edge = node.edgesTo(vicino)[0] || vicino.edgesTo(node)[0];
              if (edge) {
                edge.data("type", "back");
                console.log("Arco back: " + edge.id());
              }
              if (istop) {
                stack.length = 0;
              }
            });
          }
        }
      
      } else if (stato === "return") {
        // 4. Solo ora diventa explored
        //if(node.data("state")== "EXPLORING"){
        schedule(() => {
          node.data("state", "EXPLORED");
          cy.getElementById(node.id()).removeClass("exploring").addClass("visited");
          //console.log("Explored " + node.id());
          sort.unshift(node);
          
        });
      
      }
  
      // pianifica il prossimo passo
      schedule(() => {
        step();
      });
    }
  
    step();
    
  }
  
  
  
//---------------------------------------------------------------------------------------------
//TOPOLOGICAL SORT
export function topSort(){
    //resExpl();
    const cy = getCy();
    istop=true;
    let start=cy.getElementById(document.getElementById("startNode").value);
    sort = [];
    delay = 1000;
    totalDelay=0;
    //resExpl();
    //console.log("va dfs");
    DFS(start);
    const checkDFSdone = setInterval(() => {
      
      if (totalDelay > 0) {//allora la dfs è iniziata
        clearInterval(checkDFSdone);
        console.log(" Eseguo topSort dopo delay:", totalDelay);

    setTimeout(() => {
    istop=false;
    let arr_edges=cy.edges();
    for(let ed of arr_edges){
      if(ed.data("type")=="back"){
        let back=ed;
        showSortPanel(back);
        return;
      }
    }
    applyTopologicalLayout(sort);
    setupTopologicalStyle(cy);
    
    let s="";
    for(let node of sort){
      s=s+"->"+node.id();
    }
    //console.log(s);
    document.getElementById("statusBar").textContent=s;
    },totalDelay+100);
  }
  },50);
  }
  

  //posizione i nodi ordinati da topological sort e rimuove quelli non visitati
  function applyTopologicalLayout(sortedNodes) {
    const cy = getCy();
  
    const positions = {};
    sortedNodes.forEach((node, index) => {
      positions[node.id()] = {
        x: 100 + index * 200,
        y: 100
      };
    });

    let nodi=cy.nodes();
    for(const n of nodi){
      if(!n.hasClass('visited')){
        n.remove();
      }
    }
  
    cy.nodes().positions(node => positions[node.id()]);
  
    cy.layout({
      name: 'preset',
      animate: true,
      animationDuration: 500,
      fit: true,
      padding: 30
    }).run();
  }
  

  //applica curve agli archi dopo topological
  export function setupTopologicalStyle(cy) {
    cy.style()
      .selector('edge')
      .style({
        'curve-style': 'unbundled-bezier',
        'control-point-distances': [120],
        'control-point-weights': [0.5],
        'target-arrow-shape': 'triangle',
        'arrow-scale': 1.2,
        'line-color': '#4ecdc4',
        'target-arrow-color': '#4ecdc4',
        'width': 3
      })
      .update();
      
      //crea array con tutti gli archi
      let v_edges=[];
      let i =0;
      cy.edges().forEach(edge => {
        v_edges[i]=edge;
        i++;
      });

      //per rendere visibili archi paralleli, gli archi con indice pari hanno curva verso l'altro, i dispari curva verso il basso
      for (let j=0; j<v_edges.length; j++){
        const sign = j%2==0 ? 1 : -1;
        v_edges[j].style({
          'curve-style': 'unbundled-bezier',
          'control-point-distances': [120*sign],
          'control-point-weights': [0.5],
        });
      }
      
  }

//resetta stile archi
export function resetStraightEdges(){
    const cy = getCy();
    cy.style().selector('edge').style({
      'curve-style': 'bezier',
      'target-arrow-shape': 'triangle',
      'arrow-scale': 1.2,
    });

//redichiaro gli stili perchè con topological vengono sovrascritti
  cy.style()
  .selector('.candidate-edge')
  .style({
    'line-color': '#FFD700', 
    'width': 3,
    'target-arrow-color': '#FFD700',
    'target-arrow-shape': 'triangle'
  })
  .update();

  cy.style()
  .selector('.path-edge')
  .style({
    'line-color': '#FF4136',
    'width': 4,
    'target-arrow-color': '#FF4136',
    'target-arrow-shape': 'triangle'
  })
  .update();

  }
  
//------------------------------------------------------------------------------------------------
//DIJKSTRA 
export async function Dijkstra(start) {
    resExpl();
    const cy = getCy();
  
    if (hasNegativeWeight()) {
        const errorModal = document.getElementById('errorModal');
        const errorMessage = document.getElementById('errorMessage');
        const closeButton = errorModal.querySelector('.close-modal');
        const okButton = document.getElementById('errorOkButton');
        
        errorMessage.textContent = 'L\'algoritmo di Dijkstra non può essere eseguito su grafi con archi di peso negativo.';
        errorModal.classList.add('active');
        
        const closeModal = () => {
            errorModal.classList.remove('active');
            enableAlgorithmButtons();
            document.getElementById('resetAnimation').disabled = false;
        };
        
        closeButton.onclick = closeModal;
        okButton.onclick = closeModal;
        errorModal.onclick = (e) => {
            if (e.target === errorModal) closeModal();
        };

        // Chiudi il pannello di Dijkstra se è aperto
        const dijkstraPanel = document.getElementById('dijkstraPanel');
        if (dijkstraPanel) {
            dijkstraPanel.style.display = 'none';
        }

        // Ferma l'algoritmo
        stopAlgorithm();
        
        return;
    }
  
    cy.nodes().forEach(n => {
      n.data("state", "UNEXPLORED");
      n.removeClass("exploring visited path-node");
    });
    cy.edges().forEach(e => {
      e.removeClass("path-edge");
    });
  
    const distances = {};
    const previous = {};
    const visited = new Set();
    const queue = [];
  
    cy.nodes().forEach(node => {
      distances[node.id()] = Infinity;
      previous[node.id()] = null;
    });
  
    distances[start.id()] = 0;
    queue.push(start);
  
    while (queue.length > 0) {
      if (shouldStopAlgorithm) {
        document.getElementById('statusBar').textContent = "Dijkstra interrotto";
        attivaListenerReset();
        return { distances, previous };
      }
      queue.sort((a, b) => distances[a.id()] - distances[b.id()]);
      const current = queue.shift();
  
      if (visited.has(current.id())) continue;
      if (distances[current.id()] === Infinity) {
        alert("Errore: il grafo contiene nodi non raggiungibili dalla sorgente.");
        return;
      }
  
      console.log(`Nodo: ${current.data("label")} (distanza: ${distances[current.id()]})`);
      await animateNode(current, 'exploring');
  
      const neighbors = getNeighborsHybrid(current);
      for (const neighbor of neighbors) {
        if (visited.has(neighbor.id())) continue;
  
        const edge = current.edgesTo(neighbor)[0] || neighbor.edgesTo(current)[0];
        const weight = edge?.data("weight") ?? 1;
  
        const alt = distances[current.id()] + weight;
        if (alt < distances[neighbor.id()]) {
          distances[neighbor.id()] = alt;
          previous[neighbor.id()] = current;
          queue.push(neighbor);
          console.log(`Miglioramento: ${neighbor.data("label")} ← ${current.data("label")} (distanza: ${alt})`);
        }
      }
  
      visited.add(current.id());
      await animateNode(current, 'visited');
    }
  
    // Colora archi del cammino minimo per ogni nodo raggiunto
    cy.nodes().forEach(node => {
      const prev = previous[node.id()];
      if (prev) {
        const edge = prev.edgesTo(node)[0] || node.edgesTo(prev)[0];
        if (edge) edge.addClass('path-edge');
      }
    });
  
    console.log("Dijkstra completato.");
    console.log("Distanze:", distances);
    console.log("Predecessori:", previous);
    attivaListenerReset();
    document.getElementById('statusBar').textContent = "Dijkstra terminato";
    enableAlgorithmButtons();
    document.getElementById('resetAnimation').disabled = false;
    return { distances, previous };
  }

  function hasNegativeWeight() {
    const cy = getCy();
    return cy.edges().some(edge => (edge.data("weight") ?? 1) < 0);
  }

  
  function animateNode(node, className) {
    return new Promise(resolve => {
      node.addClass(className);
      setTimeout(resolve, getDelay());
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
  


  //--------------------------------------------------------------
//PRIM

//Prim non funziona su grafi non connessi perchè non c'è MST, uso funzione ausiliaria 
function isGraphConnected() { 
  const cy = getCy();
  if (cy.nodes().length === 0) return true;
  
  const visited = new Set();
  const queue = [cy.nodes()[0]];
  visited.add(cy.nodes()[0].id());

  while (queue.length > 0) {
      const node = queue.shift();
      const neighbors = getNeighborsHybrid(node);
      
      for (const neighbor of neighbors) {
          if (!visited.has(neighbor.id())) {
              visited.add(neighbor.id());
              queue.push(neighbor);
          }
      }
  }

  return visited.size === cy.nodes().length;
}



export async function Prim(start) {
  resExpl();
  const cy = getCy();
  
  // Verifica se il grafo è connesso
  if (!isGraphConnected()) {
      const errorModal = document.getElementById('errorModal');
      const errorMessage = document.getElementById('errorMessage');
      const closeButton = errorModal.querySelector('.close-modal');
      const okButton = document.getElementById('errorOkButton');
      
      errorMessage.textContent = 'Il grafo non è connesso. L\'algoritmo di Prim richiede un grafo connesso per trovare l\'albero di copertura minima.';
      errorModal.classList.add('active');
      
      // Close modal handlers
      const closeModal = () => {
          errorModal.classList.remove('active');
          enableAlgorithmButtons();
          document.getElementById('resetAnimation').disabled = false;
      };
      
      closeButton.onclick = closeModal;
      okButton.onclick = closeModal;
      errorModal.onclick = (e) => {
          if (e.target === errorModal) closeModal();
      };
      
      document.getElementById('statusBar').textContent = 'prr prr pataprim';
      return;
  }
  
  // Reset nodi e archi da visite (preso da Dijkstra)
  cy.nodes().forEach(n => {
      n.data("state", "UNEXPLORED");
      n.removeClass("exploring visited path-node");
  });
  cy.edges().forEach(e => {
      e.removeClass("path-edge candidate-edge");
  });

  const visited = new Set();
  const mstEdges = new Set();
  const queue = [];
  let mstWeight = 0;

  // Nodo iniziale
  visited.add(start.id());
  start.addClass('visited');

  // Aggiungo i vicini del nodo iniziale alla coda
  const neighbors = getNeighborsHybrid(start);
  neighbors.forEach(neighbor => {
      if (!visited.has(neighbor.id())) {
          const edge = start.edgesTo(neighbor)[0];
          if (edge) {
              const weight = edge.data('weight');
              queue.push({ edge, target: neighbor, weight });
          } else {
              const reverseEdge = neighbor.edgesTo(start)[0];
              if (reverseEdge && !reverseEdge.data('directed')) {
                  const weight = reverseEdge.data('weight');
                  queue.push({ edge: reverseEdge, target: neighbor, weight });
              }
          }
      }
  });

  // riordino la coda in base al peso ridefinendo il sort
  queue.sort((a, b) => a.weight - b.weight);

  //finchè non ho visitato tutti i nodi e la coda non è vuota:
  while (queue.length > 0 && visited.size < cy.nodes().length) {
    if (shouldStopAlgorithm) {
      document.getElementById('statusBar').textContent = "Prim interrotto";
      attivaListenerReset();
      return;
    }
            // Evidenzio candidati
            cy.edges().forEach(e => e.removeClass('candidate-edge'));
            
            queue.forEach(({ edge, target }) => {
              const source = edge.source();
              const targetNode = edge.target();
              //new Promise(resolve => setTimeout(resolve, getDelay()));
              const isDirected = edge.data('directed');
              const sourceVisited = visited.has(source.id());
              const targetVisited = visited.has(targetNode.id());
          
              // Se arco diretto e il target è stato visitato, non è più candidato
              if (isDirected && targetVisited) {
                  edge.removeClass('candidate-edge');
              }
              // Se arco non diretto e entrambi sono stati visitati, rimuovi
              else if (!isDirected && sourceVisited && targetVisited) {
                  edge.removeClass('candidate-edge');
              } else {
                  edge.addClass('candidate-edge');
              }
          });

      // Aspetta 1 secondo per l'animazione
      await new Promise(resolve => setTimeout(resolve, getDelay()));

      // Prendo arco di peso minimo
      const { edge, target, weight } = queue.shift();
      
      if (visited.has(target.id())) { //se il target è già stato visto non è un candidato
          edge.removeClass('candidate-edge');
          continue;
      }

      // Coloro arco scelto e aggiungo il nodo al MST
      edge.removeClass('candidate-edge')
      edge.addClass('path-edge');
      await new Promise(resolve => setTimeout(resolve, getDelay()));
      target.addClass('visited');
      visited.add(target.id());
      mstEdges.add(edge);
      mstWeight += weight;

      // Aggiungo i vicini del nuovo nodo (senza svuotare la coda)
      const newNeighbors = getNeighborsHybrid(target);
      newNeighbors.forEach(neighbor => {
          if (!visited.has(neighbor.id())) {
              const newEdge = target.edgesTo(neighbor)[0];
              if (newEdge) {
                  const w = newEdge.data('weight');
                  queue.push({ edge: newEdge, target: neighbor, weight: w });
              } else {
                  const reverseEdge = neighbor.edgesTo(target)[0];
                  if (reverseEdge && !reverseEdge.data('directed')) {
                      const w = reverseEdge.data('weight');
                      queue.push({ edge: reverseEdge, target: neighbor, weight: w });
                  }
              }
          }
      });

      // Riordina la coda di priorità
      queue.sort((a, b) => a.weight - b.weight);
  }

  // Assicura che tutti gli archi del MST siano evidenziati (per aggiungere l'ultimo arco)
  mstEdges.forEach(edge => edge.addClass('path-edge'));
  // Pulizia finale dei candidate-edge rimasti
  cy.edges().forEach(edge => {
  const sourceVisited = visited.has(edge.source().id());
  const targetVisited = visited.has(edge.target().id());
  const isDirected = edge.data('directed');

  if ((isDirected && targetVisited) || (!isDirected && sourceVisited && targetVisited)) {
      edge.removeClass('candidate-edge');
  }
  });

  document.getElementById('statusBar').textContent = `MST trovato! Peso totale: ${mstWeight}`;
  attivaListenerReset();
  //document.getElementById('statusBar').textContent = "Prim terminato";
  enableAlgorithmButtons();
  document.getElementById('resetAnimation').disabled = false;
  return { mstEdges, totalWeight: mstWeight };
}


//-------------------------------------------------------------------------------------------------
//STOP
export function stopAlgorithm() {
  shouldStopAlgorithm = true;
  document.getElementById('statusBar').textContent = "Algoritmo interrotto";
  document.getElementById('resetAnimation').disabled = false;
  disableAlgorithmAllButtons();
}

document.getElementById('stopAlgorithm').addEventListener('click', stopAlgorithm);