/**
 * theme-modern-core.js
 * Modern OS 2.0 ES6 Vanilla Javascript Architecture
 */

// 1. Core Utilities
window.Theme = {
  moneyFormat: '${{amount}}',
  formatMoney: (cents, format) => {
    if (typeof cents === 'string') cents = cents.replace('.', '');
    let value = '';
    let placeholderRegex = /\{\{\s*(\w+)\s*\}\}/;
    let formatString = format || window.Theme.moneyFormat;

    function formatWithDelimiters(number) {
      if (isNaN(number) || number == null) return 0;
      number = (number / 100).toFixed(2);
      let parts = number.split('.');
      let dollarsAmount = parts[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
      let centsAmount = parts[1] ? '.' + parts[1] : '';
      return dollarsAmount + centsAmount;
    }

    switch (formatString.match(placeholderRegex)[1]) {
      case 'amount': value = formatWithDelimiters(cents); break;
      case 'amount_no_decimals': value = formatWithDelimiters(cents).replace('.00', ''); break;
    }
    return formatString.replace(placeholderRegex, value);
  }
};

// 2. Global Custom Elements

/**
 * NativeSlider - Native CSS Scroll Snap Slider
 * Replaces legacy TNS slider.
 * Reads config via data attributes or properties.
 */
class NativeSlider extends HTMLElement {
  constructor() {
    super();
    this.track = this.querySelector('.slider-list, .slider-track');
    this.slides = this.track ? Array.from(this.track.children) : [];
    this.nextBtn = this.querySelector('.slider-next-button');
    this.prevBtn = this.querySelector('.slider-prev-button');
    this.dotsContainer = this.querySelector('.slider-dots');
    
    this.isRTL = document.documentElement.dir === 'rtl';
    
    // Config
    this.autoplay = this.hasAttribute('data-autoplay') ? this.getAttribute('data-autoplay') === 'true' : false;
    this.autoplayTimeout = parseInt(this.getAttribute('data-autoplay-timeout')) || 5000;
  }

  connectedCallback() {
    if (!this.track || this.slides.length === 0) return;
    
    // Core CSS
    this.track.style.display = 'flex';
    this.track.style.overflowX = 'auto';
    this.track.style.scrollSnapType = 'x mandatory';
    this.track.style.scrollbarWidth = 'none'; // Firefox
    this.track.style.scrollBehavior = 'smooth';
    this.track.style.webkitOverflowScrolling = 'touch';
    this.track.style.msOverflowStyle = 'none'; // IE 10+
    
    // Hide Webkit scrollbar
    const style = document.createElement('style');
    style.innerHTML = `
      ${this.tagName.toLowerCase()} .slider-list::-webkit-scrollbar,
      ${this.tagName.toLowerCase()} .slider-track::-webkit-scrollbar {
        display: none;
      }
    `;
    this.prepend(style);

    this.slides.forEach(slide => {
      slide.style.scrollSnapAlign = 'start';
      slide.style.flexShrink = '0';
    });
    
    this.setupControls();
    this.setupDots();
    
    // Sync buttons on scroll
    this.track.addEventListener('scroll', this.debounce(() => {
      this.updateControls();
      this.updateDots();
    }, 100));
    
    window.addEventListener('resize', this.debounce(this.updateControls.bind(this), 200));

    if (this.autoplay) this.startAutoplay();

    // Mark ready
    this.classList.add('slider-initialized');
    this.updateControls();
  }

  setupControls() {
    if (this.nextBtn) this.nextBtn.addEventListener('click', () => this.scrollByItems(1));
    if (this.prevBtn) this.prevBtn.addEventListener('click', () => this.scrollByItems(-1));
  }
  
  setupDots() {
    if (!this.dotsContainer) return;
    this.dotsContainer.innerHTML = '';
    this.slides.forEach((_, index) => {
      const dot = document.createElement('button');
      dot.className = 'slider-dot ' + (index === 0 ? 'active' : '');
      dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
      dot.addEventListener('click', () => this.scrollToIndex(index));
      this.dotsContainer.appendChild(dot);
    });
  }

  updateControls() {
    if (!this.nextBtn && !this.prevBtn) return;
    
    const scrollLeft = Math.abs(this.track.scrollLeft);
    const maxScroll = this.track.scrollWidth - this.track.clientWidth;
    const isEnd = scrollLeft >= maxScroll - 5;
    const isStart = scrollLeft <= 5;

    if (this.prevBtn) this.prevBtn.disabled = isStart;
    if (this.nextBtn) this.nextBtn.disabled = isEnd;

    // Hide controls if arrows aren't needed
    if (this.track.scrollWidth <= this.track.clientWidth) {
      if (this.nextBtn) this.nextBtn.style.display = 'none';
      if (this.prevBtn) this.prevBtn.style.display = 'none';
    } else {
      if (this.nextBtn) this.nextBtn.style.display = '';
      if (this.prevBtn) this.prevBtn.style.display = '';
    }
  }
  
  updateDots() {
    if (!this.dotsContainer) return;
    const scrollLeft = Math.abs(this.track.scrollLeft);
    const slideWidth = this.slides[0].clientWidth;
    const currentIndex = Math.round(scrollLeft / slideWidth);
    
    Array.from(this.dotsContainer.children).forEach((dot, index) => {
      dot.classList.toggle('active', index === currentIndex);
    });
  }

  scrollByItems(direction) {
    const slideWidth = this.slides[0].clientWidth;
    const scrollAmount = slideWidth * direction * (this.isRTL ? -1 : 1);
    this.track.scrollLeft += scrollAmount;
  }
  
  scrollToIndex(index) {
    const slideWidth = this.slides[0].clientWidth;
    const scrollAmount = Math.max(0, slideWidth * index);
    this.track.scrollLeft = scrollAmount * (this.isRTL ? -1 : 1);
  }

  startAutoplay() {
    this.autoplayInterval = setInterval(() => {
      const scrollLeft = Math.abs(this.track.scrollLeft);
      const maxScroll = this.track.scrollWidth - this.track.clientWidth;
      
      if (scrollLeft >= maxScroll - 5) {
        // Loop back
        this.track.scrollLeft = 0;
      } else {
        this.scrollByItems(1);
      }
    }, this.autoplayTimeout);

    this.addEventListener('mouseenter', () => clearInterval(this.autoplayInterval));
    this.addEventListener('mouseleave', () => this.startAutoplay());
  }

  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
}
customElements.define('native-slider', NativeSlider);


/**
 * VariantSelect - Drop-in replacement for the product-page variant handler
 */
class VariantSelect extends HTMLElement {
  constructor() {
    super();
    this.addEventListener('change', this.onVariantChange);
  }

  onVariantChange(event) {
    this.updateOptions();
    this.updateMasterId();
    this.updateURL();
    this.updateVariantUI();
  }

  updateOptions() {
    // Gather values from both <select> dropdowns and checked radio buttons in DOM order
    this.options = Array.from(this.querySelectorAll('select.js-option-item, input[type="radio"].js-option-item:checked'), (node) => node.value);
  }

  updateMasterId() {
    this.currentVariant = this.getVariantData().find((variant) => {
      return !variant.options.map((option, index) => {
        return this.options[index] === option;
      }).includes(false);
    });
    
    // Update the master hidden select ID for the form submission
    const form = this.closest('form');
    if (form) {
      const masterSelect = form.querySelector('[name="id"]');
      if (masterSelect && this.currentVariant) {
        masterSelect.value = this.currentVariant.id;
      }
    }

    // Fire event for detailed UI updates (price, button, etc)
    this.dispatchEvent(new CustomEvent('variant:change', { 
      bubbles: true, 
      detail: { variant: this.currentVariant }
    }));
  }

  updateVariantUI() {
    if (!this.currentVariant) return;

    // Optional: automatically update price and ATC button inside the specific section
    const section = this.closest('.shopify-section') || document;
    
    const priceEl = section.querySelector('.js-price');
    const comparePriceEl = section.querySelector('.js-price-compare');
    const atcBtn = section.querySelector('.js-atc-btn');

    if (priceEl) {
      priceEl.innerHTML = window.Theme.formatMoney(this.currentVariant.price);
    }

    if (comparePriceEl) {
      if (this.currentVariant.compare_at_price > this.currentVariant.price) {
        comparePriceEl.innerHTML = window.Theme.formatMoney(this.currentVariant.compare_at_price);
        comparePriceEl.classList.remove('d-none');
      } else {
        comparePriceEl.classList.add('d-none');
      }
    }

    if (atcBtn) {
      const atcText = atcBtn.querySelector('span');
      if (this.currentVariant.available) {
        atcBtn.disabled = false;
        if(atcText) atcText.textContent = window.theme_translations?.add_to_cart || "Add to cart";
      } else {
        atcBtn.disabled = true;
        if(atcText) atcText.textContent = window.theme_translations?.sold_out || "Sold out";
      }
    }
  }

  updateURL() {
    if (!this.currentVariant || this.dataset.updateUrl === 'false') return;
    const url = new URL(window.location.href);
    url.searchParams.set('variant', this.currentVariant.id);
    window.history.replaceState({ }, '', url.toString());
  }

  getVariantData() {
    this.variantData = this.variantData || JSON.parse(this.querySelector('[type="application/json"]').textContent);
    return this.variantData;
  }
}
customElements.define('variant-select', VariantSelect);


/**
 * QuantityInput - Standard OS 2.0 quantity stepper
 */
class QuantityInput extends HTMLElement {
  constructor() {
    super();
    this.input = this.querySelector('input');
    this.changeEvent = new Event('change', { bubbles: true });

    this.querySelectorAll('button').forEach((button) => {
      button.addEventListener('click', this.onButtonClick.bind(this));
    });
  }

  onButtonClick(event) {
    event.preventDefault();
    const previousValue = this.input.value;
    if (event.target.name === 'plus' || event.target.closest('button').name === 'plus') {
      this.input.stepUp();
    } else {
      this.input.stepDown();
    }
    if (previousValue !== this.input.value) this.input.dispatchEvent(this.changeEvent);
  }
}
customElements.define('quantity-input', QuantityInput);


/**
 * Ajax Cart Interceptor - Replaces legacy jQuery Cart
 */
document.addEventListener('submit', (event) => {
  const form = event.target;
  if (!form.matches('.js-form-add-to-cart, .js-bundledAddToCart')) return;

  event.preventDefault();
  const submitBtn = form.querySelector('[type="submit"], button[name="add"]');
  const originalText = submitBtn ? submitBtn.innerHTML : '';
  
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = window.theme_translations?.adding_to_cart || "Adding...";
  }

  const formData = new FormData(form);

  fetch(window.Shopify.routes?.root + 'cart/add.js', {
    method: 'POST',
    body: formData,
    headers: {
      'X-Requested-With': 'XMLHttpRequest'
    }
  })
  .then((response) => response.json())
  .then((data) => {
    // If successful, open cart drawer or redirect
    console.log("Added to Cart!", data);
    if(window.theme?.openCartDrawer) {
       window.theme.openCartDrawer();
    } else {
       // fallback trigger mini-cart
       const cartIcon = document.querySelector('.header-cart');
       if(cartIcon) {
         cartIcon.click();
       } else {
         window.location.href = window.Shopify.routes?.root + 'cart';
       }
    }
  })
  .catch((error) => {
    console.error('Error adding to cart:', error);
    alert(window.theme_translations?.error_adding || 'Failed to add item to cart.');
  })
  .finally(() => {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }
  });
});
