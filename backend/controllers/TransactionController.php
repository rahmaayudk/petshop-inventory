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

include_once __DIR__ . '/../models/Transaction.php';
include_once __DIR__ . '/../models/Product.php';
include_once __DIR__ . '/../config/database.php';

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
                    $start_date = isset($_GET['start_date']) ? $_GET['start_date'] : null;
                    $end_date = isset($_GET['end_date']) ? $_GET['end_date'] : null;
                    
                    // If date range provided, use getBestSellersByDateRange, otherwise use default 30 days
                    if ($start_date && $end_date) {
                        $stmt = $transaction->getBestSellersByDateRange($start_date, $end_date, $limit);
                    } else {
                        $stmt = $transaction->getBestSellers($limit);
                    }
                    
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
                    // default to 5 recent activities unless caller requests more
                    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 5;
                    $recentStmt = $transaction->getRecentTransactions($limit);
                    $rows = $recentStmt ? $recentStmt->fetchAll(PDO::FETCH_ASSOC) : [];

                    // If caller requests detailed rows (e.g., transactions page), return raw rows
                    $detailed = isset($_GET['detail']) && ($_GET['detail'] == '1' || strtolower($_GET['detail']) === 'true');
                    if ($detailed) {
                        // return rows but ensure created_at is present
                        echo json_encode($rows ?: []);
                        break;
                    }

                    // Map to a clean activity shape for compact dashboard widget
                    $activities = array_map(function($r) {
                        $type = isset($r['type']) && $r['type'] === 'in' ? 'restock' : 'sale';
                        $product = $r['product_name'] ?? ($r['name'] ?? 'Produk tidak diketahui');
                        $quantity = isset($r['qty']) ? (int)$r['qty'] : 0;
                        // prefer created_at timestamp, fallback to date
                        $timestamp = $r['created_at'] ?? $r['date'] ?? null;
                        // prefer username; if missing show role (admin/staff) so viewers know who performed it
                        if (!empty($r['performed_by'])) {
                            $user = $r['performed_by'];
                        } elseif (!empty($r['performed_role'])) {
                            $user = $r['performed_role'];
                        } else {
                            // fallback to current session role so viewer (staff/admin) sees role label
                            $user = isset($_SESSION['role']) ? $_SESSION['role'] : null;
                        }

                        return [
                            'id' => $r['id'] ?? null,
                            'type' => $type,
                            'product' => $product,
                            'quantity' => $quantity,
                            'timestamp' => $timestamp,
                            'user' => $user
                        ];
                    }, $rows ?: []);

                    echo json_encode($activities ?: []);
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
            // attach current user if available in session
            $transaction->user_id = isset($_SESSION['user_id']) ? $_SESSION['user_id'] : null;

            if($transaction->create()) {
                echo json_encode(array(
                    "success" => true,
                    "message" => "Transaksi berhasil dicatat"
                ));
            } else {
                $msg = 'Gagal mencatat transaksi';
                if (!empty($transaction->last_error)) {
                    $msg .= ': ' . $transaction->last_error;
                }
                echo json_encode(array(
                    "success" => false,
                    "message" => $msg
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