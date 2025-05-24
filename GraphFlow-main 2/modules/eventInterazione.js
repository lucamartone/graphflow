import { getCy, initGraph } from './graph.js';
import { setAddingNodeMode, setAddingEdgeMode, isAddingNodeMode, isAddingEdgeMode } from './modesManager.js';
import { addNodeAt, selectSource, getNodeCounter, clearGraph, generateRandomGraph } from './graphFunctions.js';
import { BFSalgorithm, DFS, topSort,  Prim, resExpl} from './algorithms.js';
import { runDijkstraWithUI } from './dijkstraPathViewer.js';
import { updateNodeList } from './savedGraphs.js';




export function setupEventInteractions() {
    const cy = getCy();

    // Aggiunta nodo con click
    cy.on('tap', (e) => {
        if (isAddingNodeMode() && e.target === cy) {
            const pos = e.position;
            const radius=1000;
            const cas=Math.random();
            const angle = 2 * Math.PI *cas;
            const px = pos.x+ radius * Math.cos(angle);
            const py = pos.y+ radius * Math.sin(angle);
            addNodeAt(pos.x, pos.y,px,py);
            document.getElementById('statusBar').textContent = `Nodo ${getNodeCounter() - 1} aggiunto`;
        } else if (isAddingEdgeMode() && e.target === cy) {
            document.getElementById('statusBar').textContent = `Aggiunta arco in corso`;
        }
    });

    // TOGGLE MODALITÀ NODO
    document.getElementById('addNode').addEventListener('click', function () {
        setAddingNodeMode(!isAddingNodeMode());
        setAddingEdgeMode(false);
        this.textContent = isAddingNodeMode() ? 'Add Node: ON' : 'Add Node: OFF';

        if (this.classList.contains("glow-button")) {
            // Inverti colori
            this.classList.remove("glow-button");
            this.classList.add("glow-inverted-button");
        } else {
            this.classList.remove("glow-inverted-button");
            this.classList.add("glow-button");
        }

        let addEdgeButton = document.getElementById('addEdge');
            addEdgeButton.textContent = 'Add Edge: OFF';
        if (addEdgeButton.classList.contains("glow-inverted-button")) {
            addEdgeButton.classList.remove("glow-inverted-button");
            addEdgeButton.classList.add("glow-button");
        }
        document.getElementById('statusBar').textContent = isAddingNodeMode() ? 'Aggiunta nodo in corso' : '';
    });

    // TOGGLE MODALITÀ ARCO
    document.getElementById('addEdge').addEventListener('click', function () {
        setAddingEdgeMode(!isAddingEdgeMode());
        setAddingNodeMode(false);
        if(isAddingEdgeMode()){
            document.getElementById('statusBar').textContent = 'Click on a source node';
            document.getElementById('addEdge').textContent = 'Add Edge: ON';
            if (this.classList.contains("glow-button")) {
                this.classList.remove("glow-button");
                this.classList.add("glow-inverted-button");
            }
            let addNodeButton = document.getElementById('addNode');
            addNodeButton.textContent = 'Add Node: OFF';
            if (addNodeButton.classList.contains("glow-inverted-button")) {
                addNodeButton.classList.remove("glow-inverted-button");
                addNodeButton.classList.add("glow-button");
            }
            cy.nodes().on('tap', selectSource);
        }
        else{
            document.getElementById('addEdge').textContent = 'Add Edge: OFF';
            if (this.classList.contains("glow-inverted-button")) {
                this.classList.remove("glow-inverted-button");
                this.classList.add("glow-button");
            }
            cy.nodes().removeListener('tap', selectSource);
        }
      });

    // CLEAR GRAFO
    document.getElementById('clear').addEventListener('click', () => {
        clearGraph();
        document.getElementById('statusBar').textContent = 'Graph cleared';
    });
}

//GESTIONE PANNELLO PROPRIETÀ
export function setupPropertiesPanel(){
    const cy = getCy();
    cy.on('tap', 'node', function(evt) {
        if (isAddingEdgeMode()) {
            return;
          }
        showPropertiesPanel(evt.target);
    });
    cy.on('tap', 'edge', function(evt) {
        if (isAddingNodeMode()) {
            return;
          }
        showPropertiesPanel(evt.target);
    });
    cy.on('tap', function(evt) {
        if (evt.target === cy ) {
          hidePropertiesPanel(); //cliccando sul contenitore del grafo si chiude la finestra pop-up di modifica
        }
    });

    // Handler per chiudere la finestra pop-up con bottone OK
    document.getElementById('closePropertiesEdges').addEventListener('click', hidePropertiesPanel);
    document.getElementById('closePropertiesNodes').addEventListener('click', hidePropertiesPanel);
    document.getElementById('removeEdge').addEventListener('tap', function(e) {

    const element=e.target;
        if (element.isEdge()) {
            element.remove();
            hidePropertiesPanel();
        }
    });

    // Handler per rimuovere nodo
    document.getElementById('removeNode').addEventListener('click', function() {
        const element = cy.$(':selected');
        if (element.isNode()) {
          // Rimuovi tutti gli archi collegati al nodo
          const connectedEdges = element.connectedEdges();
          connectedEdges.remove();
          // Rimuovi il nodo
          element.remove();
          hidePropertiesPanel();
        }
      });
}

export function showSortPanel(edge){
    const cy = getCy();
    let menuButton=document.getElementById('menuButton')
    
    menuButton.classList.add('not');
    
    const panel=document.getElementById("sort");
    const arco=document.getElementById("arco");
    const removeEdge2=document.getElementById('removeEdge2');

    panel.style.display='block';
    // Ottieni le etichette dei nodi sorgente e destinazione
    const sourceLabel = edge.source().data('label');
    const targetLabel = edge.target().data('label');
    // Mostra l'arco nel formato <source-target>
    arco.textContent="<"+sourceLabel+"-"+targetLabel+'>\nVuoi eliminarlo?';
    
    removeEdge2.addEventListener('click', function(){
        edge.remove();
        panel.style.display = 'none';
        if(menuButton.classList.contains('not'))
        menuButton.classList.remove('not');
    });
    
    cy.on('tap', function(evt) {
        if (evt.target === cy ) {
            panel.style.display='none';
            if(menuButton.classList.contains('not'))
            menuButton.classList.remove('not');
        }
    });
}

export function showPropertiesPanel(element) {
    const removeEdge=document.getElementById('removeEdge');
    const removeNode=document.getElementById('removeNode');
    const panel = document.getElementById('propertiesPanel');
    const nodeProps = document.getElementById('nodeProperties');
    const edgeProps = document.getElementById('edgeProperties');
    const title = document.getElementById('propertiesTitle');
    
    menuButton.classList.add('not');
      
    panel.style.display = 'block';
  
    if (element.isNode()) {
        //Clona e rimpiazza pulsante addNode
        const OldRemoveNodeBtn = document.getElementById('removeNode');
        const newRemoveNodeBtn = OldRemoveNodeBtn.cloneNode(true);
        OldRemoveNodeBtn.replaceWith(newRemoveNodeBtn);

        newRemoveNodeBtn.addEventListener('click', function(){
        element.remove();
        hidePropertiesPanel();
        });

        title.textContent = 'Node Properties';
        nodeProps.style.display = 'block';
        edgeProps.style.display = 'none';

        const labelInput = document.getElementById('nodeLabel');
        labelInput.value = element.data('label');
      
        labelInput.onchange = function() {
        element.data('label', this.value);
        updateNodeList();
        };

    } else if (element.isEdge()) {
        const oldRemoveEdgeBtn = document.getElementById('removeEdge');
        const newRemoveEdgeBtn = oldRemoveEdgeBtn.cloneNode(true);
        oldRemoveEdgeBtn.replaceWith(newRemoveEdgeBtn);

        newRemoveEdgeBtn.addEventListener('click', function () {
            element.remove();
            hidePropertiesPanel();
});
        title.textContent = 'Edge Properties';
        nodeProps.style.display = 'none';
        edgeProps.style.display = 'block';
      
      const weightInput = document.getElementById('edgeWeight');
      const directedSwitch = document.getElementById('directedSwitch');
      
      weightInput.value = element.data('weight') || 1;
      directedSwitch.checked = element.data('directed') !== false;
      
      weightInput.onchange = function() {
        const weight = parseFloat(this.value);
        if (!isNaN(weight)) {
          element.data('weight', weight);
        }
      };
      
      directedSwitch.onchange = function() {
        const isDirected = this.checked;
        element.data('directed', isDirected);
        if (isDirected) {
          element.removeClass('undirected');
          element.style({'target-arrow-shape':'triangle'});
        } else {
          element.addClass('undirected');
          element.style({'target-arrow-shape':'none'});
        }
      };
    }
}

// NASCONDE IL PANNNELLO
export function hidePropertiesPanel() { 
    const panel = document.getElementById('propertiesPanel');
    if(menuButton.classList.contains('not'))
        menuButton.classList.remove('not');
      
    panel.style.display = 'none'; //il pannello torna invisibile
}

export function listenerRandomGraph(){
    // Add button to generate random graph
    if (window.innerWidth <= 768){
        document.getElementById('generateRandom').addEventListener('click', ()=>{
        document.getElementById('statusBar').textContent="Random Graph Generated";
        generateRandomGraph((window.innerWidth/2)-50);});
        
    }else{
        document.getElementById('generateRandom').addEventListener('click', ()=>{
        document.getElementById('statusBar').textContent="Random Graph Generated";
        generateRandomGraph(350)});
        
    }
    document.getElementById('edgeProbability').addEventListener('input', function(){
        let prob=parseInt(document.getElementById("edgeProbability").value);
        var test=prob+'%';
        document.getElementById('probabilityValue').textContent=test;
    });
}
//ALGORITMI

// Funzione per disabilitare i pulsanti degli algoritmi tranne quello attivo
function disableAlgorithmButtons(activeButtonId) {
    const algorithmButtons = ['dfs', 'bfs', 'dijkstra', 'topSort', 'prim'];
    algorithmButtons.forEach(buttonId => {
        const button = document.getElementById(buttonId);
        if (buttonId === activeButtonId) {
            button.disabled = false;
            button.classList.add('active');
        } else {
            button.disabled = true;
            button.classList.remove('active');
        }
    });
}

export function disableAlgorithmAllButtons() {
    const algorithmButtons = ['dfs', 'bfs', 'dijkstra', 'topSort', 'prim'];
    algorithmButtons.forEach(buttonId => {
        const button = document.getElementById(buttonId);
        button.disabled = true;
    });
}

// Funzione per abilitare tutti i pulsanti degli algoritmi
export function enableAlgorithmButtons() {
    const algorithmButtons = ['dfs', 'bfs', 'dijkstra', 'topSort', 'prim'];
    algorithmButtons.forEach(buttonId => {
        const button = document.getElementById(buttonId);
        button.disabled = false;
        button.classList.remove('active');
    });
}

const showErrorModal = (message) => {
    const errorModal = document.getElementById('errorModal');
    const errorMessage = document.getElementById('errorMessage');
    const closeButton = errorModal.querySelector('.close-modal');
    const okButton = document.getElementById('errorOkButton');
    
    errorMessage.textContent = message;
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
};

const checkStartNode = () => {
    const startNode = document.getElementById("startNode").value;
    if (!startNode) {
        showErrorModal('Seleziona un nodo di partenza prima di eseguire l\'algoritmo.');
        return false;
    }
    return true;
};

const DfsHandler = () => {
    if (!checkStartNode()) return;
    const cy = getCy();
    let start = cy.getElementById(document.getElementById("startNode").value);
    document.getElementById('resetAnimation').removeEventListener('click', resExpl);
    document.getElementById('resetAnimation').disabled = true;
    document.getElementById('resetAnimation').classList.remove('active');
    document.getElementById('statusBar').textContent = "DFS in corso";
    disableAlgorithmButtons('dfs');
    DFS(start);
}

const BfsHandler = () => {
    if (!checkStartNode()) return;
    const cy = getCy();
    let start = cy.getElementById(document.getElementById("startNode").value);
    document.getElementById('resetAnimation').removeEventListener('click', resExpl);
    document.getElementById('resetAnimation').disabled = true;
    document.getElementById('statusBar').textContent = "BFS in corso";
    disableAlgorithmButtons('bfs');
    BFSalgorithm(start);
}

const TopSortHandler = () => {
    if (!checkStartNode()) return;
    const cy = getCy();
    let start = cy.getElementById(document.getElementById("startNode").value);
    document.getElementById('resetAnimation').removeEventListener('click', resExpl);
    document.getElementById('resetAnimation').disabled = true;
    document.getElementById('statusBar').textContent = "Topological Sort in corso";
    disableAlgorithmButtons('topSort');
    topSort(start);
}

const DijkstraHandler = () => {
    if (!checkStartNode()) return;
    const cy = getCy();
    let start = cy.getElementById(document.getElementById("startNode").value);
    document.getElementById('resetAnimation').removeEventListener('click', resExpl);
    document.getElementById('resetAnimation').disabled = true;
    document.getElementById('statusBar').textContent = "Dijkstra in corso";
    disableAlgorithmButtons('dijkstra');
    runDijkstraWithUI(start);
}

const PrimHandler = () => {
    if (!checkStartNode()) return;
    const cy = getCy();
    let start = cy.getElementById(document.getElementById("startNode").value);
    document.getElementById('resetAnimation').removeEventListener('click', resExpl);
    document.getElementById('resetAnimation').disabled = true;
    document.getElementById('statusBar').textContent = "Prim in corso";
    disableAlgorithmButtons('prim');
    Prim(start);
}

export function setupAlgorithms() {
  // Aggiungi listener per il controllo della velocità
    document.getElementById('algorithmSpeed').addEventListener('input', function() {
        const speed = this.value;
        document.getElementById('speedValue').textContent = speed + 'x';
    });

    document.getElementById('resetAnimation').addEventListener('click', () => {
        resExpl();
        enableAlgorithmButtons();
    });
    document.getElementById('bfs').addEventListener('click', BfsHandler);
    document.getElementById('dfs').addEventListener('click', DfsHandler);
    document.getElementById('topSort').addEventListener('click', TopSortHandler);
    document.getElementById('dijkstra').addEventListener('click', DijkstraHandler);
    document.getElementById('prim').addEventListener('click', PrimHandler);
}

export function attivaListenerReset() {
    document.getElementById('resetAnimation').addEventListener('click', () => {
        document.getElementById('statusBar').textContent="Animazione resettata";
        resExpl();
        enableAlgorithmButtons();
        if(document.getElementById('dijkstra-panel')){
            document.getElementById('dijkstra-panel').remove();
        }
    });
}

//funzione per aggiungere o rimuovere la freccia negli archi directed o undirected
export function setupSwitchDirUndir(){
    document.getElementById("switchDirUndir").addEventListener('change', function(){
                let DirUndir = this.checked ? 'triangle' : 'none';
                let shape = DirUndir=='triangle' ? true : false;
            //alert(DirUndir);
            let cy=getCy();
            for(let edge of cy.edges()){
                edge.style({
                    'target-arrow-shape': DirUndir
                });

                edge.data("directed", shape);
            }

    });
}



const popUpSavedGraph=document.getElementById('infoSavedGraph');
const xSavedGraph=document.querySelector('#headerInfoGraph .close-modal');
const okSavedGraph=document.getElementById('okButton');
const confirmDeleteGraph=document.getElementById("confirmDeleteGraph");
const buttonCancel=document.getElementById("cancelButton");


okSavedGraph.addEventListener('click', () => {
    popUpSavedGraph.classList.remove('active');
});
xSavedGraph.addEventListener('click', ()=>{
popUpSavedGraph.classList.remove('active');
});
buttonCancel.addEventListener('click', () => {
confirmDeleteGraph.classList.remove('active');
});
