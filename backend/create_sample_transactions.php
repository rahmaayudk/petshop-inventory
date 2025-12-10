<?php
require_once 'config/database.php';

echo "=== Creating Sample Transactions for Report Testing ===\n\n";

try {
    $db = new Database();
    $pdo = $db->getConnection();
    
    // Get all products
    $stmt = $pdo->query("SELECT id, name FROM products LIMIT 5");
    $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "Creating transactions for products:\n";
    
    // Create transactions with proper dates
    $dates = array(
        '2025-11-25' => array('type' => 'in', 'qty' => 10),
        '2025-11-28' => array('type' => 'out', 'qty' => 3),
        '2025-12-01' => array('type' => 'in', 'qty' => 15),
        '2025-12-05' => array('type' => 'out', 'qty' => 5),
        '2025-12-08' => array('type' => 'out', 'qty' => 2)
    );
    
    $transaction_count = 0;
    
    foreach ($products as $product) {
        foreach ($dates as $date => $trans) {
            $stmt = $pdo->prepare("INSERT INTO transactions (product_id, type, qty, date, created_at) VALUES (?, ?, ?, ?, NOW())");
            
            if ($stmt->execute(array($product['id'], $trans['type'], $trans['qty'], $date))) {
                $transaction_count++;
            }
        }
    }
    
    echo "Created $transaction_count transactions\n\n";
    
    // Verify
    echo "=== Transactions Summary ===\n";
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM transactions");
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    echo "Total transaksi di database: " . $result['total'] . "\n\n";
    
    echo "✅ Sample data created successfully!\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>

