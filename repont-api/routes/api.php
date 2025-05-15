<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AnalyticsController;
use App\Http\Controllers\UploadLogController;

Route::get('/leaderboard', [AnalyticsController::class, 'leaderboard']);
Route::get('/events', [AnalyticsController::class, 'events']);
Route::get('/machines', [AnalyticsController::class, 'machines']);
Route::get('/date-range', [AnalyticsController::class, 'dateRange']);
Route::post('/login', [AnalyticsController::class, 'login']);
Route::post('/verify-totp', [AnalyticsController::class, 'verifyTotp']);
Route::post('/upload-log', [AnalyticsController::class, 'uploadLog']);
