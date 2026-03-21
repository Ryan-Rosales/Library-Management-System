<?php

namespace App\Http\Controllers;

use App\Models\Author;
use App\Services\ActivityNotificationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AuthorController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->input('search', ''));

        $authors = Author::query()
            ->when($search !== '', function ($query) use ($search) {
                $query
                    ->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('biography', 'like', "%{$search}%");
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('catalog/manage', [
            'title' => 'Authors',
            'records' => $authors,
            'filters' => ['search' => $search],
            'routes' => [
                'index' => 'authors',
                'store' => 'authors.store',
                'update' => 'authors.update',
                'destroy' => 'authors.destroy',
            ],
            'fields' => [
                ['name' => 'name', 'label' => 'NAME', 'type' => 'text', 'required' => true],
                ['name' => 'email', 'label' => 'EMAIL', 'type' => 'email'],
                ['name' => 'biography', 'label' => 'BIOGRAPHY', 'type' => 'textarea'],
            ],
            'columns' => [
                ['key' => 'name', 'label' => 'Name'],
                ['key' => 'email', 'label' => 'Email'],
                ['key' => 'biography', 'label' => 'Biography'],
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'email' => ['nullable', 'email', 'max:255', 'unique:authors,email'],
            'biography' => ['nullable', 'string', 'max:1500'],
        ]);

        $author = Author::create($data);

        app(ActivityNotificationService::class)->notifyPeerRoleChange(
            $request->user(),
            'catalog',
            'added',
            'author "'.$author->name.'"',
            route('authors'),
        );

        return back();
    }

    public function update(Request $request, Author $author): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'email' => ['nullable', 'email', 'max:255', 'unique:authors,email,'.$author->id],
            'biography' => ['nullable', 'string', 'max:1500'],
        ]);

        $author->update($data);

        app(ActivityNotificationService::class)->notifyPeerRoleChange(
            $request->user(),
            'catalog',
            'updated',
            'author "'.$author->name.'"',
            route('authors'),
        );

        return back();
    }

    public function destroy(Request $request, Author $author): RedirectResponse
    {
        $authorName = $author->name;
        $author->delete();

        app(ActivityNotificationService::class)->notifyPeerRoleChange(
            $request->user(),
            'catalog',
            'deleted',
            'author "'.$authorName.'"',
            route('authors'),
        );

        return back();
    }
}
