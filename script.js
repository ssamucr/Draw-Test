const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// ========== CONFIGURACIÓN DEL TAMAÑO DEL CANVAS ==========
// Cambia este valor para ajustar el tamaño de todo el canvas
const CANVAS_SIZE = 400; // Cambia esto a cualquier tamaño que necesites
// =========================================================

// Controles
const particleSizeInput = document.getElementById('particleSize');
const gapInput = document.getElementById('gap');
const mouseRadiusInput = document.getElementById('mouseRadius');
const useImageColorsInput = document.getElementById('useImageColors');
const resetBtn = document.getElementById('resetBtn');

// Valores de controles
let particleSize = parseFloat(particleSizeInput.value);
let gap = parseInt(gapInput.value);
let mouseRadius = parseInt(mouseRadiusInput.value);
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
});

useImageColorsInput.addEventListener('change', (e) => {
    useImageColors = e.target.checked;
    init();
});

resetBtn.addEventListener('click', () => {
    particles.forEach(particle => particle.reset());
    particleSizeInput.value = 2;
    gapInput.value = 6;
    mouseRadiusInput.value = 50;
    particleSize = 2;
    gap = 6;
    mouseRadius = 50;
    document.getElementById('sizeValue').textContent = particleSize;
    document.getElementById('gapValue').textContent = gap;
    document.getElementById('mouseValue').textContent = mouseRadius;
    init();
});

// Configuración del canvas
canvas.width = CANVAS_SIZE;
canvas.height = CANVAS_SIZE;

// Mouse tracking
const mouse = {
    x: null,
    y: null,
    radius: mouseRadius
};

canvas.addEventListener('mousemove', (e) => {
    // Usar offsetX y offsetY para coordenadas relativas al canvas
    mouse.x = e.offsetX;
    mouse.y = e.offsetY;
});

canvas.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
});

// Clase de partícula
class Particle {
    constructor(x, y, color) {
        this.baseX = x;
        this.baseY = y;
        this.x = x;
        this.y = y;
        this.color = color;
        this.size = particleSize;
        this.density = (Math.random() * 30) + 1;
        this.vx = 0;
        this.vy = 0;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
    }

    update() {
        // Calcular distancia del mouse
        if (mouse.x && mouse.y) {
            const dx = mouse.x - this.x;
            const dy = mouse.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const maxDistance = mouseRadius;

            if (distance < maxDistance && distance > 0) {
                // Usar una curva suave (easing) en lugar de lineal
                const normalizedDistance = distance / maxDistance;
                // Curved force usando función de easing suave
                const force = Math.pow(1 - normalizedDistance, 2) * 0.3;
                
                const forceDirectionX = dx / distance;
                const forceDirectionY = dy / distance;
                
                // Añadir algo de variación aleatoria para romper el círculo perfecto
                const randomFactor = 0.7 + Math.random() * 0.6;
                const angle = Math.atan2(dy, dx) + (Math.random() - 0.5) * 0.3;
                
                const directionX = Math.cos(angle) * force * this.density * randomFactor * 0.5;
                const directionY = Math.sin(angle) * force * this.density * randomFactor * 0.5;
                
                this.vx -= directionX;
                this.vy -= directionY;
            }
        }

        // Volver a la posición original más lentamente
        this.x += (this.baseX - this.x) * 0.08 + this.vx;
        this.y += (this.baseY - this.y) * 0.08 + this.vy;
        
        // Limitar la distancia máxima desde la posición original
        const maxDisplacement = 12; // Máximo de píxeles que puede alejarse
        const distanceFromBase = Math.sqrt(
            Math.pow(this.x - this.baseX, 2) + 
            Math.pow(this.y - this.baseY, 2)
        );
        
        if (distanceFromBase > maxDisplacement) {
            const angle = Math.atan2(this.y - this.baseY, this.x - this.baseX);
            this.x = this.baseX + Math.cos(angle) * maxDisplacement;
            this.y = this.baseY + Math.sin(angle) * maxDisplacement;
            // Reducir velocidad cuando alcanza el límite
            this.vx *= 0.5;
            this.vy *= 0.5;
        }
        
        // Fricción más suave
        this.vx *= 0.9;
        this.vy *= 0.9;
    }

    reset() {
        this.x = this.baseX;
        this.y = this.baseY;
        this.vx = 0;
        this.vy = 0;
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
        
        // Calcular escala para que la imagen quepa en el canvas manteniendo aspecto
        const scale = Math.min(CANVAS_SIZE / img.width, CANVAS_SIZE / img.height);
        const scaledWidth = img.width * scale;
        const scaledHeight = img.height * scale;
        const x = (CANVAS_SIZE - scaledWidth) / 2;
        const y = (CANVAS_SIZE - scaledHeight) / 2;
        
        // Dibujar imagen centrada y escalada
        tempCtx.drawImage(img, x, y, scaledWidth, scaledHeight);
        
        // Obtener datos de píxeles
        const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
        const pixels = imageData.data;
        
        // Calcular offset para centrar
        const offsetX = (canvas.width - tempCanvas.width) / 2;
        const offsetY = (canvas.height - tempCanvas.height) / 2;
        
        // Crear partículas basadas en píxeles
        for (let y = 0; y < tempCanvas.height; y += gap) {
            for (let x = 0; x < tempCanvas.width; x += gap) {
                const index = (y * tempCanvas.width + x) * 4;
                const red = pixels[index];
                const green = pixels[index + 1];
                const blue = pixels[index + 2];
                const alpha = pixels[index + 3];
                
                // Solo crear partícula si el píxel es visible
                if (alpha > 128) {
                    const brightness = (red + green + blue) / 3;
                    
                    let color;
                    if (useImageColors) {
                        // Usar colores originales de la imagen
                        color = `rgb(${red}, ${green}, ${blue})`;
                    } else {
                        // Crear gama de 2 tonos basándose en el brillo
                        // Normalizar brillo de 0 a 1
                        const normalizedBrightness = brightness / 255;
                        
                        // Definir 2 tonos del cyan (oscuro y claro)
                        const darkTone = { r: 40, g: 120, b: 135 };     // Oscuro
                        const lightTone = { r: 120, g: 230, b: 245 };   // Claro
                        
                        // Interpolar entre oscuro y claro según el brillo
                        const finalColor = {
                            r: Math.floor(darkTone.r + (lightTone.r - darkTone.r) * normalizedBrightness),
                            g: Math.floor(darkTone.g + (lightTone.g - darkTone.g) * normalizedBrightness),
                            b: Math.floor(darkTone.b + (lightTone.b - darkTone.b) * normalizedBrightness)
                        };
                        
                        color = `rgb(${finalColor.r}, ${finalColor.g}, ${finalColor.b})`;
                    }
                    
                    particles.push(new Particle(
                        x + offsetX,
                        y + offsetY,
                        color
                    ));
                }
            }
        }
    };
    
    img.onerror = function() {
        console.error('Error al cargar la imagen. Asegúrate de que image.png existe en la carpeta.');
    };
}

// Función de animación
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Verificar si el mouse está cerca de alguna partícula
    let nearParticles = false;
    if (mouse.x && mouse.y) {
        for (let particle of particles) {
            const dx = mouse.x - particle.baseX;
            const dy = mouse.y - particle.baseY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Si está dentro del radio de influencia de alguna partícula
            if (distance < 50) {
                nearParticles = true;
                break;
            }
        }
    }
    
    // Cambiar cursor dinámicamente
    canvas.style.cursor = nearParticles ? 'crosshair' : 'default';
    
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
