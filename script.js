const menuButton = document.querySelector(".menu-button");
const navLinks = document.querySelectorAll(".site-nav a");
const form = document.querySelector(".contact-form");
const formFields = document.querySelectorAll(".contact-form input, .contact-form textarea");

function closeMenu() {
  document.body.classList.remove("nav-open");
  menuButton?.setAttribute("aria-expanded", "false");
}

menuButton?.addEventListener("click", () => {
  const isOpen = document.body.classList.toggle("nav-open");
  menuButton.setAttribute("aria-expanded", String(isOpen));
});

navLinks.forEach((link) => {
  link.addEventListener("click", closeMenu);
});

formFields.forEach((field) => {
  const syncValueState = () => {
    field.closest("label")?.classList.toggle("has-value", field.value.trim().length > 0);
  };

  syncValueState();
  field.addEventListener("input", syncValueState);
  field.addEventListener("blur", syncValueState);
});

form?.addEventListener("submit", (event) => {
  event.preventDefault();

  const status = form.querySelector(".form-status");
  const button = form.querySelector('button[type="submit"]');
  const original = button?.innerHTML;

  if (status) {
    status.textContent = "Request received. We will be in touch shortly.";
  }

  if (button) {
    button.disabled = true;
    button.innerHTML = 'Request received <svg class="icon"><use href="#icon-check"></use></svg>';
    setTimeout(() => {
      button.disabled = false;
      if (original) button.innerHTML = original;
    }, 2600);
  }
});
