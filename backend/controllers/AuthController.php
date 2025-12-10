<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once __DIR__ . '/../models/User.php';
include_once __DIR__ . '/../config/database.php';

$database = new Database();
$db = $database->getConnection();
$user = new User($db);

$data = json_decode(file_get_contents("php://input"));

if($_SERVER['REQUEST_METHOD'] == 'POST') {
    if(isset($data->action)) {
        switch($data->action) {
            case 'login':
                if(!empty($data->username) && !empty($data->password)) {
                    $user->username = $data->username;
                    $user->password = $data->password;
                    
                    if($user->login()) {
                        session_start();
                        $_SESSION['user_id'] = $user->id;
                        $_SESSION['username'] = $user->username;
                        // fetch role from users table if present
                        $role = null;
                        try {
                            $stmtRole = $db->prepare("SELECT role FROM users WHERE id = :id LIMIT 1");
                            $stmtRole->bindParam(':id', $user->id);
                            $stmtRole->execute();
                            $r = $stmtRole->fetch(PDO::FETCH_ASSOC);
                            if ($r && isset($r['role'])) $role = $r['role'];
                        } catch (Exception $e) {
                            // ignore if column missing
                            $role = null;
                        }

                        $_SESSION['role'] = $role;

                        echo json_encode(array(
                            "success" => true,
                            "message" => "Login berhasil",
                            "user" => array(
                                "id" => $user->id,
                                "username" => $user->username,
                                "role" => $role
                            )
                        ));
                    } else {
                        echo json_encode(array(
                            "success" => false,
                            "message" => "Username atau password salah"
                        ));
                    }
                } else {
                    echo json_encode(array(
                        "success" => false,
                        "message" => "Username dan password harus diisi"
                    ));
                }
                break;

            case 'logout':
                session_start();
                session_destroy();
                echo json_encode(array(
                    "success" => true,
                    "message" => "Logout berhasil"
                ));
                break;

            case 'check':
                session_start();
                if(isset($_SESSION['user_id'])) {
                    // Try to include role if available
                    $role = isset($_SESSION['role']) ? $_SESSION['role'] : null;
                    // attempt to re-query role if not in session
                    if (empty($role)) {
                        try {
                            $stmtRole = $db->prepare("SELECT role FROM users WHERE id = :id LIMIT 1");
                            $stmtRole->bindParam(':id', $_SESSION['user_id']);
                            $stmtRole->execute();
                            $r = $stmtRole->fetch(PDO::FETCH_ASSOC);
                            if ($r && isset($r['role'])) $role = $r['role'];
                        } catch (Exception $e) {
                            $role = null;
                        }
                    }

                    echo json_encode(array(
                        "success" => true,
                        "user" => array(
                            "id" => $_SESSION['user_id'],
                            "username" => $_SESSION['username'],
                            "role" => $role
                        )
                    ));
                } else {
                    echo json_encode(array(
                        "success" => false,
                        "message" => "Not logged in"
                    ));
                }
                break;
        }
    }
}
?>