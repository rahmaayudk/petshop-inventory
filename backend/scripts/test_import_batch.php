<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../models/Product.php';

$database = new Database();
$db = $database->getConnection();
$product = new Product($db);

$logDir = __DIR__ . '/../logs';
if (!is_dir($logDir)) @mkdir($logDir, 0755, true);

$payload = [
    (object)[
        'sku_code' => 'BATCH-TEST-001',
        'name' => 'Batch Test Product 1',
        'category' => 'test',
        'animal_type' => 'all',
        'current_stock' => 10,
        'min_stock_threshold' => 1,
        'price_buy' => 10000,
        'price_sell' => 15000,
    ],
    (object)[
        'sku_code' => 'BATCH-TEST-002',
        'name' => 'Batch Test Product 2',
        'category' => 'test',
        'animal_type' => 'all',
        'current_stock' => 5,
        'min_stock_threshold' => 1,
        'price_buy' => 20000,
        'price_sell' => 25000,
    ],
    // duplicate sku to simulate problematic row
    (object)[
        'sku_code' => 'BATCH-TEST-001',
        'name' => 'Batch Test Product 1 Duplicate',
        'category' => 'test',
        'animal_type' => 'all',
        'current_stock' => 3,
        'min_stock_threshold' => 1,
        'price_buy' => 10000,
        'price_sell' => 15000,
    ],
];

file_put_contents($logDir . '/import_debug.log', date('[Y-m-d H:i:s] ') . "Running test_import_batch with " . count($payload) . " rows\n", FILE_APPEND);

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
        $existing = $product->getBySku($product->sku_code);
        if ($existing && isset($existing['id'])) {
            $product->id = $existing['id'];
            $ok = $product->update();
            file_put_contents($logDir . '/import_debug.log', date('[Y-m-d H:i:s] ') . "Row {$idx}: update => " . ($ok ? 'OK' : 'FAILED') . " (sku: {$product->sku_code})\n", FILE_APPEND);
            if ($ok) $results['updated']++; else { $results['failed']++; $results['errors'][] = "Row {$idx}: update failed"; }
        } else {
            $ok = $product->create();
            file_put_contents($logDir . '/import_debug.log', date('[Y-m-d H:i:s] ') . "Row {$idx}: create => " . ($ok ? 'OK' : 'FAILED') . " (sku: {$product->sku_code})\n", FILE_APPEND);
            if ($ok) $results['created']++; else { $results['failed']++; $results['errors'][] = "Row {$idx}: create returned false"; }
        }
    } catch (Exception $e) {
        $results['failed']++;
        $results['errors'][] = "Row {$idx}: exception - " . $e->getMessage();
        file_put_contents($logDir . '/import_debug.log', date('[Y-m-d H:i:s] ') . "Row {$idx} exception: " . $e->getMessage() . "\n", FILE_APPEND);
    }
}

file_put_contents($logDir . '/import_debug.log', date('[Y-m-d H:i:s] ') . "Test results: " . json_encode($results) . "\n", FILE_APPEND);

print_r($results);
?>