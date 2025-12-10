<?php
require_once 'config/database.php';

echo "=== Database Schema Check ===\n\n";

try {
    $db = new Database();
    $pdo = $db->getConnection();
    
    // Get the enum values from the table schema
    $stmt = $pdo->query("SHOW COLUMNS FROM products LIKE 'animal_type'");
    $column = $stmt->fetch(PDO::FETCH_ASSOC);
    
    echo "Column Definition for animal_type:\n";
    echo "  Type: " . $column['Type'] . "\n";
    echo "  Null: " . $column['Null'] . "\n";
    echo "  Default: " . $column['Default'] . "\n";
    
    echo "\n=== Sample Products ===\n";
    $stmt = $pdo->query("SELECT id, sku_code, name, animal_type FROM products LIMIT 5");
    $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($products as $p) {
        echo "  ID: {$p['id']}, SKU: {$p['sku_code']}, Name: {$p['name']}, Animal: '{$p['animal_type']}'\n";
    }
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
?>
