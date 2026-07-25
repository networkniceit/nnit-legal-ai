// NNIT Legal AI — Design System
// Aesthetic: Refined Legal Luxury — Deep navy, gold accents, crisp whites

export const Colors = {
  // Core palette
  bg: '#0A0E1A',
  bgCard: '#111827',
  bgElevated: '#1A2235',
  bgModal: '#0D1320',

  // Gold accent system
  gold: '#C9A84C',
  goldLight: '#E8C870',
  goldDark: '#9B7A2E',
  goldMuted: 'rgba(201,168,76,0.15)',

  // Text
  textPrimary: '#F5F0E8',
  textSecondary: '#8A95A8',
  textMuted: '#4A5568',

  // Status
  success: '#2ECC71',
  danger: '#E53E3E',
  warning: '#F6AD55',
  info: '#4299E1',

  // Borders
  border: 'rgba(201,168,76,0.2)',
  borderSubtle: 'rgba(255,255,255,0.06)',

  // Gradients (start/end)
  gradientGold: ['#C9A84C', '#9B7A2E'] as const,
  gradientDark: ['#111827', '#0A0E1A'] as const,
  gradientCard: ['#1A2235', '#111827'] as const,
};

export const Typography = {
  // DM Serif Display — headings
  serif: 'DMSerifDisplay_400Regular',
  // DM Sans — body
  sans: 'DMSans_400Regular',
  sansMedium: 'DMSans_500Medium',
  sansBold: 'DMSans_700Bold',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const Shadow = {
  gold: {
    shadowColor: '#C9A84C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
};

export const API_BASE = 'https://your-nnit-backend.com/api';
export const GROQ_API_KEY = 'YOUR_GROQ_API_KEY';
export const STRIPE_PUBLISHABLE_KEY = 'YOUR_STRIPE_PUBLISHABLE_KEY';
