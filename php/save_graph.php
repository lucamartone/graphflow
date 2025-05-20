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

if (!isset($data['name']) || !isset($data['nodes']) || !isset($data['edges'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Dati mancanti']);
    exit;
}

try {
    $query = "INSERT INTO graphs (username, name, nodes, edges) VALUES ($1, $2, $3, $4) RETURNING id";
    $result = pg_prepare($db, "insert_graph", $query);
    $result = pg_execute($db, "insert_graph", [
        $_SESSION['username'],
        $data['name'],
        json_encode($data['nodes']),
        json_encode($data['edges'])
    ]);

    if ($result) {
        $row = pg_fetch_assoc($result);
        echo json_encode(['success' => true, 'id' => $row['id']]);
    } else {
        throw new Exception(pg_last_error($db));
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Errore nel salvataggio del grafo: ' . $e->getMessage()]);
}
?> 