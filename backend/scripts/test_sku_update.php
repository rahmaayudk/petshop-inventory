<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../models/Product.php';

$database = new Database();
$db = $database->getConnection();
$product = new Product($db);

// Get first product to test update
$stmt = $db->prepare("SELECT * FROM products LIMIT 1");
$stmt->execute();
$existingProduct = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$existingProduct) {
    echo "No products found to test\n";
    exit;
}

echo "Before update:\n";
echo "  ID: {$existingProduct['id']}\n";
echo "  SKU: {$existingProduct['sku_code']}\n";
echo "  Name: {$existingProduct['name']}\n";

// Update product with new SKU
$product->id = $existingProduct['id'];
$product->sku_code = 'TEST-SKU-' . time();
$product->name = $existingProduct['name'];
$product->category = $existingProduct['category'];
$product->animal_type = $existingProduct['animal_type'];
$product->current_stock = $existingProduct['current_stock'];
$product->min_stock_threshold = $existingProduct['min_stock_threshold'];
$product->price_buy = $existingProduct['price_buy'];
$product->price_sell = $existingProduct['price_sell'];

if ($product->update()) {
    echo "\nUpdate successful!\n";
    
    // Verify in database
    $stmt = $db->prepare("SELECT * FROM products WHERE id = :id");
    $stmt->bindParam(':id', $existingProduct['id']);
    $stmt->execute();
    $updated = $stmt->fetch(PDO::FETCH_ASSOC);
    
    echo "After update:\n";
    echo "  ID: {$updated['id']}\n";
    echo "  SKU: {$updated['sku_code']}\n";
    echo "  Name: {$updated['name']}\n";
} else {
    echo "\nUpdate failed: " . $product->getLastError() . "\n";
}
?>
