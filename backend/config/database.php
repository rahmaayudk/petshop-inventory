<?php
class Database {
    private $connection;
    private $config = [
        'host' => 'localhost',
        'username' => 'root',
        'password' => '',
        'database' => 'petshop_inventory'
    ];

    public function getConnection() {
        if ($this->connection === null) {
            try {
                $dsn = "mysql:host={$this->config['host']};dbname={$this->config['database']};charset=utf8";
                $this->connection = new PDO($dsn, $this->config['username'], $this->config['password']);
                $this->connection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
                $this->connection->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
            } catch(PDOException $exception) {
                die("Connection failed: " . $exception->getMessage());
            }
        }
        return $this->connection;
    }
}
?>