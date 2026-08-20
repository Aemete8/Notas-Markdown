# Notas Markdown

Aplicación web para crear, editar y previsualizar notas en formato Markdown. Construida con JavaScript vanilla, sin frameworks ni dependencias de producción.

## Características

- Crear, guardar y eliminar notas
- Previsualización en tiempo real del contenido Markdown
- Persistencia en `localStorage`
- Tema claro / oscuro con preferencia guardada
- Diseño responsive

## Tecnologías

- HTML5 semántico
- CSS3 con custom properties (sistema de tokens dual-mode)
- JavaScript vanilla (ES6+)
- [markdown-it](https://github.com/markdown-it/markdown-it) para el renderizado de Markdown

## Estructura del proyecto

```
notas-markdown/
├── index.html
├── styles.css
├── app.js
├── .gitignore
├── .prettierrc
├── package.json
└── README.md
```

## Instalación y uso

1. Clona el repositorio:
   ```bash
   git clone https://github.com/Aemete8/Notas-Markdown
   ```

2. Instala las dependencias de desarrollo:
   ```bash
   npm install
   ```

3. Abre `index.html` en tu navegador o usa una extensión como Live Server en VS Code.

## Scripts disponibles

```bash
npm run format   # Formatea el código con Prettier
```

## Licencia

MIT