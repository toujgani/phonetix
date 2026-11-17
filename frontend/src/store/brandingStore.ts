import { create } from 'zustand';
import { BrandingConfig } from '../types';

interface BrandingState {
  branding: BrandingConfig;
  updateBranding: (config: Partial<BrandingConfig>) => void;
  resetBranding: () => void;
}

const DEFAULT_BRANDING: BrandingConfig = {
  platformName: 'PHONETIX',
  shortName: 'PHONETIX LMS',
  institutionName: 'International Institute of Applied Linguistics',
  logoUrl: null, // null will render the clean institutional SVG crest
  logoDarkUrl: null,
  faviconUrl: null,
  primaryColor: '#2563EB',
  secondaryColor: '#1E293B',
  accentColor: '#7C3AED',
  contactEmail: 'admissions@institution.edu',
  contactPhone: '+1 (555) 019-4820',
  address: 'Faculty of Foreign Languages, Academic Avenue, Suite 400',
  websiteUrl: 'https://phonetix-institution.edu',
};

const applyBrandingToDOM = (config: BrandingConfig) => {
  // Update document title
  if (config.platformName) {
    document.title = `${config.platformName} — ${config.institutionName}`;
  }

  // Update dynamic CSS primary color variable
  if (config.primaryColor) {
    document.documentElement.style.setProperty('--color-brand-blue', config.primaryColor);
  }

  // Update browser favicon if custom one provided
  if (config.faviconUrl) {
    let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = config.faviconUrl;
  }
};

export const useBrandingStore = create<BrandingState>((set) => {
  const saved = localStorage.getItem('phonetix_branding_config');
  let initialBranding = DEFAULT_BRANDING;

  if (saved) {
    try {
      initialBranding = { ...DEFAULT_BRANDING, ...JSON.parse(saved) };
    } catch {
      // Fallback to default
    }
  }

  // Apply on initialization
  applyBrandingToDOM(initialBranding);

  return {
    branding: initialBranding,
    updateBranding: (newConfig) => {
      set((state) => {
        const updated = { ...state.branding, ...newConfig };
        localStorage.setItem('phonetix_branding_config', JSON.stringify(updated));
        applyBrandingToDOM(updated);
        return { branding: updated };
      });
    },
    resetBranding: () => {
      localStorage.removeItem('phonetix_branding_config');
      applyBrandingToDOM(DEFAULT_BRANDING);
      set({ branding: DEFAULT_BRANDING });
    },
  };
});
