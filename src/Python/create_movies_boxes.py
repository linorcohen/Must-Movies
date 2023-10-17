import csv


def read_csv_file(csv_file):
    """
    This function reads the csv file and creates the html boxes for the movies
    """
    with open(csv_file, 'r') as read_file:
        reader = csv.reader(read_file)
        header = next(reader)
        if header is not None:
            html_text = """ """
            for row in reader:
                name = ((row[0]).replace(' ', '').replace(':', '').replace('-', ''))
                html_box = f"""<div class="box">
                            <div class="movie_box">
                                <div class="movie_front">
                                    <img src="{row[6]}" alt="movie poster image">
                                </div>
                                <div class="movie_back">
                                    <h4 class="movie_title">{row[1]}</h4>
                                    <button class="movie_button"><a 
                                    href="../PagesHTML/MoviePages/{name}Page.html" 
                                    target="_blank">See More</a></button>
                                </div>
                            </div>
                        </div>
                    """
                html_text += html_box
            with open('html_text.txt', 'w') as txt_to_write:
                txt_to_write.write(html_text)
                txt_to_write.close()
                read_file.close()


if __name__ == '__main__':
    read_csv_file("moviesListData.csv")
