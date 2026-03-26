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