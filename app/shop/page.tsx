"use client";
import Footer from "../components/Footer";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getGumroadProducts, GumroadProduct } from "../../lib/gumroad";
import { LoadingDots } from "../components/LoadingAnim";
import PageHeading from "../components/PageHeading";
import { Download, Settings, Shopping } from "@thatjoshguy/oneui-icons";

function ProductRating({ average, count }: { average: number; count?: number }) {
  const roundedRating = Math.round(average);

  return (
    <span
      className="shop-product-rating"
      aria-label={`${average.toFixed(1)} out of 5 stars${count === undefined ? '' : ` from ${count} reviews`}`}
    >
      <span className="shop-product-stars" aria-hidden="true">
        {Array.from({ length: 5 }, (_, index) => (
          <span key={index} className={index < roundedRating ? "is-filled" : undefined}>
            ★
          </span>
        ))}
      </span>
      <span>{average.toFixed(1)}</span>
      {count !== undefined && <span>({count.toLocaleString()})</span>}
    </span>
  );
}

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
    <div className="page">
      <div className="page-body">
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

          <div className="section shop-products-section">
            <div className="theme-container">
              {loading ? (
                <div className="panel" style={{ padding: 'var(--padding-xll)', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
                  <LoadingDots />
                </div>
              ) : products.length > 0 ? (
                <div className="shop-product-grid">
                  {products.map((product) => (
                    <a
                      key={product.id}
                      href={product.url}
                      className="shop-product-card"
                      aria-label={product.name}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <div className="shop-product-card-background">
                        <Image
                          src={product.imageUrl}
                          alt=""
                          fill
                          sizes="(max-width: 767px) calc(100vw - 40px), (max-width: 1023px) 80vw, 40vw"
                        />
                      </div>
                      <div className="shop-product-card-gradient" aria-hidden="true" />
                      <div className="shop-product-card-content">
                        <h2>{product.name}</h2>
                        <div className="shop-product-card-meta">
                          {product.formattedPrice && (
                            <span className="shop-product-pill shop-product-price">
                              {product.formattedPrice}
                            </span>
                          )}
                          {product.salesCount !== undefined && (
                            <span
                              className="shop-product-pill"
                              aria-label={`${product.salesCount.toLocaleString()} downloads`}
                            >
                              <span aria-hidden="true">
                                <Download size={14} color="currentColor" />
                              </span>
                              <span aria-hidden="true">
                                {product.salesCount.toLocaleString()}
                              </span>
                            </span>
                          )}
                          {product.rating && (
                            <ProductRating {...product.rating} />
                          )}
                        </div>
                      </div>
                    </a>
                  ))}
                  <a
                    href="https://thatjoshguy.gumroad.com/"
                    className="shop-gumroad-button"
                    aria-label="View all on Gumroad"
                  >
                    <Shopping size={20} color="#fff" />
                    <span>View all on Gumroad</span>
                  </a>
                </div>
              ) : (
                <div
                  className="panel"
                  style={{
                    padding: 'var(--padding-xll)',
                    minHeight: '200px',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
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
