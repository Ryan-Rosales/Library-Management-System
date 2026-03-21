import AppLayout from '@/layouts/app-layout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { Edit3, Plus, Search, Trash2, UsersRound, WandSparkles, X } from 'lucide-react';
import { useEffect, useState } from 'react';

const PSGC_BASE = 'https://psgc.gitlab.io/api';

const generateSecurePassword = (length = 12) => {
    const charset = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
    const randomBytes = new Uint32Array(length);
    window.crypto.getRandomValues(randomBytes);

    return Array.from(randomBytes)
        .map((value) => charset[value % charset.length])
        .join('');
};

const readJson = async (url) => {
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error('Unable to load location data.');
    }

    return response.json();
};

const initialForm = {
    name: '',
    email: '',
    password: '',
    contact_number: '',
    region_code: '',
    region_name: '',
    province_code: '',
    province_name: '',
    city_municipality_code: '',
    city_municipality_name: '',
    barangay_code: '',
    barangay_name: '',
    street_address: '',
};

export default function ManageUsersPage({ title, role, records, filters, routes, columns, prefill }) {
    const entityLabel = role === 'staff' ? 'Staff' : 'Member';
    const isMemberPage = role === 'member';

    const breadcrumbs = [
        { title: 'People', href: '/members' },
        { title, href: route(routes.index) },
    ];

    const [editingId, setEditingId] = useState(null);
    const [search, setSearch] = useState(filters?.search || '');
    const [regions, setRegions] = useState([]);
    const [provinces, setProvinces] = useState([]);
    const [cities, setCities] = useState([]);
    const [barangays, setBarangays] = useState([]);
    const [loadingRegions, setLoadingRegions] = useState(false);
    const [loadingProvinces, setLoadingProvinces] = useState(false);
    const [loadingCities, setLoadingCities] = useState(false);
    const [loadingBarangays, setLoadingBarangays] = useState(false);
    const [locationError, setLocationError] = useState('');

    useEffect(() => {
        if (!isMemberPage) {
            return;
        }

        const loadRegions = async () => {
            setLoadingRegions(true);
            setLocationError('');

            try {
                const regionItems = await readJson(`${PSGC_BASE}/regions/`);
                setRegions(regionItems);
            } catch (error) {
                setLocationError('Unable to load PSGC regions right now. Please try again later.');
            } finally {
                setLoadingRegions(false);
            }
        };

        loadRegions();
    }, [isMemberPage]);

    const handleRegionChange = async (code) => {
        const selectedRegion = regions.find((item) => item.code === code);

        setData((current) => ({
            ...current,
            region_code: code,
            region_name: selectedRegion?.name ?? '',
            province_code: '',
            province_name: '',
            city_municipality_code: '',
            city_municipality_name: '',
            barangay_code: '',
            barangay_name: '',
        }));

        setProvinces([]);
        setCities([]);
        setBarangays([]);

        if (!code) {
            return;
        }

        setLoadingProvinces(true);
        setLoadingCities(true);
        setLocationError('');

        try {
            const [provinceItems, cityItems] = await Promise.all([
                readJson(`${PSGC_BASE}/regions/${code}/provinces/`),
                readJson(`${PSGC_BASE}/regions/${code}/cities-municipalities/`),
            ]);

            setProvinces(provinceItems);
            setCities(cityItems);
        } catch (error) {
            setLocationError('Unable to load provinces/cities for the selected region.');
        } finally {
            setLoadingProvinces(false);
            setLoadingCities(false);
        }
    };

    const handleProvinceChange = async (code) => {
        const selectedProvince = provinces.find((item) => item.code === code);

        setData((current) => ({
            ...current,
            province_code: code,
            province_name: selectedProvince?.name ?? '',
            city_municipality_code: '',
            city_municipality_name: '',
            barangay_code: '',
            barangay_name: '',
        }));

        setCities([]);
        setBarangays([]);

        if (!code) {
            if (data.region_code) {
                setLoadingCities(true);

                try {
                    const cityItems = await readJson(`${PSGC_BASE}/regions/${data.region_code}/cities-municipalities/`);
                    setCities(cityItems);
                } catch (error) {
                    setLocationError('Unable to load cities/municipalities for the selected region.');
                } finally {
                    setLoadingCities(false);
                }
            }

            return;
        }

        setLoadingCities(true);
        setLocationError('');

        try {
            const cityItems = await readJson(`${PSGC_BASE}/provinces/${code}/cities-municipalities/`);
            setCities(cityItems);
        } catch (error) {
            setLocationError('Unable to load cities/municipalities for the selected province.');
        } finally {
            setLoadingCities(false);
        }
    };

    const handleCityChange = async (code) => {
        const selectedCity = cities.find((item) => item.code === code);

        setData((current) => ({
            ...current,
            city_municipality_code: code,
            city_municipality_name: selectedCity?.name ?? '',
            barangay_code: '',
            barangay_name: '',
        }));

        setBarangays([]);

        if (!code) {
            return;
        }

        setLoadingBarangays(true);
        setLocationError('');

        try {
            const barangayItems = await readJson(`${PSGC_BASE}/cities-municipalities/${code}/barangays/`);
            setBarangays(barangayItems);
        } catch (error) {
            setLocationError('Unable to load barangays for the selected city/municipality.');
        } finally {
            setLoadingBarangays(false);
        }
    };

    const handleBarangayChange = (code) => {
        const selectedBarangay = barangays.find((item) => item.code === code);

        setData((current) => ({
            ...current,
            barangay_code: code,
            barangay_name: selectedBarangay?.name ?? '',
        }));
    };

    const initialData = isMemberPage
        ? {
              ...initialForm,
              name: prefill?.name || '',
              email: prefill?.email || '',
              password: generateSecurePassword(),
              contact_number: prefill?.contact_number || '',
              region_code: '',
              region_name: prefill?.region_name || '',
              province_code: '',
              province_name: prefill?.province_name || '',
              city_municipality_code: '',
              city_municipality_name: prefill?.city_municipality_name || '',
              barangay_code: '',
              barangay_name: prefill?.barangay_name || '',
              street_address: prefill?.street_address || '',
          }
        : initialForm;

    const { data, setData, post, put, processing, errors, reset } = useForm(initialData);

    const submit = (event) => {
        event.preventDefault();

        if (editingId) {
            put(route(routes.update, editingId), {
                preserveScroll: true,
                onSuccess: () => {
                    setEditingId(null);
                    reset(...Object.keys(initialForm));
                    setProvinces([]);
                    setCities([]);
                    setBarangays([]);
                },
            });
            return;
        }

        post(route(routes.store), {
            preserveScroll: true,
            onSuccess: () => {
                reset(...Object.keys(initialForm));
                if (isMemberPage) {
                    setData('password', generateSecurePassword());
                }
                setProvinces([]);
                setCities([]);
                setBarangays([]);
            },
        });
    };

    const editRecord = (item) => {
        setEditingId(item.id);
        setData({
            name: item.name,
            email: item.email,
            password: '',
            contact_number: item.contact_number || '',
            region_code: '',
            region_name: item.region_name || '',
            province_code: '',
            province_name: item.province_name || '',
            city_municipality_code: '',
            city_municipality_name: item.city_municipality_name || '',
            barangay_code: '',
            barangay_name: item.barangay_name || '',
            street_address: item.street_address || '',
        });
        setProvinces([]);
        setCities([]);
        setBarangays([]);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const cancelEdit = () => {
        setEditingId(null);
        reset();
        if (isMemberPage) {
            setData('password', generateSecurePassword());
        }
        setProvinces([]);
        setCities([]);
        setBarangays([]);
    };

    const removeRecord = (id) => {
        if (!window.confirm(`Delete this ${role} account?`)) {
            return;
        }

        router.delete(route(routes.destroy, id), {
            preserveScroll: true,
        });
    };

    const applySearch = (event) => {
        event.preventDefault();
        router.get(
            route(routes.index),
            { search },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={title} />
            <div className="page-enter relative flex min-h-[calc(100vh-4rem)] flex-1 flex-col overflow-hidden bg-[linear-gradient(130deg,#f2fbf6_0%,#edf5ff_46%,#f5f8ff_100%)] px-4 py-5 dark:bg-[linear-gradient(130deg,#091512_0%,#0d1a1f_46%,#0f1624_100%)] md:px-6 md:py-6">
                <div className="pointer-events-none absolute left-12 top-0 h-72 w-72 rounded-full bg-[#8ce9c6]/35 blur-3xl dark:bg-[#46aa8f]/20" />

                <div className="page-enter-item relative z-10 mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <p className="text-sm font-semibold tracking-[0.14em] text-[#2f7c59] dark:text-[#8edaba]">PEOPLE</p>
                        <h1 className="mt-1 text-4xl font-semibold text-[#1a2b24] dark:text-[#def5ec] md:text-5xl" style={{ fontFamily: 'Cormorant Garamond, Georgia, Times New Roman, serif' }}>
                            {title}
                        </h1>
                    </div>
                </div>

                <section className="page-enter-item relative z-10 rounded-3xl border border-white/70 bg-white/82 p-5 shadow-[0_24px_50px_rgba(33,72,60,0.12)] backdrop-blur dark:border-white/15 dark:bg-[#0f1d24cc] dark:shadow-[0_24px_55px_rgba(3,9,14,0.6)]" style={{ animationDelay: '70ms' }}>
                    <div className="mb-4 flex items-center gap-2 text-[#2c6d52] dark:text-[#96e2c2]">
                        <UsersRound size={18} />
                        <h2 className="text-lg font-semibold">{editingId ? `Edit ${entityLabel}` : `Add ${entityLabel}`}</h2>
                    </div>

                    <form onSubmit={submit} className="grid gap-3 md:grid-cols-3">
                        <div>
                            <label className="mb-1 block text-xs font-semibold tracking-wide text-[#4f625c] dark:text-[#9cb7ad]">NAME</label>
                            <input
                                value={data.name}
                                onChange={(event) => setData('name', event.target.value)}
                                className="w-full rounded-xl border border-[#d4ddd8] bg-white px-3 py-2.5 text-[#22332c] dark:border-white/20 dark:bg-[#112128] dark:text-[#d8efe4]"
                                placeholder="Full name"
                            />
                            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
                        </div>

                        <div>
                            <label className="mb-1 block text-xs font-semibold tracking-wide text-[#4f625c] dark:text-[#9cb7ad]">EMAIL</label>
                            <input
                                type="email"
                                value={data.email}
                                onChange={(event) => setData('email', event.target.value)}
                                className="w-full rounded-xl border border-[#d4ddd8] bg-white px-3 py-2.5 text-[#22332c] dark:border-white/20 dark:bg-[#112128] dark:text-[#d8efe4]"
                                placeholder="email@domain.com"
                            />
                            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
                        </div>

                        <div>
                            <label className="mb-1 block text-xs font-semibold tracking-wide text-[#4f625c] dark:text-[#9cb7ad]">
                                PASSWORD {editingId ? '(leave blank to keep current)' : ''}
                            </label>
                            {isMemberPage && !editingId ? (
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            value={data.password}
                                            readOnly
                                            className="w-full rounded-xl border border-[#d4ddd8] bg-white px-3 py-2.5 text-[#22332c] dark:border-white/20 dark:bg-[#112128] dark:text-[#d8efe4]"
                                            placeholder="Auto-generated member password"
                                        />
                                        <button
                                            type="button"
                                            aria-label="Regenerate member password"
                                            title="Regenerate member password"
                                            onClick={() => setData('password', generateSecurePassword())}
                                            className="inline-flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-xl border border-[#c7d8d1] bg-white text-[#355f4f] transition hover:bg-[#f2faf6] dark:border-white/20 dark:bg-white/10 dark:text-[#c8e6da]"
                                        >
                                            <WandSparkles size={16} />
                                        </button>
                                    </div>
                                    <p className="text-[11px] text-[#5f756d] dark:text-[#9cb2ab]">This generated password will be sent to the member Gmail in the welcome email.</p>
                                </div>
                            ) : (
                                <input
                                    type="password"
                                    value={data.password}
                                    onChange={(event) => setData('password', event.target.value)}
                                    className="w-full rounded-xl border border-[#d4ddd8] bg-white px-3 py-2.5 text-[#22332c] dark:border-white/20 dark:bg-[#112128] dark:text-[#d8efe4]"
                                    placeholder="Minimum 8 characters"
                                />
                            )}
                            {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
                        </div>

                        {isMemberPage && (
                            <>
                                <div>
                                    <label className="mb-1 block text-xs font-semibold tracking-wide text-[#4f625c] dark:text-[#9cb7ad]">CONTACT NUMBER</label>
                                    <input
                                        value={data.contact_number}
                                        onChange={(event) => setData('contact_number', event.target.value)}
                                        className="w-full rounded-xl border border-[#d4ddd8] bg-white px-3 py-2.5 text-[#22332c] dark:border-white/20 dark:bg-[#112128] dark:text-[#d8efe4]"
                                        placeholder="09171234567"
                                    />
                                    {errors.contact_number && <p className="mt-1 text-xs text-red-600">{errors.contact_number}</p>}
                                </div>

                                <div>
                                    <label className="mb-1 block text-xs font-semibold tracking-wide text-[#4f625c] dark:text-[#9cb7ad]">REGION</label>
                                    <select
                                        value={data.region_code}
                                        onChange={(event) => handleRegionChange(event.target.value)}
                                        className="h-[42px] w-full rounded-xl border border-[#d4ddd8] bg-white px-3 text-sm text-[#22332c] dark:border-white/20 dark:bg-[#112128] dark:text-[#d8efe4]"
                                    >
                                        <option value="">{loadingRegions ? 'Loading regions...' : 'Select region'}</option>
                                        {regions.map((region) => (
                                            <option key={region.code} value={region.code}>
                                                {region.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.region_name && <p className="mt-1 text-xs text-red-600">{errors.region_name}</p>}
                                </div>

                                <div>
                                    <label className="mb-1 block text-xs font-semibold tracking-wide text-[#4f625c] dark:text-[#9cb7ad]">PROVINCE</label>
                                    <select
                                        value={data.province_code}
                                        onChange={(event) => handleProvinceChange(event.target.value)}
                                        className="h-[42px] w-full rounded-xl border border-[#d4ddd8] bg-white px-3 text-sm text-[#22332c] disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/20 dark:bg-[#112128] dark:text-[#d8efe4]"
                                        disabled={!data.region_code || loadingProvinces}
                                    >
                                        <option value="">{loadingProvinces ? 'Loading provinces...' : provinces.length === 0 ? 'No province (if NCR, skip)' : 'Select province'}</option>
                                        {provinces.map((province) => (
                                            <option key={province.code} value={province.code}>
                                                {province.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.province_name && <p className="mt-1 text-xs text-red-600">{errors.province_name}</p>}
                                </div>

                                <div>
                                    <label className="mb-1 block text-xs font-semibold tracking-wide text-[#4f625c] dark:text-[#9cb7ad]">CITY / MUNICIPALITY</label>
                                    <select
                                        value={data.city_municipality_code}
                                        onChange={(event) => handleCityChange(event.target.value)}
                                        className="h-[42px] w-full rounded-xl border border-[#d4ddd8] bg-white px-3 text-sm text-[#22332c] disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/20 dark:bg-[#112128] dark:text-[#d8efe4]"
                                        disabled={!data.region_code || loadingCities || cities.length === 0}
                                    >
                                        <option value="">{loadingCities ? 'Loading cities...' : 'Select city / municipality'}</option>
                                        {cities.map((city) => (
                                            <option key={city.code} value={city.code}>
                                                {city.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.city_municipality_name && <p className="mt-1 text-xs text-red-600">{errors.city_municipality_name}</p>}
                                </div>

                                <div>
                                    <label className="mb-1 block text-xs font-semibold tracking-wide text-[#4f625c] dark:text-[#9cb7ad]">BARANGAY</label>
                                    <select
                                        value={data.barangay_code}
                                        onChange={(event) => handleBarangayChange(event.target.value)}
                                        className="h-[42px] w-full rounded-xl border border-[#d4ddd8] bg-white px-3 text-sm text-[#22332c] disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/20 dark:bg-[#112128] dark:text-[#d8efe4]"
                                        disabled={!data.city_municipality_code || loadingBarangays}
                                    >
                                        <option value="">{loadingBarangays ? 'Loading barangays...' : 'Select barangay'}</option>
                                        {barangays.map((barangay) => (
                                            <option key={barangay.code} value={barangay.code}>
                                                {barangay.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.barangay_name && <p className="mt-1 text-xs text-red-600">{errors.barangay_name}</p>}
                                </div>

                                {locationError && (
                                    <div className="md:col-span-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-500/50 dark:bg-red-900/20 dark:text-red-200">
                                        {locationError}
                                    </div>
                                )}

                                {(data.region_name || data.city_municipality_name || data.barangay_name) && (
                                    <div className="md:col-span-3 rounded-xl border border-[#cde1d7] bg-[#f6fbf8] px-3 py-2 text-xs text-[#3d6555] dark:border-white/15 dark:bg-white/8 dark:text-[#b8d8ca]">
                                        Current selection: {data.barangay_name || '-'}, {data.city_municipality_name || '-'}, {data.province_name || '-'}, {data.region_name || '-'}
                                    </div>
                                )}

                                <div className="md:col-span-3">
                                    <label className="mb-1 block text-xs font-semibold tracking-wide text-[#4f625c] dark:text-[#9cb7ad]">STREET / UNIT / LANDMARK</label>
                                    <input
                                        value={data.street_address}
                                        onChange={(event) => setData('street_address', event.target.value)}
                                        className="w-full rounded-xl border border-[#d4ddd8] bg-white px-3 py-2.5 text-[#22332c] dark:border-white/20 dark:bg-[#112128] dark:text-[#d8efe4]"
                                        placeholder="Street / Unit / Landmark"
                                    />
                                    {errors.street_address && <p className="mt-1 text-xs text-red-600">{errors.street_address}</p>}
                                </div>
                            </>
                        )}

                        <div className="md:col-span-3 flex flex-wrap items-center gap-2 pt-1">
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center gap-2 rounded-xl bg-[linear-gradient(90deg,#2fa06f_0%,#2085c1_100%)] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <Plus size={14} />
                                {editingId ? 'Update' : 'Add'}
                            </button>

                            {editingId && (
                                <button
                                    type="button"
                                    onClick={cancelEdit}
                                    className="inline-flex items-center gap-2 rounded-xl border border-[#c7d8d1] bg-white px-4 py-2.5 text-sm font-semibold text-[#355f4f] transition hover:bg-[#f2faf6] dark:border-white/20 dark:bg-white/10 dark:text-[#c8e6da]"
                                >
                                    <X size={14} />
                                    Cancel Edit
                                </button>
                            )}
                        </div>
                    </form>
                </section>

                <section className="page-enter-item relative z-10 mt-5 rounded-3xl border border-white/70 bg-white/82 p-5 shadow-[0_24px_50px_rgba(33,72,60,0.12)] backdrop-blur dark:border-white/15 dark:bg-[#0f1d24cc] dark:shadow-[0_24px_55px_rgba(3,9,14,0.6)]" style={{ animationDelay: '120ms' }}>
                    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <h2 className="text-lg font-semibold text-[#1d3029] dark:text-[#d9f3e8]">{title} Table</h2>
                        <form onSubmit={applySearch} className="flex w-full max-w-sm items-center gap-2">
                            <div className="relative flex-1">
                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6a837a]" />
                                <input
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                    className="w-full rounded-xl border border-[#d4ddd8] bg-white py-2 pl-9 pr-3 text-sm text-[#22332c] dark:border-white/20 dark:bg-[#112128] dark:text-[#d8efe4]"
                                    placeholder={`Search ${title.toLowerCase()}...`}
                                />
                            </div>
                            <button className="rounded-xl bg-[#2f8e63] px-3 py-2 text-sm font-semibold text-white">Find</button>
                        </form>
                    </div>

                    <div className="overflow-x-auto rounded-2xl border border-[#dce8e2] dark:border-white/10">
                        <table className="min-w-full text-sm">
                            <thead className="bg-[#edf8f2] text-left text-[#2b5444] dark:bg-[#14332d] dark:text-[#a9dfc7]">
                                <tr>
                                    {columns.map((column) => (
                                        <th key={column.key} className="px-4 py-3">
                                            {column.label}
                                        </th>
                                    ))}
                                    <th className="px-4 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {records.data.length === 0 && (
                                    <tr>
                                        <td className="px-4 py-6 text-center text-[#627a72] dark:text-[#9ab1a8]" colSpan={columns.length + 1}>
                                            No records found yet.
                                        </td>
                                    </tr>
                                )}

                                {records.data.map((item) => (
                                    <tr key={item.id} className="border-t border-[#e6efea] dark:border-white/10">
                                        {columns.map((column) => (
                                            <td key={`${item.id}-${column.key}`} className="px-4 py-3 text-[#5f756d] dark:text-[#9cb2ab]">
                                                {column.key === 'created_at'
                                                    ? new Date(item.created_at).toLocaleDateString()
                                                    : (item[column.key] || '-')}
                                            </td>
                                        ))}
                                        <td className="px-4 py-3">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => editRecord(item)}
                                                    className="inline-flex items-center gap-1 rounded-lg border border-[#cde1d7] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#2f6c53] hover:bg-[#f2faf6] dark:border-white/20 dark:bg-white/10 dark:text-[#bde8d3]"
                                                >
                                                    <Edit3 size={12} />
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => removeRecord(item.id)}
                                                    className="inline-flex items-center gap-1 rounded-lg border border-[#efc7c7] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#b04848] hover:bg-[#fff2f2] dark:border-[#703535] dark:bg-white/10 dark:text-[#efb0b0]"
                                                >
                                                    <Trash2 size={12} />
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-2">
                        {records.links.map((link, index) => (
                            <Link
                                key={`${link.url}-${index}`}
                                href={link.url || '#'}
                                preserveState
                                preserveScroll
                                className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                                    link.active
                                        ? 'border-[#70c7a1] bg-[#e9f8f1] text-[#245e48] dark:border-[#4f9f85] dark:bg-[#16372f] dark:text-[#b4ebd4]'
                                        : 'border-[#d8e5de] bg-white text-[#44695b] hover:bg-[#f4fbf7] dark:border-white/20 dark:bg-white/8 dark:text-[#9fc2b4] dark:hover:bg-white/12'
                                } ${!link.url ? 'pointer-events-none opacity-50' : ''}`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                </section>
            </div>
        </AppLayout>
    );
}
