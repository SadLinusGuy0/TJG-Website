'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTheme } from '../components/ThemeProvider';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import Navigation from '../components/Navigation';

export default function WorkPage() {
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

        <div className="main-content">
        <div className="top-app-bar">
            <div className="top-app-bar-container" style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
              <a href={`/settings?from=${encodeURIComponent(pathname)}`} className="top-app-bar-icon" aria-label="Settings" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: '50%', cursor: 'pointer' }}>
                <svg id="vector" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="var(--primary)" fillRule="evenodd" d="M13.3856,3.14C13.8582,3.14 14.3088,3.4177 14.5588,3.8663L14.6219,3.9928L14.6691,4.1348L15.1121,5.8606L15.1526,5.894C15.2432,5.9768 15.4617,6.1868 15.5527,6.2449C15.5427,6.2384 15.5523,6.2366 15.5701,6.2366L15.6656,6.2371L15.7338,6.2242L17.4439,5.7475C17.9001,5.6201 18.4098,5.7669 18.7707,6.1343L18.8653,6.2399L18.9471,6.3624L20.3352,8.7755C20.5639,9.1746 20.5547,9.6869 20.3069,10.1267L20.2254,10.2562L20.1156,10.3825L18.8475,11.6326C18.8112,11.6683 18.77,11.7417 18.7555,11.7531L18.7502,11.7484L18.7476,11.8145L18.7457,12.2271C18.7467,12.2131 18.7528,12.2185 18.7609,12.2318L18.8019,12.3052L18.8476,12.3584L20.118,13.6097C20.4459,13.936 20.5739,14.4372 20.4472,14.931L20.4063,15.0653L20.3346,15.2153L18.947,17.6277C18.7111,18.0376 18.2447,18.2898 17.7304,18.2813L17.5891,18.2725L17.4442,18.2425L15.7335,17.7656C15.7515,17.7707 15.3099,17.8916 15.1922,17.953C15.2101,17.9435 15.174,17.9932 15.1508,18.0325L15.137,18.0589L15.1134,18.128L14.6686,19.8568C14.55,20.3139 14.1686,20.6809 13.6716,20.8105L13.5333,20.8399L13.3856,20.8499L10.6144,20.8499C10.1414,20.8499 9.6902,20.5717 9.4409,20.1219L9.3781,19.9951L9.3321,19.8558L8.8868,18.1287C8.8909,18.1448 8.564,17.8198 8.4487,17.7456C8.4583,17.7517 8.4482,17.7532 8.4302,17.7531L8.3352,17.7522L8.2653,17.7657L6.5561,18.2424C6.1001,18.3697 5.5908,18.2225 5.2299,17.856L5.1353,17.7507L5.0528,17.6274L3.6675,15.2175C3.4362,14.8185 3.4443,14.3049 3.6927,13.8639L3.7744,13.7339L3.8844,13.6074L5.1515,12.3583C5.1878,12.3226 5.2294,12.2485 5.244,12.2355L5.2524,12.1754L5.2541,11.7662C5.2522,11.7929 5.2297,11.7421 5.2105,11.7068L5.1971,11.6847L5.1515,11.6315L3.8824,10.3815C3.5531,10.0556 3.4258,9.554 3.5525,9.0599L3.5933,8.9255L3.6654,8.7746L5.0523,6.3633C5.2882,5.9519 5.7549,5.6997 6.2697,5.7085L6.4112,5.7175L6.5559,5.7475L8.2631,6.2236C8.2462,6.2189 8.6888,6.0975 8.811,6.0338C8.8009,6.039 8.8047,6.0294 8.8139,6.0135L8.8635,5.9284L8.8866,5.8619L9.3308,4.1355C9.448,3.677 9.8304,3.3093 10.3281,3.1794L10.4666,3.15L10.6144,3.14L13.3856,3.14ZM10.6912,4.5617L10.2537,6.2598L10.2047,6.4067C10.0605,6.7782 9.7899,7.1298 9.4699,7.2968C9.0923,7.4938 8.4617,7.6761 8.0217,7.6231L7.8826,7.5964L6.2494,7.1373L4.9341,9.4175L6.1821,10.6492L6.2855,10.7665C6.5042,11.0416 6.6576,11.3954 6.677,11.6915L6.6764,12.2023L6.6679,12.3555C6.6281,12.668 6.4677,13.0106 6.2486,13.2682L6.1513,13.3731L4.9351,14.5658L6.2456,16.8498L7.9252,16.383L8.0776,16.3517C8.4708,16.2909 8.9111,16.3509 9.2173,16.5462C9.5802,16.7798 10.057,17.2422 10.2253,17.6517L10.2661,17.7727L10.6893,19.4244L13.3076,19.4273L13.7456,17.7323L13.7944,17.5844C13.9371,17.2143 14.2078,16.8625 14.5291,16.6922C14.9079,16.4946 15.5387,16.3125 15.9777,16.3665L16.1163,16.3935L17.7502,16.8517L19.0646,14.5715L17.8169,13.3407L17.7136,13.2234C17.4942,12.9474 17.3407,12.5926 17.3224,12.2977L17.3234,11.7904L17.3315,11.6366C17.3704,11.3235 17.5308,10.9808 17.7502,10.7228L17.8477,10.6178L19.0646,9.4222L17.7531,7.1392L16.072,7.6072L15.9202,7.6381C15.5258,7.6984 15.0858,7.6384 14.7842,7.4443C14.4236,7.2143 13.9432,6.7485 13.7738,6.3378L13.7328,6.2165L13.3104,4.5645L10.6912,4.5617ZM11.9995,8.6862C13.8269,8.6862 15.3083,10.1675 15.3083,11.995C15.3083,13.8217 13.8266,15.3037 11.9995,15.3037C10.1732,15.3037 8.6917,13.8215 8.6917,11.995C8.6917,10.1677 10.1729,8.6862 11.9995,8.6862ZM11.9995,10.1108C10.9597,10.1108 10.1163,10.9544 10.1163,11.995C10.1163,13.0349 10.9601,13.8791 11.9995,13.8791C13.0398,13.8791 13.8837,13.035 13.8837,11.995C13.8837,10.9543 13.0402,10.1108 11.9995,10.1108Z" /></svg>
              </a>
            </div>
          </div>

          <div className="header-container">
            <div className="title" style={{ paddingBottom: '40px' }}>Work</div>
          </div>

          <div className="blank-div" style={{ marginBottom: 0 }}>
            <a href="https://sammyguru.com/author/emailthatjoshguy-me/" className="list3" role="button" aria-label="View articles">
              <div className="shape">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" clipRule="evenodd" d="M16.25 20.25H7.75C6.3693 20.25 5.25 19.1305 5.25 17.75V6.25C5.25 4.8693 6.3693 3.75 7.75 3.75H16.25C17.6307 3.75 18.75 4.8693 18.75 6.25V17.75C18.75 19.1305 17.6307 20.25 16.25 20.25Z" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M5.375 8.3125H7.8177" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M5.375 12H7.8177" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M5.375 15.6875H7.8177" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="test-toggle-group">
                <div className="body-text">Articles</div>
                <div className="information-wrapper">
                  <div className="information">Check out all the articles I've written for SammyGuru</div>
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

          <div className="container1">
            <div className="title">Design projects</div>
          </div>

          <div className="blank-div" style={{ marginBottom: 0 }}>
            <div className="theme-container">
              <Link href="/work/oneui-design-kit" className="list4" aria-label="View One UI Design Kit project">
                <div className="test-toggle-frame">
                  <div className="body-text" style={{ marginLeft: '10px', textAlign: 'left' }}>
                    One UI Design Kit
                  </div>
                  <div className="others2">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <g id="Shape">
                        <path id="Vector 3" d="M8.80005 20L15.3858 13.4142C16.1669 12.6332 16.1669 11.3668 15.3858 10.5858L8.80005 4" stroke="#ACACB1" strokeWidth="2" strokeLinecap="round"/>
                      </g>
                    </svg>
                  </div>
                </div>
                <Image
                  src="/images/projects/oneuialt.png"
                  alt="One UI Design Kit"
                  width={1000}
                  height={1000}
                  style={{ width: '100%', height: '100%', borderRadius: '24px' }}
                />
              </Link>

              <a href="https://youtu.be/RCb5AaginpM" className="list4" aria-label="View WhatsApp You project">
                <div className="test-toggle-frame">
                  <div className="body-text" style={{ marginLeft: '10px', textAlign: 'left' }}>
                    WhatsApp You
                  </div>
                  <div className="others2">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <g id="Shape">
                        <path id="Vector 3" d="M8.80005 20L15.3858 13.4142C16.1669 12.6332 16.1669 11.3668 15.3858 10.5858L8.80005 4" stroke="#ACACB1" strokeWidth="2" strokeLinecap="round"/>
                      </g>
                    </svg>
                  </div>
                </div>
                <Image
                  src="/images/projects/whatsapp.png"
                  alt="WhatsApp You"
                  width={1000}
                  height={1000}
                  style={{ width: '100%', height: '100%', borderRadius: '24px' }}
                />
              </a>

              <a href="https://youtu.be/s3JQj6HCIwk" className="list4" aria-label="View YT Music project">
                <div className="test-toggle-frame">
                  <div className="body-text" style={{ marginLeft: '10px', textAlign: 'left' }}>YouTube Music</div>
                  <div className="others2">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <g id="Shape">
                        <path id="Vector 3" d="M8.80005 20L15.3858 13.4142C16.1669 12.6332 16.1669 11.3668 15.3858 10.5858L8.80005 4" stroke="#ACACB1" strokeWidth="2" strokeLinecap="round"/>
                      </g>
                    </svg>
                  </div>
                </div>
                <Image
                  src="/images/projects/youtube-music.png"
                  alt="YouTube Music"
                  width={1000}
                  height={1000}
                  style={{ width: '100%', height: '100%', borderRadius: '28px' }}
                />
              </a>

              <a href="https://youtu.be/4QKPQKkJf3k" className="list4" aria-label="View Better Twitter project">
                <div className="test-toggle-frame">
                  <div className="body-text" style={{ marginLeft: '10px', textAlign: 'left' }}>Better Twitter</div>
                  <div className="others2">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <g id="Shape">
                        <path id="Vector 3" d="M8.80005 20L15.3858 13.4142C16.1669 12.6332 16.1669 11.3668 15.3858 10.5858L8.80005 4" stroke="#ACACB1" strokeWidth="2" strokeLinecap="round"/>
                      </g>
                    </svg>
                  </div>
                </div>
                <Image
                  src="/images/projects/twitter-remake.png"
                  alt="Better Twitter"
                  width={1000}
                  height={1000}
                  style={{ width: '100%', height: '100%', borderRadius: '24px' }}
                />
              </a>
            </div>
          </div>

          <div className="blank-div">
            <div className="container1">
              <div className="title">Other projects</div>
            </div>

            <Link href="/" className="list3" role="button" aria-label="View this website project">
              <div className="shape">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <mask id="mask0_948_534" style={{ maskType: 'alpha' }} maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
                    <rect width="24" height="24" fill="#D9D9D9"/>
                  </mask>
                  <g mask="url(#mask0_948_534)">
                    <path d="M4.825 12.025L8.7 15.9C8.88334 16.0833 8.975 16.3167 8.975 16.6C8.975 16.8833 8.88334 17.1167 8.7 17.3C8.51667 17.4833 8.28334 17.575 8 17.575C7.71667 17.575 7.48334 17.4833 7.3 17.3L2.7 12.7C2.6 12.6 2.52917 12.4917 2.4875 12.375C2.44584 12.2583 2.425 12.1333 2.425 12C2.425 11.8667 2.44584 11.7417 2.4875 11.625C2.52917 11.5083 2.6 11.4 2.7 11.3L7.3 6.7C7.5 6.5 7.7375 6.4 8.0125 6.4C8.2875 6.4 8.525 6.5 8.725 6.7C8.925 6.9 9.025 7.1375 9.025 7.4125C9.025 7.6875 8.925 7.925 8.725 8.125L4.825 12.025ZM19.175 11.975L15.3 8.1C15.1167 7.91667 15.025 7.68333 15.025 7.4C15.025 7.11667 15.1167 6.88333 15.3 6.7C15.4833 6.51667 15.7167 6.425 16 6.425C16.2833 6.425 16.5167 6.51667 16.7 6.7L21.3 11.3C21.4 11.4 21.4708 11.5083 21.5125 11.625C21.5542 11.7417 21.575 11.8667 21.575 12C21.575 12.1333 21.5542 12.2583 21.5125 12.375C21.4708 12.4917 21.4 12.6 21.3 12.7L16.7 17.3C16.5 17.5 16.2667 17.5958 16 17.5875C15.7333 17.5792 15.5 17.475 15.3 17.275C15.1 17.075 15 16.8375 15 16.5625C15 16.2875 15.1 16.05 15.3 15.85L19.175 11.975Z" fill="var(--primary)"/>
                  </g>
                </svg>
              </div>
              <div className="test-toggle-group">
                <div className="body-text">This very site</div>
                <div className="information-wrapper">
                  <div className="information">What you're looking at right now</div>
                </div>
              </div>
            </Link>

            <a href="https://legacy.thatjoshguy.me" className="list3" role="button" aria-label="View legacy website">
              <div className="shape">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <mask id="mask0_948_534" style={{ maskType: 'alpha' }} maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
                    <rect width="24" height="24" fill="#D9D9D9"/>
                  </mask>
                  <g mask="url(#mask0_948_534)">
                    <path d="M4.825 12.025L8.7 15.9C8.88334 16.0833 8.975 16.3167 8.975 16.6C8.975 16.8833 8.88334 17.1167 8.7 17.3C8.51667 17.4833 8.28334 17.575 8 17.575C7.71667 17.575 7.48334 17.4833 7.3 17.3L2.7 12.7C2.6 12.6 2.52917 12.4917 2.4875 12.375C2.44584 12.2583 2.425 12.1333 2.425 12C2.425 11.8667 2.44584 11.7417 2.4875 11.625C2.52917 11.5083 2.6 11.4 2.7 11.3L7.3 6.7C7.5 6.5 7.7375 6.4 8.0125 6.4C8.2875 6.4 8.525 6.5 8.725 6.7C8.925 6.9 9.025 7.1375 9.025 7.4125C9.025 7.6875 8.925 7.925 8.725 8.125L4.825 12.025ZM19.175 11.975L15.3 8.1C15.1167 7.91667 15.025 7.68333 15.025 7.4C15.025 7.11667 15.1167 6.88333 15.3 6.7C15.4833 6.51667 15.7167 6.425 16 6.425C16.2833 6.425 16.5167 6.51667 16.7 6.7L21.3 11.3C21.4 11.4 21.4708 11.5083 21.5125 11.625C21.5542 11.7417 21.575 11.8667 21.575 12C21.575 12.1333 21.5542 12.2583 21.5125 12.375C21.4708 12.4917 21.4 12.6 21.3 12.7L16.7 17.3C16.5 17.5 16.2667 17.5958 16 17.5875C15.7333 17.5792 15.5 17.475 15.3 17.275C15.1 17.075 15 16.8375 15 16.5625C15 16.2875 15.1 16.05 15.3 15.85L19.175 11.975Z" fill="var(--primary)"/>
                  </g>
                </svg>
              </div>
              <div className="test-toggle-group">
                <div className="body-text">My old site</div>
                <div className="information-wrapper">
                  <div className="information">legacy.thatjoshguy.me, made in conjunction with Dhiren V</div>
                </div>
              </div>
            </a>

            <a href="https://legacy.thatjoshguy.me/work/banners/" className="list3" role="button" aria-label="View banners">
              <div className="shape">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 18.9263C9.9241 18.9263 8.075 17.9631 6.871 16.4611C7.3964 14.1117 9.4924 12.3549 12 12.3549C14.5071 12.3549 16.6033 14.1117 17.1284 16.4611C15.9245 17.9631 14.0757 18.9263 12 18.9263ZM11.9826 5.8303C13.324 5.8303 14.4108 6.9174 14.4108 8.2586C14.4108 9.5997 13.324 10.6874 11.9826 10.6874C10.6409 10.6874 9.5538 9.5997 9.5538 8.2586C9.5538 6.9174 10.6409 5.8303 11.9826 5.8303ZM12.0003 2C6.477 2 2 6.4771 2 12C2 17.5231 6.477 22 12.0003 22C17.523 22 22 17.5231 22 12C22 6.4771 17.523 2 12.0003 2Z" fill="var(--primary)"/>
                </svg>
              </div>
              <div className="test-toggle-group">
                <div className="body-text">Banners</div>
                <div className="information-wrapper">
                  <div className="information">Check out all the banners I've made for my client</div>
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
    </div>
  );
}