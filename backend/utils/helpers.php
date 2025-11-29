<?php
function formatRupiah($number) {
    return 'Rp ' . number_format($number, 0, ',', '.');
}

function getStockStatus($current_stock, $min_threshold) {
    if($current_stock <= $min_threshold) {
        return array(
            'status' => 'danger',
            'text' => 'RESTOCK',
            'color' => '#dc3545'
        );
    } else {
        return array(
            'status' => 'success',
            'text' => 'AMAN',
            'color' => '#28a745'
        );
    }
}

function importFromExcel($file_path) {
    // This function would handle Excel file import
    // For now, it's a placeholder
    return array("success" => true, "message" => "Import functionality to be implemented");
}
?>