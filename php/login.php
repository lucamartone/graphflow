<?php
header('Content-Type: application/json'); 
session_start();
require_once 'config.php';

// Verifica se connessione fallita
if (isset($_SESSION['db_error'])) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $_SESSION['db_error']
    ]);
    unset($_SESSION['db_error']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    //controlla se sono stati inseriti username e password
    if (!isset($_POST['username'], $_POST['password'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Parametri mancanti']);
        exit;
    }

    $username = $_POST['username'];
    $password = $_POST['password'];
//query che ricerca username e password nel db
    $query = "SELECT * FROM users WHERE username = $1";
    $result = pg_query_params($db, $query, array($username));

    if ($result && $row = pg_fetch_assoc($result)) {
        //verifica correttezza della password
        if (password_verify($password, $row['password'])) {
            $_SESSION['user_id'] = $row['email']; #uso email come identificativo, altrimenti potrei aggiungere id nella tabella del db
            $_SESSION['username'] = $row['username'];
            
            // Set cookies per 30 giorni
            $cookie_expiry = time() + (30 * 24 * 60 * 60);
            setcookie('user_id', $row['email'], $cookie_expiry, '/', '', true, true);
            setcookie('username', $row['username'], $cookie_expiry, '/', '', true, true);
            
            echo json_encode(['success' => true, 'message' => 'Login riuscito']);
            exit;
        } else {
            echo json_encode(['success' => false, 'message' => 'Password errata']);
            exit;
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'Utente non trovato']);
        exit;
    }
}

#else (non è metodo POST)
http_response_code(405);
echo json_encode(['success' => false, 'message' => 'Metodo non consentito']);
?>
