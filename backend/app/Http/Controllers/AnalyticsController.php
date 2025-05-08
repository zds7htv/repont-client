<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AnalyticsController extends Controller
{
    // 1. Termék statisztika gép és dátum szerint
    public function leaderboard(Request $request)
    {
        $from = $request->query('from', '2025-01-01 00:00:00');
        $to = $request->query('to', '2025-12-31 23:59:59');
        $machineId = $request->query('machine_id');

        $query = DB::table('recycling')
            ->join('products', 'recycling.product', '=', 'products.id')
            ->whereBetween('recycling.event_date', [$from, $to])
            ->where('recycling.event_type', 'success')
            ->select('products.id as product_id', 'products.product_name', DB::raw('COUNT(*) as count'));

        if ($machineId && $machineId !== 'all') {
            $query->where('recycling.machine_id', $machineId)
                  ->join('machines', 'recycling.machine_id', '=', 'machines.id')
                  ->addSelect('machines.name as machine_name')
                  ->groupBy('products.id', 'products.product_name', 'machines.name');
        } else {
            $query->groupBy('products.id', 'products.product_name');
        }

        return response()->json($query->orderByDesc('count')->get());
    }

    // 2. Modalhoz: adott termék eseményei adott gépen és időszakban
    public function events(Request $request)
    {
        $from = $request->query('from', '2025-01-01 00:00:00');
        $to = $request->query('to', '2025-12-31 23:59:59');
        $machineId = $request->query('machine_id');
        $productId = $request->query('product_id');

        $query = DB::table('recycling')
            ->join('products', 'recycling.product', '=', 'products.id')
            ->join('machines', 'recycling.machine_id', '=', 'machines.id')
            ->whereBetween('recycling.event_date', [$from, $to])
            ->where('recycling.product', $productId);

        if ($machineId && $machineId !== 'all') {
            $query->where('recycling.machine_id', $machineId);
        }

        $results = $query
            ->select(
                'products.product_name',
                'products.type_number',
                'machines.name as machine',
                'recycling.event_type',
                'recycling.event_date'
            )
            ->orderBy('recycling.event_date', 'desc')
            ->limit(1000)
            ->get();

        return response()->json($results);
    }

    // 3. Gépek listázása legördülőhöz
    public function machines()
    {
        $machines = DB::table('machines')
            ->select('id', 'name')
            ->orderBy('name')
            ->get();

        return response()->json($machines);
    }

    // 4. Elérhető dátumtartomány (minimum és maximum)
    public function daterange()
    {
        $range = DB::table('recycling')
            ->selectRaw('MIN(event_date) as start, MAX(event_date) as end')
            ->first();

        return response()->json([
            'start' => \Carbon\Carbon::parse($range->start)->toISOString(),
            'end' => \Carbon\Carbon::parse($range->end)->toISOString(),
        ]);
    }
}
