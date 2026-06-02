(() => {
  let ctx = null;

  const getCtx = async () => {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') await ctx.resume();
    return ctx;
  };

  const playScanner = async () => {
    const ac = await getCtx();
    const now = ac.currentTime;

    // Sweep principal: 900Hz → 1400Hz → 1100Hz
    const osc = ac.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(900, now);
    osc.frequency.linearRampToValueAtTime(1400, now + 0.12);
    osc.frequency.linearRampToValueAtTime(1100, now + 0.22);

    // Capa metálica sutil
    const osc2 = ac.createOscillator();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(1800, now);
    osc2.frequency.linearRampToValueAtTime(2400, now + 0.12);

    // Filtro bandpass tech
    const filter = ac.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1200;
    filter.Q.value = 1.4;

    const gain = ac.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.18, now + 0.02);
    gain.gain.linearRampToValueAtTime(0.08, now + 0.14);
    gain.gain.linearRampToValueAtTime(0, now + 0.26);

    const gain2 = ac.createGain();
    gain2.gain.setValueAtTime(0, now);
    gain2.gain.linearRampToValueAtTime(0.05, now + 0.02);
    gain2.gain.linearRampToValueAtTime(0, now + 0.18);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ac.destination);

    osc2.connect(gain2);
    gain2.connect(ac.destination);

    osc.start(now);  osc.stop(now + 0.28);
    osc2.start(now); osc2.stop(now + 0.20);
  };

  const throttle = (fn, delay) => {
    let last = 0;
    return () => {
      const now = Date.now();
      if (now - last >= delay) { last = now; fn(); }
    };
  };

  const attach = () => {
    document.querySelectorAll('.service_item').forEach(card => {
      card.addEventListener('mouseenter', throttle(playScanner, 300));
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attach);
  } else {
    attach();
  }
})();
