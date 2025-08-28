import { defineConfig } from 'vite'
import { sveltekit } from '@sveltejs/kit/vite'
import Icons from 'unplugin-icons/vite'

export default defineConfig({
  plugins: [
    sveltekit(),
    Icons({
      compiler: 'svelte',
      autoInstall: true, // Automatically install icon sets when imported
      defaultStyle: '', // Remove default styling
      defaultClass: '', // Remove default class
      scale: 1, // Scale factor
      jsx: 'react' // For potential React compatibility
    })
  ]
})