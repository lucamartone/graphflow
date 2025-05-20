import { getCy } from './graph.js';
import { setupEventInteractions } from './eventInterazione.js';
import { resetNodeCounter, setNodeCounter } from './graphFunctions.js';

let currentUser = null;

const msg=document.getElementById('msgInfoGraph');
const TitleInfoGraph=document.getElementById("modalTitle");
const popUpSavedGraph=document.getElementById('infoSavedGraph');

export function setupSavedGraphs(user) {
    currentUser = user;
    const savedGraphsSection = document.getElementById('savedGraphsSection');
    const saveGraphBtn = document.getElementById('saveGraph');
    

    if (user) {
        savedGraphsSection.style.display = 'block';
        loadSavedGraphs();

        saveGraphBtn.addEventListener('click', () => {
            const graphName = document.getElementById('graphName').value.trim();
            if (!graphName) {
                //alert('Please enter a graph name');
                popUpSavedGraph.classList.add('active');
                msg.textContent="graph name non valido!";
                return;
            }

            const cy = getCy();
            const nodes = cy.nodes().map(node => ({
                id: node.id(),
                label: node.data('label'),
                position: node.position()
            }));

            const edges = cy.edges().map(edge => ({
                source: edge.source().id(),
                target: edge.target().id(),
                weight: edge.data('weight'),
                directed: edge.data('directed')
            }));

            saveGraph(graphName, nodes, edges);
        });
    } else {
        savedGraphsSection.style.display = 'none';
    }
}

//carica elenco dei grafi salvati con chiamata al server get_graphs e li mostra con displayGraphs
function loadSavedGraphs() {
    fetch('php/get_graphs.php')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                displayGraphs(data.graphs);
            } else {
                console.error('Error loading graphs:', data.error);
                //alert('Error loading saved graphs: ' + data.error);
                popUpSavedGraph.classList.add('active');
                msg.textContent="Errore caricamento grafi";
            }
        })
        .catch(error => {
            console.error('Error:', error);
            //alert('Error loading saved graphs');
        });
}

//mostra a schermo elenco dei grafi salvati, aggiungendo dinamicamente i dati raccolti in fondo alla sidebar
function displayGraphs(graphs) {
    const graphsList = document.getElementById('graphsList');
    graphsList.innerHTML = '';

    if (graphs.length === 0) {
        graphsList.innerHTML = '<p>No saved graphs</p>';
        return;
    }

    graphs.forEach(graph => {
        const graphElement = document.createElement('div');
        graphElement.className = 'graph-item';
        graphElement.innerHTML = `
            <div class="graph-info">
                <span class="graph-name">${graph.name}</span>
                <span class="graph-date">${new Date(graph.created_at).toLocaleString()}</span>
            </div>
            <div class="graph-actions">
                <button class="load-graph" data-id="${graph.id}">Load</button>
                <button class="delete-graph" data-id="${graph.id}">Delete</button>
            </div>
        `;

        graphElement.querySelector('.load-graph').addEventListener('click', () => {
            loadGraph(graph);
        });

        graphElement.querySelector('.delete-graph').addEventListener('click', () => {
            deleteGraph(graph.id);
        });

        graphsList.appendChild(graphElement);
    });
}

function saveGraph(name, nodes, edges) {
    fetch('php/save_graph.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, nodes, edges })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            document.getElementById('graphName').value = '';
            loadSavedGraphs();
            //alert('Graph saved successfully!');
            popUpSavedGraph.classList.add('active');
            msg.textContent="";
            TitleInfoGraph.textContent="Grafo salvato con successo!";
        } else {
            //alert('Error saving graph: ' + data.error);
            popUpSavedGraph.classList.add('active');
            msg.textContent="Errore nel salvare il grafo";
        }
    })
    .catch(error => {
        console.error('Error:', error);
        //alert('Error saving graph');
        });
}


//disegna il grafo recuperato dal database
function loadGraph(graph) {
    const cy = getCy();
    
    // Rimuovi tutti gli elementi esistenti
    cy.elements().remove();

    // Resetta il contatore dei nodi
    resetNodeCounter();

    // Trova il numero massimo di nodi per aggiornare il contatore
    let maxNodeNumber = 0;
    graph.nodes.forEach(node => {
        const nodeNumber = parseInt(node.id.split('-')[1]);
        if (nodeNumber > maxNodeNumber) {
            maxNodeNumber = nodeNumber;
        }
    });

    // Imposta il contatore al numero massimo + 1
    setNodeCounter(maxNodeNumber + 1);

    // Aggiungi i nodi
    graph.nodes.forEach(node => {
        cy.add({
            group: 'nodes',
            data: { 
                id: node.id,
                label: node.label
            },
            position: node.position
        });
    });

    // Aggiungi gli archi
    graph.edges.forEach(edge => {
        cy.add({
            group: 'edges',
            data: {
                source: edge.source,
                target: edge.target,
                weight: edge.weight,
                directed: edge.directed
            },
            classes: edge.directed ? '' : 'undirected'
        });
    });

    // Applica lo stile per gli archi appena aggiunti
    cy.edges().forEach(edge => {
        const directed = edge.data('directed') !== false;
        const arrowShape = directed ? 'triangle' : 'none';
        edge.style({ 'target-arrow-shape': arrowShape });
    });

    // Aggiorna la lista dei nodi per gli algoritmi
    updateNodeList();
}

//elimina grafo dal database
function deleteGraph(graphId) {
    const confirmDeleteGraph=document.getElementById("confirmDeleteGraph"); //"Sei sicuro di voler eliminare il grafo?"
    const okconfirmButton=document.getElementById("okconfirmButton"); //"Si, conferma"
    
    confirmDeleteGraph.classList.add('active'); //rende visibile domanda di conferma

    //attende il click sulla conferma per eliminare
    okconfirmButton.addEventListener("click", ()=>{
        fetch('php/delete_graph.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id: graphId })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                loadSavedGraphs();
            } else {
                //alert('Error deleting graph: ' + data.error);
                popUpSavedGraph.classList.add('active');
                msg.textContent="Error deleting graph";
            }
        })
        .catch(error => {
            console.error('Error:', error);
            //alert('Error deleting graph');
        });
        confirmDeleteGraph.classList.remove('active');
    });
    
}

//aggiorna la lista dei nodi del menu a tendina in base al numero di nodi del grafo caricato
export function updateNodeList() {
    const select = document.getElementById('startNode');
    select.innerHTML = '<option value="">Select a node</option>';
    
    const cy = getCy();
    cy.nodes().forEach(node => {
        const option = new Option(node.data('label'), node.id());
        select.add(option);
    });
} 