document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("button").forEach((btn) => {
    const input = btn.previousElementSibling;
    const icon = btn.querySelector("span");

    if (!input || input.type !== "password") return;

    btn.addEventListener("click", (e) => {
      e.preventDefault();

      if (input.type === "password") {
        input.type = "text";
        icon.textContent = "visibility_off";
      } else {
        input.type = "password";
        icon.textContent = "visibility";
      }
    });
  });
});
