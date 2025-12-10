<?php
require_once __DIR__ . '/../config/database.php';
try {
    $database = new Database();
    $db = $database->getConnection();
    $db->exec("ALTER TABLE `transactions` ADD COLUMN `notes` TEXT DEFAULT NULL");
    echo "ALTER OK\n";
} catch (Exception $e) {
    echo "ERR: " . $e->getMessage() . "\n";
}
?>