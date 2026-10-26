// Minimal, dependency-free light/dark toggle for the worked HTML examples.
(function () {
  function current() {
    try { var s = localStorage.getItem('tiber-theme'); if (s) return s; } catch (e) {}
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  function apply(t) { document.documentElement.setAttribute('data-theme', t); }
  function label(t) { return t === 'dark' ? '☀︎ Light' : '☾︎ Dark'; }
  apply(current());
  document.addEventListener('DOMContentLoaded', function () {
    var btn = document.createElement('button');
    btn.className = 'toggle';
    btn.type = 'button';
    btn.textContent = label(current());
    btn.setAttribute('aria-label', 'Toggle colour theme');
    btn.addEventListener('click', function () {
      var next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      apply(next);
      try { localStorage.setItem('tiber-theme', next); } catch (e) {}
      btn.textContent = label(next);
    });
    document.body.appendChild(btn);
  });
})();
