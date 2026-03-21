import { type BreadcrumbItem, type SharedData } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler, useEffect, useMemo, useState } from 'react';

import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { Camera } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Profile settings',
        href: '/settings/profile',
    },
];

const PSGC_BASE = 'https://psgc.gitlab.io/api';

type PSGCItem = {
    code: string;
    name: string;
};

const readJson = async (url: string): Promise<PSGCItem[]> => {
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error('Unable to load location data.');
    }

    return response.json();
};

export default function Profile({ mustVerifyEmail, status }: { mustVerifyEmail: boolean; status?: string }) {
    const { auth } = usePage<SharedData>().props;
    const [regions, setRegions] = useState<PSGCItem[]>([]);
    const [provinces, setProvinces] = useState<PSGCItem[]>([]);
    const [cities, setCities] = useState<PSGCItem[]>([]);
    const [barangays, setBarangays] = useState<PSGCItem[]>([]);
    const [regionCode, setRegionCode] = useState('');
    const [provinceCode, setProvinceCode] = useState('');
    const [cityCode, setCityCode] = useState('');
    const [barangayCode, setBarangayCode] = useState('');
    const [loadingRegions, setLoadingRegions] = useState(false);
    const [loadingProvinces, setLoadingProvinces] = useState(false);
    const [loadingCities, setLoadingCities] = useState(false);
    const [loadingBarangays, setLoadingBarangays] = useState(false);
    const [locationError, setLocationError] = useState('');

    const { data, setData, post, errors, processing, recentlySuccessful } = useForm<{
        name: string;
        email: string;
        profile_photo: File | null;
        contact_number: string;
        region_name: string;
        province_name: string;
        city_municipality_name: string;
        barangay_name: string;
        street_address: string;
        _method: 'patch';
    }>({
        name: auth.user.name,
        email: auth.user.email,
        profile_photo: null,
        contact_number: String(auth.user.contact_number || ''),
        region_name: String(auth.user.region_name || ''),
        province_name: String(auth.user.province_name || ''),
        city_municipality_name: String(auth.user.city_municipality_name || ''),
        barangay_name: String(auth.user.barangay_name || ''),
        street_address: String(auth.user.street_address || ''),
        _method: 'patch',
    });

    const previewUrl = useMemo(() => {
        if (data.profile_photo) {
            return URL.createObjectURL(data.profile_photo);
        }

        return (auth.user.avatar as string | undefined) || '';
    }, [data.profile_photo, auth.user.avatar]);

    useEffect(() => {
        const loadRegions = async () => {
            setLoadingRegions(true);
            setLocationError('');

            try {
                const regionItems = await readJson(`${PSGC_BASE}/regions/`);
                setRegions(regionItems);

                const matchedRegion = regionItems.find((item) => item.name === data.region_name);
                if (matchedRegion) {
                    setRegionCode(matchedRegion.code);
                }
            } catch {
                setLocationError('Unable to load PSGC regions right now. Please try again later.');
            } finally {
                setLoadingRegions(false);
            }
        };

        loadRegions();
    }, [data.region_name]);

    useEffect(() => {
        if (!regionCode) {
            setProvinces([]);
            setCities([]);
            setBarangays([]);
            setProvinceCode('');
            setCityCode('');
            setBarangayCode('');
            return;
        }

        const loadRegionChildren = async () => {
            setLoadingProvinces(true);
            setLoadingCities(true);
            setLocationError('');

            try {
                const [provinceItems, cityItems] = await Promise.all([
                    readJson(`${PSGC_BASE}/regions/${regionCode}/provinces/`),
                    readJson(`${PSGC_BASE}/regions/${regionCode}/cities-municipalities/`),
                ]);

                setProvinces(provinceItems);
                setCities(cityItems);

                const matchedProvince = provinceItems.find((item) => item.name === data.province_name);
                if (matchedProvince) {
                    setProvinceCode(matchedProvince.code);
                }

                const matchedCity = cityItems.find((item) => item.name === data.city_municipality_name);
                if (matchedCity) {
                    setCityCode(matchedCity.code);
                }
            } catch {
                setLocationError('Unable to load provinces/cities for the selected region.');
            } finally {
                setLoadingProvinces(false);
                setLoadingCities(false);
            }
        };

        loadRegionChildren();
    }, [regionCode, data.province_name, data.city_municipality_name]);

    useEffect(() => {
        if (!cityCode) {
            setBarangays([]);
            setBarangayCode('');
            return;
        }

        const loadBarangays = async () => {
            setLoadingBarangays(true);
            setLocationError('');

            try {
                const barangayItems = await readJson(`${PSGC_BASE}/cities-municipalities/${cityCode}/barangays/`);
                setBarangays(barangayItems);

                const matchedBarangay = barangayItems.find((item) => item.name === data.barangay_name);
                if (matchedBarangay) {
                    setBarangayCode(matchedBarangay.code);
                }
            } catch {
                setLocationError('Unable to load barangays for the selected city/municipality.');
            } finally {
                setLoadingBarangays(false);
            }
        };

        loadBarangays();
    }, [cityCode, data.barangay_name]);

    const handleRegionChange = (code: string) => {
        const region = regions.find((item) => item.code === code);
        setRegionCode(code);
        setData('region_name', region?.name || '');
        setData('province_name', '');
        setData('city_municipality_name', '');
        setData('barangay_name', '');
        setProvinceCode('');
        setCityCode('');
        setBarangayCode('');
    };

    const handleProvinceChange = async (code: string) => {
        const province = provinces.find((item) => item.code === code);
        setProvinceCode(code);
        setData('province_name', province?.name || '');
        setData('city_municipality_name', '');
        setData('barangay_name', '');
        setCityCode('');
        setBarangayCode('');
        setBarangays([]);

        if (!code && regionCode) {
            setLoadingCities(true);

            try {
                const cityItems = await readJson(`${PSGC_BASE}/regions/${regionCode}/cities-municipalities/`);
                setCities(cityItems);
            } catch {
                setLocationError('Unable to reload cities/municipalities for the selected region.');
            } finally {
                setLoadingCities(false);
            }

            return;
        }

        if (!code) {
            return;
        }

        setLoadingCities(true);

        try {
            const cityItems = await readJson(`${PSGC_BASE}/provinces/${code}/cities-municipalities/`);
            setCities(cityItems);
        } catch {
            setLocationError('Unable to load cities/municipalities for the selected province.');
        } finally {
            setLoadingCities(false);
        }
    };

    const handleCityChange = (code: string) => {
        const city = cities.find((item) => item.code === code);
        setCityCode(code);
        setData('city_municipality_name', city?.name || '');
        setData('barangay_name', '');
        setBarangayCode('');
    };

    const handleBarangayChange = (code: string) => {
        const barangay = barangays.find((item) => item.code === code);
        setBarangayCode(code);
        setData('barangay_name', barangay?.name || '');
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('profile.update'), {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Profile settings" />

            <SettingsLayout>
                <div className="min-h-[34rem] space-y-6 rounded-2xl border border-[#d5e7df] bg-white/75 p-6 shadow-sm dark:border-white/12 dark:bg-white/6 md:p-7">
                    <HeadingSmall title="Profile information" description="Update your name, email address, and profile photo" />

                    <div className="flex flex-col gap-4 rounded-2xl border border-[#d9e8e1] bg-white/80 p-4 dark:border-white/12 dark:bg-white/6 md:flex-row md:items-center">
                        <div className="relative h-20 w-20 overflow-hidden rounded-full border border-[#cddfd6] bg-[#eef8f3] dark:border-white/18 dark:bg-[#143128]">
                            {previewUrl ? (
                                <img src={previewUrl} alt={auth.user.name} className="h-full w-full object-cover" />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-[#3b6255] dark:text-[#9bcfb8]">
                                    {auth.user.name
                                        .split(' ')
                                        .filter(Boolean)
                                        .slice(0, 2)
                                        .map((part) => part[0]?.toUpperCase())
                                        .join('')}
                                </div>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="profile_photo">Profile Picture</Label>
                            <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[#cfe2d9] bg-white px-3 py-2 text-sm font-semibold text-[#2f5d4d] transition hover:bg-[#f2faf6] dark:border-white/18 dark:bg-white/8 dark:text-[#c9eadc] dark:hover:bg-white/12">
                                <Camera size={14} />
                                Choose photo
                                <input
                                    id="profile_photo"
                                    type="file"
                                    accept="image/png,image/jpeg,image/jpg,image/webp"
                                    className="hidden"
                                    onChange={(e) => setData('profile_photo', e.target.files?.[0] || null)}
                                />
                            </label>
                            <p className="text-xs text-[#667d74] dark:text-[#9eb4ac]">PNG, JPG, or WEBP. Max 2MB.</p>
                            <InputError className="mt-0" message={errors.profile_photo} />
                        </div>
                    </div>

                    <form onSubmit={submit} className="space-y-6">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Name</Label>

                            <Input
                                id="name"
                                className="mt-1 block w-full"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                required
                                autoComplete="name"
                                placeholder="Full name"
                            />

                            <InputError className="mt-2" message={errors.name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="email">Email address</Label>

                            <Input
                                id="email"
                                type="email"
                                className="mt-1 block w-full"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                required
                                autoComplete="username"
                                placeholder="Email address"
                            />

                            <InputError className="mt-2" message={errors.email} />
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="grid gap-2">
                                <Label htmlFor="contact_number">Contact Number</Label>
                                <Input
                                    id="contact_number"
                                    className="mt-1 block w-full"
                                    value={data.contact_number}
                                    onChange={(e) => setData('contact_number', e.target.value)}
                                    placeholder="Phone number"
                                />
                                <InputError className="mt-2" message={errors.contact_number} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="region_name">Region</Label>
                                <select
                                    id="region_name"
                                    value={regionCode}
                                    onChange={(e) => handleRegionChange(e.target.value)}
                                    className="mt-1 block h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs"
                                >
                                    <option value="">{loadingRegions ? 'Loading regions...' : 'Select region'}</option>
                                    {regions.map((region) => (
                                        <option key={region.code} value={region.code}>
                                            {region.name}
                                        </option>
                                    ))}
                                </select>
                                <InputError className="mt-2" message={errors.region_name} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="province_name">Province</Label>
                                <select
                                    id="province_name"
                                    value={provinceCode}
                                    onChange={(e) => handleProvinceChange(e.target.value)}
                                    className="mt-1 block h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs disabled:cursor-not-allowed disabled:opacity-60"
                                    disabled={!regionCode || loadingProvinces}
                                >
                                    <option value="">{loadingProvinces ? 'Loading provinces...' : provinces.length === 0 ? 'No province (if NCR, skip)' : 'Select province'}</option>
                                    {provinces.map((province) => (
                                        <option key={province.code} value={province.code}>
                                            {province.name}
                                        </option>
                                    ))}
                                </select>
                                <InputError className="mt-2" message={errors.province_name} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="city_municipality_name">City / Municipality</Label>
                                <select
                                    id="city_municipality_name"
                                    value={cityCode}
                                    onChange={(e) => handleCityChange(e.target.value)}
                                    className="mt-1 block h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs disabled:cursor-not-allowed disabled:opacity-60"
                                    disabled={!regionCode || loadingCities || cities.length === 0}
                                >
                                    <option value="">{loadingCities ? 'Loading cities...' : 'Select city / municipality'}</option>
                                    {cities.map((city) => (
                                        <option key={city.code} value={city.code}>
                                            {city.name}
                                        </option>
                                    ))}
                                </select>
                                <InputError className="mt-2" message={errors.city_municipality_name} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="barangay_name">Barangay</Label>
                                <select
                                    id="barangay_name"
                                    value={barangayCode}
                                    onChange={(e) => handleBarangayChange(e.target.value)}
                                    className="mt-1 block h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs disabled:cursor-not-allowed disabled:opacity-60"
                                    disabled={!cityCode || loadingBarangays}
                                >
                                    <option value="">{loadingBarangays ? 'Loading barangays...' : 'Select barangay'}</option>
                                    {barangays.map((barangay) => (
                                        <option key={barangay.code} value={barangay.code}>
                                            {barangay.name}
                                        </option>
                                    ))}
                                </select>
                                <InputError className="mt-2" message={errors.barangay_name} />
                            </div>

                            {locationError && <p className="md:col-span-2 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-500/60 dark:bg-red-950/30 dark:text-red-200">{locationError}</p>}

                            <div className="grid gap-2 md:col-span-2">
                                <Label htmlFor="street_address">Street Address</Label>
                                <Input
                                    id="street_address"
                                    className="mt-1 block w-full"
                                    value={data.street_address}
                                    onChange={(e) => setData('street_address', e.target.value)}
                                    placeholder="Street address"
                                />
                                <InputError className="mt-2" message={errors.street_address} />
                            </div>
                        </div>

                        {mustVerifyEmail && auth.user.email_verified_at === null && (
                            <div>
                                <p className="mt-2 text-sm text-neutral-800">
                                    Your email address is unverified.
                                    <Link
                                        href={route('verification.send')}
                                        method="post"
                                        as="button"
                                        className="rounded-md text-sm text-neutral-600 underline hover:text-neutral-900 focus:ring-2 focus:ring-offset-2 focus:outline-hidden"
                                    >
                                        Click here to re-send the verification email.
                                    </Link>
                                </p>

                                {status === 'verification-link-sent' && (
                                    <div className="mt-2 text-sm font-medium text-green-600">
                                        A new verification link has been sent to your email address.
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="flex items-center gap-4">
                            <Button disabled={processing}>Save</Button>

                            <Transition
                                show={recentlySuccessful}
                                enter="transition ease-in-out"
                                enterFrom="opacity-0"
                                leave="transition ease-in-out"
                                leaveTo="opacity-0"
                            >
                                <p className="text-sm text-neutral-600">Saved</p>
                            </Transition>
                        </div>
                    </form>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
