/* Runs before first paint: flags JS support, the motion preference and
   whether the first-visit intro should play (once per browser session). */
(function () {
  var root = document.documentElement;
  root.classList.remove('no-js');
  root.classList.add('js');

  var reduced = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  if (reduced) root.classList.add('reduced-motion');

  var seen = false;
  try {
    seen = window.sessionStorage.getItem('intro-seen') === '1';
  } catch (e) {
    seen = false;
  }
  if (!seen && !reduced) root.classList.add('intro-active');
})();
