"""
scraper.py — Extracts every article from the Civil Code of Québec.
Run locally once: python scraper.py
Output: data/articles.json

DOM structure (confirmed from live page):
  - Article blocks : <div class="section" id="se:X">
  - Article text   : <span class="Subsection"> (one per paragraph, join them)
  - Citations      : <div class="HistoricalNote"> (strip entirely)
  - Headings       : <div class="Heading Heading"> with Label-group2..6 / TitleText-group2..6
"""

import requests
from bs4 import BeautifulSoup, Tag
import json
import re
import os

URL = "https://www.legisquebec.gouv.qc.ca/fr/document/lc/CCQ-1991"
HEADERS = {"User-Agent": "Mozilla/5.0 (compatible; LegalAssistantBot/1.0)"}
OUTPUT = "data/articles.json"


# ── Helpers ───────────────────────────────────────────────────────────────────

def fetch_page() -> BeautifulSoup:
    print("Fetching Civil Code page…")
    resp = requests.get(URL, headers=HEADERS, timeout=30)
    resp.raise_for_status()
    print(f"  Status {resp.status_code} — {len(resp.text):,} chars received.")
    return BeautifulSoup(resp.text, "html.parser")


def extract_article_number(div: Tag) -> str | None:
    """
    Article id format: 'se:1', 'se:30_1', 'se:56_2'
    Underscore replaces dot in decimal articles (30.1, 56.2 …)
    """
    raw = div.get("id", "")
    if not raw.startswith("se:"):
        return None
    number = raw[3:].replace("_", ".")
    return number if number else None


def extract_article_text(div: Tag) -> str:
    """
    Join all <span class="Subsection"> paragraphs after removing HistoricalNote.
    """
    # Work on a copy so we don't mutate the tree
    clone = BeautifulSoup(str(div), "html.parser")

    # Strip legislative citations block
    for note in clone.find_all("div", class_="HistoricalNote"):
        note.decompose()

    # Strip history-link icons
    for link in clone.find_all("div", class_="HistoryLink"):
        link.decompose()

    # Collect paragraph spans in order
    paragraphs = []
    for span in clone.find_all("span", class_="Subsection"):
        text = re.sub(r"\s+", " ", span.get_text(" ", strip=True))
        if text:
            paragraphs.append(text)

    return " ".join(paragraphs)


def extract_heading_text(heading_div: Tag) -> str:
    """
    Build a clean heading string from a <div class='Heading Heading'>.
    Combines the label part (e.g. 'LIVRE PREMIER') and the title part
    (e.g. 'DES PERSONNES') into one string.
    """
    parts = []

    # Label: div or span with class matching Label-group*
    label_elem = heading_div.find(
        lambda t: t.name in ("div", "span")
        and any("Label-group" in c for c in t.get("class", []))
    )
    if label_elem:
        # Strip integrity:added spans (they duplicate text for screen readers)
        clone = BeautifulSoup(str(label_elem), "html.parser")
        for hidden in clone.find_all(class_="Hidden"):
            hidden.decompose()
        label_text = re.sub(r"\s+", " ", clone.get_text(" ", strip=True))
        if label_text:
            parts.append(label_text)

    # Title: div or span with class matching TitleText-group*
    title_elem = heading_div.find(
        lambda t: t.name in ("div", "span")
        and any("TitleText-group" in c for c in t.get("class", []))
    )
    if title_elem:
        clone = BeautifulSoup(str(title_elem), "html.parser")
        for sub in clone.find_all("div", class_="HistoricalNote"):
            sub.decompose()
        title_text = re.sub(r"\s+", " ", clone.get_text(" ", strip=True))
        if title_text:
            parts.append(title_text)

    return " — ".join(parts) if parts else ""


def heading_level(heading_div: Tag) -> int:
    """
    Return the structural level of a heading (2=LIVRE, 3=TITRE,
    4=CHAPITRE, 5=SECTION, 6=§).
    """
    for level in range(2, 7):
        if heading_div.find(class_=re.compile(rf"Label-group{level}")):
            return level
    return 0


# ── Main traversal ────────────────────────────────────────────────────────────

def traverse(soup: BeautifulSoup) -> list[dict]:
    """
    Walk the entire document tree top-down.
    Maintain a heading context dict that gets updated whenever we cross
    a heading node, then attach a snapshot of it to each article.
    """
    context = {
        "livre":    "",
        "titre":    "",
        "chapitre": "",
        "section":  "",
        "paragraphe": "",
    }

    LEVEL_KEY = {
        2: "livre",
        3: "titre",
        4: "chapitre",
        5: "section",
        6: "paragraphe",
    }

    # When we step up to a higher-level heading, clear all lower ones
    CLEARS = {
        2: ["titre", "chapitre", "section", "paragraphe"],
        3: ["chapitre", "section", "paragraphe"],
        4: ["section", "paragraphe"],
        5: ["paragraphe"],
        6: [],
    }

    articles = []

    def walk(node: Tag):
        for child in node.children:
            if not isinstance(child, Tag):
                continue

            classes = child.get("class", [])

            # Detect heading nodes
            if "Heading" in classes:
                level = heading_level(child)
                if level in LEVEL_KEY:
                    key = LEVEL_KEY[level]
                    context[key] = extract_heading_text(child)
                    for k in CLEARS[level]:
                        context[k] = ""
                # Don't recurse into heading — its children are label/title spans
                continue

            # Detect article nodes
            if "section" in classes and child.get("id", "").startswith("se:"):
                number = extract_article_number(child)
                text = extract_article_text(child)
                if number and text:
                    articles.append({
                        "number": number,
                        "text": text,
                        "livre":     context["livre"],
                        "titre":     context["titre"],
                        "chapitre":  context["chapitre"],
                        "section":   context["section"],
                        "paragraphe": context["paragraphe"],
                    })
                # Don't recurse — articles don't contain child articles
                continue

            # For any other container div, recurse
            walk(child)

    walk(soup.body or soup)
    return articles


# ── Entry point ───────────────────────────────────────────────────────────────

def main():
    os.makedirs("data", exist_ok=True)

    soup = fetch_page()
    articles = traverse(soup)

    if not articles:
        print(
            "\nNo articles found. The site may have changed its DOM structure.\n"
            "    Open the page in a browser and re-inspect if needed."
        )
        return

    # Sort numerically (handles 30.1, 56.2 etc.)
    def sort_key(a: dict) -> float:
        try:
            return float(a["number"])
        except ValueError:
            return 0.0

    articles.sort(key=sort_key)

    with open(OUTPUT, "w", encoding="utf-8") as f:
        json.dump(articles, f, indent=2, ensure_ascii=False)

    print(f"\nSaved {len(articles)} articles -> {OUTPUT}")
    print(f"    Sample: Art. {articles[0]['number']} | {articles[0]['livre']}")
    print(f"            '{articles[0]['text'][:80]}…'")


if __name__ == "__main__":
    main()