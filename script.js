const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// ============================================================
// ⚙️ CONFIGURACIÓN GLOBAL - MODIFICA ESTOS VALORES
// ============================================================

// 🎨 TAMAÑO Y ESCALA
let CANVAS_SIZE = 450;                      // Tamaño del canvas en píxeles (se ajusta dinámicamente)
const IMAGE_SCALE = 0.8;                    // Escala de la imagen (0.8 = 80% del canvas)

// Función para calcular el tamaño del canvas según el dispositivo
function getResponsiveCanvasSize() {
    const maxSize = 450;
    const minSize = 280;
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const smallerDimension = Math.min(screenWidth, screenHeight);
    
    // En móviles, usar el 90% de la dimensión menor
    if (screenWidth < 768) {
        return Math.max(minSize, Math.min(maxSize, Math.floor(smallerDimension * 0.9)));
    }
    
    return maxSize;
}

// 🌈 COLORES DE MARCA PERSONAL (Púrpura/Magenta)
const BRAND_COLORS = {
    dark: { r: 138, g: 43, b: 226 },        // Color oscuro (púrpura)
    light: { r: 255, g: 20, b: 147 }        // Color claro (magenta/rosa)
};

// 📝 TEXTO Y FUENTE
const DEFAULT_TEXT = 'SAMUEL';              // Texto inicial por defecto
const TEXT_FONT = 'bold 80px Arial';        // Fuente del texto inicial
const TEXT_ROW_GAP = 6;                     // Espaciado entre filas de texto
const TEXT_ADVANCE_STEP = 8;                // Avance horizontal en texto

// ⏱️ TIEMPOS DE ANIMACIÓN (en milisegundos)
const TEXT_DISPLAY_TIME = 2000;             // Tiempo mostrando texto antes de morphing
const TRANSITION_DURATION = 1500;           // Duración del morphing texto→imagen
const FADE_IN_DURATION = 1.5;               // Duración del fade-in de partículas (segundos)
const MOVE_TO_POSITION_DURATION = 2.5;      // Tiempo para llegar a posición final (segundos)

// 🎛️ VALORES POR DEFECTO DE CONTROLES
const DEFAULT_PARTICLE_SIZE = 2;            // Tamaño de partícula (1-5)
const DEFAULT_GAP = 6;                      // Espaciado entre partículas (1-25)
const DEFAULT_MOUSE_RADIUS = 60;            // Radio de influencia del mouse (10-150)

// ✨ PARTÍCULAS FLOTANTES
const FLOATING_PARTICLE_COUNT = 30;         // Cantidad de partículas decorativas
const FLOATING_SIZE_MIN = 0.5;              // Tamaño mínimo
const FLOATING_SIZE_MAX = 2.5;              // Tamaño máximo
const FLOATING_SPEED = 0.5;                 // Velocidad de movimiento
const FLOATING_ALPHA_MIN = 0.1;             // Opacidad mínima
const FLOATING_ALPHA_MAX = 0.4;             // Opacidad máxima

// 🎯 FÍSICA DE PARTÍCULAS
const PARTICLE_FRICTION = 0.92;             // Fricción (0-1, menor = más fricción)
const PULL_STRENGTH_BASE = 0.01;            // Fuerza de atracción base
const PULL_STRENGTH_MAX = 0.08;             // Fuerza de atracción máxima
const PARTICLE_DELAY_MAX = 0.3;             // Delay máximo entre partículas (segundos)

// ⚡ EFECTO GLITCH
const GLITCH_INTENSITY = 15;                // Intensidad máxima del glitch
const GLITCH_STRONG_INTENSITY = 30;         // Intensidad del glitch fuerte
const GLITCH_STRONG_PROBABILITY = 0.02;     // Probabilidad de glitch fuerte (0-1)
const GLITCH_DECAY = 0.8;                   // Velocidad de reducción del glitch (0-1)
const GLITCH_UPDATE_FREQUENCY = 3;          // Cada cuántos frames actualizar glitch
const GLITCH_SCANLINE_THRESHOLD = 10;       // Threshold para efecto scanline

// 📏 LÍNEAS DE PARTÍCULAS
const LINE_LENGTH_MIN = 3;                  // Longitud mínima de línea
const LINE_LENGTH_SMALL_CANVAS = 8;         // Longitud máxima en canvas pequeño (≤280px)
const LINE_LENGTH_LARGE_CANVAS = 15;        // Longitud máxima en canvas grande
const LINE_ADVANCE_GAP = 3;                 // Gap adicional después de cada línea
const LINE_WIDTH_SMALL = 1.5;               // Grosor en canvas pequeño
const LINE_WIDTH_LARGE = 2;                 // Grosor en canvas grande

// 🖼️ PROCESAMIENTO DE IMAGEN
const IMAGE_ROW_GAP_SMALL = 5;              // Gap de filas en canvas pequeño (≤280px)
const IMAGE_ROW_GAP_LARGE = 6;              // Gap de filas en canvas grande
const PIXEL_ALPHA_THRESHOLD = 128;          // Threshold de transparencia (0-255)
const TRANSPARENT_ADVANCE_STEP = 4;         // Avance cuando píxel es transparente

// 🎨 ALPHA Y BRILLO
const BASE_ALPHA_MIN = 0.5;                 // Alpha base mínimo
const BASE_ALPHA_RANGE = 0.5;               // Rango adicional basado en brillo

// 🎭 TEMAS
const DARK_THEME_BG = '#0E0E0E';            // Color de fondo modo oscuro
const LIGHT_THEME_BG = '#f0f0f0';           // Color de fondo modo claro
const DARK_THEME_CONTROLS = 'rgba(255, 255, 255, 0.1)';     // Color panel oscuro
const LIGHT_THEME_CONTROLS = 'rgba(10, 22, 40, 0.8)';       // Color panel claro

// ============================================================
// FIN DE CONFIGURACIÓN
// ============================================================

// Controles
const particleSizeInput = document.getElementById('particleSize');
const gapInput = document.getElementById('gap');
const mouseRadiusInput = document.getElementById('mouseRadius');
const useImageColorsInput = document.getElementById('useImageColors');
const customTextInput = document.getElementById('customText');
const resetBtn = document.getElementById('resetBtn');
const themeToggle = document.getElementById('themeToggle');
const settingsToggle = document.getElementById('settingsToggle');
const restartToggle = document.getElementById('restartToggle');
const signature = document.getElementById('signature');
const body = document.body;
const controls = document.querySelector('.controls');

// Estado del tema (false = oscuro, true = claro)
let isDarkMode = true;

// Valores de controles (se inicializan con los valores por defecto)
let particleSize = DEFAULT_PARTICLE_SIZE;
let gap = DEFAULT_GAP;
let mouseRadius = DEFAULT_MOUSE_RADIUS;
let useImageColors = useImageColorsInput.checked;

// Estado de animación
let animationPhase = 'text'; // 'text' -> 'transition' -> 'image'
let phaseProgress = 0;
let TEXT_TO_SHOW = customTextInput.value || DEFAULT_TEXT;

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

customTextInput.addEventListener('change', (e) => {
    TEXT_TO_SHOW = e.target.value.toUpperCase() || 'TEXTO';
    init();
});

themeToggle.addEventListener('click', () => {
    isDarkMode = !isDarkMode;
    
    if (isDarkMode) {
        // Modo oscuro
        body.style.backgroundColor = DARK_THEME_BG;
        body.classList.remove('light-mode');
        controls.style.backgroundColor = DARK_THEME_CONTROLS;
        themeToggle.textContent = '🌙 Modo Oscuro';
    } else {
        // Modo claro
        body.style.backgroundColor = LIGHT_THEME_BG;
        body.classList.add('light-mode');
        controls.style.backgroundColor = LIGHT_THEME_CONTROLS;
        themeToggle.textContent = '☀️ Modo Claro';
    }
});

settingsToggle.addEventListener('click', () => {
    controls.classList.toggle('hidden');
    settingsToggle.classList.toggle('controls-visible');
    restartToggle.classList.toggle('controls-visible');
});

restartToggle.addEventListener('click', () => {
    // Reiniciar la animación desde el texto
    particles.forEach(particle => particle.reset());
    animationPhase = 'text';
    phaseProgress = 0;
    startTime = performance.now();
    
    // Reiniciar la transición después del tiempo configurado
    setTimeout(() => {
        animationPhase = 'transition';
        const transitionStart = performance.now();
        
        function animateTransition() {
            const elapsed = performance.now() - transitionStart;
            phaseProgress = Math.min(elapsed / TRANSITION_DURATION, 1);
            
            // Easing suave
            phaseProgress = 1 - Math.pow(1 - phaseProgress, 3);
            
            if (phaseProgress < 1) {
                requestAnimationFrame(animateTransition);
            } else {
                animationPhase = 'image';
            }
        }
        
        animateTransition();
    }, TEXT_DISPLAY_TIME);
});

resetBtn.addEventListener('click', () => {
    particleSizeInput.value = DEFAULT_PARTICLE_SIZE;
    gapInput.value = DEFAULT_GAP;
    mouseRadiusInput.value = DEFAULT_MOUSE_RADIUS;
    customTextInput.value = DEFAULT_TEXT;
    particleSize = DEFAULT_PARTICLE_SIZE;
    gap = DEFAULT_GAP;
    mouseRadius = DEFAULT_MOUSE_RADIUS;
    TEXT_TO_SHOW = DEFAULT_TEXT;
    document.getElementById('sizeValue').textContent = particleSize;
    document.getElementById('gapValue').textContent = gap;
    document.getElementById('mouseValue').textContent = mouseRadius;
    animationPhase = 'text';
    phaseProgress = 0;
    startTime = performance.now();
    init();
});

// Función para configurar el canvas con tamaño responsive
function setupCanvas() {
    CANVAS_SIZE = getResponsiveCanvasSize();
    canvas.width = CANVAS_SIZE;
    canvas.height = CANVAS_SIZE;
    
    // Desactivar antialiasing para líneas más sólidas y definidas
    ctx.imageSmoothingEnabled = false;
}

// Configuración inicial del canvas
setupCanvas();

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

// Partículas flotantes decorativas
class FloatingParticle {
    constructor() {
        this.x = Math.random() * CANVAS_SIZE;
        this.y = Math.random() * CANVAS_SIZE;
        this.size = Math.random() * (FLOATING_SIZE_MAX - FLOATING_SIZE_MIN) + FLOATING_SIZE_MIN;
        this.speedX = (Math.random() - 0.5) * FLOATING_SPEED;
        this.speedY = (Math.random() - 0.5) * FLOATING_SPEED;
        this.alpha = Math.random() * (FLOATING_ALPHA_MAX - FLOATING_ALPHA_MIN) + FLOATING_ALPHA_MIN;
        this.color = Math.random() > 0.5 ? 
            `rgba(${BRAND_COLORS.dark.r}, ${BRAND_COLORS.dark.g}, ${BRAND_COLORS.dark.b}, ${this.alpha})` :
            `rgba(${BRAND_COLORS.light.r}, ${BRAND_COLORS.light.g}, ${BRAND_COLORS.light.b}, ${this.alpha})`;
    }
    
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        
        if (this.x < 0 || this.x > CANVAS_SIZE) this.speedX *= -1;
        if (this.y < 0 || this.y > CANVAS_SIZE) this.speedY *= -1;
    }
    
    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Crear partículas flotantes
const floatingParticles = [];
for (let i = 0; i < FLOATING_PARTICLE_COUNT; i++) {
    floatingParticles.push(new FloatingParticle());
}

// Clase de partícula principal
class Particle {
    constructor(x, y, color, brightness, lineLength, textX, textY) {
        // Posición de texto (inicio)
        this.textX = textX !== undefined ? textX : x;
        this.textY = textY !== undefined ? textY : y;
        
        // Posición de imagen (objetivo final)
        this.imageX = x;
        this.imageY = y;
        
        // Posición actual (empieza en texto)
        this.x = this.textX;
        this.y = this.textY;
        
        this.color = color;
        this.brightness = brightness;
        this.lineLength = lineLength;
        this.size = particleSize;
        this.density = (Math.random() * 30) + 1;
        this.vx = 0;
        this.vy = 0;
        
        // Para animación de entrada
        this.baseAlpha = BASE_ALPHA_MIN + (brightness / 255) * BASE_ALPHA_RANGE;
        this.currentAlpha = 0;
        this.delay = Math.random() * PARTICLE_DELAY_MAX;
        
        // Para efecto glitch
        this.glitchOffset = { x: 0, y: 0 };
        this.glitchTimer = 0;
    }

    draw() {
        const elapsed = (performance.now() - startTime) / 1000;
        const particleTime = elapsed - this.delay;
        
        if (particleTime < 0) return;
        
        const fadeProgress = Math.min(particleTime / FADE_IN_DURATION, 1);
        const easedFade = 1 - Math.pow(1 - fadeProgress, 2);
        this.currentAlpha = this.baseAlpha * easedFade;
        
        const dynamicLineWidth = CANVAS_SIZE <= 280 ? LINE_WIDTH_SMALL : LINE_WIDTH_LARGE;
        
        // Aplicar offset de glitch
        const drawX = this.x + this.glitchOffset.x;
        const drawY = this.y + this.glitchOffset.y;
        
        // Colores de marca personal
        let strokeColor;
        if (useImageColors) {
            strokeColor = this.color;
        } else {
            // Interpolar entre colores de marca según brillo
            const t = this.brightness / 255;
            const r = Math.floor(BRAND_COLORS.dark.r + (BRAND_COLORS.light.r - BRAND_COLORS.dark.r) * t);
            const g = Math.floor(BRAND_COLORS.dark.g + (BRAND_COLORS.light.g - BRAND_COLORS.dark.g) * t);
            const b = Math.floor(BRAND_COLORS.dark.g + (BRAND_COLORS.light.b - BRAND_COLORS.dark.b) * t);
            strokeColor = `rgba(${r}, ${g}, ${b}, ${this.currentAlpha})`;
        }
        
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = dynamicLineWidth;
        ctx.lineCap = 'butt';
        ctx.globalAlpha = useImageColors ? 1 : this.currentAlpha;
        
        // Efecto de scanline glitch ocasional
        if (Math.abs(this.glitchOffset.x) > GLITCH_SCANLINE_THRESHOLD) {
            ctx.globalAlpha *= 0.7;
        }
        
        ctx.beginPath();
        ctx.moveTo(drawX, drawY);
        ctx.lineTo(drawX + this.lineLength, drawY);
        ctx.stroke();
        
        ctx.globalAlpha = 1;
    }

    update() {
        const elapsed = (performance.now() - startTime) / 1000;
        const particleTime = elapsed - this.delay;
        
        if (particleTime < 0) return;
        
        // Determinar posición objetivo según fase
        let targetX, targetY;
        if (animationPhase === 'text') {
            targetX = this.textX;
            targetY = this.textY;
        } else if (animationPhase === 'transition') {
            // Interpolar entre texto e imagen
            const t = phaseProgress;
            targetX = this.textX + (this.imageX - this.textX) * t;
            targetY = this.textY + (this.imageY - this.textY) * t;
        } else {
            targetX = this.imageX;
            targetY = this.imageY;
        }
        
        // Efecto glitch en lugar de repulsión simple
        if (mouse.active && animationPhase === 'image') {
            const dx = this.x - mouse.x;
            const dy = this.y - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const maxDist = mouseRadius;
            
            if (dist < maxDist && dist > 0) {
                // Efecto de distorsión glitch
                this.glitchTimer++;
                
                if (this.glitchTimer % GLITCH_UPDATE_FREQUENCY === 0) {
                    const intensity = (1 - dist / maxDist) * GLITCH_INTENSITY;
                    this.glitchOffset.x = (Math.random() - 0.5) * intensity;
                    this.glitchOffset.y = (Math.random() - 0.5) * intensity;
                }
                
                // Ocasionalmente saltar a otra posición (glitch fuerte)
                if (Math.random() < GLITCH_STRONG_PROBABILITY && dist < maxDist * 0.5) {
                    this.glitchOffset.x = (Math.random() - 0.5) * GLITCH_STRONG_INTENSITY;
                    this.glitchOffset.y = (Math.random() - 0.5) * GLITCH_STRONG_INTENSITY;
                }
            } else {
                // Reducir glitch gradualmente
                this.glitchOffset.x *= GLITCH_DECAY;
                this.glitchOffset.y *= GLITCH_DECAY;
            }
        } else {
            this.glitchOffset.x *= GLITCH_DECAY;
            this.glitchOffset.y *= GLITCH_DECAY;
        }
        
        // Atraer hacia objetivo
        const dx = targetX - this.x;
        const dy = targetY - this.y;
        
        const moveProgress = Math.min(particleTime / MOVE_TO_POSITION_DURATION, 1);
        const easedMove = 1 - Math.pow(1 - moveProgress, 3);
        const pullStrength = PULL_STRENGTH_BASE + easedMove * PULL_STRENGTH_MAX;
        
        this.vx += dx * pullStrength;
        this.vy += dy * pullStrength;
        
        this.vx *= PARTICLE_FRICTION;
        this.vy *= PARTICLE_FRICTION;
        
        this.x += this.vx;
        this.y += this.vy;
    }

    reset() {
        this.x = this.textX;
        this.y = this.textY;
        this.vx = 0;
        this.vy = 0;
        this.currentAlpha = 0;
        this.delay = Math.random() * PARTICLE_DELAY_MAX;
        this.glitchOffset = { x: 0, y: 0 };
        this.glitchTimer = 0;
        animationPhase = 'text';
        phaseProgress = 0;
        startTime = performance.now();
    }
}

// Array de partículas
let particles = [];

// Función para crear texto como partículas
function createTextParticles() {
    const textCanvas = document.createElement('canvas');
    const textCtx = textCanvas.getContext('2d');
    textCanvas.width = CANVAS_SIZE;
    textCanvas.height = CANVAS_SIZE;
    
    // Dibujar texto
    textCtx.fillStyle = 'white';
    textCtx.font = TEXT_FONT;
    textCtx.textAlign = 'center';
    textCtx.textBaseline = 'middle';
    textCtx.fillText(TEXT_TO_SHOW, CANVAS_SIZE / 2, CANVAS_SIZE / 2);
    
    const textImageData = textCtx.getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    const textPixels = textImageData.data;
    
    const textPositions = [];
    
    for (let y = 0; y < CANVAS_SIZE; y += TEXT_ROW_GAP) {
        let x = 0;
        while (x < CANVAS_SIZE) {
            const index = (y * CANVAS_SIZE + Math.floor(x)) * 4;
            const alpha = textPixels[index + 3];
            
            if (alpha > PIXEL_ALPHA_THRESHOLD) {
                textPositions.push({ x, y });
                x += TEXT_ADVANCE_STEP;
            } else {
                x += TRANSPARENT_ADVANCE_STEP;
            }
        }
    }
    
    return textPositions;
}

// Función para cargar imagen y crear partículas
function init() {
    particles = [];
    
    // Primero crear posiciones de texto
    const textPositions = createTextParticles();
    
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
        
        // Escalar imagen según configuración
        const imgAspect = img.width / img.height;
        
        let drawHeight = CANVAS_SIZE * IMAGE_SCALE;
        let drawWidth = drawHeight * imgAspect;
        
        // Ajustar si el ancho excede el límite
        if (drawWidth > CANVAS_SIZE * IMAGE_SCALE) {
            drawWidth = CANVAS_SIZE * IMAGE_SCALE;
            drawHeight = drawWidth / imgAspect;
        }
        
        const x = (CANVAS_SIZE - drawWidth) / 2;
        const y = (CANVAS_SIZE - drawHeight) / 2;
        
        // Dibujar imagen centrada y escalada
        tempCtx.drawImage(img, x, y, drawWidth, drawHeight);
        
        // Obtener datos de píxeles
        const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
        const pixels = imageData.data;
        
        // Calcular offset para centrar
        const offsetX = (canvas.width - tempCanvas.width) / 2;
        const offsetY = (canvas.height - tempCanvas.height) / 2;
        
        // Crear partículas basadas en píxeles (recorrido dinámico)
        // Gap dinámico basado en tamaño del canvas
        const rowGap = CANVAS_SIZE <= 280 ? IMAGE_ROW_GAP_SMALL : IMAGE_ROW_GAP_LARGE;
        
        for (let y = 0; y < tempCanvas.height; y += rowGap) {
            let x = 0;
            
            while (x < tempCanvas.width) {
                const index = (y * tempCanvas.width + Math.floor(x)) * 4;
                const red = pixels[index];
                const green = pixels[index + 1];
                const blue = pixels[index + 2];
                const alpha = pixels[index + 3];
                
                // Solo crear partícula si el píxel es visible
                if (alpha > PIXEL_ALPHA_THRESHOLD) {
                    const brightness = (red + green + blue) / 3;
                    const normalizedBrightness = brightness / 255;
                    const lineLength = Math.floor(LINE_LENGTH_MIN + normalizedBrightness * 
                        (CANVAS_SIZE <= 280 ? LINE_LENGTH_SMALL_CANVAS : LINE_LENGTH_LARGE_CANVAS));
                    
                    let color;
                    if (useImageColors) {
                        color = `rgb(${red}, ${green}, ${blue})`;
                    } else {
                        // Colores de marca
                        const r = Math.floor(BRAND_COLORS.dark.r + (BRAND_COLORS.light.r - BRAND_COLORS.dark.r) * normalizedBrightness);
                        const g = Math.floor(BRAND_COLORS.dark.g + (BRAND_COLORS.light.g - BRAND_COLORS.dark.g) * normalizedBrightness);
                        const b = Math.floor(BRAND_COLORS.dark.b + (BRAND_COLORS.light.b - BRAND_COLORS.dark.b) * normalizedBrightness);
                        color = `rgb(${r}, ${g}, ${b})`;
                    }
                    
                    // Obtener posición de texto correspondiente (o aleatoria si no hay suficientes)
                    const textPos = textPositions[particles.length % textPositions.length] || 
                                   { x: CANVAS_SIZE / 2, y: CANVAS_SIZE / 2 };
                    
                    particles.push(new Particle(
                        x + offsetX,        // imageX
                        y + offsetY,        // imageY
                        color,
                        brightness,
                        lineLength,
                        textPos.x,          // textX
                        textPos.y           // textY
                    ));
                    
                    // Avanzar según la longitud de la línea + gap
                    x += lineLength + LINE_ADVANCE_GAP;
                } else {
                    // Si es transparente, avanzar menos
                    x += TRANSPARENT_ADVANCE_STEP;
                }
            }
        }
        
        // Reiniciar tiempo de animación
        animationPhase = 'text';
        phaseProgress = 0;
        startTime = performance.now();
        
        // Después del tiempo configurado, comenzar transición a imagen
        setTimeout(() => {
            animationPhase = 'transition';
            const transitionStart = performance.now();
            
            function animateTransition() {
                const elapsed = performance.now() - transitionStart;
                phaseProgress = Math.min(elapsed / TRANSITION_DURATION, 1);
                
                // Easing suave
                phaseProgress = 1 - Math.pow(1 - phaseProgress, 3);
                
                if (phaseProgress < 1) {
                    requestAnimationFrame(animateTransition);
                } else {
                    animationPhase = 'image';
                }
            }
            
            animateTransition();
        }, TEXT_DISPLAY_TIME);
    };
    
    img.onerror = function() {
        console.error('Error al cargar la imagen. Asegúrate de que image.png existe en la carpeta.');
    };
}

// Función de animación
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Dibujar partículas flotantes primero (fondo)
    floatingParticles.forEach(fp => {
        fp.update();
        fp.draw();
    });
    
    // Dibujar partículas principales
    particles.forEach(particle => {
        particle.update();
        particle.draw();
    });
    
    canvas.style.cursor = 'crosshair';
    requestAnimationFrame(animate);
}

// Responsive - actualizar canvas en resize con debounce
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        const newSize = getResponsiveCanvasSize();
        if (newSize !== CANVAS_SIZE) {
            setupCanvas();
            init();
        }
    }, 250);
});

// Prevenir zoom en móviles al hacer doble tap
let lastTouchEnd = 0;
document.addEventListener('touchend', (e) => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
        e.preventDefault();
    }
    lastTouchEnd = now;
}, { passive: false });

// Prevenir gestos de zoom en móviles
document.addEventListener('gesturestart', (e) => {
    e.preventDefault();
});

// Iniciar
init();
animate();
