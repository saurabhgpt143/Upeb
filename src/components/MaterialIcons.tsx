import React from 'react';

export const MaterialIcon = ({ type, className = "w-8 h-8" }: { type: string, className?: string }) => {
  switch (type) {
    case 'columns':
    case 'columns_colprofile':
      return (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <path d="M7 4V6H10V18H7V20H17V18H14V6H17V4H7Z" fill="currentColor" />
        </svg>
      );
    case 'rafters':
    case 'rafters_rafprofile':
    case 'truss_top_chords':
    case 'truss_bottom_chords':
    case 'truss_webbing':
      return (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <path d="M4 18L12 8L20 18H17L12 11.75L7 18H4Z" fill="currentColor" />
          <path d="M12 6L2 18.5V20.5H5L12 11.75L19 20.5H22V18.5L12 6Z" fill="currentColor" />
        </svg>
      );
    case 'purlins':
    case 'purlins_purlinprofile':
      return (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <path d="M6 5H16V8H14V7H8V17H14V16H16V19H6V5Z" fill="currentColor" />
        </svg>
      );
    case 'girts':
    case 'girts_girtprofile':
      return (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <path d="M5 8H15V11H13V10H7V14H13V13H15V16H5V8Z" fill="currentColor" transform="rotate(90 12 12)"/>
        </svg>
      );
    case 'sheeting':
    case 'roof_sheeting':
    case 'roof_sheeting_main':
    case 'roof_sheeting_alt':
    case 'wall_cladding':
    case 'wall_cladding_main':
    case 'wall_cladding_alt':
    case 'crimpedSheets':
      return (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <path d="M2 13L6 9L10 13L14 9L18 13L22 9V11L18 15L14 11L10 15L6 11L2 15V13Z" fill="currentColor" />
        </svg>
      );
    case 'accessories':
    case 'ridgeCap':
    case 'gutters':
    case 'cornerFlashing':
    case 'endFlashing':
    case 'gables':
    case 'downPipes':
      return (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <path d="M4 8L12 3L20 8M4 8V11L12 6L20 11V8M4 8L3 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    case 'turboVents':
      return (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="2" />
          <path d="M12 4C12 4 15 8 15 12C15 16 12 20 12 20C12 20 9 16 9 12C9 8 12 4 12 4Z" stroke="currentColor" strokeWidth="2" />
        </svg>
      );
    case 'silicon':
    case 'insulation':
    case 'polySheets':
    case 'louvers':
      return (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
          <path d="M4 12H20" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4"/>
        </svg>
      );
    case 'profileGate':
    case 'windows':
      return (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
          <path d="M12 3V21M3 12H21" stroke="currentColor" strokeWidth="2" />
        </svg>
      );
    case 'hardware':
    case 'bolts_main':
    case 'bolts_sec':
    case 'purlin_plates':
    case 'girt_plates':
    case 'screws':
    case 'truss_gussets':
      return (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <path d="M12 21V10M12 10L15 7H9L12 10ZM12 10V6M9 6H15L14 3H10L9 6Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <rect x="4" y="4" width="16" height="16" stroke="currentColor" strokeWidth="2" />
        </svg>
      );
  }
};
