import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useAuthStore();
  return (
    <label className="inline-flex items-center gap-1.5 text-xs text-slate-600" title="Choose appearance">
      {theme === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
      <select
        aria-label="Theme preference"
        value={theme}
        onChange={(event) => setTheme(event.target.value as 'light' | 'dark' | 'system')}
        className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
      >
        <option value="system">System</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    </label>
  );
};
