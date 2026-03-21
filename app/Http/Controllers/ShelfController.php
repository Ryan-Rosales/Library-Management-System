<?php

namespace App\Http\Controllers;

use App\Models\Location;
use App\Models\Shelf;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ShelfController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->input('search', ''));

        $shelves = Shelf::query()
            ->with('locationRef:id,name')
            ->when($search !== '', function ($query) use ($search) {
                $query
                    ->where('name', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%")
                    ->orWhere('notes', 'like', "%{$search}%")
                    ->orWhereHas('locationRef', function ($locationQuery) use ($search) {
                        $locationQuery->where('name', 'like', "%{$search}%");
                    });
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        $locationOptions = Location::query()
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(fn (Location $location) => [
                'value' => $location->id,
                'label' => $location->name,
            ])
            ->values();

        return Inertia::render('catalog/manage', [
            'title' => 'Shelves',
            'records' => $shelves,
            'filters' => ['search' => $search],
            'routes' => [
                'index' => 'shelves',
                'store' => 'shelves.store',
                'update' => 'shelves.update',
                'destroy' => 'shelves.destroy',
            ],
            'fields' => [
                ['name' => 'name', 'label' => 'NAME', 'type' => 'text', 'required' => true],
                ['name' => 'location_id', 'label' => 'LOCATION', 'type' => 'select', 'required' => true, 'options' => $locationOptions],
                ['name' => 'notes', 'label' => 'NOTES', 'type' => 'textarea'],
            ],
            'columns' => [
                ['key' => 'code', 'label' => 'Code'],
                ['key' => 'name', 'label' => 'Name'],
                ['key' => 'locationRef.name', 'label' => 'Location'],
                ['key' => 'notes', 'label' => 'Notes'],
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'location_id' => ['required', 'exists:locations,id'],
            'notes' => ['nullable', 'string', 'max:1500'],
        ]);

        $nextSequence = ((int) Shelf::query()->max('id')) + 1;
        $data['code'] = 'SH-'.str_pad((string) $nextSequence, 4, '0', STR_PAD_LEFT);

        Shelf::create($data);

        return back();
    }

    public function update(Request $request, Shelf $shelf): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'location_id' => ['required', 'exists:locations,id'],
            'notes' => ['nullable', 'string', 'max:1500'],
        ]);

        $shelf->update($data);

        return back();
    }

    public function destroy(Shelf $shelf): RedirectResponse
    {
        $shelf->delete();

        return back();
    }
}
