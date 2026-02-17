document.addEventListener('DOMContentLoaded', () => {
  // Mobile menu toggle
  const toggle = document.getElementById('menu-toggle');
  const menu = document.getElementById('mobile-menu');
  const openIcon = document.getElementById('menu-open-icon');
  const closeIcon = document.getElementById('menu-close-icon');

  if (toggle) {
    toggle.addEventListener('click', () => {
      const open = menu.classList.toggle('hidden');
      toggle.setAttribute('aria-expanded', !open);
      openIcon.classList.toggle('hidden');
      closeIcon.classList.toggle('hidden');
    });

    menu.querySelectorAll('.mobile-nav-link').forEach(link => {
      link.addEventListener('click', () => {
        menu.classList.add('hidden');
        toggle.setAttribute('aria-expanded', 'false');
        openIcon.classList.remove('hidden');
        closeIcon.classList.add('hidden');
      });
    });
  }

  // Navbar solid background on scroll
  const navbar = document.getElementById('navbar');
  if (navbar) {
    const onScroll = () => navbar.classList.toggle('scrolled', window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // Scroll reveal + stagger reveal
  if ('IntersectionObserver' in window) {
    document.documentElement.classList.add('js-ready');

    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.scroll-reveal, .stagger-reveal').forEach(el => {
      revealObserver.observe(el);
    });
  }

  // Parallax on hero image
  const parallaxImg = document.querySelector('.parallax-img');
  if (parallaxImg) {
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      if (y < window.innerHeight) {
        parallaxImg.style.transform = `translateY(${y * 0.15}px)`;
      }
    }, { passive: true });
  }

  // 3D card tilt on hover
  document.querySelectorAll('.tilt-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(600px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

  // Animated counter
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseFloat(el.dataset.target);
      const suffix = el.dataset.suffix || '';
      const decimals = parseInt(el.dataset.decimals || '0', 10);
      const duration = 1500;
      const start = performance.now();

      const tick = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const val = target * eased;
        el.textContent = (decimals ? (val / Math.pow(10, decimals)).toFixed(decimals) : Math.round(val)) + suffix;
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      counterObserver.unobserve(el);
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.counter-value').forEach(el => counterObserver.observe(el));

  // Floating fruits — sine-wave driven for organic motion (only on pages with data-fruits)
  if (!document.body.dataset.fruits) return;
  const fruitFiles = ['g5.svg', 'g10.svg', 'g22.svg', 'g33.svg', 'g50.svg', 'g59.svg', 'g74.svg'];
  const basePath = (document.querySelector('meta[name="base-url"]')?.content || '') + '/assets/images/fruits/';
  const rand = (min, max) => Math.random() * (max - min) + min;
  const shuffle = arr => [...arr].sort(() => Math.random() - 0.5);
  const allFruits = [];

  const sections = document.querySelectorAll('section.relative.overflow-hidden');
  const activeIdx = new Set([1, 3, 5]);
  sections.forEach((section, si) => {
    if (!activeIdx.has(si)) return;

    // Pull section up to overlap with previous wave, then clip at the curve
    const prev = sections[si - 1];
    const prevWavePath = prev?.querySelector('.wave-divider.bottom path');
    if (prevWavePath) {
      const prevWaveSvg = prevWavePath.closest('svg');
      const actualWaveH = prevWaveSvg.getBoundingClientRect().height;
      const waveH = Math.ceil(actualWaveH) + 1;
      const curPT = parseInt(getComputedStyle(section).paddingTop);
      section.style.marginTop = `-${waveH}px`;
      section.style.paddingTop = `${curPT + waveH}px`;

      const d = prevWavePath.getAttribute('d');
      const m = d.match(/M([\d.]+),([\d.]+)\s*C([\d.]+),([\d.]+)\s+([\d.]+),([\d.]+)\s+([\d.]+),([\d.]+)/);
      if (m) {
        const sH = section.offsetHeight;
        const yScale = actualWaveH / 70;
        const nx = v => (v / 1440).toFixed(4);
        const ny = v => (Math.max(0, v * yScale - 3) / sH).toFixed(4);
        const ns = 'http://www.w3.org/2000/svg';
        const svg = document.createElementNS(ns, 'svg');
        svg.style.cssText = 'position:absolute;width:0;height:0;';
        const cp = document.createElementNS(ns, 'clipPath');
        cp.id = `fc${si}`;
        cp.setAttribute('clipPathUnits', 'objectBoundingBox');
        const p = document.createElementNS(ns, 'path');
        p.setAttribute('d', `M${nx(m[1])} ${ny(m[2])} C${nx(m[3])} ${ny(m[4])} ${nx(m[5])} ${ny(m[6])} ${nx(m[7])} ${ny(m[8])} L1 1 L0 1 Z`);
        cp.appendChild(p);
        svg.appendChild(cp);
        section.appendChild(svg);
        section.style.clipPath = `url(#fc${si})`;
        section.style.transform = 'translateZ(0)';
      }
    }

    const mobile = window.innerWidth < 768;
    const cols = mobile ? 6 : 6, rows = mobile ? 10 : 4, count = cols * rows;
    const colW = 100 / cols;
    const rowH = 100 / rows;
    const shuffled = shuffle(fruitFiles);
    const picked = Array.from({ length: count }, (_, i) => shuffled[i % shuffled.length]);

    picked.forEach((fruit, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const img = document.createElement('img');
      img.src = basePath + fruit;
      img.alt = '';
      img.className = 'floating-fruit';
      img.loading = 'lazy';
      const size = mobile ? rand(30, 55) : rand(60, 110);
      img.style.width = size + 'px';
      img.style.height = 'auto';
      img.style.top = (-5 + rowH * row + rand(0, rowH - 5)) + '%';
      img.style.left = (colW * col + rand(0, colW - 5)) + '%';
      section.appendChild(img);

      const range = 50;
      const rp = () => ({ x: rand(-range, range), y: rand(-range, range) });
      const pts = [{ x: 0, y: 0 }, rp(), rp(), rp()];
      allFruits.push({
        el: img, pts, t: 0, r: rand(0, 360),
        rSpeed: rand(-0.2, 0.2),
        seg: rand(2000, 4000), rp,
      });
    });
  });

  // Catmull-Rom: smooth curve through p1→p2 using p0,p3 as tangent guides
  const catmull = (p0, p1, p2, p3, t) => {
    const t2 = t * t, t3 = t2 * t;
    return 0.5 * ((2 * p1) + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3);
  };

  if (allFruits.length) {
    let last = performance.now();
    const tick = (now) => {
      const dt = now - last;
      last = now;
      for (const f of allFruits) {
        f.t += dt / f.seg;
        if (f.t >= 1) {
          f.pts.shift();
          f.pts.push(f.rp());
          f.t -= 1;
          f.seg = rand(2000, 4000);
        }
        const [p0, p1, p2, p3] = f.pts;
        const x = catmull(p0.x, p1.x, p2.x, p3.x, f.t);
        const y = catmull(p0.y, p1.y, p2.y, p3.y, f.t);
        f.r += f.rSpeed;
        f.el.style.transform = `translate(${x}px, ${y}px) rotate(${f.r}deg)`;
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }
});
