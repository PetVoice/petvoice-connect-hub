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
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				// Azzurrino Chiaro System
				sky: {
					DEFAULT: 'hsl(var(--sky-blue))',  
					light: 'hsl(var(--sky-light))',   
					soft: 'hsl(var(--sky-soft))',     
					dark: 'hsl(var(--sky-dark))',     
					accent: 'hsl(var(--sky-accent))', 
				},
				// Azure aliases for components
				azure: {
					DEFAULT: 'hsl(var(--azure))',
					light: 'hsl(var(--azure-light))',
					dark: 'hsl(var(--azure-dark))',
					glow: 'hsl(var(--azure-glow))',
				},
				// Standard colors
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
				success: {
					DEFAULT: 'hsl(var(--success))',
					foreground: 'hsl(var(--success-foreground))'
				},
				warning: {
					DEFAULT: 'hsl(var(--warning))',
					foreground: 'hsl(var(--warning-foreground))'
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
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			fontFamily: {
				sans: ['Inter', 'system-ui', 'sans-serif'],
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
				},
				'fade-in': {
					'0%': { opacity: '0', transform: 'translateY(10px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				'slide-up': {
					'0%': { opacity: '0', transform: 'translateY(20px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				'slide-in-left': {
					'0%': { opacity: '0', transform: 'translateX(-30px)' },
					'100%': { opacity: '1', transform: 'translateX(0)' }
				},
				'slide-in-right': {
					'0%': { opacity: '0', transform: 'translateX(30px)' },
					'100%': { opacity: '1', transform: 'translateX(0)' }
				},
				'bounce-in': {
					'0%': { opacity: '0', transform: 'scale(0.3)' },
					'50%': { opacity: '1', transform: 'scale(1.05)' },
					'70%': { transform: 'scale(0.9)' },
					'100%': { opacity: '1', transform: 'scale(1)' }
				},
				'scale-in': {
					'0%': { opacity: '0', transform: 'scale(0.8)' },
					'100%': { opacity: '1', transform: 'scale(1)' }
				},
				'glow': {
					'0%, 100%': { boxShadow: '0 0 20px hsl(var(--primary) / 0.3)' },
					'50%': { boxShadow: '0 0 40px hsl(var(--primary) / 0.6)' }
				},
				'float': {
					'0%, 100%': { transform: 'translateY(0px)' },
					'50%': { transform: 'translateY(-6px)' }
				},
				'gentle-float': {
					'0%, 100%': { transform: 'translateY(0px) scale(1)' },
					'25%': { transform: 'translateY(-3px) scale(1.02)' },
					'50%': { transform: 'translateY(-6px) scale(1.05)' },
					'75%': { transform: 'translateY(-3px) scale(1.02)' }
				},
				'shimmer': {
					'0%': { transform: 'translateX(-100%)' },
					'100%': { transform: 'translateX(100%)' }
				},
				'ripple': {
					'0%': { transform: 'scale(0)', opacity: '1' },
					'100%': { transform: 'scale(4)', opacity: '0' }
				},
				'bounce-gentle': {
					'0%, 100%': { transform: 'translateY(0) scale(1)' },
					'50%': { transform: 'translateY(-4px) scale(1.02)' }
				},
				'wiggle': {
					'0%, 100%': { transform: 'rotate(0deg)' },
					'25%': { transform: 'rotate(1deg)' },
					'75%': { transform: 'rotate(-1deg)' }
				},
				
				// Premium micro-interactions keyframes
				'button-click': {
					'0%': { transform: 'scale(1)' },
					'50%': { transform: 'scale(0.98)' },
					'100%': { transform: 'scale(1)' }
				},
				'micro-bounce': {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-2px)' }
				},
				'pulse-glow': {
					'0%, 100%': { 
						boxShadow: '0 0 5px hsl(var(--primary) / 0.3), 0 0 10px hsl(var(--primary) / 0.2)' 
					},
					'50%': { 
						boxShadow: '0 0 15px hsl(var(--primary) / 0.5), 0 0 25px hsl(var(--primary) / 0.3)' 
					}
				},
				'success-check': {
					'0%': { transform: 'scale(0) rotate(0deg)', opacity: '0' },
					'50%': { transform: 'scale(1.2) rotate(180deg)', opacity: '1' },
					'100%': { transform: 'scale(1) rotate(360deg)', opacity: '1' }
				},
				'error-vibrate': {
					'0%, 100%': { transform: 'translateX(0)' },
					'10%': { transform: 'translateX(-2px)' },
					'20%': { transform: 'translateX(2px)' },
					'30%': { transform: 'translateX(-2px)' },
					'40%': { transform: 'translateX(2px)' },
					'50%': { transform: 'translateX(-1px)' },
					'60%': { transform: 'translateX(1px)' },
					'70%': { transform: 'translateX(-1px)' },
					'80%': { transform: 'translateX(1px)' },
					'90%': { transform: 'translateX(0)' }
				},
				'card-lift': {
					'0%': { transform: 'translateY(0) scale(1)', boxShadow: 'var(--shadow-soft)' },
					'100%': { transform: 'translateY(-4px) scale(1.02)', boxShadow: 'var(--shadow-floating)' }
				},
				'nav-highlight': {
					'0%': { transform: 'scaleX(0)', transformOrigin: 'left' },
					'100%': { transform: 'scaleX(1)', transformOrigin: 'left' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.3s ease-out',
				'slide-up': 'slide-up 0.4s ease-out',
				'slide-in-left': 'slide-in-left 0.4s ease-out',
				'slide-in-right': 'slide-in-right 0.4s ease-out',
				'bounce-in': 'bounce-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
				'scale-in': 'scale-in 0.3s ease-out',
				'glow': 'glow 2s ease-in-out infinite',
				'float': 'float 3s ease-in-out infinite',
				'gentle-float': 'gentle-float 4s ease-in-out infinite',
				'shimmer': 'shimmer 2s infinite',
				'ripple': 'ripple 0.6s linear',
				'bounce-gentle': 'bounce-gentle 2s ease-in-out infinite',
				'wiggle': 'wiggle 1s ease-in-out infinite',
				
				// Premium micro-interactions
				'button-press': 'scale-in 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
				'hover-lift': 'gentle-float 2s ease-in-out infinite',
				'focus-pulse': 'glow 1.5s ease-in-out infinite',
				'success-bounce': 'bounce-in 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
				'error-shake': 'wiggle 0.5s ease-in-out 3',
				'loading-shimmer': 'shimmer 1.5s ease-in-out infinite',
				'card-hover': 'gentle-float 3s ease-in-out infinite',
				'nav-slide': 'slide-in-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
