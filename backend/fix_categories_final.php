<?php
require_once 'config/database.php';

echo "=== Fixing Empty Category Values with Correct ENUM ===\n\n";

try {
    $db = new Database();
    $pdo = $db->getConnection();
    
    echo "Current ENUM values in database: 'makanan_kering', 'makanan_basah', 'snack', 'pasir', 'barang'\n\n";
    
    // First identify products with empty categories
    echo "Products with empty categories (before fix):\n";
    $stmt = $pdo->query("SELECT id, sku_code, name FROM products WHERE category = '' OR category IS NULL LIMIT 5");
    $preview = $stmt->fetchAll(PDO::FETCH_ASSOC);
    foreach ($preview as $p) {
        echo "  - {$p['sku_code']}: {$p['name']}\n";
    }
    
    echo "\nUpdating empty categories to 'makanan_kering'...\n";
    
    // Update with correct ENUM value
    $stmt = $pdo->prepare("UPDATE products SET category = 'makanan_kering' WHERE category = '' OR category IS NULL");
    $stmt->execute();
    $count = $stmt->rowCount();
    
    echo "✅ Updated {$count} products\n\n";
    
    // Verify the fix
    echo "=== Category Summary After Fix ===\n";
    $stmt = $pdo->query("SELECT category, COUNT(*) as count FROM products GROUP BY category ORDER BY category");
    $summary = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($summary as $row) {
        echo "  {$row['category']}: {$row['count']} products\n";
    }
    
    echo "\n✅ All categories fixed!\n";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
?>
