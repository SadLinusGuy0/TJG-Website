import { ThemeProvider } from './components/ThemeProvider';
import './globals.css';
import { Analytics } from "@vercel/analytics/next"

export const metadata = {
  title: 'That Josh Guy',
  description: 'Hi, I\'m Josh Skinner - a 17-year-old freelance UI/UX designer and writer. Explore my portfolio showcasing graphic design, web development, and creative projects.',
  keywords: 'Josh Skinner, That Josh Guy, UI/UX Designer, Graphic Designer, Web Developer, Writer, Portfolio, Freelance, Creative',
  author: 'Josh Skinner',
  openGraph: {
    type: 'website',
    url: 'https://thatjoshguy.me',
    title: 'That Josh Guy',
    description: 'This is my portfolio',
    images: [
      {
        url: '/images/preview.png',
        width: 1200,
        height: 630,
        alt: 'That Josh Guy Portfolio Preview'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    site: '@thatjoshguy69',
    creator: '@thatjoshguy69',
    title: 'That Josh Guy',
    description: 'This is my portfolio',
    images: ['/images/preview.png']
  },
  icons: {
    icon: '/favicon.ico'
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html suppressHydrationWarning>
      <head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  if (theme && theme !== 'auto') {
                    document.documentElement.dataset.theme = theme;
                  } else {
                    document.documentElement.dataset.theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                  }
                  var experimental = localStorage.getItem('experimentalUI');
                  if (experimental) {
                    document.documentElement.dataset.experimental = experimental;
                  } else {
                    document.documentElement.dataset.experimental = 'false';
                  }
                } catch (e) {}
              })();
            `
          }}
        />
      </head>
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
        <svg width="0" height="0" style={{position:'absolute'}}>
          <filter id="progressive-blur" x="0" y="0" width="100%" height="100%">
            <feGaussianBlur stdDeviation="0 24" edgeMode="duplicate"/>
          </filter>
        </svg>
      </body>
    </html>
  )
}
