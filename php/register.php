<?php
header('Content-Type: application/json');
session_start();
require_once 'config.php';

// Se la connessione è fallita, invia il messaggio Connessione al database fallita
if (isset($_SESSION['db_error'])) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $_SESSION['db_error']
    ]);
    unset($_SESSION['db_error']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Metodo non consentito'
    ]);
    exit;
}

// Recupera dati dal form
$username = $_POST['username'] ?? '';
$email = $_POST['email'] ?? '';
$password = $_POST['password'] ?? '';
$confirmPassword = $_POST['confirmPassword'] ?? '';

// Campi obbligatori
if (!$username || !$email || !$password || !$confirmPassword) {
    echo json_encode([
        'success' => false,
        'message' => 'Tutti i campi sono obbligatori'
    ]);
    exit;
}

if ($password !== $confirmPassword) {
    echo json_encode([
        'success' => false,
        'message' => 'Le password non coincidono'
    ]);
    exit;
}

// Hash password
$hashedPassword = password_hash($password, PASSWORD_DEFAULT);

// Verifica se esiste già
$checkQuery = "SELECT email FROM users WHERE username = $1 OR email = $2";
$checkResult = pg_query_params($db, $checkQuery, array($username, $email));

if (pg_num_rows($checkResult) > 0) {
    echo json_encode([
        'success' => false,
        'message' => 'Username o email già in uso'
    ]);
    exit;
}

// Inserimento dati nel db
$insertQuery = "INSERT INTO users (username, email, password) VALUES ($1, $2, $3)";
$insertResult = pg_query_params($db, $insertQuery, array($username, $email, $hashedPassword));

if ($insertResult) {
    $_SESSION['user_id'] = $email; #uso email come identificativo perchè non ho messo id nella tabella
    $_SESSION['username'] = $username;

    // Set cookies per 30 giorni
    $cookie_expiry = time() + (30 * 24 * 60 * 60);
    setcookie('user_id', $email, $cookie_expiry, '/', '', true, true);
    setcookie('username', $username, $cookie_expiry, '/', '', true, true);

    echo json_encode([
        'success' => true,
        'message' => 'Registrazione completata'
    ]);
    exit;
} else {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Errore durante la registrazione: Riprova'
    ]);
    exit;
}
?>