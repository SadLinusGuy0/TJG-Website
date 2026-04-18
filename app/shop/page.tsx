"use client";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getGumroadProducts, GumroadProduct } from "../../lib/gumroad";
import { LoadingDots } from "../components/LoadingAnim";
import PageHeading from "../components/PageHeading";
import { Settings } from "@thatjoshguy/oneui-icons";

export default function Shop() {
  const pathname = usePathname();
  const [products, setProducts] = useState<GumroadProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      try {
        const productList = await getGumroadProducts();
        setProducts(productList);
      } catch (error) {
        console.error('Failed to load products:', error);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);
  return (
    <div className="index">
      <div className="containers">
        <Navigation />
        <div className="main-content">
          <PageHeading
            title="Shop"
            trailingAction={
              <Link href={`/settings?from=${encodeURIComponent(pathname)}`} className="top-app-bar-icon" aria-label="Settings" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', cursor: 'pointer' }}>
                <Settings color="var(--primary)" />
              </Link>
            }
            barTrailingAction={
              <Link href={`/settings?from=${encodeURIComponent(pathname)}`} className="top-app-bar-icon" aria-label="Settings" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', cursor: 'pointer' }}>
                <Settings color="var(--primary)" />
              </Link>
            }
          />

          <div className="blank-div">
            <div className="list-group">
              {/* Gumroad main card */}
              <a href="https://shop.thatjoshguy.me/" className="list3" role="button" aria-label="Gumroad">
                <div className="shape">
                  {/* Gumroad SVG */}
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7.6055 7.3612C7.6055 6.4541 8.3644 5.7176 9.3019 5.7176C10.2381 5.7176 10.997 6.4541 10.997 7.3612C10.997 8.2682 10.2381 9.0035 9.3019 9.0035C8.3644 9.0035 7.6055 8.2682 7.6055 7.3612ZM18.6786 19.1459C18.6786 19.7459 18.1103 20.2353 17.4133 20.2353H6.5867C6.458 20.2353 5.3214 20.2129 5.3214 19.44V15.5859L7.6079 13.3529C7.8496 13.1341 8.2394 13.1365 8.4749 13.36L10.2466 15.0341C10.4834 15.2588 10.8695 15.2576 11.1051 15.0341L15.5761 10.7882C15.8129 10.5647 16.1929 10.5682 16.4249 10.7965L18.6786 13.0953V19.1459ZM3.5 4.8553V19.44C3.5 21.0165 4.8819 22 6.5867 22H17.4133C19.1169 22 20.5 20.7224 20.5 19.1459V4.8553C20.5 3.2788 19.1169 2 17.4133 2H6.5867C4.8819 2 3.5 3.2788 3.5 4.8553Z" fill="var(--accent)"/>
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
              {loading ? (
                <div className="container" style={{ padding: 'var(--padding-xll)', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
                  <LoadingDots />
                </div>
              ) : products.length > 0 ? (
                products.map((product) => (
                  <a
                    key={product.id}
                    href={product.url}
                    className="list4"
                    aria-label={product.name}
                    style={{ marginBottom: 20 }}
                  >
                    <div className="test-toggle-frame">
                      <div className="body-text" style={{ marginLeft: 10, textAlign: 'left', display: 'flex', alignItems: 'center' }}>
                        {product.badge === 'new' && <span className="new-chip">New</span>}
                        {product.badge === 'hot' && <span className="hot-chip">Hot</span>}
                        {product.name}
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
                      src={product.imageUrl}
                      alt={product.name}
                      width={600}
                      height={338}
                      style={{ width: '100%', height: '100%', borderRadius: 'var(--br-2lg)' }}
                    />
                  </a>
                ))
              ) : (
                <div className="container" style={{ padding: 'var(--padding-xll)' }}>
                  <div className="body-text">No products available at the moment.</div>
                </div>
              )}
            </div>
          </div>
          <Footer />
        </div>
      </div>
    </div>
  );
} 