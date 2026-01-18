# Modular CSS Structure

This directory contains the modularized CSS files for better maintainability and performance.

## File Structure

```
src/styles/
├── base.css              # Base HTML/body styles, fonts, Tailwind imports
├── theme.css             # Color schemes, CSS custom properties, dark/light themes
├── index.css             # Alternative entry point that imports all modules
├── components/
│   ├── forms.css         # Enhanced form component styles (.input-enhanced, etc.)
│   └── inputs.css        # Input overrides for shadcn/ui components
└── README.md            # This documentation
```

## Benefits

- **Better Performance**: Smaller initial CSS bundles through selective imports
- **Maintainability**: Logical separation of concerns
- **Scalability**: Easy to add new component-specific styles
- **Developer Experience**: Easier to locate and modify specific styles

## Usage

The main `app/globals.css` imports all necessary modules. For custom builds or specific use cases, you can import individual modules:

```css
/* Import only what you need */
@import "../styles/base.css";
@import "../styles/theme.css";
@import "../styles/components/forms.css";
```

## Module Descriptions

### `base.css`
- Tailwind CSS imports
- HTML/body base styles
- Google Fonts imports
- Custom variants and base layer styles

### `theme.css`
- CSS custom properties mapping
- Light and dark theme definitions
- Color scheme variables
- Chart and sidebar color definitions

### `components/forms.css`
- Enhanced form component classes
- `.input-enhanced`, `.select-enhanced`, `.textarea-enhanced`
- Search input styles with proper spacing

### `components/inputs.css`
- Overrides for shadcn/ui input components
- Input type-specific styling
- Error and success state styles
- Label and helper text contrast improvements

## Adding New Modules

1. Create new CSS files in appropriate subdirectories
2. Import them in `globals.css` or `index.css`
3. Update this README with the new module description
4. Follow the existing naming conventions and layer structure