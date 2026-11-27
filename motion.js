(() => {
  if (!('IntersectionObserver' in window)) return;

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const scenes = [...document.querySelectorAll('#home, #experience, #projects, #contact')];
  const visible = new Set();

  function sync() {
    for (const scene of scenes) {
      const play = visible.has(scene) && !document.hidden && !reducedMotion.matches && !scene.inert;
      if (play) scene.dataset.motion = 'enter';
      else delete scene.dataset.motion;
    }
  }

  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.isIntersecting) visible.add(entry.target);
      else visible.delete(entry.target);
    }
    sync();
  }, { rootMargin: '-8% 0px -18% 0px' });

  for (const scene of scenes) observer.observe(scene);
  document.addEventListener('visibilitychange', sync);
  document.addEventListener('portfolio:chapter-change', sync);
  reducedMotion.addEventListener('change', sync);
})();
