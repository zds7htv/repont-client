<?php

namespace Database\Seeders;



use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class RecyclingTableSeeder extends Seeder
{
    public function run(): void
    {
        $productIds = DB::table('products')->pluck('id')->toArray();
        $machineIds = DB::table('machines')->pluck('id')->toArray();
        $eventTypes = ['success', 'error', 'warning'];

        $batch = [];

        for ($i = 0; $i < 120000; $i++) {
            $batch[] = [
                'machine_id' => $machineIds[array_rand($machineIds)],
                'product' => $productIds[array_rand($productIds)],
                'event_type' => $eventTypes[array_rand($eventTypes)],
                'event_date' => Carbon::create(2025, rand(1, 4), rand(1, 28), rand(0, 23), rand(0, 59), 0),
                'created_at' => now(),
                'updated_at' => now(),
            ];

            // Tömbönként töltjük, hogy ne fogyjon el a memória
            if (count($batch) >= 1000) {
                DB::table('recycling')->insert($batch);
                $batch = [];
            }
        }

        if (!empty($batch)) {
            DB::table('recycling')->insert($batch);
        }
    }
}
