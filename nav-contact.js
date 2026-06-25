(function () {
  function openLeadModal(event) {
    const trigger = event.target.closest('[data-lead-open]');
    if (!trigger) return;

    const modal = document.querySelector('#lead-modal');
    if (!modal) return;

    event.preventDefault();
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    const firstField = modal.querySelector('input:not([type="hidden"]), textarea, select, button');
    setTimeout(() => firstField?.focus({ preventScroll: true }), 120);
  }

  document.addEventListener('click', openLeadModal, true);
})();
