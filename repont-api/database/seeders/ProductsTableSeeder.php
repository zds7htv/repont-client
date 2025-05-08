<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProductsTableSeeder extends Seeder
{
    public function run(): void
    {
        $products = [
            ['type_number' => 'C123', 'product_name' => 'Coca-Cola'],
            ['type_number' => 'F456', 'product_name' => 'Fanta'],
            ['type_number' => 'S789', 'product_name' => 'Sprite'],
            ['type_number' => 'P111', 'product_name' => 'Pepsi'],
            ['type_number' => 'M222', 'product_name' => 'Mountain Dew'],
            ['type_number' => 'T333', 'product_name' => 'Tonic Water'],
            ['type_number' => 'J444', 'product_name' => 'Juice Mix'],
            ['type_number' => 'A555', 'product_name' => 'Aloe Vera Drink'],
            ['type_number' => 'V666', 'product_name' => 'Vitamin Water'],
            ['type_number' => 'W777', 'product_name' => 'NaturAqua']
        ];

        DB::table('products')->insert($products);
    }
}
