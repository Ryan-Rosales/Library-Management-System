<?php

namespace Database\Seeders;

use App\Models\Author;
use App\Models\Category;
use App\Models\Genre;
use App\Models\Location;
use App\Models\Shelf;
use Illuminate\Database\Seeder;

class CatalogSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            'Fiction',
            'Non-Fiction',
            'Reference',
            'Science',
            'History',
        ];

        foreach ($categories as $category) {
            Category::firstOrCreate(['name' => $category], ['description' => $category.' collection']);
        }

        $genres = [
            'Mystery',
            'Fantasy',
            'Romance',
            'Biography',
            'Sci-Fi',
        ];

        foreach ($genres as $genre) {
            Genre::firstOrCreate(['name' => $genre], ['description' => $genre.' genre']);
        }

        $authors = [
            ['name' => 'L. Archivist', 'email' => 'archivist@author.local'],
            ['name' => 'M. Reader', 'email' => 'reader@author.local'],
            ['name' => 'A. Santos', 'email' => 'asantos@author.local'],
            ['name' => 'J. Dela Cruz', 'email' => 'jdelacruz@author.local'],
        ];

        foreach ($authors as $author) {
            Author::firstOrCreate(['name' => $author['name']], ['email' => $author['email']]);
        }

        $locations = [
            'Main Library - Ground Floor',
            'Main Library - Second Floor',
            'Annex Building - Reading Wing',
        ];

        foreach ($locations as $locationName) {
            Location::firstOrCreate(['name' => $locationName]);
        }

        $shelfRows = [
            ['name' => 'Fiction Aisle', 'location' => 'Main Library - Ground Floor'],
            ['name' => 'Reference Core', 'location' => 'Main Library - Ground Floor'],
            ['name' => 'Research Stack', 'location' => 'Main Library - Second Floor'],
            ['name' => 'Periodicals', 'location' => 'Annex Building - Reading Wing'],
        ];

        foreach ($shelfRows as $index => $row) {
            $location = Location::where('name', $row['location'])->first();

            Shelf::firstOrCreate(
                ['name' => $row['name']],
                [
                    'code' => 'SH-'.str_pad((string) ($index + 1), 4, '0', STR_PAD_LEFT),
                    'location_id' => $location?->id,
                    'notes' => 'Seeded shelf',
                ],
            );
        }
    }
}
