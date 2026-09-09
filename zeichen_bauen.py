# -*- coding: utf-8 -*-
"""
Das Zeichen des Amateurfunk-Trainers.

WOHER ES KOMMT
Dietmar am 09.09.2026, mit dem Symbol einer fremden Funk-App als
Anschauung: "Das mit den Funkwellen rechts und Links gefällt mir gut.
Ebenso auch die Farbe. Dazwischen ist ein VFO Knopf. Der muss raus und 55
muss da rein. Da wo RigOne steht, möchte ich Amateurfunk und darunter
---Trainer---"

Übernommen ist deshalb nur, was ihm gefiel und was niemandem gehört: eine
Wellenlinie und ein Türkis auf dunklem Grund. Der Drehknopf, die Wortmarke
und die Beschriftung der Vorlage kommen NICHT mit - das ist die Arbeit
anderer Leute. Alles hier ist selbst gezeichnet.

WIE ES SICH ENTWICKELT HAT
 * Erst stand die 55 in poliertem Edelstahl da ("Die 55 auch in so einem
   pollierten Edelstahl look?"). Dabei fiel eine dunkle Stufe des Verlaufs
   genau auf die Höhe der Wellenlinie - Dietmar sah einen Strich, der durch
   die Zahl läuft und dort einen Schatten wirft. Zwei verschiedene Dinge auf
   einer Flucht liest das Auge als eines.
 * Aus fünf Vorschlägen wählte er die Skala und dazu: "Entferne den
   Edelstahl Look und mache die 55 einfach weiss." Damit ist die Sache
   endgültig aus der Welt: Wo kein Verlauf ist, kann auch keine Stufe
   irgendwo hinfallen. Und eine weisse Zahl bleibt auf 16 Punkten lesbar,
   wo ein Verlauf zu Grau verrührt.

WAS ENTSTEHT
  icon-512.png, icon.png (512), icon-192.png     - die Fassung mit Schrift
  icon.ico, favicon.ico                          - acht Stufen, 16 bis 256
  icon-512-maskierbar.png                        - für den Startbildschirm
  icon.icns                                      - für die .app auf dem Mac

Aufruf:  python3 zeichen_bauen.py
"""
import math, random
from PIL import Image, ImageDraw, ImageFilter, ImageFont

G      = 1024                      # gezeichnet wird gross und dann verkleinert
NAVY_O = (10, 32, 56)              # oben
NAVY_U = (18, 56, 90)              # unten
TUERK  = (34, 224, 242)            # das Tuerkis, das ihm gefiel
WEISS  = (245, 250, 253)

F_FETT = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'


def leuchten(ebene, radius, staerke=1.0):
    """Weichzeichnen und aufaddieren - so entsteht der Neon-Schein."""
    g = ebene.filter(ImageFilter.GaussianBlur(radius))
    if staerke != 1.0:
        a = g.split()[3].point(lambda v: int(min(255, v * staerke)))
        g.putalpha(a)
    return g


def grund():
    """Dunkler Verlauf in einem abgerundeten Quadrat, mit Rand und Schein."""
    bild = Image.new('RGBA', (G, G), (0, 0, 0, 0))

    verlauf = Image.new('RGB', (1, G))
    for y in range(G):
        t = y / (G - 1)
        verlauf.putpixel((0, y), tuple(
            int(NAVY_O[i] + (NAVY_U[i] - NAVY_O[i]) * t) for i in range(3)))
    verlauf = verlauf.resize((G, G)).convert('RGBA')

    # Etwas Licht in der Mitte, damit die Flaeche nicht tot wirkt.
    licht = Image.new('L', (G, G), 0)
    ImageDraw.Draw(licht).ellipse([G * 0.06, G * 0.02, G * 0.94, G * 0.72], fill=46)
    licht = licht.filter(ImageFilter.GaussianBlur(150))
    verlauf = Image.composite(Image.new('RGBA', (G, G), (30, 92, 130, 255)),
                              verlauf, licht)

    rand = 26
    maske = Image.new('L', (G, G), 0)
    ImageDraw.Draw(maske).rounded_rectangle(
        [rand, rand, G - rand, G - rand], radius=int(G * 0.215), fill=255)
    bild.paste(verlauf, (0, 0), maske)

    # Die tuerkise Linie am Rand, zweimal: weich fuer den Schein, scharf drauf.
    linie = Image.new('RGBA', (G, G), (0, 0, 0, 0))
    ImageDraw.Draw(linie).rounded_rectangle(
        [rand + 7, rand + 7, G - rand - 7, G - rand - 7],
        radius=int(G * 0.20), outline=TUERK + (255,), width=7)
    bild.alpha_composite(leuchten(linie, 16, 1.5))
    bild.alpha_composite(linie)
    return bild


def welle(von, bis, y, hoehe, saat=55):
    """Eine Zackenlinie, wie sie ein Empfänger auf den Schirm schreibt."""
    random.seed(saat)
    punkte, x, n = [], von, 0
    while x <= bis:
        # Zwei ueberlagerte Schwingungen plus Zufall - das gibt die
        # unregelmaessige Zackung, die nach Empfang aussieht und nicht
        # nach Schulbuch-Sinus. Die Raender laufen weich aus, damit die
        # Linie nicht abgeschnitten wirkt.
        weich = min(1.0, (x - von) / (0.28 * (bis - von)),
                    (bis - x) / (0.28 * (bis - von)))
        a = (math.sin(n * 0.55) * 0.45 + math.sin(n * 1.9) * 0.3
             + random.uniform(-0.55, 0.55))
        if n % 11 == 0:
            # Ab und zu ein hoher Ausschlag - aber gedeckelt: Bei 2,1 reichte
            # eine Spitze bis in die Skala hinunter und sah aus, als haenge
            # die Welle in den Teilstrichen.
            a *= 1.6
        punkte.append((x, y - a * hoehe * weich))
        x += 7
        n += 1
    return punkte


def wellen_auftragen(bild, y, hoehe):
    """Links und rechts eine Welle, dazwischen bleibt die Zahl frei."""
    w = Image.new('RGBA', (G, G), (0, 0, 0, 0))
    wd = ImageDraw.Draw(w)
    for i, (a, b) in enumerate(((int(G * 0.040), int(G * 0.275)),
                                (int(G * 0.725), int(G * 0.960)))):
        wd.line(welle(a, b, y, hoehe, 55 + i * 7), fill=TUERK + (255,),
                width=6, joint='curve')
        # Eine ruhige Grundlinie unter jeder Welle - die Null, um die sie
        # schwingt. Sie hoert vor der Zahl auf und laeuft nicht hindurch.
        wd.line([(a, y), (b, y)], fill=TUERK + (110,), width=4)
    bild.alpha_composite(leuchten(w, 22, 1.7))
    bild.alpha_composite(leuchten(w, 7, 1.0))
    bild.alpha_composite(w)


def zahl(bild, mitte_y, gross):
    """Die 55 in Weiss, mit tuerkisem Schein.

    Dietmar am 09.09.2026: "Entferne den Edelstahl Look und mache die 55
    einfach weiss." Der Schein bleibt - er bindet die Zahl an die Farbe
    der Tafel und hebt sie zugleich vom dunklen Grund ab. Fuer Funker
    heisst 55 "viel Erfolg"; sie ist ausserdem das Einzige, was auf der
    Taskleiste in 16 Punkten noch zu erkennen ist.
    """
    f = ImageFont.truetype(F_FETT, int(G * gross))
    m = Image.new('L', (G, G), 0)
    ImageDraw.Draw(m).text((G // 2, mitte_y), '55', font=f, fill=255, anchor='mm')

    schein = Image.new('RGBA', (G, G), (0, 0, 0, 0))
    schein.paste(Image.new('RGB', (G, G), TUERK), (0, 0), m)
    bild.alpha_composite(leuchten(schein, 26, 1.5))

    weiss = Image.new('RGBA', (G, G), (0, 0, 0, 0))
    weiss.paste(Image.new('RGB', (G, G), WEISS), (0, 0), m)
    bild.alpha_composite(weiss)


def skala(bild, y):
    """Die Skala eines S-Meters.

    Dietmar aus fünf Vorschlägen: "Das mit der Skala gefällt mir gut."
    Sie erdet die Zahl, statt sie schweben zu lassen, und ist das
    Einzige auf der Tafel, das ohne Worte "Messgerät" sagt. Lange
    Striche fuer die vollen Werte, kurze dazwischen - wie an jedem
    Instrument, das man je in der Hand hatte.
    """
    s = Image.new('RGBA', (G, G), (0, 0, 0, 0))
    sd = ImageDraw.Draw(s)
    a, e = int(G * 0.13), int(G * 0.87)
    sd.line([(a, y), (e, y)], fill=TUERK + (150,), width=4)
    n = 24
    for i in range(n + 1):
        x = a + (e - a) * i / n
        lang = i % 4 == 0
        sd.line([(x, y), (x, y - (int(G * 0.038) if lang else int(G * 0.019)))],
                fill=TUERK + (255 if lang else 150,), width=6 if lang else 4)
    bild.alpha_composite(leuchten(s, 14, 1.3))
    bild.alpha_composite(s)


def schrift(bild):
    """Amateurfunk, darunter --- TRAINER ---."""
    d = ImageDraw.Draw(bild)
    fa = ImageFont.truetype(F_FETT, int(G * 0.113))
    d.text((G // 2, int(G * 0.705)), 'Amateurfunk', font=fa,
           fill=WEISS + (255,), anchor='mm')

    # Dietmar wollte die Striche rechts und links: "darunter ---Trainer---".
    ft = ImageFont.truetype(F_FETT, int(G * 0.062))
    wort, sperre = 'TRAINER', int(G * 0.018)
    breiten = [d.textlength(c, font=ft) for c in wort]
    ges = sum(breiten) + sperre * (len(wort) - 1)
    y = int(G * 0.825)
    x = (G - ges) / 2
    for c, b in zip(wort, breiten):
        d.text((x, y), c, font=ft, fill=TUERK + (255,), anchor='lm')
        x += b + sperre
    lang, luft = int(G * 0.11), int(G * 0.035)
    links = (G - ges) / 2 - luft
    rechts = (G + ges) / 2 + luft
    d.line([(links - lang, y), (links, y)], fill=TUERK + (215,), width=5)
    d.line([(rechts, y), (rechts + lang, y)], fill=TUERK + (215,), width=5)


# ---------------------------------------------------------------------------
#  Drei Fassungen. Je kleiner die Flaeche, desto weniger darf darauf stehen -
#  in 16 Punkten waere von "Amateurfunk" ein grauer Streifen, aus der Skala
#  ein Balken und aus den Wellen ein Gekrissel, das die Zahl unleserlich
#  macht.
# ---------------------------------------------------------------------------
def voll():                       # ab 128 Punkten
    b = grund()
    # Die Hoehen sind gegeneinander abgewogen: Ueber der Zahl soll so viel
    # Luft sein wie zwischen Skala und Wortmarke, sonst kippt die Tafel
    # optisch nach oben.
    my = int(G * 0.375)
    wellen_auftragen(b, my, G * 0.090)
    zahl(b, my, 0.255)
    skala(b, int(G * 0.552))
    schrift(b)
    return b


def mittel():                     # 48 bis 96 Punkte
    b = grund()
    my = int(G * 0.42)
    wellen_auftragen(b, my, G * 0.125)
    zahl(b, my, 0.32)
    return b


def winzig():                     # bis 32 Punkte
    b = grund()
    zahl(b, G // 2, 0.46)
    return b


def maskierbar():
    """Fuer den Startbildschirm am Handy.

    Android schneidet dieses Bild in die Form, die das Geraet gerade
    benutzt - Kreis, Squircle, Tropfen. Verlassen darf man sich nur auf
    den inneren Kreis mit 80 Prozent Durchmesser; alles ausserhalb kann
    weg sein. Deshalb: Farbe bis in jede Ecke (keine abgerundete Kachel,
    die spaeter ein zweites Mal gerundet wird) und nur die Zahl, klein
    genug, dass sie in jeder Form vollstaendig stehen bleibt.
    """
    hinter = Image.new('RGBA', (G, G), (0, 0, 0, 0))
    verlauf = Image.new('RGB', (1, G))
    for y in range(G):
        t = y / (G - 1)
        verlauf.putpixel((0, y), tuple(
            int(NAVY_O[i] + (NAVY_U[i] - NAVY_O[i]) * t) for i in range(3)))
    hinter.paste(verlauf.resize((G, G)).convert('RGBA'), (0, 0))
    zahl(hinter, G // 2, 0.34)
    return hinter


# ---------------------------------------------------------------------------
#  icon.icns - das Format, das macOS fuer eine .app erwartet
# ---------------------------------------------------------------------------
#  Auf dem Mac baut man so etwas sonst mit iconutil. Das gibt es hier nicht,
#  und ein Zeichen, das nur auf einem Mac entstehen kann, waere ein Zeichen,
#  das niemand nachbauen kann. Also von Hand - das Format ist einfach:
#
#     "icns" + Gesamtlaenge(4)   dann fuer jedes Bild:
#     Typ(4) + Laenge(4) + Nutzlast
#
#  Als Nutzlast nimmt macOS seit 10.7 einfache PNG-Dateien. Die Typkuerzel
#  sind fest vergeben (ic07 = 128, ic08 = 256, ic09 = 512 ...), deshalb
#  stehen sie unten als Liste.
# ---------------------------------------------------------------------------
def icns_schreiben(pfad, gross, mittel, winzig):
    import struct, io as _io
    teile = [
        ('ic12',   64, mittel),   # 32 x 32 @2x
        ('ic07',  128, gross),
        ('ic13',  256, gross),    # 128 x 128 @2x
        ('ic08',  256, gross),
        ('ic14',  512, gross),    # 256 x 256 @2x
        ('ic09',  512, gross),
        ('ic10', 1024, gross),    # 512 x 512 @2x
    ]
    bloecke = b''
    for typ, kante, quelle in teile:
        puffer = _io.BytesIO()
        quelle.resize((kante, kante), Image.LANCZOS).save(puffer, format='PNG')
        daten = puffer.getvalue()
        bloecke += typ.encode('ascii') + struct.pack('>I', len(daten) + 8) + daten
    with open(pfad, 'wb') as f:
        f.write(b'icns' + struct.pack('>I', len(bloecke) + 8) + bloecke)


if __name__ == '__main__':
    Z = '/root/work/fix2/'
    g, m, w = voll(), mittel(), winzig()

    g.resize((512, 512), Image.LANCZOS).save(Z + 'icon-512.png')
    g.resize((512, 512), Image.LANCZOS).save(Z + 'icon.png')
    g.resize((192, 192), Image.LANCZOS).save(Z + 'icon-192.png')
    maskierbar().resize((512, 512), Image.LANCZOS).save(Z + 'icon-512-maskierbar.png')
    g.save('/tmp/icon-vorschau.png')

    # Welche Fassung bei welcher Groesse?
    #
    # Dietmar am 09.09.2026, als das neue Zeichen endlich auf dem
    # Schreibtisch stand: "Auf dem ICO fehlt Amateurfunk ----Trainer----"
    #
    # Er hat es an der Stelle gesehen, an der Windows mittelgrosse Symbole
    # zeichnet - 48 Punkte. Dort stand bisher die mittlere Fassung: Wellen
    # und Zahl, ohne Schrift. Der Gedanke war, dass "Amateurfunk" in 48
    # Punkten nur noch ein grauer Streifen ist.
    #
    # Das stimmt fuer die LESBARKEIT, aber darum geht es hier nicht: Ein
    # Symbol wird nicht gelesen, es wird WIEDERERKANNT. Und wiedererkannt
    # wird die ganze Tafel - Wellen oben, Zahl, Schriftblock unten -, auch
    # wenn die Buchstaben zu Streifen werden. Wer sein Zeichen entworfen
    # hat, will es auf dem Schreibtisch sehen und nicht dessen Kurzfassung.
    #
    # Ab 48 Punkten also die ganze Tafel. Darunter (32, 24, 16 - Taskleiste
    # und Listen) bleibt die Zahl allein: Dort waere auch die Welle nur noch
    # Gekrissel, und die 55 ist das, was das Zeichen dort ausmacht.
    stufen = []
    for s in (256, 128, 96, 64, 48, 32, 24, 16):
        quelle = g if s >= 48 else w
        stufen.append(quelle.resize((s, s), Image.LANCZOS))
    for datei in ('icon.ico', 'favicon.ico'):
        stufen[0].save(Z + datei, format='ICO',
                       sizes=[(i.width, i.height) for i in stufen],
                       append_images=stufen[1:])

    icns_schreiben(Z + 'icon.icns', g, m, w)
    print('Zeichen gebaut')
