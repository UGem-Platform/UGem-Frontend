/** @type {import('tailwindcss').Config} */
const withOpacity =
  (color) =>
  ({ opacityValue, opacityVariable } = {}) => {
    if (opacityValue !== undefined) {
      const percent = Number(opacityValue) * 100;
      return `color-mix(in oklab, ${color} ${percent}%, transparent)`;
    }

    if (opacityVariable !== undefined) {
      return `color-mix(in oklab, ${color} calc(var(${opacityVariable}) * 100%), transparent)`;
    }

    return color;
  };

export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        border: withOpacity("var(--border)"),
        input: withOpacity("var(--input)"),
        ring: withOpacity("var(--ring)"),
        background: withOpacity("var(--background)"),
        foreground: withOpacity("var(--foreground)"),
        primary: {
          DEFAULT: withOpacity("var(--primary)"),
          foreground: withOpacity("var(--primary-foreground)"),
        },
        secondary: {
          DEFAULT: withOpacity("var(--secondary)"),
          foreground: withOpacity("var(--secondary-foreground)"),
        },
        destructive: {
          DEFAULT: withOpacity("var(--destructive)"),
          foreground: withOpacity("var(--destructive-foreground)"),
        },
        muted: {
          DEFAULT: withOpacity("var(--muted)"),
          foreground: withOpacity("var(--muted-foreground)"),
        },
        accent: {
          DEFAULT: withOpacity("var(--accent)"),
          foreground: withOpacity("var(--accent-foreground)"),
        },
        popover: {
          DEFAULT: withOpacity("var(--popover)"),
          foreground: withOpacity("var(--popover-foreground)"),
        },
        card: {
          DEFAULT: withOpacity("var(--card)"),
          foreground: withOpacity("var(--card-foreground)"),
        },
        sidebar: {
          DEFAULT: withOpacity("var(--sidebar)"),
          foreground: withOpacity("var(--sidebar-foreground)"),
          primary: withOpacity("var(--sidebar-primary)"),
          "primary-foreground": withOpacity(
            "var(--sidebar-primary-foreground)",
          ),
          accent: withOpacity("var(--sidebar-accent)"),
          "accent-foreground": withOpacity("var(--sidebar-accent-foreground)"),
          border: withOpacity("var(--sidebar-border)"),
          ring: withOpacity("var(--sidebar-ring)"),
        },
        chart: {
          1: withOpacity("var(--chart-1)"),
          2: withOpacity("var(--chart-2)"),
          3: withOpacity("var(--chart-3)"),
          4: withOpacity("var(--chart-4)"),
          5: withOpacity("var(--chart-5)"),
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
};
