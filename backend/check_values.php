<?php
require_once 'config/database.php';

echo "=== Checking Category and Animal Type Values ===\n\n";

try {
    $db = new Database();
    $pdo = $db->getConnection();
    
    echo "=== Distinct Categories ===\n";
    $stmt = $pdo->query("SELECT DISTINCT category FROM products ORDER BY category");
    $categories = $stmt->fetchAll(PDO::FETCH_COLUMN);
    foreach ($categories as $cat) {
        echo "  - '" . ($cat ? $cat : '(empty)') . "'\n";
    }
    
    echo "\n=== Distinct Animal Types ===\n";
    $stmt = $pdo->query("SELECT DISTINCT animal_type FROM products ORDER BY animal_type");
    $animals = $stmt->fetchAll(PDO::FETCH_COLUMN);
    foreach ($animals as $animal) {
        echo "  - '" . ($animal ? $animal : '(empty)') . "'\n";
    }
    
    echo "\n=== Sample Products with Values ===\n";
    $stmt = $pdo->query("SELECT id, name, category, animal_type FROM products LIMIT 10");
    $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
    foreach ($products as $p) {
        echo "  {$p['id']}: {$p['name']} | Category: '{$p['category']}' | Animal: '{$p['animal_type']}'\n";
    }
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
?>
