<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../models/Product.php';

$database = new Database();
$db = $database->getConnection();
$product = new Product($db);

// Get a test product
$stmt = $db->prepare("SELECT * FROM products WHERE id = 1");
$stmt->execute();
$existingProduct = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$existingProduct) {
    echo "Product not found\n";
    exit;
}

echo "=== Before Update ===\n";
echo "SKU: {$existingProduct['sku_code']}\n";
echo "Name: {$existingProduct['name']}\n";
echo "Category: {$existingProduct['category']}\n";
echo "Animal Type: {$existingProduct['animal_type']}\n";
echo "Stock: {$existingProduct['current_stock']}\n";
echo "Min Stock: {$existingProduct['min_stock_threshold']}\n";
echo "Price Buy: {$existingProduct['price_buy']}\n";
echo "Price Sell: {$existingProduct['price_sell']}\n";

// Update with new values
$product->id = 1;
$product->sku_code = 'UPDATED-SKU-' . time();
$product->name = 'Updated Product Name';
$product->category = 'wet_food';
$product->animal_type = 'cat';
$product->current_stock = 99;
$product->min_stock_threshold = 15;
$product->price_buy = 100000;
$product->price_sell = 150000;

if ($product->update()) {
    echo "\n✅ Update successful!\n";
    
    // Verify all fields updated
    $stmt = $db->prepare("SELECT * FROM products WHERE id = 1");
    $stmt->execute();
    $updated = $stmt->fetch(PDO::FETCH_ASSOC);
    
    echo "\n=== After Update ===\n";
    echo "SKU: {$updated['sku_code']}\n";
    echo "Name: {$updated['name']}\n";
    echo "Category: {$updated['category']}\n";
    echo "Animal Type: {$updated['animal_type']}\n";
    echo "Stock: {$updated['current_stock']}\n";
    echo "Min Stock: {$updated['min_stock_threshold']}\n";
    echo "Price Buy: {$updated['price_buy']}\n";
    echo "Price Sell: {$updated['price_sell']}\n";
} else {
    echo "\n❌ Update failed: " . $product->getLastError() . "\n";
}
?>
