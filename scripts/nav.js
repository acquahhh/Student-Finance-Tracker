// Highlights the nav link for the section currently in view (aria-current="page").
const links = [...document.querySelectorAll('.main-nav a[href^="#"]')];
const byId = new Map(links.map((a) => [a.getAttribute('href').slice(1), a]));

function setCurrent(id) {
  links.forEach((a) => a.removeAttribute('aria-current'));
  const link = byId.get(id);
  if (link) link.setAttribute('aria-current', 'page');
}

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries.filter((e) => e.isIntersecting);
      if (visible.length) setCurrent(visible[0].target.id);
    },
    { rootMargin: '-30% 0px -60% 0px' }
  );
  byId.forEach((_, id) => {
    const section = document.getElementById(id);
    if (section) observer.observe(section);
  });
}

links.forEach((a) => a.addEventListener('click', () => setCurrent(a.getAttribute('href').slice(1))));
setCurrent('about');