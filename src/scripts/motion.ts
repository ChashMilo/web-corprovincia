import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

const root = document.documentElement;
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

declare global {
  interface Window {
    __motionReady?: boolean;
    __lenis?: Lenis;
  }
}

/* ── Partir texto en palabras (respeta elementos internos) ── */
function splitWords(el: HTMLElement): HTMLElement[] {
  if (el.dataset.splitDone) return [...el.querySelectorAll<HTMLElement>('.split-i')];
  const inners: HTMLElement[] = [];
  const walk = (node: Node) => {
    [...node.childNodes].forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        const parts = (child.textContent || '').split(/(\s+)/);
        const frag = document.createDocumentFragment();
        parts.forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) {
            frag.appendChild(document.createTextNode(' '));
            return;
          }
          const w = document.createElement('span');
          w.className = 'split-w';
          const i = document.createElement('span');
          i.className = 'split-i';
          i.textContent = part;
          w.appendChild(i);
          frag.appendChild(w);
          inners.push(i);
        });
        child.parentNode?.replaceChild(frag, child);
      } else if (child.nodeType === Node.ELEMENT_NODE && (child as HTMLElement).tagName !== 'BR') {
        walk(child);
      }
    });
  };
  walk(el);
  el.dataset.splitDone = '1';
  return inners;
}

function showEverything() {
  root.classList.add('motion-off');
}

function init() {
  if (reduced) {
    showEverything();
    initHeader(null);
    return;
  }

  /* ── Scroll suave ── */
  const lenis = new Lenis({ duration: 1.15, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
  window.__lenis = lenis;
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  // Enlaces internos (#ancla) con scroll suave
  document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target as HTMLElement, { offset: -90 });
      history.replaceState(null, '', id);
    });
  });

  initHeader(lenis);

  /* ── Titulares partidos en palabras ── */
  document.querySelectorAll<HTMLElement>('[data-split]').forEach((el) => {
    const words = splitWords(el);
    gsap.set(el, { visibility: 'visible' });
    const onLoad = el.dataset.split === 'load';
    const delay = parseFloat(el.dataset.delay || '0');
    gsap.from(words, {
      yPercent: 115,
      rotate: 4,
      duration: 1.2,
      ease: 'expo.out',
      stagger: 0.06,
      delay: onLoad ? 0.15 + delay : delay,
      scrollTrigger: onLoad ? undefined : { trigger: el, start: 'top 88%', once: true },
    });
  });

  /* ── Aparición al hacer scroll ── */
  ScrollTrigger.batch('[data-reveal]', {
    start: 'top 90%',
    once: true,
    onEnter: (batch) =>
      gsap.fromTo(
        batch,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 1.1, ease: 'expo.out', stagger: 0.08, overwrite: true }
      ),
  });

  /* ── Imágenes que se descubren de abajo hacia arriba ── */
  document.querySelectorAll<HTMLElement>('[data-clip]').forEach((el) => {
    const img = el.querySelector('img');
    const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 85%', once: true } });
    tl.fromTo(el, { clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0% 0 0 0)', duration: 1.3, ease: 'expo.inOut' });
    if (img) tl.from(img, { scale: 1.25, duration: 1.6, ease: 'expo.out' }, 0.1);
  });

  /* ── Parallax ── */
  document.querySelectorAll<HTMLElement>('[data-parallax]').forEach((el) => {
    const amount = parseFloat(el.dataset.parallax || '15');
    gsap.fromTo(
      el,
      { yPercent: -amount },
      {
        yPercent: amount,
        ease: 'none',
        scrollTrigger: { trigger: el.parentElement || el, start: 'top bottom', end: 'bottom top', scrub: true },
      }
    );
  });

  /* ── Texto que se ilumina palabra por palabra al hacer scroll ── */
  document.querySelectorAll<HTMLElement>('[data-scrub-text]').forEach((el) => {
    const words = splitWords(el);
    el.querySelectorAll('.split-w').forEach((w) => ((w as HTMLElement).style.overflow = 'visible'));
    gsap.fromTo(
      words,
      { opacity: 0.14 },
      {
        opacity: 1,
        ease: 'none',
        stagger: 0.1,
        scrollTrigger: { trigger: el, start: 'top 80%', end: 'bottom 45%', scrub: true },
      }
    );
  });

  /* ── Contadores ── */
  document.querySelectorAll<HTMLElement>('[data-count]').forEach((el) => {
    const end = parseFloat(el.dataset.count || '0');
    const obj = { v: 0 };
    el.textContent = '0';
    gsap.to(obj, {
      v: end,
      duration: 1.8,
      ease: 'expo.out',
      scrollTrigger: { trigger: el, start: 'top 90%', once: true },
      onUpdate: () => (el.textContent = Math.round(obj.v).toString()),
    });
  });

  /* Tarjetas apiladas: la anterior se encoge cuando llega la siguiente */
  const stackCards = gsap.utils.toArray<HTMLElement>('[data-stack-card]');
  stackCards.forEach((card, i) => {
    const next = stackCards[i + 1];
    if (!next) return;
    const inner = card.querySelector<HTMLElement>('[data-stack-inner]') || card;
    const shade = card.querySelector<HTMLElement>('[data-stack-shade]');
    const st = { trigger: next, start: 'top bottom', end: 'top 20%', scrub: true };
    gsap.to(inner, { scale: 0.92, ease: 'none', scrollTrigger: st });
    if (shade) gsap.to(shade, { opacity: 0.45, ease: 'none', scrollTrigger: { ...st } });
  });


  /* ── Scroll horizontal fijado (solo escritorio) ── */
  const mm = gsap.matchMedia();
  mm.add('(min-width: 1024px)', () => {
    document.querySelectorAll<HTMLElement>('[data-hscroll]').forEach((section) => {
      const track = section.querySelector<HTMLElement>('[data-hscroll-track]');
      const bar = section.querySelector<HTMLElement>('[data-hscroll-bar]');
      if (!track) return;
      const distance = () => Math.max(0, track.scrollWidth - window.innerWidth + 48);
      const tween = gsap.to(track, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 0.6,
          invalidateOnRefresh: true,
          onUpdate: (st) => bar && gsap.set(bar, { scaleX: st.progress }),
        },
      });
      return () => tween.kill();
    });
  });

  /* ── Barra de progreso de lectura ── */
  const progress = document.querySelector<HTMLElement>('[data-progress]');
  if (progress) {
    gsap.to(progress, {
      scaleX: 1,
      ease: 'none',
      scrollTrigger: { start: 0, end: 'max', scrub: 0.3 },
    });
  }

  if (finePointer) {
    /* ── Botones magnéticos ── */
    document.querySelectorAll<HTMLElement>('[data-magnetic]').forEach((el) => {
      const strength = parseFloat(el.dataset.magnetic || '0.35');
      const xTo = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'elastic.out(1, 0.4)' });
      const yTo = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'elastic.out(1, 0.4)' });
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        xTo((e.clientX - (r.left + r.width / 2)) * strength);
        yTo((e.clientY - (r.top + r.height / 2)) * strength);
      });
      el.addEventListener('pointerleave', () => {
        xTo(0);
        yTo(0);
      });
    });

    /* ── Inclinación 3D según el cursor ── */
    document.querySelectorAll<HTMLElement>('[data-tilt-scene]').forEach((scene) => {
      const layers = scene.querySelectorAll<HTMLElement>('[data-depth]');
      const setters = [...layers].map((layer) => ({
        depth: parseFloat(layer.dataset.depth || '1'),
        x: gsap.quickTo(layer, 'x', { duration: 1, ease: 'power3.out' }),
        y: gsap.quickTo(layer, 'y', { duration: 1, ease: 'power3.out' }),
        r: gsap.quickTo(layer, 'rotateY', { duration: 1, ease: 'power3.out' }),
      }));
      scene.addEventListener('pointermove', (e) => {
        const r = scene.getBoundingClientRect();
        const nx = (e.clientX - r.left) / r.width - 0.5;
        const ny = (e.clientY - r.top) / r.height - 0.5;
        setters.forEach((s) => {
          s.x(nx * 30 * s.depth);
          s.y(ny * 30 * s.depth);
          s.r(nx * 8 * s.depth);
        });
      });
      scene.addEventListener('pointerleave', () => setters.forEach((s) => (s.x(0), s.y(0), s.r(0))));
    });
  }

  /* ── Borde iluminado bajo el cursor ── */
  document.querySelectorAll<HTMLElement>('.spotlight').forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', `${e.clientX - r.left}px`);
      el.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
  });

  window.__motionReady = true;

  // Recalcular tras cargar imágenes y fuentes
  window.addEventListener('load', () => ScrollTrigger.refresh());
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
}

/* ── Header: se oculta al bajar y aparece al subir ── */
function initHeader(lenis: Lenis | null) {
  const header = document.querySelector<HTMLElement>('[data-header]');
  if (!header) return;
  let last = 0;
  const update = (y: number) => {
    header.dataset.scrolled = String(y > 24);
    const menuOpen = document.documentElement.dataset.menu === 'open';
    if (!menuOpen) header.dataset.hidden = String(y > last && y > 240);
    last = y;
  };
  if (lenis) lenis.on('scroll', ({ scroll }: { scroll: number }) => update(scroll));
  else window.addEventListener('scroll', () => update(window.scrollY), { passive: true });
  update(window.scrollY);
}

try {
  init();
} catch (err) {
  console.error(err);
  showEverything();
}
