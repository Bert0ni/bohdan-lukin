// TIBER-EU docs site: theme, mobile nav, and client-side search. No dependencies.
(function () {
  // ---- theme ----
  function curTheme() {
    try { var s = localStorage.getItem('tiber-theme'); if (s) return s; } catch (e) {}
    return (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light';
  }
  document.documentElement.setAttribute('data-theme', curTheme());

  document.addEventListener('DOMContentLoaded', function () {
    var tbtn = document.getElementById('themeBtn');
    function tlabel() { return document.documentElement.getAttribute('data-theme') === 'dark' ? '☀︎ Light' : '☾︎ Dark'; }
    if (tbtn) {
      tbtn.textContent = tlabel();
      tbtn.addEventListener('click', function () {
        var n = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', n);
        try { localStorage.setItem('tiber-theme', n); } catch (e) {}
        tbtn.textContent = tlabel();
      });
    }
    // ---- mobile nav ----
    var hamb = document.getElementById('hamb'), scrim = document.getElementById('scrim');
    function closeNav() { document.body.classList.remove('nav-open'); }
    if (hamb) hamb.addEventListener('click', function () { document.body.classList.toggle('nav-open'); });
    if (scrim) scrim.addEventListener('click', closeNav);

    // ---- search ----
    var input = document.getElementById('q'), box = document.getElementById('results');
    if (!input || !box) return;
    var base = document.body.getAttribute('data-base') || '';
    var idx = [], sel = -1, shown = [];
    if (window.TIBER_SEARCH) { idx = window.TIBER_SEARCH; }   // works over file://
    else {
      fetch(base + 'search-index.json').then(function (r) { return r.json(); }).then(function (d) { idx = d; })
        .catch(function () {/* search unavailable */ });
    }

    function esc(s) { return s.replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
    function snippet(text, terms) {
      var low = text.toLowerCase(), pos = -1;
      for (var i = 0; i < terms.length; i++) { var p = low.indexOf(terms[i]); if (p >= 0 && (pos < 0 || p < pos)) pos = p; }
      if (pos < 0) pos = 0;
      var start = Math.max(0, pos - 40), str = text.slice(start, start + 150);
      return (start > 0 ? '…' : '') + str + '…';
    }
    function render(q) {
      var terms = q.toLowerCase().split(/\s+/).filter(Boolean);
      shown = [];
      if (!terms.length) { box.classList.remove('open'); box.innerHTML = ''; return; }
      var scored = [], pageLang = document.body.getAttribute('data-lang') || 'en';
      for (var i = 0; i < idx.length; i++) {
        var it = idx[i];
        if (it.lang && it.lang !== pageLang) continue;   // show only current-language results
        var hay = (it.title + ' ' + it.category + ' ' + it.text).toLowerCase(), sc = 0, ok = true;
        for (var t = 0; t < terms.length; t++) {
          if (hay.indexOf(terms[t]) < 0) { ok = false; break; }
          if (it.title.toLowerCase().indexOf(terms[t]) >= 0) sc += 5;
          sc += 1;
        }
        if (ok) scored.push({ it: it, sc: sc });
      }
      scored.sort(function (a, b) { return b.sc - a.sc; });
      scored = scored.slice(0, 12);
      if (!scored.length) { box.innerHTML = '<div class="empty">No matches for “' + esc(q) + '”.</div>'; box.classList.add('open'); return; }
      var html = '';
      for (var j = 0; j < scored.length; j++) {
        var it = scored[j].it; shown.push(base + it.url);
        html += '<a href="' + base + it.url + '"><span class="c">' + esc(it.category) + '</span>' +
          '<div class="t">' + esc(it.title) + '</div><span class="s">' + esc(snippet(it.text, terms)) + '</span></a>';
      }
      box.innerHTML = html; box.classList.add('open'); sel = -1;
    }
    input.addEventListener('input', function () { render(input.value.trim()); });
    input.addEventListener('keydown', function (e) {
      var links = box.querySelectorAll('a');
      if (e.key === 'ArrowDown') { e.preventDefault(); sel = Math.min(sel + 1, links.length - 1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); sel = Math.max(sel - 1, 0); }
      else if (e.key === 'Enter') { if (sel >= 0 && links[sel]) location.href = links[sel].getAttribute('href'); return; }
      else if (e.key === 'Escape') { box.classList.remove('open'); input.blur(); return; }
      else return;
      links.forEach(function (a, i) { a.classList.toggle('sel', i === sel); if (i === sel) a.scrollIntoView({ block: 'nearest' }); });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === '/' && document.activeElement !== input) { e.preventDefault(); input.focus(); }
    });
    document.addEventListener('click', function (e) { if (!box.contains(e.target) && e.target !== input) box.classList.remove('open'); });
  });
})();
