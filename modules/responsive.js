import { getCy } from './graph.js';

export function initResponsiveMenu() {
    let cy=getCy();
    const menuButton = document.getElementById('menuButton');
    const sidebar = document.querySelector('.sidebar');
    const sidebarButtons = sidebar.querySelectorAll('button');
    const graphContainer = document.getElementById('graph-container');
    const statusBar=document.getElementById('statusBar');

    // Solo per mobile
    if (window.innerWidth <= 768) {
        // Toggle sidebar quando si clicca su menu
       
        menuButton.addEventListener('click', () => {
            sidebar.classList.toggle('active');
            //il grafo diventa più opaco
            graphContainer.style.opacity = sidebar.classList.contains('active') ? '0.8' : '1';
            statusBar.classList.add('reduced');
        });

        // Chiude sidebar quando si clicca pulsante interno alla sidebar
        sidebarButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Non chiudere la sidebar per i pulsanti di add node/edge
                setTimeout(()=>{
                    sidebar.classList.remove('active');
                    graphContainer.style.opacity = '1'; //grafo torna visibile
                },500); 
            });
        });



        // Chiude la sidebar cliccando fuori da essa, non la chiuse se stiamo aggiungendo archi o nodi
        cy.on('tap', (e)=>{
                const addNodeButton = document.getElementById('addNode');
                const addEdgeButton = document.getElementById('addEdge');
                if ((!addNodeButton || !addNodeButton.classList.contains('active')) && 
                    (!addEdgeButton || !addEdgeButton.classList.contains('active'))) {
                    sidebar.classList.remove('active');
                    graphContainer.style.opacity = '1';
                }
                
        });
    }

    // Gestisce il ridimensionamento della finestra 
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            // comportamento desktop
            sidebar.classList.remove('active');
            graphContainer.style.opacity = '1';
            sidebar.style.left = '';
            sidebar.style.position = 'relative';
        } else {
            // comportamento mobile
            sidebar.style.position = 'fixed';
            sidebar.style.left = '-100%';
        }
    });
} 