// Main JavaScript functionality for KAF81 website

(function() {
  'use strict';

  // Initialize on DOM load
  document.addEventListener('DOMContentLoaded', function() {
    initMobileMenu();
    initLazyLoading();
    initSkipLink();
    initSmoothScroll();
  });

  // Mobile menu toggle
  function initMobileMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('nav');
    
    if (menuToggle && nav) {
      menuToggle.addEventListener('click', function() {
        const isOpen = nav.classList.contains('open');
        nav.classList.toggle('open');
        menuToggle.setAttribute('aria-expanded', !isOpen);
        menuToggle.setAttribute('aria-label', isOpen ? 'Open menu' : 'Close menu');
      });

      // Close menu when clicking outside
      document.addEventListener('click', function(event) {
        if (nav.classList.contains('open') && 
            !nav.contains(event.target) && 
            !menuToggle.contains(event.target)) {
          nav.classList.remove('open');
          menuToggle.setAttribute('aria-expanded', 'false');
          menuToggle.setAttribute('aria-label', 'Open menu');
        }
      });

      // Close menu on escape key
      document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && nav.classList.contains('open')) {
          nav.classList.remove('open');
          menuToggle.setAttribute('aria-expanded', 'false');
          menuToggle.setAttribute('aria-label', 'Open menu');
          menuToggle.focus();
        }
      });
    }
  }

  // Lazy loading for images
  function initLazyLoading() {
    if ('loading' in HTMLImageElement.prototype) {
      // Native lazy loading supported
      const images = document.querySelectorAll('img[loading="lazy"]');
      images.forEach(function(img) {
        img.addEventListener('load', function() {
          this.classList.add('loaded');
        });
        // If image is already loaded (cached)
        if (img.complete) {
          img.classList.add('loaded');
        }
      });
    } else {
      // Fallback for browsers without native lazy loading
      const images = document.querySelectorAll('img[loading="lazy"]');
      
      if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver(function(entries, observer) {
          entries.forEach(function(entry) {
            if (entry.isIntersecting) {
              const img = entry.target;
              img.src = img.dataset.src || img.src;
              img.classList.add('loaded');
              observer.unobserve(img);
            }
          });
        });

        images.forEach(function(img) {
          imageObserver.observe(img);
        });
      } else {
        // Fallback: load all images immediately
        images.forEach(function(img) {
          img.src = img.dataset.src || img.src;
          img.classList.add('loaded');
        });
      }
    }
  }

  // Skip to main content link
  function initSkipLink() {
    const skipLink = document.querySelector('.skip-link');
    if (skipLink) {
      skipLink.addEventListener('click', function(event) {
        event.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          target.setAttribute('tabindex', '-1');
          target.focus();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    }
  }

  // Smooth scroll for anchor links
  function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');
    links.forEach(function(link) {
      link.addEventListener('click', function(event) {
        const href = this.getAttribute('href');
        if (href !== '#' && href.length > 1) {
          const target = document.querySelector(href);
          if (target) {
            event.preventDefault();
            target.setAttribute('tabindex', '-1');
            target.focus();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            // Remove tabindex after focus for accessibility
            setTimeout(function() {
              target.removeAttribute('tabindex');
            }, 1000);
          }
        }
      });
    });
  }

  // Set current page in navigation
  function setCurrentPage() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('nav a');
    navLinks.forEach(function(link) {
      const linkPath = new URL(link.href).pathname;
      if (linkPath === currentPath || (currentPath === '/' && linkPath.endsWith('index.html'))) {
        link.setAttribute('aria-current', 'page');
      }
    });
  }

  // Initialize current page highlighting
  setCurrentPage();
})();

