
import markdown
from bs4 import BeautifulSoup


def clean_text(text : str) -> str:

    raw_text = text

    html_content = markdown.markdown(raw_text)

    soup = BeautifulSoup(html_content, "html.parser")

    clean_text = soup.get_text()

    return clean_text


