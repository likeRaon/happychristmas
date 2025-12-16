document.addEventListener('DOMContentLoaded', () => {
    initSnow();
    decorateTree();
    setupInteractions();
});

function initSnow() {
    const canvas = document.getElementById('snowCanvas');
    const ctx = canvas.getContext('2d');
    
    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const snowflakes = [];
    const maxSnowflakes = 1200; // 눈 내리는 양 조절 시 사용
    
    // 마우스 좌표 트래킹
    let mouse = { x: -100, y: -100 };
    let lastMouse = { x: -100, y: -100 };
    
    document.addEventListener('mousemove', (e) => {
        lastMouse.x = mouse.x;
        lastMouse.y = mouse.y;
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    // Resize handler
    window.addEventListener('resize', () => {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
    });

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
            // 우산 상단 눈 쌓이는 기능
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
                
                // Slide logic
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
            ctx.fillRect(Math.floor(this.x), Math.floor(this.y), this.size, this.size);
        }
    }

    for (let i = 0; i < maxSnowflakes; i++) {
        snowflakes.push(new Snowflake());
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);
        
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

        snowflakes.forEach(flake => {
            flake.update();
            flake.draw();
        });

        requestAnimationFrame(animate);
    }
    
    animate();
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

    tree.addEventListener('click', () => {
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
    
    snowman.addEventListener('click', () => {
        snowman.animate(jumpAnimation, { duration: 500, easing: 'ease-out' });
    });

    if (dadSnowman) {
        dadSnowman.addEventListener('click', () => {
            dadSnowman.animate(jumpAnimation, { duration: 500, easing: 'ease-out' });
        });
    }

    if (babySnowman) {
        babySnowman.addEventListener('click', () => {
            babySnowman.animate([
                { transform: 'scale(0.6) translateY(0) rotate(5deg)' },
                { transform: 'scale(0.6) translateY(-20px) rotate(-5deg)', offset: 0.5 },
                { transform: 'scale(0.6) translateY(0) rotate(5deg)' }
            ], { duration: 500, easing: 'ease-out' });
        });
    }

    santaContainer.addEventListener('click', () => {
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
}
