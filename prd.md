# Must Movies - Product Requirements Document

## 1. Overview

**Must Movies** is a static website that presents a curated list of must-watch movies. Users browse a visual grid of movie posters on the main page and click through to individual detail pages containing the synopsis, release year, genres, and an embedded trailer for each film.

## 2. Problem Statement

Movie enthusiasts need a simple, visually appealing way to discover a curated list of essential films. Existing platforms like IMDB or Letterboxd are comprehensive but overwhelming. Must Movies provides a focused, opinionated collection with a clean browsing experience.

## 3. Target Audience

- Casual movie watchers looking for recommendations.
- Friends of the curator who want a shared reference list.

## 4. Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML5, CSS3, vanilla JavaScript |
| Fonts | Google Fonts (Oswald, Bebas Neue, Poppins) |
| Tooling | Python 3.x scripts (Selenium, pandas) for data scraping and page generation |
| Hosting | Static file hosting (e.g., GitHub Pages) |

No build step, bundler, or framework is required. The site is fully static.

## 5. Features

### 5.1 Main Page (`src/main/MainPage.html`)

| Feature | Description |
|---------|-------------|
| **Hero Section** | Full-viewport banner image with title, tagline, and animated CTA button that scrolls to the movie grid. |
| **Navigation Bar** | Fixed top nav with logo, ABOUT and CONTACT anchor links. Auto-hides on scroll down, reappears on scroll up. Background transitions from transparent to solid black past the hero. |
| **Movie Grid** | Responsive CSS Grid of 20 movie poster cards. Each card shows the poster image; on hover, a gradient overlay reveals the movie title and a "See More" link. |
| **Footer** | Three-column layout over an animated background: branding/attribution, About Us section, and Contact info. |

### 5.2 Movie Detail Pages (`src/PagesHTML/MoviePages/*.html`)

Each of the 20 movies has a dedicated page containing:

| Element | Description |
|---------|-------------|
| **Background** | Full-screen wallpaper image sourced from alphacoders.com, covered by a semi-transparent dark overlay. |
| **Back Navigation** | Fixed "MAIN PAGE" link in the top-right to return to the grid. |
| **Movie Title** | Large display heading using Bebas Neue font. |
| **Year Badge** | Release year displayed in a bordered badge. |
| **Storyline** | Plot synopsis in Poppins body font. |
| **Genres** | Horizontal list of genre tags. |
| **Trailer** | Embedded YouTube iframe (or video element for the sample page). |

### 5.3 Python Data Pipeline (`src/Python/`)

Utility scripts used to generate movie data and HTML pages:

| Script | Purpose |
|--------|---------|
| `extract_movies_data_from_file.py` | Scrapes IMDB for movie metadata (title, year, synopsis, genres, trailer, poster). Outputs `moviesListData.csv`. |
| `extract_movies_wallpaper.py` | Scrapes alphacoders.com for movie wallpaper URLs. Outputs `moviesListWallpaper.csv`. |
| `create_movies_pages.py` | Reads both CSVs and generates individual HTML detail pages under `PagesHTML/MoviePages/`. |
| `create_movies_boxes.py` | Reads movie data CSV and generates the HTML card markup for the main page grid. Outputs `html_text.txt`. |

> **Note:** The scraper scripts depend on a compatible Chrome/ChromeDriver setup and may require CSS selector updates as IMDB and alphacoders change their markup.

## 6. Current Movie Catalog

The site currently features 20 films:

Jurassic Park, The Hobbit: An Unexpected Journey, The Lord of the Rings (Fellowship, Two Towers, Return of the King), Big Hero 6, The Hitchhiker's Guide to the Galaxy, Men in Black (1, II, 3), Up, Aladdin, Avengers: Endgame, Avengers: Infinity War, Transformers, X-Men Origins: Wolverine, American Psycho, Meet the Parents, The Lion King, The Chronicles of Narnia.

## 7. Data Sources

| Data | Source | Storage |
|------|--------|---------|
| Movie metadata (title, year, synopsis, genres) | IMDB (scraped) | `moviesListData.csv` |
| Movie poster images | IMDB / Amazon CDN (scraped URLs) | `moviesListData.csv` column; local copies in `src/assets/MoviePoster/` |
| Movie wallpapers | alphacoders.com (scraped) | `moviesListWallpaper.csv` |
| Movie trailers | YouTube (embedded iframes) | Inline in each detail page HTML |

## 8. Project Structure

```
Must-Movies/
├── .gitignore
├── prd.md
├── README.md
└── src/
    ├── main/                          # Main page assets
    │   ├── MainPage.html              # Entry point
    │   ├── MainPage.css               # Main page styles + design tokens
    │   ├── nav-scroll.js              # Navigation scroll behavior
    │   └── assets/                    # Logo, hero image, favicon, icons
    ├── assets/
    │   └── MoviePoster/               # Local movie poster images (20 JPGs)
    ├── PagesHTML/
    │   ├── SecondaryPage.css          # Shared styles for all detail pages
    │   ├── SamplePage/                # Template/sample detail page
    │   └── MoviePages/                # 20 generated movie detail pages
    └── Python/
        ├── movie list.csv             # Input: list of movie names
        ├── moviesListData.csv         # Output: scraped movie metadata
        ├── moviesListWallpaper.csv    # Output: scraped wallpaper URLs
        ├── html_text.txt              # Output: generated card HTML
        ├── extract_movies_data_from_file.py
        ├── extract_movies_wallpaper.py
        ├── create_movies_pages.py
        └── create_movies_boxes.py
```

## 9. Design Specifications

### Color Palette

| Token | Value | Usage |
|-------|-------|-------|
| `--color-bg` | `#ffffff` | Page background |
| `--color-dark` | `#111111` | Dark backgrounds, button fills |
| `--color-cream` | `#f4f1de` | Nav links, button text |
| `--color-gold` | `#f2cc8f` | Headings, hero text |
| `--color-sand` | `#d9cfb8` | Footer text |
| `--color-accent` | `#00b4d8` | Movie card buttons |
| `--color-accent-hover` | `#0096c7` | Button hover state |
| `--color-nav-hover` | `#e28065` | Nav link hover |
| `--color-link-hover` | `#892b46` | Footer link hover |

### Typography

| Context | Font | Weight |
|---------|------|--------|
| Display / Headings (main page) | Oswald | 200 |
| Display / Headings (detail pages) | Bebas Neue | 400 |
| Body text (detail pages) | Poppins | 400 |
| UI / Footer | System font stack | 400 |

### Responsive Breakpoints

| Breakpoint | Behavior |
|------------|----------|
| > 768px | Full desktop layout, 3-4 column grid |
| <= 768px | Reduced nav, tighter grid, stacked footer |
| <= 480px | 2-column grid, smaller text and buttons |

## 10. User Flows

### Browse and Discover

1. User lands on the main page and sees the hero section.
2. User clicks "THE LIST" or scrolls down to the movie grid.
3. User hovers over a poster to see the movie title and "See More" link.
4. User clicks "See More" to navigate to the detail page.

### View Movie Details

1. User reads the synopsis, sees the year and genres.
2. User watches the embedded trailer.
3. User clicks "MAIN PAGE" in the top-right to return to the grid.

## 11. Non-Functional Requirements

| Requirement | Details |
|-------------|---------|
| **Performance** | Fully static site with no server-side rendering. Page weight depends on external image/video CDNs. |
| **Browser Support** | Modern browsers (Chrome, Firefox, Safari, Edge). Responsive down to 320px viewport. |
| **Accessibility** | Semantic HTML, alt text on images, keyboard-navigable links. |
| **SEO** | Unique `<title>` per page, meta charset and viewport tags on all pages. |
| **Security** | No user input, no backend, no cookies. No personal data stored. |

## 12. Known Limitations

- Movie data is static and must be regenerated via the Python scripts to add/update films.
- Scraper scripts depend on IMDB/alphacoders page structure and may break when those sites update.
- Trailer embeds rely on YouTube availability and may be region-blocked.
- No search, filtering, or sorting functionality on the movie grid.
- No mobile touch-friendly way to reveal movie titles (hover-only overlay).

## 13. Future Considerations

- Add a search or filter bar to the movie grid.
- Show movie titles below posters (not just on hover) for mobile/touch users.
- Migrate to a static site generator (e.g., 11ty, Hugo) to template the 20 identical detail pages from CSV data.
- Add lazy loading for poster images to improve initial page load.
- Replace scraped data pipeline with a public movie API (e.g., TMDB) for live data.
