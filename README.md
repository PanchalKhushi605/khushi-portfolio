# Khushi Panchal · Portfolio

Personal portfolio website for Khushi Panchal, UI/UX & Graphic Designer.
The design follows the "Pastel Blue and Pink" portfolio deck: cream, blush and ice-blue sections, hand-drawn doodles, and brush-stroke labels.

It's a plain static site with no build step:

```
index.html        page content
css/style.css     all styles (colours are CSS variables at the top)
js/main.js        menu, scroll animations, laptop slideshow, image lightbox
assets/img/       portfolio images
```

## Editing

- **Text / contact links:** edit `index.html`.
- **Add a project:** copy one `<article class="card …">` block, point `src` at a new image in `assets/img/`, and set `data-full` to the large version shown in the lightbox.
- **Colours:** change the variables in `:root` at the top of `css/style.css`.

## Deploying

The site is connected to Vercel. Every push to `main` redeploys automatically.
