<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Element;
use App\Models\Aspect;
use App\Models\User;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;


class ElementController extends Controller
{
    public function index()
    {
        try {
            // Obtener el ID del usuario autenticado
            $userId = auth()->id();
            
            // Consultar los elementos del usuario autenticado
            $elements = Element::where('user_id', $userId)->get();


            return response()->json($elements, 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to fetch elements', 'message' => $e->getMessage()], 500);
        }
    }
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
                $user->birth_time = Carbon::createFromFormat('g:i A', $request->birth_time)->format('H:i:s');
                $user->save();
            }

            // Guardar elementos astrales y avanzados en una sola tabla 'elements'
            $elementsData = [];
            foreach (array_merge($request->astrals, $request->advance) as $element) {
                $existingElement = Element::where('user_id', $userId)
                    ->where('element_name', $element['element_name'])
                    ->first();

                if ($existingElement) {
                    // Si el elemento existe, actualizar los campos
                    $existingElement->update([
                        'description' => $element['description'],
                        'element_type' => $element['element_type'],
                        'meaning' => $element['meaning'],
                        'updated_at' => now(),
                    ]);
                } else {
                    // Si el elemento no existe, crear uno nuevo
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

            // Insertar los nuevos elementos (si hay alguno)
            if (!empty($elementsData)) {
                Element::insert($elementsData);
            }


            // Guardar aspectos principales en la tabla 'principal_aspects'
            $aspectsData = [];
            foreach ($request->aspects as $aspect) {
                $existingAspect = Aspect::where('user_id', $userId)
                    ->where('aspect', $aspect['aspect'])
                    ->first();

                if ($existingAspect) {
                    // Si el aspecto existe, actualizar los campos
                    $existingAspect->update([
                        'involved_planets' => implode(', ', $aspect['involved_planets']),
                        'aspect_type' => $aspect['aspect_type'],
                        'meaning' => $aspect['meaning'],
                        'updated_at' => now(),
                    ]);
                } else {
                    // Si el aspecto no existe, agregar a los datos para insertar
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

            // Insertar los nuevos aspectos (si hay alguno)
            if (!empty($aspectsData)) {
                Aspect::insert($aspectsData);
            }


            // Hacer commit si no hubo errores
            DB::commit();

            return response()->json(['message' => 'Elements and aspects created successfully'], 201);
        } catch (\Exception $e) {
            // Hacer rollback si hubo un error
            DB::rollBack();

            return response()->json(['error' => 'Failed to create elements and aspects', 'details' => $e->getMessage()], 500);
        }
    }

    public function getHoroscopeData()
    {
       if (!auth()->check()) {
            return response()->json(['error' => 'User not authenticated'], 401);
        }

        $userId = auth()->id();

        // Obtener los datos del usuario con sus elementos relacionados
        $user = User::with('elements')->find($userId);

        // Verificar si el usuario existe
        if (!$user) {
            return response()->json(['error' => 'User not found'], 404);
        }
        // Preparar los datos para la respuesta
        $astroData = [
            'birth_date' => $user->birth_date,
            'birth_time' => $user->birth_time,
            'birth_place' => $user->birth_place,
            'sun' => $user->elements->firstWhere('element_name', 'Sun Sign')->description ?? null,
            'moon' => $user->elements->firstWhere(function ($element) {
                            return in_array($element->element_name, ['Moon', 'Moon Sign']);
                        })->description ?? null,
            'ascendant' => $user->elements->firstWhere('element_name', 'Ascendant')->description ?? null,
        ];

        return response()->json($astroData);
    }
}
