<?php
require_once 'config/database.php';

echo "=== Fixing Empty Category Values ===\n\n";

try {
    $db = new Database();
    $pdo = $db->getConnection();
    
    // First, let's see which products have empty categories
    echo "Products with empty categories:\n";
    $stmt = $pdo->query("SELECT id, sku_code, name FROM products WHERE category = '' OR category IS NULL LIMIT 15");
    $emptyProducts = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($emptyProducts as $p) {
        echo "  {$p['id']}: {$p['sku_code']} - {$p['name']}\n";
    }
    
    echo "\n";
    
    // Determine appropriate category based on SKU code or name
    foreach ($emptyProducts as $p) {
        $sku = strtoupper($p['sku_code']);
        $name = strtolower($p['name']);
        $category = 'dry_food'; // default
        
        // Try to guess from SKU
        if (strpos($sku, 'WET') !== false) {
            $category = 'wet_food';
        } elseif (strpos($sku, 'DRY') !== false) {
            $category = 'dry_food';
        } elseif (strpos($sku, 'SNACK') !== false) {
            $category = 'snack';
        } elseif (strpos($sku, 'PSR') !== false || strpos($sku, 'SAND') !== false) {
            $category = 'sand';
        } elseif (strpos($sku, 'BRNG') !== false) {
            $category = 'barang';
        } else if (strpos($name, 'pasir') !== false || strpos($name, 'sand') !== false || strpos($name, 'litter') !== false) {
            $category = 'sand';
        } else if (strpos($name, 'snack') !== false || strpos($name, 'snacks') !== false) {
            $category = 'snack';
        } else if (strpos($name, 'wet') !== false || strpos($name, 'basah') !== false) {
            $category = 'wet_food';
        }
        
        echo "Setting product {$p['id']} ({$p['sku_code']}) to category: {$category}\n";
        
        $updateStmt = $pdo->prepare("UPDATE products SET category = ? WHERE id = ?");
        $updateStmt->execute([$category, $p['id']]);
    }
    
    echo "\n=== Summary After Fix ===\n";
    $stmt = $pdo->query("SELECT category, COUNT(*) as count FROM products GROUP BY category ORDER BY category");
    $summary = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($summary as $row) {
        $catName = $row['category'] ? $row['category'] : '(empty)';
        echo "  {$catName}: {$row['count']} products\n";
    }
    
    echo "\n✅ Category fix completed!\n";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
?>
