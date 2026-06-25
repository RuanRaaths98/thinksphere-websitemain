(function () {
  const FORMSPREE_ENDPOINT = "https://formspree.io/f/xzdyendn";
  const forms = document.querySelectorAll(`form[action="${FORMSPREE_ENDPOINT}"]`);

  function getSourceName() {
    const path = window.location.pathname.split("/").pop() || "index.html";
    return path.replace(/\.html$/i, "") || "home";
  }

  function redirectToThankYou() {
    const params = new URLSearchParams({
      submitted: "1",
      source: getSourceName(),
    });
    window.location.href = `thank-you.html?${params.toString()}`;
  }

  forms.forEach((form) => {
    form.addEventListener("submit", async (event) => {
      if (event.defaultPrevented) return;
      event.preventDefault();

      const submitButton = form.querySelector('button[type="submit"], input[type="submit"]');
      const originalLabel = submitButton?.innerHTML;

      if (submitButton) {
        submitButton.disabled = true;
        if ("innerHTML" in submitButton) submitButton.innerHTML = "Sending...";
      }

      const payload = new FormData(form);
      payload.append("source_page", window.location.pathname);

      try {
        const response = await fetch(form.action, {
          method: form.method || "POST",
          body: payload,
          headers: { Accept: "application/json" },
        });

        if (!response.ok) throw new Error("Form submission failed");
        redirectToThankYou();
      } catch (error) {
        if (submitButton) {
          submitButton.disabled = false;
          if (originalLabel && "innerHTML" in submitButton) submitButton.innerHTML = originalLabel;
        }

        let status = form.querySelector("[data-form-status]");
        if (!status) {
          status = document.createElement("p");
          status.setAttribute("data-form-status", "");
          status.setAttribute("role", "status");
          status.style.marginTop = "12px";
          status.style.color = "#ffb199";
          form.appendChild(status);
        }
        status.textContent = "Something went wrong. Please try again in a moment.";
      }
    });
  });
})();
