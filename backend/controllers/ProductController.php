<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

session_start();
if(!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(array("message" => "Unauthorized"));
    exit();
}

include_once __DIR__ . '/../models/Product.php';
include_once __DIR__ . '/../config/database.php';

$database = new Database();
$db = $database->getConnection();
$product = new Product($db);

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        if(isset($_GET['action'])) {
            switch($_GET['action']) {
                case 'low_stock':
                    $stmt = $product->getLowStock();
                    $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
                    echo json_encode($products);
                    break;
                default:
                    $stmt = $product->read();
                    $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
                    echo json_encode($products);
            }
        } else {
            $stmt = $product->read();
            $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($products);
        }
        break;

    case 'POST':
        $raw = file_get_contents("php://input");
        $data = json_decode($raw);

        // Support batch import: if an array is provided, iterate
        if (is_array($data)) {
            // log incoming payload for debugging
            $logDir = __DIR__ . '/../logs';
            if (!is_dir($logDir)) @mkdir($logDir, 0755, true);
            @file_put_contents($logDir . '/import_debug.log', date('[Y-m-d H:i:s] ') . "Received import payload with " . count($data) . " rows\n", FILE_APPEND);

            $results = ['created' => 0, 'updated' => 0, 'failed' => 0, 'errors' => []];
            foreach ($data as $idx => $item) {
                // Detailed per-row logging for debugging UI imports
                @file_put_contents($logDir . '/import_debug.log', date('[Y-m-d H:i:s] ') . "Processing Row {$idx}: " . json_encode($item, JSON_UNESCAPED_UNICODE) . "\n", FILE_APPEND);

                if (empty($item->sku_code) || empty($item->name)) {
                    $results['failed']++;
                    $results['errors'][] = "Row {$idx}: missing sku_code or name";
                    @file_put_contents($logDir . '/import_debug.log', date('[Y-m-d H:i:s] ') . "Row {$idx} skipped: missing sku_code or name\n", FILE_APPEND);
                    continue;
                }

                // prepare product fields
                $product->sku_code = $item->sku_code;
                $product->name = $item->name;
                $product->category = isset($item->category) ? $item->category : null;
                $product->animal_type = isset($item->animal_type) ? $item->animal_type : null;
                $product->current_stock = isset($item->current_stock) ? $item->current_stock : 0;
                $product->min_stock_threshold = isset($item->min_stock_threshold) ? $item->min_stock_threshold : 0;
                $product->price_buy = isset($item->price_buy) ? $item->price_buy : 0;
                $product->price_sell = isset($item->price_sell) ? $item->price_sell : 0;

                try {
                    // Use atomic upsert in create() — insert or update if SKU exists
                    if ($product->create()) {
                        $results['created']++;
                        @file_put_contents($logDir . '/import_debug.log', date('[Y-m-d H:i:s] ') . "Row {$idx}: upserted product (sku: {$product->sku_code})\n", FILE_APPEND);
                    } else {
                        $results['failed']++;
                        $error = $product->getLastError() ?: "database insert returned false";
                        $results['errors'][] = "Row {$idx}: {$error}";
                        @file_put_contents($logDir . '/import_debug.log', date('[Y-m-d H:i:s] ') . "Row {$idx}: upsert failed for sku {$product->sku_code} - {$error}\n", FILE_APPEND);
                    }
                } catch (Exception $e) {
                    $results['failed']++;
                    $results['errors'][] = "Row {$idx}: exception - " . $e->getMessage();
                    // log exception with context
                    @file_put_contents($logDir . '/import_debug.log', date('[Y-m-d H:i:s] ') . "Row {$idx} insert/update exception: " . $e->getMessage() . "\n" . $e->getTraceAsString() . "\n", FILE_APPEND);
                }
            }

            // final summary log
            @file_put_contents($logDir . '/import_debug.log', date('[Y-m-d H:i:s] ') . "Import summary: " . json_encode($results, JSON_UNESCAPED_UNICODE) . "\n", FILE_APPEND);

            echo json_encode($results);
            break;
        }

        // single create fallback
        if($data && !empty($data->sku_code) && !empty($data->name)) {
            $product->sku_code = $data->sku_code;
            $product->name = $data->name;
            $product->category = $data->category;
            $product->animal_type = $data->animal_type;
            $product->current_stock = $data->current_stock;
            $product->min_stock_threshold = $data->min_stock_threshold;
            $product->price_buy = $data->price_buy;
            $product->price_sell = $data->price_sell;

            // atomic upsert in create()
            if($product->create()) {
                echo json_encode(array("message" => "Produk berhasil disimpan"));
            } else {
                echo json_encode(array("message" => "Gagal menyimpan produk: " . ($product->getLastError() ?: "unknown error")));
            }
        } else {
            echo json_encode(array("message" => "Data tidak lengkap"));
        }
        break;

    case 'PUT':
        $data = json_decode(file_get_contents("php://input"));
        
        if(!empty($data->id)) {
            $logDir = __DIR__ . '/../logs';
            if (!is_dir($logDir)) @mkdir($logDir, 0755, true);
            
            @file_put_contents($logDir . '/import_debug.log', date('[Y-m-d H:i:s] ') . "PUT request: " . json_encode($data, JSON_UNESCAPED_UNICODE) . "\n", FILE_APPEND);
            
            $product->id = $data->id;
            $product->sku_code = isset($data->sku_code) ? $data->sku_code : null;
            $product->name = isset($data->name) ? $data->name : null;
            $product->category = isset($data->category) ? $data->category : null;
            $product->animal_type = isset($data->animal_type) ? $data->animal_type : null;
            $product->current_stock = isset($data->current_stock) ? $data->current_stock : 0;
            $product->min_stock_threshold = isset($data->min_stock_threshold) ? $data->min_stock_threshold : 0;
            $product->price_buy = isset($data->price_buy) ? $data->price_buy : 0;
            $product->price_sell = isset($data->price_sell) ? $data->price_sell : 0;

            if($product->update()) {
                @file_put_contents($logDir . '/import_debug.log', date('[Y-m-d H:i:s] ') . "PUT update successful for product ID {$data->id}\n", FILE_APPEND);
                echo json_encode(array("message" => "Produk berhasil diupdate", "success" => true));
            } else {
                $error = $product->getLastError();
                @file_put_contents($logDir . '/import_debug.log', date('[Y-m-d H:i:s] ') . "PUT update failed for product ID {$data->id}: {$error}\n", FILE_APPEND);
                echo json_encode(array("message" => "Gagal mengupdate produk: " . $error, "success" => false));
            }
        } else {
            echo json_encode(array("message" => "ID produk tidak valid", "success" => false));
        }
        break;

    case 'DELETE':
        $data = json_decode(file_get_contents("php://input"));
        
        if(!empty($data->id)) {
            $product->id = $data->id;

            if($product->delete()) {
                echo json_encode(array("message" => "Produk berhasil dihapus"));
            } else {
                echo json_encode(array("message" => "Gagal menghapus produk"));
            }
        } else {
            echo json_encode(array("message" => "ID produk tidak valid"));
        }
        break;
}
?>