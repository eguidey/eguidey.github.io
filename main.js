// Dark/light toggle
(function () {
  var btn = document.querySelector('.theme-toggle');
  if (!btn) return;
  btn.addEventListener('click', function () {
    var root = document.documentElement;
    var isDark = root.dataset.theme
      ? root.dataset.theme === 'dark'
      : window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.dataset.theme = isDark ? 'light' : 'dark';
    try { localStorage.setItem('theme', root.dataset.theme); } catch (e) {}
  });
})();

// "Recently Viewed" list (stored in the visitor's own browser)
(function () {
  var KEY = 'recentlyViewed';
  var list = [];
  try { list = JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) {}

  var post = document.querySelector('article.post[data-url]');
  if (post) {
    var entry = { title: post.dataset.title, url: post.dataset.url };
    list = list.filter(function (p) { return p.url !== entry.url; });
    list.unshift(entry);
    list = list.slice(0, 5);
    try { localStorage.setItem(KEY, JSON.stringify(list)); } catch (e) {}
  }

  var ol = document.getElementById('recently-viewed');
  if (!ol || !list.length) return;
  ol.innerHTML = '';
  list.forEach(function (p) {
    var li = document.createElement('li');
    var a = document.createElement('a');
    a.href = p.url;
    a.textContent = p.title;
    li.appendChild(a);
    ol.appendChild(li);
  });
})();
