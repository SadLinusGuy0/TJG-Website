"use client";
import Navigation from "../components/Navigation";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Shop() {
  const pathname = usePathname();
  return (
    <div className="index">
      <div className="containers">
        <Navigation />
        <div className="main-content">
          <div className="top-app-bar">
            <div className="top-app-bar-container" style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
              <Link href={`/settings?from=${encodeURIComponent(pathname)}`} className="top-app-bar-icon" aria-label="Settings" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: '50%', cursor: 'pointer' }}>
                <svg id="vector" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="var(--primary)" fillRule="evenodd" d="M13.3856,3.14C13.8582,3.14 14.3088,3.4177 14.5588,3.8663L14.6219,3.9928L14.6691,4.1348L15.1121,5.8606L15.1526,5.894C15.2432,5.9768 15.4617,6.1868 15.5527,6.2449C15.5427,6.2384 15.5523,6.2366 15.5701,6.2366L15.6656,6.2371L15.7338,6.2242L17.4439,5.7475C17.9001,5.6201 18.4098,5.7669 18.7707,6.1343L18.8653,6.2399L18.9471,6.3624L20.3352,8.7755C20.5639,9.1746 20.5547,9.6869 20.3069,10.1267L20.2254,10.2562L20.1156,10.3825L18.8475,11.6326C18.8112,11.6683 18.77,11.7417 18.7555,11.7531L18.7502,11.7484L18.7476,11.8145L18.7457,12.2271C18.7467,12.2131 18.7528,12.2185 18.7609,12.2318L18.8019,12.3052L18.8476,12.3584L20.118,13.6097C20.4459,13.936 20.5739,14.4372 20.4472,14.931L20.4063,15.0653L20.3346,15.2153L18.947,17.6277C18.7111,18.0376 18.2447,18.2898 17.7304,18.2813L17.5891,18.2725L17.4442,18.2425L15.7335,17.7656C15.7515,17.7707 15.3099,17.8916 15.1922,17.953C15.2101,17.9435 15.174,17.9932 15.1508,18.0325L15.137,18.0589L15.1134,18.128L14.6686,19.8568C14.55,20.3139 14.1686,20.6809 13.6716,20.8105L13.5333,20.8399L13.3856,20.8499L10.6144,20.8499C10.1414,20.8499 9.6902,20.5717 9.4409,20.1219L9.3781,19.9951L9.3321,19.8558L8.8868,18.1287C8.8909,18.1448 8.564,17.8198 8.4487,17.7456C8.4583,17.7517 8.4482,17.7532 8.4302,17.7531L8.3352,17.7522L8.2653,17.7657L6.5561,18.2424C6.1001,18.3697 5.5908,18.2225 5.2299,17.856L5.1353,17.7507L5.0528,17.6274L3.6675,15.2175C3.4362,14.8185 3.4443,14.3049 3.6927,13.8639L3.7744,13.7339L3.8844,13.6074L5.1515,12.3583C5.1878,12.3226 5.2294,12.2485 5.244,12.2355L5.2524,12.1754L5.2541,11.7662C5.2522,11.7929 5.2297,11.7421 5.2105,11.7068L5.1971,11.6847L5.1515,11.6315L3.8824,10.3815C3.5531,10.0556 3.4258,9.554 3.5525,9.0599L3.5933,8.9255L3.6654,8.7746L5.0523,6.3633C5.2882,5.9519 5.7549,5.6997 6.2697,5.7085L6.4112,5.7175L6.5559,5.7475L8.2631,6.2236C8.2462,6.2189 8.6888,6.0975 8.811,6.0338C8.8009,6.039 8.8047,6.0294 8.8139,6.0135L8.8635,5.9284L8.8866,5.8619L9.3308,4.1355C9.448,3.677 9.8304,3.3093 10.3281,3.1794L10.4666,3.15L10.6144,3.14L13.3856,3.14ZM10.6912,4.5617L10.2537,6.2598L10.2047,6.4067C10.0605,6.7782 9.7899,7.1298 9.4699,7.2968C9.0923,7.4938 8.4617,7.6761 8.0217,7.6231L7.8826,7.5964L6.2494,7.1373L4.9341,9.4175L6.1821,10.6492L6.2855,10.7665C6.5042,11.0416 6.6576,11.3954 6.677,11.6915L6.6764,12.2023L6.6679,12.3555C6.6281,12.668 6.4677,13.0106 6.2486,13.2682L6.1513,13.3731L4.9351,14.5658L6.2456,16.8498L7.9252,16.383L8.0776,16.3517C8.4708,16.2909 8.9111,16.3509 9.2173,16.5462C9.5802,16.7798 10.057,17.2422 10.2253,17.6517L10.2661,17.7727L10.6893,19.4244L13.3076,19.4273L13.7456,17.7323L13.7944,17.5844C13.9371,17.2143 14.2078,16.8625 14.5291,16.6922C14.9079,16.4946 15.5387,16.3125 15.9777,16.3665L16.1163,16.3935L17.7502,16.8517L19.0646,14.5715L17.8169,13.3407L17.7136,13.2234C17.4942,12.9474 17.3407,12.5926 17.3224,12.2977L17.3234,11.7904L17.3315,11.6366C17.3704,11.3235 17.5308,10.9808 17.7502,10.7228L17.8477,10.6178L19.0646,9.4222L17.7531,7.1392L16.072,7.6072L15.9202,7.6381C15.5258,7.6984 15.0858,7.6384 14.7842,7.4443C14.4236,7.2143 13.9432,6.7485 13.7738,6.3378L13.7328,6.2165L13.3104,4.5645L10.6912,4.5617ZM11.9995,8.6862C13.8269,8.6862 15.3083,10.1675 15.3083,11.995C15.3083,13.8217 13.8266,15.3037 11.9995,15.3037C10.1732,15.3037 8.6917,13.8215 8.6917,11.995C8.6917,10.1677 10.1729,8.6862 11.9995,8.6862ZM11.9995,10.1108C10.9597,10.1108 10.1163,10.9544 10.1163,11.995C10.1163,13.0349 10.9601,13.8791 11.9995,13.8791C13.0398,13.8791 13.8837,13.035 13.8837,11.995C13.8837,10.9543 13.0402,10.1108 11.9995,10.1108Z" /></svg>
              </Link>
            </div>
          </div>
          <div className="header-container">
            <div className="title" style={{ paddingBottom: 40 }}>Shop</div>
          </div>

          <div className="blank-div">
            <div className="theme-container">
              {/* Gumroad main card */}
              <a href="https://shop.thatjoshguy.me/" className="list3" role="button" aria-label="Gumroad" style={{ marginBottom: 20 }}>
                <div className="shape">
                  {/* Gumroad SVG */}
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7.6055 7.3612C7.6055 6.4541 8.3644 5.7176 9.3019 5.7176C10.2381 5.7176 10.997 6.4541 10.997 7.3612C10.997 8.2682 10.2381 9.0035 9.3019 9.0035C8.3644 9.0035 7.6055 8.2682 7.6055 7.3612ZM18.6786 19.1459C18.6786 19.7459 18.1103 20.2353 17.4133 20.2353H6.5867C6.458 20.2353 5.3214 20.2129 5.3214 19.44V15.5859L7.6079 13.3529C7.8496 13.1341 8.2394 13.1365 8.4749 13.36L10.2466 15.0341C10.4834 15.2588 10.8695 15.2576 11.1051 15.0341L15.5761 10.7882C15.8129 10.5647 16.1929 10.5682 16.4249 10.7965L18.6786 13.0953V19.1459ZM3.5 4.8553V19.44C3.5 21.0165 4.8819 22 6.5867 22H17.4133C19.1169 22 20.5 20.7224 20.5 19.1459V4.8553C20.5 3.2788 19.1169 2 17.4133 2H6.5867C4.8819 2 3.5 3.2788 3.5 4.8553Z" fill="var(--primary)"/>
                  </svg>
                </div>
                <div className="test-toggle-group">
                  <div className="body-text">Gumroad</div>
                  <div className="information-wrapper">
                    <div className="information">View my entire wallpaper library</div>
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

          <div className="blank-div">
            <div className="theme-container">
              {/* Wallpaper cards */}
              <a href="https://thatjoshguy.gumroad.com/l/flip7" className="list4" aria-label="Galaxy Z Flip 7 wallpaper recreation" style={{ marginBottom: 20 }}>
                <div className="test-toggle-frame">
                  <div className="body-text" style={{ marginLeft: 10, textAlign: 'left', display: 'flex', alignItems: 'center' }}>
                    <span className="new-chip">New</span>
                    Z Flip 7 Recreation
                  </div>
                  <div className="others2">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <g id="Shape">
                        <path id="Vector 3" d="M8.80005 20L15.3858 13.4142C16.1669 12.6332 16.1669 11.3668 15.3858 10.5858L8.80005 4" stroke="#ACACB1" strokeWidth="2" strokeLinecap="round"/>
                      </g>
                    </svg>
                  </div>
                </div>
                <Image src="/images/wallpapers/flip7.png" alt="Flip 7 wallpaper recreation" width={600} height={338} style={{ width: '100%', height: '100%', borderRadius: 24 }} />
              </a>
              <a href="https://thatjoshguy.gumroad.com/l/oneui8" className="list4" aria-label="One UI 8 wallpapers" style={{ marginBottom: 20 }}>
                <div className="test-toggle-frame">
                  <div className="body-text" style={{ marginLeft: 10, textAlign: 'left', display: 'flex', alignItems: 'center' }}>
                    <span className="hot-chip">Hot</span>
                    One UI 8
                  </div>
                  <div className="others2">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <g id="Shape">
                        <path id="Vector 3" d="M8.80005 20L15.3858 13.4142C16.1669 12.6332 16.1669 11.3668 15.3858 10.5858L8.80005 4" stroke="#ACACB1" strokeWidth="2" strokeLinecap="round"/>
                      </g>
                    </svg>
                  </div>
                </div>
                <Image src="/images/wallpapers/oui8-dark.png" alt="S25 Ultra recreation" width={600} height={338} style={{ width: '100%', height: '100%', borderRadius: 24 }} />
              </a>
              <a href="https://thatjoshguy.gumroad.com/l/s25u" className="list4" aria-label="S25U remake" style={{ marginBottom: 20 }}>
                <div className="test-toggle-frame">
                  <div className="body-text" style={{ marginLeft: 10, textAlign: 'left' }}>S25 Ultra recreation</div>
                  <div className="others2">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <g id="Shape">
                        <path id="Vector 3" d="M8.80005 20L15.3858 13.4142C16.1669 12.6332 16.1669 11.3668 15.3858 10.5858L8.80005 4" stroke="#ACACB1" strokeWidth="2" strokeLinecap="round"/>
                      </g>
                    </svg>
                  </div>
                </div>
                <Image src="/images/wallpapers/s25-web.png" alt="S25 Ultra recreation" width={600} height={338} style={{ width: '100%', height: '100%', borderRadius: 24 }} />
              </a>
              <a href="https://thatjoshguy.gumroad.com/l/eclypse" className="list4" aria-label="Eclypse" style={{ marginBottom: 20 }}>
                <div className="test-toggle-frame">
                  <div className="body-text" style={{ marginLeft: 10, textAlign: 'left' }}>Eclypse</div>
                  <div className="others2">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <g id="Shape">
                        <path id="Vector 3" d="M8.80005 20L15.3858 13.4142C16.1669 12.6332 16.1669 11.3668 15.3858 10.5858L8.80005 4" stroke="#ACACB1" strokeWidth="2" strokeLinecap="round"/>
                      </g>
                    </svg>
                  </div>
                </div>
                <Image src="/images/wallpapers/Eclypse.jpg" alt="Eclypse" width={600} height={338} style={{ width: '100%', height: '100%', borderRadius: 24 }} />
              </a>
              <a href="https://mono.thatjoshguy.me" className="list4" aria-label="Monochromes" style={{ marginBottom: 20 }}>
                <div className="test-toggle-frame">
                  <div className="body-text" style={{ marginLeft: 10, textAlign: 'left' }}>Monochromes</div>
                  <div className="others2">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <g id="Shape">
                        <path id="Vector 3" d="M8.80005 20L15.3858 13.4142C16.1669 12.6332 16.1669 11.3668 15.3858 10.5858L8.80005 4" stroke="#ACACB1" strokeWidth="2" strokeLinecap="round"/>
                      </g>
                    </svg>
                  </div>
                </div>
                <Image src="/images/wallpapers/mono.png" alt="Monochromes" width={600} height={338} style={{ width: '100%', height: '100%', borderRadius: 24 }} />
              </a>
              <a href="https://thatjoshguy.gumroad.com/l/a15-walls" className="list4" aria-label="Android 15 walls" style={{ marginBottom: 20 }}>
                <div className="test-toggle-frame">
                  <div className="body-text" style={{ marginLeft: 10, textAlign: 'left' }}>Android 15 Walls</div>
                  <div className="others2">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <g id="Shape">
                        <path id="Vector 3" d="M8.80005 20L15.3858 13.4142C16.1669 12.6332 16.1669 11.3668 15.3858 10.5858L8.80005 4" stroke="#ACACB1" strokeWidth="2" strokeLinecap="round"/>
                      </g>
                    </svg>
                  </div>
                </div>
                <Image src="/images/wallpapers/a15.png" alt="Android 15 walls" width={600} height={338} style={{ width: '100%', height: '100%', borderRadius: 24 }} />
              </a>
              <a href="https://thatjoshguy.gumroad.com/l/pixelvibes" className="list4" aria-label="Pixel Vibes" style={{ marginBottom: 20 }}>
                <div className="test-toggle-frame">
                  <div className="body-text" style={{ marginLeft: 10, textAlign: 'left' }}>Pixel Vibes</div>
                  <div className="others2">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <g id="Shape">
                        <path id="Vector 3" d="M8.80005 20L15.3858 13.4142C16.1669 12.6332 16.1669 11.3668 15.3858 10.5858L8.80005 4" stroke="#ACACB1" strokeWidth="2" strokeLinecap="round"/>
                      </g>
                    </svg>
                  </div>
                </div>
                <Image src="/images/wallpapers/pixel-vibes.png" alt="Pixel Vibes" width={600} height={338} style={{ width: '100%', height: '100%', borderRadius: 24 }} />
              </a>
              <a href="https://thatjoshguy.gumroad.com/l/circles" className="list4" aria-label="Circles" style={{ marginBottom: 20 }}>
                <div className="test-toggle-frame">
                  <div className="body-text" style={{ marginLeft: 10, textAlign: 'left' }}>Circles</div>
                  <div className="others2">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <g id="Shape">
                        <path id="Vector 3" d="M8.80005 20L15.3858 13.4142C16.1669 12.6332 16.1669 11.3668 15.3858 10.5858L8.80005 4" stroke="#ACACB1" strokeWidth="2" strokeLinecap="round"/>
                      </g>
                    </svg>
                  </div>
                </div>
                <Image src="/images/wallpapers/circles.png" alt="Circles" width={600} height={338} style={{ width: '100%', height: '100%', borderRadius: 24 }} />
              </a>
              <a href="https://thatjoshguy.gumroad.com/l/CirclesS24" className="list4" aria-label="Circles S24 Edition" style={{ marginBottom: 20 }}>
                <div className="test-toggle-frame">
                  <div className="body-text" style={{ marginLeft: 10, textAlign: 'left' }}>Circles S24 Edition</div>
                  <div className="others2">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <g id="Shape">
                        <path id="Vector 3" d="M8.80005 20L15.3858 13.4142C16.1669 12.6332 16.1669 11.3668 15.3858 10.5858L8.80005 4" stroke="#ACACB1" strokeWidth="2" strokeLinecap="round"/>
                      </g>
                    </svg>
                  </div>
                </div>
                <Image src="/images/wallpapers/circles-s24e.png" alt="Circles S24 Edition" width={600} height={338} style={{ width: '100%', height: '100%', borderRadius: 24 }} />
              </a>
              <a href="https://thatjoshguy.gumroad.com/l/jpick" className="list4" aria-label="Josh's Pick" style={{ marginBottom: 20 }}>
                <div className="test-toggle-frame">
                  <div className="body-text" style={{ marginLeft: 10, textAlign: 'left' }}>Josh's Pick</div>
                  <div className="others2">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <g id="Shape">
                        <path id="Vector 3" d="M8.80005 20L15.3858 13.4142C16.1669 12.6332 16.1669 11.3668 15.3858 10.5858L8.80005 4" stroke="#ACACB1" strokeWidth="2" strokeLinecap="round"/>
                      </g>
                    </svg>
                  </div>
                </div>
                <Image src="/images/wallpapers/joshs-pick.png" alt="Josh's Pick" width={600} height={338} style={{ width: '100%', height: '100%', borderRadius: 24 }} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 