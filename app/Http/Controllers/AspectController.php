<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Aspect;


class AspectController extends Controller
{
    //
    public function index()
    {
        try {
            // Obtener el ID del usuario autenticado
            $userId = auth()->id();
            
            // Consultar los aspectos principales del usuario autenticado
            $aspects = Aspect::where('user_id', $userId)->get();

            return response()->json($aspects, 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to fetch aspects', 'message' => $e->getMessage()], 500);
        }
    }
}
