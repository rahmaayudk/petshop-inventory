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

include_once 'models/User.php';
include_once 'config/database.php';

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
                        
                        echo json_encode(array(
                            "success" => true,
                            "message" => "Login berhasil",
                            "user" => array(
                                "id" => $user->id,
                                "username" => $user->username
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
                    echo json_encode(array(
                        "success" => true,
                        "user" => array(
                            "id" => $_SESSION['user_id'],
                            "username" => $_SESSION['username']
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