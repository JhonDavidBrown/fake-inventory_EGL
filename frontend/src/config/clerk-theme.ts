// Define Appearance type locally to avoid import issues
type Appearance = {
  variables?: Record<string, string>;
  elements?: Record<string, string>;
  layout?: Record<string, string | boolean | undefined>;
};

/**
 * Clerk theme configuration for the inventory management system
 * Provides a consistent dark theme with glassmorphism effects
 */

// Color palette - Azul consistente con la app
const colors = {
  // Primary colors - Azul matching blue-600 de Tailwind
  primary: "hsl(221, 83%, 53%)", // blue-600
  primaryDark: "hsl(221, 83%, 45%)", // blue-700
  primaryLight: "hsl(221, 83%, 60%)", // blue-500
  accent: "hsl(221, 83%, 65%)", // blue-400

  // Text colors
  textPrimary: "hsl(0, 0%, 10%)",
  textSecondary: "hsl(0, 0%, 25%)",
  textMuted: "hsl(0, 0%, 45%)",

  // Background colors - Tema claro moderno
  backgroundPrimary: "hsl(0, 0%, 100%)", // Blanco
  backgroundSecondary: "hsl(0, 0%, 98%)", // Gris muy claro
  backgroundCard: "hsl(0, 0%, 100%)",

  // Interactive colors
  success: "hsl(142, 76%, 45%)",
  danger: "hsl(0, 72%, 55%)",
  warning: "hsl(38, 92%, 50%)",

  // Neutral colors - Matching neutral de la app
  neutral: "hsl(0, 0%, 95%)",
  border: "hsl(0, 0%, 90%)",
  borderActive: "hsl(221, 83%, 53%)",
  shadow: "hsl(221, 40%, 28%)",
} as const;

// Theme variables
export const clerkVariables: Appearance['variables'] = {
  // Primary brand color
  colorPrimary: colors.primary,

  // Text colors - OSCUROS para mejor contraste
  colorText: "hsl(0, 0%, 10%)", // Casi negro para texto principal
  colorTextSecondary: "hsl(0, 0%, 25%)", // Gris oscuro para texto secundario
  colorTextOnPrimaryBackground: "hsl(0, 0%, 10%)",

  // Background colors
  colorBackground: colors.backgroundPrimary,
  colorInputBackground: "hsl(0, 0%, 100%)", // Blanco puro
  colorInputText: "hsl(0, 0%, 10%)", // Casi negro

  // State colors
  colorSuccess: colors.success,
  colorDanger: colors.danger,
  colorWarning: colors.warning,

  // Neutral colors
  colorNeutral: "hsl(0, 0%, 30%)", // Más oscuro
  colorAlphaShade: colors.backgroundCard,

  // Border radius for modern look
  borderRadius: "0.75rem",
  spacingUnit: "1rem",
  fontSize: "1rem",
};

// Element-specific styling
export const clerkElements: Appearance['elements'] = {
  // Main containers - Modern light theme with subtle blue gradient
  rootBox: "bg-gradient-to-br from-white via-blue-50/30 to-blue-100/20 text-gray-900 rounded-2xl w-full max-w-md",
  card: "bg-white/95 backdrop-blur-sm text-gray-900 border border-neutral-200 shadow-xl rounded-2xl w-full max-w-md",

  // Headers - Dark text on light background
  headerTitle: "text-gray-900 font-bold text-xl tracking-tight",
  headerSubtitle: "text-gray-800 font-medium text-base",
  formHeaderTitle: "text-gray-900 font-bold",
  formHeaderSubtitle: "text-gray-800 font-medium",

  // Form elements - Azul sólido consistente
  formButtonPrimary: [
    "bg-blue-600 hover:bg-blue-700 !text-white",
    "focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white",
    "shadow-md hover:shadow-lg hover:shadow-blue-600/20",
    "transition-all duration-200 rounded-xl font-semibold"
  ].join(" "),

  formButtonSecondary: [
    "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900",
    "border border-gray-300 hover:border-gray-400",
    "transition-all duration-200 rounded-xl font-medium"
  ].join(" "),

  // Input fields - Clean light inputs with vibrant focus
  formField: "space-y-3",
  formFieldInput: [
    "bg-white text-gray-900",
    "border border-neutral-300 focus:border-blue-600",
    "focus:ring-2 focus:ring-blue-500/20 focus:ring-offset-0",
    "placeholder:text-gray-600 transition-all duration-200 rounded-xl"
  ].join(" "),

  formFieldLabel: "text-sm font-semibold text-gray-900 tracking-wide",
  formFieldErrorText: "text-sm text-red-600 font-medium",
  formFieldInputShowPasswordButton: "text-gray-700 hover:text-gray-900",

  // Modal styling - Light and modern
  modalContent: [
    "bg-white/98 backdrop-blur-xl text-gray-900",
    "border border-gray-200 shadow-2xl rounded-2xl"
  ].join(" "),

  modalCloseButton: [
    "text-gray-500 hover:text-gray-900 hover:bg-gray-100",
    "rounded-lg transition-all duration-200"
  ].join(" "),

  // Avatar styling
  avatarBox: [
    "border-2 border-gray-200 shadow-lg",
    "ring-2 ring-blue-500/30 rounded-full"
  ].join(" "),
  avatarImage: "rounded-full",

  // Navigation
  navbarButton: "text-gray-700 hover:text-blue-600 transition-colors duration-200",
  menuItem: [
    "text-gray-700 hover:bg-neutral-100 hover:text-blue-600",
    "rounded-lg transition-all duration-200"
  ].join(" "),

  // OAuth Provider buttons - Clean modern style
  socialButtonsBlockButton: [
    "bg-white hover:bg-neutral-50",
    "border border-neutral-300 hover:border-blue-500",
    "transition-all duration-200 rounded-xl shadow-sm hover:shadow-md"
  ].join(" "),
  socialButtonsBlockButtonText: "!text-gray-900 !font-medium !text-base",
  socialButtonsProviderIcon: "!text-gray-700 !opacity-100",
  socialButtonsIconButton: [
    "bg-white hover:bg-neutral-50",
    "border border-neutral-300 hover:border-blue-500",
    "transition-all duration-200 rounded-xl shadow-sm hover:shadow-md"
  ].join(" "),
  socialButtonsIconButtonText: "!text-gray-900 !font-medium",
  socialButtonsProviderText: "!text-gray-900 !font-medium !text-base !opacity-100",

  // User management
  userButtonTrigger: [
    "bg-white backdrop-blur-sm text-gray-900",
    "border border-neutral-300 hover:bg-neutral-50 hover:border-blue-500",
    "transition-all duration-200 rounded-xl"
  ].join(" "),

  userButtonPopoverCard: [
    "bg-white/98 backdrop-blur-xl text-gray-900",
    "border border-neutral-200 shadow-2xl rounded-xl"
  ].join(" "),

  userButtonPopoverActionButton: [
    "text-gray-700 hover:bg-neutral-100 hover:text-blue-600",
    "rounded-lg transition-all duration-200"
  ].join(" "),

  // Organization switcher
  organizationSwitcherTrigger: [
    "bg-white text-gray-900 border border-neutral-300",
    "hover:bg-neutral-50 hover:border-blue-500",
    "transition-all duration-200 rounded-xl"
  ].join(" "),
  organizationSwitcherTriggerIcon: "text-gray-600",

  // Utility elements
  dividerLine: "border-gray-400",
  dividerText: "text-gray-900 bg-white font-semibold text-sm",
  dividerRow: "text-gray-900",
  alertText: "text-gray-900",
  spinner: "text-blue-600",

  // Links - Azul consistente
  footerActionLink: "text-blue-600 hover:text-blue-700 transition-colors duration-200 font-medium",
  footerActionText: "text-gray-800 font-medium",
  formResendCodeLink: "text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200",
  identityPreviewEditButton: "text-blue-600 hover:text-blue-700 transition-colors duration-200",

  // Identity
  identityPreviewText: "text-gray-800 font-medium",

  // Additional text elements
  otpCodeFieldInput: "text-gray-900 border-gray-300",
  formFieldSuccessText: "text-green-700 font-medium",
  formFieldHintText: "text-gray-700 text-sm",
  formFieldAction: "text-blue-600 hover:text-blue-700 font-medium",

  // Hide footer by default
  footer: "hidden",
  footerAction: "hidden",
};

// Layout configuration
export const clerkLayout: Appearance['layout'] = {
  logoImageUrl: undefined,
  showOptionalFields: true,
  helpPageUrl: undefined,
  privacyPageUrl: undefined,
  termsPageUrl: undefined,
};

// Complete appearance configuration
export const clerkAppearance: Appearance = {
  variables: clerkVariables,
  elements: clerkElements,
  layout: clerkLayout,
};

// Theme presets for different use cases
export const clerkThemePresets = {
  // Default inventory theme
  default: clerkAppearance,
  
  // Compact theme for mobile
  compact: {
    ...clerkAppearance,
    variables: {
      ...clerkVariables,
      spacingUnit: "0.75rem",
      fontSize: "0.875rem",
    },
  },
  
  // High contrast theme for accessibility
  highContrast: {
    ...clerkAppearance,
    variables: {
      ...clerkVariables,
      colorText: "hsl(0, 0%, 100%)",
      colorBackground: "hsl(0, 0%, 0%)",
      colorPrimary: "hsl(200, 100%, 70%)",
    },
  },
} as const;

export default clerkAppearance;