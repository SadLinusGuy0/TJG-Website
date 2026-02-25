import { ThemeProvider } from './components/ThemeProvider';
import './globals.css';
import { Analytics } from "@vercel/analytics/next"
import ProgressiveBlur from './components/ProgressiveBlur';

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
        <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
        <meta name="theme-color" content="#000" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  var currentTheme;
                  if (theme && theme !== 'auto') {
                    currentTheme = theme;
                    document.documentElement.dataset.theme = theme;
                  } else {
                    currentTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                    document.documentElement.dataset.theme = currentTheme;
                  }
                  // Set theme-color meta tag for Safari URL bar
                  var themeColorMeta = document.querySelector('meta[name="theme-color"]');
                  if (themeColorMeta) {
                    themeColorMeta.setAttribute('content', currentTheme === 'dark' ? '#000' : '#f1f1f3');
                  }
                  var progressiveBlur = localStorage.getItem('progressiveBlur');
                  if (progressiveBlur) {
                    document.documentElement.dataset.progressiveBlur = progressiveBlur;
                  } else {
                    document.documentElement.dataset.progressiveBlur = 'true';
                  }
                  var accentColor = localStorage.getItem('accentColor') || 'blue';
                  var accentColors = {
                    blue: '#387aff',
                    coral: '#ff6b6b',
                    mint: '#4ecdc4',
                    lilac: '#a78bfa',
                    monochrome: '#808080'
                  };
                  document.documentElement.style.setProperty('--accent', accentColors[accentColor] || accentColors.blue);
                  var csSupported = window.CSS && CSS.supports && CSS.supports('corner-shape', 'squircle');
                  var csSaved = localStorage.getItem('cornerSmoothing');
                  var csEnabled = csSupported && (csSaved === null ? true : csSaved === 'true');
                  document.documentElement.dataset.cornerSmoothing = csEnabled ? 'true' : 'false';
                } catch (e) {}
              })();
            `
          }}
        />
      </head>
      <body>
        <ThemeProvider>
          <ProgressiveBlur />
          <ProgressiveBlur position="bottom" />
          {children}
        </ThemeProvider>
        <Analytics />
        <svg width="0" height="0" style={{position:'absolute'}}>
          <filter id="progressive-blur" x="0" y="0" width="100%" height="100%">
            <feGaussianBlur stdDeviation="0 24" edgeMode="duplicate"/>
          </filter>
        </svg>
      </body>
    </html>
  )
}
