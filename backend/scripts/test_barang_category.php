<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../models/Product.php';

$database = new Database();
$db = $database->getConnection();
$product = new Product($db);

$logDir = __DIR__ . '/../logs';
if (!is_dir($logDir)) @mkdir($logDir, 0755, true);

// Test with barang category
$payload = [
    (object)[
        'sku_code' => 'BARANG-TEST-001',
        'name' => 'Harness Anjing',
        'category' => 'barang',
        'animal_type' => 'dog',
        'current_stock' => 15,
        'min_stock_threshold' => 5,
        'price_buy' => 50000,
        'price_sell' => 75000,
    ],
    (object)[
        'sku_code' => 'BARANG-TEST-002',
        'name' => 'Mainan Kucing',
        'category' => 'barang',
        'animal_type' => 'cat',
        'current_stock' => 20,
        'min_stock_threshold' => 3,
        'price_buy' => 25000,
        'price_sell' => 40000,
    ],
];

file_put_contents($logDir . '/import_debug.log', date('[Y-m-d H:i:s] ') . "Testing barang category with " . count($payload) . " rows\n", FILE_APPEND);

$results = ['created' => 0, 'updated' => 0, 'failed' => 0, 'errors' => []];
foreach ($payload as $idx => $item) {
    if (empty($item->sku_code) || empty($item->name)) {
        $results['failed']++;
        $results['errors'][] = "Row {$idx}: missing sku_code or name";
        continue;
    }

    $product->sku_code = $item->sku_code;
    $product->name = $item->name;
    $product->category = isset($item->category) ? $item->category : null;
    $product->animal_type = isset($item->animal_type) ? $item->animal_type : null;
    $product->current_stock = isset($item->current_stock) ? $item->current_stock : 0;
    $product->min_stock_threshold = isset($item->min_stock_threshold) ? $item->min_stock_threshold : 0;
    $product->price_buy = isset($item->price_buy) ? $item->price_buy : 0;
    $product->price_sell = isset($item->price_sell) ? $item->price_sell : 0;

    try {
        $ok = $product->create();
        if ($ok) {
            $results['created']++;
            file_put_contents($logDir . '/import_debug.log', date('[Y-m-d H:i:s] ') . "Row {$idx}: barang upserted successfully (sku: {$product->sku_code}, category: {$product->category})\n", FILE_APPEND);
        } else {
            $results['failed']++;
            $error = $product->getLastError() ?: "create returned false";
            $results['errors'][] = "Row {$idx}: {$error}";
            file_put_contents($logDir . '/import_debug.log', date('[Y-m-d H:i:s] ') . "Row {$idx}: upsert failed for sku {$product->sku_code} - {$error}\n", FILE_APPEND);
        }
    } catch (Exception $e) {
        $results['failed']++;
        $results['errors'][] = "Row {$idx}: exception - " . $e->getMessage();
        file_put_contents($logDir . '/import_debug.log', date('[Y-m-d H:i:s] ') . "Row {$idx} exception: " . $e->getMessage() . "\n", FILE_APPEND);
    }
}

file_put_contents($logDir . '/import_debug.log', date('[Y-m-d H:i:s] ') . "Barang category test results: " . json_encode($results) . "\n", FILE_APPEND);

print_r($results);
?>
