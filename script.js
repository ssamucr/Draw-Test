const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// ========== CONFIGURACIÓN DEL TAMAÑO DEL CANVAS ==========
// Cambia este valor para ajustar el tamaño de todo el canvas
const CANVAS_SIZE = 450; // Cambia esto a cualquier tamaño que necesites
// =========================================================

// Controles
const particleSizeInput = document.getElementById('particleSize');
const gapInput = document.getElementById('gap');
const mouseRadiusInput = document.getElementById('mouseRadius');
const useImageColorsInput = document.getElementById('useImageColors');
const resetBtn = document.getElementById('resetBtn');
const themeToggle = document.getElementById('themeToggle');
const body = document.body;
const controls = document.querySelector('.controls');

// Estado del tema (false = oscuro, true = claro)
let isDarkMode = true;

// Valores de controles
let particleSize = parseFloat(particleSizeInput.value);
let gap = parseInt(gapInput.value); // rowGap del original
let mouseRadius = 60; // Fijo como en el original
let useImageColors = useImageColorsInput.checked;
const FIXED_COLOR = '#4dd9e8'; // Color fijo cyan como el texto original

// Actualizar displays
document.getElementById('sizeValue').textContent = particleSize;
document.getElementById('gapValue').textContent = gap;
document.getElementById('mouseValue').textContent = mouseRadius;

particleSizeInput.addEventListener('input', (e) => {
    particleSize = parseFloat(e.target.value);
    document.getElementById('sizeValue').textContent = particleSize;
    init();
});

gapInput.addEventListener('input', (e) => {
    gap = parseInt(e.target.value);
    document.getElementById('gapValue').textContent = gap;
    init();
});

mouseRadiusInput.addEventListener('input', (e) => {
    mouseRadius = parseInt(e.target.value);
    document.getElementById('mouseValue').textContent = mouseRadius;
    init(); // Reiniciar para actualizar
});

useImageColorsInput.addEventListener('change', (e) => {
    useImageColors = e.target.checked;
    init();
});

themeToggle.addEventListener('click', () => {
    isDarkMode = !isDarkMode;
    
    if (isDarkMode) {
        // Modo oscuro
        body.style.backgroundColor = '#0a1628';
        controls.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
        themeToggle.textContent = '🌙 Modo Oscuro';
    } else {
        // Modo claro
        body.style.backgroundColor = '#f0f0f0';
        controls.style.backgroundColor = 'rgba(10, 22, 40, 0.8)';
        themeToggle.textContent = '☀️ Modo Claro';
    }
});

resetBtn.addEventListener('click', () => {
    particleSizeInput.value = 2;
    gapInput.value = 6;  // rowGap del original
    mouseRadiusInput.value = 60;  // Fijo como en el original
    particleSize = 2;
    gap = 6;
    mouseRadius = 60;
    document.getElementById('sizeValue').textContent = particleSize;
    document.getElementById('gapValue').textContent = gap;
    document.getElementById('mouseValue').textContent = mouseRadius;
    startTime = performance.now();  // Reiniciar animación
    init();
});

// Configuración del canvas
canvas.width = CANVAS_SIZE;
canvas.height = CANVAS_SIZE;

// Desactivar antialiasing para líneas más sólidas y definidas
ctx.imageSmoothingEnabled = false;

// Mouse tracking
const mouse = {
    x: -1000,
    y: -1000,
    active: false  // Flag para saber si el mouse está activo
};

canvas.addEventListener('mousemove', (e) => {
    // Usar getBoundingClientRect para coordenadas precisas
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
    mouse.active = true;
});

canvas.addEventListener('mouseleave', () => {
    mouse.active = false;
});

// Soporte para touch
canvas.addEventListener('touchmove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    mouse.x = touch.clientX - rect.left;
    mouse.y = touch.clientY - rect.top;
    mouse.active = true;
});

canvas.addEventListener('touchend', () => {
    mouse.active = false;
});

// Tiempo de inicio para animaciones
let startTime = performance.now();

// Clase de partícula
class Particle {
    constructor(x, y, color, brightness, lineLength) {
        // Posición dispersa inicial (animación de entrada)
        const scatterX = (Math.random() - 0.5) * 300;
        const scatterY = (Math.random() - 0.5) * 300;
        
        this.targetX = x;  // Posición final
        this.targetY = y;
        this.x = x + scatterX;  // Posición inicial dispersa
        this.y = y + scatterY;
        
        this.color = color;
        this.brightness = brightness;
        this.lineLength = lineLength;  // Longitud calculada basada en brillo
        this.size = particleSize;
        this.density = (Math.random() * 30) + 1;
        this.vx = 0;
        this.vy = 0;
        
        // Para animación de entrada
        this.baseAlpha = 0.5 + brightness / 255 * 0.5;
        this.currentAlpha = 0;
        this.delay = Math.random() * 0.3;  // Delay aleatorio en segundos
    }

    draw() {
        // Calcular progreso de animación de entrada
        const elapsed = (performance.now() - startTime) / 1000;
        const particleTime = elapsed - this.delay;
        
        // Fade-in progresivo
        if (particleTime < 0) return;  // Todavía no debe aparecer
        
        const fadeProgress = Math.min(particleTime / 1.5, 1);  // 1.5s para fade completo
        const easedFade = 1 - Math.pow(1 - fadeProgress, 2);  // Easing suave
        this.currentAlpha = this.baseAlpha * easedFade;
        
        // LineWidth dinámico basado en tamaño del canvas
        const dynamicLineWidth = CANVAS_SIZE <= 280 ? 1.5 : 2;
        
        // Dibujar línea horizontal con alpha
        ctx.strokeStyle = useImageColors ? this.color : `rgba(100, 255, 218, ${this.currentAlpha})`;
        ctx.lineWidth = dynamicLineWidth;
        ctx.lineCap = 'butt';
        ctx.globalAlpha = useImageColors ? 1 : this.currentAlpha;
        
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x + this.lineLength, this.y);
        ctx.stroke();
        
        ctx.globalAlpha = 1;  // Resetear alpha global
    }

    update() {
        // Calcular progreso de movimiento hacia la posición final
        const elapsed = (performance.now() - startTime) / 1000;
        const particleTime = elapsed - this.delay;
        
        if (particleTime < 0) return;  // Todavía no debe moverse
        
        const moveProgress = Math.min(particleTime / 2.5, 1);  // 2.5s para llegar a posición
        const easedMove = 1 - Math.pow(1 - moveProgress, 3);  // Easing cúbico
        
        // Repeler desde el mouse (solo si está activo)
        if (mouse.active) {
            const dx = this.x - mouse.x;
            const dy = this.y - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const maxDist = 60;  // Fijo como en el original
            
            if (dist < maxDist && dist > 0) {
                const force = (1 - dist / maxDist) * 2;
                this.vx += (dx / dist) * force;
                this.vy += (dy / dist) * force;
            }
        }
        
        // Atraer hacia la posición objetivo
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        
        const pullStrength = 0.01 + easedMove * 0.07;  // Aumenta con el tiempo
        this.vx += dx * pullStrength;
        this.vy += dy * pullStrength;
        
        // Fricción
        this.vx *= 0.92;
        this.vy *= 0.92;
        
        // Actualizar posición
        this.x += this.vx;
        this.y += this.vy;
    }

    reset() {
        // Resetear a posición dispersa para re-animar
        const scatterX = (Math.random() - 0.5) * 300;
        const scatterY = (Math.random() - 0.5) * 300;
        this.x = this.targetX + scatterX;
        this.y = this.targetY + scatterY;
        this.vx = 0;
        this.vy = 0;
        this.currentAlpha = 0;
        this.delay = Math.random() * 0.3;
        startTime = performance.now();  // Reiniciar tiempo
    }
}

// Array de partículas
let particles = [];

// Función para cargar imagen y crear partículas
function init() {
    particles = [];
    
    // Cargar imagen
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = 'image.png';
    
    img.onload = function() {
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        
        // El tempCanvas siempre usa el tamaño completo del canvas
        tempCanvas.width = CANVAS_SIZE;
        tempCanvas.height = CANVAS_SIZE;
        
        // NO dibujar fondo - dejar transparente para detectar solo la imagen
        // El fondo oscuro se ve en el canvas principal, no en el tempCanvas
        
        // Escalar imagen al 80% del canvas (como en el original)
        const scale = 0.8;
        const imgAspect = img.width / img.height;
        
        let drawHeight = CANVAS_SIZE * scale;
        let drawWidth = drawHeight * imgAspect;
        
        // Ajustar si el ancho excede el límite
        if (drawWidth > CANVAS_SIZE * scale) {
            drawWidth = CANVAS_SIZE * scale;
            drawHeight = drawWidth / imgAspect;
        }
        
        const x = (CANVAS_SIZE - drawWidth) / 2;
        const y = (CANVAS_SIZE - drawHeight) / 2;
        
        // Dibujar imagen centrada y escalada al 80%
        tempCtx.drawImage(img, x, y, drawWidth, drawHeight);
        
        // Obtener datos de píxeles
        const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
        const pixels = imageData.data;
        
        // Calcular offset para centrar
        const offsetX = (canvas.width - tempCanvas.width) / 2;
        const offsetY = (canvas.height - tempCanvas.height) / 2;
        
        // Crear partículas basadas en píxeles (recorrido dinámico)
        // Gap dinámico basado en tamaño del canvas (como en el original)
        const rowGap = CANVAS_SIZE <= 280 ? 5 : 6;
        
        for (let y = 0; y < tempCanvas.height; y += rowGap) {
            let x = 0;
            
            while (x < tempCanvas.width) {
                const index = (y * tempCanvas.width + Math.floor(x)) * 4;
                const red = pixels[index];
                const green = pixels[index + 1];
                const blue = pixels[index + 2];
                const alpha = pixels[index + 3];
                
                // Solo crear partícula si el píxel es visible
                if (alpha > 128) {
                    const brightness = (red + green + blue) / 3;
                    
                    // Calcular longitud de línea basada en brillo
                    const normalizedBrightness = brightness / 255;
                    const lineLength = Math.floor(3 + normalizedBrightness * (CANVAS_SIZE <= 280 ? 8 : 15));
                    
                    let color;
                    if (useImageColors) {
                        // Usar colores originales de la imagen
                        color = `rgb(${red}, ${green}, ${blue})`;
                    } else {
                        // Color fijo cyan del original
                        color = 'rgb(100, 255, 218)';
                    }
                    
                    particles.push(new Particle(
                        x + offsetX,
                        y + offsetY,
                        color,
                        brightness,
                        lineLength  // Pasar longitud de línea calculada
                    ));
                    
                    // Avanzar según la longitud de la línea + gap pequeño
                    x += lineLength + 3;
                } else {
                    // Si es transparente, avanzar menos
                    x += 4;
                }
            }
        }
        
        // Reiniciar tiempo de animación
        startTime = performance.now();
    };
    
    img.onerror = function() {
        console.error('Error al cargar la imagen. Asegúrate de que image.png existe en la carpeta.');
    };
}

// Función de animación
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Cursor siempre crosshair como en el original
    canvas.style.cursor = 'crosshair';
    
    particles.forEach(particle => {
        particle.update();
        particle.draw();
    });
    
    requestAnimationFrame(animate);
}

// Responsive (mantener tamaño fijo)
// No es necesario recalcular en resize ya que el canvas tiene tamaño fijo

// Iniciar
init();
animate();
