/**
 * Typography utilities for Doctors Flow
 * Optimized for Korean medical content
 */

export const typographyClasses = {
  // Headings
  heading1: 'text-4xl font-bold tracking-tight medical-heading',
  heading2: 'text-3xl font-semibold tracking-tight medical-heading',
  heading3: 'text-2xl font-semibold tracking-tight medical-heading',
  heading4: 'text-xl font-semibold medical-heading',
  heading5: 'text-lg font-semibold medical-heading',
  heading6: 'text-base font-semibold medical-heading',

  // Body text
  bodyLarge: 'text-lg leading-relaxed medical-text',
  body: 'text-base leading-relaxed medical-text',
  bodySmall: 'text-sm leading-relaxed medical-text',

  // Captions and labels
  caption: 'text-sm font-medium text-muted-foreground medical-caption',
  label: 'text-sm font-medium leading-none medical-text',

  // Medical specific
  patientName: 'text-base font-semibold medical-text',
  medicalTerm: 'text-sm font-medium text-primary medical-text',
  appointmentTime: 'text-sm font-mono medical-text',
  statusText: 'text-xs font-medium uppercase tracking-wide medical-text',

  // Dashboard elements
  cardTitle: 'text-lg font-semibold medical-heading',
  cardDescription: 'text-sm text-muted-foreground medical-text',
  metricValue: 'text-2xl font-bold tabular-nums medical-heading',
  metricLabel: 'text-sm font-medium text-muted-foreground medical-caption',

  // Form elements
  input: 'text-base medical-text',
  placeholder: 'text-muted-foreground medical-text',
  error: 'text-sm text-destructive medical-text',
  help: 'text-sm text-muted-foreground medical-caption',
} as const;

/**
 * Utility function to combine typography classes
 */
export function combineTypography(...classes: (keyof typeof typographyClasses)[]): string {
  return classes.map(cls => typographyClasses[cls]).join(' ');
}

/**
 * Font loading optimization
 */
export const fontPreloadLinks = [
  {
    rel: 'preconnect',
    href: 'https://fonts.googleapis.com',
  },
  {
    rel: 'preconnect',
    href: 'https://fonts.gstatic.com',
    crossOrigin: 'anonymous' as const,
  },
];

/**
 * Korean text optimization features
 */
export const koreanFontFeatures = {
  // Ligatures and contextual alternates
  fontFeatureSettings: '"rlig" 1, "calt" 1, "kern" 1',
  // Tabular numbers for metrics
  fontVariantNumeric: 'tabular-nums',
  // Common ligatures
  fontVariantLigatures: 'common-ligatures',
  // Better rendering
  WebkitFontSmoothing: 'antialiased',
  MozOsxFontSmoothing: 'grayscale',
  textRendering: 'optimizeLegibility',
};
