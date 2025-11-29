<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
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

include_once '../models/Transaction.php';
include_once '../models/Product.php';
include_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();
$transaction = new Transaction($db);
$product = new Product($db);

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        if(isset($_GET['action'])) {
            switch($_GET['action']) {
                case 'best_sellers':
                    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 5;
                    $stmt = $transaction->getBestSellers($limit);
                    
                    if ($stmt) {
                        $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
                        echo json_encode($products ?: []);
                    } else {
                        echo json_encode([]);
                    }
                    break;

                case 'sales_report':
                    if(isset($_GET['start_date']) && isset($_GET['end_date'])) {
                        $stmt = $transaction->getSalesData($_GET['start_date'], $_GET['end_date']);
                        $report = $stmt->fetchAll(PDO::FETCH_ASSOC);
                        echo json_encode($report ?: []);
                    } else {
                        echo json_encode(array("message" => "Start date dan end date harus diisi"));
                    }
                    break;

                case 'recent':
                    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
                    $recent = $transaction->getRecentTransactions($limit);
                    echo json_encode($recent ?: []);
                    break;

                case 'growth':
                    $growth = $transaction->getMonthlyGrowth();
                    echo json_encode($growth ?: ["growth" => 0]);
                    break;

                case 'profit_analysis':
                    if(isset($_GET['start_date']) && isset($_GET['end_date'])) {
                        $analysis = $transaction->getProfitAnalysis($_GET['start_date'], $_GET['end_date']);
                        echo json_encode($analysis ?: []);
                    }
                    break;

                default:
                    echo json_encode(array("message" => "Action tidak valid"));
            }
        }
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"));
        
        if(!empty($data->product_id) && !empty($data->type) && !empty($data->qty)) {
            $transaction->product_id = $data->product_id;
            $transaction->type = $data->type;
            $transaction->qty = $data->qty;
            $transaction->date = !empty($data->date) ? $data->date : date('Y-m-d');
            $transaction->notes = !empty($data->notes) ? $data->notes : '';

            if($transaction->create()) {
                echo json_encode(array(
                    "success" => true,
                    "message" => "Transaksi berhasil dicatat"
                ));
            } else {
                echo json_encode(array(
                    "success" => false,
                    "message" => "Gagal mencatat transaksi"
                ));
            }
        } else {
            echo json_encode(array(
                "success" => false,
                "message" => "Data tidak lengkap"
            ));
        }
        break;
}
?>