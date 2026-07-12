document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide Icons
    lucide.createIcons();

    // ==========================================================================
    // INITIALS LOADER & REVEALS
    // ==========================================================================
    const loader = document.getElementById('loader');
    
    window.addEventListener('load', () => {
        // Allow the loader circle draw animation to play out
        setTimeout(() => {
            loader.style.opacity = '0';
            setTimeout(() => {
                loader.style.display = 'none';
                // Trigger hero reveal animations
                triggerHeroReveals();
            }, 800);
        }, 1500);
    });

    // In case load event doesn't fire (failsafe)
    setTimeout(() => {
        if (loader.style.display !== 'none') {
            loader.style.opacity = '0';
            setTimeout(() => {
                loader.style.display = 'none';
                triggerHeroReveals();
            }, 800);
        }
    }, 3000);

    function triggerHeroReveals() {
        const heroReveals = document.querySelectorAll('.hero-section .animate-reveal');
        heroReveals.forEach((element, index) => {
            setTimeout(() => {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
                element.style.transition = 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.8s ease';
            }, index * 150);
        });
        
        // Start typing animation after reveal begins
        setTimeout(startTypingAnimation, 600);
    }


    // ==========================================================================
    // THEME TOGGLE (DARK / LIGHT)
    // ==========================================================================
    const themeToggleBtn = document.getElementById('theme-toggle');
    const htmlElement = document.documentElement;
    
    // Retrieve theme preference or default to dark
    const savedTheme = localStorage.getItem('portfolio-theme') || 'dark';
    htmlElement.setAttribute('data-theme', savedTheme);
    updateThemeToggleIcon(savedTheme);

    themeToggleBtn.addEventListener('click', () => {
        const currentTheme = htmlElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        htmlElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('portfolio-theme', newTheme);
        updateThemeToggleIcon(newTheme);
        
        // Redraw canvas/particles for theme change if necessary
        initParticles();
    });

    function updateThemeToggleIcon(theme) {
        // Trigger a tiny rotation on theme click
        themeToggleBtn.style.transform = 'rotate(15deg)';
        setTimeout(() => themeToggleBtn.style.transform = 'rotate(0)', 200);
    }


    // ==========================================================================
    // CUSTOM CURSOR TRAIL
    // ==========================================================================
    const cursorDot = document.querySelector('.custom-cursor-dot');
    const cursorOutline = document.querySelector('.custom-cursor-outline');
    let mouseX = 0, mouseY = 0;
    let outlineX = 0, outlineY = 0;

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        // Direct movement for the inner dot
        cursorDot.style.left = `${mouseX}px`;
        cursorDot.style.top = `${mouseY}px`;
    });

    // Lagged movement for the outer circle
    function animateCursor() {
        const speed = 0.15; // Delay factor
        
        outlineX += (mouseX - outlineX) * speed;
        outlineY += (mouseY - outlineY) * speed;
        
        cursorOutline.style.left = `${outlineX}px`;
        cursorOutline.style.top = `${outlineY}px`;
        
        requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // Expand cursor outline on hovers
    const interactiveElements = document.querySelectorAll('a, button, .skill-tab-btn, .project-card, .value-card, .stat-card, input, textarea, .orbit-item');
    
    interactiveElements.forEach((el) => {
        el.addEventListener('mouseenter', () => {
            cursorOutline.style.width = '50px';
            cursorOutline.style.height = '50px';
            cursorOutline.style.borderColor = 'var(--accent-primary)';
            cursorOutline.style.backgroundColor = 'rgba(var(--accent-primary-rgb), 0.05)';
            cursorDot.style.transform = 'translate(-50%, -50%) scale(1.5)';
        });
        
        el.addEventListener('mouseleave', () => {
            cursorOutline.style.width = '32px';
            cursorOutline.style.height = '32px';
            cursorOutline.style.borderColor = 'rgba(var(--accent-primary-rgb), 0.5)';
            cursorOutline.style.backgroundColor = 'transparent';
            cursorDot.style.transform = 'translate(-50%, -50%) scale(1)';
        });
    });


    // ==========================================================================
    // MOUSE GLOW BACKGROUND EFFECT
    // ==========================================================================
    const mouseGlow = document.getElementById('mouse-glow');
    
    window.addEventListener('mousemove', (e) => {
        mouseGlow.style.left = `${e.clientX}px`;
        mouseGlow.style.top = `${e.clientY}px`;
    });


    // ==========================================================================
    // INTERACTIVE PARTICLE CANVAS BACKGROUND
    // ==========================================================================
    const canvas = document.getElementById('particles-canvas');
    const ctx = canvas.getContext('2d');
    let particlesArray = [];
    
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', () => {
        resizeCanvas();
        initParticles();
    });
    resizeCanvas();

    class Particle {
        constructor(x, y, directionX, directionY, size, color) {
            this.x = x;
            this.y = y;
            this.directionX = directionX;
            this.directionY = directionY;
            this.size = size;
            this.color = color;
        }
        
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
            ctx.fillStyle = this.color;
            ctx.fill();
        }
        
        update() {
            if (this.x > canvas.width || this.x < 0) {
                this.directionX = -this.directionX;
            }
            if (this.y > canvas.height || this.y < 0) {
                this.directionY = -this.directionY;
            }
            
            // Mouse repelling
            let dx = mouseX - this.x;
            let dy = mouseY - this.y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 120) {
                const force = (120 - distance) / 120;
                this.x -= (dx / distance) * force * 3;
                this.y -= (dy / distance) * force * 3;
            }
            
            this.x += this.directionX;
            this.y += this.directionY;
            
            this.draw();
        }
    }

    function initParticles() {
        particlesArray = [];
        const isLightTheme = htmlElement.getAttribute('data-theme') === 'light';
        const particleCount = Math.floor((canvas.width * canvas.height) / 12000); // Responsive density
        
        const color = isLightTheme ? 'rgba(109, 40, 217, 0.12)' : 'rgba(139, 92, 246, 0.15)';
        
        for (let i = 0; i < Math.min(particleCount, 120); i++) {
            let size = (Math.random() * 2) + 1;
            let x = (Math.random() * (canvas.width - size * 2) + size * 2);
            let y = (Math.random() * (canvas.height - size * 2) + size * 2);
            let directionX = (Math.random() * 0.4) - 0.2;
            let directionY = (Math.random() * 0.4) - 0.2;
            
            particlesArray.push(new Particle(x, y, directionX, directionY, size, color));
        }
    }

    function connectParticles() {
        const isLightTheme = htmlElement.getAttribute('data-theme') === 'light';
        const lineColor = isLightTheme ? 'rgba(109, 40, 217, 0.04)' : 'rgba(139, 92, 246, 0.05)';
        
        for (let a = 0; a < particlesArray.length; a++) {
            for (let b = a; b < particlesArray.length; b++) {
                let dx = particlesArray[a].x - particlesArray[b].x;
                let dy = particlesArray[a].y - particlesArray[b].y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 140) {
                    ctx.strokeStyle = lineColor;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                    ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
                    ctx.stroke();
                }
            }
        }
    }

    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        for (let i = 0; i < particlesArray.length; i++) {
            particlesArray[i].update();
        }
        connectParticles();
        requestAnimationFrame(animateParticles);
    }

    initParticles();
    animateParticles();


    // ==========================================================================
    // HERO TYPING ANIMATION
    // ==========================================================================
    const typingSpan = document.getElementById('typing-text');
    const professions = [
        'Java Full Stack Developer',
        'IT Executive @ Mindstix Foundation Trust',
        'M.Sc. IT Student & Lifelong Learner',
        'NSS Volunteer & Community Leader',
        'Software Developer & QA Enthusiast'
    ];
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    function startTypingAnimation() {
        const currentWord = professions[wordIndex];
        
        if (isDeleting) {
            typingSpan.textContent = currentWord.substring(0, charIndex - 1);
            charIndex--;
        } else {
            typingSpan.textContent = currentWord.substring(0, charIndex + 1);
            charIndex++;
        }
        
        let typingSpeed = 100;
        
        if (isDeleting) {
            typingSpeed /= 2; // Erase twice as fast
        }
        
        if (!isDeleting && charIndex === currentWord.length) {
            typingSpeed = 2000; // Pause at end of word
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            wordIndex = (wordIndex + 1) % professions.length;
            typingSpeed = 500; // Pause before typing next word
        }
        
        setTimeout(startTypingAnimation, typingSpeed);
    }


    // ==========================================================================
    // STICKY GLASS HEADER & SCROLL PROGRESS
    // ==========================================================================
    const header = document.querySelector('.header');
    const scrollProgress = document.getElementById('scroll-progress');
    const backToTopBtn = document.getElementById('back-to-top');

    window.addEventListener('scroll', () => {
        // Sticky Header class
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        // Scroll progress width
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        scrollProgress.style.width = `${scrolled}%`;
        
        // Back to top button visibility
        if (window.scrollY > 500) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    });

    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });


    // ==========================================================================
    // ACTIVE NAVIGATION LINKS HIGHLIGHT
    // ==========================================================================
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link:not(.nav-btn-contact)');

    window.addEventListener('scroll', () => {
        let current = '';
        
        sections.forEach((section) => {
            const sectionTop = section.offsetTop - 120;
            const sectionHeight = section.clientHeight;
            
            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach((link) => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });


    // ==========================================================================
    // MOBILE MENU TOGGLE
    // ==========================================================================
    const mobileToggle = document.querySelector('.mobile-nav-toggle');
    const navbar = document.querySelector('.navbar');

    mobileToggle.addEventListener('click', () => {
        mobileToggle.classList.toggle('active');
        navbar.classList.toggle('active');
    });

    // Close menu when clicking nav link
    const navLinksAll = document.querySelectorAll('.nav-link');
    navLinksAll.forEach(link => {
        link.addEventListener('click', () => {
            mobileToggle.classList.remove('active');
            navbar.classList.remove('active');
        });
    });


    // ==========================================================================
    // SCROLL REVEALS & SKILL BAR ANIMATIONS
    // ==========================================================================
    const revealElements = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');
    const skillBars = document.querySelectorAll('.skill-bar');

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                
                // If it is the stats section, start counting numbers
                if (entry.target.classList.contains('about-stats-column')) {
                    animateStats();
                }
                
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    revealElements.forEach(el => revealObserver.observe(el));

    // Special observer for skill bar triggers
    const skillsSection = document.getElementById('skills');
    const skillBarObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                skillBars.forEach(bar => {
                    const targetWidth = bar.getAttribute('data-width');
                    bar.style.width = targetWidth;
                });
                skillBarObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });
    
    if (skillsSection) skillBarObserver.observe(skillsSection);


    // ==========================================================================
    // ANIMATE STATS COUNTER INCREMENTS
    // ==========================================================================
    let statsAnimated = false;

    function animateStats() {
        if (statsAnimated) return;
        statsAnimated = true;
        
        const statNums = document.querySelectorAll('.stat-num');
        
        statNums.forEach(num => {
            const targetVal = parseInt(num.getAttribute('data-val'));
            const duration = 2000; // 2 seconds
            const steps = 50;
            const stepVal = targetVal / steps;
            let currentVal = 0;
            let currentStep = 0;
            
            const interval = setInterval(() => {
                currentVal += stepVal;
                currentStep++;
                
                num.textContent = Math.round(currentVal);
                
                if (currentStep >= steps) {
                    num.textContent = targetVal;
                    clearInterval(interval);
                }
            }, duration / steps);
        });
    }


    // ==========================================================================
    // SKILLS TAB SWITCHING
    // ==========================================================================
    const skillTabs = document.querySelectorAll('.skill-tab-btn');
    const skillPanes = document.querySelectorAll('.skill-pane');

    skillTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetPaneId = tab.getAttribute('data-tab');
            
            // Toggle active classes
            skillTabs.forEach(t => t.classList.remove('active'));
            skillPanes.forEach(p => p.classList.remove('active'));
            
            tab.classList.add('active');
            const targetPane = document.getElementById(targetPaneId);
            targetPane.classList.add('active');
            
            // Re-animate the skill bars inside the clicked tab
            const bars = targetPane.querySelectorAll('.skill-bar');
            bars.forEach(bar => {
                bar.style.width = '0%';
                setTimeout(() => {
                    bar.style.width = bar.getAttribute('data-width');
                }, 50);
            });
        });
    });


    // ==========================================================================
    // 3D TILT EFFECT
    // ==========================================================================
    const tiltElements = document.querySelectorAll('.3d-tilt');
    
    tiltElements.forEach(el => {
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            
            // Coordinates relative to card center
            const x = e.clientX - rect.left - (rect.width / 2);
            const y = e.clientY - rect.top - (rect.height / 2);
            
            // Scale rotation (max 10 degrees)
            const rotateX = -(y / (rect.height / 2)) * 8;
            const rotateY = (x / (rect.width / 2)) * 8;
            
            el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        });
        
        el.addEventListener('mouseleave', () => {
            el.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
        });
    });


    // ==========================================================================
    // MAGNETIC BUTTONS
    // ==========================================================================
    const magneticBtns = document.querySelectorAll('.magnetic');
    
    magneticBtns.forEach(btn => {
        const strength = parseInt(btn.getAttribute('data-strength')) || 10;
        
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - (rect.width / 2);
            const y = e.clientY - rect.top - (rect.height / 2);
            
            // Move button towards the mouse coordinates
            btn.style.transform = `translate(${x / (rect.width / 2) * strength}px, ${y / (rect.height / 2) * strength}px)`;
            
            const btnSpan = btn.querySelector('span');
            const btnIcon = btn.querySelector('i');
            if (btnSpan) btnSpan.style.transform = `translate(${x / (rect.width / 2) * (strength / 2)}px, ${y / (rect.height / 2) * (strength / 2)}px)`;
            if (btnIcon) btnIcon.style.transform = `translate(${x / (rect.width / 2) * (strength / 2)}px, ${y / (rect.height / 2) * (strength / 2)}px)`;
        });
        
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'translate(0, 0)';
            const btnSpan = btn.querySelector('span');
            const btnIcon = btn.querySelector('i');
            if (btnSpan) btnSpan.style.transform = 'translate(0, 0)';
            if (btnIcon) btnIcon.style.transform = 'translate(0, 0)';
        });
    });


    // ==========================================================================
    // DYNAMIC PROJECT FILTERING
    // ==========================================================================
    const filterButtons = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');

    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const filterValue = btn.getAttribute('data-filter');
            
            // Update active filter button
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Filter cards
            projectCards.forEach(card => {
                const category = card.getAttribute('data-category');
                
                if (filterValue === 'all' || category === filterValue) {
                    card.style.display = 'flex';
                    // Re-trigger scale-in fade animation
                    card.style.animation = 'none';
                    card.offsetHeight; // Trigger reflow
                    card.style.animation = 'fade-in-scale 0.5s ease forwards';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });


    // ==========================================================================
    // MOCK INTERACTIVE GITHUB CONTRIBUTION HEATMAP
    // ==========================================================================
    const heatmapGrid = document.getElementById('heatmap-grid');
    
    if (heatmapGrid) {
        const totalWeeks = 53;
        const totalDays = 7;
        const totalCells = totalWeeks * totalDays;
        
        // Generate dates for the past 371 days leading up to today (July 12, 2026)
        const endDate = new Date('2026-07-12');
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - totalCells + 1);
        
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        
        let gridHTML = '';
        
        for (let col = 0; col < totalWeeks; col++) {
            for (let row = 0; row < totalDays; row++) {
                // Calculate date for this cell
                const cellIndex = (col * totalDays) + row;
                const cellDate = new Date(startDate);
                cellDate.setDate(startDate.getDate() + cellIndex);
                
                // Formulate commitments (heavier on weekdays, light on weekends)
                const isWeekend = cellDate.getDay() === 0 || cellDate.getDay() === 6;
                let commits = 0;
                
                // Standard randomness factor
                const rand = Math.random();
                if (isWeekend) {
                    commits = rand > 0.7 ? Math.floor(rand * 4) : 0;
                } else {
                    commits = rand > 0.2 ? Math.floor(rand * 8) + 1 : 0;
                }
                
                // Level mapping (0 to 4 commits levels)
                let level = 0;
                if (commits > 0 && commits <= 2) level = 1;
                else if (commits > 2 && commits <= 4) level = 2;
                else if (commits > 4 && commits <= 6) level = 3;
                else if (commits > 6) level = 4;
                
                const dateString = `${monthNames[cellDate.getMonth()]} ${cellDate.getDate()}, ${cellDate.getFullYear()}`;
                const commitText = commits === 0 ? 'No commits' : `${commits} commit${commits > 1 ? 's' : ''}`;
                const tooltipText = `${commitText} on ${dateString}`;
                
                gridHTML += `<div class="heatmap-cell level-${level}" data-tooltip="${tooltipText}"></div>`;
            }
        }
        
        heatmapGrid.innerHTML = gridHTML;
    }


    // ==========================================================================
    // INTERACTIVE CONTACT FORM & POPUP SUCCESS STATE
    // ==========================================================================
    const contactForm = document.getElementById('contact-form');
    const contactSuccess = document.getElementById('contact-success');
    const successCloseBtn = document.getElementById('success-close-btn');

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Fetch inputs
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalBtnContent = submitBtn.innerHTML;
            
            // Mock submitting feedback
            submitBtn.disabled = true;
            submitBtn.innerHTML = `<span>Sending...</span><i data-lucide="loader" class="animate-spin"></i>`;
            lucide.createIcons();
            
            setTimeout(() => {
                // Show Success Popup
                contactSuccess.classList.add('active');
                
                // Reset Form elements
                contactForm.reset();
                
                // Reset submit button state
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnContent;
                lucide.createIcons();
            }, 1800);
        });
    }

    if (successCloseBtn) {
        successCloseBtn.addEventListener('click', () => {
            contactSuccess.classList.remove('active');
        });
    }
});
