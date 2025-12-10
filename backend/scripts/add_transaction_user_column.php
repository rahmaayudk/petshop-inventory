<?php
// Migration: add user_id column to transactions table (nullable)
require_once __DIR__ . '/../config/database.php';

$database = new Database();
$db = $database->getConnection();

try {
    // Attempt to add column directly
    $db->exec("ALTER TABLE transactions ADD COLUMN user_id INT NULL AFTER id");
    echo "OK: user_id column added or already exists\n";
} catch (PDOException $e) {
    // Fallback: check and add if not exists
    try {
        $check = $db->query("SHOW COLUMNS FROM transactions LIKE 'user_id'")->fetchAll(PDO::FETCH_ASSOC);
        if (empty($check)) {
            $db->exec("ALTER TABLE transactions ADD COLUMN user_id INT NULL AFTER id");
            echo "OK: user_id column added\n";
        } else {
            echo "SKIP: user_id column already exists\n";
        }
    } catch (Exception $ex) {
        echo "ERROR: " . $ex->getMessage() . "\n";
    }
}

// Note: This migration is safe to run multiple times. It does not add a foreign key.

?>
