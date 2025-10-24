/** @type {import('tailwindcss').Config} */
const {nextui} = require('@nextui-org/react')
export default {
	darkMode: 'class',
	content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}', './node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}'],
	theme: {
		extend: {
			fontSize: {
				'4xs': '8px',
				'3xs': '10px',
				'2xs': '12px',
				xs: '14px',
				s: '16px',
				m: '18px',
				l: '20px',
				xl: '24px',
				'3xl': '40px',
				'4xl': '48px',
				'5xl': '60px',
			},
			lineHeight: {
				'2xs': '18px',
				xs: '20px',
				s: '24px',
				m: '28px',
				l: '32px',
				xl: '36px',
				'3xl': '60px',
				'4xl': '72px',
				'5xl': '80px',
			},
			backgroundImage: {
				'gradient-rainbow': 'linear-gradient(96deg, #3758F9 2.58%, #13C296 68.78%, #C814F6 114.78%)',
			},
			colors: {
				accent: {
					DEFAULT: '#F0B401', // accent-default
					hover: '#CD9900', // accent-hover
					strong: '#776225', // accent-strong
					subtle: '#FFF1C7', // accent-subtle
				},
				neutral: {
					base: '#F3F4F6', // was background-base
					disabled: '#F3F4F6', // was background-disabled
					secondary: '#E5E7EB', // was background-secondary
					'secondary-hover': '#D1D5DB', // was background-secondary-hover
					'secondary-pressed': '#9CA3AF', // was background-secondary-pressed
					white: '#FFFFFF', // was background-white
					'white-hover': '#F1F1F1', // was background-white-hover
				},
				border: {
					DEFAULT: '#9CA3AF', // border-default
					subtle: '#E5E7EB', // border-subtle
				},
				grey: {
					200: '#D4D6DB', // color-grey-200
					500: '#696F7A', // color-grey-500
					900: '#0D1017', // color-grey-900
				},
				purple: {
					400: '#7E68E5', // color-purple-400
					500: '#715AD4', // color-purple-500
				},
				blue: {
					base: '#3758F9',
				},
				// Status Colors
				error: '#FF0000', // error
				success: '#09A04F', // success
				// Content Colors
				content: {
					disabled: '#AEAFB5', // content-disabled
					placeholder: '#757575', // content-placeholder
					primary: '#0B111E', // content-primary
					'primary-dark': '#F3F3F7', // content-primary-dark
					secondary: '#5C6775', // content-secondary
					'secondary-dark': '#CBD0D6', // content-secondary-dark
					'deep-brown': '#261504',
					white: '#FFFFFF', // content-white
					black: '#000000',
				},

				'neutral-600': '#777777',
				'green-dark': '#1A8245',
				'cyan-dark': '#0B76B7',
				'purple-dark': '#6D28D9',
				metal: '#637381',
				pumpkin: '#FA4E4E',
				'white-content': '#F3F4F6',
				'primary-shade': 'oklch(var(--primary-shade) / <alpha-value>)',
				'green-dark-shade': '#DAF8E6',
				'red-dark': '#E10E0E',
				'red-dark-shade': '#FEEBEB',
				'neutral-content': '#E6E6E6',
				snow: '#FFF9FC',
				red: '#F23030',
			},
			gridTemplateColumns: {
				'max-128': 'repeat(auto-fill, minmax(0, 128px))',
				'max-200': 'repeat(auto-fill, minmax(0, 200px))',
			},
		},
	},
	plugins: [nextui()],
}
