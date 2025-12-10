<?php
require_once 'config/database.php';

echo "<h2>🧪 Testing Database </h2>";

try {
    $database = new Database();
    $conn = $database->getConnection();
    
    if ($conn) {
        echo "✅ <strong>Koneksi ke Database Baru BERHASIL!</strong><br><br>";
        
        // Determine current database and check tables
        $dbName = $conn->query("SELECT DATABASE()")->fetchColumn();
        $stmt = $conn->prepare("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = :db");
        $stmt->bindParam(':db', $dbName);
        $stmt->execute();
        $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
        
        echo "📋 Tables in Database:<br>";
        if (count($tables) > 0) {
            foreach($tables as $table) {
                echo "&nbsp;&nbsp;• " . $table . "<br>";
            }
            
            // Test data sample
            echo "<br>📊 Test Data Sample:<br>";
            $firstTable = $tables[0];
            $stmt = $conn->query("SELECT COUNT(*) as total FROM " . $firstTable);
            $count = $stmt->fetch();
            echo "&nbsp;&nbsp;Jumlah data di <strong>" . $firstTable . "</strong>: " . $count['total'] . " records<br>";
            
        } else {
            echo "&nbsp;&nbsp;No tables found<br>";
        }
        
    } else {
        echo "❌ <strong>Koneksi GAGAL!</strong>";
    }
    
} catch (Exception $e) {
    echo "❌ <strong>Error:</strong> " . $e->getMessage();
}
?>