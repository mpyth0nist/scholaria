

from bs4 import BeautifulSoup

def clean_text(text : str) -> str:

    raw_text = text

    soup = BeautifulSoup(raw_text, "html.parser")

    clean_text = soup.get_text()

    return clean_text



