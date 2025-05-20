<?php
session_start();
require_once 'config.php';

if (!isset($_SESSION['username'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Utente non autenticato']);
    exit;
}

try {
    $query = "SELECT id, name, nodes, edges, created_at FROM graphs WHERE username = $1 ORDER BY created_at DESC";
    $result = pg_prepare($db, "get_graphs", $query);
    $result = pg_execute($db, "get_graphs", [$_SESSION['username']]);

    if ($result) {
        $graphs = [];
        while ($row = pg_fetch_assoc($result)) {
            $graphs[] = [ //[] non sovrascrive il vecchio array ma ne aggiunge un altro in coda a graphs
                'id' => $row['id'],
                'name' => $row['name'],
                'nodes' => json_decode($row['nodes'], true),
                'edges' => json_decode($row['edges'], true),
                'created_at' => $row['created_at']
            ];
        }
        echo json_encode(['success' => true, 'graphs' => $graphs]);
    } else {
        throw new Exception(pg_last_error($db));
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Errore nel recupero dei grafi: ' . $e->getMessage()]);
}
?> 