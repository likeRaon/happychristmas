document.addEventListener('DOMContentLoaded', () => {
    console.log("Merry Christmas! v4 Initializing..."); 
    initScene(); 
    decorateTree();
    setupInteractions();
    setupEasterEggs();
    setupParallax(); 
});

let snowMode = 'snow'; // 'snow' | 'heart'

function initScene() {
    const canvas = document.getElementById('snowCanvas');
    const ctx = canvas.getContext('2d');
    
    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    // --- Snow System ---
    const snowflakes = [];
    const maxSnowflakes = 1200; 
    
    // --- Firework System ---
    let particles = [];
    let textFireworks = []; // Store text particles

    // Mouse tracking
    let mouse = { x: -100, y: -100 };
    let lastMouse = { x: -100, y: -100 };
    
    document.addEventListener('mousemove', (e) => {
        lastMouse.x = mouse.x;
        lastMouse.y = mouse.y;
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    // Click for Fireworks
    document.addEventListener('click', (e) => {
        createFirework(e.clientX, e.clientY);
    });

    // Keyboard Fireworks
    window.addEventListener('keydown', (e) => {
        // 디버깅용 로그: 어떤 키가 눌렸는지 확인
        console.log('Keydown:', e.code, e.key);

        // 한글 입력 중일 때도 작동하도록 e.code 사용 (KeyA, KeyB...)
        if (e.code.startsWith('Key')) {
            const char = e.code.slice(3); // "KeyA" -> "A"
            
            // Random position in the sky (top 70%)
            const x = Math.random() * (width - 100) + 50;
            const y = Math.random() * (height * 0.7) + 50;
            
            const color = `hsl(${Math.random() * 360}, 100%, 70%)`;
            
            // Create Explosion
            createFirework(x, y, color);
            
            // Create Text
            textFireworks.push(new TextFirework(x, y, char, color));
        }
    });

    function createFirework(x, y, color = null) {
        const finalColor = color || `hsl(${Math.random() * 360}, 50%, 50%)`;
        const particleCount = 30;
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle(x, y, finalColor));
        }
    }

    // Resize handler
    window.addEventListener('resize', () => {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
    });

    // --- Classes ---

    class Snowflake {
        constructor() {
            this.reset();
            this.y = Math.random() * height;
        }

        reset() {
            this.x = Math.random() * width;
            this.y = -10;
            this.size = Math.floor(Math.random() * 3 + 2); 
            this.size = this.size - (this.size % 2); 
            if (this.size < 2) this.size = 2;
            
            this.speed = Math.random() * 1.5 + 0.5; 
            this.velX = Math.random() * 1 - 0.5; 
            this.opacity = Math.random() * 0.5 + 0.5;
            
            this.resting = false; 
        }

        update() {
            const stickHeight = 50;
            const radius = 50; 
            const umbrellaCenterY = mouse.y - stickHeight; 

            if (this.resting) {
                const mouseDist = Math.abs(mouse.x - lastMouse.x) + Math.abs(mouse.y - lastMouse.y);
                if (mouseDist > 5) {
                    this.resting = false;
                    this.speed = Math.random() * 1.5 + 0.5;
                    return;
                }

                const dx = this.x - mouse.x;
                
                const slideFactor = 0.05;
                if (dx > 0) this.x += Math.abs(dx) * slideFactor;
                else this.x -= Math.abs(dx) * slideFactor;

                const newDx = this.x - mouse.x;
                
                if (Math.abs(newDx) >= radius) {
                    this.resting = false;
                    this.speed = Math.random() * 1.5 + 0.5;
                } else {
                    this.y = umbrellaCenterY - Math.sqrt(radius*radius - newDx*newDx);
                }
            } else {
                this.y += this.speed;
                this.x += this.velX;

                const dx = this.x - mouse.x;
                const dy = this.y - umbrellaCenterY;
                const dist = Math.sqrt(dx*dx + dy*dy);

                if (dist < radius && this.y < umbrellaCenterY) {
                    this.resting = true;
                    this.y = umbrellaCenterY - Math.sqrt(radius*radius - dx*dx);
                    this.speed = 0;
                    this.velX = 0;
                }
            }
            
            if (this.y > height) {
                this.reset();
            }
            if (this.x > width) this.x = 0;
            if (this.x < 0) this.x = width;
        }

        draw() {
            ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
            
            if (snowMode === 'heart') {
                ctx.font = `${this.size * 3}px serif`; 
                ctx.fillText('❤', this.x, this.y);
            } else {
                ctx.fillRect(Math.floor(this.x), Math.floor(this.y), this.size, this.size);
            }
        }
    }

    class Particle {
        constructor(x, y, color) {
            this.x = x;
            this.y = y;
            this.color = color;
            const angle = Math.random() * Math.PI * 2;
            const velocity = Math.random() * 4 + 1; 
            this.dx = Math.cos(angle) * velocity;
            this.dy = Math.sin(angle) * velocity;
            this.life = 100;
            this.decay = Math.random() * 0.03 + 0.015;
            this.gravity = 0.1;
        }

        update() {
            this.x += this.dx;
            this.y += this.dy;
            this.dy += this.gravity; 
            this.life -= 2;
            this.alpha = this.life / 100;
        }

        draw() {
            ctx.save();
            ctx.globalAlpha = this.alpha;
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y, 4, 4);
            ctx.restore();
        }
    }

    class TextFirework {
        constructor(x, y, text, color) {
            this.x = x;
            this.y = y;
            this.text = text;
            this.color = color;
            this.life = 100;
            this.alpha = 1;
            this.size = 30; // Initial size
        }

        update() {
            this.y -= 0.5; // Slowly float up
            this.life -= 1.5;
            this.alpha = Math.max(0, this.life / 100);
            this.size += 0.5; // Grow
        }

        draw() {
            ctx.save();
            ctx.globalAlpha = this.alpha;
            ctx.fillStyle = '#fff'; // White center
            ctx.font = `${this.size}px 'Press Start 2P', sans-serif`; // Fallback font added
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            // Glow effect with the main color
            ctx.shadowColor = this.color;
            ctx.shadowBlur = 20;
            ctx.fillText(this.text, this.x, this.y);
            
            // Draw again to make it brighter
            ctx.fillText(this.text, this.x, this.y);
            ctx.restore();
        }
    }

    // Initialize Snowflakes
    for (let i = 0; i < maxSnowflakes; i++) {
        snowflakes.push(new Snowflake());
    }

    // --- Animation Loop ---
    function animate() {
        ctx.clearRect(0, 0, width, height);
        
        // 1. Draw Umbrella
        if (mouse.x > -50) { 
            const stickHeight = 50;
            const radius = 50;
            const umbrellaCenterY = mouse.y - stickHeight;

            ctx.beginPath();
            ctx.moveTo(mouse.x, mouse.y); 
            ctx.lineTo(mouse.x, umbrellaCenterY);
            ctx.lineWidth = 3;
            ctx.strokeStyle = '#ecf0f1';
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(mouse.x, umbrellaCenterY, radius, Math.PI, 2 * Math.PI);
            ctx.fillStyle = '#e74c3c';
            ctx.fill();
            
            ctx.lineWidth = 1;
        }

        // 2. Update & Draw Snow
        snowflakes.forEach(flake => {
            flake.update();
            flake.draw();
        });

        // 3. Update & Draw Fireworks
        for (let i = particles.length - 1; i >= 0; i--) {
            particles[i].update();
            particles[i].draw();
            if (particles[i].life <= 0) {
                particles.splice(i, 1);
            }
        }

        // 4. Update & Draw Text Fireworks
        for (let i = textFireworks.length - 1; i >= 0; i--) {
            textFireworks[i].update();
            textFireworks[i].draw();
            if (textFireworks[i].life <= 0) {
                textFireworks.splice(i, 1);
            }
        }

        requestAnimationFrame(animate);
    }
    
    animate();
}

function setupParallax() {
    const scene = document.querySelector('.scene');
    const moon = document.querySelector('.moon');
    const santa = document.querySelector('.santa-container');
    const text = document.querySelector('.pixel-text');

    document.addEventListener('mousemove', (e) => {
        const x = (window.innerWidth / 2 - e.clientX) / 50;
        const y = (window.innerHeight / 2 - e.clientY) / 50;

        scene.style.transform = `translateX(${x}px) translateY(${y}px)`;
        moon.style.transform = `translateX(${x * 0.5}px) translateY(${y * 0.5}px) scale(1.05)`; 
        santa.style.transform = `translateX(${-x * 2}px) translateY(${-y * 2}px) scale(0.8)`;
        text.style.transform = `translateX(${x * 1.5}px) translateY(${y * 1.5}px)`;
    });
}

function decorateTree() {
    const layers = document.querySelectorAll('#tree .layer');
    const colors = ['#ff0000', '#ffff00', '#00ffff', '#ff00ff', '#ffffff', '#ff9900'];

    layers.forEach(layer => {
        const numLights = Math.floor(Math.random() * 4) + 5; 

        for (let i = 0; i < numLights; i++) {
            const light = document.createElement('div');
            light.classList.add('light');
            
            const color = colors[Math.floor(Math.random() * colors.length)];
            light.style.backgroundColor = color;
            light.style.color = color;
            
            const layerWidth = layer.offsetWidth;
            const layerHeight = layer.offsetHeight;
            
            const x = Math.random() * (layerWidth - 12) + 4;
            const y = Math.random() * (layerHeight - 12) + 4;
            
            light.style.left = x + 'px';
            light.style.top = y + 'px';
            
            light.animate([
                { opacity: 0.4 },
                { opacity: 1, boxShadow: `0 0 5px ${color}` }
            ], {
                duration: Math.random() * 1000 + 500,
                iterations: Infinity,
                direction: 'alternate',
                delay: Math.random() * 1000
            });
            
            layer.appendChild(light);
        }
    });
}

function setupInteractions() {
    const tree = document.getElementById('tree');
    const snowman = document.getElementById('snowman');
    const dadSnowman = document.getElementById('dadSnowman');
    const babySnowman = document.getElementById('babySnowman');
    const santaContainer = document.querySelector('.santa-container');
    const presents = document.querySelectorAll('.present');
    const mainText = document.querySelector('.pixel-text');

    tree.addEventListener('click', (e) => {
        e.stopPropagation(); 
        const lights = document.querySelectorAll('.light');
        const colors = ['#ff0000', '#ffff00', '#00ffff', '#ff00ff', '#ffffff', '#ff9900', '#00ff00'];
        
        lights.forEach(light => {
            const newColor = colors[Math.floor(Math.random() * colors.length)];
            light.style.backgroundColor = newColor;
            light.style.color = newColor;
            light.style.boxShadow = `0 0 5px ${newColor}`;
        });
    });

    const jumpAnimation = [
        { transform: 'translateY(0) rotate(5deg)' },
        { transform: 'translateY(-20px) rotate(-5deg)', offset: 0.5 },
        { transform: 'translateY(0) rotate(5deg)' }
    ];
    
    snowman.addEventListener('click', (e) => {
        e.stopPropagation();
        snowman.animate(jumpAnimation, { duration: 500, easing: 'ease-out' });
    });

    if (dadSnowman) {
        dadSnowman.addEventListener('click', (e) => {
            e.stopPropagation();
            dadSnowman.animate(jumpAnimation, { duration: 500, easing: 'ease-out' });
        });
    }

    if (babySnowman) {
        babySnowman.addEventListener('click', (e) => {
            e.stopPropagation();
            babySnowman.animate([
                { transform: 'scale(0.6) translateY(0) rotate(5deg)' },
                { transform: 'scale(0.6) translateY(-20px) rotate(-5deg)', offset: 0.5 },
                { transform: 'scale(0.6) translateY(0) rotate(5deg)' }
            ], { duration: 500, easing: 'ease-out' });
        });
    }

    santaContainer.addEventListener('click', (e) => {
        e.stopPropagation();
        const gift = document.createElement('div');
        gift.classList.add('falling-gift');
        
        const rect = santaContainer.getBoundingClientRect();
        
        gift.style.left = (rect.left + rect.width / 2) + 'px';
        gift.style.top = (rect.top + rect.height / 2) + 'px';
        
        document.body.appendChild(gift);
        
        gift.addEventListener('animationend', () => {
            gift.remove();
        });
    });

    // 1. Presents Surprise
    const gifts = ['🧸', '🎮', '🍬', '📱', '💍', '🧦', '💵', '🍕'];
    presents.forEach(present => {
        present.addEventListener('click', (e) => {
            e.stopPropagation(); 
            
            // Shake effect
            present.animate([
                { transform: 'rotate(0)' },
                { transform: 'rotate(-5deg)' },
                { transform: 'rotate(5deg)' },
                { transform: 'rotate(0)' }
            ], { duration: 300 });

            // Pop emoji
            const emoji = document.createElement('div');
            emoji.classList.add('emoji-pop');
            emoji.textContent = gifts[Math.floor(Math.random() * gifts.length)];
            
            // Position above present
            const rect = present.getBoundingClientRect();
            emoji.style.left = (rect.left + rect.width/2 - 10) + 'px';
            emoji.style.top = rect.top + 'px';
            
            document.body.appendChild(emoji);
            
            emoji.addEventListener('animationend', () => emoji.remove());
        });
    });

    // 3. Text Interaction (Santa's Reply)
    mainText.addEventListener('click', (e) => {
        e.stopPropagation();
        // Remove existing bubble if any
        const existingBubble = document.querySelector('.speech-bubble');
        if (existingBubble) existingBubble.remove();

        const replies = [
            "루돌프가 파업해서 힘들구나 :(",
            "루돌프 노조 씹새끼들...",
            "사실 산타는 없단다.",
            "울면 한대..",
            "메리 크리스마스!"
        ];

        const bubble = document.createElement('div');
        bubble.classList.add('speech-bubble');
        bubble.textContent = replies[Math.floor(Math.random() * replies.length)];
        
        const rect = mainText.getBoundingClientRect();
        bubble.style.left = (rect.left + rect.width / 2) + 'px';
        bubble.style.top = (rect.top - 50) + 'px';
        
        // Slightly offset to center properly with transform
        bubble.style.transform = 'translateX(-50%)'; 

        document.body.appendChild(bubble);

        // Auto remove
        setTimeout(() => {
            bubble.style.opacity = '0';
            bubble.style.transition = 'opacity 0.5s';
            setTimeout(() => bubble.remove(), 500);
        }, 2000);
    });
}

function setupEasterEggs() {
    // 2. Keyboard "HEART" & "SNOW" Mode
    let inputBuffer = '';
    
    window.addEventListener('keydown', (e) => {
        inputBuffer += e.key.toLowerCase();
        
        if (inputBuffer.length > 10) {
            inputBuffer = inputBuffer.slice(-10);
        }

        if (inputBuffer.endsWith('heart')) {
            snowMode = 'heart';
            console.log('Heart Mode Activated');
        } else if (inputBuffer.endsWith('snow')) {
            snowMode = 'snow';
            console.log('Snow Mode Activated');
        }
    });
}
