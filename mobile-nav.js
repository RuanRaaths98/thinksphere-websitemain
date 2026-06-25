(function () {
  const services = Array.from(document.querySelectorAll('.nav-service'));
  if (!services.length) return;

  function setDropdownTop(service) {
    const header = service.closest('.site-header') || document.querySelector('.site-header');
    if (!header) return;
    const bottom = Math.max(72, Math.ceil(header.getBoundingClientRect().bottom + 10));
    const available = Math.max(220, window.innerHeight - bottom - 12);
    document.documentElement.style.setProperty('--mobile-nav-dropdown-top', `${bottom}px`);
    document.documentElement.style.setProperty('--mobile-nav-dropdown-height', `${available}px`);
  }

  function settleOpenPosition(service, trigger) {
    trigger.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    setDropdownTop(service);
    requestAnimationFrame(() => {
      setDropdownTop(service);
      setTimeout(() => setDropdownTop(service), 80);
    });
  }

  function isMobileNav() {
    return window.matchMedia('(max-width: 900px)').matches;
  }

  function returnDropdown(service, dropdown) {
    const placeholder = service._dropdownPlaceholder;
    if (placeholder && placeholder.parentNode) {
      placeholder.parentNode.insertBefore(dropdown, placeholder);
      placeholder.remove();
    }
    dropdown.classList.remove('is-mobile-open');
    service._dropdownPlaceholder = null;
  }

  function portalDropdown(service, dropdown) {
    if (!isMobileNav() || dropdown.classList.contains('is-mobile-open')) return;
    const placeholder = document.createComment('mobile services dropdown');
    dropdown.parentNode.insertBefore(placeholder, dropdown);
    service._dropdownPlaceholder = placeholder;
    document.body.appendChild(dropdown);
    dropdown.classList.add('is-mobile-open');
  }

  function closeService(service) {
    const trigger = service.querySelector('.nav-trigger');
    const dropdown = service.querySelector('.services-dropdown') || document.querySelector(`#${trigger?.getAttribute('aria-controls')}`);
    service.classList.remove('is-open');
    trigger?.setAttribute('aria-expanded', 'false');
    dropdown?.setAttribute('aria-hidden', 'true');
    if (dropdown) returnDropdown(service, dropdown);
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
      if (willOpen) {
        portalDropdown(service, dropdown);
        settleOpenPosition(service, trigger);
      } else {
        returnDropdown(service, dropdown);
      }
    });

    dropdown.addEventListener('click', (event) => {
      if (event.target.closest('a')) closeService(service);
    });
  });

  document.addEventListener('click', (event) => {
    if (!event.target.closest('.nav-service, .services-dropdown.is-mobile-open')) closeAll();
  });

  window.addEventListener('resize', () => {
    const open = document.querySelector('.nav-service.is-open');
    if (!open) return;
    if (!isMobileNav()) closeAll();
    else setDropdownTop(open);
  }, { passive: true });

  window.addEventListener('scroll', () => {
    const open = document.querySelector('.nav-service.is-open');
    if (open) setDropdownTop(open);
  }, { passive: true });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeAll();
  });
})();
