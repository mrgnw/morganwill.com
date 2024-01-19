import { defineConfig } from 'vite'

import { sveltepress } from '@sveltepress/vite'
import { defaultTheme } from '@sveltepress/theme-default'


export default defineConfig({
	plugins: [
		sveltepress({
			theme: defaultTheme({
				navbar: [
					{
						title: 'Morgan',
						to: '/'
					},
					{
						title: 'With dropdown',
						items: [
							{
								title: 'Github',
								to: 'https://github.com/mrgnw',
								external: true
							}
						]
					}
				]
			})
		})
	]
})

