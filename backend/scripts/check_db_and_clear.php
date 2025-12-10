<?php
require_once __DIR__ . '/../config/database.php';

$database = new Database();
$db = $database->getConnection();

// Check existing products
$stmt = $db->prepare("SELECT COUNT(*) as total FROM products");
$stmt->execute();
$result = $stmt->fetch(PDO::FETCH_ASSOC);
echo "Total products in DB: " . $result['total'] . "\n";

// List first 10 SKU codes
$stmt = $db->prepare("SELECT id, sku_code, name FROM products LIMIT 10");
$stmt->execute();
$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
echo "\nFirst 10 SKU codes:\n";
foreach ($rows as $row) {
    echo "  ID: {$row['id']}, SKU: {$row['sku_code']}, Name: {$row['name']}\n";
}

// Check if we have the 'role' column in users table
$stmt = $db->prepare("DESCRIBE users");
$stmt->execute();
$columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
echo "\nUsers table columns:\n";
foreach ($columns as $col) {
    echo "  {$col['Field']}\n";
}
?>
