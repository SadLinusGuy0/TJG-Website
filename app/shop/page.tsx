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
import { Settings, Shopping } from "@thatjoshguy/oneui-icons";

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
            <div className="theme-container">
              {loading ? (
                <div className="container" style={{ padding: 'var(--padding-xll)', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
                  <LoadingDots />
                </div>
              ) : products.length > 0 ? (
                <>
                  {products.map((product) => (
                    <a
                      key={product.id}
                      href={product.url}
                      className="list4"
                      aria-label={product.name}
                      style={{ marginBottom: 20, aspectRatio: '16 / 9', minHeight: 'auto' }}
                    >
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        width={600}
                        height={338}
                      />
                      <div className="list4-label">{product.name}</div>
                    </a>
                  ))}
                  <a
                    href="https://thatjoshguy.gumroad.com/"
                    className="shop-gumroad-button"
                    aria-label="View all on Gumroad"
                  >
                    <Shopping size={20} color="var(--primary)" />
                    <span>View all on Gumroad</span>
                  </a>
                </>
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