import csv
import pandas as pd


def read_csv_file(csv_file):
    with open(csv_file, 'r') as read_file:
        reader = csv.reader(read_file)
        header = next(reader)
        if header is not None:
            html_text = """ """
            for row in reader:
                html_box = f"""<div class="box">
                            <div class="movie_box">
                                <div class="movie_front">
                                    <img src="{row[6]}"
                                         alt="movie poster image">
                                </div>
                                <div class="movie_back">
                                    <h4 class="movie_title">{row[1]}</h4>
                                    <button class="movie_button">Information</button>
                                </div>
                            </div>
                        </div>
                    """
                html_text += html_box
            with open('html_text.txt','w') as txt_to_write:
                txt_to_write.write(html_text)
                txt_to_write.close()
                read_file.close()


# def read_csv_file_pandas(file):
#     df = pd.read_csv(file)
#     df_needed = df["movie_title", "movie_image"]
#     for row in df_needed:
#         print(row[0], row[1])




if __name__ == '__main__':
    read_csv_file("moviesListData.csv")
    # read_csv_file_pandas("moviesListData.csv")
