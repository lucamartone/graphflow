<?php
session_start();

// Pulisci cookies impostandoli come scaduti un ora fa
setcookie('user_id', '', time() - 3600, '/');
setcookie('username', '', time() - 3600, '/');

session_destroy();
header("Location: ../index.html");
exit();
?> 