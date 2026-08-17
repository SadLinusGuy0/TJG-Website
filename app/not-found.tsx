import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Home, Search } from '@thatjoshguy/oneui-icons';
import styles from './not-found.module.css';

export const metadata: Metadata = {
  title: 'Page not found | That Josh Guy',
  description: 'The page you were looking for could not be found.',
};

export default function NotFound() {
  return (
    <div className={`page ${styles.page}`}>
      <div className="page-body">
        <div className={`main-content ${styles.mainContent}`}>
          <section className={styles.card}>
            <div className={styles.visual} aria-hidden="true">
              <span className={styles.number}>4</span>
              <span className={styles.missingPage}>
                <span className={styles.searchIcon}>
                  <Search size={32} color="currentColor" />
                </span>
              </span>
              <span className={styles.number}>4</span>
              <span className={`${styles.spark} ${styles.sparkOne}`} />
              <span className={`${styles.spark} ${styles.sparkTwo}`} />
              <span className={`${styles.spark} ${styles.sparkThree}`} />
            </div>

            <div className={styles.content}>
              <span className={styles.eyebrow}>Error 404</span>
              <h1 className={styles.title}>This page took a wrong turn.</h1>
              <p className={styles.description}>
                It may have moved, disappeared, or never existed in the first
                place. Let&apos;s get you somewhere useful.
              </p>

              <div className={styles.actions}>
                <Link href="/" className={styles.primaryAction}>
                  <Home size={20} color="currentColor" />
                  Back home
                </Link>
                <Link href="/#design-work" className={styles.secondaryAction}>
                  View my work
                  <ArrowRight size={20} color="currentColor" />
                </Link>
              </div>
            </div>
          </section>

          <p className={styles.hint}>
            Lost, but not stuck.
          </p>
        </div>
      </div>
    </div>
  );
}
