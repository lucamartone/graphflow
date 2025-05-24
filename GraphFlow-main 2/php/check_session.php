<?php
session_start();
//permette di vedere la sezione saved graph solo se sei loggato
if (!isset($_SESSION['user_id'])) {
    header("Location: ../index.html");
    exit();
}
?> 