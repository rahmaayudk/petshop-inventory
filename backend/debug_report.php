<?php
require_once 'config/database.php';

echo "=== Debugging Laporan Data ===\n\n";

try {
    $db = new Database();
    $pdo = $db->getConnection();
    
    echo "=== Total Transactions in Database ===\n";
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM transactions");
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    echo "Total transaksi: " . $result['count'] . "\n\n";
    
    echo "=== Sample Transactions ===\n";
    $stmt = $pdo->query("SELECT t.*, p.name, p.sku_code FROM transactions t JOIN products p ON t.product_id = p.id LIMIT 10");
    $transactions = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (empty($transactions)) {
        echo "Belum ada transaksi di database!\n";
    } else {
        foreach ($transactions as $t) {
            echo "  - " . $t['name'] . " (" . $t['sku_code'] . "): Type=" . $t['type'] . ", Qty=" . $t['qty'] . ", Date=" . $t['date'] . "\n";
        }
    }
    
    echo "\n=== Total Products ===\n";
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM products");
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    echo "Total produk: " . $result['count'] . "\n\n";
    
    echo "✅ Debug check complete\n";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
?>

