"use client";
import Image from "next/image";
import Link from "next/link";
import './globals.css';
import Navigation from "./components/Navigation";

export default function Home() {
  return (
    <div className="index">
      <div className="containers">
        <Navigation />
        <div className="main-content" style={{paddingTop: 0}}>
          <div className="top-app-bar">
            <div className="top-app-bar-container" style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
              <Link href="/settings" className="top-app-bar-icon" aria-label="Settings" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: '50%', cursor: 'pointer' }}>
                <svg id="vector" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="var(--primary)" fillRule="evenodd" d="M13.3856,3.14C13.8582,3.14 14.3088,3.4177 14.5588,3.8663L14.6219,3.9928L14.6691,4.1348L15.1121,5.8606L15.1526,5.894C15.2432,5.9768 15.4617,6.1868 15.5527,6.2449C15.5427,6.2384 15.5523,6.2366 15.5701,6.2366L15.6656,6.2371L15.7338,6.2242L17.4439,5.7475C17.9001,5.6201 18.4098,5.7669 18.7707,6.1343L18.8653,6.2399L18.9471,6.3624L20.3352,8.7755C20.5639,9.1746 20.5547,9.6869 20.3069,10.1267L20.2254,10.2562L20.1156,10.3825L18.8475,11.6326C18.8112,11.6683 18.77,11.7417 18.7555,11.7531L18.7502,11.7484L18.7476,11.8145L18.7457,12.2271C18.7467,12.2131 18.7528,12.2185 18.7609,12.2318L18.8019,12.3052L18.8476,12.3584L20.118,13.6097C20.4459,13.936 20.5739,14.4372 20.4472,14.931L20.4063,15.0653L20.3346,15.2153L18.947,17.6277C18.7111,18.0376 18.2447,18.2898 17.7304,18.2813L17.5891,18.2725L17.4442,18.2425L15.7335,17.7656C15.7515,17.7707 15.3099,17.8916 15.1922,17.953C15.2101,17.9435 15.174,17.9932 15.1508,18.0325L15.137,18.0589L15.1134,18.128L14.6686,19.8568C14.55,20.3139 14.1686,20.6809 13.6716,20.8105L13.5333,20.8399L13.3856,20.8499L10.6144,20.8499C10.1414,20.8499 9.6902,20.5717 9.4409,20.1219L9.3781,19.9951L9.3321,19.8558L8.8868,18.1287C8.8909,18.1448 8.564,17.8198 8.4487,17.7456C8.4583,17.7517 8.4482,17.7532 8.4302,17.7531L8.3352,17.7522L8.2653,17.7657L6.5561,18.2424C6.1001,18.3697 5.5908,18.2225 5.2299,17.856L5.1353,17.7507L5.0528,17.6274L3.6675,15.2175C3.4362,14.8185 3.4443,14.3049 3.6927,13.8639L3.7744,13.7339L3.8844,13.6074L5.1515,12.3583C5.1878,12.3226 5.2294,12.2485 5.244,12.2355L5.2524,12.1754L5.2541,11.7662C5.2522,11.7929 5.2297,11.7421 5.2105,11.7068L5.1971,11.6847L5.1515,11.6315L3.8824,10.3815C3.5531,10.0556 3.4258,9.554 3.5525,9.0599L3.5933,8.9255L3.6654,8.7746L5.0523,6.3633C5.2882,5.9519 5.7549,5.6997 6.2697,5.7085L6.4112,5.7175L6.5559,5.7475L8.2631,6.2236C8.2462,6.2189 8.6888,6.0975 8.811,6.0338C8.8009,6.039 8.8047,6.0294 8.8139,6.0135L8.8635,5.9284L8.8866,5.8619L9.3308,4.1355C9.448,3.677 9.8304,3.3093 10.3281,3.1794L10.4666,3.15L10.6144,3.14L13.3856,3.14ZM10.6912,4.5617L10.2537,6.2598L10.2047,6.4067C10.0605,6.7782 9.7899,7.1298 9.4699,7.2968C9.0923,7.4938 8.4617,7.6761 8.0217,7.6231L7.8826,7.5964L6.2494,7.1373L4.9341,9.4175L6.1821,10.6492L6.2855,10.7665C6.5042,11.0416 6.6576,11.3954 6.677,11.6915L6.6764,12.2023L6.6679,12.3555C6.6281,12.668 6.4677,13.0106 6.2486,13.2682L6.1513,13.3731L4.9351,14.5658L6.2456,16.8498L7.9252,16.383L8.0776,16.3517C8.4708,16.2909 8.9111,16.3509 9.2173,16.5462C9.5802,16.7798 10.057,17.2422 10.2253,17.6517L10.2661,17.7727L10.6893,19.4244L13.3076,19.4273L13.7456,17.7323L13.7944,17.5844C13.9371,17.2143 14.2078,16.8625 14.5291,16.6922C14.9079,16.4946 15.5387,16.3125 15.9777,16.3665L16.1163,16.3935L17.7502,16.8517L19.0646,14.5715L17.8169,13.3407L17.7136,13.2234C17.4942,12.9474 17.3407,12.5926 17.3224,12.2977L17.3234,11.7904L17.3315,11.6366C17.3704,11.3235 17.5308,10.9808 17.7502,10.7228L17.8477,10.6178L19.0646,9.4222L17.7531,7.1392L16.072,7.6072L15.9202,7.6381C15.5258,7.6984 15.0858,7.6384 14.7842,7.4443C14.4236,7.2143 13.9432,6.7485 13.7738,6.3378L13.7328,6.2165L13.3104,4.5645L10.6912,4.5617ZM11.9995,8.6862C13.8269,8.6862 15.3083,10.1675 15.3083,11.995C15.3083,13.8217 13.8266,15.3037 11.9995,15.3037C10.1732,15.3037 8.6917,13.8215 8.6917,11.995C8.6917,10.1677 10.1729,8.6862 11.9995,8.6862ZM11.9995,10.1108C10.9597,10.1108 10.1163,10.9544 10.1163,11.995C10.1163,13.0349 10.9601,13.8791 11.9995,13.8791C13.0398,13.8791 13.8837,13.035 13.8837,11.995C13.8837,10.9543 13.0402,10.1108 11.9995,10.1108Z" /></svg>
              </Link>
            </div>
          </div>
          <div className="header-container">
            <Image className="profile-image-icon" alt="Profile" src="/images/pfp.png" width={100} height={100} />
            <div className="title" style={{ paddingBottom: 40 }}>That Josh Guy</div>
          </div>

          <div className="blank-div">
            <div className="container1">
              <div className="title">I am a...</div>
            </div>
            <div className="theme-container">
              <button className="list3" role="button" aria-label="Graphic and UI Designer">
                <div className="shape">
                  {/* Designer SVG */}
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 22C6.49 22 2 17.51 2 12C2 6.49 6.49 2 12 2C17.51 2 22 6.04 22 11C22 14.31 19.31 17 16 17H14.23C13.95 17 13.73 17.22 13.73 17.5C13.73 17.62 13.78 17.73 13.86 17.83C14.27 18.3 14.5 18.89 14.5 19.5C14.5 20.88 13.38 22 12 22ZM12 4C7.59 4 4 7.59 4 12C4 16.41 7.59 20 12 20C12.28 20 12.5 19.78 12.5 19.5C12.5 19.34 12.42 19.22 12.36 19.15C11.95 18.69 11.73 18.1 11.73 17.5C11.73 16.12 12.85 15 14.23 15H16C18.21 15 20 13.21 20 11C20 7.14 16.41 4 12 4ZM6.5 13C7.32843 13 8 12.3284 8 11.5C8 10.6716 7.32843 10 6.5 10C5.67157 10 5 10.6716 5 11.5C5 12.3284 5.67157 13 6.5 13ZM9.5 9C10.3284 9 11 8.32843 11 7.5C11 6.67157 10.3284 6 9.5 6C8.67157 6 8 6.67157 8 7.5C8 8.32843 8.67157 9 9.5 9ZM14.5 9C15.3284 9 16 8.32843 16 7.5C16 6.67157 15.3284 6 14.5 6C13.6716 6 13 6.67157 13 7.5C13 8.32843 13.6716 9 14.5 9ZM17.5 13C18.3284 13 19 12.3284 19 11.5C19 10.6716 18.3284 10 17.5 10C16.6716 10 16 10.6716 16 11.5C16 12.3284 16.6716 13 17.5 13Z" fill="var(--primary)"/>
                  </svg>
                </div>
                <div className="test-toggle-group">
                  <div className="body-text">Graphic and UI Designer</div>
                  <div className="information-wrapper">
                    <div className="information">Freelance</div>
                  </div>
                </div>
              </button>
              <a href="https://sammyguru.com/author/emailthatjoshguy-me/" className="list3" role="button" aria-label="Writer">
                <div className="shape">
                  {/* Writer SVG */}
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M16.25 20.25H7.75C6.3693 20.25 5.25 19.1305 5.25 17.75V6.25C5.25 4.8693 6.3693 3.75 7.75 3.75H16.25C17.6307 3.75 18.75 4.8693 18.75 6.25V17.75C18.75 19.1305 17.6307 20.25 16.25 20.25Z" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M5.375 8.3125H7.8177" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M5.375 12H7.8177" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M5.375 15.6875H7.8177" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="test-toggle-group">
                  <div className="body-text">Writer</div>
                  <div className="information-wrapper">
                    <div className="information">SammyGuru</div>
                  </div>
                </div>
              </a>
            </div>
          </div>

          <div className="blank-div">
            <div className="container1">
              <div className="title">About me</div>
            </div>
            <button className="list3" role="button" aria-label="About">
              <div className="shape">
                {/* About SVG */}
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" clipRule="evenodd" d="M5.13519 6.77392V20.1163H8.1369C7.7373 20.0255 7.36267 19.895 7.01298 19.7249C6.27837 19.3448 5.66618 18.8355 5.17644 18.197L7.28847 16.1904C7.56395 16.5856 7.89299 16.8897 8.27561 17.1025C8.27571 17.1025 8.27581 17.1026 8.27591 17.1026V13.9755C8.37381 14.4025 8.50578 14.817 8.67182 15.219C9.01602 16.0103 9.46611 16.7268 10.0221 17.3684C10.3176 17.3253 10.5848 17.2367 10.8238 17.1025C11.1911 16.9049 11.4666 16.616 11.6503 16.236C11.8284 15.8957 11.9268 15.4885 11.9454 15.0142C11.9017 14.943 11.8594 14.8703 11.8184 14.796C11.3988 13.9947 11.1891 13.0747 11.1891 12.0358C11.1891 10.997 11.4063 10.0918 11.8408 9.32011C11.8859 9.23859 11.9327 9.15898 11.9813 9.08129L12.01 4H0V6.77392H5.13519ZM15.0596 4.08712L15.0689 6.95299C15.4625 6.869 15.8774 6.82701 16.3134 6.82701C17.1974 6.82701 18.0065 6.99767 18.7408 7.33898C19.475 7.6803 20.0893 8.17001 20.5837 8.80814L22.6515 6.76023C21.9323 5.88468 21.0258 5.20945 19.932 4.73458C18.8381 4.24486 17.6395 4 16.3359 4C15.899 4 15.4735 4.02904 15.0596 4.08712ZM14.6488 17.1101C14.5764 17.2876 14.4952 17.4599 14.4051 17.627C14.0116 18.3682 13.4678 18.9661 12.7736 19.4206C12.8441 19.453 12.9153 19.4845 12.9871 19.5151C13.976 19.9158 15.0323 20.1162 16.1561 20.1162C17.6844 20.1162 19.0329 19.8045 20.2017 19.1812C21.3854 18.5431 22.3143 17.6008 22.9886 16.3542C23.6629 15.0928 24 13.5272 24 11.6574V11.2345H15.9538V13.8611L20.73 13.9074C20.6367 14.3737 20.4906 14.7961 20.2916 15.1745C19.9169 15.8719 19.3775 16.4061 18.6733 16.7772C17.9692 17.1333 17.1225 17.3114 16.1336 17.3114C15.607 17.3114 15.1121 17.2443 14.6488 17.1101ZM8.27591 6.77392V10.163C8.37818 9.72525 8.51764 9.30332 8.69429 8.89718C9.03259 8.10741 9.47806 7.39966 10.0307 6.77392H8.27591Z" fill="var(--primary)"/>
                </svg>
              </div>
              <div className="test-toggle-group">
                <div className="body-text">Name</div>
                <div className="information-wrapper">
                  <div className="information">Josh Skinner</div>
                </div>
              </div>
            </button>
            <div className="list3">
              <div className="shape">
                <div className="div" style={{ fontFamily: 'Clock Serif' }}>17</div>
              </div>
              <div className="test-toggle-parent">
                <div className="body-text">Age</div>
                <div className="information-wrapper">
                  <div className="information">17 years old</div>
                </div>
              </div>
              <div className="others2"></div>
            </div>
          </div>

          <div className="blank-div">
            <div className="container1">
              <div className="title">My skills</div>
            </div>
            <div className="theme-container">
              <button className="list3" role="button" aria-label="Figma">
                <div className="shape">
                  {/* Figma SVG */}
                  <svg width="19" height="26" viewBox="0 0 19 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.2078 4.99999C17.2078 7.20913 15.417 8.99998 13.2078 8.99998H9.10394V1H13.2078C15.417 1 17.2078 2.79086 17.2078 4.99999Z" stroke="var(--primary)" strokeWidth="2"/>
                    <path d="M1 4.99999C1 7.20913 2.79086 8.99998 5 8.99998H9.10389V1H5C2.79086 1 1 2.79086 1 4.99999Z" stroke="var(--primary)" strokeWidth="2"/>
                    <path d="M1 13C1 15.2092 2.79086 17 5 17H9.10389V9.00006H5C2.79086 9.00006 1 10.7909 1 13Z" stroke="var(--primary)" strokeWidth="2"/>
                    <path d="M1 21C1 23.2092 2.81666 25 5.02581 25C7.26363 25 9.10389 23.1859 9.10389 20.9481V17H5C2.79086 17 1 18.7909 1 21Z" stroke="var(--primary)" strokeWidth="2"/>
                    <path d="M9.10394 13C9.10394 15.2092 10.8948 17 13.1039 17H13.2078C15.417 17 17.2078 15.2092 17.2078 13C17.2078 10.7909 15.417 9.00006 13.2078 9.00006H13.1039C10.8948 9.00006 9.10394 10.7909 9.10394 13Z" stroke="var(--primary)" strokeWidth="2"/>
                  </svg>
                </div>
                <div className="test-toggle-group">
                  <div className="body-text">Figma</div>
                  <div className="information-wrapper">
                    <div className="information">My choice of design software</div>
                  </div>
                </div>
              </button>
              <button className="list3" role="button" aria-label="HTML">
                <div className="shape">
                  {/* HTML SVG */}
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <mask id="mask0_938_462" style={{ maskType: 'alpha' }} maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24"><rect width="24" height="24" fill="#D9D9D9"/></mask>
                    <g mask="url(#mask0_938_462)"><path d="M0 15V9H1.5V11H3.5V9H5V15H3.5V12.5H1.5V15H0ZM7.75 15V10.5H6V9H11V10.5H9.25V15H7.75ZM12 15V10C12 9.71667 12.0958 9.47917 12.2875 9.2875C12.4792 9.09583 12.7167 9 13 9H17.5C17.7833 9 18.0208 9.09583 18.2125 9.2875C18.4042 9.47917 18.5 9.71667 18.5 10V15H17V10.5H16V14H14.5V10.5H13.5V15H12ZM20 15V9H21.5V13.5H24V15H20Z" fill="var(--primary)"/></g>
                  </svg>
                </div>
                <div className="test-toggle-group">
                  <div className="body-text">HTML</div>
                  <div className="information-wrapper">
                    <div className="information">Very knowledgable</div>
                  </div>
                </div>
              </button>
              <button className="list3" role="button" aria-label="CSS">
                <div className="shape">
                  {/* CSS SVG */}
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <mask id="mask0_938_507" style={{ maskType: 'alpha' }} maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24"><rect width="24" height="24" fill="#D9D9D9"/></mask>
                    <g mask="url(#mask0_938_507)"><path d="M10.5 15C10.2167 15 9.97917 14.9042 9.7875 14.7125C9.59583 14.5208 9.5 14.2833 9.5 14V13H11V13.5H13V12.5H10.5C10.2167 12.5 9.97917 12.4042 9.7875 12.2125C9.59583 12.0208 9.5 11.7833 9.5 11.5V10C9.5 9.71667 9.59583 9.47917 9.7875 9.2875C9.97917 9.09583 10.2167 9 10.5 9H13.5C13.7833 9 14.0208 9.09583 14.2125 9.2875C14.4042 9.47917 14.5 9.71667 14.5 10V11H13V10.5H11V11.5H13.5C13.7833 11.5 14.0208 11.5958 14.2125 11.7875C14.4042 11.9792 14.5 12.2167 14.5 12.5V14C14.5 14.2833 14.4042 14.5208 14.2125 14.7125C14.0208 14.9042 13.7833 15 13.5 15H10.5ZM17 15C16.7167 15 16.4792 14.9042 16.2875 14.7125C16.0958 14.5208 16 14.2833 16 14V13H17.5V13.5H19.5V12.5H17C16.7167 12.5 16.4792 12.4042 16.2875 12.2125C16.0958 12.0208 16 11.7833 16 11.5V10C16 9.71667 16.0958 9.47917 16.2875 9.2875C16.4792 9.09583 16.7167 9 17 9H20C20.2833 9 20.5208 9.09583 20.7125 9.2875C20.9042 9.47917 21 9.71667 21 10V11H19.5V10.5H17.5V11.5H20C20.2833 11.5 20.5208 11.5958 20.7125 11.7875C20.9042 11.9792 21 12.2167 21 12.5V14C21 14.2833 20.9042 14.5208 20.7125 14.7125C20.5208 14.9042 20.2833 15 20 15H17ZM4 15C3.71667 15 3.47917 14.9042 3.2875 14.7125C3.09583 14.5208 3 14.2833 3 14V10C3 9.71667 3.09583 9.47917 3.2875 9.2875C3.47917 9.09583 3.71667 9 4 9H7C7.28333 9 7.52083 9.09583 7.7125 9.2875C7.90417 9.47917 8 9.71667 8 10V11H6.5V10.5H4.5V13.5H6.5V13H8V14C8 14.2833 7.90417 14.5208 7.7125 14.7125C7.52083 14.9042 7.28333 15 7 15H4Z" fill="var(--primary)"/></g>
                  </svg>
                </div>
                <div className="test-toggle-group">
                  <div className="body-text">CSS</div>
                  <div className="information-wrapper">
                    <div className="information">Also very knowledgable</div>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
