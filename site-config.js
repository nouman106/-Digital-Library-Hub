(function () {
  async function applySiteConfig() {
    let config = null;

    // 1. GitHub se site-config.json load karo
    try {
      const res = await fetch('site-config.json?t=' + Date.now());
      if (res.ok) config = await res.json();
    } catch (e) {}

    // 2. Fallback: localStorage
    if (!config) {
      try {
        const local = localStorage.getItem('kg_settings');
        if (local) config = JSON.parse(local);
      } catch (e) {}
    }

    if (!config) return;
    applyConfig(config);
  }

  function applyConfig(c) {
    if (!c) return;

    const page = document.body.dataset.page; // 'index' | 'reader' | 'book'

    // ── Site Name ──
    if (c.siteName) {
      document.querySelectorAll('.kg-site-name').forEach(el => {
        el.textContent = c.siteName;
      });
      if (document.title)
        document.title = document.title.replace(/KitabGhar/g, c.siteName);
    }

    // ── Tagline ──
    if (c.siteTagline) {
      document.querySelectorAll('.kg-tagline').forEach(el => {
        el.textContent = c.siteTagline;
      });
    }

    // ── Logo ──
    if (c.logoUrl) {
      document.querySelectorAll('.kg-logo-img').forEach(img => {
        img.src = c.logoUrl;
        img.style.height = (c.logoHeight || 40) + 'px';
        img.style.display = 'inline-block';
        img.style.verticalAlign = 'middle';
      });
      document.querySelectorAll('.kg-logo-text').forEach(el => {
        if (c.logoUrl) el.style.display = 'none';
      });
    }

    // ── Announcement Bar ──
    const bar = document.getElementById('announcement-bar');
    if (bar) {
      const ann = c.announcement;
      if (ann && ann.enabled) {
        bar.style.display = 'block';
        bar.style.background = ann.bgColor || '#7c3aed';
        bar.style.color = ann.textColor || '#fff';
        bar.style.padding = '9px 16px';
        bar.style.fontSize = '.88rem';
        bar.style.textAlign = 'center';
        bar.style.position = 'relative';

        let html = (ann.icon ? ann.icon + ' ' : '') + (ann.text || '');
        if (ann.link) {
          html += ` <a href="${ann.link}" style="color:inherit;font-weight:bold;margin-left:6px">${ann.linkText || 'Dekhen →'}</a>`;
        }
        if (ann.dismissible) {
          html += `<span onclick="this.parentElement.style.display='none'" style="cursor:pointer;position:absolute;right:14px;top:50%;transform:translateY(-50%);opacity:.7;font-size:1rem">✕</span>`;
        }
        bar.innerHTML = html;
      } else {
        bar.style.display = 'none';
      }
    }

    // ── CSS Colors ──
    if (c.colors) {
      if (c.colors.primary) {
        document.documentElement.style.setProperty('--primary', c.colors.primary);
        document.documentElement.style.setProperty('--primary2', c.colors.primary);
      }
      if (c.colors.secondary)
        document.documentElement.style.setProperty('--secondary', c.colors.secondary);
      if (c.colors.bg)
        document.documentElement.style.setProperty('--bg', c.colors.bg);
      if (c.colors.text)
        document.documentElement.style.setProperty('--text', c.colors.text);
    }

    // ── Homepage Background ──
    if (page === 'index' && c.homepage) {
      applyBackground(document.body, c.homepage);

      // Hero section
      const hero = document.querySelector('.hero');
      if (hero && c.homepage.heroGrad1 && c.homepage.heroGrad2) {
        hero.style.background = `linear-gradient(135deg, ${c.homepage.heroGrad1}, ${c.homepage.heroGrad2})`;
      }
    }

    // ── Reader Background ──
    if (page === 'reader' && c.reader) {
      applyBackground(document.body, c.reader);
      const container = document.getElementById('pdf-container');
      if (container) applyBackground(container, c.reader);
    }

    // ── Book Page Background ──
    if (page === 'book' && c.bookPage) {
      applyBackground(document.body, c.bookPage);
    }

    // ── Footer text ──
    if (c.footerText) {
      document.querySelectorAll('.kg-footer').forEach(el => {
        el.textContent = c.footerText;
      });
    }
  }

  function applyBackground(el, bg) {
    if (!bg || !bg.bgType) return;
    if (bg.bgType === 'color' && bg.bgColor) {
      el.style.background = bg.bgColor;
    } else if (bg.bgType === 'gradient') {
      const dir = bg.gradDir || '135deg';
      const c1 = bg.gradColor1 || '#0a0a1a';
      const c2 = bg.gradColor2 || '#1a1050';
      el.style.background = `linear-gradient(${dir}, ${c1}, ${c2})`;
    } else if (bg.bgType === 'image' && bg.bgImageUrl) {
      el.style.backgroundImage = `url(${bg.bgImageUrl})`;
      el.style.backgroundSize = bg.bgSize || 'cover';
      el.style.backgroundPosition = bg.bgPos || 'center';
      el.style.backgroundAttachment = 'fixed';
      el.style.backgroundRepeat = 'no-repeat';
      // Dark overlay
      if (bg.bgOverlay && parseFloat(bg.bgOverlay) > 0) {
        el.style.position = 'relative';
        const overlayId = 'kg-bg-overlay';
        if (!document.getElementById(overlayId)) {
          const ov = document.createElement('div');
          ov.id = overlayId;
          ov.style.cssText = `position:fixed;inset:0;background:rgba(0,0,0,${bg.bgOverlay});pointer-events:none;z-index:0`;
          document.body.insertBefore(ov, document.body.firstChild);
        }
      }
    }
  }

  // Run after DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applySiteConfig);
  } else {
    applySiteConfig();
  }
})();
