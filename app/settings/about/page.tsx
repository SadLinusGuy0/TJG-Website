"use client";
import Image from "next/image";
import Link from "next/link";
import "../../globals.css";
import Navigation from "../../components/Navigation";
import { useSearchParams } from "next/navigation";
import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter } from "next/navigation";
import Toast from "../../components/Toast";
import AnimatedText from "../../components/AnimatedText";
import { LoadingDots } from "../../components/LoadingAnim";
import PageHeading from "../../components/PageHeading";
import { Back } from "@thatjoshguy/oneui-icons";

function AboutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const from = searchParams.get("from") || "/settings";
  const [tapCount, setTapCount] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showDevDialog, setShowDevDialog] = useState(false);
  const tapTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleVersionTap = () => {
    if (tapTimeoutRef.current) {
      clearTimeout(tapTimeoutRef.current);
    }

    const newCount = tapCount + 1;
    setTapCount(newCount);

    tapTimeoutRef.current = setTimeout(() => {
      setTapCount(0);
    }, 2000);

    if (newCount >= 7) {
      const alreadyEnabled =
        localStorage.getItem("developer-options-enabled") === "true";

      if (alreadyEnabled) {
        setToastMessage("Developer options are already enabled");
        setShowToast(true);
      } else {
        setShowDevDialog(true);
      }

      setTapCount(0);
      if (tapTimeoutRef.current) {
        clearTimeout(tapTimeoutRef.current);
      }
    }
  };

  const handleDevOptionsAccept = () => {
    localStorage.setItem("developer-options-enabled", "true");
    window.dispatchEvent(new Event("developer-options-changed"));
    setShowDevDialog(false);
    setToastMessage("Developer options enabled");
    setShowToast(true);
  };

  useEffect(() => {
    return () => {
      if (tapTimeoutRef.current) {
        clearTimeout(tapTimeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      {showToast && (
        <Toast
          message={toastMessage}
          onClose={() => setShowToast(false)}
        />
      )}
      <div
        className="main-content"
        style={{
          animation:
            "fadeInUp 0.4s cubic-bezier(0.2, 0.9, 0.3, 1) forwards",
          opacity: 0,
        }}
      >
        <PageHeading
          title="About this site"
          leadingAction={
            <Link href={from} className="top-app-bar-icon" aria-label="Back" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', cursor: 'pointer' }}>
              <Back color="var(--primary)" />
            </Link>
          }
          onBack={() => router.push(from)}
        />
        <div className="header-container" style={{ marginTop: 0, height: 'auto', minHeight: 0 }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "8px",
              paddingBottom: "24px",
            }}
          >
            <div className="title" style={{ paddingBottom: 0 }}>
              <AnimatedText text="That Josh Guy" />
            </div>
            <div
              className="information-wrapper"
              style={{ alignContent: "center", textAlign: "center" }}
            >
              <div
                className="information"
                style={{
                  textAlign: "center",
                  cursor: "pointer",
                  userSelect: "none",
                }}
                onClick={handleVersionTap}
              >
                <AnimatedText text="Version 3.2" />
              </div>
            </div>
          </div>
        </div>

        <div style={{ height: 200 }} />

        <div className="container1" style={{ paddingTop: "0" }}>
            <div className="title">Credits</div>
          </div>
          <div className="list-group">
            <a
              href="https://x.com/BennettBuhner"
              className="list3"
              role="button"
              aria-label="Bennett Buhner"
            >
              <div
                className="shape"
                style={{ height: "30px", width: "30px" }}
              >
                <Image
                  src="/images/credits/benit.png"
                  alt="Bennett Buhner"
                  width={30}
                  height={30}
                  style={{ borderRadius: "50%" }}
                />
              </div>
              <div className="test-toggle-group">
                <div className="body-text">Bennett Buhner</div>
                <div className="information-wrapper">
                  <div className="information">
                    Made the animations and desktop layout
                  </div>
                </div>
              </div>
              <div className="others2">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g id="Shape">
                    <path
                      id="Vector 3"
                      d="M8.80005 20L15.3858 13.4142C16.1669 12.6332 16.1669 11.3668 15.3858 10.5858L8.80005 4"
                      stroke="#ACACB1"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </g>
                </svg>
              </div>
            </a>
            <a
              href="https://dhirenv.in"
              className="list3"
              role="button"
              aria-label="Dhiren Vasnani"
            >
              <div
                className="shape"
                style={{ height: "30px", width: "30px" }}
              >
                <Image
                  src="/images/credits/dhirenv.png"
                  alt="Dhiren Vasnani"
                  width={30}
                  height={30}
                  style={{ borderRadius: "50%" }}
                />
              </div>
              <div className="test-toggle-group">
                <div className="body-text">Dhiren Vasnani</div>
                <div className="information-wrapper">
                  <div className="information">
                    Made the light/dark theme system
                  </div>
                </div>
              </div>
              <div className="others2">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g id="Shape">
                    <path
                      id="Vector 3"
                      d="M8.80005 20L15.3858 13.4142C16.1669 12.6332 16.1669 11.3668 15.3858 10.5858L8.80005 4"
                      stroke="#ACACB1"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </g>
                </svg>
              </div>
            </a>
          </div>

          <div className="container settings">
            <div className="body-text">
              <p className="containers-are-the">
                This site was created using my One UI Design Kit, and built
                using Next.js.
              </p>
            </div>
          </div>
          <div className="list-group">
            <a
              href="https://github.com/SadLinusGuy0/TJG-Website/tree/main"
              className="list3"
              role="button"
              aria-label="GitHub Repository"
            >
              <div className="shape">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M12.0099 0C5.36875 0 0 5.40833 0 12.0992C0 17.4475 3.43994 21.9748 8.21205 23.5771C8.80869 23.6976 9.02724 23.3168 9.02724 22.9965C9.02724 22.716 9.00757 21.7545 9.00757 20.7527C5.6667 21.474 4.97099 19.3104 4.97099 19.3104C4.43409 17.9082 3.63858 17.5478 3.63858 17.5478C2.54511 16.8066 3.71823 16.8066 3.71823 16.8066C4.93117 16.8868 5.56763 18.0486 5.56763 18.0486C6.64118 19.8913 8.37111 19.3707 9.06706 19.0501C9.16638 18.2688 9.48473 17.728 9.82275 17.4276C7.15817 17.1471 4.35469 16.1055 4.35469 11.458C4.35469 10.1359 4.8316 9.05428 5.58729 8.21304C5.46806 7.91263 5.0504 6.67044 5.70677 5.00787C5.70677 5.00787 6.72083 4.6873 9.00732 6.24981C9.98625 5.98497 10.9958 5.85024 12.0099 5.84911C13.024 5.84911 14.0577 5.98948 15.0123 6.24981C17.299 4.6873 18.3131 5.00787 18.3131 5.00787C18.9695 6.67044 18.5515 7.91263 18.4323 8.21304C19.2079 9.05428 19.6652 10.1359 19.6652 11.458C19.6652 16.1055 16.8617 17.1269 14.1772 17.4276C14.6148 17.8081 14.9924 18.5292 14.9924 19.6711C14.9924 21.2936 14.9727 22.5957 14.9727 22.9962C14.9727 23.3168 15.1915 23.6976 15.7879 23.5774C20.56 21.9745 23.9999 17.4475 23.9999 12.0992C24.0196 5.40833 18.6312 0 12.0099 0Z"
                    fill="var(--primary)"
                  />
                </svg>
              </div>
              <div className="test-toggle-group">
                <div className="body-text">GitHub Repo</div>
                <div className="information-wrapper">
                  <div className="information">
                    This site is open source, and fully available on GitHub
                  </div>
                </div>
              </div>
              <div className="others2">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g id="Shape">
                    <path
                      id="Vector 3"
                      d="M8.80005 20L15.3858 13.4142C16.1669 12.6332 16.1669 11.3668 15.3858 10.5858L8.80005 4"
                      stroke="#ACACB1"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </g>
                </svg>
              </div>
            </a>

          <div className="container1">
          </div>
        </div>
      </div>

      {showDevDialog && (
        <div className="dialogue-overlay show" onClick={() => setShowDevDialog(false)}>
          <div className="dialogue-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="dialogue-content">
              <div className="dialogue-title">Developer options</div>
              <div className="dialogue-body">Enable developer options? This will show additional settings.</div>
            </div>
            <div className="dialogue-buttons">
              <button className="dialogue-btn cancel-btn" onClick={() => setShowDevDialog(false)}>Cancel</button>
              <div className="dialogue-btn-separator" />
              <button className="dialogue-btn confirm-btn" onClick={handleDevOptionsAccept}>Accept</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function Home() {
  return (
    <div className="index settings-page">
      <div className="containers">
        <Navigation hideMobile={true} />
        <Suspense fallback={
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
            <LoadingDots />
          </div>
        }>
          <AboutContent />
        </Suspense>
      </div>
    </div>
  );
}
