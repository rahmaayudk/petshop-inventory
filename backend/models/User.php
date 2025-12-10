<?php
if (!function_exists('encrypt_password_for_display')) {
    /**
     * Fallback stub for encrypt_password_for_display to avoid undefined function errors
     * When the real crypto helper is present it will not be re-declared because of the check.
     *
     * @param string $plain_password
     * @return array|null Expecting an array with 'ciphertext' and optional 'iv', or null on fallback.
     */
    function encrypt_password_for_display($plain_password) {
        return null;
    }
}
class User {
    private $conn;
    private $table_name = "users";

    public $id;
    public $username;
    public $password; // hashed password for authentication
    public $plain_password; // plaintext password provided (used to create encrypted copy)
    public $password_encrypted;
    public $password_iv;
    public $email;
    public $created_at;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function login() {
        $query = "SELECT id, username, password FROM " . $this->table_name . " WHERE username = :username";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":username", $this->username);
        $stmt->execute();

        if($stmt->rowCount() == 1) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            // $this->password is the plaintext password provided for login
            // Use password_verify to check against the stored hash
            if (password_verify($this->password, $row['password'])) {
                $this->id = $row['id'];
                $this->username = $row['username'];
                return true;
            }
        }
        return false;
    }

    public function create() {
        $query = "INSERT INTO " . $this->table_name . " SET username=:username, password=:password, email=:email, password_encrypted=:password_encrypted, password_iv=:password_iv";
        $stmt = $this->conn->prepare($query);

        $this->username = htmlspecialchars(strip_tags($this->username));
        // Hash for authentication
        $this->password = password_hash($this->password, PASSWORD_DEFAULT);
        // If a plaintext is provided for reversible display, attempt to encrypt it
        // Guard against missing helper to avoid runtime fatal errors.
        $this->password_encrypted = null;
        $this->password_iv = null;
        if (!empty($this->plain_password)) {
            $crypto_file = __DIR__ . '/../utils/crypto.php';
            if (file_exists($crypto_file)) {
                include_once $crypto_file;
                if (function_exists('encrypt_password_for_display')) {
                    $enc = encrypt_password_for_display($this->plain_password);
                    if (is_array($enc) && isset($enc['ciphertext'])) {
                        $this->password_encrypted = $enc['ciphertext'];
                        $this->password_iv = isset($enc['iv']) ? $enc['iv'] : null;
                    }
                }
            }
            // If crypto helper is missing, leave encrypted fields null (fallback)
        }
        $this->email = htmlspecialchars(strip_tags($this->email));

        $stmt->bindParam(":username", $this->username);
        $stmt->bindParam(":password", $this->password);
        $stmt->bindParam(":email", $this->email);
        $stmt->bindParam(":password_encrypted", $this->password_encrypted);
        $stmt->bindParam(":password_iv", $this->password_iv);

        if($stmt->execute()) {
            return true;
        }
        return false;
    }
}
?>