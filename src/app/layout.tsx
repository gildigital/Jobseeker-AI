import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css'
import './8bit.css'
import AuthProvider from './providers'

// The fonts are already processed/initialized when imported
// You don't need to call them as functions
const geistSans = GeistSans;
const geistMono = GeistMono;

export const metadata: Metadata = {
  title: 'AI for the Job Seeker | Resume Scanning & Job Matching',
  description: 'AI-powered job search platform that scans your resume, matches it with job listings, and scores your fit on a scale of 1-10. Find the perfect job with our intelligent ATS system.',
  keywords: 'job search, AI resume scanner, ATS system, job matching, resume scoring, job seeker, career tools, job hunting, resume optimization',
  authors: [{ name: 'AI for the Job Seeker Team' }],
  openGraph: {
    title: 'AI for the Job Seeker | Resume Scanning & Job Matching',
    description: 'AI-powered job search platform that scans your resume, matches it with job listings, and scores your fit on a scale of 1-10.',
    url: 'https://ai-job-seeker.com',
    siteName: 'AI for the Job Seeker',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'AI for the Job Seeker'
      }
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI for the Job Seeker | Resume Scanning & Job Matching',
    description: 'AI-powered job search platform that scans your resume, matches it with job listings, and scores your fit on a scale of 1-10.',
    images: ['/twitter-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'verification_token',
  },
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" rel="stylesheet" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}

