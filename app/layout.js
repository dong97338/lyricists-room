import './globals.css'
import {Analytics} from '@vercel/analytics/react'
import GA from './Analytics'

export default ({children}) => (
  <html lang="en">
    <body className="flex min-h-screen flex-col items-center justify-center space-y-4 bg-gray-100">
      {children}
      <Analytics />
      <GA />
    </body>
  </html>
)
