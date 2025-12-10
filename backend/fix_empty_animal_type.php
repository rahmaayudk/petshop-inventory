<?php
require_once 'config/database.php';

echo "=== Fixing animal_type empty values ===\n\n";

try {
    $db = new Database();
    $pdo = $db->getConnection();
    
    // Update empty values to default 'semua' (all animals)
    $stmt = $pdo->prepare("UPDATE products SET animal_type = 'semua' WHERE animal_type = '' OR animal_type IS NULL");
    $stmt->execute();
    $updatedCount = $stmt->rowCount();
    
    echo "✅ Updated {$updatedCount} products with empty animal_type to 'semua'\n\n";
    
    echo "=== Current animal_type values ===\n";
    $stmt = $pdo->query('SELECT DISTINCT animal_type, COUNT(*) as count FROM products GROUP BY animal_type ORDER BY animal_type');
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($results as $row) {
        echo "  {$row['animal_type']}: {$row['count']} products\n";
    }
    
    echo "\n✅ Fix completed successfully!\n";
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
?>
