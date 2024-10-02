<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('users')->insert([
            [
                'name' => 'Esteban',
                'email' => 'digitalera13@gmail.com',
                'email_verified_at' => now(),
                'password' => Hash::make('12345678'),
                'birth_date' => '1985-07-31',
                'birth_time' => '03:45:00',
                'birth_place' => 'Caracas, Venezuela',
                'remember_token' => \Illuminate\Support\Str::random(10),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Raul',
                'email' => 'rgonzalez@criptext.com',
                'email_verified_at' => now(),
                'password' => Hash::make('12345678'),
                'birth_date' => '1986-01-13',
                'birth_time' => '22:00:00',
                'birth_place' => 'Caracas, Venezuela',
                'remember_token' => \Illuminate\Support\Str::random(10),
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
