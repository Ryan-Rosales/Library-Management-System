<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Services\ActivityNotificationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->input('search', ''));

        $categories = Category::query()
            ->when($search !== '', function ($query) use ($search) {
                $query->where('name', 'like', "%{$search}%")->orWhere('description', 'like', "%{$search}%");
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('catalog/manage', [
            'title' => 'Categories',
            'records' => $categories,
            'filters' => ['search' => $search],
            'routes' => [
                'index' => 'categories',
                'store' => 'categories.store',
                'update' => 'categories.update',
                'destroy' => 'categories.destroy',
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
            'name' => ['required', 'string', 'max:120', 'unique:categories,name'],
            'description' => ['nullable', 'string', 'max:1000'],
        ]);

        $category = Category::create($data);

        app(ActivityNotificationService::class)->notifyPeerRoleChange(
            $request->user(),
            'catalog',
            'added',
            'category "'.$category->name.'"',
            route('categories'),
        );

        return back();
    }

    public function update(Request $request, Category $category): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120', 'unique:categories,name,'.$category->id],
            'description' => ['nullable', 'string', 'max:1000'],
        ]);

        $category->update($data);

        app(ActivityNotificationService::class)->notifyPeerRoleChange(
            $request->user(),
            'catalog',
            'updated',
            'category "'.$category->name.'"',
            route('categories'),
        );

        return back();
    }

    public function destroy(Request $request, Category $category): RedirectResponse
    {
        $categoryName = $category->name;
        $category->delete();

        app(ActivityNotificationService::class)->notifyPeerRoleChange(
            $request->user(),
            'catalog',
            'deleted',
            'category "'.$categoryName.'"',
            route('categories'),
        );

        return back();
    }
}
