export function initWelcomeModal() {
    const welcomeModal = document.getElementById('welcomeModal');
    const startButton = document.getElementById('startButton');

    // Mostra il popup quando la pagina è caricata
    window.addEventListener('load', () => {
        welcomeModal.classList.add('active');
    });

    // Chiudi il popup quando si clicca il pulsante di inizio
    startButton.addEventListener('click', () => {
        welcomeModal.classList.remove('active');
    });

    // Chiudi il popup quando si clicca fuori dal contenuto
    welcomeModal.addEventListener('click', (e) => {
        if (e.target === welcomeModal) {
            welcomeModal.classList.remove('active');
        }
    });
} 