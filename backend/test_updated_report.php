<?php
require_once 'config/database.php';

echo "=== Testing Updated getSalesData Logic ===\n\n";

try {
    $db = new Database();
    $pdo = $db->getConnection();
    
    $start_date = '2025-12-01';
    $end_date = '2025-12-08';
    
    // Test query
    $query = "SELECT p.id, p.name, p.sku_code, p.current_stock,
                     COALESCE((
                         SELECT SUM(qty) FROM transactions 
                         WHERE product_id = p.id AND type = 'in' 
                         AND date < ?
                     ), 0) as total_in_before,
                     COALESCE((
                         SELECT SUM(qty) FROM transactions 
                         WHERE product_id = p.id AND type = 'out' 
                         AND date < ?
                     ), 0) as total_out_before,
                     COALESCE((
                         SELECT SUM(qty) FROM transactions 
                         WHERE product_id = p.id AND type = 'in' 
                         AND date BETWEEN ? AND ?
                     ), 0) as stock_in,
                     COALESCE((
                         SELECT SUM(qty) FROM transactions 
                         WHERE product_id = p.id AND type = 'out' 
                         AND date BETWEEN ? AND ?
                     ), 0) as stock_out,
                     (COALESCE((
                         SELECT SUM(qty) FROM transactions 
                         WHERE product_id = p.id AND type = 'in' 
                         AND date < ?
                     ), 0) - 
                     COALESCE((
                         SELECT SUM(qty) FROM transactions 
                         WHERE product_id = p.id AND type = 'out' 
                         AND date < ?
                     ), 0)) as initial_stock,
                     (COALESCE((
                         SELECT SUM(qty) FROM transactions 
                         WHERE product_id = p.id AND type = 'in' 
                         AND date < ?
                     ), 0) - 
                     COALESCE((
                         SELECT SUM(qty) FROM transactions 
                         WHERE product_id = p.id AND type = 'out' 
                         AND date < ?
                     ), 0) +
                     COALESCE((
                         SELECT SUM(qty) FROM transactions 
                         WHERE product_id = p.id AND type = 'in' 
                         AND date BETWEEN ? AND ?
                     ), 0) - 
                     COALESCE((
                         SELECT SUM(qty) FROM transactions 
                         WHERE product_id = p.id AND type = 'out' 
                         AND date BETWEEN ? AND ?
                     ), 0)) as final_stock,
                     (COALESCE((
                         SELECT SUM(qty) FROM transactions 
                         WHERE product_id = p.id AND type = 'out' 
                         AND date BETWEEN ? AND ?
                     ), 0) * p.price_sell) as total_sales
              FROM products p
              LIMIT 5";
    
    $stmt = $pdo->prepare($query);
    $stmt->execute(array(
        $start_date, $start_date,
        $start_date, $end_date,
        $start_date, $end_date,
        $start_date, $start_date,
        $start_date, $start_date,
        $start_date, $end_date,
        $start_date, $end_date,
        $start_date, $end_date
    ));
    
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "Date Range: $start_date to $end_date\n";
    echo str_repeat("=", 120) . "\n";
    echo "Nama Produk\t\t\tStok Awal\tBarang Masuk\tBarang Keluar\tStok Akhir\tTotal Jual\n";
    echo str_repeat("=", 120) . "\n";
    
    foreach ($results as $row) {
        $name = substr($row['name'], 0, 25);
        echo $name . str_repeat(" ", 28 - strlen($name));
        echo $row['initial_stock'] . "\t\t";
        echo $row['stock_in'] . "\t\t";
        echo $row['stock_out'] . "\t\t";
        echo $row['final_stock'] . "\t\t";
        echo $row['total_sales'] . "\n";
    }
    
    echo "\n✅ Query test complete!\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
