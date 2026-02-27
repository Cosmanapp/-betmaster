from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image, Table, TableStyle, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
from reportlab.lib import colors
from reportlab.lib.units import cm, inch
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase.pdfmetrics import registerFontFamily
import os

# Register fonts
pdfmetrics.registerFont(TTFont('SimHei', '/usr/share/fonts/truetype/chinese/SimHei.ttf'))
pdfmetrics.registerFont(TTFont('Times New Roman', '/usr/share/fonts/truetype/english/Times-New-Roman.ttf'))
registerFontFamily('Times New Roman', normal='Times New Roman', bold='Times New Roman')
registerFontFamily('SimHei', normal='SimHei', bold='SimHei')

# Create document
doc = SimpleDocTemplate(
    "/home/z/my-project/download/BetMaster_AI_Guida.pdf",
    pagesize=A4,
    rightMargin=2*cm,
    leftMargin=2*cm,
    topMargin=2*cm,
    bottomMargin=2*cm,
    title="BetMaster AI - Guida Completa",
    author="Z.ai",
    creator="Z.ai",
    subject="Guida all'applicazione suggeritore scommesse"
)

# Styles
styles = getSampleStyleSheet()

title_style = ParagraphStyle(
    'Title',
    fontName='Times New Roman',
    fontSize=28,
    leading=34,
    alignment=TA_CENTER,
    spaceAfter=20,
    textColor=colors.HexColor('#10b981')
)

heading1_style = ParagraphStyle(
    'Heading1',
    fontName='Times New Roman',
    fontSize=18,
    leading=22,
    spaceBefore=20,
    spaceAfter=12,
    textColor=colors.HexColor('#1f4e79')
)

heading2_style = ParagraphStyle(
    'Heading2',
    fontName='Times New Roman',
    fontSize=14,
    leading=18,
    spaceBefore=15,
    spaceAfter=8,
    textColor=colors.HexColor('#3b82f6')
)

body_style = ParagraphStyle(
    'Body',
    fontName='Times New Roman',
    fontSize=11,
    leading=16,
    alignment=TA_JUSTIFY,
    spaceAfter=10
)

bullet_style = ParagraphStyle(
    'Bullet',
    fontName='Times New Roman',
    fontSize=11,
    leading=16,
    leftIndent=20,
    spaceAfter=6
)

story = []

# Cover
story.append(Spacer(1, 80))
story.append(Paragraph("🏆 BetMaster AI", title_style))
story.append(Spacer(1, 20))
story.append(Paragraph("<b>Suggeritore Scommesse Professionale</b>", ParagraphStyle('Subtitle', fontName='Times New Roman', fontSize=16, alignment=TA_CENTER, textColor=colors.gray)))
story.append(Spacer(1, 30))
story.append(Paragraph("Guida Completa all'Applicazione", ParagraphStyle('Sub2', fontName='Times New Roman', fontSize=14, alignment=TA_CENTER)))
story.append(Spacer(1, 50))

# Add preview image if exists
preview_path = "/home/z/my-project/download/betmaster_preview.png"
if os.path.exists(preview_path):
    img = Image(preview_path, width=14*cm, height=8*cm)
    story.append(img)

story.append(Spacer(1, 30))
story.append(Paragraph("Versione 1.0 | Febbraio 2025", ParagraphStyle('Version', fontName='Times New Roman', fontSize=10, alignment=TA_CENTER, textColor=colors.gray)))
story.append(PageBreak())

# Introduction
story.append(Paragraph("<b>Cos'è BetMaster AI</b>", heading1_style))
story.append(Paragraph(
    "BetMaster AI è un'applicazione web professionale per suggerimenti scommesse sportive. "
    "Utilizza intelligenza artificiale e ricerca web in tempo reale per fornire analisi dettagliate, "
    "previsioni e gestione intelligente del bankroll. L'app è progettata per essere utilizzata "
    "esclusivamente dal proprietario, con sincronizzazione automatica dei dati tra dispositivi.",
    body_style
))

story.append(Paragraph("<b>Caratteristiche Principali</b>", heading1_style))
features = [
    "• <b>Dashboard Intelligente</b> - Panoramica completa di bankroll, statistiche e performance",
    "• <b>Suggerimenti Giornalieri</b> - Analisi AI multi-sport con confidence e reasoning",
    "• <b>Percorso Calcio Europeo</b> - Gestione bankroll per campionati europei",
    "• <b>Sezione Enalotto</b> - Ritardatari, estrazioni e combinazioni",
    "• <b>Storico Giocate</b> - Tracking completo con aggiornamento risultati",
    "• <b>Statistiche Avanzate</b> - Grafici, ROI, win rate e performance per sport",
    "• <b>Sincronizzazione Cloud</b> - Dati salvati automaticamente sul server"
]
for f in features:
    story.append(Paragraph(f, bullet_style))

story.append(PageBreak())

# Dashboard Section
story.append(Paragraph("<b>1. Dashboard Principale</b>", heading1_style))
story.append(Paragraph(
    "La Dashboard è il cuore dell'applicazione e fornisce una visione d'insieme immediata "
    "dello stato delle tue scommesse. È divisa in sezioni chiare e intuitive.",
    body_style
))

story.append(Paragraph("<b>1.1 Statistiche Rapide</b>", heading2_style))
story.append(Paragraph(
    "In alto trovi quattro card con le metriche essenziali:",
    body_style
))

stats_data = [
    ["Metrica", "Descrizione"],
    ["Bankroll", "Il tuo capitale attuale in euro, aggiornato in tempo reale"],
    ["Vincenti", "Numero totale di scommesse vinte"],
    ["Perdenti", "Numero totale di scommesse perse"],
    ["ROI", "Return on Investment percentuale (profitto/stake totale × 100)"]
]

header_style_tbl = ParagraphStyle('TableHeader', fontName='Times New Roman', fontSize=10, textColor=colors.white, alignment=TA_CENTER)
cell_style_tbl = ParagraphStyle('TableCell', fontName='Times New Roman', fontSize=10, alignment=TA_CENTER)

stats_table_data = [
    [Paragraph('<b>Metrica</b>', header_style_tbl), Paragraph('<b>Descrizione</b>', header_style_tbl)],
    [Paragraph('Bankroll', cell_style_tbl), Paragraph('Capitale attuale in euro', cell_style_tbl)],
    [Paragraph('Vincenti', cell_style_tbl), Paragraph('Numero scommesse vinte', cell_style_tbl)],
    [Paragraph('Perdenti', cell_style_tbl), Paragraph('Numero scommesse perse', cell_style_tbl)],
    [Paragraph('ROI', cell_style_tbl), Paragraph('Return on Investment %', cell_style_tbl)]
]

t = Table(stats_table_data, colWidths=[4*cm, 10*cm])
t.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1f4e79')),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('BACKGROUND', (0, 1), (-1, 1), colors.white),
    ('BACKGROUND', (0, 2), (-1, 2), colors.HexColor('#f5f5f5')),
    ('BACKGROUND', (0, 3), (-1, 3), colors.white),
    ('BACKGROUND', (0, 4), (-1, 4), colors.HexColor('#f5f5f5')),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('LEFTPADDING', (0, 0), (-1, -1), 8),
    ('RIGHTPADDING', (0, 0), (-1, -1), 8),
]))
story.append(Spacer(1, 10))
story.append(t)
story.append(Spacer(1, 15))

story.append(Paragraph("<b>1.2 Grafico Andamento Profitti</b>", heading2_style))
story.append(Paragraph(
    "Un grafico a area mostra l'andamento cumulativo dei profitti nel tempo. "
    "Ogni punto rappresenta il saldo netto dopo ogni giornata di gioco. "
    "Il grafico si aggiorna automaticamente quando registri i risultati delle tue giocate.",
    body_style
))

story.append(Paragraph("<b>1.3 Suggerimenti del Giorno</b>", heading2_style))
story.append(Paragraph(
    "Un widget mostra i primi 3 suggerimenti del giorno con evento, previsione, quota e confidence. "
    "Cliccando su 'Aggiorna' l'AI ricerca dati online e genera nuovi suggerimenti.",
    body_style
))

story.append(PageBreak())

# Daily Tips Section
story.append(Paragraph("<b>2. Suggerimenti del Giorno</b>", heading1_style))
story.append(Paragraph(
    "Questa sezione è il cuore operativo dell'app. Qui ricevi i suggerimenti di giocata "
    "generati dall'AI dopo aver analizzato dati online in tempo reale.",
    body_style
))

story.append(Paragraph("<b>2.1 Come Funziona</b>", heading2_style))
steps = [
    "1. Seleziona lo sport di interesse (Calcio, Basket, Tennis, F1, ecc.)",
    "2. Imposta il numero di eventi desiderati (da 1 a 20)",
    "3. Clicca 'Aggiorna' per avviare l'analisi AI",
    "4. L'AI cerca online quote, statistiche, news e formazioni",
    "5. Vengono generati suggerimenti con confidence e reasoning"
]
for s in steps:
    story.append(Paragraph(s, bullet_style))

story.append(Paragraph("<b>2.2 Informazioni per Ogni Suggerimento</b>", heading2_style))
story.append(Paragraph(
    "Ogni suggerimento include:",
    body_style
))
info_items = [
    "• <b>Evento</b> - La partita o competizione",
    "• <b>Sport</b> - Categoria sportiva",
    "• <b>Previsione</b> - Il tipo di scommessa consigliata (1, X, 2, Over/Under, ecc.)",
    "• <b>Quota</b> - La quota offerta dai bookmaker",
    "• <b>Confidence</b> - Livello di fiducia da 0 a 100%",
    "• <b>Reasoning</b> - Spiegazione dettagliata del perché di questa previsione"
]
for i in info_items:
    story.append(Paragraph(i, bullet_style))

story.append(Paragraph("<b>2.3 Giocare un Suggerimento</b>", heading2_style))
story.append(Paragraph(
    "Per ogni suggerimento trovi un pulsante 'Gioca €X'. Cliccando, la giocata viene "
    "registrata nello storico e lo stake viene sottratto dal bankroll. "
    "Puoi sempre modificare l'importo nelle Impostazioni.",
    body_style
))

story.append(PageBreak())

# Football Journey Section
story.append(Paragraph("<b>3. Percorso Calcio Europeo</b>", heading1_style))
story.append(Paragraph(
    "Questa funzionalità ti permette di seguire un percorso strutturato di gioco "
    "sui principali campionati europei, con gestione intelligente del bankroll.",
    body_style
))

story.append(Paragraph("<b>3.1 Campionati Supportati</b>", heading2_style))
leagues = [
    "• 🇮🇹 Serie A (Italia)",
    "• 🏴󠁧󠁢󠁥󠁮󠁧󠁿 Premier League (Inghilterra)",
    "• 🇪🇸 La Liga (Spagna)",
    "• 🇩🇪 Bundesliga (Germania)",
    "• 🇫🇷 Ligue 1 (Francia)",
    "• 🏆 Champions League",
    "• 🇪🇺 Europa League",
    "• 🏟️ Conference League"
]
for l in leagues:
    story.append(Paragraph(l, bullet_style))

story.append(Paragraph("<b>3.2 Avvio del Percorso</b>", heading2_style))
story.append(Paragraph(
    "Per iniziare, imposti:",
    body_style
))
startup = [
    "• <b>Bankroll Iniziale</b> - Il capitale di partenza",
    "• <b>Obiettivo Profitto</b> - Il guadagno target da raggiungere",
    "• <b>Campionati</b> - Seleziona quelli di tuo interesse"
]
for s in startup:
    story.append(Paragraph(s, bullet_style))

story.append(Paragraph("<b>3.3 Gestione Intelligente dello Stake</b>", heading2_style))
story.append(Paragraph(
    "Il sistema calcola automaticamente lo stake in base al livello di rischio scelto:",
    body_style
))

stake_data = [
    [Paragraph('<b>Livello</b>', header_style_tbl), Paragraph('<b>% Bankroll</b>', header_style_tbl), Paragraph('<b>Dopo Vittoria</b>', header_style_tbl), Paragraph('<b>Dopo Perdita</b>', header_style_tbl)],
    [Paragraph('Basso', cell_style_tbl), Paragraph('2%', cell_style_tbl), Paragraph('Mantiene', cell_style_tbl), Paragraph('Riduce 20%', cell_style_tbl)],
    [Paragraph('Medio', cell_style_tbl), Paragraph('5%', cell_style_tbl), Paragraph('Mantiene', cell_style_tbl), Paragraph('Riduce 20%', cell_style_tbl)],
    [Paragraph('Alto', cell_style_tbl), Paragraph('10%', cell_style_tbl), Paragraph('Mantiene', cell_style_tbl), Paragraph('Riduce 20%', cell_style_tbl)]
]

t2 = Table(stake_data, colWidths=[3.5*cm, 3.5*cm, 3.5*cm, 3.5*cm])
t2.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#10b981')),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('BACKGROUND', (0, 1), (-1, -1), colors.white),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
]))
story.append(Spacer(1, 10))
story.append(t2)
story.append(Spacer(1, 15))

story.append(Paragraph(
    "<b>NOTA IMPORTANTE:</b> Il sistema NON usa mai la strategia Martingala (raddoppio dopo perdita). "
    "Questo è un principio fondamentale per una gestione responsabile del bankroll.",
    body_style
))

story.append(PageBreak())

# Enalotto Section
story.append(Paragraph("<b>4. Sezione Enalotto</b>", heading1_style))
story.append(Paragraph(
    "Sezione dedicata esclusivamente al gioco dell'Enalotto italiano, con analisi "
    "ritardatari, estrazioni e suggerimenti combinazioni.",
    body_style
))

story.append(Paragraph("<b>4.1 Funzionalità Disponibili</b>", heading2_style))
enalotto_features = [
    "• <b>Ritardatari</b> - Numeri che non escono da più tempo su ogni ruota",
    "• <b>Ultima Estrazione</b> - I numeri estratti nell'ultima estrazione ufficiale",
    "• <b>Suggerimento</b> - Combinazioni generate dall'AI basate sui ritardatari"
]
for f in enalotto_features:
    story.append(Paragraph(f, bullet_style))

story.append(Paragraph("<b>4.2 Ruote Supportate</b>", heading2_style))
ruote_text = "Bari, Cagliari, Firenze, Genova, Milano, Napoli, Palermo, Roma, Torino, Venezia, Nazionale"
story.append(Paragraph(ruote_text, body_style))

story.append(Paragraph("<b>4.3 Tipi di Combinazioni</b>", heading2_style))
comb_types = [
    "• <b>Ambo</b> - 2 numeri",
    "• <b>Terno</b> - 3 numeri",
    "• <b>Quaterna</b> - 4 numeri",
    "• <b>Cinquina</b> - 5 numeri"
]
for c in comb_types:
    story.append(Paragraph(c, bullet_style))

# History Section
story.append(Paragraph("<b>5. Storico Giocate</b>", heading1_style))
story.append(Paragraph(
    "Tutte le tue scommesse sono registrate e visibili in questa sezione. "
    "Puoi filtrare per stato: Tutte, In corso, Vinte, Perse.",
    body_style
))

story.append(Paragraph("<b>5.1 Informazioni Registrate</b>", heading2_style))
history_info = [
    "• Evento e sport",
    "• Previsione e quota",
    "• Stake giocato",
    "• Stato (In corso/Vinta/Persa)",
    "• Profit/Perdita (dopo il risultato)",
    "• Data e ora della giocata"
]
for h in history_info:
    story.append(Paragraph(h, bullet_style))

story.append(Paragraph("<b>5.2 Aggiornamento Risultati</b>", heading2_style))
story.append(Paragraph(
    "Per ogni giocata 'In corso' trovi i pulsanti 'Vinta' e 'Persa'. "
    "Cliccando, il sistema aggiorna automaticamente:",
    body_style
))
update_info = [
    "• Lo stato della giocata",
    "• Il profit/perdita calcolato",
    "• Il bankroll (aggiunto o confermato)",
    "• Le statistiche e i grafici"
]
for u in update_info:
    story.append(Paragraph(u, bullet_style))

story.append(PageBreak())

# Stats Section
story.append(Paragraph("<b>6. Statistiche</b>", heading1_style))
story.append(Paragraph(
    "Una sezione completa con tutti i dati analitici delle tue performance.",
    body_style
))

story.append(Paragraph("<b>6.1 Metriche Disponibili</b>", heading2_style))
metrics = [
    "• <b>Totale Giocate</b> - Numero complessivo di scommesse",
    "• <b>Win Rate</b> - Percentuale di vittorie",
    "• <b>ROI</b> - Return on Investment",
    "• <b>Profitto/Perdita</b> - Saldo netto in euro"
]
for m in metrics:
    story.append(Paragraph(m, bullet_style))

story.append(Paragraph("<b>6.2 Grafici</b>", heading2_style))
story.append(Paragraph(
    "Sono disponibili diversi grafici interattivi:",
    body_style
))
charts = [
    "• <b>Grafico Profitti Cumulativi</b> - Andamento nel tempo",
    "• <b>Grafico a Torta</b> - Distribuzione Vinte/Perse",
    "• <b>Grafico a Barre</b> - Performance per sport"
]
for c in charts:
    story.append(Paragraph(c, bullet_style))

# Settings Section
story.append(Paragraph("<b>7. Impostazioni</b>", heading1_style))
story.append(Paragraph(
    "Personalizza l'app secondo le tue esigenze.",
    body_style
))

story.append(Paragraph("<b>7.1 Parametri Configurabili</b>", heading2_style))
settings_items = [
    "• <b>Bankroll</b> - Modifica il tuo capitale manualmente",
    "• <b>Eventi per suggerimento</b> - Numero predefinito di suggerimenti (1-20)",
    "• <b>Stake predefinito</b> - Importo standard per ogni giocata",
    "• <b>Livello Rischio</b> - Basso (2%), Medio (5%), Alto (10%)"
]
for s in settings_items:
    story.append(Paragraph(s, bullet_style))

story.append(Paragraph("<b>7.2 Sincronizzazione</b>", heading2_style))
story.append(Paragraph(
    "I tuoi dati sono salvati automaticamente sul server e sincronizzati tra tutti i dispositivi. "
    "Non è necessario alcun backup manuale.",
    body_style
))

# Disclaimer
story.append(Spacer(1, 30))
story.append(Paragraph("<b>⚠️ AVVERTENZA IMPORTANTE</b>", heading2_style))
story.append(Paragraph(
    "Il gioco d'azzardo può causare dipendenza. Questa applicazione è uno strumento di analisi "
    "e non garantisce vincite. Gioca sempre responsabilmente e solo quanto puoi permetterti di perdere. "
    "Se senti di avere problemi con il gioco, cerca aiuto professionale.",
    body_style
))

# Build PDF
doc.build(story)
print("PDF generato con successo!")
