'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTheme } from '../../components/ThemeProvider';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';

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
        <nav className="tab-container">
          <div className="icon-container">
            <Link href="/" className="nav-icon-container">
              <svg id="vector" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                <path fill="var(--secondary)" fillRule="evenodd" d="M 18.982 9.3544 L 12.774000000000001 4.0724 C 12.349 3.7234 11.652000000000001 3.7234 11.227 4.0724 L 5.018000000000001 9.3544 C 4.5920000000000005 9.7034 4.244 10.4374 4.244 10.987400000000001 L 4.244 17.6894 C 4.244 19.0644 5.369 20.1894 6.744 20.1894 L 8.875 20.1894 L 8.875 14.2664 C 8.875 13.441400000000002 9.55 12.7664 10.375 12.7664 L 13.375 12.7664 C 14.2 12.7664 14.875 13.441400000000002 14.875 14.2664 L 14.875 20.1894 L 17.256 20.1894 C 18.631 20.1894 19.756 19.0644 19.756 17.6894 L 19.756 10.987400000000001 C 19.756 10.4374 19.408 9.7034 18.982 9.3544" strokeWidth="1.0" stroke="#00000000" id="path_0"/>
              </svg>
              <div className="nav-label">Home</div>
            </Link>
            <Link href="/work" className="nav-icon-container">
              <svg id="vector" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                <path fill="var(--secondary)" fillRule="nonzero" d="M7.625,4.125C5.764,4.125 4.25,5.639 4.25,7.5C4.25,9.361 5.764,10.875 7.625,10.875C9.487,10.875 11,9.361 11,7.5C11,5.639 9.487,4.125 7.625,4.125M16.375,10.875C18.237,10.875 19.75,9.361 19.75,7.5C19.75,5.639 18.237,4.125 16.375,4.125C14.514,4.125 13,5.639 13,7.5C13,9.361 14.514,10.875 16.375,10.875M7.625,13.125C5.764,13.125 4.25,14.639 4.25,16.5C4.25,18.361 5.764,19.875 7.625,19.875C9.487,19.875 11,18.361 11,16.5C11,14.639 9.487,13.125 7.625,13.125M16.375,13.125C14.514,13.125 13,14.639 13,16.5C13,18.361 14.514,19.875 16.375,19.875C18.237,19.875 19.75,18.361 19.75,16.5C19.75,14.639 18.237,13.125 16.375,13.125" strokeWidth="1" stroke="#00000000" id="path_0"/>
              </svg>
              <div className="nav-label">Work</div>
            </Link>
            <Link href="/shop" className="nav-icon-container">
              <svg id="vector" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                <path fill="var(--secondary)" fillRule="evenodd" d="M 17.5066 17.1421 C 18.4036 17.1421 19.1326 17.8701 19.1326 18.7661 C 19.1326 19.6621 18.4036 20.3921 17.5066 20.3921 C 16.6116 20.3921 15.8826 19.6621 15.8826 18.7661 C 15.8826 17.8701 16.6116 17.1421 17.5066 17.1421 Z M 10.2683 17.1421 C 11.1643 17.1421 11.8933 17.8701 11.8933 18.7661 C 11.8933 19.6621 11.1643 20.3921 10.2683 20.3921 C 9.3723 20.3921 8.6443 19.6621 8.6443 18.7661 C 8.6443 17.8701 9.3723 17.1421 10.2683 17.1421 Z M 5.166399999999999 3.6079000000000008 C 5.945399999999999 3.6079000000000008 6.6373999999999995 4.129899999999999 6.8504000000000005 4.8789 L 6.8504000000000005 4.8789 L 7.5044 7.1838999999999995 L 19.8594 7.1838999999999995 C 20.8524 7.1838999999999995 21.5714 8.1309 21.3044 9.0869 L 21.3044 9.0869 L 20.1054 13.3859 C 19.8034 14.466899999999999 18.8194 15.213899999999999 17.6974 15.213899999999999 L 17.6974 15.213899999999999 L 10.095400000000001 15.213899999999999 C 8.9774 15.213899999999999 7.994400000000001 14.471900000000002 7.6904 13.395900000000001 L 7.6904 13.395900000000001 L 5.9314 7.1838999999999995 L 5.946400000000001 7.1838999999999995 L 5.4084 5.289899999999999 C 5.3764 5.181900000000001 5.2783999999999995 5.107900000000001 5.166399999999999 5.107900000000001 L 5.166399999999999 5.107900000000001 L 3.3894 5.107900000000001 C 2.9754000000000005 5.107900000000001 2.6394 4.7719000000000005 2.6394 4.357900000000001 C 2.6394 3.9438999999999993 2.9754000000000005 3.6079000000000008 3.3894 3.6079000000000008 L 3.3894 3.6079000000000008 Z" strokeWidth="1.0" stroke="#00000000" id="path_0"/>
              </svg>
              <div className="nav-label">Shop</div>
            </Link>
            <Link href="/contact" className="nav-icon-container">
              <svg id="vector" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                <path fill="var(--secondary)" fillRule="nonzero" d="M11.999,12.9072C15.796,12.9072 18.875,15.4721 18.875,18.2372L18.875,18.2372L18.875,19.0112C18.875,19.5571 18.381,20.0002 17.772,20.0002L17.772,20.0002L6.227,20.0002C5.618,20.0002 5.125,19.5571 5.125,19.0112L5.125,19.0112L5.125,18.2372C5.125,15.4721 8.203,12.9072 11.999,12.9072ZM11.999,3.9999C14.025,3.9999 15.668,5.6418 15.668,7.6688C15.668,9.6948 14.025,11.3369 11.999,11.3369C9.974,11.3369 8.331,9.6948 8.331,7.6688C8.331,5.6418 9.974,3.9999 11.999,3.9999Z" strokeWidth="1" stroke="#00000000" id="path_0"/>
              </svg>
              <div className="nav-label">Contact</div>
            </Link>
          </div>
        </nav>

        <div className="main-content" style={{ animation: 'fadeInUp 0.4s cubic-bezier(0.2, 0.9, 0.3, 1) forwards', opacity: 0 }}>
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