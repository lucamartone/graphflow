<?php
session_start();
header('Content-Type: application/json');

// Check se utente è autenticato via sessione o cookie
if (isset($_SESSION['user_id']) || (isset($_COOKIE['user_id']) && isset($_COOKIE['username']))) {
    // Se c'è cookie e session scaduta, ripristina sessione
    if (!isset($_SESSION['user_id']) && isset($_COOKIE['user_id'])) {
        $_SESSION['user_id'] = $_COOKIE['user_id'];
        $_SESSION['username'] = $_COOKIE['username'];
    }
    
    echo json_encode([
        'success' => true,
        'username' => $_SESSION['username']
    ]);
} else {
    echo json_encode([
        'success' => false,
        'message' => 'Not authenticated'
    ]);
}
?> 