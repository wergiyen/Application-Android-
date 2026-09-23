import React from 'react';
import { User, Users, Code, Bluetooth } from 'lucide-react';

export type RoleTabType = 'user' | 'family' | 'developer' | 'connection';

interface Props {
  activeTab: RoleTabType;
  onTabChange: (tab: RoleTabType) => void;
  hasEmergencyAlert?: boolean;
}

export const NavigationTabs: React.FC<Props> = ({ activeTab, onTabChange, hasEmergencyAlert }) => {
  const tabs: { id: RoleTabType; label: string; icon: React.ReactNode; badge?: boolean }[] = [
    { id: 'user', label: 'User', icon: <User className="w-3.5 h-3.5" /> },
    { id: 'family', label: 'Family', icon: <Users className="w-3.5 h-3.5" />, badge: hasEmergencyAlert },
    { id: 'developer', label: 'Dev', icon: <Code className="w-3.5 h-3.5" /> },
    { id: 'connection', label: 'Connect', icon: <Bluetooth className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="fixed bottom-3 left-0 right-0 z-50 px-3 pointer-events-none">
      <div className="max-w-lg mx-auto pointer-events-auto">
        <div className="lift-floating-dock rounded-full p-1.5 shadow-2xl grid grid-cols-4 gap-1">
          {tabs.map((t) => {
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => onTabChange(t.id)}
                className={`relative py-2.5 px-2 rounded-full flex items-center justify-center gap-1.5 transition-all duration-300 ${
                  isActive
                    ? 'bg-white text-black font-black shadow-xl scale-[1.02]'
                    : 'text-slate-400 hover:text-white font-bold'
                }`}
              >
                {t.badge && (
                  <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                )}
                {t.icon}
                <span className="text-[11px] font-mono font-extrabold tracking-tight truncate">{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

