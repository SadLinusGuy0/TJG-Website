'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTheme } from '../../components/ThemeProvider';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import Navigation from '../../components/Navigation';

export default function OneUIDesignKitPage() {
  const { theme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Prevent scroll restoration
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }

    // Reset scroll position
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="index">
      <div className="containers">
        <Navigation />
        <div className="main-content" style={{ animation: 'fadeInUp 0.4s cubic-bezier(0.2, 0.9, 0.3, 1) forwards', opacity: 0, marginTop: 32 }}>
          <div className="top-app-bar">
            <div className="top-app-bar-container" style={{ justifyContent: 'flex-start', paddingLeft: '10px' }}>
              <Link href="/work" className="top-app-bar-icon" aria-label="Back">
                <svg width="10" height="20" viewBox="0 0 10 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" clipRule="evenodd" d="M9.56416 2.15216C9.85916 1.86116 9.86316 1.38616 9.57216 1.09116C9.28116 0.797162 8.80616 0.794162 8.51116 1.08516L0.733159 8.75516C0.397159 9.08616 0.212158 9.52916 0.212158 10.0012C0.212158 10.4722 0.397159 10.9162 0.733159 11.2472L8.51116 18.9162C8.65716 19.0592 8.84716 19.1312 9.03816 19.1312C9.23116 19.1312 9.42516 19.0562 9.57216 18.9082C9.86316 18.6132 9.85916 18.1382 9.56416 17.8472L1.78716 10.1782C1.72116 10.1152 1.71216 10.0402 1.71216 10.0012C1.71216 9.96216 1.72116 9.88616 1.78716 9.82316L9.56416 2.15216Z" fill="var(--primary)"/>
                </svg>
              </Link>
              <div className="title-container">
                <div className="title">One UI Design Kit</div>
              </div>
            </div>
          </div>

          <div className="container settings">
            <div className="body-text">
              <p className="containers-are-the">Ever wanted to make an app in the style of One UI? Well, this is a great place to start.</p>
              <p className="containers-are-the">The One UI Design Kit is based of the design principles set in Samsung's own apps. It's all up to date, adapted for One UI 7's design changes. It has everything you need to make a beautiful app.</p>
            </div>
          </div>

          <div className="container1" style={{ padding: '10px', marginBottom: '10px' }}>
            <div className="title">Easy to use layout</div>
          </div>

          <Image
            src="/images/projects/oneui-bento.png"
            alt="The One UI Design Kit's unique Bento style layout makes designing easy."
            width={1000}
            height={1000}
            style={{ width: '100%', height: '100%', borderRadius: '28px', border: '2px solid var(--container-background)', marginBottom: '20px' }}
          />

          <div className="container settings">
            <div className="body-text">
              <p className="containers-are-the">
                The Bento style layout makes designing easy and approachable, even to those who don't have a lot of experience with Figma, or design software in general.
              </p>
              <p className="containers-are-the">
                Everything is neatly organised, well explained, and easy to understand. Tips are scattered throughout the kit, which is great for new and experienced designers alike.
              </p>
            </div>
          </div>

          <div className="container1" style={{ padding: '10px', marginBottom: '10px' }}>
            <div className="title">Components</div>
          </div>

          <Image
            src="/images/projects/oneuicont.png"
            alt="One UI Design Kit"
            width={1000}
            height={1000}
            style={{ width: '100%', height: '100%', borderRadius: '28px' }}
          />

          <div className="container settings" style={{ marginTop: '20px' }}>
            <div className="body-text">
              <p className="containers-are-the">Components make it as easy to customise each individual element. Add toggles, change icons, enable or disable items within those elements, and more. Change the state of icons and toggles, like the number of bars on a wifi icon. The possibilities are endless.</p>
              <p className="containers-are-the">And prebuilt containers, built with Auto Layout, make designing as easy as drag and drop.</p>
            </div>
          </div>

          <div className="container1" style={{ padding: '10px', marginBottom: '10px' }}>
            <div className="title">Icons</div>
          </div>

          <div className="big-number-container">
            <p className="containers-are-the big-serif-number">1,500</p>
            <p className="big-number-subtitle">and counting</p>
          </div>

          <div className="container settings">
            <div className="body-text">
              <p className="containers-are-the">
                You read that right. There are a wide variety of icons, ripped straight from many of Samsung's apps, including many SmartThings device icons. You can switch between them within the prebuilt components, or just copy them to your project.
              </p>
              <p className="containers-are-the">
                More and more icons are being added with each update. Be sure to check back often to grab the latest ones.
              </p>
            </div>
          </div>

          <div className="container1" style={{ padding: '10px', marginBottom: '10px' }}>
            <div className="title">Turn it into code</div>
          </div>

          <Image
            src="/images/projects/oneui-devmode.png"
            alt="Developing with the One UI Design Kit"
            width={1000}
            height={1000}
            style={{ width: '100%', height: '100%', borderRadius: '28px', border: '2px solid var(--container-background)', marginBottom: '20px' }}
          />

          <div className="container settings">
            <div className="body-text">
              <p className="containers-are-the">
                You can then take your designs and turn them into code. Using Figma's Dev Mode tools, you can export to various platforms, including Android, iOS, and Web. This very site is built with the One UI Design Kit.
              </p>
              <p className="containers-are-the" style={{ marginBottom: '20px' }}>
                Note that this specific feature requires a <strong>Figma Pro</strong> subscription, as well as some other elements of the kit, like Local Libraries. The rest of the kit is free to use for anyone, commercial or personal.
              </p>
            </div>
          </div>

          <div className="theme-container">
            <a href="https://www.figma.com/community/file/1456035621603784201/one-ui-design-kit" className="list3" role="button" aria-label="Try One UI Design Kit in Figma">
              <div className="shape">
                <svg width="19" height="26" viewBox="0 0 19 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.2078 4.99999C17.2078 7.20913 15.417 8.99998 13.2078 8.99998H9.10394V1H13.2078C15.417 1 17.2078 2.79086 17.2078 4.99999Z" stroke="var(--primary)" strokeWidth="2"/>
                  <path d="M1 4.99999C1 7.20913 2.79086 8.99998 5 8.99998H9.10389V1H5C2.79086 1 1 2.79086 1 4.99999Z" stroke="var(--primary)" strokeWidth="2"/>
                  <path d="M1 13C1 15.2092 2.79086 17 5 17H9.10389V9.00006H5C2.79086 9.00006 1 10.7909 1 13Z" stroke="var(--primary)" strokeWidth="2"/>
                  <path d="M1 21C1 23.2092 2.81666 25 5.02581 25C7.26363 25 9.10389 23.1859 9.10389 20.9481V17H5C2.79086 17 1 18.7909 1 21Z" stroke="var(--primary)" strokeWidth="2"/>
                  <path d="M9.10394 13C9.10394 15.2092 10.8948 17 13.1039 17H13.2078C15.417 17 17.2078 15.2092 17.2078 13C17.2078 10.7909 15.417 9.00006 13.2078 9.00006H13.1039C10.8948 9.00006 9.10394 10.7909 9.10394 13Z" stroke="var(--primary)" strokeWidth="2"/>
                </svg>
              </div>
              <div className="test-toggle-group">
                <div className="body-text">Try it for free in Figma</div>
                <div className="information-wrapper">
                  <div className="information">Why not give it a whirl?</div>
                </div>
              </div>
              <div className="others2">
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
} 