import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { NavSection } from '../types';
import {
  Home,
  Clock,
  BookOpen,
  Heart,
  Sparkles,
  Disc,
  Compass,
  Calendar,
  Moon,
  CheckSquare,
  BookMarked,
  Archive,
  Bot,
  Settings,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';

interface NavItem {
  id: NavSection;
  label: string;
  arabicLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  group: 'core' | 'worship' | 'personal' | 'system';
}

const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'Home', arabicLabel: 'الرئيسية', icon: Home, group: 'core' },
  { id: 'prayer', label: 'Prayer', arabicLabel: 'الصلاة', icon: Clock, group: 'core' },
  { id: 'quran', label: "Qur'an", arabicLabel: 'القرآن الكريم', icon: BookOpen, group: 'core' },
  { id: 'duas', label: 'Duas', arabicLabel: 'الأدعية', icon: Heart, group: 'worship' },
  { id: 'adhkar', label: 'Adhkar', arabicLabel: 'الأذكار', icon: Sparkles, group: 'worship' },
  { id: 'tasbih', label: 'Tasbih', arabicLabel: 'التسبيح', icon: Disc, group: 'worship' },
  { id: 'qibla', label: 'Qibla', arabicLabel: 'القبلة', icon: Compass, group: 'worship' },
  { id: 'calendar', label: 'Calendar', arabicLabel: 'التقويم الهجري', icon: Calendar, group: 'worship' },
  { id: 'ramadan', label: 'Ramadan', arabicLabel: 'رمضان المبارك', icon: Moon, badge: 'Special', group: 'worship' },
  { id: 'tasks', label: 'Tasks', arabicLabel: 'المهام', icon: CheckSquare, group: 'personal' },
  { id: 'reflection', label: 'Reflection', arabicLabel: 'المحاسبة', icon: BookMarked, group: 'personal' },
  { id: 'archive', label: 'Quiet Archive', arabicLabel: 'الأرشيف الهادئ', icon: Archive, group: 'personal' },
  { id: 'ai', label: 'Muslim AI', arabicLabel: 'الرفيق الذكي', icon: Bot, badge: 'Live', group: 'system' },
  { id: 'settings', label: 'Settings', arabicLabel: 'الإعدادات', icon: Settings, group: 'system' },
];

export const Navigation: React.FC = () => {
  const { activeSection, setActiveSection, tasks, lightScore } = useApp();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const pendingTasksCount = tasks.filter((t) => !t.completed).length;

  const handleSelect = (sec: NavSection) => {
    setActiveSection(sec);
    setMobileDrawerOpen(false);
  };

  return (
    <>
      {/* Desktop Sidebar Navigation */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-[#0E1322]/90 border-r border-slate-800/80 p-4 min-h-[calc(100vh-61px)] sticky top-[61px] select-none">
        
        {/* Navigation Group: Core */}
        <div className="mb-4">
          <p className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase px-3 mb-2">Core</p>
          <div className="space-y-1">
            {NAV_ITEMS.filter((i) => i.group === 'core').map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                    isActive
                      ? 'bg-gradient-to-r from-amber-500/20 to-amber-500/5 text-amber-300 border border-amber-500/30 shadow-sm shadow-amber-500/5'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  <span className="text-[11px] font-arabic opacity-70 group-hover:opacity-100">{item.arabicLabel}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation Group: Worship & Tools */}
        <div className="mb-4">
          <p className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase px-3 mb-2">Worship & Remembrance</p>
          <div className="space-y-1">
            {NAV_ITEMS.filter((i) => i.group === 'worship').map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                    isActive
                      ? 'bg-gradient-to-r from-amber-500/20 to-amber-500/5 text-amber-300 border border-amber-500/30 shadow-sm shadow-amber-500/5'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge ? (
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded-md font-medium border border-amber-500/30">
                      {item.badge}
                    </span>
                  ) : (
                    <span className="text-[11px] font-arabic opacity-60 group-hover:opacity-100">{item.arabicLabel}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation Group: Personal & Reflection */}
        <div className="mb-4">
          <p className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase px-3 mb-2">Daily Life & Reflection</p>
          <div className="space-y-1">
            {NAV_ITEMS.filter((i) => i.group === 'personal').map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                    isActive
                      ? 'bg-gradient-to-r from-amber-500/20 to-amber-500/5 text-amber-300 border border-amber-500/30 shadow-sm shadow-amber-500/5'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.id === 'tasks' && pendingTasksCount > 0 ? (
                    <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-medium">
                      {pendingTasksCount}
                    </span>
                  ) : (
                    <span className="text-[11px] font-arabic opacity-60 group-hover:opacity-100">{item.arabicLabel}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation Group: Companion & Settings */}
        <div className="mt-auto pt-4 border-t border-slate-800/80 space-y-1">
          {NAV_ITEMS.filter((i) => i.group === 'system').map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-500/20 to-amber-500/5 text-amber-300 border border-amber-500/30 shadow-sm shadow-amber-500/5'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge ? (
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded-md font-medium border border-emerald-500/40">
                    {item.badge}
                  </span>
                ) : (
                  <span className="text-[11px] font-arabic opacity-60 group-hover:opacity-100">{item.arabicLabel}</span>
                )}
              </button>
            );
          })}
        </div>

      </aside>

      {/* Mobile Bottom Dock Navigation (5 main actions + More button) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0B0F19]/95 backdrop-blur-xl border-t border-slate-800 px-3 py-2">
        <div className="flex items-center justify-around">
          <button
            onClick={() => handleSelect('home')}
            className={`flex flex-col items-center gap-1 p-1.5 rounded-xl transition-all ${
              activeSection === 'home' ? 'text-amber-300' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px] font-medium">Home</span>
          </button>

          <button
            onClick={() => handleSelect('prayer')}
            className={`flex flex-col items-center gap-1 p-1.5 rounded-xl transition-all ${
              activeSection === 'prayer' ? 'text-amber-300' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-5 h-5" />
            <span className="text-[10px] font-medium">Prayer</span>
          </button>

          <button
            onClick={() => handleSelect('quran')}
            className={`flex flex-col items-center gap-1 p-1.5 rounded-xl transition-all ${
              activeSection === 'quran' ? 'text-amber-300' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-5 h-5" />
            <span className="text-[10px] font-medium">Qur'an</span>
          </button>

          <button
            onClick={() => handleSelect('ai')}
            className={`flex flex-col items-center gap-1 p-1.5 rounded-xl transition-all relative ${
              activeSection === 'ai' ? 'text-amber-300' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="relative">
              <Bot className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500"></span>
            </div>
            <span className="text-[10px] font-medium">Muslim AI</span>
          </button>

          <button
            onClick={() => setMobileDrawerOpen(true)}
            className="flex flex-col items-center gap-1 p-1.5 rounded-xl text-slate-400 hover:text-slate-200 transition-all"
          >
            <Menu className="w-5 h-5" />
            <span className="text-[10px] font-medium">More</span>
          </button>
        </div>
      </div>

      {/* Mobile More Sections Drawer */}
      {mobileDrawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col justify-end animate-in fade-in duration-200">
          <div 
            className="flex-1"
            onClick={() => setMobileDrawerOpen(false)}
          ></div>
          <div className="bg-slate-900 border-t border-amber-500/30 rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="font-arabic text-amber-300 text-lg">نُور</span>
                <span className="font-display font-semibold text-slate-100">All NUR Sections</span>
              </div>
              <button 
                onClick={() => setMobileDrawerOpen(false)}
                className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5 mt-4">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item.id)}
                    className={`flex items-center gap-3 p-3 rounded-2xl text-left transition-all ${
                      isActive
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                        : 'bg-slate-800/60 text-slate-200 hover:bg-slate-800 border border-slate-700/50'
                    }`}
                  >
                    <div className={`p-2 rounded-xl ${isActive ? 'bg-amber-500/30 text-amber-300' : 'bg-slate-700/50 text-slate-300'}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate">{item.label}</p>
                      <p className="text-[10px] font-arabic text-slate-400 truncate">{item.arabicLabel}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
