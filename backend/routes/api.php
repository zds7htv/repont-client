<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AnalyticsController;

Route::get('/leaderboard', [AnalyticsController::class, 'leaderboard']);
Route::get('/events', [AnalyticsController::class, 'events']);
Route::get('/machines', [AnalyticsController::class, 'machines']);
Route::get('/date-range', [AnalyticsController::class, 'dateRange']);
