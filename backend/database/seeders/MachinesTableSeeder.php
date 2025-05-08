<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class MachinesTableSeeder extends Seeder
{
    public function run(): void
    {
        $machines = [
            ['name' => 'Repont 1', 'location' => 'Hatvan Coop 1', 'installed_at' => Carbon::parse('2024-01-10')],
            ['name' => 'Repont 2', 'location' => 'Hatvan Lidl 1', 'installed_at' => Carbon::parse('2024-02-05')],
            ['name' => 'Repont 3', 'location' => 'Hatvan Tesco 1', 'installed_at' => Carbon::parse('2024-03-15')],
        ];

        DB::table('machines')->insert($machines);
    }
}
