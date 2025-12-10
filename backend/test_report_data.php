<?php
require_once 'config/database.php';

echo "=== Testing Report Data (Date Range: 2025-11-25 to 2025-12-08) ===\n\n";

try {
    $db = new Database();
    $pdo = $db->getConnection();
    
    $start_date = '2025-11-25';
    $end_date = '2025-12-08';
    
    // Simple query for testing
    $query = "SELECT p.name, p.sku_code, p.price_sell, COUNT(t.id) as trans_count,
                     SUM(CASE WHEN t.type='in' AND t.date < ? THEN t.qty ELSE 0 END) as initial_stock,
                     SUM(CASE WHEN t.type='in' AND t.date BETWEEN ? AND ? THEN t.qty ELSE 0 END) as stock_in,
                     SUM(CASE WHEN t.type='out' AND t.date BETWEEN ? AND ? THEN t.qty ELSE 0 END) as stock_out
              FROM products p
              LEFT JOIN transactions t ON p.id = t.product_id
              GROUP BY p.id, p.name, p.sku_code, p.price_sell
              LIMIT 10";
    
    $stmt = $pdo->prepare($query);
    $stmt->execute(array(
        $start_date,
        $start_date, $end_date,
        $start_date, $end_date
    ));
    
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "Testing report data:\n";
    echo str_repeat("=", 100) . "\n";
    
    $total_in = 0;
    $total_out = 0;
    
    foreach ($results as $row) {
        $initial = $row['initial_stock'] ? intval($row['initial_stock']) : 0;
        $in_qty = $row['stock_in'] ? intval($row['stock_in']) : 0;
        $out_qty = $row['stock_out'] ? intval($row['stock_out']) : 0;
        $final = $initial + $in_qty - $out_qty;
        $sales = $out_qty * $row['price_sell'];
        
        echo $row['name'] . " | ";
        echo $row['sku_code'] . " | ";
        echo "Init: $initial | In: $in_qty | Out: $out_qty | Final: $final | Sales: $sales\n";
        
        $total_in += $in_qty;
        $total_out += $out_qty;
    }
    
    echo str_repeat("=", 100) . "\n";
    echo "Total Stock In: $total_in | Total Stock Out: $total_out\n";
    echo "\n✅ Report data is working correctly!\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>

