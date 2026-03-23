import ast
import csv
import os

OUTPUT_DIR = os.path.join("..", "PagesHTML", "MoviePages")


def load_wallpapers(csv_file):
    """Load wallpaper URLs into a dict keyed by movie identifier."""
    wallpapers = {}
    with open(csv_file, "r", encoding="utf-8") as f:
        reader = csv.reader(f)
        next(reader)  # skip header
        for row in reader:
            wallpapers[row[0]] = row[1]
    return wallpapers


def generate_movie_pages(csv_file_data, csv_file_wallpaper):
    """
    Reads movie data and wallpaper CSVs, then generates individual HTML pages
    for each movie under PagesHTML/MoviePages/.
    """
    wallpapers = load_wallpapers(csv_file_wallpaper)

    with open(csv_file_data, "r", encoding="utf-8") as f:
        reader = csv.reader(f)
        next(reader)  # skip header

        for row in reader:
            movie_id = row[0]
            title = row[1]
            year = row[2]
            storyline = row[3]
            genres_list = ast.literal_eval(row[4])
            trailer_url = row[5]

            wallpaper_url = wallpapers.get(movie_id, "")
            genres_html = "".join(
                f'<li class="genre">{genre}</li>' for genre in genres_list
            )

            html_page = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Must Watch | {title}</title>
    <link rel="stylesheet" href="../SecondaryPage.css" type="text/css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Cabin&family=Poppins&display=swap" rel="stylesheet">
    <link rel="icon" type="image/png" href="../../main/assets/headLogo.png"/>
</head>
<body style="background-image: url('{wallpaper_url}');">
<div class="design_container">
    <nav class="back_nav">
        <ul>
            <li><a href="../../main/MainPage.html">MAIN PAGE</a></li>
        </ul>
    </nav>
    <div class="main_container">
        <div class="info_container">
            <h1 class="movie_title">{title}</h1>
            <div class="year_box">
                <h2>{year}</h2>
            </div>
            <p class="movie_storyline">{storyline}</p>
            <ul class="movie_genres">
                {genres_html}
            </ul>
            <div class="trailer_container">
                <h2 class="trailer_heading">WATCH THE TRAILER</h2>
                <div class="video_box">
                    <video controls>
                        <source src="{trailer_url}" type="video/mp4">
                        Your browser does not support the video tag.
                    </video>
                </div>
            </div>
        </div>
    </div>
</div>
</body>
</html>
"""
            slug = movie_id.replace(" ", "").replace(":", "").replace("-", "")
            os.makedirs(OUTPUT_DIR, exist_ok=True)
            filepath = os.path.join(OUTPUT_DIR, f"{slug}Page.html")
            with open(filepath, "w", encoding="utf-8") as out_file:
                out_file.write(html_page)
            print(f"Generated: {filepath}")


if __name__ == "__main__":
    generate_movie_pages("moviesListData.csv", "moviesListWallpaper.csv")
