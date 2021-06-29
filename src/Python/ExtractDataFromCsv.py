from selenium import webdriver
import time
import pandas as pd
from selenium.common.exceptions import NoSuchElementException
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

TIMEOUT = 5
NOT_FOUND_ELEMENT = 'N/A'


def imdb_scraper():
    connect_to_the_browser()
    movies_data_dict = {}
    for movie in read_movies_file('movie list.csv'):
        movie_search(movie)

        if not check_page_version():
            print('main version active')
            extract_movie_data_main_page_version(movie, movies_data_dict)
        else:
            print('second version active')
            extract_movie_data_second_page_version(movie, movies_data_dict)
        return_to_the_main_search()

    create_csv_file_movie_data(movies_data_dict)


def extract_movie_data_main_page_version(movie, movies_data_dict):
    try:
        movie_title = browser.find_element_by_css_selector(
            '#__next > main > div > section.ipc-page-background.ipc-page-background--base.TitlePage__StyledPageBackground-wzlr49-0.dDUGgO > section > div:nth-child(4) > section > section > div.TitleBlock__Container-sc-1nlhx7j-0.hglRHk > div.TitleBlock__TitleContainer-sc-1nlhx7j-1.jxsVNt > h1').text
    except NoSuchElementException:
        print('no movie title found')
        movie_title = NOT_FOUND_ELEMENT
    try:
        movie_year = browser.find_element_by_css_selector(
            '#__next > main > div > section.ipc-page-background.ipc-page-background--base.TitlePage__StyledPageBackground-wzlr49-0.dDUGgO > section > div:nth-child(4) > section > section > div.TitleBlock__Container-sc-1nlhx7j-0.hglRHk > div.TitleBlock__TitleContainer-sc-1nlhx7j-1.jxsVNt > div.TitleBlock__TitleMetaDataContainer-sc-1nlhx7j-2.hWHMKr > ul > li:nth-child(1) > span').text
    except NoSuchElementException:
        print('no movie year found')
        movie_year = NOT_FOUND_ELEMENT
    try:
        movie_storyline = WebDriverWait(browser, TIMEOUT).until(EC.presence_of_element_located((By.CSS_SELECTOR,
                                                                                                '#__next > main > div > section.ipc-page-background.ipc-page-background--base.TitlePage__StyledPageBackground-wzlr49-0.dDUGgO > div > section > div > div.TitleMainBelowTheFoldGroup__TitleMainPrimaryGroup-sc-1vpywau-1.btXiqv.ipc-page-grid__item.ipc-page-grid__item--span-2 > section:nth-child(10) > div.Storyline__StorylineWrapper-sc-1b58ttw-0.iywpty > div.ipc-overflowText.ipc-overflowText--pageSection.ipc-overflowText--height-long.ipc-overflowText--long.ipc-overflowText--base > div.ipc-html-content.ipc-html-content--base > div')))
    except NoSuchElementException:
        print('no movie storyline found')
        movie_storyline = NOT_FOUND_ELEMENT
    try:
        movie_genres = browser.find_elements_by_css_selector(
            '#__next > main > div > section.ipc-page-background.ipc-page-background--base.TitlePage__StyledPageBackground-wzlr49-0.dDUGgO > section > div:nth-child(4) > section > section > div.Hero__MediaContentContainer__Video-kvkd64-2.kmTkgc > div.Hero__ContentContainer-kvkd64-10.eaUohq > div.Hero__MetaContainer__Video-kvkd64-4.kNqsIK > div.GenresAndPlot__ContentParent-cum89p-12.kqlJct.Hero__GenresAndPlotContainer-kvkd64-11.twqaW > div > a > span')
        movie_genres_list = [span.text for span in movie_genres]
    except NoSuchElementException:
        print('no movie genres found')
        movie_genres_list = NOT_FOUND_ELEMENT
    try:
        movie_trailer = browser.find_element_by_css_selector(
            '#__next > main > div > section.ipc-page-background.ipc-page-background--base.TitlePage__StyledPageBackground-wzlr49-0.dDUGgO > section > div:nth-child(4) > section > section > div.Hero__MediaContentContainer__Video-kvkd64-2.kmTkgc > div.Hero__MediaContainer__Video-kvkd64-3.FKYGY > div > div.Media__SlateContainer-sc-1x98dcb-2.hQJhqT > div.ipc-slate.ipc-slate--baseAlt.ipc-slate--dynamic-width.Slate__SlateContainer-ss6ccs-1.gQRPwy.ipc-sub-grid-item.ipc-sub-grid-item--span-4 > a').get_attribute(
            'href')
    except NoSuchElementException:
        print('no movie trailer found')
        movie_trailer = NOT_FOUND_ELEMENT
    try:
        img_link = browser.find_element_by_css_selector(
            '#__next > main > div > section.ipc-page-background.ipc-page-background--base.TitlePage__StyledPageBackground-wzlr49-0.dDUGgO > section > div:nth-child(4) > section > section > div.Hero__MediaContentContainer__Video-kvkd64-2.kmTkgc > div.Hero__MediaContainer__Video-kvkd64-3.FKYGY > div > div.Media__PosterContainer-sc-1x98dcb-1.dGdktI > div > a')
        img_link.click()
        movie_image = browser.find_element_by_css_selector(
            '#__next > main > div.ipc-page-content-container.ipc-page-content-container--full.BaseLayout__NextPageContentContainer-sc-180q5jf-0.fWxmdE > div.styles__MediaViewerContainerNoNav-sc-6t1jw8-1.hbiiqm.media-viewer > div:nth-child(4) > img').get_attribute(
            'src')
    except NoSuchElementException:
        print('no movie image found')
        movie_image = NOT_FOUND_ELEMENT

    movies_data_dict[movie] = [movie_title, movie_year, movie_storyline, movie_genres_list, movie_trailer, movie_image]


def extract_movie_data_second_page_version(movie, movies_data_dict):
    try:
        movie_title = browser.find_element_by_css_selector(
            '#title-overview-widget > div.vital > div.title_block > div > div.titleBar > div.title_wrapper > h1').text
        movie_title = movie_title[0:-7]
    except NoSuchElementException:
        print('no movie title found')
        movie_title = NOT_FOUND_ELEMENT
    try:
        movie_year = browser.find_element_by_css_selector('#titleYear > a').text
    except NoSuchElementException:
        print('no movie year found')
        movie_year = NOT_FOUND_ELEMENT
    try:
        movie_storyline = browser.find_element_by_css_selector('#titleStoryLine > div:nth-child(3) > p > span').text
    except NoSuchElementException:
        print('no movie storyline found')
        movie_storyline = NOT_FOUND_ELEMENT
    try:
        movie_genres = browser.find_elements_by_css_selector('#titleStoryLine > div:nth-child(10) > a')
        movie_genres_list = [a.text for a in movie_genres]
    except NoSuchElementException:
        print('no movie genres found')
        movie_genres_list = NOT_FOUND_ELEMENT
    try:
        movie_trailer = browser.find_element_by_css_selector(
            '#title-overview-widget > div.vital > div.slate_wrapper > div.videoPreview.videoPreview--autoPlaybackOnce > div.videoPreview__videoContainer > a').get_attribute(
            'href')
    except NoSuchElementException:
        print('no movie trailer found')
        movie_trailer = NOT_FOUND_ELEMENT
    try:
        img_link = browser.find_element_by_css_selector(
            '#title-overview-widget > div.vital > div.slate_wrapper > div.poster > a > img')
        img_link.click()
        movie_image = browser.find_element_by_css_selector(
            '#__next > main > div.ipc-page-content-container.ipc-page-content-container--full.BaseLayout__NextPageContentContainer-sc-180q5jf-0.fWxmdE > div.styles__MediaViewerContainerNoNav-sc-6t1jw8-1.hbiiqm.media-viewer > div:nth-child(4) > img').get_attribute(
            'src')
    except NoSuchElementException:
        print('no movie image found')
        movie_image = NOT_FOUND_ELEMENT

    movies_data_dict[movie] = [movie_title, movie_year, movie_storyline, movie_genres_list, movie_trailer, movie_image]


def movie_search(movie):
    search_bar = browser.find_element_by_css_selector('#suggestion-search')
    search_bar.send_keys(movie)
    search_button = browser.find_element_by_id('suggestion-search-button')
    search_button.click()
    time.sleep(1)

    movies_options = browser.find_elements_by_class_name('findResult')[0]
    enter_movie_page = movies_options.find_element_by_class_name('primary_photo')
    enter_movie_page.click()
    time.sleep(1)


def return_to_the_main_search():
    try:
        close_image_page_button = browser.find_element_by_css_selector(
            '#__next > main > div.ipc-page-content-container.ipc-page-content-container--full.BaseLayout__NextPageContentContainer-sc-180q5jf-0.fWxmdE > div.ipc-page-content-container.ipc-page-content-container--center > div > div.styles__BreadcrumbWrapper-mtrg0k-2.foFccY > a')
        close_image_page_button.click()
    except NoSuchElementException:
        print('could not find close image page button')
        browser.get("https://www.imdb.com/?ref_=nv_home")


def check_page_version():
    try:
        browser.find_element_by_id('styleguide-v2')
        return True
    except NoSuchElementException:
        return False


def scroll_slow_page():
    scroll_position = 500
    for timer in range(0, 6):
        browser.execute_script("window.scrollTo(0, " + str(scroll_position) + ")")
        scroll_position += 500
        time.sleep(1)


def read_movies_file(doc_list):
    movie_list_doc = pd.read_csv(doc_list)
    return [item for item in movie_list_doc['movies']]


def connect_to_the_browser():
    options = Options()
    options.headless = True
    global browser
    browser = webdriver.Chrome(
        executable_path=r"C:\Users\DELL\Desktop\Python\pycharm files\ChromeDriver\chromedriver.exe",
        options=options)
    browser.get("https://www.imdb.com/?ref_=nv_home")
    time.sleep(3)


def create_csv_file_movie_data(movies_data_dict):
    movies_df = pd.DataFrame.from_dict(movies_data_dict, orient='index',
                                       columns=['movie title', 'movie year', 'movie storyline', 'movie genres list',
                                                'movie trailer', 'movie image'])
    movies_df.to_csv('moviesListData.csv')


if __name__ == '__main__':
    imdb_scraper()
