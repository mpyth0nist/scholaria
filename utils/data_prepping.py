

from bs4 import BeautifulSoup

def clean_text(text : str) -> str:

    raw_text = text

    soup = BeautifulSoup(raw_text, "html.parser")

    clean_text = soup.get_text()

    return clean_text


processed_text = clean_text("""
<p data-path-to-node="0"><span style="font-family: Georgia, serif;"><span style="font-size: 18px; font-family: Georgia, serif;">While we often think of math as a series of discoveries, it is also a story of <b data-path-to-node="0" data-index-in-node="79" style="">geography</b>""")

print(processed_text)


