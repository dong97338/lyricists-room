import './globals.css'
import {Analytics} from '@vercel/analytics/react'
import {GoogleAnalytics} from '@next/third-parties/google'
import {DefaultSeo} from 'next-seo'
import SEO from '../next-seo.config'

export default ({children}) => (
  <html lang="en">
    <head>
      <DefaultSeo {...SEO} />
    </head>
    <body className="flex min-h-screen flex-col items-center justify-center space-y-4 bg-gray-100">
      {children}
      <Analytics />
      <GoogleAnalytics gaId="G-LR5133HTDQ" />
    </body>
  </html>
)
