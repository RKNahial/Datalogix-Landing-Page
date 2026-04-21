/* ---- Hamburger ---- */
const btnH = document.getElementById('hamburgerBtn');
const mobileNav = document.getElementById('mobileNav');

btnH.addEventListener('click', () => {
  const open = btnH.getAttribute('aria-expanded') === 'true';
  btnH.setAttribute('aria-expanded', String(!open));
  mobileNav.classList.toggle('open', !open);
});

// Close on link click
mobileNav.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    btnH.setAttribute('aria-expanded', 'false');
    mobileNav.classList.remove('open');
  });
});

/* ---- Back to Top Button ---- */
const backToTopBtn = document.getElementById('backToTopBtn');

function toggleBackToTop() {
  if (window.scrollY > 300) {
    backToTopBtn.classList.add('show');
  } else {
    backToTopBtn.classList.remove('show');
  }
}

window.addEventListener('scroll', toggleBackToTop, { passive: true });

backToTopBtn.addEventListener('click', () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
});

/* ---- Carousel ---- */
const slides = document.querySelectorAll('.slide');
const dots = document.querySelectorAll('.dot');
let cur = 0;
let timer;

function goTo(n) {
  slides[cur].classList.remove('active');
  dots[cur].classList.remove('active');
  dots[cur].setAttribute('aria-selected', 'false');

  cur = (n + slides.length) % slides.length;

  slides[cur].classList.add('active');
  dots[cur].classList.add('active');
  dots[cur].setAttribute('aria-selected', 'true');
}

function next() { goTo(cur + 1); }
function reset() { clearInterval(timer); timer = setInterval(next, 5000); }

document.getElementById('arrowNext').addEventListener('click', () => { next(); reset(); });
dots.forEach(d => d.addEventListener('click', () => { goTo(+d.dataset.index); reset(); }));

// Auto-play
timer = setInterval(next, 5000);

// Pause on hover / focus
const carousel = document.getElementById('heroCarousel');
carousel.addEventListener('mouseenter', () => clearInterval(timer));
carousel.addEventListener('mouseleave', reset);
carousel.addEventListener('focusin', () => clearInterval(timer));
carousel.addEventListener('focusout', reset);

/* ---- Active nav on scroll ---- */
const allSections = document.querySelectorAll('section[id]');
const allLinks = document.querySelectorAll('.nav-desktop a, .nav-mobile a');

function updateNav() {
  let active = '';
  allSections.forEach(s => {
    if (window.scrollY >= s.offsetTop - 120) active = s.id;
  });
  allLinks.forEach(a => {
    const match = a.getAttribute('href') === '#' + active;
    a.classList.toggle('active', match);
    match ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current');
  });
}
window.addEventListener('scroll', updateNav, { passive: true });

/* ---- Header appear on scroll ---- */
const header = document.getElementById('header');
function updateHeader() {
  header.classList.toggle('scrolled', window.scrollY > 10);
}
window.addEventListener('scroll', updateHeader, { passive: true });
updateHeader();

/* ---- Team Deck Carousel ---- */
(function () {
  const cards    = Array.from(document.querySelectorAll('.team-card'));
  const teamDots = Array.from(document.querySelectorAll('.team-dot'));
  const TOTAL    = cards.length;
  let   active   = 0;

  function renderDeck(idx) {
    const prev = (idx - 1 + TOTAL) % TOTAL;
    const next = (idx + 1) % TOTAL;
    const hidden = (idx + 2) % TOTAL;

    cards.forEach(c => c.classList.remove('tc-active','tc-peek1','tc-peek2','tc-peek3'));

    cards[idx].classList.add('tc-active');
    cards[prev].classList.add('tc-peek1');   /* peeks LEFT  */
    cards[next].classList.add('tc-peek2');   /* peeks RIGHT */
    cards[hidden].classList.add('tc-peek3'); /* hidden      */

    teamDots.forEach((dot, i) => {
      const on = i === idx;
      dot.classList.toggle('active', on);
      dot.setAttribute('aria-selected', String(on));
    });
  }

  function goTeam(n) {
    active = (n + TOTAL) % TOTAL;
    renderDeck(active);
  }

  document.getElementById('teamPrev').addEventListener('click', () => goTeam(active - 1));
  document.getElementById('teamNext').addEventListener('click', () => goTeam(active + 1));

  teamDots.forEach(dot => dot.addEventListener('click', () => goTeam(+dot.dataset.index)));

  let tx = 0;
  const deck = document.getElementById('teamDeck');
  deck.addEventListener('touchstart', e => { tx = e.touches[0].clientX; }, { passive: true });
  deck.addEventListener('touchend', e => {
    const diff = tx - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) goTeam(diff > 0 ? active + 1 : active - 1);
  }, { passive: true });

  renderDeck(0);
})();

/* ---- Products Tabs ---- */
(function () {
  const tabs = Array.from(document.querySelectorAll('.products-tab'));
  const panel = document.getElementById('productsPanel');
  const titleEl = document.getElementById('productsPanelTitle');
  const descEl = document.getElementById('productsPanelSubheader');
  const contents = Array.from(document.querySelectorAll('.products-panel-content'));

  if (!tabs.length || !panel || !titleEl || !descEl) return;

  function withRedLastWord(text) {
    const words = text.trim().split(/\s+/);
    if (words.length < 2) return text;
    const last = words.pop();
    return `${words.join(' ')} <span class="red">${last}</span>`;
  }

  function activate(index) {
    tabs.forEach((tab, i) => {
      const active = i === index;
      tab.classList.toggle('is-active', active);
      tab.setAttribute('aria-selected', String(active));
    });

    const tab = tabs[index];
    panel.setAttribute('aria-labelledby', tab.id);
    titleEl.innerHTML = withRedLastWord(tab.dataset.title || '');
    descEl.textContent = tab.dataset.description || '';

    contents.forEach((content) => {
      const show = Number(content.dataset.tab) === index;
      content.classList.toggle('is-active', show);
      content.setAttribute('aria-hidden', String(!show));
      if (show) {
        content.removeAttribute('hidden');
      } else {
        content.setAttribute('hidden', '');
      }
    });
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activate(index));
    tab.addEventListener('keydown', (event) => {
      if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
      event.preventDefault();
      const dir = event.key === 'ArrowRight' ? 1 : -1;
      const next = (index + dir + tabs.length) % tabs.length;
      tabs[next].focus();
      activate(next);
    });
  });

  activate(0);
})();

/* ---- Products Card Deck Carousel ---- */
(function () {
  const carousels = Array.from(document.querySelectorAll('.products-carousel'));
  if (!carousels.length) return;

  carousels.forEach((carousel) => {
    const cards = Array.from(carousel.querySelectorAll('.products-card'));
    const dots = Array.from(carousel.querySelectorAll('.products-carousel-dot'));
    const prev = carousel.querySelector('.products-arrow--prev');
    const next = carousel.querySelector('.products-arrow--next');
    const stage = carousel.querySelector('.products-carousel-stage');
    const total = cards.length;
    let active = 0;

    if (!total) return;

    function render(idx) {
      const left = (idx - 1 + total) % total;
      const right = (idx + 1) % total;

      cards.forEach((card, i) => {
        card.classList.remove('pc-active', 'pc-left', 'pc-right', 'pc-hidden');
        if (i === idx) {
          card.classList.add('pc-active');
        } else if (i === left) {
          card.classList.add('pc-left');
        } else if (i === right) {
          card.classList.add('pc-right');
        } else {
          card.classList.add('pc-hidden');
        }
      });

      dots.forEach((dot, i) => {
        const on = i === idx;
        dot.classList.toggle('active', on);
        dot.setAttribute('aria-selected', String(on));
      });
    }

    function goTo(index) {
      active = (index + total) % total;
      render(active);
    }

    if (prev) prev.addEventListener('click', () => goTo(active - 1));
    if (next) next.addEventListener('click', () => goTo(active + 1));
    dots.forEach(dot => dot.addEventListener('click', () => goTo(+dot.dataset.index)));

    let startX = 0;
    if (stage) {
      stage.addEventListener('touchstart', (event) => {
        startX = event.touches[0].clientX;
      }, { passive: true });

      stage.addEventListener('touchend', (event) => {
        const diff = startX - event.changedTouches[0].clientX;
        if (Math.abs(diff) > 40) {
          goTo(diff > 0 ? active + 1 : active - 1);
        }
      }, { passive: true });
    }

    render(0);
  });
})();

/* ---- Products Video Scroll Playback ---- */
(function () {
  const video = document.querySelector('.products-video');
  if (!video) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(() => {});
        }
      } else {
        video.pause();
      }
    });
  }, {
    threshold: 0.6
  });

  observer.observe(video);
})();

/* ---- Gallery Showcase ---- */
(function () {
  const feature = document.querySelector('.gallery-feature');
  const thumbsWrap = document.querySelector('.gallery-thumbs');
  const featureImage = document.getElementById('galleryFeatureImage');
  const featureTitle = document.getElementById('galleryFeatureTitle');
  const featureCategory = document.getElementById('galleryFeatureCategory');
  const thumbs = Array.from(document.querySelectorAll('.gallery-thumb'));
  const prev = document.getElementById('galleryPrev');
  const next = document.getElementById('galleryNext');

  if (!feature || !thumbsWrap || !featureImage || !featureTitle || !featureCategory || !thumbs.length || !prev || !next) return;

  let activeIndex = 0;
  let startIndex = 0;

  function getVisibleCount() {
    if (window.innerWidth <= 480) return 3;
    if (window.innerWidth <= 768) return 4;
    return 5;
  }

  function render() {
    const visibleCount = getVisibleCount();

    if (activeIndex < startIndex) startIndex = activeIndex;
    if (activeIndex >= startIndex + visibleCount) startIndex = activeIndex - visibleCount + 1;
    if (startIndex > thumbs.length - visibleCount) startIndex = Math.max(thumbs.length - visibleCount, 0);

    const active = thumbs[activeIndex];
    featureImage.src = active.dataset.image || featureImage.src;
    featureImage.alt = active.dataset.alt || '';
    featureTitle.textContent = active.dataset.title || '';
    featureCategory.textContent = active.dataset.category || '';

    thumbs.forEach((thumb, index) => {
      const isActive = index === activeIndex;
      const isVisible = index >= startIndex && index < startIndex + visibleCount;
      thumb.classList.toggle('is-active', isActive);
      thumb.classList.toggle('is-hidden', !isVisible);
      thumb.setAttribute('aria-selected', String(isActive));
      thumb.tabIndex = isVisible ? 0 : -1;
    });
  }

  function animateShift(direction) {
    feature.classList.remove('is-swapping');
    void feature.offsetWidth;
    feature.classList.add('is-swapping');

    thumbsWrap.classList.remove('is-shifting-next', 'is-shifting-prev');
    void thumbsWrap.offsetWidth;
    thumbsWrap.classList.add(direction === 'prev' ? 'is-shifting-prev' : 'is-shifting-next');
  }

  function goTo(index, direction = null) {
    const total = thumbs.length;
    if (direction) animateShift(direction);
    activeIndex = (index + total) % total;
    render();
  }

  thumbs.forEach((thumb, index) => {
    thumb.addEventListener('click', () => goTo(index));
  });

  prev.addEventListener('click', () => goTo(activeIndex - 1, 'prev'));
  next.addEventListener('click', () => goTo(activeIndex + 1, 'next'));
  window.addEventListener('resize', render, { passive: true });

  render();
})();

/* ---- Contact Form (EmailJS) ---- */
(function () {
  // DATALOGIX EMAILJS
  const SERVICE_ID = 'service_x9pyfl4';
  const TEMPLATE_ID = 'template_jjg2d6z';
  const PUBLIC_KEY = 'M1oKTg0ffyg3WTclk';

  // TESTING EMAIL
  // const SERVICE_ID = 'service_xh8qfsb';
  // const TEMPLATE_ID = 'template_cqjq79l';
  // const PUBLIC_KEY = 'KEapMb2nmrOZb6nIU';


  if (typeof emailjs === 'undefined') {
    console.error('EmailJS SDK failed to load.');
    return;
  }

  emailjs.init({ publicKey: PUBLIC_KEY });

  const form = document.getElementById('contactForm');
  if (!form) return;

  const submitBtn = form.querySelector('.contact-submit');
  const fields = {
    name: form.querySelector('#name'),
    email: form.querySelector('#email'),
    subject: form.querySelector('#subject'),
    message: form.querySelector('#message')
  };
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  const statusBox = document.createElement('p');
  statusBox.className = 'contact-form-status';
  statusBox.setAttribute('role', 'status');
  statusBox.setAttribute('aria-live', 'polite');
  form.prepend(statusBox);
  let statusTimer = null;

  function setFormStatus(type, message) {
    if (statusTimer) {
      clearTimeout(statusTimer);
      statusTimer = null;
    }
    statusBox.classList.remove('is-error', 'is-success', 'is-info', 'is-visible');
    if (!type || !message) {
      statusBox.textContent = '';
      return;
    }
    statusBox.textContent = message;
    statusBox.classList.add('is-visible', `is-${type}`);
  }

  function ensureErrorElement(input) {
    let errorEl = input.parentElement.querySelector('.form-error');
    if (!errorEl) {
      errorEl = document.createElement('p');
      errorEl.className = 'form-error';
      errorEl.id = `${input.id}-error`;
      errorEl.setAttribute('aria-live', 'polite');
      input.parentElement.appendChild(errorEl);
    }
    input.setAttribute('aria-describedby', errorEl.id);
    return errorEl;
  }

  function setFieldError(input, message) {
    const errorEl = ensureErrorElement(input);
    if (message) {
      input.classList.add('is-invalid');
      input.setAttribute('aria-invalid', 'true');
      errorEl.textContent = message;
      errorEl.classList.add('is-visible');
      return false;
    }

    input.classList.remove('is-invalid');
    input.setAttribute('aria-invalid', 'false');
    errorEl.textContent = '';
    errorEl.classList.remove('is-visible');
    return true;
  }

  function validateField(fieldName) {
    const input = fields[fieldName];
    const value = input.value.trim();

    if (fieldName === 'name') {
      if (!value) return setFieldError(input, 'Please enter your full name.');
      if (value.length < 2) return setFieldError(input, 'Name must be at least 2 characters.');
      return setFieldError(input, '');
    }

    if (fieldName === 'email') {
      if (!value) return setFieldError(input, 'Please enter your email address.');
      if (!emailRegex.test(value)) return setFieldError(input, 'Please enter a valid email (example@domain.com).');
      return setFieldError(input, '');
    }

    if (fieldName === 'subject') {
      if (!value) return setFieldError(input, 'Please enter a subject.');
      if (value.length < 3) return setFieldError(input, 'Subject must be at least 3 characters.');
      return setFieldError(input, '');
    }

    if (fieldName === 'message') {
      if (!value) return setFieldError(input, 'Please enter your message.');
      if (value.length < 10) return setFieldError(input, 'Message must be at least 10 characters.');
      return setFieldError(input, '');
    }

    return true;
  }

  function validateForm() {
    const keys = Object.keys(fields);
    const invalid = keys.filter((key) => !validateField(key));
    return { valid: invalid.length === 0, invalid };
  }

  Object.keys(fields).forEach((key) => {
    const input = fields[key];
    ensureErrorElement(input);
    input.addEventListener('blur', () => validateField(key));
    input.addEventListener('input', () => {
      setFormStatus('', '');
      if (input.classList.contains('is-invalid')) validateField(key);
    });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const result = validateForm();
    if (!result.valid) {
      setFormStatus('error', 'Please review the highlighted fields and try again.');
      const firstInvalid = fields[result.invalid[0]];
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    // Disable button while sending
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';
    setFormStatus('', '');

  const templateParams = {
  from_name : fields.name.value.trim(),
  from_email: fields.email.value.trim(),
  subject   : fields.subject.value.trim(),
  message   : fields.message.value.trim(),
  initial   : fields.name.value.trim().charAt(0).toUpperCase(),
  time      : new Date().toLocaleString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
};

    emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams)
      .then(function () {
        setFormStatus('success', 'Your message has been sent successfully. We will get back to you soon.');
        statusTimer = setTimeout(() => setFormStatus('', ''), 5000);
        form.reset();
        Object.keys(fields).forEach((key) => setFieldError(fields[key], ''));
        submitBtn.textContent = 'Message Sent!';
        submitBtn.style.background = '#2a7a2a';

        // Reset button after 4 seconds
        setTimeout(function () {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Send Message';
          submitBtn.style.background = '';
        }, 5000);
      })
      .catch(function (error) {
        console.error('EmailJS error:', error);
        setFormStatus('error', 'We could not send your message right now. Please try again or email us at datalogix101@gmail.com.');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send Message';
      });
  });
})();

/* ---- Scroll Animations ---- */
(function () {
  const style = document.createElement('style');
  style.textContent = `
    .anim-ready {
      opacity: 0;
      transform: translateY(32px);
      transition: opacity 0.65s cubic-bezier(.4,0,.2,1),
                  transform 0.65s cubic-bezier(.4,0,.2,1);
    }
    .anim-ready.anim-left {
      transform: translateX(-36px);
    }
    .anim-ready.anim-right {
      transform: translateX(36px);
    }
    .anim-ready.anim-scale {
      transform: scale(0.94);
    }
    .anim-ready.anim-in {
      opacity: 1;
      transform: translateY(0) translateX(0) scale(1);
    }
  `;
  document.head.appendChild(style);

  // Elements and their animation type
  const targets = [
    // Section headers
    { sel: '.section-header',           cls: ''        },
    { sel: '.about-header',             cls: ''        },
    { sel: '.team-header',              cls: ''        },
    { sel: '.clients-header',           cls: ''        },
    { sel: '.gallery-header',           cls: ''        },

    // About section
    { sel: '.about-left',              cls: 'anim-left'  },
    { sel: '.about-cards',             cls: 'anim-right' },
    { sel: '.about-gv-left',           cls: 'anim-left'  },
    { sel: '.about-gv-right',          cls: 'anim-right' },
    { sel: '.about-values-text',       cls: ''           },
    { sel: '.about-goal-text',         cls: ''           },

    // Team cards
    { sel: '.team-deck-wrap',          cls: ''        },
    { sel: '.team-dots',               cls: ''        },

    // Products
    { sel: '.products-media',          cls: ''        },
    { sel: '.products-tabs',           cls: ''        },
    { sel: '.products-panel',          cls: ''        },

    // Clients
    { sel: '.client-card',             cls: 'anim-scale' },

    // Partners
    { sel: '.partners-marquee',        cls: ''        },

    // Gallery
    { sel: '.gallery-feature',         cls: 'anim-left'  },
    { sel: '.gallery-thumbs-wrap',     cls: 'anim-right' },

    // Contact
    { sel: '.contact-info',            cls: 'anim-left'  },
    { sel: '.contact-form-wrap',       cls: 'anim-right' },

    // Footer
    { sel: '.footer-column',           cls: ''        },
  ];

  // Apply base class to each element
  targets.forEach(({ sel, cls }) => {
    document.querySelectorAll(sel).forEach((el, i) => {
      el.classList.add('anim-ready');
      if (cls) el.classList.add(cls);

      if (i > 0) {
        el.style.transitionDelay = `${Math.min(i * 0.08, 0.4)}s`;
      }
    });
  });

  // Observe and trigger
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('anim-in');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  document.querySelectorAll('.anim-ready').forEach(el => observer.observe(el));
})();