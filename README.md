# Particle Portrait Effect - Versión Única

Efecto de partículas interactivo con características únicas que lo diferencian de implementaciones comunes.

## 🎨 Características Únicas

### 1. **Animación de Texto Inicial**
- Las partículas comienzan formando texto personalizable
- Transición suave de texto a imagen (2 segundos de texto, luego morphing de 1.5s)
- Texto editable en tiempo real desde el panel de controles

### 2. **Efecto Glitch de Distorsión**
- En lugar de simple repulsión, las partículas tienen distorsión tipo glitch cerca del mouse
- Saltos aleatorios de posición (efecto de corrupción digital)
- Intensidad variable según proximidad al cursor
- Reducción gradual del glitch al alejarse

### 3. **Partículas Flotantes Ambientales**
- 30 partículas decorativas flotando en el fondo
- Movimiento browniano aleatorio
- Colores de marca personal (púrpura/magenta)
- Añade profundidad y dinamismo

### 4. **Colores de Marca Personal**
- Esquema de colores púrpura/magenta (no cyan genérico)
- Gradiente entre tonos oscuros y claros basado en brillo
- Fácilmente personalizable editando `BRAND_COLORS` en el código

### 5. **Sistema de Fases**
- Fase 1: Texto (2 segundos)
- Fase 2: Transición animada (1.5 segundos)
- Fase 3: Imagen con interacción glitch

## 🎮 Controles

- **Tamaño de partícula**: Grosor de las líneas (1-5)
- **Espaciado**: Densidad de partículas (1-25)
- **Sensibilidad ratón**: Radio de efecto glitch (10-150)
- **Texto inicial**: Personaliza el texto que aparece al inicio
- **Colores de imagen**: Toggle entre colores de marca y colores originales
- **Modo oscuro/claro**: Cambia el tema de fondo
- **Resetear**: Vuelve a los valores por defecto y reinicia la animación

## 🔧 Personalización

### Cambiar colores de marca:
```javascript
const BRAND_COLORS = {
    dark: { r: 138, g: 43, b: 226 },    // Tu color oscuro
    light: { r: 255, g: 20, b: 147 }    // Tu color claro
};
```

### Cambiar texto por defecto:
```javascript
let TEXT_TO_SHOW = 'TU NOMBRE';
```

### Ajustar timing de animaciones:
```javascript
setTimeout(() => { ... }, 2000);  // Tiempo en texto (ms)
const transitionDuration = 1500;   // Duración de transición (ms)
```

## 🎯 Lo que lo hace único

Este efecto se diferencia de implementaciones comunes por:
- ✅ Animación inicial de texto (no solo imagen)
- ✅ Efecto glitch en lugar de repulsión simple
- ✅ Partículas flotantes ambientales
- ✅ Colores de marca personalizados
- ✅ Sistema de fases con transiciones suaves
- ✅ Personalización en tiempo real

## 📝 Notas

- La imagen debe estar en `image.png` en el mismo directorio
- Resolución recomendada de imagen: 400x400px o similar
- Los colores funcionan mejor con imágenes de alto contraste
- El efecto glitch es más visible con sensibilidad de ratón alta (80-120)
tempCtx.fillText('TU TEXTO', tempCanvas.width / 2, tempCanvas.height / 2);
\`\`\`

## Tecnologías

- HTML5 Canvas
- JavaScript (Vanilla)
- CSS3

## Optimización

Para mejor rendimiento:
- Aumenta el valor de `gap` (menos partículas)
- Reduce el tamaño del canvas
- Usa imágenes más pequeñas
