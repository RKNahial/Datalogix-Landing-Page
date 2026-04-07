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
