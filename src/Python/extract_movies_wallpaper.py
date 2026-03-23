"""
Movie wallpaper scraper for alphacoders.com.
NOTE: This script requires a compatible Chrome/ChromeDriver setup.
"""
import time

import pandas as pd
from selenium import webdriver
from selenium.common.exceptions import NoSuchElementException
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By

NOT_FOUND = "N/A"
WALLPAPER_SITE = "https://wall.alphacoders.com/by_collection.php?id=175"


def create_browser():
    """Create and return a headless Chrome browser instance."""
    options = Options()
    options.add_argument("--headless")
    return webdriver.Chrome(options=options)


def read_movies_file(csv_path):
    """Read movie names from a CSV file and return them as a list."""
    df = pd.read_csv(csv_path)
    return df["movies"].tolist()


def search_wallpaper(browser, movie):
    """Search for a movie wallpaper on the wallpaper site."""
    search_input = browser.find_element(By.CSS_SELECTOR, "#search")
    search_input.clear()
    search_input.send_keys(movie)
    browser.find_element(
        By.CSS_SELECTOR,
        "form div > span > button"
    ).click()
    time.sleep(1)


def extract_wallpaper_url(browser):
    """Extract the first wallpaper image URL from search results."""
    try:
        thumb_link = browser.find_element(
            By.CSS_SELECTOR,
            "div.thumb-container-big div.thumb-container div.boxgrid > a"
        ).get_attribute("href")
        time.sleep(2)
        browser.get(thumb_link)
        time.sleep(2)
        wallpaper_url = browser.find_element(
            By.CSS_SELECTOR,
            "#page_container div.img-container-desktop a > picture > img"
        ).get_attribute("src")
        return wallpaper_url
    except NoSuchElementException:
        return NOT_FOUND


def create_csv_file(wallpaper_dict, output_path="moviesListWallpaper_Test.csv"):
    """Write wallpaper data to a CSV file."""
    df = pd.DataFrame.from_dict(
        wallpaper_dict, orient="index", columns=["movie wallpaper"]
    )
    df.to_csv(output_path)


def wallpaper_scraper():
    """Main entry point: scrape wallpapers for each movie in the list."""
    browser = create_browser()
    try:
        browser.get(WALLPAPER_SITE)
        time.sleep(3)

        wallpapers = {}
        for movie in read_movies_file("movie list.csv"):
            search_wallpaper(browser, movie)
            wallpapers[movie] = [extract_wallpaper_url(browser)]

        create_csv_file(wallpapers)
    finally:
        browser.quit()


if __name__ == "__main__":
    wallpaper_scraper()
