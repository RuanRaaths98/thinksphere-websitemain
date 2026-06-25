(function () {
  const services = Array.from(document.querySelectorAll('.nav-service'));
  if (!services.length) return;

  function setDropdownTop(service) {
    const header = service.closest('.site-header') || document.querySelector('.site-header');
    if (!header) return;
    const bottom = Math.ceil(header.getBoundingClientRect().bottom + 8);
    document.documentElement.style.setProperty('--mobile-nav-dropdown-top', `${bottom}px`);
  }

  function closeService(service) {
    const trigger = service.querySelector('.nav-trigger');
    const dropdown = service.querySelector('.services-dropdown');
    service.classList.remove('is-open');
    trigger?.setAttribute('aria-expanded', 'false');
    dropdown?.setAttribute('aria-hidden', 'true');
  }

  function closeAll(except) {
    services.forEach((service) => {
      if (service !== except) closeService(service);
    });
  }

  services.forEach((service, index) => {
    const trigger = service.querySelector('.nav-trigger');
    const dropdown = service.querySelector('.services-dropdown');
    if (!trigger || !dropdown) return;

    if (!dropdown.id) dropdown.id = `services-dropdown-${index + 1}`;
    trigger.setAttribute('aria-controls', dropdown.id);
    trigger.setAttribute('aria-expanded', 'false');
    dropdown.setAttribute('aria-hidden', 'true');

    trigger.addEventListener('click', (event) => {
      event.preventDefault();
      const willOpen = !service.classList.contains('is-open');
      closeAll(service);
      service.classList.toggle('is-open', willOpen);
      trigger.setAttribute('aria-expanded', String(willOpen));
      dropdown.setAttribute('aria-hidden', String(!willOpen));
      if (willOpen) setDropdownTop(service);
    });

    dropdown.addEventListener('click', (event) => {
      if (event.target.closest('a')) closeService(service);
    });
  });

  document.addEventListener('click', (event) => {
    if (!event.target.closest('.nav-service')) closeAll();
  });

  window.addEventListener('resize', () => {
    const open = document.querySelector('.nav-service.is-open');
    if (open) setDropdownTop(open);
  }, { passive: true });

  window.addEventListener('scroll', () => {
    const open = document.querySelector('.nav-service.is-open');
    if (open) setDropdownTop(open);
  }, { passive: true });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeAll();
  });
})();
