<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Careerpost;
use App\Models\User;

class StatsController extends Controller
{
    /**
     * Return aggregate counts for the admin dashboard cards.
     */
    public function dashboard()
    {
        return response()->json([
            'careerPosts' => Careerpost::careerPosts()->count(),
            'postings' => Careerpost::postings()->count(),
            'awardsCommendations' => Careerpost::awardsCommendations()->count(),
            'users' => User::count(),
        ]);
    }
}

