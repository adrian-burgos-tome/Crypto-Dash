# ⟐ CryptoDash ⟐
### Monitor de Criptomonedas — Estética Cyberpunk en Tiempo Real

Proyecto desarrollado para la asignatura de **Lenguaje de Marcas (1º DAW)** por [Adrián Burgos Tomé](https://github.com/adrian-burgos-tome).

---

## 🚀 Presentación
**CryptoDash** es una aplicación web de alto rendimiento diseñada bajo una estética **Cyberpunk Neón**. Su objetivo es proporcionar una monitorización fluida y visualmente impactante de los principales criptoactivos del mercado, consumiendo datos en tiempo real de la API de **CoinGecko**.

![Estado de la App](https://img.shields.io/badge/Status-Online-00ff41?style=for-the-badge&logo=statuspage&logoColor=00ff41)
![Tecnologías](https://img.shields.io/badge/Tecnologías-HTML5%20|%20CSS3%20|%20JS-blueviolet?style=for-the-badge)

---

## 🎨 Características Visuales (Cyberpunk UI)
La interfaz ha sido diseñada para ofrecer una experiencia inmersiva:
- **Efectos de Monitor CRT:** Líneas de escaneo (*scanlines*) sutiles y rejilla de fondo dinámica.
- **Paleta Neón:** Uso predominante de negro puro (#050505) con acentos en Verde Neón (#00ff41) y Cyan.
- **Micro-interacciones:** Animaciones de *glow*, transición de tarjetas y feedback visual instantáneo.
- **Responsividad Total:** Adaptada para terminales móviles y monitores ultra-wide.

---

## ⚙️ Arquitectura Técnica y Robustez
Para garantizar que la aplicación sea "a prueba de fallos" y cumpla con estándares profesionales, se han implementado:

- **🛡️ Sistema de Caché Inteligente:** Memoria caché de **120 segundos** (2 min). Reduce el uso de ancho de banda y evita el bloqueo por límites de tasa (*Rate Limiting*) de la API de CoinGecko.
- **⏱️ Retraso Artificial de Escaneo:** Se ha implementado un retardo asíncrono de `500ms` entre consultas para estabilizar la conexión y mejorar la sensación táctica de "escaneo de datos".
- **🚦 Gestión Proactiva de Errores:** Detección de errores HTTP 429 (Too Many Requests) con mensajes personalizados para el usuario.
- **Modularidad:** Separación estricta entre la lógica de conexión (`api.js`) y la manipulación del DOM (`main.js`).

---

## 🛠️ Tecnologías
- **Estructura:** HTML5 Semántico (`<article>`, `<section>`, `<header>`).
- **Estilos:** CSS3 nativo con Variables Dinámicas y animaciones `@keyframes`.
- **Lógica:** JavaScript Moderno (ES6+) aplicando `Async/Await`, `Fetch API` y gestión de `Maps` para el caché.
- **Tipografía:** *Orbitron*, *Share Tech Mono* y *Rajdhani* (Google Fonts).

---

## 📂 Estructura del Proyecto
```text
/
├── index.html       # Punto de entrada y estructura base
├── css/             
│   └── styles.css   # Motor de diseño Cyberpunk y animaciones
├── js/              
│   ├── api.js       # Capa de datos, Caché y Conectividad
│   └── main.js      # Controlador de UI y eventos
└── assets/          # Recursos estáticos (Favicon, imágenes)
```

---

## ⚙️ Instalación y Uso
1. **Clonación:**
   ```bash
   git clone https://github.com/adrian-burgos-tome/Crypto-Dash.git
   ```
2. **Ejecución:**
   Simplemente abre `index.html` en cualquier navegador moderno. Se recomienda el uso de **Live Server** para una experiencia óptima de carga de scripts.

---

## 👤 Autor
* **Adrián Burgos Tomé**
* Estudiante de 1º DAW (Desarrollo de Aplicaciones Web)
* [GitHub Profile](https://github.com/adrian-burgos-tome)

---
> [!NOTE]
> Este proyecto ha sido verificado como **Portátil**: no requiere de servidores `node_modules` ni compilaciones previas. Funciona "Out-of-the-box".
