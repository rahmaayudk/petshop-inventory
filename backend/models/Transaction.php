<?php
class Transaction {
    private $conn;
    private $table_name = "transactions";

    public $id;
    public $product_id;
    public $type;
    public $qty;
    public $date;
    public $notes;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function create() {
        // Start transaction untuk consistency
        $this->conn->beginTransaction();
        
        try {
            $query = "INSERT INTO " . $this->table_name . " 
                     SET product_id=:product_id, type=:type, qty=:qty, date=:date, notes=:notes";

            $stmt = $this->conn->prepare($query);

            $this->product_id = htmlspecialchars(strip_tags($this->product_id));
            $this->type = htmlspecialchars(strip_tags($this->type));
            $this->qty = htmlspecialchars(strip_tags($this->qty));
            $this->date = htmlspecialchars(strip_tags($this->date));
            $this->notes = htmlspecialchars(strip_tags($this->notes));

            $stmt->bindParam(":product_id", $this->product_id);
            $stmt->bindParam(":type", $this->type);
            $stmt->bindParam(":qty", $this->qty);
            $stmt->bindParam(":date", $this->date);
            $stmt->bindParam(":notes", $this->notes);

            if($stmt->execute()) {
                // Update stock in products table
                $updateSuccess = $this->updateProductStock();
                
                if ($updateSuccess) {
                    $this->conn->commit();
                    return true;
                } else {
                    $this->conn->rollBack();
                    return false;
                }
            }
            
            $this->conn->rollBack();
            return false;
            
        } catch (Exception $e) {
            $this->conn->rollBack();
            error_log("Transaction error: " . $e->getMessage());
            return false;
        }
    }

    private function updateProductStock() {
        try {
            // Get current product stock
            $query = "SELECT current_stock FROM products WHERE id = :id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":id", $this->product_id);
            $stmt->execute();
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$row) {
                error_log("Product not found: " . $this->product_id);
                return false;
            }
            
            $current_stock = $row['current_stock'];
            $new_stock = $current_stock;
            
            if($this->type == 'in') {
                $new_stock += $this->qty;
            } else {
                // Check if enough stock for outgoing transaction
                if ($current_stock < $this->qty) {
                    throw new Exception("Stok tidak mencukupi. Stok tersedia: $current_stock, butuh: $this->qty");
                }
                $new_stock -= $this->qty;
            }

            // Update product stock
            $query = "UPDATE products SET current_stock = :current_stock, updated_at = NOW() WHERE id = :id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":current_stock", $new_stock);
            $stmt->bindParam(":id", $this->product_id);
            
            $result = $stmt->execute();
            
            if (!$result) {
                error_log("Failed to update product stock: " . $this->product_id);
                return false;
            }
            
            return true;
            
        } catch (Exception $e) {
            error_log("Update stock error: " . $e->getMessage());
            return false;
        }
    }

    public function getBestSellers($limit = 5) {
        $query = "SELECT p.id, p.name, p.sku_code, p.price_sell, p.price_buy, SUM(t.qty) as total_sold 
                  FROM " . $this->table_name . " t 
                  JOIN products p ON t.product_id = p.id 
                  WHERE t.type = 'out' AND t.date >= DATE_SUB(NOW(), INTERVAL 30 DAY)
                  GROUP BY p.id, p.name, p.sku_code, p.price_sell, p.price_buy
                  ORDER BY total_sold DESC 
                  LIMIT :limit";

        $stmt = $this->conn->prepare($query);
        $stmt->bindValue(':limit', (int)$limit, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt;
    }

    public function getSalesData($start_date, $end_date) {
        $query = "SELECT p.name, p.sku_code, 
                         COALESCE((
                             SELECT SUM(qty) FROM transactions 
                             WHERE product_id = p.id AND type = 'in' 
                             AND date < :start_date
                         ), 0) as initial_stock,
                         COALESCE((
                             SELECT SUM(qty) FROM transactions 
                             WHERE product_id = p.id AND type = 'in' 
                             AND date BETWEEN :start_date AND :end_date
                         ), 0) as stock_in,
                         COALESCE((
                             SELECT SUM(qty) FROM transactions 
                             WHERE product_id = p.id AND type = 'out' 
                             AND date BETWEEN :start_date AND :end_date
                         ), 0) as stock_out,
                         (COALESCE((
                             SELECT SUM(qty) FROM transactions 
                             WHERE product_id = p.id AND type = 'in' 
                             AND date < :start_date
                         ), 0) + 
                         COALESCE((
                             SELECT SUM(qty) FROM transactions 
                             WHERE product_id = p.id AND type = 'in' 
                             AND date BETWEEN :start_date AND :end_date
                         ), 0) - 
                         COALESCE((
                             SELECT SUM(qty) FROM transactions 
                             WHERE product_id = p.id AND type = 'out' 
                             AND date BETWEEN :start_date AND :end_date
                         ), 0)) as final_stock,
                         (COALESCE((
                             SELECT SUM(qty) FROM transactions 
                             WHERE product_id = p.id AND type = 'out' 
                             AND date BETWEEN :start_date AND :end_date
                         ), 0) * p.price_sell) as total_sales
                  FROM products p
                  ORDER BY p.name";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":start_date", $start_date);
        $stmt->bindParam(":end_date", $end_date);
        $stmt->execute();
        return $stmt;
    }

    public function getRecentTransactions($limit = 10) {
        $query = "SELECT t.*, p.name as product_name, p.sku_code 
                  FROM " . $this->table_name . " t 
                  JOIN products p ON t.product_id = p.id 
                  ORDER BY t.created_at DESC 
                  LIMIT :limit";

        $stmt = $this->conn->prepare($query);
        $stmt->bindValue(':limit', (int)$limit, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt;
    }

    public function getMonthlyGrowth() {
        $query = "SELECT 
                    MONTH(CURRENT_DATE) as current_month,
                    (SELECT COALESCE(SUM(t.qty * p.price_sell), 0) 
                     FROM transactions t 
                     JOIN products p ON t.product_id = p.id 
                     WHERE t.type = 'out' 
                     AND MONTH(t.date) = MONTH(CURRENT_DATE)
                     AND YEAR(t.date) = YEAR(CURRENT_DATE)) as current_sales,
                    (SELECT COALESCE(SUM(t.qty * p.price_sell), 0) 
                     FROM transactions t 
                     JOIN products p ON t.product_id = p.id 
                     WHERE t.type = 'out' 
                     AND MONTH(t.date) = MONTH(CURRENT_DATE - INTERVAL 1 MONTH)
                     AND YEAR(t.date) = YEAR(CURRENT_DATE - INTERVAL 1 MONTH)) as previous_sales";

        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        $result = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($result['previous_sales'] > 0) {
            $growth = (($result['current_sales'] - $result['previous_sales']) / $result['previous_sales']) * 100;
        } else {
            $growth = $result['current_sales'] > 0 ? 100 : 0;
        }

        return [
            'growth' => round($growth, 2),
            'current_sales' => $result['current_sales'],
            'previous_sales' => $result['previous_sales']
        ];
    }

    public function getProfitAnalysis($start_date, $end_date) {
        $query = "SELECT 
                    p.name,
                    p.sku_code,
                    SUM(CASE WHEN t.type = 'out' THEN t.qty ELSE 0 END) as total_sold,
                    SUM(CASE WHEN t.type = 'out' THEN t.qty * p.price_sell ELSE 0 END) as total_revenue,
                    SUM(CASE WHEN t.type = 'out' THEN t.qty * p.price_buy ELSE 0 END) as total_cost,
                    (SUM(CASE WHEN t.type = 'out' THEN t.qty * p.price_sell ELSE 0 END) - 
                     SUM(CASE WHEN t.type = 'out' THEN t.qty * p.price_buy ELSE 0 END)) as total_profit,
                    ROUND(((SUM(CASE WHEN t.type = 'out' THEN t.qty * p.price_sell ELSE 0 END) - 
                           SUM(CASE WHEN t.type = 'out' THEN t.qty * p.price_buy ELSE 0 END)) / 
                          SUM(CASE WHEN t.type = 'out' THEN t.qty * p.price_sell ELSE 0 END)) * 100, 2) as profit_margin
                  FROM products p
                  LEFT JOIN transactions t ON p.id = t.product_id 
                  AND t.date BETWEEN :start_date AND :end_date
                  GROUP BY p.id, p.name, p.sku_code
                  HAVING total_sold > 0
                  ORDER BY total_profit DESC";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":start_date", $start_date);
        $stmt->bindParam(":end_date", $end_date);
        $stmt->execute();
        return $stmt;
    }
}
?>