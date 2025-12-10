<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET, OPTIONS");
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

// Support action via query param (?action=...) or path segment (/analytics/<action>)
// Determine action
$action = null;
if (!empty($_GET['action'])) {
    $action = $_GET['action'];
} else {
    // parse path segment after /analytics
    $reqPath = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    $reqPath = str_replace('/backend', '', $reqPath);
    $parts = explode('/', trim($reqPath, '/'));
    // parts[0] should be 'analytics', parts[1] (if present) is the action
    if (isset($parts[1]) && $parts[1] !== '') {
        $action = $parts[1];
    }
}

if ($_SERVER['REQUEST_METHOD'] == 'GET') {
    if($action) {
        switch($action) {
            case 'customer-insights':
                // Simulate customer insights data
                $insights = [
                    'total_customers' => 128,
                    'new_customers_this_month' => 15,
                    'repeat_customers' => 85,
                    'average_order_value' => 185000,
                    'popular_categories' => [
                        ['category' => 'dry_food', 'count' => 45],
                        ['category' => 'wet_food', 'count' => 32],
                        ['category' => 'snack', 'count' => 28],
                        ['category' => 'sand', 'count' => 23]
                    ]
                ];
                echo json_encode($insights);
                break;

            case 'inventory-turnover':
                // Calculate inventory turnover ratio
                $query = "SELECT 
                            p.name,
                            p.sku_code,
                            p.current_stock,
                            COALESCE(SUM(CASE WHEN t.type = 'out' AND t.date >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN t.qty ELSE 0 END), 0) as monthly_sales,
                            CASE 
                                WHEN p.current_stock > 0 THEN 
                                    COALESCE(SUM(CASE WHEN t.type = 'out' AND t.date >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN t.qty ELSE 0 END), 0) / p.current_stock 
                                ELSE 0 
                            END as turnover_ratio
                          FROM products p
                          LEFT JOIN transactions t ON p.id = t.product_id
                          GROUP BY p.id, p.name, p.sku_code, p.current_stock
                          ORDER BY turnover_ratio DESC";

                $stmt = $db->prepare($query);
                $stmt->execute();
                $turnover_data = $stmt->fetchAll(PDO::FETCH_ASSOC);

                echo json_encode($turnover_data ?: []);
                break;

            case 'sales-trends':
                $period = $_GET['period'] ?? 'monthly';
                
                switch($period) {
                    case 'weekly':
                        $query = "SELECT 
                                    CONCAT('Week ', WEEK(date)) as period,
                                    SUM(qty) as total_sold,
                                    SUM(qty * (SELECT price_sell FROM products WHERE id = product_id)) as total_revenue
                                  FROM transactions 
                                  WHERE type = 'out' 
                                  AND date >= DATE_SUB(NOW(), INTERVAL 8 WEEK)
                                  GROUP BY WEEK(date)
                                  ORDER BY date DESC";
                        break;
                        
                    case 'monthly':
                    default:
                        $query = "SELECT 
                                    DATE_FORMAT(date, '%Y-%m') as period,
                                    SUM(qty) as total_sold,
                                    SUM(qty * (SELECT price_sell FROM products WHERE id = product_id)) as total_revenue
                                  FROM transactions 
                                  WHERE type = 'out' 
                                  AND date >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
                                  GROUP BY DATE_FORMAT(date, '%Y-%m')
                                  ORDER BY period DESC";
                        break;
                }

                $stmt = $db->prepare($query);
                $stmt->execute();
                $trends = $stmt->fetchAll(PDO::FETCH_ASSOC);

                echo json_encode($trends ?: []);
                break;

            default:
                echo json_encode(array("message" => "Action tidak valid"));
        }
    } else {
        echo json_encode(array("message" => "Action harus diisi"));
    }
}
?>