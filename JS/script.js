 (function() {
   // https://dashboard.emailjs.com/admin
   emailjs.init('YOUR_PUBLIC_KEY'); // Replace with your EmailJS public key
 })();

// Run interactive bindings after DOM is ready so elements exist
document.addEventListener('DOMContentLoaded', function () {
  // Enable click/touch toggle for flip-cards on touch devices
  (function() {
    function isTouch() {
      return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }

    const flipCards = document.querySelectorAll('.flip-card');
    if (flipCards && flipCards.length) {
      flipCards.forEach(card => {
        // For touch devices, toggle flip on click
        card.addEventListener('click', function(e) {
          // prevent triggering from child interactive elements
          const tag = e.target.tagName.toLowerCase();
          if (tag === 'a' || tag === 'button') return;
          card.classList.toggle('flipped');
        });

        // allow keyboard users to trigger flip with Enter/Space
        card.addEventListener('keydown', function(e) {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            card.classList.toggle('flipped');
          }
        });
      });

      // Close flips when clicking elsewhere (good for mobile)
      document.addEventListener('click', function(e) {
        flipCards.forEach(card => {
          if (!card.contains(e.target)) card.classList.remove('flipped');
        });
      });
    }
  })();

  // Hover-to-play GIF behavior: images with .hover-gif
  (function() {
    const hoverGifs = document.querySelectorAll('img.hover-gif');
    if (!hoverGifs || hoverGifs.length === 0) return;

    hoverGifs.forEach(img => {
      const animated = img.dataset.animated || img.src;
      img.dataset.animated = animated;

      // Create an offscreen image to draw first frame to canvas as static poster
      const off = new Image();
      off.crossOrigin = 'anonymous';
      off.src = animated;
      off.addEventListener('load', function() {
        try {
          const canvas = document.createElement('canvas');
          const w = off.naturalWidth || img.width || 300;
          const h = off.naturalHeight || img.height || 200;
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(off, 0, 0, w, h);
          const stillData = canvas.toDataURL('image/png');
          img.dataset.still = stillData;
          // Replace the visible image with static poster to prevent auto-play
          img.src = stillData;
        } catch (err) {
          // drawing failed (CORS?), fallback: keep animated as source
          img.dataset.still = animated;
        }
      });

      // Hover / focus handlers
      img.addEventListener('mouseenter', function() {
        // swap to animated
        if (img.dataset.animated) img.src = img.dataset.animated;
      });
      img.addEventListener('mouseleave', function() {
        if (img.dataset.still) img.src = img.dataset.still;
      });

      // keyboard accessibility: play on focus, stop on blur
      img.addEventListener('focus', function() {
        if (img.dataset.animated) img.src = img.dataset.animated;
      });
      img.addEventListener('blur', function() {
        if (img.dataset.still) img.src = img.dataset.still;
      });

      // touch/click: toggle playback
      img.addEventListener('click', function(e) {
        const isAnimated = img.src === img.dataset.animated;
        if (isAnimated) {
          if (img.dataset.still) img.src = img.dataset.still;
        } else {
          img.src = img.dataset.animated;
        }
      });
    });
  })();

  // Modal (lightbox) functionality for showing full-size back images
  (function() {
    const modal = document.getElementById('imgModal');
    const modalImg = document.getElementById('modalImage');
    const closeBtn = modal ? modal.querySelector('.img-modal-close') : null;

    if (!modal || !modalImg) return;

    function openModal(src, alt) {
      if (!src) return;
      modalImg.src = src;
      modalImg.alt = alt || '';
      modal.setAttribute('aria-hidden', 'false');
      // lock background scroll
      document.body.style.overflow = 'hidden';
    }

    function closeModal() {
      modal.setAttribute('aria-hidden', 'true');
      modalImg.src = '';
      modalImg.alt = '';
      document.body.style.overflow = '';
    }

    // Open modal when clicking the back image of a flip card
    document.addEventListener('click', function(e) {
      const clicked = e.target;
      if (clicked && clicked.matches('.flip-back img')) {
        openModal(clicked.src, clicked.alt);
      }
    });

    // Close when clicking outside the image/content
    modal.addEventListener('click', function(e) {
      if (e.target === modal) closeModal();
    });

    // Close button
    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    // ESC key closes
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && modal.getAttribute('aria-hidden') === 'false') {
        closeModal();
      }
    });
  })();

  // Header menu text wave: split nav link text into per-letter spans with delay var
  (function() {
    const navLinks = document.querySelectorAll('nav a');
    if (!navLinks || navLinks.length === 0) return;

    navLinks.forEach(link => {
      // Don't split links that already contain markup
      if (link.querySelector('.wave-letter')) return;
      const text = link.textContent.trim();
      // Clear and rebuild preserving whitespace between words
      link.textContent = '';
      const wrapper = document.createElement('span');
      wrapper.className = 'wave-wrapper';
      for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        const span = document.createElement('span');
        span.className = 'wave-letter';
        span.textContent = ch === ' ' ? '\u00A0' : ch;
        span.style.setProperty('--i', i);
        wrapper.appendChild(span);
      }
      link.appendChild(wrapper);
      // keep existing aria/current if any
    });
  })();

  // Theme toggle (sun / moon) - toggles .light-theme on body and persists choice
  (function() {
    const toggle = document.getElementById('themeToggle');
    if (!toggle) return;

    function applyTheme(theme) {
      if (theme === 'light') {
        document.body.classList.add('light-theme');
        toggle.setAttribute('data-theme', 'light');
      } else {
        document.body.classList.remove('light-theme');
        toggle.setAttribute('data-theme', 'dark');
      }
    }

    // initialize from localStorage or prefer system preference
    const saved = localStorage.getItem('site-theme');
    if (saved) {
      applyTheme(saved);
    } else {
      const prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
      applyTheme(prefersLight ? 'light' : 'dark');
    }

    toggle.addEventListener('click', function() {
      const isLight = document.body.classList.contains('light-theme');
      const next = isLight ? 'dark' : 'light';
      applyTheme(next);
      try { localStorage.setItem('site-theme', next); } catch (e) { /* ignore */ }
    });
  })();
});