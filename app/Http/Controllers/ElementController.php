<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Element;
use App\Models\Aspect;
use App\Models\User;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;


class ElementController extends Controller
{


public function store(Request $request)
{
    // Validar los datos de entrada
    $validator = Validator::make($request->all(), [
        'birth_date' => 'required|date',
        'birth_time' => 'required|string',
        'birth_place' => 'required|string|max:255',
        'astrals' => 'required|array',
        'astrals.*.element_name' => 'required|string|max:255',
        'astrals.*.description' => 'required|string',
        'astrals.*.element_type' => 'required|string|in:Astral,Advanced',
        'astrals.*.meaning' => 'nullable|string',
        'advance' => 'required|array',
        'advance.*.element_name' => 'required|string|max:255',
        'advance.*.description' => 'required|string',
        'advance.*.element_type' => 'required|string|in:Astral,Advanced',
        'advance.*.meaning' => 'nullable|string',
        'aspects' => 'required|array',
        'aspects.*.aspect' => 'required|string|max:255',
        'aspects.*.involved_planets' => 'required|array',
        'aspects.*.aspect_type' => 'required|string|max:255',
        'aspects.*.meaning' => 'nullable|string',
    ]);

    if ($validator->fails()) {
        return response()->json(['errors' => $validator->errors()], 422);
    }

    DB::beginTransaction();

    try {
        $userId = auth()->id();

        $user = User::find($userId);
        if ($user) {
            $user->birth_date = Carbon::parse($request->birth_date)->format('Y-m-d');
            $user->birth_place = $request->birth_place;
            $user->birth_time = $request->birth_time;
            $user->save();
        }

        // Guardar elementos astrales y avanzados en una sola tabla 'elements'
        $elementsData = [];
        foreach (array_merge($request->astrals, $request->advance) as $element) {
             $existingElement = Element::where('user_id', $userId)
                ->where('element_name', $element['element_name'])
                ->first();

            if (!$existingElement) {
                $elementsData[] = [
                    'user_id' => $userId,
                    'element_name' => $element['element_name'],
                    'description' => $element['description'],
                    'element_type' => $element['element_type'],
                    'meaning' => $element['meaning'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
        }
        Element::insert($elementsData);

        // Guardar aspectos principales en la tabla 'principal_aspects'
        $aspectsData = [];
        foreach ($request->aspects as $aspect) {
            $existingAspect = Aspect::where('user_id', $userId)->where('aspect',$aspect['aspect'])->first();
            if (!$existingAspect){
                $aspectsData[] = [
                'user_id' => $userId,
                'aspect' => $aspect['aspect'],
                'involved_planets' => implode(', ', $aspect['involved_planets']),
                'aspect_type' => $aspect['aspect_type'],
                'meaning' => $aspect['meaning'],
                'created_at' => now(),
                'updated_at' => now(),
            ];
            }
            
        }
        Aspect::insert($aspectsData);

        // Hacer commit si no hubo errores
        DB::commit();

        return response()->json(['message' => 'Elements and aspects created successfully'], 201);
    } catch (\Exception $e) {
        // Hacer rollback si hubo un error
        DB::rollBack();

        return response()->json(['error' => 'Failed to create elements and aspects', 'details' => $e->getMessage()], 500);
    }
}

}
