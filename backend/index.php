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

$request_uri = $_SERVER['REQUEST_URI'];
$path = parse_url($request_uri, PHP_URL_PATH);
$path = str_replace('/backend', '', $path);

// Route analytics with path segments (e.g. /analytics/customer-insights)
if (preg_match('#^/analytics($|/)#', $path)) {
    include 'controllers/AnalyticsController.php';
    return;
}

switch($path) {
    case '/auth':
        include 'controllers/AuthController.php';
        break;
    case '/products':
        include 'controllers/ProductController.php';
        break;
    case '/transactions':
        include 'controllers/TransactionController.php';
        break;
    case '/users':
        include 'controllers/UserController.php';
        break;
    default:
        http_response_code(404);
        echo json_encode(array("message" => "Endpoint tidak ditemukan"));
        break;
}
?>