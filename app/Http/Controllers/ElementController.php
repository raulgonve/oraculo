<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Element;
use App\Models\PrincipalAspect;
use Illuminate\Support\Facades\Validator;

class ElementController extends Controller
{
    public function store(Request $request)
    {
        // Validar los datos de entrada
        $validator = Validator::make($request->all(), [
            'user_id' => 'required|exists:users,id',
            'elements' => 'required|array',
            'elements.*.element_name' => 'required|string|max:255',
            'elements.*.description' => 'required|string',
            'elements.*.element_type' => 'required|string|in:advanced,astral',
            'elements.*.meaning' => 'nullable|string',
            'aspects' => 'required|array',
            'aspects.*.aspect_name' => 'required|string|max:255',
            'aspects.*.planets_involved' => 'required|string',
            'aspects.*.aspect_type' => 'required|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $userId = $request->user_id;

        // Crear los elementos para el usuario
        $elementsData = [];
        foreach ($request->elements as $element) {
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

        Element::insert($elementsData);

        // Crear los aspectos principales para el usuario
        $aspectsData = [];
        foreach ($request->aspects as $aspect) {
            $aspectsData[] = [
                'user_id' => $userId,
                'aspect_name' => $aspect['aspect_name'],
                'planets_involved' => $aspect['planets_involved'],
                'aspect_type' => $aspect['aspect_type'],
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        PrincipalAspect::insert($aspectsData);

        return response()->json(['message' => 'Elements and aspects created successfully'], 201);
    }
}
