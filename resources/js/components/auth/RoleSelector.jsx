import { BriefcaseBusiness, ShieldCheck, UserRound } from 'lucide-react';

const roles = [
    { id: 'member', label: 'Member', icon: UserRound },
    { id: 'staff', label: 'Staff', icon: BriefcaseBusiness },
    { id: 'admin', label: 'Admin', icon: ShieldCheck },
];

export default function RoleSelector({ selectedRole, onChange }) {
    return (
        <div className="grid grid-cols-3 gap-3">
            {roles.map((role) => {
                const Icon = role.icon;
                const isActive = selectedRole === role.id;

                return (
                    <button
                        key={role.id}
                        type="button"
                        onClick={() => onChange(role.id)}
                        className={`group rounded-2xl border p-3 text-center transition-all duration-300 hover:-translate-y-0.5 ${
                            isActive
                                ? 'border-[#4eb889]/60 bg-[linear-gradient(180deg,#ecfff5_0%,#dcf9eb_100%)] text-[#1f6a49] shadow-[0_14px_30px_rgba(54,145,100,0.22)] dark:border-[#75d6ac]/60 dark:bg-[linear-gradient(180deg,#10352c_0%,#123e32_100%)] dark:text-[#9de8c8]'
                                : 'border-[#d9e1dd] bg-white/80 text-[#65706b] shadow-[0_8px_20px_rgba(118,133,126,0.08)] hover:border-[#a7cbb9] hover:shadow-[0_16px_32px_rgba(118,133,126,0.16)] dark:border-white/15 dark:bg-white/5 dark:text-[#9fb5ac] dark:hover:border-[#6b9d8a] dark:hover:bg-white/10 dark:hover:shadow-[0_16px_32px_rgba(2,14,14,0.35)]'
                        }`}
                    >
                        <span
                            className={`mx-auto mb-2 grid h-8 w-8 place-items-center rounded-lg transition ${
                                isActive
                                    ? 'bg-[#d8f5e7] text-[#257653] dark:bg-[#1d4a3d] dark:text-[#9feecb]'
                                    : 'bg-[#eef4f0] text-[#6a7771] group-hover:bg-[#e4f2ea] group-hover:text-[#2f7a57] dark:bg-[#1a2930] dark:text-[#89a099] dark:group-hover:bg-[#21353a] dark:group-hover:text-[#9de4c4]'
                            }`}
                        >
                            <Icon size={16} />
                        </span>
                        <span className="text-sm font-semibold">{role.label}</span>
                    </button>
                );
            })}
        </div>
    );
}
