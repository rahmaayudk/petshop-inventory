<?php
require_once 'config/database.php';

echo "=== Checking Category ENUM Definition ===\n\n";

try {
    $db = new Database();
    $pdo = $db->getConnection();
    
    // Get the enum definition
    $stmt = $pdo->query("SHOW COLUMNS FROM products LIKE 'category'");
    $column = $stmt->fetch(PDO::FETCH_ASSOC);
    
    echo "Column Definition:\n";
    echo "  Type: " . $column['Type'] . "\n";
    echo "  Null: " . $column['Null'] . "\n";
    echo "  Default: " . ($column['Default'] ? $column['Default'] : '(no default)') . "\n";
    
    echo "\n=== Trying Different Update Approaches ===\n";
    
    // Try with explicit value
    echo "\nApproach 1: Direct assignment with quoted value\n";
    $stmt = $pdo->prepare("UPDATE products SET category = 'dry_food' WHERE (category = '' OR category IS NULL) LIMIT 5");
    $stmt->execute();
    echo "Rows updated: " . $stmt->rowCount() . "\n";
    
    // Check if it worked
    $stmt = $pdo->query("SELECT COUNT(*) as empty_count FROM products WHERE category = '' OR category IS NULL");
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    echo "Remaining empty: " . $result['empty_count'] . "\n";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "Error Code: " . $e->getCode() . "\n";
}
?>
