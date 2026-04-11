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
const resetBtn = document.getElementById('resetBtn');

// Valores de controles
let particleSize = parseFloat(particleSizeInput.value);
let gap = parseInt(gapInput.value);
let mouseRadius = parseInt(mouseRadiusInput.value);

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

resetBtn.addEventListener('click', () => {
    particles.forEach(particle => particle.reset());
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
    
    // Crear una imagen
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    // Puedes usar tu propia imagen aquí
    // Para este ejemplo, crearemos una imagen con texto
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    
    // El tempCanvas siempre usa el tamaño completo del canvas
    tempCanvas.width = CANVAS_SIZE;
    tempCanvas.height = CANVAS_SIZE;
    
    // Fondo oscuro
    tempCtx.fillStyle = '#0a1628';
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    
    // Dibujar texto o forma (escalado proporcionalmente)
    tempCtx.fillStyle = '#4dd9e8';
    const fontSize = Math.floor(CANVAS_SIZE * 0.7); // 70% del tamaño del canvas
    tempCtx.font = `bold ${fontSize}px Arial`;
    tempCtx.textAlign = 'center';
    tempCtx.textBaseline = 'middle';
    tempCtx.fillText('0x', tempCanvas.width / 2, tempCanvas.height / 2);
    
    // O puedes dibujar una forma
    // tempCtx.beginPath();
    // tempCtx.arc(200, 200, 150, 0, Math.PI * 2);
    // tempCtx.fill();
    
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
                const color = `rgb(${red}, ${green}, ${blue})`;
                
                particles.push(new Particle(
                    x + offsetX,
                    y + offsetY,
                    color
                ));
            }
        }
    }
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
