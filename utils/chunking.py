from langchain_text_splitters import RecursiveCharacterTextSplitter
from transformers import AutoTokenizer



def chunk_text(text: str, chunk_size: int=200, overlap: int=50) -> list[str]:

    if not text or not text.strip():
        return []

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=overlap,
        separators=["\n\n", "\n", ".", ", ","!"," "]
    )

    return splitter.split_text(text)

