# Antigravity Portfolio

A professional, minimalist portfolio website built with React and Tailwind CSS, designed to showcase AI Engineering and Deep Learning expertise.

## Features

- **Dark Theme**: Professional near-black background with muted accent colors
- **Responsive Design**: Mobile-first approach, fully responsive across all devices
- **Minimal & Clean**: High-signal, low-noise design philosophy
- **Modern Stack**: React + Vite + Tailwind CSS
- **SEO Optimized**: Proper meta tags and semantic HTML
- **Performance**: Fast loading with optimized builds

## Project Structure

```
portfolio/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Button.jsx
│   │   ├── ProjectCard.jsx
│   │   └── SkillTag.jsx
│   ├── sections/            # Page sections
│   │   ├── Navbar.jsx
│   │   ├── Hero.jsx
│   │   ├── About.jsx
│   │   ├── Skills.jsx
│   │   ├── Projects.jsx
│   │   ├── LearningPhilosophy.jsx
│   │   ├── Resume.jsx
│   │   └── Contact.jsx
│   ├── App.jsx             # Main application
│   ├── main.jsx            # Entry point
│   └── index.css           # Tailwind styles
├── public/
│   └── resume.pdf          # Resume PDF (replace with yours)
├── index.html
├── package.json
├── tailwind.config.js
├── postcss.config.js
└── vite.config.js
```

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Visit `http://localhost:5173` to view the site.

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## Customization

### Update Personal Information

1. **Hero Section** (`src/sections/Hero.jsx`):
   - Replace "Your Name" with your actual name
   - Update GitHub and LinkedIn URLs

2. **Contact Section** (`src/sections/Contact.jsx`):
   - Update email address
   - Update GitHub and LinkedIn URLs

3. **Projects** (`src/sections/Projects.jsx`):
   - Replace placeholder projects with your actual projects
   - Update GitHub repository URLs

4. **Resume** (`public/resume.pdf`):
   - Replace the placeholder PDF with your actual resume

### Customize Colors

Edit `tailwind.config.js` to change the color scheme:

```javascript
colors: {
  dark: {
    bg: '#0a0a0a',           // Background color
    surface: '#111111',       // Card/surface color
    border: '#222222',        // Border color
    accent: '#6b7280',        // Accent color
  },
}
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import your repository in Vercel
3. Vercel will auto-detect Vite and deploy

### Manual Build

```bash
npm run build
```

Upload the `dist/` folder to any static hosting service.

## Technologies

- **React 18**: Modern functional components with hooks
- **Vite**: Fast build tool and dev server
- **Tailwind CSS 3**: Utility-first CSS framework
- **PostCSS**: CSS processing with Autoprefixer

## License

MIT License - feel free to use this template for your own portfolio.

## Credits

Built with modern web technologies and a focus on clarity and professionalism.
