
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'sm': '640px',
				'md': '768px',
				'lg': '1024px',
				'xl': '1280px',
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				// Enhanced PrismSearch Color Palette
				'prism-primary': 'hsl(174, 65%, 45%)',        // Main teal - accessible contrast
				'prism-primary-light': 'hsl(174, 80%, 55%)',  // Lighter variant for dark mode
				'prism-primary-dark': 'hsl(174, 55%, 35%)',   // Darker variant for hover states
				
				'prism-accent': 'hsl(260, 85%, 65%)',         // Purple accent - WCAG compliant
				'prism-accent-light': 'hsl(260, 60%, 70%)',   // Softer purple for dark mode
				'prism-accent-dark': 'hsl(260, 90%, 55%)',    // Vibrant purple for highlights
				
				// Background System
				'prism-bg-light': 'hsl(210, 20%, 98%)',       // Light mode background
				'prism-bg-dark': 'hsl(220, 15%, 8%)',         // Dark mode background
				'prism-surface-light': 'hsl(0, 0%, 100%)',    // Light mode cards
				'prism-surface-dark': 'hsl(220, 15%, 10%)',   // Dark mode cards
				
				// Text System
				'prism-text-primary-light': 'hsl(220, 15%, 15%)', // High contrast dark text
				'prism-text-primary-dark': 'hsl(210, 25%, 95%)',  // High contrast light text
				'prism-text-muted-light': 'hsl(215, 15%, 55%)',   // Muted text for light mode
				'prism-text-muted-dark': 'hsl(215, 15%, 65%)',    // Muted text for dark mode
				
				// Interactive States
				'prism-hover-light': 'hsl(215, 25%, 96%)',    // Light mode hover
				'prism-hover-dark': 'hsl(220, 15%, 15%)',     // Dark mode hover
				
				// Search & Highlighting
				'prism-search-highlight-light': 'hsl(45, 100%, 85%)', // Light mode search highlight
				'prism-search-highlight-dark': 'hsl(48, 100%, 70%)',  // Dark mode search highlight
				
				// Status Colors (Accessible)
				'prism-success': 'hsl(142, 76%, 36%)',        // Green for success
				'prism-warning': 'hsl(38, 92%, 50%)',         // Orange for warnings
				'prism-error': 'hsl(0, 70%, 55%)',           // Red for errors
				'prism-info': 'hsl(199, 89%, 48%)',          // Blue for info
				
				// Border System
				'prism-border-light': 'hsl(215, 25%, 88%)',   // Light mode borders
				'prism-border-dark': 'hsl(220, 15%, 22%)',    // Dark mode borders
				
				// Legacy Compatibility (Updated Values)
				'prism-blue-primary': 'hsl(174, 65%, 45%)',
				'prism-blue-light': 'hsl(174, 80%, 55%)',
				'prism-blue-dark': 'hsl(174, 55%, 35%)',
				'prism-teal-primary': 'hsl(174, 65%, 45%)',
				'prism-teal-light': 'hsl(174, 80%, 55%)',
				'prism-teal-dark': 'hsl(174, 55%, 35%)',
				'prism-purple-primary': 'hsl(260, 85%, 65%)',
				'prism-purple-light': 'hsl(260, 60%, 70%)',
				'prism-purple-dark': 'hsl(260, 90%, 55%)',
				'prism-text-light': 'hsl(210, 25%, 95%)',
				'prism-text-muted': 'hsl(215, 15%, 65%)',
				'prism-danger': 'hsl(0, 70%, 55%)',
			},
			fontFamily: {
				'montserrat': ['Montserrat', 'sans-serif'],
				'inter': ['Inter', 'sans-serif'],
				'helvetica': ['Helvetica', 'Arial', 'sans-serif'],
			},
			keyframes: {
				"accordion-down": {
					from: { height: "0" },
					to: { height: "var(--radix-accordion-content-height)" },
				},
				"accordion-up": {
					from: { height: "var(--radix-accordion-content-height)" },
					to: { height: "0" },
				},
				"fade-in": {
					"0%": {
						opacity: "0",
						transform: "translateY(10px)"
					},
					"100%": {
						opacity: "1",
						transform: "translateY(0)"
					}
				},
				"fade-out": {
					"0%": {
						opacity: "1",
						transform: "translateY(0)"
					},
					"100%": {
						opacity: "0",
						transform: "translateY(10px)"
					}
				},
				"pulse-light": {
					"0%, 100%": { opacity: "1" },
					"50%": { opacity: "0.5" }
				},
				"bounce-small": {
					"0%, 100%": { transform: "translateY(0)" },
					"50%": { transform: "translateY(-5px)" }
				},
				"gradient-shift": {
					"0%": { backgroundPosition: "0% 50%" },
					"50%": { backgroundPosition: "100% 50%" },
					"100%": { backgroundPosition: "0% 50%" }
				},
				"gradient-border": {
					"0%": { backgroundPosition: "0% 50%" },
					"50%": { backgroundPosition: "100% 50%" },
					"100%": { backgroundPosition: "0% 50%" }
				},
				"float": {
					"0%, 100%": { transform: "translateY(0)" },
					"50%": { transform: "translateY(-10px)" }
				},
				"pulse-glow": {
					"0%, 100%": { boxShadow: "0 0 15px rgba(255,158,44,0.5)" },
					"50%": { boxShadow: "0 0 25px rgba(255,158,44,0.8)" }
				},
				"shimmer": {
					"0%": { backgroundPosition: "-200% 0" },
					"100%": { backgroundPosition: "200% 0" }
				}
			},
			animation: {
				"accordion-down": "accordion-down 0.2s ease-out",
				"accordion-up": "accordion-up 0.2s ease-out",
				"fade-in": "fade-in 0.3s ease-out",
				"fade-out": "fade-out 0.3s ease-out",
				"pulse-light": "pulse-light 1.5s ease-in-out infinite",
				"bounce-small": "bounce-small 1.5s ease-in-out infinite",
				"gradient-shift": "gradient-shift 4s ease infinite",
				'gradient-text': 'gradient-shift 3s ease infinite',
				'gradient-border': 'gradient-border 4s ease infinite',
				'gradient-slow': 'gradient-border 8s ease infinite',
				"float": "float 5s ease-in-out infinite",
				"pulse-glow": "pulse-glow 2s ease-in-out infinite",
				"shimmer": "shimmer 3s linear infinite",
			},
			borderRadius: {
				'2xl': '1rem',
				'3xl': '1.5rem',
				'4xl': '2rem',
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			backgroundSize: {
				'size-200': '200% 200%',
			},
			boxShadow: {
				'soft': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
				'glow': '0 0 15px rgba(255, 158, 44, 0.5), 0 0 30px rgba(255, 158, 44, 0.3)',
				'pricing-hover': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
