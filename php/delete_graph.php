<?php
session_start();
require_once 'config.php';

if (!isset($_SESSION['username'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Utente non autenticato']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Metodo non consentito']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['id'])) {
    http_response_code(400);
    echo json_encode(['error' => 'ID grafo mancante']);
    exit;
}

try {
    $query = "DELETE FROM graphs WHERE id = $1 AND username = $2";
    $result = pg_prepare($db, "delete_graph", $query);
    $result = pg_execute($db, "delete_graph", [$data['id'], $_SESSION['username']]);

    if ($result) {
        echo json_encode(['success' => true]);
    } else {
        throw new Exception(pg_last_error($db));
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Errore nell\'eliminazione del grafo: ' . $e->getMessage()]);
}
?> 