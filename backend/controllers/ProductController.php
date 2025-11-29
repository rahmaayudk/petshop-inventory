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

include_once 'models/Product.php';
include_once 'config/database.php';

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
        $data = json_decode(file_get_contents("php://input"));
        
        if(!empty($data->sku_code) && !empty($data->name)) {
            $product->sku_code = $data->sku_code;
            $product->name = $data->name;
            $product->category = $data->category;
            $product->animal_type = $data->animal_type;
            $product->current_stock = $data->current_stock;
            $product->min_stock_threshold = $data->min_stock_threshold;
            $product->price_buy = $data->price_buy;
            $product->price_sell = $data->price_sell;

            if($product->create()) {
                echo json_encode(array("message" => "Produk berhasil dibuat"));
            } else {
                echo json_encode(array("message" => "Gagal membuat produk"));
            }
        } else {
            echo json_encode(array("message" => "Data tidak lengkap"));
        }
        break;

    case 'PUT':
        $data = json_decode(file_get_contents("php://input"));
        
        if(!empty($data->id)) {
            $product->id = $data->id;
            $product->name = $data->name;
            $product->category = $data->category;
            $product->animal_type = $data->animal_type;
            $product->current_stock = $data->current_stock;
            $product->min_stock_threshold = $data->min_stock_threshold;
            $product->price_buy = $data->price_buy;
            $product->price_sell = $data->price_sell;

            if($product->update()) {
                echo json_encode(array("message" => "Produk berhasil diupdate"));
            } else {
                echo json_encode(array("message" => "Gagal mengupdate produk"));
            }
        } else {
            echo json_encode(array("message" => "ID produk tidak valid"));
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