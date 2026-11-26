import React from 'react';

interface WasteArtworkProps {
  itemId: string;
  className?: string;
}

export const WasteArtwork: React.FC<WasteArtworkProps> = ({ itemId, className = 'w-12 h-12' }) => {
  switch (itemId) {
    case 'plastic-bottle':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
          <rect x="25" y="6" width="14" height="7" rx="2" fill="#0284C7" />
          <path d="M24 13H40L44 22V53C44 55.7614 41.7614 58 39 58H25C22.2386 58 20 55.7614 20 53V22L24 13Z" fill="#BAE6FD" stroke="#0369A1" strokeWidth="2.2" />
          <rect x="20" y="29" width="24" height="13" fill="#38BDF8" stroke="#0369A1" strokeWidth="1.8" />
          <path d="M26 35.5H38" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
          <path d="M26 19L24 23" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 'paper':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
          <path d="M16 10H39L49 20V54H16V10Z" fill="#FFFFFF" stroke="#475569" strokeWidth="2.2" strokeLinejoin="round" />
          <path d="M39 10V20H49" fill="#E2E8F0" stroke="#475569" strokeWidth="2.2" strokeLinejoin="round" />
          <path d="M23 28H41M23 35H41M23 42H34" stroke="#94A3B8" strokeWidth="2.4" strokeLinecap="round" />
        </svg>
      );
    case 'banana-peel':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
          <path d="M29 10C30 14 31 18 29 22C24 27 14 35 12 45C17 44 23 40 28 34C27 42 29 49 34 54C36 47 36 39 34 32C41 37 47 41 53 41C49 32 41 26 34 22C34 17 34 13 33 10H29Z" fill="#FACC15" stroke="#A16207" strokeWidth="2.2" strokeLinejoin="round" />
          <rect x="28" y="8" width="6" height="4" rx="1" fill="#78350F" />
          <path d="M22 36C20 39 18 41 16 42" stroke="#CA8A04" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case 'aluminium-can':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
          <rect x="20" y="12" width="24" height="42" rx="4" fill="#CBD5E1" stroke="#334155" strokeWidth="2.2" />
          <path d="M20 17H44M20 49H44" stroke="#475569" strokeWidth="1.8" />
          <rect x="20" y="24" width="24" height="17" fill="#0284C7" />
          <path d="M25 32.5H39" stroke="#FFFFFF" strokeWidth="2.4" strokeLinecap="round" />
          <ellipse cx="32" cy="12" rx="10" ry="2.5" fill="#E2E8F0" stroke="#334155" strokeWidth="1.8" />
        </svg>
      );
    case 'battery':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
          <rect x="26" y="8" width="12" height="5" rx="1.5" fill="#475569" />
          <rect x="19" y="13" width="26" height="42" rx="4" fill="#F59E0B" stroke="#78350F" strokeWidth="2.2" />
          <rect x="19" y="36" width="26" height="19" rx="3" fill="#1E293B" />
          <path d="M32 20V28M28 24H36" stroke="#78350F" strokeWidth="2.4" strokeLinecap="round" />
          <path d="M28 45H36" stroke="#FCD34D" strokeWidth="2.4" strokeLinecap="round" />
        </svg>
      );
    case 'glass-bottle':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
          <rect x="27" y="7" width="10" height="5" rx="1" fill="#94A3B8" stroke="#1E293B" strokeWidth="1.6" />
          <path d="M27 12H37L38 22L44 29V52C44 54.7614 41.7614 57 39 57H25C22.2386 57 20 54.7614 20 52V29L26 22L27 12Z" fill="#A7F3D0" stroke="#065F46" strokeWidth="2.2" strokeLinejoin="round" />
          <rect x="23" y="34" width="18" height="12" rx="1.5" fill="#ECFDF5" stroke="#065F46" strokeWidth="1.5" />
          <path d="M26 30L24 34" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 'food-waste':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
          <ellipse cx="32" cy="43" rx="20" ry="9" fill="#DCFCE7" stroke="#15803D" strokeWidth="2.2" />
          <circle cx="24" cy="36" r="7" fill="#4ADE80" stroke="#166534" strokeWidth="2" />
          <circle cx="38" cy="35" r="8" fill="#FB923C" stroke="#9A3412" strokeWidth="2" />
          <circle cx="31" cy="28" r="6" fill="#EF4444" stroke="#991B1B" strokeWidth="2" />
          <path d="M29 21C30 18 33 16 35 16" stroke="#15803D" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      );
    case 'plastic-wrapper':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
          <path d="M12 22L19 25L45 25L52 22L49 32L52 42L45 39L19 39L12 42L15 32L12 22Z" fill="#FECACA" stroke="#B91C1C" strokeWidth="2.2" strokeLinejoin="round" />
          <rect x="22" y="27" width="20" height="10" rx="1.5" fill="#EF4444" />
          <path d="M26 32H38" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 'cardboard':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
          <path d="M12 22L32 13L52 22V44L32 53L12 44V22Z" fill="#D97706" stroke="#78350F" strokeWidth="2.2" strokeLinejoin="round" />
          <path d="M12 22L32 31L52 22" stroke="#78350F" strokeWidth="2.2" strokeLinejoin="round" />
          <path d="M32 31V53" stroke="#78350F" strokeWidth="2.2" />
          <path d="M22 17.5L42 26.5" stroke="#FEF3C7" strokeWidth="2.4" strokeLinecap="round" />
        </svg>
      );
    case 'mobile-phone':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
          <rect x="19" y="8" width="26" height="48" rx="4" fill="#1E293B" stroke="#0F172A" strokeWidth="2.2" />
          <rect x="22" y="14" width="20" height="34" rx="2" fill="#38BDF8" />
          <path d="M27 21L35 29M34 20L37 23" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
          <circle cx="32" cy="52" r="1.8" fill="#94A3B8" />
          <rect x="28" y="10.5" width="8" height="1.5" rx="0.75" fill="#64748B" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
          <rect x="16" y="16" width="32" height="32" rx="6" fill="#CBD5E1" stroke="#475569" strokeWidth="2" />
        </svg>
      );
  }
};
