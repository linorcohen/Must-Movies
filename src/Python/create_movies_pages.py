import ast
import csv
import time


def read_csv_files(csv_file_data, csv_file_wallpaper):
    """
    This function reads the csv files and creates the html pages for each movie.
    """
    read_file_data = open(csv_file_data, 'r')
    read_file_wallpaper = open(csv_file_wallpaper, 'r')

    reader_data = csv.reader(read_file_data)
    reader_wallpaper = csv.reader(read_file_wallpaper)

    header_data = next(reader_data)
    header_wallpaper = next(reader_wallpaper)

    if header_data is not None and header_wallpaper is not None:
        for row_data in reader_data:
            for row_wallpaper in reader_wallpaper:
                if row_data[0] == row_wallpaper[0]:
                    genres = """ """
                    for genre in ast.literal_eval(row_data[4]):
                        li_tag = f"""<li class="genre">{genre}</li>"""
                        genres += li_tag
                    html_page = f"""
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Must Watch | {row_data[1]}</title>
    <link rel="stylesheet" href="../SecondaryPage.css" type="text/css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap" rel="stylesheet">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cabin&family=Poppins&display=swap" rel="stylesheet">
    <link rel="icon" type="image/png" href="../../main/headLogo.png"/>
</head>
<body style="background-image: url('{row_wallpaper[1]}');">
<div class="design_container">
    <nav class="back_nav">
        <ul>
            <li><a href="../../main/MainPage.html">MAIN PAGE</a></li>
        </ul>
    </nav>
    <div class="main_container">
        <div class="info_container">
            <h1 class="movie_title">{row_data[1]}</h1>
            <div class="year_box">
                <h2>{row_data[2]}</h2>
            </div>
            <p class="movie_storyline">{row_data[3]}</p>
            <ul class="movie_genres">
                {genres}
            </ul>
            <div class="trailer_container">
                <h2 class="trailer_heading">WATCH THE TRAILER</h2>
                <div class="video_box">
                    <video width="590" height="321" controls>
                        <source src="{row_data[5]}"
                                type="video/mp4">
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
                    name = ((row_data[0]).replace(' ', '').replace(':', '').replace('-', ''))
                    html_file = open(f"../PagesHTML/MoviePages/{name}Page.html","w")
                    html_file.write(html_page)
                    time.sleep(1)
                    html_file.close()
                    break

    read_file_wallpaper.close()
    read_file_data.close()


if __name__ == '__main__':
    read_csv_files('moviesListData.csv', 'moviesListWallpaper.csv')
