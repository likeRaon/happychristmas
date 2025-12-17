document.addEventListener('DOMContentLoaded', () => {
    console.log("Merry Christmas! v5 Initializing..."); 
    
    // 강제로 윈도우에 포커스 주기
    window.focus();
    
    // 혹시 모를 클릭 시 포커스 보장
    document.body.addEventListener('click', () => {
        window.focus();
    });

    initScene(); 
    decorateTree();
    setupInteractions();
    setupEasterEggs();
    setupParallax(); 
});

let snowMode = 'snow'; // 'snow' | 'heart'

// --- Classes (전역 스코프로 이동) ---
class Snowflake {
    constructor(width, height) {
        // 너비와 높이를 인스턴스 변수로 저장하거나 reset에서 처리하도록 수정
        // 하지만 여기서는 initScene에서 전역 width/height를 쓰지 못하므로
        // 생성자에서 받거나, reset 호출 시 컨텍스트를 고려해야 함.
        // 가장 안전한 방법: initScene 내부에서 width/height를 참조하는 것이 아니라
        // 윈도우 객체나 캔버스 객체를 통해 최신 값을 가져오도록 함.
        this.reset();
    }

    reset() {
        this.x = Math.random() * window.innerWidth;
        this.y = -10;
        this.size = Math.floor(Math.random() * 3 + 2); 
        this.size = this.size - (this.size % 2); 
        if (this.size < 2) this.size = 2;
        
        this.speed = Math.random() * 1.5 + 0.5; 
        this.velX = Math.random() * 1 - 0.5; 
        this.opacity = Math.random() * 0.5 + 0.5;
        this.resting = false; 
    }

    update(mouse, lastMouse) {
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
        
        if (this.y > window.innerHeight) {
            this.reset();
        }
        if (this.x > window.innerWidth) this.x = 0;
        if (this.x < 0) this.x = window.innerWidth;
    }

    draw(ctx) {
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

    draw(ctx) {
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
        this.size = 30; 
    }

    update() {
        this.y -= 0.5; 
        this.life -= 1.5;
        this.alpha = Math.max(0, this.life / 100);
        this.size += 0.5; 
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = '#fff'; 
        ctx.font = `bold ${this.size}px monospace`; // 폰트 단순화
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 20;
        ctx.fillText(this.text, this.x, this.y);
        ctx.fillText(this.text, this.x, this.y);
        ctx.restore();
    }
}

function initScene() {
    const canvas = document.getElementById('snowCanvas');
    const ctx = canvas.getContext('2d');
    
    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    // --- Systems ---
    const snowflakes = [];
    const maxSnowflakes = 1200; 
    
    let particles = [];
    let textFireworks = []; 

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
        // 디버깅 로그
        console.log('Key Pressed:', e.code, e.key);

        let char = '';
        
        // 1. e.code로 체크 (한글 입력 상태에서도 KeyA 등으로 잡힘)
        if (e.code.startsWith('Key')) {
            char = e.code.slice(3); // "KeyA" -> "A"
        } 
        // 2. e.key로 체크 (영문 입력 상태)
        else if (/^[a-zA-Z]$/.test(e.key)) {
            char = e.key.toUpperCase();
        }

        if (char) {
            const x = Math.random() * (width - 100) + 50;
            const y = Math.random() * (height * 0.7) + 50;
            const color = `hsl(${Math.random() * 360}, 100%, 70%)`;
            
            createFirework(x, y, color);
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

    window.addEventListener('resize', () => {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
    });

    // Initialize Snowflakes
    for (let i = 0; i < maxSnowflakes; i++) {
        snowflakes.push(new Snowflake());
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);
        
        // Umbrella
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
        }

        snowflakes.forEach(flake => {
            flake.update(mouse, lastMouse);
            flake.draw(ctx);
        });

        for (let i = particles.length - 1; i >= 0; i--) {
            particles[i].update();
            particles[i].draw(ctx);
            if (particles[i].life <= 0) particles.splice(i, 1);
        }

        for (let i = textFireworks.length - 1; i >= 0; i--) {
            textFireworks[i].update();
            textFireworks[i].draw(ctx);
            if (textFireworks[i].life <= 0) textFireworks.splice(i, 1);
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

        if(scene) scene.style.transform = `translateX(${x}px) translateY(${y}px)`;
        if(moon) moon.style.transform = `translateX(${x * 0.5}px) translateY(${y * 0.5}px) scale(1.05)`; 
        if(santa) santa.style.transform = `translateX(${-x * 2}px) translateY(${-y * 2}px) scale(0.8)`;
        if(text) text.style.transform = `translateX(${x * 1.5}px) translateY(${y * 1.5}px)`;
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

    const gifts = ['🧸', '🎮', '🍬', '📱', '💍', '🧦', '💵', '🍕'];
    presents.forEach(present => {
        present.addEventListener('click', (e) => {
            e.stopPropagation(); 
            present.animate([
                { transform: 'rotate(0)' },
                { transform: 'rotate(-5deg)' },
                { transform: 'rotate(5deg)' },
                { transform: 'rotate(0)' }
            ], { duration: 300 });

            const emoji = document.createElement('div');
            emoji.classList.add('emoji-pop');
            emoji.textContent = gifts[Math.floor(Math.random() * gifts.length)];
            const rect = present.getBoundingClientRect();
            emoji.style.left = (rect.left + rect.width/2 - 10) + 'px';
            emoji.style.top = rect.top + 'px';
            document.body.appendChild(emoji);
            emoji.addEventListener('animationend', () => emoji.remove());
        });
    });

    mainText.addEventListener('click', (e) => {
        e.stopPropagation();
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
        bubble.style.transform = 'translateX(-50%)'; 

        document.body.appendChild(bubble);
        setTimeout(() => {
            bubble.style.opacity = '0';
            bubble.style.transition = 'opacity 0.5s';
            setTimeout(() => bubble.remove(), 500);
        }, 2000);
    });
}

function setupEasterEggs() {
    let inputBuffer = '';
    window.addEventListener('keydown', (e) => {
        let char = e.key.toLowerCase();
        inputBuffer += char;
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
