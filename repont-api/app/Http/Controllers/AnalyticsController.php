<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Carbon\Carbon;

class AnalyticsController extends Controller
{
    // 1. Termék statisztika gép és dátum szerint
    public function leaderboard(Request $request)
    {
        $from = $request->query('from', '2025-01-01 00:00:00');
        $to = $request->query('to', '2025-12-31 23:59:59');
        $machineId = $request->query('machine_id', 'all');

        $cacheKey = "leaderboard:$from:$to:$machineId";

        return Cache::remember($cacheKey, 600, function () use ($from, $to, $machineId) {
            $query = DB::table('recycling')
                ->join('products', 'recycling.product', '=', 'products.id')
                ->whereBetween('recycling.event_date', [$from, $to])
                ->where('recycling.event_type', 'success')
                ->select('products.id as product_id', 'products.product_name', DB::raw('COUNT(*) as count'));

            if ($machineId !== 'all') {
                $query->where('recycling.machine_id', $machineId)
                      ->join('machines', 'recycling.machine_id', '=', 'machines.id')
                      ->addSelect('machines.name as machine_name')
                      ->groupBy('products.id', 'products.product_name', 'machines.name');
            } else {
                $query->groupBy('products.id', 'products.product_name');
            }

            return $query->orderByDesc('count')->get();
        });
    }

    // 2. Modalhoz: adott termék eseményei adott gépen és időszakban (limit dinamikusan kezelt)
    public function events(Request $request)
    {
        $from = $request->query('from', '2025-01-01 00:00:00');
        $to = $request->query('to', '2025-12-31 23:59:59');
        $machineId = $request->query('machine_id');
        $productId = $request->query('product_id');
        $limit = (int) $request->query('limit', 100);

        $cacheKey = "events:$from:$to:$machineId:$productId:$limit";

        return Cache::remember($cacheKey, 600, function () use ($from, $to, $machineId, $productId, $limit) {
            $query = DB::table('recycling')
                ->join('products', 'recycling.product', '=', 'products.id')
                ->join('machines', 'recycling.machine_id', '=', 'machines.id')
                ->whereBetween('recycling.event_date', [$from, $to])
                ->where('recycling.product', $productId);

            if ($machineId && $machineId !== 'all') {
                $query->where('recycling.machine_id', $machineId);
            }

            $query->select(
                'products.product_name',
                'products.type_number',
                'machines.name as machine',
                'recycling.event_type',
                'recycling.event_date'
            )->orderBy('recycling.event_date', 'desc');

            if ($limit > 0) {
                $query->limit($limit);
            }

            return $query->get();
        });
    }

    // 3. Gépek listázása (cache-elve)
    public function machines()
    {
        return Cache::remember('machines:list', 600, function () {
            return DB::table('machines')
                ->select('id', 'name')
                ->orderBy('name')
                ->get();
        });
    }

    // 4. Elérhető dátumtartomány (cache-elve)
    public function daterange()
    {
        return Cache::remember('daterange:minmax', 600, function () {
            $range = DB::table('recycling')
                ->selectRaw('MIN(event_date) as start, MAX(event_date) as end')
                ->first();

            return [
                'start' => Carbon::parse($range->start)->toISOString(),
                'end' => Carbon::parse($range->end)->toISOString(),
            ];
        });
    }
}
