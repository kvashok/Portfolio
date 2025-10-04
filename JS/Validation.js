function validateForm() {
              let isValid = true;
              const fields = ['name', 'email', 'subject', 'message'];
              
              // Reset previous errors
              fields.forEach(field => {
              document.getElementById(`${field}Error`).textContent = '';
              document.getElementById(`${field}Error`).classList.remove('show');
              });

              // Validate each field
              fields.forEach(field => {
              const value = document.getElementById(field).value.trim();
              if (!value) {
                isValid = false;
                const errorEl = document.getElementById(`${field}Error`);
                errorEl.textContent = `Please enter your ${field}`;
                errorEl.classList.add('show');
              }
              });

              // Validate email format
              const email = document.getElementById('email').value.trim();
              if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
              isValid = false;
              const errorEl = document.getElementById('emailError');
              errorEl.textContent = 'Please enter a valid email address';
              errorEl.classList.add('show');
              }

              if (isValid) {
              document.getElementById('formStatus').textContent = 'Sending message...';
              setTimeout(() => {
                document.getElementById('formStatus').textContent = 'Message sent successfully! ✨';
                document.getElementById('contactForm').reset();
              }, 1500);
              }

              return isValid;
            }
            const sections = document.querySelectorAll("section, .portfolio-content");
const navLinks = document.querySelectorAll("nav a");

function highlightMenu() {
  let scrollY = window.scrollY;

  sections.forEach((section) => {
    const sectionTop = section.offsetTop - 100; // offset for fixed header
    const sectionHeight = section.offsetHeight;
    const sectionId = section.getAttribute("id");

    if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
      navLinks.forEach((link) => {
        link.classList.remove("active");
        if (link.getAttribute("href") === `#${sectionId}`) {
          link.classList.add("active");
        }
      });
    }
  });
}

window.addEventListener("scroll", highlightMenu);
window.addEventListener("load", highlightMenu);