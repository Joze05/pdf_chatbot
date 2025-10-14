import PyPDF2
from pathlib import Path

PDF_PATH = Path("backend/data/Accessible_Travel_Guide_Partial.pdf")
_pdf_content = None # Variable to keep the PDF text in memory.


def load_pdf_content() -> str:
    """Reads the PDF and save their content in memory"""
    global _pdf_content
    if _pdf_content is not None:
        return _pdf_content

    if not PDF_PATH.exists():
        raise FileNotFoundError(f"PDF file not found in path: {PDF_PATH}")

    text = ""
    with open(PDF_PATH, "rb") as file:
        reader = PyPDF2.PdfReader(file)
        for page in reader.pages:
            text += page.extract_text() or ""

    _pdf_content = text
    print(f"✅ PDF load with {len(text)} text characters.")
    return _pdf_content


def get_pdf_content() -> str:
    """Returns the PDF content loaded in memory"""
    global _pdf_content
    if _pdf_content is None:
        _pdf_content = load_pdf_content()
    return _pdf_content
