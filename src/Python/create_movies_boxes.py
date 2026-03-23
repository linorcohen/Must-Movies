import csv
import os

OUTPUT_FILE = "html_text.txt"


def generate_movie_boxes_html(csv_file):
    """
    Reads the movie data CSV and generates HTML markup for the movie card grid.
    Writes the result to html_text.txt.
    """
    with open(csv_file, "r", encoding="utf-8") as read_file:
        reader = csv.reader(read_file)
        header = next(reader)
        if header is None:
            return

        html_parts = []
        for row in reader:
            slug = row[0].replace(" ", "").replace(":", "").replace("-", "")
            html_parts.append(
                f'<div class="box">\n'
                f'    <div class="movie_box">\n'
                f'        <div class="movie_front">\n'
                f'            <img src="{row[6]}" alt="movie poster image">\n'
                f'        </div>\n'
                f'        <div class="movie_back">\n'
                f'            <h4 class="movie_title">{row[1]}</h4>\n'
                f'            <button class="movie_button">\n'
                f'                <a href="../PagesHTML/MoviePages/{slug}Page.html">See More</a>\n'
                f'            </button>\n'
                f'        </div>\n'
                f'    </div>\n'
                f'</div>'
            )

        output_path = os.path.join(os.path.dirname(csv_file), OUTPUT_FILE)
        with open(output_path, "w", encoding="utf-8") as out_file:
            out_file.write("\n".join(html_parts))


if __name__ == "__main__":
    generate_movie_boxes_html("moviesListData.csv")
