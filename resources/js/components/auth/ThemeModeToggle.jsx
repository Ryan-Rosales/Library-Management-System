import { useAppearance } from '@/hooks/use-appearance';
import { Laptop, Moon, Sun } from 'lucide-react';

const options = [
    { key: 'light', label: 'Light', icon: Sun },
    { key: 'dark', label: 'Dark', icon: Moon },
    { key: 'system', label: 'System', icon: Laptop },
];

export default function ThemeModeToggle() {
    const { appearance, updateAppearance } = useAppearance();

    return (
        <div className="inline-flex items-center rounded-full border border-[#d7e4de] bg-white/80 p-1 shadow-[0_10px_24px_rgba(53,94,79,0.12)] backdrop-blur-sm dark:border-white/20 dark:bg-white/10">
            {options.map((option) => {
                const Icon = option.icon;
                const active = appearance === option.key;

                return (
                    <button
                        key={option.key}
                        type="button"
                        onClick={() => updateAppearance(option.key)}
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                            active
                                ? 'bg-[#163d31] text-white shadow-sm dark:bg-[#8ce8c1] dark:text-[#04261b]'
                                : 'text-[#48655b] hover:bg-[#edf6f1] dark:text-white/80 dark:hover:bg-white/15'
                        }`}
                    >
                        <Icon size={14} />
                        {option.label}
                    </button>
                );
            })}
        </div>
    );
}
