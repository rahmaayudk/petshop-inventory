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

include_once __DIR__ . '/../config/database.php';
include_once __DIR__ . '/../models/User.php';

session_start();
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(array("success" => false, "message" => "Unauthorized"));
    exit();
}

// require admin role
// initialize database connection early so we can check role
$database = new Database();
$db = $database->getConnection();
try {
    $stmtRole = $db->prepare("SELECT role FROM users WHERE id = :id LIMIT 1");
    $stmtRole->bindParam(':id', $_SESSION['user_id']);
    $stmtRole->execute();
    $r = $stmtRole->fetch(PDO::FETCH_ASSOC);
    $currentRole = ($r && isset($r['role'])) ? $r['role'] : null;
} catch (Exception $e) {
    $currentRole = null;
}

if ($currentRole !== 'admin') {
    http_response_code(403);
    echo json_encode(array("success" => false, "message" => "Forbidden"));
    exit();
}

// simple helpers
function respond($data, $code = 200) {
    http_response_code($code);
    echo json_encode($data);
    exit();
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // list users
    $query = "SELECT id, username, email, created_at FROM users ORDER BY id DESC";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    respond($rows);
}

$input = json_decode(file_get_contents('php://input'));

if ($method === 'POST') {
    // create user
    if (empty($input->username) || empty($input->password)) {
        respond(array("success" => false, "message" => "username and password are required"), 400);
    }

    $user = new User($db);
    $user->username = $input->username;
    $user->password = $input->password;
    $user->email = isset($input->email) ? $input->email : null;

    if ($user->create()) {
        respond(array("success" => true, "message" => "User created"), 201);
    } else {
        respond(array("success" => false, "message" => "Failed to create user"), 500);
    }
}

if ($method === 'PUT') {
    if (empty($input->id)) {
        respond(array("success" => false, "message" => "id is required"), 400);
    }

    $id = (int)$input->id;
    $fields = [];
    $params = [];

    if (isset($input->username)) {
        $fields[] = "username = :username";
        $params[':username'] = htmlspecialchars(strip_tags($input->username));
    }
    if (isset($input->email)) {
        $fields[] = "email = :email";
        $params[':email'] = htmlspecialchars(strip_tags($input->email));
    }
    if (isset($input->password) && $input->password !== '') {
        $fields[] = "password = :password";
        $params[':password'] = password_hash($input->password, PASSWORD_DEFAULT);
    }

    if (empty($fields)) {
        respond(array("success" => false, "message" => "No fields to update"), 400);
    }

    $sql = "UPDATE users SET " . implode(', ', $fields) . " WHERE id = :id";
    $params[':id'] = $id;

    $stmt = $db->prepare($sql);
    foreach ($params as $k => $v) $stmt->bindValue($k, $v);

    if ($stmt->execute()) {
        respond(array("success" => true, "message" => "User updated"));
    } else {
        respond(array("success" => false, "message" => "Failed to update user"), 500);
    }
}

if ($method === 'DELETE') {
    // delete user
    $data = $input;
    if (empty($data->id)) {
        respond(array("success" => false, "message" => "id is required"), 400);
    }
    $id = (int)$data->id;
    $stmt = $db->prepare("DELETE FROM users WHERE id = :id");
    $stmt->bindParam(':id', $id, PDO::PARAM_INT);
    if ($stmt->execute()) {
        respond(array("success" => true, "message" => "User deleted"));
    } else {
        respond(array("success" => false, "message" => "Failed to delete user"), 500);
    }
}

// fallback
respond(array("success" => false, "message" => "Method not allowed"), 405);
?>