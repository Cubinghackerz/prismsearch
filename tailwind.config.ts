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
				// NeoPrism Color Scheme
				'prism-primary': '#00C2A8',        // Primary Teal
				'prism-primary-light': '#1DD1B8',  // Lighter teal
				'prism-primary-dark': '#00A693',   // Darker teal
				
				'prism-accent': '#9B5DE5',         // Accent Purple
				'prism-accent-light': '#B47EE8',   // Lighter purple
				'prism-accent-dark': '#8A4FD3',    // Darker purple
				
				'prism-bg': '#0D0D0D',             // Rich black background
				'prism-surface': '#1A1A1A',        // Surface color for cards
				'prism-border': '#2E2E2E',         // Border color
				
				'prism-text': '#F2F2F2',           // Primary text
				'prism-text-muted': '#B0B0B0',     // Muted text
				
				'prism-hover': '#162E2A',          // Teal-tinted black for hovers
				
				// Legacy aliases for backward compatibility
				'prism-blue-primary': '#00C2A8',
				'prism-blue-light': '#1DD1B8',
				'prism-blue-dark': '#00A693',
				'prism-teal-primary': '#00C2A8',
				'prism-teal-light': '#1DD1B8',
				'prism-teal-dark': '#00A693',
				'prism-purple-primary': '#9B5DE5',
				'prism-purple-light': '#B47EE8',
				'prism-purple-dark': '#8A4FD3',
				'prism-dark-bg': '#0D0D0D',
				'prism-dark-bg-800': '#1A1A1A',
				'prism-dark-bg-700': '#2E2E2E',
				'prism-text-light': '#F2F2F2',
				'prism-text-muted': '#B0B0B0',
				'prism-danger': '#ea384c',
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
				},
				"scroll-words": {
					"0%, 10%": { transform: "translateY(0%)" },
					"15%, 25%": { transform: "translateY(-20%)" },
					"30%, 40%": { transform: "translateY(-40%)" },
					"45%, 55%": { transform: "translateY(-60%)" },
					"60%, 70%": { transform: "translateY(-80%)" },
					"75%, 100%": { transform: "translateY(0%)" }
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
				"scroll-words": "scroll-words 10s ease-in-out infinite"
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
