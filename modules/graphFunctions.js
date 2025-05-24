import { getCy } from './graph.js';
import { resetStraightEdges } from './algorithms.js';

export let nodeCounter = 1;
let sourceNode = null;
let px, py;
let cas;
let num, prob, source, target;

export function getNextNodeId() {
  return `node-${nodeCounter++}`;
}

export function getNodeLabel() {
  return `${nodeCounter - 1}`;
}

export function resetNodeCounter() {
  nodeCounter = 1;
}

export function setNodeCounter(value) {
  nodeCounter = value;
}

export function getNodeCounter() {
  return nodeCounter;
}

export function clearGraph() {
    const cy = getCy();
    cy.elements().remove();
    resetNodeCounter();
  
    const select = document.getElementById("startNode");
    if (select) select.innerHTML = ''; // svuota dropdown
}


//funzione per aggiungere nodo in posizione x, y
export function addNodeAt(x, y,px,py) {
  const cy = getCy();
  const label = `${nodeCounter}`;
  const id = `node-${nodeCounter++}`;
  const newNode = cy.add({
      group: 'nodes',
      data: { id, label, state:"UNEXPLORED" },
      position: { x, y }
  });
  const select = document.getElementById("startNode");
  const option = new Option(newNode.data("label"), newNode.id());
  select.add(option);
  
  newNode.position({ x:px, y: py}); // animazione in ingresso
  newNode.animate({
      position: { x, y },
      duration: 800,
      easing: 'ease-in-out'
  });
}
  
//selezione source dell'arco
export function selectSource(evt) {
  const cy = getCy();
  sourceNode = evt.target;
  sourceNode.addClass("active");
  cy.nodes().removeListener('tap', selectSource);
  cy.nodes().on('tap', selectTarget);
  document.getElementById('statusBar').textContent = 'Click on a target node';
}

//selezione target dell'arco
export function selectTarget(evt) {
  const cy = getCy();
  const targetNode = evt.target;
  if(sourceNode){ sourceNode.removeClass("active");
  if (sourceNode.id() !== targetNode.id()) {
    addEdge(sourceNode.id(), targetNode.id());
    document.getElementById('statusBar').textContent = 'Edge added';
  } else {
    document.getElementById('statusBar').textContent = 'Cannot connect a node to itself';
  }
}
  sourceNode = null;
  cy.nodes().removeListener('tap', selectTarget);
  cy.nodes().on('tap', selectSource);
}


//funzione per aggiungere l'arco da source a target
export function addEdge(sourceId, targetId,DirUndir = true) {
  const cy = getCy();
  const id = `${sourceId}-${targetId}`;
  
  // Check if edge already exists in the same direction
  const existingEdge = cy.edges().filter(edge => 
    edge.id() === id
  );
  
  if (existingEdge.length > 0) {
    //alert('L\'arco esiste già');
    document.getElementById('statusBar').textContent = 'L\'arco esiste già';
    return;
  }
  
  cy.add({
    group: 'edges',
    data: { 
      id, 
      source: sourceId, 
      target: targetId,
      weight: 1,  // Default a 1
      directed: DirUndir, //Default diretto
      type: "none"
    }
  });
  let arrow='none';
  if(DirUndir==true){
    arrow='triangle';
  }
  let edge = cy.getElementById(id);
  edge.style({
    'target-arrow-shape': arrow
  });

}

export function getSourceNode(){
  return sourceNode;
}

export function generateRandomGraph(radius) {
  
  
  resetStraightEdges();
  const numNodes = parseInt(document.getElementById('nodeCount').value) || 10;
  const numEdges = parseInt(document.getElementById('edgeProbability').value) || 15;
  const cy = getCy();
  clearGraph();
  cy.zoom(1); // reset zoom
  cy.center();

  for (let i = 0; i < numNodes; i++) {
    //genero casualmente su un cerchio la posizione di arrivo
    const pan = cy.pan();   // pan.x, pan.y
    const zoom = cy.zoom(); // livello di zoom

    const width = cy.container().clientWidth;
    const height = cy.container().clientHeight;

    // Calcolo centro visibile tenendo conto di pan e zoom
    const centerX = (width / 2 - pan.x) / zoom;
    const centerY = (height / 2 - pan.y) / zoom;
    
    //const radius=350;
    const angle = (2 * Math.PI * i) / numNodes;
    
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
   //genero casualmente la posizione di partenza animazione
    cas=Math.random();
    const radius2=800;
    const angle2 = 2 * Math.PI *cas;
     px = centerX+ radius2 * Math.cos(angle2);
     py = centerY+ radius2 * Math.sin(angle2);
    addNodeAt(x, y,px,py);
  }
  const allNodes = cy.nodes();
let edgeCount = 0;
prob=parseInt(document.getElementById("edgeProbability").value);
let DirUndir = document.getElementById("switchDirUndir").checked;

for(let i=0;i<allNodes.length;i++){
  for(let j=i+1;j<allNodes.length;j++){
  if(i!=j){
    num=(Math.random()*100)+1;
    if(num<=prob){
      source=allNodes[i];
      target=allNodes[j];
      addEdge(source.id(),target.id(), DirUndir);
    }
    }
  }
}
if(document.getElementById("unitWeights").checked){
cy.edges().forEach(edge => {
  edge.data("weight",1);
});
}
else{
  cy.edges().forEach(edge => {
    edge.data("weight",Math.floor(Math.random()*10)+1);
  });
}


}