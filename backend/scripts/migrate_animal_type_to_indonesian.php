<?php
require_once __DIR__ . '/../config/database.php';

$database = new Database();
$db = $database->getConnection();

try {
    echo "Starting animal_type migration...\n";
    
    // Step 1: Update existing data - map old values to new values
    $updates = [
        'dog' => 'anjing',
        'cat' => 'kucing',
        'all' => 'semua'
    ];
    
    foreach ($updates as $oldValue => $newValue) {
        $sql = "UPDATE products SET animal_type = ? WHERE animal_type = ?";
        $stmt = $db->prepare($sql);
        $stmt->execute([$newValue, $oldValue]);
        $count = $stmt->rowCount();
        echo "  Updated $count rows: $oldValue -> $newValue\n";
    }
    
    // Step 2: Modify ENUM to new values
    $sql = "ALTER TABLE products MODIFY animal_type ENUM('anjing','kucing','semua') NOT NULL";
    $db->exec($sql);
    echo "✅ animal_type enum updated successfully\n";
    
    // Verify
    $stmt = $db->query("SELECT DISTINCT animal_type FROM products ORDER BY animal_type");
    $results = $stmt->fetchAll(PDO::FETCH_COLUMN);
    echo "\nCurrent animal_type values in database:\n";
    foreach ($results as $val) {
        echo "  - $val\n";
    }
    
} catch (PDOException $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
?>
