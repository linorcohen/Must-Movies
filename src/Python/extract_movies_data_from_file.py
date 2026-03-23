"""
IMDB movie data scraper.
NOTE: This script requires a compatible Chrome/ChromeDriver setup and may need
CSS selector updates as IMDB changes its markup frequently.
"""
import time

import pandas as pd
from selenium import webdriver
from selenium.common.exceptions import NoSuchElementException
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait

TIMEOUT = 30
NOT_FOUND = "N/A"
IMDB_HOME = "https://www.imdb.com/?ref_=nv_home"


def create_browser():
    """Create and return a headless Chrome browser instance."""
    options = Options()
    options.add_argument("--headless")
    return webdriver.Chrome(options=options)


def read_movies_file(csv_path):
    """Read movie names from a CSV file and return them as a list."""
    df = pd.read_csv(csv_path)
    return df["movies"].tolist()


def movie_search(browser, movie):
    """Search for a specific movie on IMDB."""
    search_bar = browser.find_element(By.CSS_SELECTOR, "#suggestion-search")
    search_bar.send_keys(movie)
    browser.find_element(By.ID, "suggestion-search-button").click()
    time.sleep(1)

    first_result = browser.find_elements(By.CLASS_NAME, "findResult")[0]
    first_result.find_element(By.CLASS_NAME, "primary_photo").click()
    time.sleep(1)


def check_page_version(browser):
    """Check if the IMDB page uses the legacy (v2) layout."""
    try:
        browser.find_element(By.ID, "styleguide-v2")
        return True
    except NoSuchElementException:
        return False


def return_to_main_search(browser):
    """Navigate back to the IMDB home page."""
    try:
        close_btn = browser.find_element(
            By.CSS_SELECTOR,
            "#__next > main > div.ipc-page-content-container "
            "> div.ipc-page-content-container--center > div "
            "> div.styles__BreadcrumbWrapper-mtrg0k-2 > a"
        )
        close_btn.click()
    except NoSuchElementException:
        browser.get(IMDB_HOME)


def _safe_find_text(browser, selector):
    """Return element text or NOT_FOUND if element is missing."""
    try:
        return browser.find_element(By.CSS_SELECTOR, selector).text
    except NoSuchElementException:
        return NOT_FOUND


def extract_movie_data_main_version(browser, movie, data_dict):
    """Extract movie data from the modern IMDB page layout."""
    title_sel = (
        "#__next > main > div > section.ipc-page-background "
        "> section > div:nth-child(4) > section > section "
        "> div.TitleBlock__Container > div.TitleBlock__TitleContainer > h1"
    )
    year_sel = (
        "#__next > main > div > section.ipc-page-background "
        "> section > div:nth-child(4) > section > section "
        "> div.TitleBlock__Container > div.TitleBlock__TitleContainer "
        "> div.TitleBlock__TitleMetaDataContainer > ul > li:nth-child(1) > span"
    )

    movie_title = _safe_find_text(browser, title_sel)
    movie_year = _safe_find_text(browser, year_sel)

    try:
        storyline_el = WebDriverWait(browser, TIMEOUT).until(
            EC.presence_of_element_located(
                (By.CSS_SELECTOR, "[class*='Storyline'] .ipc-html-content > div")
            )
        )
        movie_storyline = storyline_el.text
    except Exception:
        movie_storyline = NOT_FOUND

    try:
        genre_elements = browser.find_elements(
            By.CSS_SELECTOR,
            "div.GenresAndPlot__ContentParent a > span"
        )
        genres = [el.text for el in genre_elements]
    except NoSuchElementException:
        genres = NOT_FOUND

    try:
        trailer_link_el = browser.find_element(
            By.CSS_SELECTOR,
            "div.Hero__MediaContainer__Video a.ipc-slate"
        )
        browser.get(trailer_link_el.get_attribute("href"))
        time.sleep(2)
        trailer = browser.find_element(
            By.CSS_SELECTOR, "#imdb-jw-video-1 video"
        ).get_attribute("src")
        browser.back()
    except NoSuchElementException:
        trailer = NOT_FOUND

    try:
        browser.find_element(By.CSS_SELECTOR, "div.Media__PosterContainer a").click()
        image = browser.find_element(
            By.CSS_SELECTOR, "div.media-viewer img"
        ).get_attribute("src")
    except NoSuchElementException:
        image = NOT_FOUND

    data_dict[movie] = [movie_title, movie_year, movie_storyline, genres, trailer, image]


def extract_movie_data_legacy_version(browser, movie, data_dict):
    """Extract movie data from the legacy IMDB page layout."""
    try:
        raw_title = browser.find_element(
            By.CSS_SELECTOR,
            "#title-overview-widget .title_wrapper > h1"
        ).text
        movie_title = raw_title[:-7]  # strip year suffix
    except NoSuchElementException:
        movie_title = NOT_FOUND

    try:
        movie_year = browser.find_element(By.CSS_SELECTOR, "#titleYear > a").text
    except NoSuchElementException:
        movie_year = NOT_FOUND

    try:
        movie_storyline = browser.find_element(
            By.CSS_SELECTOR, "#titleStoryLine > div:nth-child(3) > p > span"
        ).text
    except NoSuchElementException:
        movie_storyline = NOT_FOUND

    try:
        genre_elements = browser.find_elements(
            By.CSS_SELECTOR, "#titleStoryLine > div:nth-child(10) > a"
        )
        genres = [el.text for el in genre_elements]
    except NoSuchElementException:
        genres = NOT_FOUND

    try:
        trailer_link = browser.find_element(
            By.CSS_SELECTOR,
            "#title-overview-widget .videoPreview a"
        ).get_attribute("href")
        browser.get(trailer_link)
        trailer = browser.find_element(
            By.CSS_SELECTOR, "#imdb-jw-video-1 video"
        ).get_attribute("src")
    except NoSuchElementException:
        trailer = NOT_FOUND

    try:
        browser.find_element(
            By.CSS_SELECTOR, "#title-overview-widget .poster a > img"
        ).click()
        image = browser.find_element(
            By.CSS_SELECTOR, "div.media-viewer img"
        ).get_attribute("src")
    except NoSuchElementException:
        image = NOT_FOUND

    data_dict[movie] = [movie_title, movie_year, movie_storyline, genres, trailer, image]


def create_csv_file(data_dict, output_path="moviesListData_test.csv"):
    """Write scraped movie data to a CSV file."""
    df = pd.DataFrame.from_dict(
        data_dict,
        orient="index",
        columns=["movie title", "movie year", "movie storyline",
                 "movie genres list", "movie trailer", "movie image"],
    )
    df.to_csv(output_path)


def imdb_scraper():
    """Main entry point: scrape IMDB for each movie in the list."""
    browser = create_browser()
    try:
        browser.get(IMDB_HOME)
        time.sleep(3)

        movies_data = {}
        for movie in read_movies_file("movie list.csv"):
            movie_search(browser, movie)
            if check_page_version(browser):
                extract_movie_data_legacy_version(browser, movie, movies_data)
            else:
                extract_movie_data_main_version(browser, movie, movies_data)
            return_to_main_search(browser)

        create_csv_file(movies_data)
    finally:
        browser.quit()


if __name__ == "__main__":
    imdb_scraper()
