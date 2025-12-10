<?php
require_once 'config/database.php';

echo "=== Verifying animal_type Migration ===\n\n";

try {
    $db = new Database();
    $pdo = $db->getConnection();
    
    $stmt = $pdo->query('SELECT DISTINCT animal_type FROM products ORDER BY animal_type');
    $results = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    echo "Current animal_type values in database:\n";
    if (empty($results)) {
        echo "  (No products found)\n";
    } else {
        foreach ($results as $val) {
            echo "  - " . $val . "\n";
        }
    }
    
    echo "\n=== Product Count by Animal Type ===\n";
    $stmt = $pdo->query('SELECT animal_type, COUNT(*) as count FROM products GROUP BY animal_type ORDER BY animal_type');
    $counts = $stmt->fetchAll(PDO::FETCH_ASSOC);
    foreach ($counts as $row) {
        echo "  " . $row['animal_type'] . ": " . $row['count'] . " products\n";
    }
    
    echo "\n✅ Migration verified successfully!\n";
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
?>
