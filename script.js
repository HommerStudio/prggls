document.addEventListener("DOMContentLoaded", () => {

    /* =========================================
       DOM ELEMENTS
    ========================================= */
    const cursor = document.getElementById('cursor');
    const cursorDot = document.getElementById('cursor-dot');
    const langBtns = document.querySelectorAll('.lang-btn');
    const entryOverlay = document.getElementById('entry-overlay');
    const mainSite = document.getElementById('main-site');
    const menuBtn = document.getElementById('menu-btn');
    const drawer = document.getElementById('drawer');
    const drawerOverlay = document.getElementById('drawer-overlay');
    const menuLinks = document.querySelectorAll('.menu-link');
    const menuCanvas = document.getElementById('menu-canvas');

    /* =========================================
       AUDIO SYSTEM (Soft Glass Dings)
    ========================================= */
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    let audioCtx;

    function playDing(frequency = 880, volume = 0.1) {
        if (!audioCtx) audioCtx = new AudioContext();
        if (audioCtx.state === 'suspended') audioCtx.resume();

        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(frequency, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(frequency * 0.9, audioCtx.currentTime + 0.4);

        gain.gain.setValueAtTime(volume, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);

        osc.start();
        osc.stop(audioCtx.currentTime + 0.5);
    }

    // Attach sound to elements with data-sound attribute
    document.querySelectorAll('[data-sound]').forEach(el => {
        el.addEventListener('mouseenter', () => playDing(1318, 0.05)); // Soft high pitch on hover
    });

    /* =========================================
       CUSTOM CURSOR
    ========================================= */
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let cursorX = mouseX;
    let cursorY = mouseY;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        // Dot follows instantly
        cursorDot.style.left = `${mouseX}px`;
        cursorDot.style.top = `${mouseY}px`;
    });

    // Ring follows with easing
    function animateCursor() {
        cursorX += (mouseX - cursorX) * 0.15;
        cursorY += (mouseY - cursorY) * 0.15;
        cursor.style.left = `${cursorX}px`;
        cursor.style.top = `${cursorY}px`;
        requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // Click effect for cursor
    document.addEventListener('mousedown', () => {
        cursor.style.width = '16px';
        cursor.style.height = '16px';
        cursor.style.background = 'rgba(255, 255, 255, 0.1)';
    });

    document.addEventListener('mouseup', () => {
        cursor.style.width = '32px';
        cursor.style.height = '32px';
        cursor.style.background = 'transparent';
    });

    /* =========================================
       LANGUAGE SELECTION / ENTRY LOGIC
    ========================================= */
    langBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            playDing(1047, 0.15); // Confirmation ding
            
            // Fade out the entry overlay
            entryOverlay.classList.add('hidden');
            
            // Wait slightly, then reveal the main site
            setTimeout(() => {
                mainSite.classList.remove('hidden');
            }, 600); 
        });
    });

    /* =========================================
       DRAWER MENU LOGIC
    ========================================= */
    let isDrawerOpen = false;

    function toggleDrawer() {
        isDrawerOpen = !isDrawerOpen;
        drawer.classList.toggle('open', isDrawerOpen);
        drawerOverlay.classList.toggle('open', isDrawerOpen);
        playDing(isDrawerOpen ? 880 : 659, 0.1); // Different pitch for open vs close
    }

    menuBtn.addEventListener('click', toggleDrawer);
    drawerOverlay.addEventListener('click', toggleDrawer);

    // Close drawer when a link is clicked
    menuLinks.forEach(link => {
        link.addEventListener('click', () => {
            setTimeout(toggleDrawer, 300);
        });
    });

    /* =========================================
       RGB SPIRAL MENU ANIMATION (Canvas)
    ========================================= */
    const mCtx = menuCanvas.getContext('2d');
    let mAngle = 0;
    let isMenuHovered = false;

    menuBtn.addEventListener('mouseenter', () => isMenuHovered = true);
    menuBtn.addEventListener('mouseleave', () => isMenuHovered = false);

    function drawMenuCanvas() {
        mCtx.clearRect(0, 0, 50, 50);
        const cx = 25, cy = 25;
        
        // Tricolor Palette (Red, Green, Blue) matching CSS
        const spirals = [
            [0, '#e64539'],               // Red
            [Math.PI * 2 / 3, '#27a34a'], // Green
            [Math.PI * 4 / 3, '#1e78d6']  // Blue
        ];

        spirals.forEach(([phase, color]) => {
            mCtx.beginPath();
            mCtx.strokeStyle = color;
            mCtx.lineWidth = 1.5;
            mCtx.shadowColor = color;
            mCtx.shadowBlur = isMenuHovered ? 8 : 4; // Glow more on hover

            for (let t = 0; t <= Math.PI * 4; t += 0.05) {
                // Mathematical spiral logic
                const r = 9 + Math.sin(t * 1.5 + phase) * 4.5;
                const x = cx + r * Math.cos(t + phase + mAngle);
                const y = cy + r * Math.sin(t * 0.7 + phase + mAngle * 0.6);
                
                t === 0 ? mCtx.moveTo(x, y) : mCtx.lineTo(x, y);
            }
            
            mCtx.stroke();
            mCtx.shadowBlur = 0;
        });

        // Speed up rotation when hovered
        mAngle += isMenuHovered ? 0.05 : 0.015;
        requestAnimationFrame(drawMenuCanvas);
    }
    
    // Start canvas animation loop
    drawMenuCanvas();

});
