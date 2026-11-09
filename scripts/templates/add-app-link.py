# scripts/templates/add-app-link.py
# Puts the link to the app at the top of the « Budget du mois » tab of the
# French spreadsheet (public/telechargements/tableau-budget-familial-budgetfamille.xlsx),
# next to the title. Rows 1 to 4 are frozen, so the link stays in sight while
# the household fills in the month, the tab they come back to every month (the
# « Mode d'emploi » tab, read once, already ends with one). Run again safely:
# it rewrites the same cell. Then rebuild the English file, which copies it:
#   python3 scripts/templates/add-app-link.py
#   python3 scripts/templates/make-template-en.py

import os
import sys

import openpyxl
from openpyxl.styles import Alignment, Font

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from recalc import recalculate  # noqa: E402

FILE = 'public/telechargements/tableau-budget-familial-budgetfamille.xlsx'
CELL = 'D2'
TEXT = 'Ne plus recopier chaque mois → budgetfamille.com'
URL = 'https://www.budgetfamille.com/signup?utm_source=excel&utm_medium=template&utm_content=onglet-budget'
BLUE = 'FF1F7FB4'  # the link colour of the « Mode d'emploi » tab

wb = openpyxl.load_workbook(FILE)
ws = wb['Budget du mois']
cell = ws[CELL]
cell.value = TEXT
cell.hyperlink = URL
cell.font = Font(name=ws['B3'].font.name, size=10, bold=True, color=BLUE, underline='single')
cell.alignment = Alignment(horizontal='right', vertical='bottom')
wb.save(FILE)
recalculate(FILE)
print(f'wrote {FILE}')
