
      /* --- Particle backgrounds with presets per section --- */
      const PRESETS = {
        home: {
          baseCount: 32,
          maxSize: 140,
          minSize: 40,
          speed: 0.25,
          attractionStrength: 0.28,
          cursorRadius: 160,
          particleColor: "0,191,255",
          trailsEnabled: true,
          fpsCap: 60,
          mode: "repel",
          type: "bubbles",
        },
        about: {
          baseCount: 80,
          maxSize: 3,
          minSize: 1.5,
          speed: 0.7,
          attractionStrength: 0.14,
          cursorRadius: 140,
          particleColor: "255,255,255",
          trailsEnabled: false,
          fpsCap: 60,
          mode: "attract",
          type: "stars",
        },
        experience: {
          baseCount: 45,
          maxSize: 14,
          minSize: 6,
          speed: 0.18,
          attractionStrength: 0.18,
          cursorRadius: 160,
          particleColor: "0,200,150",
          trailsEnabled: true,
          fpsCap: 60,
          mode: "repel",
          type: "soft-orbs",
        },
        projects: {
          baseCount: 60,
          maxSize: 3.5,
          minSize: 1.2,
          speed: 0.9,
          attractionStrength: 0.22,
          cursorRadius: 120,
          particleColor: "200,120,255",
          trailsEnabled: false,
          fpsCap: 60,
          mode: "attract",
          type: "twinkle",
        },
        blog: {
          baseCount: 18,
          maxSize: 120,
          minSize: 60,
          speed: 0.12,
          attractionStrength: 0.12,
          cursorRadius: 180,
          particleColor: "255,160,80",
          trailsEnabled: true,
          fpsCap: 60,
          mode: "repel",
          type: "bubbles",
        },
        contact: {
          baseCount: 28,
          maxSize: 90,
          minSize: 30,
          speed: 0.22,
          attractionStrength: 0.2,
          cursorRadius: 160,
          particleColor: "0,191,255",
          trailsEnabled: true,
          fpsCap: 60,
          mode: "repel",
          type: "soft-orbs",
        },
      };

      // start with home preset
      let CONFIG = Object.assign({}, PRESETS.home);
      const rand = (min, max) => Math.random() * (max - min) + min;
      const canvas = document.getElementById("particleCanvas"),
        ctx = canvas.getContext("2d");
      let DPR = Math.max(1, window.devicePixelRatio || 1);
      const state = {
        width: 0,
        height: 0,
        particles: [],
        mouse: { x: null, y: null },
        lastFrameTime: 0,
        frameInterval: CONFIG.fpsCap > 0 ? 1000 / CONFIG.fpsCap : 0,
      };

      function resize() {
        DPR = Math.max(1, window.devicePixelRatio || 1);
        state.width = window.innerWidth;
        state.height = window.innerHeight;
        canvas.width = state.width * DPR;
        canvas.height = state.height * DPR;
        canvas.style.width = state.width + "px";
        canvas.style.height = state.height + "px";
        ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
        initParticles();
      }

      function initParticles() {
        state.particles = [];
        for (let i = 0; i < CONFIG.baseCount; i++) {
          const size = rand(CONFIG.minSize, CONFIG.maxSize);
          state.particles.push({
            x: rand(-size, state.width + size),
            y: rand(-size, state.height + size),
            vx: rand(-0.2, 0.2) * CONFIG.speed,
            vy: rand(-0.2, 0.2) * CONFIG.speed,
            size,
            baseSize: size,
            // lower alpha so glow is softer and less likely to tint UI elements
            alpha: rand(0.03, 0.12),
            wobble: rand(0.002, 0.01),
          });
        }
      }

      function drawBubble(p) {
        // soft radial gradient for glow
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
        const c = CONFIG.particleColor;
        g.addColorStop(0, `rgba(${c},${Math.min(0.9, p.alpha * 3)})`);
        g.addColorStop(0.4, `rgba(${c},${p.alpha})`);
        g.addColorStop(1, `rgba(10,12,22,0)`);
        ctx.beginPath();
        ctx.fillStyle = g;
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      function drawStar(x, y, r, color, alpha) {
        const spikes = 5;
        let rot = (Math.PI / 2) * 3,
          step = Math.PI / spikes;
        ctx.beginPath();
        ctx.moveTo(x, y - r);
        for (let i = 0; i < spikes; i++) {
          ctx.lineTo(x + Math.cos(rot) * r, y + Math.sin(rot) * r);
          rot += step;
          ctx.lineTo(x + (Math.cos(rot) * r) / 2, y + (Math.sin(rot) * r) / 2);
          rot += step;
        }
        ctx.lineTo(x, y - r);
        ctx.closePath();
        ctx.fillStyle = `rgba(${color},${alpha})`;
        ctx.fill();
      }

      // generic draw dispatcher based on preset type
      function drawForPreset(p) {
        const t = CONFIG.type || 'bubbles';
        if (t === 'bubbles' || t === 'soft-orbs') {
          drawBubble(p);
        } else if (t === 'stars' || t === 'twinkle') {
          drawStar(p.x, p.y, p.size, CONFIG.particleColor, p.alpha);
        } else {
          drawBubble(p);
        }
      }

      function updateParticle(p) {
        // gentle wobble
        p.vx += Math.sin((p.x + performance.now() * p.wobble) * 0.001) * 0.0008;
        p.vy += Math.cos((p.y + performance.now() * p.wobble) * 0.001) * 0.0008;

        // mouse interaction: repel bubbles when close
        if (state.mouse.x !== null) {
          const dx = state.mouse.x - p.x,
            dy = state.mouse.y - p.y,
            dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONFIG.cursorRadius) {
            const f =
              (1 - dist / CONFIG.cursorRadius) *
              CONFIG.attractionStrength *
              (CONFIG.mode === "repel" ? -1 : 1);
            if (dist > 0.1) {
              p.vx += (dx / dist) * f;
              p.vy += (dy / dist) * f;
            }
          }
        }

        // update position
        p.x += p.vx * (1 + p.size / 200);
        p.y += p.vy * (1 + p.size / 200);

        // wrap around for continuous flow
        if (p.x < -p.size) p.x = state.width + p.size;
        if (p.x > state.width + p.size) p.x = -p.size;
        if (p.y < -p.size) p.y = state.height + p.size;
        if (p.y > state.height + p.size) p.y = -p.size;
      }

      function frame(t) {
        if (!state.lastFrameTime) state.lastFrameTime = t;
        const dtMs = t - state.lastFrameTime;
        if (CONFIG.fpsCap === 0 || dtMs >= state.frameInterval) {
          // trails: paint a semi-opaque rect to create soft persistence
          if (CONFIG.trailsEnabled) {
            ctx.fillStyle = "rgba(10,12,22,0.28)";
            ctx.fillRect(0, 0, state.width, state.height);
          } else {
            ctx.clearRect(0, 0, state.width, state.height);
          }

          // draw normally (no additive blending) so canvas glow doesn't tint DOM text
          state.particles.forEach((p) => {
            updateParticle(p);
            drawForPreset(p);
          });

          state.lastFrameTime = t;
        }
        requestAnimationFrame(frame);
      }

      window.addEventListener("mousemove", (e) => {
        state.mouse.x = e.clientX;
        state.mouse.y = e.clientY;
      });
      window.addEventListener("mouseleave", () => {
        state.mouse.x = null;
        state.mouse.y = null;
      });
      window.addEventListener("resize", resize);
      resize();
      requestAnimationFrame(frame);

      // --- Section-aware preset switching ---
      function setPreset(name) {
        if (!PRESETS[name]) return;
        // shallow copy preset values into CONFIG
        CONFIG = Object.assign({}, PRESETS[name]);
        // reinitialize frame timing and particles
        state.frameInterval = CONFIG.fpsCap > 0 ? 1000 / CONFIG.fpsCap : 0;
        initParticles();
      }

      // Observe sections and switch preset when they enter center of view
      const sectionIds = ['home','about','experience','projects','blog','contact'];
      const observerOptions = { root: null, rootMargin: '0px', threshold: 0.45 };
      const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            if (sectionIds.includes(id)) {
              setPreset(id);
            }
          }
        });
      }, observerOptions);

      sectionIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) sectionObserver.observe(el);
      });

      // Toggle animated gradient for projects and fade canvas while in view
      const projectsEl = document.getElementById('projects');
      const particleCanvas = document.getElementById('particleCanvas');
      const canvasFadeDuration = 400; // ms
      const projectsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            projectsEl.classList.add('animated-projects');
            // fade out canvas to avoid visual clash
            if (particleCanvas) {
              particleCanvas.style.transition = `opacity ${canvasFadeDuration}ms ease`;
              particleCanvas.style.opacity = '0';
              particleCanvas.style.pointerEvents = 'none';
            }
          } else {
            projectsEl.classList.remove('animated-projects');
            if (particleCanvas) {
              particleCanvas.style.transition = `opacity ${canvasFadeDuration}ms ease`;
              particleCanvas.style.opacity = '1';
              particleCanvas.style.pointerEvents = 'none';
            }
          }
        });
      }, { threshold: 0.55 });
      if (projectsEl) projectsObserver.observe(projectsEl);

      // Observe contact section and apply animated ripple + dim canvas
      const contactEl = document.getElementById('contact');
      const contactObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            contactEl.classList.add('animated-contact');
            if (particleCanvas) {
              particleCanvas.style.transition = `opacity ${canvasFadeDuration}ms ease`;
              particleCanvas.style.opacity = '0.15';
              particleCanvas.style.pointerEvents = 'none';
            }
          } else {
            contactEl.classList.remove('animated-contact');
            if (particleCanvas) {
              particleCanvas.style.transition = `opacity ${canvasFadeDuration}ms ease`;
              particleCanvas.style.opacity = '1';
              particleCanvas.style.pointerEvents = 'none';
            }
          }
        });
      }, { threshold: 0.5 });
      if (contactEl) contactObserver.observe(contactEl);

      /* --- Mobile menu --- */
      const menuToggle = document.getElementById("menuToggle"),
        menuList = document.getElementById("menuList");
      menuToggle.addEventListener("click", () => {
        menuList.classList.toggle("open");
      });

      /* --- Smooth scrolling --- */
      document.querySelectorAll('nav a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener("click", function (e) {
          e.preventDefault();
          const target = document.querySelector(this.getAttribute("href"));
          if (target) target.scrollIntoView({ behavior: "smooth" });
          menuList.classList.remove("open"); // close menu on mobile
        });
      });

      /* --- Typing animation --- */
      const roles = [
        "Senior Frontend Developer",
        "Full Stack Developer",
        "UI/UX Designer",
      ];
      let currentRole = 0,
        currentChar = 0,
        typedTextSpan = document.getElementById("typed-text");
      const typingSpeed = 100,
        erasingSpeed = 50,
        delayBetween = 1500;
      function type() {
        if (currentChar < roles[currentRole].length) {
          typedTextSpan.textContent += roles[currentRole].charAt(currentChar);
          currentChar++;
          setTimeout(type, typingSpeed);
        } else {
          setTimeout(erase, delayBetween);
        }
      }
      function erase() {
        if (currentChar > 0) {
          typedTextSpan.textContent = roles[currentRole].substring(
            0,
            currentChar - 1
          );
          currentChar--;
          setTimeout(erase, erasingSpeed);
        } else {
          currentRole = (currentRole + 1) % roles.length;
          setTimeout(type, typingSpeed);
        }
      }
      document.addEventListener("DOMContentLoaded", () => {
        setTimeout(type, 500);
      });

      /* --- Down arrow --- */
      const downArrow = document.getElementById("downArrow");
      if (downArrow) {
        const aboutSection = document.getElementById("about");
        downArrow.addEventListener("click", () => {
          aboutSection.scrollIntoView({ behavior: "smooth" });
        });
        window.addEventListener("scroll", () => {
          downArrow.style.opacity =
            window.scrollY >= document.getElementById("home").offsetHeight - 80
              ? 0
              : 1;
        });
      }

      /* --- Custom Cursor --- */
      const customCursor = document.getElementById("customCursor");
      window.addEventListener("mousemove", (e) => {
        customCursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
      });
      document.querySelectorAll("a, button").forEach((el) => {
        el.addEventListener("mouseenter", () => {
          customCursor.style.width = "40px";
          customCursor.style.height = "40px";
          customCursor.style.backgroundColor = "rgba(0,191,255,0.3)";
        });
        el.addEventListener("mouseleave", () => {
          customCursor.style.width = "20px";
          customCursor.style.height = "20px";
          customCursor.style.backgroundColor = "rgba(0,191,255,0.7)";
        });
      });

      /* --- Animate timeline items on scroll --- */
      const timelineItems = document.querySelectorAll(".timeline-item");
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("visible");
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.2 }
      );
      timelineItems.forEach((item) => observer.observe(item));

      /* --- Countdown Timer --- */
      // Set blog countdown target to 15 days from the moment the page loads
      const blogCountdownTarget = Date.now() + 15 * 24 * 60 * 60 * 1000;
      function updateCountdown() {
        const now = Date.now();
        const distance = blogCountdownTarget - now;

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        document.getElementById('countdown-days').textContent = days.toString().padStart(2, '0');
        document.getElementById('countdown-hours').textContent = hours.toString().padStart(2, '0');
        document.getElementById('countdown-minutes').textContent = minutes.toString().padStart(2, '0');
        document.getElementById('countdown-seconds').textContent = seconds.toString().padStart(2, '0');

        if (distance < 0) {
          clearInterval(countdownInterval);
          document.getElementById('countdown-days').textContent = '00';
          document.getElementById('countdown-hours').textContent = '00';
          document.getElementById('countdown-minutes').textContent = '00';
          document.getElementById('countdown-seconds').textContent = '00';
        }
      }

      const countdownInterval = setInterval(updateCountdown, 1000);
      updateCountdown(); // Initial call

      /* --- Contact Form Handler --- */
      const contactForm = document.getElementById('contactForm');
      if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
          e.preventDefault();
          const formStatus = document.getElementById('formStatus');
          const submitButton = contactForm.querySelector('button[type="submit"]');
          
          // Get form data
          const name = contactForm.elements['name'].value.trim();
          const email = contactForm.elements['email'].value.trim();
          const subject = contactForm.elements['subject'].value.trim();
          const message = contactForm.elements['message'].value.trim();
          
          if (!name || !email || !subject || !message) {
            formStatus.textContent = 'Please fill in all required fields.';
            return;
          }

          try {
            // Disable submit button and show loading state
            submitButton.disabled = true;
            formStatus.textContent = 'Sending message...';
            
            // Send email using EmailJS
            await emailjs.send(
              'YOUR_SERVICE_ID', // Replace with your EmailJS service ID
              'YOUR_TEMPLATE_ID', // Replace with your EmailJS template ID
              {
                to_email: 'kvashok1994@gmail.com',
                from_name: name,
                from_email: email,
                subject: subject,
                message: message,
              }
            );

            // Show success message
            formStatus.textContent = 'Message sent successfully! ✨';
            contactForm.reset();
            
            // Clear success message after 5 seconds
            setTimeout(() => {
              formStatus.textContent = '';
            }, 5000);

          } catch (error) {
            console.error('Email send failed:', error);
            formStatus.textContent = 'Failed to send message. Please try again.';
          } finally {
            // Re-enable submit button
            submitButton.disabled = false;
          }
        });
      }
   