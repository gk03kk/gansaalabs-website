const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#site-nav');

if (menuButton && navigation) {
  menuButton.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!open));
    menuButton.setAttribute('aria-label', open ? 'Open navigation' : 'Close navigation');
    navigation.classList.toggle('open', !open);
  });
  navigation.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      menuButton.setAttribute('aria-expanded', 'false');
      menuButton.setAttribute('aria-label', 'Open navigation');
      navigation.classList.remove('open');
    });
  });
}

const filterButtons = document.querySelectorAll('.filter-chip');
const categoryCards = document.querySelectorAll('.category-card');
filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const filter = button.dataset.filter;
    filterButtons.forEach((item) => {
      const active = item === button;
      item.classList.toggle('active', active);
      item.setAttribute('aria-pressed', String(active));
    });
    categoryCards.forEach((card) => {
      card.hidden = filter !== 'all' && card.dataset.category !== filter;
    });
  });
});

document.querySelector('#year').textContent = new Date().getFullYear();

const progress = document.querySelector('.scroll-progress span');
const header = document.querySelector('.topbar');
let scrollQueued = false;
window.addEventListener('scroll', () => {
  if (scrollQueued) return;
  scrollQueued = true;
  window.requestAnimationFrame(() => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const amount = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
    progress.style.width = `${amount}%`;
    header.classList.toggle('scrolled', window.scrollY > 12);
    scrollQueued = false;
  });
}, { passive: true });

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (reducedMotion) {
  document.querySelectorAll('video[autoplay]').forEach((video) => {
    video.removeAttribute('autoplay');
    video.pause();
  });
}
if ('IntersectionObserver' in window && !reducedMotion) {
  document.documentElement.classList.add('motion');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -24px 0px' });
  document.querySelectorAll('.reveal, .section-head, .studio-grid, .projects-heading').forEach((element) => observer.observe(element));
}

// Pause animations and the story video in sections that are off screen.
if ('IntersectionObserver' in window) {
  const pauser = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      entry.target.classList.toggle('is-offscreen', !entry.isIntersecting);
      entry.target.querySelectorAll('video').forEach((video) => {
        if (!entry.isIntersecting) video.pause();
        else if (!reducedMotion) video.play().catch(() => {});
      });
    });
  }, { rootMargin: '200px 0px' });
  document.querySelectorAll('.hero, main > section, footer').forEach((section) => pauser.observe(section));
}

// Share row: Instagram has no web share link, so it uses the phone's share menu
// (or copies the link on a computer). "Copy link" always copies.
const shareUrl = 'https://gansaalabs.com/';
const shareText = 'Gansaa Labs: useful, considered apps for everyday life, including HappyHabit for families.';
const shareStatus = document.querySelector('.share-status');
let shareStatusTimer;
const showShareStatus = (message) => {
  if (!shareStatus) return;
  shareStatus.textContent = message;
  clearTimeout(shareStatusTimer);
  shareStatusTimer = setTimeout(() => { shareStatus.textContent = ''; }, 4000);
};
const copyShareLink = async (message) => {
  try {
    await navigator.clipboard.writeText(shareUrl);
    showShareStatus(message);
  } catch {
    window.prompt('Copy this link:', shareUrl);
  }
};
document.querySelector('[data-share-native]')?.addEventListener('click', async () => {
  if (navigator.share) {
    try {
      await navigator.share({ title: 'Gansaa Labs', text: shareText, url: shareUrl });
    } catch { /* closed the share menu */ }
  } else {
    copyShareLink('Link copied. Paste it into Instagram.');
  }
});
document.querySelector('[data-share-copy]')?.addEventListener('click', () => copyShareLink('Link copied.'));
