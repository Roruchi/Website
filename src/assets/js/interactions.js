(function () {
  'use strict';

  if (window.zenInteractionsLoaded) return;
  window.zenInteractionsLoaded = true;

  var STORAGE_PREFIX = 'zen-interactions:';

  function read(key, fallback) {
    try {
      var value = window.localStorage.getItem(STORAGE_PREFIX + key);
      return value === null ? fallback : JSON.parse(value);
    } catch (_) {
      return fallback;
    }
  }

  function write(key, value) {
    try {
      window.localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
    } catch (_) {
      // The interaction still works for this page view when storage is blocked.
    }
  }

  function visitorId() {
    var id = read('visitor', '');
    if (id) return id;
    id = window.crypto && window.crypto.randomUUID
      ? window.crypto.randomUUID()
      : String(Date.now()) + '-' + Math.random().toString(36).slice(2);
    write('visitor', id);
    return id;
  }

  function apiUrl(element) {
    return (element.getAttribute('data-api-url') || '').replace(/\/+$/, '');
  }

  function localCount(type, key) {
    return Number(read('count:' + type + ':' + key, 0)) || 0;
  }

  function setLocalCount(type, key, count) {
    write('count:' + type + ':' + key, count);
  }

  function renderCount(element, count) {
    if (element) element.textContent = Number(count || 0).toLocaleString();
  }

  async function fetchCount(base, type, key) {
    if (!base) throw new Error('Interaction API is not configured');
    var response = await fetch(base + '/v1/counts/' + encodeURIComponent(type) + '/' + encodeURIComponent(key));
    if (!response.ok) throw new Error('Could not load interaction count');
    return response.json();
  }

  async function record(base, type, key) {
    if (!base) throw new Error('Interaction API is not configured');
    var response = await fetch(base + '/v1/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: type, key: key, visitorId: visitorId() }),
    });
    if (!response.ok) throw new Error('Could not record interaction');
    return response.json();
  }

  function initFeedCounter() {
    var wrapper = document.querySelector('[data-interaction-count="feed"]');
    if (!wrapper) return;

    var value = wrapper.querySelector('[data-count-value]');
    var countLabel = wrapper.querySelector('[data-count-label]');
    var base = apiUrl(wrapper);
    var key = 'home';
    var count = localCount('feed', key);
    function render() {
      renderCount(value, count);
      countLabel.textContent = count === 1 ? 'feeding' : 'feedings';
    }
    render();

    fetchCount(base, 'feed', key).then(function (result) {
      count = result.count;
      setLocalCount('feed', key, count);
      render();
    }).catch(function () {});

    window.addEventListener('pond:fed', function () {
      var today = new Date().toISOString().slice(0, 10);
      if (read('feed-day', '') === today) return;

      write('feed-day', today);
      count += 1;
      setLocalCount('feed', key, count);
      render();

      record(base, 'feed', key).then(function (result) {
        count = result.count;
        setLocalCount('feed', key, count);
        render();
      }).catch(function () {
        write('pending:feed:' + key, true);
      });
    });

    if (read('pending:feed:' + key, false)) {
      record(base, 'feed', key).then(function (result) {
        write('pending:feed:' + key, false);
        setLocalCount('feed', key, result.count);
        count = result.count;
        render();
      }).catch(function () {});
    }
  }

  function initRipple() {
    var panel = document.querySelector('[data-ripple-panel]');
    if (!panel) return;

    var key = panel.getAttribute('data-article-key');
    var base = apiUrl(panel);
    var button = panel.querySelector('[data-ripple-button]');
    var label = panel.querySelector('[data-ripple-label]');
    var value = panel.querySelector('[data-ripple-count]');
    var countLabel = panel.querySelector('[data-ripple-label-count]');
    var givenKey = 'ripple-given:' + key;
    var given = read(givenKey, false);
    var count = localCount('ripple', key);

    function render() {
      renderCount(value, count);
      countLabel.textContent = count === 1 ? 'ripple' : 'ripples';
      button.setAttribute('aria-pressed', String(given));
      button.classList.toggle('is-given', given);
      label.textContent = given ? 'Ripple left' : 'Leave a ripple';
    }

    render();
    fetchCount(base, 'ripple', key).then(function (result) {
      count = result.count;
      setLocalCount('ripple', key, count);
      render();
    }).catch(function () {});

    button.addEventListener('click', function () {
      if (given) return;
      given = true;
      count += 1;
      write(givenKey, true);
      setLocalCount('ripple', key, count);
      render();

      record(base, 'ripple', key).then(function (result) {
        count = result.count;
        setLocalCount('ripple', key, count);
        render();
      }).catch(function () {
        write('pending:ripple:' + key, true);
      });
    });

    if (read('pending:ripple:' + key, false)) {
      record(base, 'ripple', key).then(function (result) {
        write('pending:ripple:' + key, false);
        setLocalCount('ripple', key, result.count);
        count = result.count;
        render();
      }).catch(function () {});
    }
  }

  initFeedCounter();
  initRipple();
})();
