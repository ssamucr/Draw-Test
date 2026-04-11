# Efecto de Partículas en Imagen

Este proyecto crea un efecto visual impresionante donde una imagen o texto se forma a partir de partículas interactivas.

## Características

- ✨ Partículas que forman una imagen o texto
- 🖱️ Interacción con el mouse (las partículas se alejan del cursor)
- 🎛️ Controles en tiempo real para ajustar el efecto
- 📱 Diseño responsive
- 🎨 Fácil de personalizar

## Cómo usar

1. Abre `index.html` en tu navegador
2. Mueve el mouse sobre las partículas para interactuar
3. Usa los controles para ajustar:
   - Tamaño de partícula
   - Espaciado entre partículas
   - Radio de influencia del mouse

## Personalización

### Usar tu propia imagen

En `script.js`, busca la sección donde se crea la imagen y reemplázala con:

\`\`\`javascript
const img = new Image();
img.src = 'tu-imagen.jpg'; // Ruta a tu imagen
img.onload = function() {
    tempCanvas.width = img.width;
    tempCanvas.height = img.height;
    tempCtx.drawImage(img, 0, 0);
    
    // El resto del código...
}
\`\`\`

### Cambiar colores

Modifica el color en el CSS:
- `background: #0a1628;` - Color de fondo

O en el JavaScript para personalizar el color de las partículas.

### Cambiar el texto

En `script.js`, línea con `fillText`:
\`\`\`javascript
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
