<?php
require_once __DIR__ . '/../config/database.php';

$database = new Database();
$db = $database->getConnection();

try {
    // Modify products table category ENUM to include 'barang'
    $sql = "ALTER TABLE products MODIFY category ENUM('dry_food', 'wet_food', 'snack', 'sand', 'barang') NOT NULL";
    $db->exec($sql);
    echo "OK: kategori 'barang' berhasil ditambahkan\n";
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
