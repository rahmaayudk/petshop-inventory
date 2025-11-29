<?php
class Product {
    private $conn;
    private $table_name = "products";

    public $id;
    public $sku_code;
    public $name;
    public $category;
    public $animal_type;
    public $current_stock;
    public $min_stock_threshold;
    public $price_buy;
    public $price_sell;
    public $created_at;
    public $updated_at;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function read() {
        $query = "SELECT * FROM " . $this->table_name . " ORDER BY created_at DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    public function create() {
        $query = "INSERT INTO " . $this->table_name . " 
                 SET sku_code=:sku_code, name=:name, category=:category, animal_type=:animal_type, 
                     current_stock=:current_stock, min_stock_threshold=:min_stock_threshold, 
                     price_buy=:price_buy, price_sell=:price_sell";

        $stmt = $this->conn->prepare($query);

        $this->sku_code = htmlspecialchars(strip_tags($this->sku_code));
        $this->name = htmlspecialchars(strip_tags($this->name));
        $this->category = htmlspecialchars(strip_tags($this->category));
        $this->animal_type = htmlspecialchars(strip_tags($this->animal_type));
        $this->current_stock = htmlspecialchars(strip_tags($this->current_stock));
        $this->min_stock_threshold = htmlspecialchars(strip_tags($this->min_stock_threshold));
        $this->price_buy = htmlspecialchars(strip_tags($this->price_buy));
        $this->price_sell = htmlspecialchars(strip_tags($this->price_sell));

        $stmt->bindParam(":sku_code", $this->sku_code);
        $stmt->bindParam(":name", $this->name);
        $stmt->bindParam(":category", $this->category);
        $stmt->bindParam(":animal_type", $this->animal_type);
        $stmt->bindParam(":current_stock", $this->current_stock);
        $stmt->bindParam(":min_stock_threshold", $this->min_stock_threshold);
        $stmt->bindParam(":price_buy", $this->price_buy);
        $stmt->bindParam(":price_sell", $this->price_sell);

        if($stmt->execute()) {
            return true;
        }
        return false;
    }

    public function update() {
        $query = "UPDATE " . $this->table_name . " 
                 SET name=:name, category=:category, animal_type=:animal_type, 
                     current_stock=:current_stock, min_stock_threshold=:min_stock_threshold, 
                     price_buy=:price_buy, price_sell=:price_sell, updated_at=NOW()
                 WHERE id=:id";

        $stmt = $this->conn->prepare($query);

        $this->name = htmlspecialchars(strip_tags($this->name));
        $this->category = htmlspecialchars(strip_tags($this->category));
        $this->animal_type = htmlspecialchars(strip_tags($this->animal_type));
        $this->current_stock = htmlspecialchars(strip_tags($this->current_stock));
        $this->min_stock_threshold = htmlspecialchars(strip_tags($this->min_stock_threshold));
        $this->price_buy = htmlspecialchars(strip_tags($this->price_buy));
        $this->price_sell = htmlspecialchars(strip_tags($this->price_sell));
        $this->id = htmlspecialchars(strip_tags($this->id));

        $stmt->bindParam(":name", $this->name);
        $stmt->bindParam(":category", $this->category);
        $stmt->bindParam(":animal_type", $this->animal_type);
        $stmt->bindParam(":current_stock", $this->current_stock);
        $stmt->bindParam(":min_stock_threshold", $this->min_stock_threshold);
        $stmt->bindParam(":price_buy", $this->price_buy);
        $stmt->bindParam(":price_sell", $this->price_sell);
        $stmt->bindParam(":id", $this->id);

        if($stmt->execute()) {
            return true;
        }
        return false;
    }

    public function delete() {
        $query = "DELETE FROM " . $this->table_name . " WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->id);

        if($stmt->execute()) {
            return true;
        }
        return false;
    }

    public function getLowStock() {
        $query = "SELECT * FROM " . $this->table_name . " WHERE current_stock <= min_stock_threshold";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    public function getBySku($sku_code) {
        $query = "SELECT * FROM " . $this->table_name . " WHERE sku_code = :sku_code";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":sku_code", $sku_code);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
}
?>