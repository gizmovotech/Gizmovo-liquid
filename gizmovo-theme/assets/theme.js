/* ============================================================
   Gizmovo — theme.js
   Sticky header, mobile nav, search overlay, rails, product
   gallery/variants, and a fully working AJAX cart drawer.
   ============================================================ */
(function () {
  'use strict';

  var theme = window.theme || {};
  var routes = theme.routes || { cart_add: '/cart/add', cart_change: '/cart/change', cart: '/cart' };

  /* ---------- Money formatting (Shopify classic) ---------- */
  function formatMoney(cents, format) {
    if (typeof cents === 'string') cents = cents.replace('.', '');
    var value = '';
    var placeholderRegex = /\{\{\s*(\w+)\s*\}\}/;
    var fmt = format || theme.moneyFormat || '${{amount}}';
    function defaultTo(num, precision, thousands, decimal) {
      precision = isNaN(precision) ? 2 : precision;
      thousands = thousands || ',';
      decimal = decimal || '.';
      var num2 = (cents / 100.0).toFixed(precision);
      var parts = num2.split('.');
      var dollars = parts[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1' + thousands);
      var cts = parts[1] ? decimal + parts[1] : '';
      return dollars + cts;
    }
    switch ((fmt.match(placeholderRegex) || [])[1]) {
      case 'amount': value = defaultTo(2); break;
      case 'amount_no_decimals': value = defaultTo(0); break;
      case 'amount_with_comma_separator': value = defaultTo(2, '.', ','); break;
      case 'amount_no_decimals_with_comma_separator': value = defaultTo(0, '.', ','); break;
      case 'amount_with_space_separator': value = defaultTo(2, ' ', ','); break;
      case 'amount_no_decimals_with_space_separator': value = defaultTo(0, ' '); break;
      case 'amount_with_apostrophe_separator': value = defaultTo(2, "'"); break;
      default: value = defaultTo(2);
    }
    return fmt.replace(placeholderRegex, value);
  }

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  /* ============================================================
     STICKY HEADER
     ============================================================ */
  var header = $('#Header');
  var isTransparentHeader = header && header.classList.contains('header--transparent');
  function onScroll() {
    if (!header) return;
    if (window.scrollY > 12) header.classList.add('is-scrolled');
    else header.classList.remove('is-scrolled');
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ============================================================
     GENERIC OVERLAY OPEN / CLOSE
     ============================================================ */
  function openOverlay(el) {
    if (!el) return;
    el.classList.add('is-open');
    el.setAttribute('aria-hidden', 'false');
    document.body.classList.add('overflow-hidden');
  }
  function closeOverlay(el) {
    if (!el) return;
    el.classList.remove('is-open');
    el.setAttribute('aria-hidden', 'true');
    if (!$$('.overlay.is-open, .cart-drawer.is-open').length) {
      document.body.classList.remove('overflow-hidden');
    }
  }

  // Click handlers via data attributes
  document.addEventListener('click', function (e) {
    var openBtn = e.target.closest('[data-open]');
    if (openBtn) {
      e.preventDefault();
      openOverlay($('#' + openBtn.getAttribute('data-open')));
      var focusable = $('#' + openBtn.getAttribute('data-open') + ' input');
      if (focusable) setTimeout(function () { focusable.focus(); }, 250);
      return;
    }
    var closeBtn = e.target.closest('[data-close]');
    if (closeBtn) {
      e.preventDefault();
      closeOverlay(closeBtn.closest('.overlay, .cart-drawer'));
      return;
    }
    if (e.target.classList.contains('overlay__backdrop') || e.target.classList.contains('cart-drawer__backdrop')) {
      closeOverlay(e.target.closest('.overlay, .cart-drawer'));
    }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      $$('.overlay.is-open, .cart-drawer.is-open').forEach(closeOverlay);
    }
  });

  /* ============================================================
     PRODUCT RAILS — arrow controls
     ============================================================ */
  $$('[data-rail-wrap]').forEach(function (wrap) {
    var rail = $('[data-rail]', wrap);
    var prev = $('[data-rail-prev]', wrap);
    var next = $('[data-rail-next]', wrap);
    if (!rail) return;
    function amount() { return rail.clientWidth * 0.8; }
    function update() {
      if (!prev || !next) return;
      prev.disabled = rail.scrollLeft <= 4;
      next.disabled = rail.scrollLeft + rail.clientWidth >= rail.scrollWidth - 4;
    }
    if (prev) prev.addEventListener('click', function () { rail.scrollBy({ left: -amount(), behavior: 'smooth' }); });
    if (next) next.addEventListener('click', function () { rail.scrollBy({ left: amount(), behavior: 'smooth' }); });
    rail.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  });

  /* ============================================================
     PRODUCT GALLERY
     ============================================================ */
  $$('[data-gallery]').forEach(function (gallery) {
    var main = $('[data-gallery-main]', gallery);
    $$('[data-gallery-thumb]', gallery).forEach(function (thumb) {
      thumb.addEventListener('click', function () {
        var src = thumb.getAttribute('data-full');
        if (main && src) { main.src = src; }
        $$('[data-gallery-thumb]', gallery).forEach(function (t) { t.classList.remove('is-active'); });
        thumb.classList.add('is-active');
      });
    });
  });
  // Jump gallery to a variant's image
  function setGalleryImage(mediaId) {
    var thumb = $('[data-gallery-thumb][data-media-id="' + mediaId + '"]');
    if (thumb) thumb.click();
  }

  /* ============================================================
     PRODUCT VARIANTS
     ============================================================ */
  $$('[data-product-form]').forEach(function (form) {
    var dataEl = $('[data-variants-json]', form.closest('[data-product]') || document);
    if (!dataEl) return;
    var variants = JSON.parse(dataEl.textContent);
    var idInput = $('[data-variant-id]', form);
    var priceEl = $('[data-product-price]', form.closest('[data-product]'));
    var submitBtn = $('[data-add-to-cart]', form);

    function currentOptions() {
      return $$('[data-option-index]', form.closest('[data-product]')).map(function (group) {
        var checked = $('input:checked', group);
        return checked ? checked.value : null;
      });
    }
    function findVariant(opts) {
      return variants.find(function (v) {
        return opts.every(function (opt, i) { return v.options[i] === opt; });
      });
    }
    function update() {
      var opts = currentOptions();
      var variant = findVariant(opts);
      if (!variant) {
        if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = theme.strings.unavailable || 'Unavailable'; }
        return;
      }
      if (idInput) idInput.value = variant.id;
      if (priceEl) {
        var html = '<span class="price ' + (variant.compare_at_price > variant.price ? 'price--sale' : '') + '">' + formatMoney(variant.price) + '</span>';
        if (variant.compare_at_price > variant.price) {
          html += '<s class="price__compare">' + formatMoney(variant.compare_at_price) + '</s>';
        }
        priceEl.innerHTML = html;
      }
      if (submitBtn) {
        submitBtn.disabled = !variant.available;
        submitBtn.textContent = variant.available ? theme.strings.addToCart : theme.strings.soldOut;
      }
      if (variant.featured_media) setGalleryImage(variant.featured_media.id);
      var url = new URL(window.location);
      url.searchParams.set('variant', variant.id);
      window.history.replaceState({}, '', url);
    }
    $$('[data-option-index] input', form.closest('[data-product]')).forEach(function (input) {
      input.addEventListener('change', update);
    });
  });

  /* ============================================================
     QUANTITY STEPPERS
     ============================================================ */
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-qty-btn]');
    if (!btn) return;
    var wrap = btn.closest('.qty');
    var input = $('input', wrap);
    var val = parseInt(input.value, 10) || 1;
    val += btn.getAttribute('data-qty-btn') === 'plus' ? 1 : -1;
    if (val < (parseInt(input.min, 10) || 1)) val = parseInt(input.min, 10) || 1;
    input.value = val;
    input.dispatchEvent(new Event('change', { bubbles: true }));
  });

  /* ============================================================
     CART DRAWER (AJAX)
     ============================================================ */
  var drawer = $('#CartDrawer');
  var cartCountEls = $$('[data-cart-count]');

  function updateCartCount(count) {
    cartCountEls.forEach(function (el) {
      el.textContent = count;
      if (count > 0) el.removeAttribute('hidden'); else el.setAttribute('hidden', '');
    });
  }

  function renderCart(cart) {
    updateCartCount(cart.item_count);
    if (!drawer) return;
    var itemsEl = $('[data-cart-items]', drawer);
    var footEl = $('[data-cart-foot]', drawer);
    var emptyEl = $('[data-cart-empty]', drawer);

    if (cart.item_count === 0) {
      itemsEl.innerHTML = '';
      itemsEl.hidden = true;
      if (footEl) footEl.hidden = true;
      if (emptyEl) emptyEl.hidden = false;
      return;
    }
    itemsEl.hidden = false;
    if (emptyEl) emptyEl.hidden = true;
    if (footEl) footEl.hidden = false;

    itemsEl.innerHTML = cart.items.map(function (item) {
      var img = item.image ? item.image.replace(/(\.[^.]+)(\?.*)?$/, '_160x160$1$2') : '';
      var variant = (item.product_has_only_default_variant ? '' : item.variant_title) || '';
      return '' +
        '<div class="cart-item" data-line-item data-key="' + item.key + '">' +
          (img ? '<a href="' + item.url + '"><img class="cart-item__img" src="' + img + '" alt="' + item.title.replace(/"/g, '&quot;') + '" width="72" height="72" loading="lazy"></a>' : '<span class="cart-item__img"></span>') +
          '<div>' +
            '<a href="' + item.url + '" class="cart-item__title">' + item.product_title + '</a>' +
            (variant ? '<div class="cart-item__variant">' + variant + '</div>' : '<div class="cart-item__variant"></div>') +
            '<div class="cart-item__row">' +
              '<span class="qty">' +
                '<button type="button" data-qty-btn="minus" aria-label="Decrease">\u2212</button>' +
                '<input type="text" inputmode="numeric" value="' + item.quantity + '" data-qty-input min="0" aria-label="Quantity">' +
                '<button type="button" data-qty-btn="plus" aria-label="Increase">+</button>' +
              '</span>' +
              '<span class="cart-item__price">' + formatMoney(item.final_line_price) + '</span>' +
            '</div>' +
            '<div class="cart-item__row" style="margin-top:8px">' +
              '<button type="button" class="cart-item__remove" data-remove>' + (theme.strings.remove || 'Remove') + '</button>' +
            '</div>' +
          '</div>' +
        '</div>';
    }).join('');

    var subtotalEl = $('[data-cart-subtotal]', drawer);
    if (subtotalEl) subtotalEl.textContent = formatMoney(cart.total_price);
  }

  function fetchCart() {
    return fetch(routes.cart + '.js', { headers: { 'Accept': 'application/json' } })
      .then(function (r) { return r.json(); })
      .then(function (cart) { renderCart(cart); return cart; });
  }

  function addToCart(id, quantity, btn) {
    if (btn) { btn.classList.add('is-loading'); }
    return fetch(routes.cart_add + '.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ id: id, quantity: quantity || 1 })
    })
      .then(function (r) { return r.json().then(function (data) { return { ok: r.ok, data: data }; }); })
      .then(function (res) {
        if (!res.ok) { throw res.data; }
        return fetchCart();
      })
      .then(function () {
        openOverlay(drawer);
      })
      .catch(function (err) {
        alert((err && err.description) || 'Could not add to cart.');
      })
      .finally(function () { if (btn) btn.classList.remove('is-loading'); });
  }

  function changeLine(key, quantity) {
    if (drawer) $('[data-cart-items]', drawer).classList.add('is-loading');
    return fetch(routes.cart_change + '.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ id: key, quantity: quantity })
    })
      .then(function (r) { return r.json(); })
      .then(function (cart) { renderCart(cart); return cart; })
      .finally(function () { if (drawer) $('[data-cart-items]', drawer).classList.remove('is-loading'); });
  }

  // Intercept all add-to-cart forms (product page + cards)
  document.addEventListener('submit', function (e) {
    var form = e.target.closest('[data-cart-form], [data-product-form]');
    if (!form) return;
    e.preventDefault();
    var idInput = form.querySelector('[name="id"]');
    var qtyInput = form.querySelector('[name="quantity"]');
    if (!idInput || !idInput.value) return;
    var btn = form.querySelector('[type="submit"]');
    addToCart(idInput.value, qtyInput ? parseInt(qtyInput.value, 10) : 1, btn);
  });

  // Cart drawer line changes (qty + remove)
  if (drawer) {
    drawer.addEventListener('click', function (e) {
      var remove = e.target.closest('[data-remove]');
      if (remove) {
        var lineR = remove.closest('[data-line-item]');
        changeLine(lineR.getAttribute('data-key'), 0);
      }
    });
    drawer.addEventListener('change', function (e) {
      var input = e.target.closest('[data-qty-input]');
      if (!input) return;
      var line = input.closest('[data-line-item]');
      var q = parseInt(input.value, 10);
      if (isNaN(q) || q < 0) q = 0;
      changeLine(line.getAttribute('data-key'), q);
    });
  }

  // Prime the cart drawer with current state
  fetchCart();
})();
