import { setupSavedGraphs } from './savedGraphs.js';

const userIcon = document.getElementById('userIcon');
const dropdownMenu = document.getElementById('dropdownMenu');
const loginModal = document.getElementById('loginModal');
const registerModal = document.getElementById('registerModal');
const closeButtons = document.querySelectorAll('.close-modal');
const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');
const logoutBtn = document.getElementById('logoutBtn');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');

function updateMenuState(isLoggedIn, username = null) {
    const savedGraphsSection = document.getElementById('savedGraphsSection');
    
    if (isLoggedIn) {
        loginBtn.style.display = 'none';
        registerBtn.style.display = 'none';
        logoutBtn.style.display = 'block';
        userIcon.classList.add('logged-in');
        /*document.getElementById('status').textContent = `Logged in as ${username}`;*/
        savedGraphsSection.style.display = 'block';
    } else {
        loginBtn.style.display = 'block';
        registerBtn.style.display = 'block';
        logoutBtn.style.display = 'none';
        userIcon.classList.remove('logged-in');
        /*document.getElementById('status').textContent = 'Not logged in';*/
        savedGraphsSection.style.display = 'none';
    }
}

//controlla se l'utente è loggato con chiamata a check_auth.php a ggiorna interfaccia di conseguenza, in base alla risposta data
async function checkAuthStatus() {
    try {
        const response = await fetch('php/check_auth.php');
        const data = await response.json();
        
        if (data.success) {
            updateMenuState(true, data.username);
            setupSavedGraphs(data.username);
        } else {
            updateMenuState(false);
        }
    } catch (error) {
        console.error('Error checking auth status:', error);
        updateMenuState(false);
    }
}

//gestisce apertura/chiusura menu, submit di login e registrazione
export function setupAuth() {
    checkAuthStatus(); //controlla se utente loggato
    
    updateMenuState(false);

    userIcon.addEventListener('click', (e) => {
        e.stopPropagation();
        const isActive = dropdownMenu.classList.contains('active');
        
        document.querySelectorAll('.dropdown-menu.active').forEach(menu => {
            if (menu !== dropdownMenu) {
                menu.classList.remove('active');
            }
        });
        
        if (!isActive) {
            dropdownMenu.classList.add('active');
        } else {
            dropdownMenu.classList.remove('active');
        }
    });

    document.addEventListener('click', (e) => {
        if (!userIcon.contains(e.target) && !dropdownMenu.contains(e.target)) {
            dropdownMenu.classList.remove('active');
        }
    });

    loginBtn.addEventListener('click', () => {
        dropdownMenu.classList.remove('active');
        loginModal.classList.add('active');
        document.getElementById('username').focus();
    });

    registerBtn.addEventListener('click', () => {
        dropdownMenu.classList.remove('active');
        registerModal.classList.add('active');
        document.getElementById('regUsername').focus();
    });

    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            loginModal.classList.remove('active');
            registerModal.classList.remove('active');
        });
    });

    window.addEventListener('click', (e) => {
        if (e.target === loginModal) {
            loginModal.classList.remove('active');
        }
        if (e.target === registerModal) {
            registerModal.classList.remove('active');
        }
    });

    logoutBtn.addEventListener('click', () => {
        fetch('php/logout.php')
            .then(response => response.text())
            .then(() => {
                updateMenuState(false);
                dropdownMenu.classList.remove('active');
            })
            .catch(error => console.error('Error:', error));
    });

    if (loginForm) {
        loginForm.addEventListener('submit', async function (e) {
            e.preventDefault(); //blocca l'invio di deafult del form, che ricaricherebbe la pagina, invece vogliamo gestire con AJAX
            const formData = new FormData(this); //crea oggetto formData con i dati inseriti dall'utente
    
            // Rimuove eventuali vecchi messaggi di errore
            const oldError = loginForm.querySelector('.error-message');
            if (oldError) oldError.remove();
    
            try {
                const response = await fetch('php/login.php', {
                    method: 'POST',
                    body: formData
                });
    
                const text = await response.text();
                console.log("Risposta server login (grezza):", text);
    
                const data = JSON.parse(text);
    
                if (!response.ok || !data.success) {
                    const errorDiv = document.createElement('div');
                    errorDiv.className = 'error-message';
                    errorDiv.textContent = data.message || 'Errore durante il login.';
                    loginForm.insertBefore(errorDiv, loginForm.firstChild);
                    return;
                }
    
                const username = formData.get('username');
                updateMenuState(true, username);
                setupSavedGraphs(username);
                loginModal.classList.remove('active');
                loginForm.reset();
    
            } catch (err) {
                const errorDiv = document.createElement('div');
                errorDiv.className = 'error-message';
                errorDiv.textContent = 'Errore di rete o server.';
                loginForm.insertBefore(errorDiv, loginForm.firstChild);
                console.error("Errore di rete:", err);
            }
        });
    }
    
    

    if (registerForm) {
        registerForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            const formData = new FormData(this);
    
            // Rimuove eventuali vecchi messaggi di errore
            const oldError = registerForm.querySelector('.error-message');
            if (oldError) oldError.remove();
    
            try {
                const response = await fetch('php/register.php', {
                    method: 'POST',
                    body: formData
                });
    
                const text = await response.text();
    
                const data = JSON.parse(text);
    
                /*in caso di errore crea <div class="error-message">Errore di connesione al database. </div>*/
                if (!response.ok || !data.success) {
                    const errorDiv = document.createElement('div');
                    errorDiv.className = 'error-message';
                    errorDiv.textContent = data.message || 'Errore durante la registrazione.';
                    registerForm.insertBefore(errorDiv, registerForm.firstChild);
                    return;
                }
    
                /* se non c'è errore, siamo dentro correttamente */
                const username = formData.get('username');
                updateMenuState(true, username);
                setupSavedGraphs(username);
                registerModal.classList.remove('active');
                registerForm.reset();
    
            } catch (err) {
                const errorDiv = document.createElement('div');
                errorDiv.className = 'error-message';
                errorDiv.textContent = 'Errore di rete o server.';
                registerForm.insertBefore(errorDiv, registerForm.firstChild);
                console.error("Errore:", err);
            }
        });
    }
} 