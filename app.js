// Raiders of the Chain — app.js
const RAILWAY_API = 'https://gsb-swarm-production.up.railway.app';

// ── Bot card CTA click → scroll to form + pre-select ──────────────────────────
document.querySelectorAll('.btn-bot[data-bot]').forEach(btn => {
  btn.addEventListener('click', e => {
    e.preventDefault();
    const bot = btn.dataset.bot;
    const radio = document.querySelector(`input[name="bot"][value="${bot}"]`);
    if (radio) {
      radio.checked = true;
      radio.dispatchEvent(new Event('change'));
    }
    document.getElementById('deploy').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

// ── Mobile nav ────────────────────────────────────────────────────────────────
const mobileBtn = document.getElementById('mobileMenuBtn');
const navLinks = document.querySelector('.nav-links');
mobileBtn?.addEventListener('click', () => {
  navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
  navLinks.style.flexDirection = 'column';
  navLinks.style.position = 'absolute';
  navLinks.style.top = '64px';
  navLinks.style.right = '1.5rem';
  navLinks.style.background = 'var(--bg-2)';
  navLinks.style.border = '1px solid var(--border)';
  navLinks.style.borderRadius = 'var(--r)';
  navLinks.style.padding = '1rem 1.5rem';
  navLinks.style.gap = '1rem';
  navLinks.style.zIndex = '200';
});

// ── Entrance animations ───────────────────────────────────────────────────────
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.style.opacity = '1';
      e.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.bot-card, .step, .pricing-card').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'opacity 400ms ease, transform 400ms ease';
  observer.observe(el);
});

// ── Deploy form submission ────────────────────────────────────────────────────
let _submitting = false;
document.getElementById('deployForm')?.addEventListener('submit', async e => {
  e.preventDefault();
  if (_submitting) return;
  _submitting = true;

  const btn = document.getElementById('deployBtn');
  btn.textContent = 'Sending brief...';
  btn.disabled = true;

  const fd = new FormData(e.target);
  const payload = {
    bot: fd.get('bot'),
    tokenName: fd.get('tokenName'),
    tokenAddress: fd.get('tokenAddress') || '',
    targets: fd.get('targets') || '',
    brief: fd.get('brief'),
    telegram: fd.get('telegram'),
    email: fd.get('email') || '',
  };

  try {
    // Fire the Raid/Preacher/Alert bot via Railway
    const botMissionMap = {
      raid: `RAID CAMPAIGN REQUEST:\nToken: ${payload.tokenName}\nContract: ${payload.tokenAddress}\nTargets: ${payload.targets}\nBrief: ${payload.brief}\nClient Telegram: ${payload.telegram}`,
      alert: `ALERT BOT SETUP REQUEST:\nToken: ${payload.tokenName}\nContract: ${payload.tokenAddress}\nBrief: ${payload.brief}\nClient Telegram: ${payload.telegram}`,
      meme: `MEME/CONTENT CAMPAIGN REQUEST:\nToken: ${payload.tokenName}\nBrief: ${payload.brief}\nClient Telegram: ${payload.telegram}`,
      all: `FULL ARSENAL REQUEST:\nToken: ${payload.tokenName}\nContract: ${payload.tokenAddress}\nTargets: ${payload.targets}\nBrief: ${payload.brief}\nClient Telegram: ${payload.telegram}`,
    };

    const botWorkerMap = {
      raid: 'GSB Thread Writer',
      alert: 'GSB Alert Manager',
      meme: 'GSB Marketing Preacher',
      all: 'GSB Thread Writer',
    };

    const mission = botMissionMap[payload.bot] || botMissionMap.meme;
    const worker = botWorkerMap[payload.bot] || 'GSB Marketing Preacher';

    // Get auth token
    const authRes = await fetch(`${RAILWAY_API}/api/auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: 'Erock1976' }),
    });
    const authData = await authRes.json();
    const token = authData.token;

    // Fire the job
    const jobRes = await fetch(`${RAILWAY_API}/api/fire-job`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-gsb-token': token },
      body: JSON.stringify({ worker, requirement: mission, direct: true }),
    });
    const jobData = await jobRes.json();

    // Also send operator a Telegram notification
    if (authData.token) {
      const notifMission = `🚨 NEW RAIDERS CAMPAIGN REQUEST\n\nBot: ${payload.bot}\nToken: ${payload.tokenName}\nClient TG: ${payload.telegram}\nBrief: ${payload.brief.slice(0,200)}\n\nReply to ${payload.telegram} with payment link.`;
      fetch(`${RAILWAY_API}/api/fire-job`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-gsb-token': token },
        body: JSON.stringify({ worker: 'GSB Alert Manager', requirement: notifMission, direct: true }),
      }).catch(() => {});
    }

    // Show success
    document.getElementById('deployForm').classList.add('hidden');
    document.getElementById('deploySuccess').classList.remove('hidden');
    document.getElementById('successHandle').textContent = payload.telegram;
    document.getElementById('deploy').scrollIntoView({ behavior: 'smooth', block: 'start' });

  } catch (err) {
    _submitting = false;
    btn.textContent = 'Deploy My Campaign →';
    btn.disabled = false;
    alert('Error submitting brief. Try again or DM @cheferikosol on Telegram.');
  }
});

// ── Countdown / live activity pulse ──────────────────────────────────────────
function animateCounter(el, target, duration = 1500) {
  const start = performance.now();
  const update = (time) => {
    const elapsed = time - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(eased * target);
    if (progress < 1) requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
}
