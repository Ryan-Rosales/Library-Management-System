import { Head, useForm } from '@inertiajs/react';
import LibraryBrandPanel from '@/components/auth/LibraryBrandPanel';
import LoginFormPanel from '@/components/auth/LoginFormPanel';
import LibraryAuthLayout from '@/layouts/auth/LibraryAuthLayout';

export default function Login({ status, canResetPassword, loginStats }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
        role: 'admin',
    });

    const submit = (event) => {
        event.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <>
            <Head title="Log in">
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,600&family=Manrope:wght@400;500;600;700&display=swap"
                    rel="stylesheet"
                />
                <style>{`body { font-family: 'Manrope', ui-sans-serif, system-ui, sans-serif; }`}</style>
            </Head>
            <LibraryAuthLayout
                leftPanel={<LibraryBrandPanel loginStats={loginStats} />}
                formPanel={
                    <LoginFormPanel
                        data={data}
                        setData={setData}
                        errors={errors}
                        processing={processing}
                        status={status}
                        canResetPassword={canResetPassword}
                        onSubmit={submit}
                    />
                }
            />
        </>
    );
}
