<?php
require_once 'config/database.php';

echo "=== Fixing Remaining Empty Category Values ===\n\n";

try {
    $db = new Database();
    $pdo = $db->getConnection();
    
    // Get all products with empty categories
    echo "Remaining products with empty categories:\n";
    $stmt = $pdo->query("SELECT id, sku_code, name FROM products WHERE category = '' OR category IS NULL ORDER BY id");
    $emptyProducts = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($emptyProducts as $p) {
        echo "  {$p['id']}: {$p['sku_code']} - {$p['name']}\n";
    }
    
    echo "\nSetting all remaining to default category 'dry_food'...\n";
    
    // Set all remaining empty to dry_food
    $updateStmt = $pdo->prepare("UPDATE products SET category = 'dry_food' WHERE category = '' OR category IS NULL");
    $result = $updateStmt->execute();
    $count = $updateStmt->rowCount();
    
    echo "✅ Updated {$count} products\n\n";
    
    echo "=== Final Category Summary ===\n";
    $stmt = $pdo->query("SELECT category, COUNT(*) as count FROM products GROUP BY category ORDER BY category");
    $summary = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($summary as $row) {
        $catName = $row['category'] ? $row['category'] : '(empty)';
        echo "  {$catName}: {$row['count']} products\n";
    }
    
    echo "\n✅ All categories fixed!\n";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
?>
