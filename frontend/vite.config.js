import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  /**
   * The directory for environment variables is defined as the 
  root folder of the project, which is specific to this case 
  due to how it is structured.*/
  envDir: path.resolve(__dirname, '../'),
})
