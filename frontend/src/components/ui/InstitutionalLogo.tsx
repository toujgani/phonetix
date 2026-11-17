import React from 'react';
import { useBrandingStore } from '../../store/brandingStore';

interface InstitutionalLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export const InstitutionalLogo: React.FC<InstitutionalLogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
}) => {
  const { branding } = useBrandingStore();

  const iconSizes = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-base',
    lg: 'w-12 h-12 text-xl',
  };

  const titleSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
  };

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {branding.logoUrl ? (
        <img
          src={branding.logoUrl}
          alt={branding.platformName}
          className={`${iconSizes[size]} object-contain rounded-lg`}
        />
      ) : (
        <div
          className={`${iconSizes[size]} rounded-lg flex items-center justify-center font-bold text-white shadow-subtle shrink-0`}
          style={{ backgroundColor: branding.primaryColor || '#2563EB' }}
        >
          <span className="font-mono">θ</span>
        </div>
      )}

      {showText && (
        <div className="flex flex-col leading-tight">
          <span className={`font-bold tracking-tight text-slate-900 dark:text-white ${titleSizes[size]}`}>
            {branding.platformName}
          </span>
          <span className="text-[10px] text-slate-500 font-medium tracking-wide truncate max-w-[200px] sm:max-w-[260px]">
            {branding.institutionName}
          </span>
        </div>
      )}
    </div>
  );
};
