use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

Artisan::command('cache:prewarm', function () {
    $this->info("Prewarming leaderboard...");

    $from = '2025-01-01 00:00:00';
    $to = '2025-12-31 23:59:59';
    $machineId = 'all';

    // === 1. Leaderboard cache ===
    $leaderboardKey = "leaderboard:$from:$to:$machineId";
    Cache::remember($leaderboardKey, 600, function () use ($from, $to, $machineId) {
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

    $this->info("Leaderboard cache kész.");

    // === 2. Példa: events cache (pl. első termék ID = 1)
    $productId = 1;
    $limit = -1;
    $eventsKey = "events:$from:$to:$machineId:$productId:$limit";

    $this->info("Prewarming events for product_id=$productId...");

    Cache::remember($eventsKey, 600, function () use ($from, $to, $machineId, $productId, $limit) {
        $query = DB::table('recycling')
            ->join('products', 'recycling.product', '=', 'products.id')
            ->join('machines', 'recycling.machine_id', '=', 'machines.id')
            ->whereBetween('recycling.event_date', [$from, $to])
            ->where('recycling.product', $productId);

        if ($machineId !== 'all') {
            $query->where('recycling.machine_id', $machineId);
        }

        return $query
            ->select(
                'products.product_name',
                'products.type_number',
                'machines.name as machine',
                'recycling.event_type',
                'recycling.event_date'
            )
            ->orderBy('recycling.event_date', 'desc')
            ->limit(100000)
            ->get();
    });

    $this->info("Events cache kész.");
})->purpose('Prewarm cache for leaderboard and events');
