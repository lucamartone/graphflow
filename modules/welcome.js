export function initWelcomeModal() {
    const welcomeModal = document.getElementById('welcomeModal');
    const startButton = document.getElementById('startButton');

    // Mostra il popup solo se l'utente non è stato collegato di recente (entro le ultime 24 ore)
    window.addEventListener('load', () => {
        const lastVisit = localStorage.getItem('lastVisit');
        const now = new Date().getTime();
        const oneDay = 24 * 60 * 60 * 1000; // 24 ore in millisecondi

        if (!lastVisit || (now - parseInt(lastVisit)) > oneDay) {
            welcomeModal.classList.add('active');
        }
    });

    // Chiudi il popup quando si clicca il pulsante di inizio e salva la data dell'ultima visita
    startButton.addEventListener('click', () => {
        welcomeModal.classList.remove('active');
        localStorage.setItem('lastVisit', new Date().getTime().toString());
    });

    // Chiudi il popup quando si clicca fuori dal contenuto e salva la data dell'ultima visita
    welcomeModal.addEventListener('click', (e) => {
        if (e.target === welcomeModal) {
            welcomeModal.classList.remove('active');
            localStorage.setItem('lastVisit', new Date().getTime().toString());
        }
    });
} 