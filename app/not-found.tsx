import type { Metadata } from 'next';
import Link from 'next/link';
import { Error as ErrorIcon, Home } from '@thatjoshguy/oneui-icons';
import styles from './not-found.module.css';

export const metadata: Metadata = {
  title: 'Page not found | That Josh Guy',
  description: 'The page you were looking for could not be found.',
};

export default function NotFound() {
  return (
    <div className={styles.page}>
      <section className={styles.stage} aria-labelledby="not-found-title">
        <div className={styles.hero}>
          <div className={styles.errorIcon} aria-hidden="true">
            <ErrorIcon size={100} color="currentColor" />
          </div>

          <h1 className={styles.title} id="not-found-title">
            Error 404
          </h1>

          <p className={styles.description}>
            This page probably doesn&apos;t exist, or there&apos;s a typo in the URL.
            Double-check it, or go back home.
          </p>

          <Link href="/" className="blog-button">
            <Home size={24} color="currentColor" />
            Go home
          </Link>
        </div>
      </section>
    </div>
  );
}
