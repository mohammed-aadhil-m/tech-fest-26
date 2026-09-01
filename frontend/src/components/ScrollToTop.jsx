import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop component automatically scrolls the window to the top (0, 0)
 * whenever navigation/redirection occurs to a new page or route.
 * If a hash anchor is provided (e.g. #about, #schedule), it smoothly scrolls to that element.
 */
export default function ScrollToTop() {
  const { pathname, search, hash } = useLocation();

  useEffect(() => {
    // If URL contains a hash, attempt to scroll to the target element
    if (hash) {
      const id = hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        return;
      }

      // Fallback if target element takes a moment to render on page switch
      const timer = setTimeout(() => {
        const delayedElement = document.getElementById(id);
        if (delayedElement) {
          delayedElement.scrollIntoView({ behavior: 'smooth' });
        } else {
          window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        }
      }, 100);

      return () => clearTimeout(timer);
    }

    // Scroll window and document elements to top
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant',
    });

    if (document.documentElement) {
      document.documentElement.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
    if (document.body) {
      document.body.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }

    // Also reset scroll for any inner main scroll containers (e.g., Admin layout)
    const mainContainers = document.querySelectorAll('main');
    mainContainers.forEach((container) => {
      container.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    });
  }, [pathname, search, hash]);

  return null;
}
