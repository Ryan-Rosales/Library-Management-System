<?php

namespace App\Http\Controllers;

use App\Models\Location;
use App\Services\ActivityNotificationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LocationController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->input('search', ''));

        $locations = Location::query()
            ->when($search !== '', function ($query) use ($search) {
                $query->where('name', 'like', "%{$search}%")->orWhere('description', 'like', "%{$search}%");
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('catalog/manage', [
            'title' => 'Locations',
            'records' => $locations,
            'filters' => ['search' => $search],
            'routes' => [
                'index' => 'locations',
                'store' => 'locations.store',
                'update' => 'locations.update',
                'destroy' => 'locations.destroy',
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
            'name' => ['required', 'string', 'max:120', 'unique:locations,name'],
            'description' => ['nullable', 'string', 'max:1000'],
        ]);

        $location = Location::create($data);

        app(ActivityNotificationService::class)->notifyPeerRoleChange(
            $request->user(),
            'catalog',
            'added',
            'location "'.$location->name.'"',
            route('locations'),
        );

        return back();
    }

    public function update(Request $request, Location $location): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120', 'unique:locations,name,'.$location->id],
            'description' => ['nullable', 'string', 'max:1000'],
        ]);

        $location->update($data);

        app(ActivityNotificationService::class)->notifyPeerRoleChange(
            $request->user(),
            'catalog',
            'updated',
            'location "'.$location->name.'"',
            route('locations'),
        );

        return back();
    }

    public function destroy(Request $request, Location $location): RedirectResponse
    {
        $locationName = $location->name;
        $location->delete();

        app(ActivityNotificationService::class)->notifyPeerRoleChange(
            $request->user(),
            'catalog',
            'deleted',
            'location "'.$locationName.'"',
            route('locations'),
        );

        return back();
    }
}
