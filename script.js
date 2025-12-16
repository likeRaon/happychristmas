document.addEventListener('DOMContentLoaded', () => {
    createSnow();
    decorateTree();
});

function createSnow() {
    const snowContainer = document.body;

    // Create snowflakes continuously
    setInterval(() => {
        const snowflake = document.createElement('div');
        snowflake.classList.add('snowflake');
        
        // Random horizontal position (0 to 100vw)
        snowflake.style.left = Math.random() * 100 + 'vw';
        
        // Random size for depth effect
        const size = Math.random() * 5 + 2; 
        const pixelSize = Math.floor(size / 2) * 2;
        snowflake.style.width = pixelSize + 'px';
        snowflake.style.height = pixelSize + 'px';
        
        // Random opacity
        snowflake.style.opacity = Math.random() * 0.6 + 0.4;

        // Random animation duration (fall speed)
        const duration = Math.random() * 5 + 3; // 3s to 8s
        snowflake.style.animationDuration = duration + 's';
        
        snowContainer.appendChild(snowflake);

        // Remove snowflake after animation
        setTimeout(() => {
            snowflake.remove();
        }, duration * 1000);
    }, 50); // Generate every 50ms
}

function decorateTree() {
    const layers = document.querySelectorAll('.layer');
    const colors = ['#ff0000', '#ffff00', '#00ffff', '#ff00ff', '#ffffff', '#ff8800'];

    layers.forEach(layer => {
        // Add random lights to each layer
        const numLights = Math.floor(Math.random() * 4) + 3; // 3 to 6 lights

        for (let i = 0; i < numLights; i++) {
            const light = document.createElement('div');
            light.classList.add('light');
            
            // Random color
            const color = colors[Math.floor(Math.random() * colors.length)];
            light.style.backgroundColor = color;
            light.style.color = color; // Used for box-shadow currentColor
            
            // Random position within the layer
            const layerWidth = layer.offsetWidth;
            const layerHeight = layer.offsetHeight;
            
            // Keep lights somewhat inside borders
            const x = Math.random() * (layerWidth - 12) + 4;
            const y = Math.random() * (layerHeight - 12) + 4;
            
            light.style.left = x + 'px';
            light.style.top = y + 'px';
            
            // Random animation settings
            light.style.animationDelay = Math.random() * 2 + 's';
            light.style.animationDuration = (Math.random() * 1.5 + 0.5) + 's'; 
            
            layer.appendChild(light);
        }
    });
}

