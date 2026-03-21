import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

const EMPTY_VALUE_TOKEN = '__empty__';

function toOptionValue(value) {
    if (value === '' || value === null || value === undefined) {
        return EMPTY_VALUE_TOKEN;
    }

    return String(value);
}

export default function GlassSelect({
    value,
    onValueChange,
    options = [],
    placeholder = 'Select option',
    disabled = false,
    className = '',
    contentClassName = '',
}) {
    const normalizedValue = value === '' || value === null || value === undefined ? undefined : String(value);

    return (
        <Select
            value={normalizedValue}
            onValueChange={(nextValue) => onValueChange(nextValue === EMPTY_VALUE_TOKEN ? '' : nextValue)}
            disabled={disabled}
        >
            <SelectTrigger
                className={cn(
                    'w-full rounded-2xl border border-[#d4ddd8] bg-white/82 px-3 py-2.5 text-[#22332c] shadow-[0_8px_20px_rgba(29,74,58,0.10)] backdrop-blur-sm dark:border-white/20 dark:bg-[#112128]/90 dark:text-[#d8efe4]',
                    className,
                )}
            >
                <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent
                className={cn(
                    'rounded-2xl border border-[#cfe2d8] bg-white/92 shadow-[0_20px_45px_rgba(28,70,55,0.20)] backdrop-blur-xl dark:border-white/20 dark:bg-[#112a36]/96',
                    contentClassName,
                )}
            >
                {options.map((option) => (
                    <SelectItem key={`${toOptionValue(option.value)}-${option.label}`} value={toOptionValue(option.value)}>
                        {option.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
