<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Carbon\Carbon;
use PragmaRX\Google2FA\Google2FA;

class AnalyticsController extends Controller
{
    // 1. Termék statisztika gép és dátum szerint, halmozott oszlopdiagramhoz
    public function leaderboard(Request $request)
    {
        $from = $request->query('from', '2025-01-01 00:00:00');
        $to = $request->query('to', '2025-12-31 23:59:59');
        $machineId = $request->query('machine_id', 'all');
        $eventType = $request->query('event_type'); // pl.: success, warning, error vagy null (mind)

        $cacheKey = "leaderboard:$from:$to:$machineId:$eventType";

        return Cache::remember($cacheKey, 600, function () use ($from, $to, $machineId, $eventType) {
            $query = DB::table('recycling')
                ->join('products', 'recycling.product', '=', 'products.id')
                ->whereBetween('recycling.event_date', [$from, $to]);

            if ($machineId !== 'all') {
                $query->where('recycling.machine_id', $machineId);
            }

            if ($eventType && in_array($eventType, ['success', 'warning', 'error'])) {
                $query->where('recycling.event_type', $eventType)
                      ->select(
                          'products.id as product_id',
                          'products.product_name',
                          DB::raw("COUNT(*) as count")
                      )
                      ->groupBy('products.id', 'products.product_name');

                $results = $query->get();

                return $results->map(function ($item) use ($eventType) {
                    return [
                        'product_id' => $item->product_id,
                        'product_name' => $item->product_name,
                        $eventType => (int) $item->count,
                    ];
                });
            } else {
                $query->select(
                    'products.id as product_id',
                    'products.product_name',
                    DB::raw("SUM(CASE WHEN recycling.event_type = 'success' THEN 1 ELSE 0 END) as success"),
                    DB::raw("SUM(CASE WHEN recycling.event_type = 'warning' THEN 1 ELSE 0 END) as warning"),
                    DB::raw("SUM(CASE WHEN recycling.event_type = 'error' THEN 1 ELSE 0 END) as error")
                )
                ->groupBy('products.id', 'products.product_name');

                return $query->get();
            }
        });
    }

    // 2. Modalhoz: adott termék eseményei adott gépen és időszakban (event_type szűrés is)
    public function events(Request $request)
    {
        $from = $request->query('from', '2025-01-01 00:00:00');
        $to = $request->query('to', '2025-12-31 23:59:59');
        $machineId = $request->query('machine_id');
        $productId = $request->query('product_id');
        $eventType = $request->query('event_type');
        $limit = (int) $request->query('limit', 100);

        $cacheKey = "events:$from:$to:$machineId:$productId:$eventType:$limit";

        return Cache::remember($cacheKey, 600, function () use ($from, $to, $machineId, $productId, $eventType, $limit) {
            $query = DB::table('recycling')
                ->join('products', 'recycling.product', '=', 'products.id')
                ->join('machines', 'recycling.machine_id', '=', 'machines.id')
                ->whereBetween('recycling.event_date', [$from, $to])
                ->where('recycling.product', $productId);

            if ($machineId && $machineId !== 'all') {
                $query->where('recycling.machine_id', $machineId);
            }

            if ($eventType && in_array($eventType, ['success', 'warning', 'error'])) {
                $query->where('recycling.event_type', $eventType);
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

    public function machines()
    {
        return Cache::remember('machines:list', 600, function () {
            return DB::table('machines')
                ->select('id', 'name')
                ->orderBy('name')
                ->get();
        });
    }

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

    public function login(Request $request)
    {
        $name = $request->input('name');
        $password = $request->input('password');

        if (!$name || !$password) {
            return response()->json(['error' => 'Név és jelszó kötelező!'], 400);
        }

        $user = DB::table('users')->where('name', $name)->first();

        if (!$user || !password_verify($password, $user->password)) {
            return response()->json(['error' => 'Hibás felhasználónév vagy jelszó!'], 401);
        }

        if (!$user->totp_secret) {
            return response()->json(['error' => 'Hiányzik a TOTP kulcs a felhasználónál.'], 403);
        }

        return response()->json([
            'status' => 'ok',
            'message' => 'Jelszó helyes, TOTP kód szükséges.',
            'user' => [
                'name' => $user->name,
                'requires_totp' => true
            ]
        ]);
    }

    public function verifyTotp(Request $request)
    {
        $name = $request->input('name');
        $code = $request->input('code');

        if (!$name || !$code) {
            return response()->json(['error' => 'Név és kód kötelező!'], 400);
        }

        $user = DB::table('users')->where('name', $name)->first();

        if (!$user || !$user->totp_secret) {
            return response()->json(['error' => 'Felhasználó vagy TOTP kulcs nem található.'], 404);
        }

        $google2fa = new Google2FA();
        $isValid = $google2fa->verifyKey($user->totp_secret, $code);

        if (!$isValid) {
            return response()->json(['error' => 'Érvénytelen TOTP kód!'], 401);
        }

        return response()->json([
            'status' => 'ok',
            'message' => 'TOTP ellenőrzés sikeres.'
        ]);
    }
}
