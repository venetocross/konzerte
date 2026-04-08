import anthropic
import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime

# --- Konfiguration (wird aus GitHub Secrets geladen) ---
ANTHROPIC_API_KEY = os.environ["ANTHROPIC_API_KEY"]
ARCOR_EMAIL = os.environ["ARCOR_EMAIL"]        # z.B. venetocross@arcor.de
ARCOR_PASSWORD = os.environ["ARCOR_PASSWORD"]
TO_EMAIL = "venetocross@arcor.de"

SMTP_HOST = "smtp.arcor.de"
SMTP_PORT = 587


def suche_konzerte() -> str:
    client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)

    prompt = (
        "Suche alle Metal-Konzerte in Berlin in den nächsten 14 Tagen. "
        "Durchsuche verschiedene Quellen: Eventim, Ticketmaster, Berlin.de Veranstaltungen, "
        "Venue-Websites (Columbiahalle, Huxleys, SO36, Cassiopeia, Hole44, Lido, usw.), "
        "Facebook Events, lokale Metal-Blogs und Foren. "
        "Alle Subgenres: Heavy, Thrash, Death, Black, Doom, Power, Folk, Core usw. "
        "Auch kleine Clubshows und Underground-Konzerte. "
        "Gib eine Liste aus mit:\n"
        "- Datum & Uhrzeit\n"
        "- Band(s)\n"
        "- Venue\n"
        "- Ticketlink (falls vorhanden)\n"
        "Sortiere nach Datum. Wenn keine Info zu Tickets: trotzdem auflisten."
    )

    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=4096,
        tools=[{"type": "web_search_20250305", "name": "web_search"}],
        messages=[{"role": "user", "content": prompt}],
    )

    # Text aus allen Content-Blöcken zusammensetzen
    result = ""
    for block in response.content:
        if block.type == "text":
            result += block.text

    return result if result else "Keine Konzerte gefunden."


def sende_email(inhalt: str):
    datum = datetime.now().strftime("%d.%m.%Y")
    betreff = f"🤘 Metal-Konzerte Berlin – {datum}"

    msg = MIMEMultipart("alternative")
    msg["Subject"] = betreff
    msg["From"] = ARCOR_EMAIL
    msg["To"] = TO_EMAIL

    # Plain-Text Version
    text_part = MIMEText(inhalt, "plain", "utf-8")
    msg.attach(text_part)

    with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
        server.starttls()
        server.login(ARCOR_EMAIL, ARCOR_PASSWORD)
        server.sendmail(ARCOR_EMAIL, TO_EMAIL, msg.as_string())
        print(f"E-Mail gesendet an {TO_EMAIL}")


if __name__ == "__main__":
    print("Suche Metal-Konzerte in Berlin...")
    konzerte = suche_konzerte()
    print("Sende E-Mail...")
    sende_email(konzerte)
    print("Fertig.")
