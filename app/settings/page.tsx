"use client";

import { useTheme } from '../components/ThemeProvider';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function SettingsContent() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const searchParams = useSearchParams();
  const from = searchParams.get('from') || '/';

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="main-content-settings" style={{ animation: 'fadeInUp 0.4s cubic-bezier(0.2, 0.9, 0.3, 1) forwards', opacity: 0 }}>
      <div className="top-app-bar">
        <div className="top-app-bar-container" style={{ justifyContent: 'flex-start', paddingLeft: '10px' }}>
          <Link href={from} className="top-app-bar-icon" aria-label="Back">
            <svg width="10" height="20" viewBox="0 0 10 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M9.56416 2.15216C9.85916 1.86116 9.86316 1.38616 9.57216 1.09116C9.28116 0.797162 8.80616 0.794162 8.51116 1.08516L0.733159 8.75516C0.397159 9.08616 0.212158 9.52916 0.212158 10.0012C0.212158 10.4722 0.397159 10.9162 0.733159 11.2472L8.51116 18.9162C8.65716 19.0592 8.84716 19.1312 9.03816 19.1312C9.23116 19.1312 9.42516 19.0562 9.57216 18.9082C9.86316 18.6132 9.85916 18.1382 9.56416 17.8472L1.78716 10.1782C1.72116 10.1152 1.71216 10.0402 1.71216 10.0012C1.71216 9.96216 1.72116 9.88616 1.78716 9.82316L9.56416 2.15216Z" fill="var(--primary)"/>
            </svg>
          </Link>
        </div>
      </div>
      <div className="header-container">
        <div className="title" style={{ paddingBottom: '40px' }}>Settings</div>
      </div>
      <div className="blank-div" style={{ gap: '10px' }}>
        <div className="container1">
          <div className="title">Site theme</div>
        </div>
        <div className="container">
          <div className="theme-selection">
            {mounted && (
              <>
                <label>
                  <input
                    type="radio"
                    name="theme"
                    value="auto"
                    checked={theme === 'auto'}
                    onChange={() => setTheme('auto')}
                  />
                  Auto
                </label>
                <label>
                  <input
                    type="radio"
                    name="theme"
                    value="light"
                    checked={theme === 'light'}
                    onChange={() => setTheme('light')}
                  />
                  Light
                </label>
                <label>
                  <input
                    type="radio"
                    name="theme"
                    value="dark"
                    checked={theme === 'dark'}
                    onChange={() => setTheme('dark')}
                  />
                  Dark
                </label>
              </>
            )}
          </div>
        </div>
        <div className="container settings">
          <div className="body-text">
            <p className="containers-are-the">
              This site was created using my One UI Design Kit, Figma's dev mode tools, and pure HTML, CSS and JS.
            </p>
            <p className="containers-are-the">
              This is also the first site I've fully developed, from start to finish.
            </p>
          </div>
        </div>
        <div className="theme-container">
          <a href="https://github.com/SadLinusGuy0/TJG-Website/tree/main" className="list3" role="button" aria-label="GitHub Repository">
            <div className="shape">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M12.0099 0C5.36875 0 0 5.40833 0 12.0992C0 17.4475 3.43994 21.9748 8.21205 23.5771C8.80869 23.6976 9.02724 23.3168 9.02724 22.9965C9.02724 22.716 9.00757 21.7545 9.00757 20.7527C5.6667 21.474 4.97099 19.3104 4.97099 19.3104C4.43409 17.9082 3.63858 17.5478 3.63858 17.5478C2.54511 16.8066 3.71823 16.8066 3.71823 16.8066C4.93117 16.8868 5.56763 18.0486 5.56763 18.0486C6.64118 19.8913 8.37111 19.3707 9.06706 19.0501C9.16638 18.2688 9.48473 17.728 9.82275 17.4276C7.15817 17.1471 4.35469 16.1055 4.35469 11.458C4.35469 10.1359 4.8316 9.05428 5.58729 8.21304C5.46806 7.91263 5.0504 6.67044 5.70677 5.00787C5.70677 5.00787 6.72083 4.6873 9.00732 6.24981C9.98625 5.98497 10.9958 5.85024 12.0099 5.84911C13.024 5.84911 14.0577 5.98948 15.0123 6.24981C17.299 4.6873 18.3131 5.00787 18.3131 5.00787C18.9695 6.67044 18.5515 7.91263 18.4323 8.21304C19.2079 9.05428 19.6652 10.1359 19.6652 11.458C19.6652 16.1055 16.8617 17.1269 14.1772 17.4276C14.6148 17.8081 14.9924 18.5292 14.9924 19.6711C14.9924 21.2936 14.9727 22.5957 14.9727 22.9962C14.9727 23.3168 15.1915 23.6976 15.7879 23.5774C20.56 21.9745 23.9999 17.4475 23.9999 12.0992C24.0196 5.40833 18.6312 0 12.0099 0Z" fill="var(--primary)"/>
              </svg>
            </div>
            <div className="test-toggle-group">
              <div className="body-text">GitHub Repo</div>
              <div className="information-wrapper">
                <div className="information">This site is open source, and fully available on GitHub</div>
              </div>
            </div>
            <div className="others2">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g id="Shape">
                  <path id="Vector 3" d="M8.80005 20L15.3858 13.4142C16.1669 12.6332 16.1669 11.3668 15.3858 10.5858L8.80005 4" stroke="#ACACB1" strokeWidth="2" strokeLinecap="round"/>
                </g>
              </svg>
            </div>
          </a>
        </div>
        <div className="container1" style={{ paddingTop: '20px' }}>
          <div className="title">Credits</div>
        </div>
        <div className="theme-container">
          <a href="https://x.com/BennettBuhner" className="list3" role="button" aria-label="Bennett Buhner">
            <div className="shape" style={{ height: '30px', width: '30px' }}>
              <Image src="/images/credits/benit.png" alt="Bennett Buhner" width={30} height={30} style={{ borderRadius: '50%' }} />
            </div>
            <div className="test-toggle-group">
              <div className="body-text">Bennett Buhner</div>
              <div className="information-wrapper">
                <div className="information">Made the animations and desktop layout</div>
              </div>
            </div>
            <div className="others2">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g id="Shape">
                  <path id="Vector 3" d="M8.80005 20L15.3858 13.4142C16.1669 12.6332 16.1669 11.3668 15.3858 10.5858L8.80005 4" stroke="#ACACB1" strokeWidth="2" strokeLinecap="round"/>
                </g>
              </svg>
            </div>
          </a>
          <a href="https://dhirenv.in" className="list3" role="button" aria-label="Dhiren Vasnani">
            <div className="shape" style={{ height: '30px', width: '30px' }}>
              <Image src="/images/credits/dhirenv.png" alt="Dhiren Vasnani" width={30} height={30} style={{ borderRadius: '50%' }} />
            </div>
            <div className="test-toggle-group">
              <div className="body-text">Dhiren Vasnani</div>
              <div className="information-wrapper">
                <div className="information">Made the light/dark theme system</div>
              </div>
            </div>
            <div className="others2">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g id="Shape">
                  <path id="Vector 3" d="M8.80005 20L15.3858 13.4142C16.1669 12.6332 16.1669 11.3668 15.3858 10.5858L8.80005 4" stroke="#ACACB1" strokeWidth="2" strokeLinecap="round"/>
                </g>
              </svg>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}

export default function Settings() {
  return (
    <div className="index">
      <div className="containers">
        <Suspense fallback={<div>Loading...</div>}>
          <SettingsContent />
        </Suspense>
      </div>
    </div>
  );
} 