<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../models/Product.php';

$database = new Database();
$db = $database->getConnection();
$product = new Product($db);

$sku = 'CPTEST-XYZ-999';
$product->sku_code = $sku;
$product->name = 'Test Product ' . date('YmdHis');
$product->category = 'test-category';
$product->animal_type = 'semua hewan';
$product->current_stock = 1;
$product->min_stock_threshold = 0;
$product->price_buy = 1000;
$product->price_sell = 1500;

try {
    $existing = $product->getBySku($sku);
    if ($existing && isset($existing['id'])) {
        echo "Found existing product with id: {$existing['id']}\n";
        $product->id = $existing['id'];
        if ($product->update()) {
            echo "Update OK\n";
        } else {
            echo "Update failed\n";
        }
    } else {
        if ($product->create()) {
            echo "Create OK\n";
        } else {
            echo "Create returned false\n";
        }
    }
} catch (Exception $e) {
    echo "Exception: " . $e->getMessage() . "\n";
}

?>