import { Head, Link, useForm } from '@inertiajs/react';
import { LoaderCircle, Mail, MapPin, Phone, UserRound } from 'lucide-react';
import { useEffect, useState } from 'react';
import LibraryBrandPanel from '@/components/auth/LibraryBrandPanel';
import LibraryAuthLayout from '@/layouts/auth/LibraryAuthLayout';

const PSGC_BASE = 'https://psgc.gitlab.io/api';

const readJson = async (url) => {
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error('Unable to load location data.');
    }

    return response.json();
};

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
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
    });
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
    }, []);

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

    const submit = (event) => {
        event.preventDefault();
        post(route('register'), {
            onSuccess: () => {
                reset();
                setProvinces([]);
                setCities([]);
                setBarangays([]);
            },
        });
    };

    return (
        <>
            <Head title="Request membership">
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,600&family=Manrope:wght@400;500;600;700&display=swap"
                    rel="stylesheet"
                />
                <style>{`body { font-family: 'Manrope', ui-sans-serif, system-ui, sans-serif; }`}</style>
            </Head>

            <LibraryAuthLayout
                leftPanel={<LibraryBrandPanel />}
                formPanel={
                    <div className="relative z-10 mx-auto flex h-full min-h-0 w-full max-w-[560px] flex-col justify-start overflow-y-auto px-3 py-3 sm:px-5 sm:py-4 lg:ml-0 lg:mr-auto">
                        <div className="page-enter-item rounded-[26px] border border-white/70 bg-white/75 p-4 shadow-[0_18px_44px_rgba(39,77,63,0.16)] backdrop-blur-lg dark:border-white/15 dark:bg-[#0d1a1fcc] dark:shadow-[0_24px_60px_rgba(3,9,14,0.6)] sm:p-5">
                            <div className="mb-5 page-enter-item" style={{ animationDelay: '90ms' }}>
                                <p className="mb-3 inline-flex rounded-full border border-[#cde6da] bg-[#effaf4] px-3 py-1 text-xs font-semibold tracking-[0.12em] text-[#327f5d]">
                                    REQUEST MEMBERSHIP
                                </p>
                                <h2
                                    className="text-[2.2rem] leading-tight font-semibold text-[#1c2a24] dark:text-[#e6fbf2] sm:text-[2.6rem]"
                                    style={{ fontFamily: 'Cormorant Garamond, Georgia, Times New Roman, serif' }}
                                >
                                    Join Libraria
                                </h2>
                                <p className="mt-1.5 text-sm text-[#667772] dark:text-[#a7bbb3] sm:text-base">
                                    Submit your membership request and staff will review your details.
                                </p>
                            </div>

                            <form className="page-enter-item mt-4 space-y-4" style={{ animationDelay: '140ms' }} onSubmit={submit}>
                                <div>
                                    <label htmlFor="name" className="mb-2 block text-xs font-bold tracking-wide text-[#4f625c] dark:text-[#9cb7ad]">
                                        FULL NAME
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="name"
                                            type="text"
                                            required
                                            autoFocus
                                            autoComplete="name"
                                            value={data.name}
                                            onChange={(event) => setData('name', event.target.value)}
                                            placeholder="Juan Dela Cruz"
                                            className="w-full rounded-2xl border border-[#d4ddd8] bg-white px-4 py-3.5 pr-12 text-[#22332c] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] transition placeholder:text-[#94a5a0] hover:border-[#b9cdc3] focus:border-[#53b586] focus:outline-none focus:ring-4 focus:ring-[#d9f4e8] dark:border-white/20 dark:bg-[#112128] dark:text-[#d8efe4] dark:placeholder:text-[#7d988f] dark:hover:border-[#4f7f73] dark:focus:border-[#61c999] dark:focus:ring-[#1f5f4a]/60"
                                        />
                                        <UserRound size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8ea19a]" />
                                    </div>
                                    {errors.name && <p className="mt-2 text-sm text-red-600">{errors.name}</p>}
                                </div>

                                <div>
                                    <label htmlFor="contact_number" className="mb-2 block text-xs font-bold tracking-wide text-[#4f625c] dark:text-[#9cb7ad]">
                                        CONTACT NUMBER
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="contact_number"
                                            type="text"
                                            required
                                            value={data.contact_number}
                                            onChange={(event) => setData('contact_number', event.target.value)}
                                            placeholder="09171234567"
                                            className="w-full rounded-2xl border border-[#d4ddd8] bg-white px-4 py-3.5 pr-12 text-[#22332c] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] transition placeholder:text-[#94a5a0] hover:border-[#b9cdc3] focus:border-[#53b586] focus:outline-none focus:ring-4 focus:ring-[#d9f4e8] dark:border-white/20 dark:bg-[#112128] dark:text-[#d8efe4] dark:placeholder:text-[#7d988f] dark:hover:border-[#4f7f73] dark:focus:border-[#61c999] dark:focus:ring-[#1f5f4a]/60"
                                        />
                                        <Phone size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8ea19a]" />
                                    </div>
                                    {errors.contact_number && <p className="mt-2 text-sm text-red-600">{errors.contact_number}</p>}
                                </div>

                                <div>
                                    <label htmlFor="email" className="mb-2 block text-xs font-bold tracking-wide text-[#4f625c] dark:text-[#9cb7ad]">
                                        EMAIL ADDRESS
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="email"
                                            type="email"
                                            required
                                            autoComplete="email"
                                            value={data.email}
                                            onChange={(event) => setData('email', event.target.value)}
                                            placeholder="you@library.ph"
                                            className="w-full rounded-2xl border border-[#d4ddd8] bg-white px-4 py-3.5 pr-12 text-[#22332c] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] transition placeholder:text-[#94a5a0] hover:border-[#b9cdc3] focus:border-[#53b586] focus:outline-none focus:ring-4 focus:ring-[#d9f4e8] dark:border-white/20 dark:bg-[#112128] dark:text-[#d8efe4] dark:placeholder:text-[#7d988f] dark:hover:border-[#4f7f73] dark:focus:border-[#61c999] dark:focus:ring-[#1f5f4a]/60"
                                        />
                                        <Mail size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8ea19a]" />
                                    </div>
                                    {errors.email && <p className="mt-2 text-sm text-red-600">{errors.email}</p>}
                                </div>

                                <div>
                                    <label className="mb-2 block text-xs font-bold tracking-wide text-[#4f625c] dark:text-[#9cb7ad]">ADDRESS (PSGC)</label>
                                    <div className="grid gap-3 sm:grid-cols-2">
                                        <select
                                            value={data.region_code}
                                            onChange={(event) => handleRegionChange(event.target.value)}
                                            className="h-11 w-full rounded-2xl border border-[#d4ddd8] bg-white px-3 text-sm text-[#22332c] dark:border-white/20 dark:bg-[#112128] dark:text-[#d8efe4]"
                                            required
                                        >
                                            <option value="">{loadingRegions ? 'Loading regions...' : 'Select region'}</option>
                                            {regions.map((region) => (
                                                <option key={region.code} value={region.code}>
                                                    {region.name}
                                                </option>
                                            ))}
                                        </select>

                                        <select
                                            value={data.province_code}
                                            onChange={(event) => handleProvinceChange(event.target.value)}
                                            className="h-11 w-full rounded-2xl border border-[#d4ddd8] bg-white px-3 text-sm text-[#22332c] disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/20 dark:bg-[#112128] dark:text-[#d8efe4]"
                                            disabled={!data.region_code || loadingProvinces || provinces.length === 0}
                                        >
                                            <option value="">{loadingProvinces ? 'Loading provinces...' : provinces.length === 0 ? 'No province (if NCR, skip)' : 'Select province'}</option>
                                            {provinces.map((province) => (
                                                <option key={province.code} value={province.code}>
                                                    {province.name}
                                                </option>
                                            ))}
                                        </select>

                                        <select
                                            value={data.city_municipality_code}
                                            onChange={(event) => handleCityChange(event.target.value)}
                                            className="h-11 w-full rounded-2xl border border-[#d4ddd8] bg-white px-3 text-sm text-[#22332c] disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/20 dark:bg-[#112128] dark:text-[#d8efe4]"
                                            disabled={!data.region_code || loadingCities || cities.length === 0}
                                            required
                                        >
                                            <option value="">{loadingCities ? 'Loading cities...' : 'Select city / municipality'}</option>
                                            {cities.map((city) => (
                                                <option key={city.code} value={city.code}>
                                                    {city.name}
                                                </option>
                                            ))}
                                        </select>

                                        <select
                                            value={data.barangay_code}
                                            onChange={(event) => handleBarangayChange(event.target.value)}
                                            className="h-11 w-full rounded-2xl border border-[#d4ddd8] bg-white px-3 text-sm text-[#22332c] disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/20 dark:bg-[#112128] dark:text-[#d8efe4]"
                                            disabled={!data.city_municipality_code || loadingBarangays}
                                            required
                                        >
                                            <option value="">{loadingBarangays ? 'Loading barangays...' : 'Select barangay'}</option>
                                            {barangays.map((barangay) => (
                                                <option key={barangay.code} value={barangay.code}>
                                                    {barangay.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="relative">
                                        <input
                                            id="street_address"
                                            type="text"
                                            value={data.street_address}
                                            onChange={(event) => setData('street_address', event.target.value)}
                                            placeholder="Street / Unit / Landmark (optional)"
                                            className="w-full rounded-2xl border border-[#d4ddd8] bg-white px-4 py-3.5 pr-12 text-[#22332c] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] transition placeholder:text-[#94a5a0] hover:border-[#b9cdc3] focus:border-[#53b586] focus:outline-none focus:ring-4 focus:ring-[#d9f4e8] dark:border-white/20 dark:bg-[#112128] dark:text-[#d8efe4] dark:placeholder:text-[#7d988f] dark:hover:border-[#4f7f73] dark:focus:border-[#61c999] dark:focus:ring-[#1f5f4a]/60"
                                        />
                                        <MapPin size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8ea19a]" />
                                    </div>
                                    {(errors.region_code || errors.city_municipality_code || errors.barangay_code || errors.street_address) && (
                                        <p className="mt-2 text-sm text-red-600">
                                            {errors.region_code || errors.city_municipality_code || errors.barangay_code || errors.street_address}
                                        </p>
                                    )}
                                    {locationError && <p className="mt-2 text-sm text-red-600">{locationError}</p>}
                                </div>

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="mt-1 flex w-full items-center justify-center rounded-2xl bg-[linear-gradient(90deg,#2fa06f_0%,#2085c1_100%)] py-3 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(34,126,92,0.35)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_40px_rgba(34,126,92,0.45)] dark:shadow-[0_18px_35px_rgba(6,32,25,0.8)] disabled:cursor-not-allowed disabled:bg-[#cbd7d1] disabled:shadow-none"
                                >
                                    {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                    Send membership request
                                </button>
                            </form>

                            <div className="mt-8 text-center text-sm text-[#6b7571] dark:text-[#9aada6]">
                                Already have an account?{' '}
                                <Link href={route('login')} className="font-semibold text-[#2f7c59] dark:text-[#8fe4c0] hover:underline">
                                    Log in
                                </Link>
                            </div>
                        </div>
                    </div>
                }
            />
        </>
    );
}
