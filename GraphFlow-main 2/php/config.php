<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

$db = @pg_connect("host=localhost port=5432 dbname=graphflow user=postgres password=0000");
#$db = @pg_connect("host=localhost port=5432 dbname=provaAle2 user=postgres password=1111");
#$db = @pg_connect("host=localhost port=5432 dbname=graphflow user=postgres password=9999"); #credenziali SBAGLIATE
#$db = @pg_connect("host=localhost port=5432 dbname=graphflow user=postgres password=1234");

if (!$db) {
    $_SESSION['db_error'] = "Connessione al database fallita.";
    return;
}
?>