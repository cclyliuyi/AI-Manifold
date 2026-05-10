const progress = document.getElementById('progress');
    const links = Array.from(document.querySelectorAll('.nav-links a'));
    const sections = links.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
    const stageItems = Array.from(document.querySelectorAll('.bg-stage-item'));
    const stageDesc = document.getElementById('bgStageDesc');
    const stageTexts = [
      '高维状态空间：大量点云与流动噪声，象征世界的庞大可能性。',
      '实际观测：巨大的自由度被截取，只留下可感知、可采样的一部分。',
      '信号流形：结构开始显现，信息像光的河流一样在低维曲面上流动。',
      '智能涌现：背景最终收敛到页面正中央的高信噪比焦点。'
    ];

    let scrollProgress = 0;
    const updateProgress = () => {
      const h = document.documentElement;
      scrollProgress = (h.scrollTop || document.body.scrollTop) / ((h.scrollHeight - h.clientHeight) || 1);
      progress.style.width = (scrollProgress * 100) + '%';
      const current = sections.slice().reverse().find(sec => sec.getBoundingClientRect().top <= 140);
      links.forEach(a => a.classList.toggle('active', current && a.getAttribute('href') === '#' + current.id));

      const stage = scrollProgress < 0.22 ? 0 : scrollProgress < 0.48 ? 1 : scrollProgress < 0.78 ? 2 : 3;
      stageItems.forEach((item, index) => item.classList.toggle('active', index === stage));
      if (stageDesc) stageDesc.textContent = stageTexts[stage];
    };
    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();

    const modal = document.getElementById('modal');
    const modalImg = document.getElementById('modalImg');
    document.querySelectorAll('.figure-card img').forEach(img => {
      img.addEventListener('click', () => {
        modalImg.src = img.src;
        modalImg.alt = img.alt;
        modal.classList.add('open');
        modal.setAttribute('aria-hidden', 'false');
      });
    });
    const closeModal = () => {
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
      modalImg.removeAttribute('src');
    };
    document.getElementById('modalClose').addEventListener('click', closeModal);
    modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
    window.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

    // --- Artistic animated manifold-like scroll background ---
    const canvas = document.getElementById('bgCanvas');
    const ctx = canvas.getContext('2d');
    const DPR_CAP = 1;
    let w = 0, h = 0, dpr = 1;
    let t = 0;
    let smoothScroll = 0;

    function mulberry32(a) {
      return function() {
        let z = a += 0x6D2B79F5;
        z = Math.imul(z ^ z >>> 15, z | 1);
        z ^= z + Math.imul(z ^ z >>> 7, z | 61);
        return ((z ^ z >>> 14) >>> 0) / 4294967296;
      }
    }
    const rand = mulberry32(20260510);

    const particleBaseCount = Math.min(130, Math.max(56, Math.round(window.innerWidth * 0.07)));
    let particles = [];
    let fieldPoints = [];

    function resizeCanvas() {
      dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      makeParticles();
    }

    function makeParticles() {
      particles = Array.from({ length: particleBaseCount }, () => {
        const angle = rand() * Math.PI * 2;
        return {
          sx: rand() * 1.22 - 0.11,
          sy: rand() * 1.15 - 0.08,
          tx: rand(),
          offset: (rand() - 0.5) * 260,
          phase: rand() * Math.PI * 2,
          speed: 0.45 + rand() * 1.2,
          r: 0.5 + rand() * 2.4,
          sway: 6 + rand() * 18,
          depth: 0.35 + rand() * 1.5,
          angle,
          arc: 0.3 + rand() * 1.0
        };
      });
      fieldPoints = Array.from({ length: Math.max(30, Math.round(w / 38)) }, (_, i) => ({
        x: i / Math.max(1, Math.round(w / 38) - 1),
        phase: rand() * Math.PI * 2,
        depth: 0.5 + rand() * 1.6
      }));
    }

    function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
    function lerp(a, b, p) { return a + (b - a) * p; }
    function ease(v) { return v < 0 ? 0 : v > 1 ? 1 : v * v * (3 - 2 * v); }

    function manifoldY(nx, tt, layer) {
      return h * (0.52
        + 0.13 * Math.sin(nx * 5.2 + tt * 0.44 + layer * 0.72)
        + 0.055 * Math.sin(nx * 11.2 - tt * 0.31 + layer * 1.65)
        + 0.02 * Math.sin(nx * 27.0 + tt * 0.92 + layer * 2.2));
    }

    function drawBackdrop(progress) {
      const bg = ctx.createLinearGradient(0, 0, 0, h);
      bg.addColorStop(0, '#030c18');
      bg.addColorStop(0.40, '#071728');
      bg.addColorStop(1, '#030911');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      const aurora1 = ctx.createRadialGradient(w * 0.18, h * 0.12, 0, w * 0.18, h * 0.12, w * 0.52);
      aurora1.addColorStop(0, `rgba(83,226,255,${0.19 + 0.03 * Math.sin(t * 0.25)})`);
      aurora1.addColorStop(0.45, `rgba(83,226,255,${0.07 + 0.05 * (1-progress)})`);
      aurora1.addColorStop(1, 'rgba(83,226,255,0)');
      ctx.fillStyle = aurora1;
      ctx.fillRect(0, 0, w, h);

      const aurora2 = ctx.createRadialGradient(w * 0.82, h * 0.18, 0, w * 0.82, h * 0.18, w * 0.42);
      aurora2.addColorStop(0, `rgba(232,192,109,${0.10 + progress * 0.10})`);
      aurora2.addColorStop(0.42, `rgba(232,192,109,${0.03 + progress * 0.04})`);
      aurora2.addColorStop(1, 'rgba(232,192,109,0)');
      ctx.fillStyle = aurora2;
      ctx.fillRect(0, 0, w, h);

      const centralMist = ctx.createRadialGradient(w * 0.50, h * 0.54, 0, w * 0.50, h * 0.54, w * 0.55);
      centralMist.addColorStop(0, `rgba(44,146,198,${0.08 + 0.06 * progress})`);
      centralMist.addColorStop(1, 'rgba(44,146,198,0)');
      ctx.fillStyle = centralMist;
      ctx.fillRect(0, 0, w, h);
    }

    function drawVeils(progress) {
      const focus = ease(clamp((progress - 0.68) / 0.32, 0, 1));
      for (let j = 0; j < 2; j++) {
        ctx.beginPath();
        const amp = 26 + j * 14;
        for (let i = 0; i <= 48; i++) {
          const x = (i / 48) * w;
          const y = h * (0.28 + j * 0.16)
            + Math.sin(i * 0.22 + t * (0.45 + j * 0.08)) * amp
            + Math.cos(i * 0.13 - t * 0.22 + j) * 14;
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = j === 1
          ? `rgba(83,226,255,${0.035 - focus * 0.01})`
          : `rgba(255,255,255,${0.018 - focus * 0.006})`;
        ctx.lineWidth = 22 - j * 5;
        ctx.lineCap = 'round';
        ctx.shadowColor = 'rgba(83,226,255,.10)';
        ctx.shadowBlur = 18;
        ctx.stroke();
      }
      ctx.shadowBlur = 0;
    }

    function drawRibbon(progress) {
      const signal = ease(clamp((progress - 0.18) / 0.62, 0, 1));
      const focus = ease(clamp((progress - 0.68) / 0.32, 0, 1));
      const bandCount = 5;
      for (let band = 0; band < bandCount; band++) {
        const bandMix = band / (bandCount - 1);
        const spread = lerp(180, 22, signal) * (0.65 + Math.abs(bandMix - 0.5) * 1.55) * (1 - focus * 0.68);
        const alpha = (0.018 + signal * 0.042) * (1 - Math.abs(bandMix - 0.5) * 0.58) * (1 - focus * 0.18);
        const hueShift = Math.round(188 + bandMix * 26 + progress * 18);
        ctx.beginPath();
        for (let i = 0; i < fieldPoints.length; i++) {
          const fp = fieldPoints[i];
          const x = fp.x * w;
          const y = manifoldY(fp.x, t, bandMix * fp.depth) + (bandMix - 0.5) * spread;
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.lineWidth = 1 + (band % 3 === 0 ? 0.35 : 0);
        ctx.strokeStyle = `hsla(${hueShift}, 96%, ${58 + bandMix * 12}%, ${alpha})`;
        ctx.stroke();
      }

      // luminous core manifold
      const ribbonWidth = lerp(44, 15, focus);
      for (let j = 0; j < 3; j++) {
        ctx.beginPath();
        for (let i = 0; i < fieldPoints.length; i++) {
          const fp = fieldPoints[i];
          const x = fp.x * w;
          const y = manifoldY(fp.x, t, 0.95 + j * 0.20);
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.lineWidth = ribbonWidth - j * 12;
        ctx.strokeStyle = j === 0
          ? `rgba(83,226,255,${0.055 + signal * 0.09})`
          : j === 1
            ? `rgba(255,255,255,${0.08 + signal * 0.12})`
            : `rgba(232,192,109,${0.025 + signal * 0.05})`;
        ctx.shadowColor = j === 2 ? 'rgba(232,192,109,.18)' : 'rgba(83,226,255,.24)';
        ctx.shadowBlur = 22;
        ctx.stroke();
      }
      ctx.shadowBlur = 0;
    }

    function drawParticles(progress) {
      const toManifold = ease(clamp(progress / 0.68, 0, 1));
      const focus = ease(clamp((progress - 0.68) / 0.32, 0, 1));
      const fx = w * 0.50;
      const fy = h * 0.50;

      particles.forEach((p) => {
        const sx = p.sx * w + Math.sin(t * p.speed + p.phase) * p.sway;
        const sy = p.sy * h + Math.cos(t * p.speed * 0.86 + p.phase) * p.sway * 0.85;
        const mx = lerp(w * 0.06, w * 0.94, p.tx) + Math.sin(t * 0.5 + p.phase) * 10;
        const my = manifoldY((mx / w), t, p.depth) + p.offset * (1 - toManifold) * 0.22 + Math.sin(t * p.speed + p.phase) * 6;
        const cx = lerp(sx, mx, toManifold);
        const cy = lerp(sy, my, toManifold);
        const spiralAngle = p.angle + t * 0.25;
        const tx = fx + Math.cos(spiralAngle) * (24 + p.arc * 24) * (1 - focus * 0.25);
        const ty = fy + Math.sin(spiralAngle) * (18 + p.arc * 16) * (1 - focus * 0.25);
        const x = lerp(cx, tx, focus);
        const y = lerp(cy, ty, focus);
        const radius = p.r * (1 - focus * 0.18);
        const blend = 1 - focus;
        const r = Math.round(83 * blend + 232 * focus + 18);
        const g = Math.round(226 * blend + 192 * focus + 20);
        const b = Math.round(255 * blend + 109 * focus);
        const alpha = (0.12 + p.depth * 0.18) * (0.7 + toManifold * 0.55) * (1 - focus * 0.08);
        ctx.beginPath();
        ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // Semantic convergence at center
      if (focus > 0.01) {
        const pulse = 1 + Math.sin(t * 2.0) * 0.03;
        const glow = (96 + focus * 130) * pulse;
        const grad = ctx.createRadialGradient(fx, fy, 0, fx, fy, glow);
        grad.addColorStop(0, `rgba(255,245,228,${0.46 * focus})`);
        grad.addColorStop(0.14, `rgba(232,192,109,${0.28 * focus})`);
        grad.addColorStop(0.36, `rgba(83,226,255,${0.18 * focus})`);
        grad.addColorStop(1, 'rgba(83,226,255,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(fx, fy, glow, 0, Math.PI * 2);
        ctx.fill();

        // concentric poetic rings
        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          ctx.strokeStyle = i === 1
            ? `rgba(255,255,255,${0.14 * focus})`
            : `rgba(${i===0?83:232},${i===0?226:192},${i===0?255:109},${(0.15 - i*0.03) * focus})`;
          ctx.lineWidth = 1.1;
          ctx.arc(fx, fy, 18 + i * 18 + Math.sin(t * (1.6 + i * 0.3)) * 1.5, 0, Math.PI * 2);
          ctx.stroke();
        }

        ctx.beginPath();
        ctx.fillStyle = `rgba(255,249,238,${0.88 * focus})`;
        ctx.arc(fx, fy, 4.5 + focus * 9.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let isVisible = true;
    let lastFrame = 0;
    document.addEventListener('visibilitychange', () => { isVisible = !document.hidden; });

    function renderFrame() {
      smoothScroll += (scrollProgress - smoothScroll) * 0.06;
      t += 0.013;
      drawBackdrop(smoothScroll);
      drawVeils(smoothScroll);
      drawRibbon(smoothScroll);
      drawParticles(smoothScroll);
    }

    function animate(now) {
      if (!isVisible) {
        requestAnimationFrame(animate);
        return;
      }
      // Cap the background to ~30 FPS. Text and scrolling remain native-smooth,
      // while the canvas no longer burns CPU/GPU every display frame.
      if (!lastFrame || now - lastFrame > 32) {
        renderFrame();
        lastFrame = now;
      }
      requestAnimationFrame(animate);
    }

    window.addEventListener('resize', resizeCanvas, { passive: true });
    resizeCanvas();
    renderFrame();
    if (!prefersReducedMotion) requestAnimationFrame(animate);
