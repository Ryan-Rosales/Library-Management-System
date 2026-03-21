<?php

namespace App\Http\Controllers;

use App\Models\Genre;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class GenreController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->input('search', ''));

        $genres = Genre::query()
            ->when($search !== '', function ($query) use ($search) {
                $query->where('name', 'like', "%{$search}%")->orWhere('description', 'like', "%{$search}%");
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('catalog/manage', [
            'title' => 'Genres',
            'records' => $genres,
            'filters' => ['search' => $search],
            'routes' => [
                'index' => 'genres',
                'store' => 'genres.store',
                'update' => 'genres.update',
                'destroy' => 'genres.destroy',
            ],
            'fields' => [
                ['name' => 'name', 'label' => 'NAME', 'type' => 'text', 'required' => true],
                ['name' => 'description', 'label' => 'DESCRIPTION', 'type' => 'textarea'],
            ],
            'columns' => [
                ['key' => 'name', 'label' => 'Name'],
                ['key' => 'description', 'label' => 'Description'],
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120', 'unique:genres,name'],
            'description' => ['nullable', 'string', 'max:1000'],
        ]);

        Genre::create($data);

        return back();
    }

    public function update(Request $request, Genre $genre): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120', 'unique:genres,name,'.$genre->id],
            'description' => ['nullable', 'string', 'max:1000'],
        ]);

        $genre->update($data);

        return back();
    }

    public function destroy(Genre $genre): RedirectResponse
    {
        $genre->delete();

        return back();
    }
}
