document.addEventListener("DOMContentLoaded", () => {
    /* ==========================================
       1. SCROLL ANIMATIONS
       ========================================== */
    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('show-scroll');
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

    document.querySelectorAll('.hidden-scroll').forEach(el => observer.observe(el));

    /* ==========================================
       2. MOBILE NAVIGATION
       ========================================== */
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const links = document.querySelectorAll('.nav-links li');

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('nav-active');
            hamburger.classList.toggle('toggle');
        });

        links.forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('nav-active');
                hamburger.classList.remove('toggle');
            });
        });
    }

    /* ==========================================
       3. BACKGROUND WAVES
       ========================================== */
    const bgCanvas = document.getElementById('bg-sine-waves');
    
    if (bgCanvas) {
        const bgCtx = bgCanvas.getContext('2d');
        
        function resizeBg() {
            bgCanvas.width = window.innerWidth;
            bgCanvas.height = window.innerHeight;
        }
        window.addEventListener('resize', resizeBg);
        resizeBg();

        let bgTime = 0;
        let scannerX = 0; 
        const scannerSpeed = 2.5; 

        function drawBgWaves() {
            // CRASH PREVENTION: Do not draw if canvas hasn't sized yet
            if (bgCanvas.width === 0 || bgCanvas.height === 0) {
                requestAnimationFrame(drawBgWaves);
                return;
            }

            bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
            
            // Move Scanner
            scannerX += scannerSpeed;
            if (scannerX > bgCanvas.width + 200) {
                scannerX = -100; // Loop back
            }

            // Define the 3 Mathematical Waves
            const waves = [
                { yOff: 0.25, type: 'sine', amp: 40, freq: 0.003 },
                { yOff: 0.55, type: 'am', amp: 45, carrierFreq: 0.08, modFreq: 0.003 },
                { yOff: 0.85, type: 'am', amp: 35, carrierFreq: 0.15, modFreq: 0.005 }
            ];

            // PASS 1: Draw Faint Base Waves (Faint Green)
            bgCtx.lineWidth = 1.5;
            bgCtx.strokeStyle = 'rgba(57, 255, 20, 0.08)'; 
            
            waves.forEach(wave => {
                bgCtx.beginPath();
                const centerY = bgCanvas.height * wave.yOff;
                for(let x = 0; x < bgCanvas.width; x++) {
                    let y = centerY;
                    if (wave.type === 'sine') {
                        y += Math.sin(x * wave.freq - bgTime * 0.5) * wave.amp;
                    } else if (wave.type === 'am') {
                        const envelope = 1 + 0.8 * Math.sin(x * wave.modFreq - bgTime * 0.5);
                        y += envelope * Math.sin(x * wave.carrierFreq) * wave.amp;
                    }
                    if(x === 0) bgCtx.moveTo(x, y); 
                    else bgCtx.lineTo(x, y);
                }
                bgCtx.stroke();
            });

            // PASS 2: Draw the Bright "Scanned" Trail using a Clipping Mask
            bgCtx.save();
            bgCtx.beginPath();
            const trailWidth = 300; // Length of the glowing tail
            bgCtx.rect(scannerX - trailWidth, 0, trailWidth, bgCanvas.height);
            bgCtx.clip(); // Restrict drawing to only inside this rectangle

            // Neon Green Gradient for the trail
            const grad = bgCtx.createLinearGradient(scannerX - trailWidth, 0, scannerX, 0);
            grad.addColorStop(0, 'rgba(57, 255, 20, 0)');     // Fade out at tail
            grad.addColorStop(0.8, 'rgba(57, 255, 20, 0.4)'); // Mid-glow
            grad.addColorStop(1, 'rgba(57, 255, 20, 0.9)');    // Brightest at scanner head

            bgCtx.strokeStyle = grad;
            bgCtx.lineWidth = 2;

            waves.forEach(wave => {
                bgCtx.beginPath();
                const centerY = bgCanvas.height * wave.yOff;
                const startX = Math.max(0, scannerX - trailWidth);
                const endX = Math.min(bgCanvas.width, scannerX);
                
                for(let x = startX; x <= endX; x++) {
                    let y = centerY;
                    if (wave.type === 'sine') {
                        y += Math.sin(x * wave.freq - bgTime * 0.5) * wave.amp;
                    } else if (wave.type === 'am') {
                        const envelope = 1 + 0.8 * Math.sin(x * wave.modFreq - bgTime * 0.5);
                        y += envelope * Math.sin(x * wave.carrierFreq) * wave.amp;
                    }
                    if(x === startX) bgCtx.moveTo(x, y); 
                    else bgCtx.lineTo(x, y);
                }
                bgCtx.stroke();
            });
            bgCtx.restore(); // Remove clipping mask

            // PASS 3: Draw the Vertical Scanner Line
            bgCtx.beginPath();
            bgCtx.moveTo(scannerX, 0);
            bgCtx.lineTo(scannerX, bgCanvas.height);
            bgCtx.strokeStyle = 'rgba(57, 255, 20, 0.3)'; // Faint green vertical line
            bgCtx.lineWidth = 1;
            bgCtx.stroke();

            bgTime += 0.02; 
            requestAnimationFrame(drawBgWaves);
        }
        drawBgWaves();
    }

    /* ==========================================
       4. RADIO PRELOADER LOGIC
       ========================================== */
    const preloader = document.getElementById('radio-preloader');
    if (preloader) {
        document.body.style.overflow = 'hidden'; // Lock scroll

        const pCanvas = document.getElementById('waveCanvas');
        const pCtx = pCanvas.getContext('2d');
        const textElement = document.getElementById('carrier-text');
        const signalBars = document.getElementById('signal-bars');
        const dialIndicator = document.getElementById('dial-indicator');
        const ticksWrapper = document.getElementById('ticks-wrapper');
        const skipBtn = document.getElementById('skip-preloader');

        if (ticksWrapper) {
            for (let i = 0; i < 40; i++) {
                const tick = document.createElement('div');
                tick.classList.add('tick');
                if (i % 8 === 0) tick.classList.add('tall');
                ticksWrapper.appendChild(tick);
            }
        }

        function resizePreloader() {
            pCanvas.width = window.innerWidth;
            pCanvas.height = window.innerHeight;
        }
        window.addEventListener('resize', resizePreloader);
        resizePreloader();

        const stars = Array.from({ length: 150 }, () => ({
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            opacity: Math.random()
        }));

        let pTime = 0;
        let dialPos = 10; 
        let dialDirection = 1; 

        const params = { amplitude: 15, frequency: 0.2, noiseLevel: 35, speed: 0.8, grainAlpha: 1 };
        const target = { ...params };

        function lerp(start, end, factor) { return start + (end - start) * factor; }

        function drawPreloaderWave() {
            if (preloader.classList.contains('fade-out')) return; 
            
            pCtx.clearRect(0, 0, pCanvas.width, pCanvas.height);
            
            if (params.grainAlpha > 0) {
                pCtx.fillStyle = `rgba(59, 130, 246, ${params.grainAlpha * 0.5})`;
                stars.forEach(s => pCtx.fillRect(s.x, s.y, 1.5, 1.5));
            }

            params.amplitude = lerp(params.amplitude, target.amplitude, 0.05);
            params.frequency = lerp(params.frequency, target.frequency, 0.05);
            params.noiseLevel = lerp(params.noiseLevel, target.noiseLevel, 0.05);
            params.speed = lerp(params.speed, target.speed, 0.05);
            params.grainAlpha = lerp(params.grainAlpha, target.grainAlpha, 0.02);

            pCtx.beginPath();
            pCtx.strokeStyle = '#3b82f6'; 
            pCtx.lineWidth = params.noiseLevel < 5 ? 3 : 2; 
            pCtx.shadowBlur = params.noiseLevel < 5 ? 10 : 0;
            pCtx.shadowColor = '#3b82f6';

            const centerY = pCanvas.height / 2;
            for (let x = 0; x < pCanvas.width; x++) {
                const noise = (Math.random() - 0.5) * params.noiseLevel; 
                const y = centerY + Math.sin(x * params.frequency + pTime) * params.amplitude + noise;
                if (x === 0) pCtx.moveTo(x, y); else pCtx.lineTo(x, y);
            }
            pCtx.stroke();
            pCtx.shadowBlur = 0; 
            
            pTime -= params.speed; 
            requestAnimationFrame(drawPreloaderWave);
        }
        drawPreloaderWave();

        let isScanning = true;
        function moveDial() {
            if (!isScanning) return;
            dialPos += dialDirection * 1.5; 
            if (dialPos > 90 || dialPos < 10) dialDirection *= -1; 
            if (dialIndicator) dialIndicator.style.left = `${dialPos}%`;
            setTimeout(moveDial, 50);
        }
        moveDial();

        let textTimeout;
        function typeText(text, callback) {
            if (!textElement) return;
            textElement.textContent = "";
            let charIndex = 0;
            function typeNext() {
                if (charIndex < text.length) {
                    textElement.textContent += text.charAt(charIndex);
                    charIndex++;
                    textTimeout = setTimeout(typeNext, 30 + Math.random() * 40); 
                } else if (callback) {
                    textTimeout = setTimeout(callback, 800); 
                }
            }
            typeNext();
        }

        function endPreloader() {
            clearTimeout(textTimeout);
            preloader.classList.add('fade-out');
            setTimeout(() => {
                preloader.style.display = 'none';
                document.body.style.overflow = 'auto';
            }, 600);
        }

        if (skipBtn) skipBtn.addEventListener('click', endPreloader);
        document.addEventListener('keydown', (e) => { if(e.key === 'Escape') endPreloader(); });

        // Sequence
        textTimeout = setTimeout(() => {
            typeText("scanning bandwidth.....", () => {
                isScanning = false;
                if (dialIndicator) dialIndicator.style.left = "50%"; 
                if (signalBars) signalBars.classList.add('active'); 
                
                target.amplitude = 40; target.frequency = 0.02; target.noiseLevel = 12; target.speed = 0.1;
                
                typeText("Carrier frequency detected......", () => {
                    target.amplitude = 100; target.frequency = 0.012; target.noiseLevel = 0; target.speed = 0.04; target.grainAlpha = 0; 
                    
                    typeText("Reconstructing telemetry and directing traffic.....", () => {
                        endPreloader();
                    });
                });
            });
        }, 400); 
    }
});