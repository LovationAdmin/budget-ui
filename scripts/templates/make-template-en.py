# scripts/templates/make-template-en.py
# Builds the English spreadsheet template (public/telechargements/budget-template.xlsx)
# from the French one: same sheets, styles and formulas, English words, sheet
# names updated in the formulas, and amounts without a currency symbol so the
# file works in any currency. Run from the repository root:
#   python3 scripts/templates/make-template-en.py

import openpyxl

SRC = 'public/telechargements/tableau-budget-familial-budgetfamille.xlsx'
OUT = 'public/telechargements/budget-template.xlsx'

SHEETS = {
    "Mode d'emploi": 'How to use',
    'Budget du mois': 'Monthly budget',
    'Pot commun': 'Joint pot',
    'Année': 'Year',
}

MONEY = '#,##0;\\-#,##0;\\-'

TEXT = {
    "Mode d'emploi": {
        'B2': 'Free family budget template',
        'B3': 'From Budget Famille: budgetfamille.com/en',
        'B5': 'How to use it',
        'B6': '1. “Monthly budget” tab: replace the amounts in the yellow cells with yours (take-home pay, bills, savings).',
        'B7': '2. “Joint pot” tab: if you’re a couple, compare the 3 ways to split (50/50, in proportion to income, same spending money).',
        'B8': '3. “Year” tab: add the bills that come once a year (property tax, car insurance…) in the yellow column of the right month.',
        'B10': 'Key',
        'B11': 'Yellow cells: fill in with your numbers (the amounts already there are an example: Alex and Sam).',
        'B12': 'Green text: value taken from another tab. Black text: automatic calculation, don’t change it.',
        'B14': 'Words to know',
        'B15': 'Joint pot: the money each person pays in to cover the household’s bills and shared savings.',
        'B16': 'Spending money: what each person has left after their share of the joint pot, to spend as they like.',
        'B17': 'Left for the month: what the household has left once bills and savings are paid (everyone’s spending money included).',
        'B19': 'Want it all worked out for you, shared with others, on your phone?',
        'B20': 'Budget Famille does the same automatically every month, for free: https://www.budgetfamille.com/en',
    },
    'Budget du mois': {
        'B2': 'Monthly budget',
        'B3': 'Replace the yellow cells with your amounts. Totals work themselves out.',
        'B5': 'Income', 'C5': 'Monthly amount', 'D5': 'Note',
        'B6': 'Take-home pay: person 1', 'D6': 'Example: Alex',
        'B7': 'Take-home pay: person 2', 'D7': 'Example: Sam. Enter 0 if you’re on your own.',
        'B8': 'Other income', 'D8': 'Benefits, bonuses, rental income…',
        'B9': 'Total income',
        'B11': 'Household bills', 'C11': 'Monthly amount', 'D11': 'Note',
        'B12': 'Housing (rent or mortgage)',
        'B13': 'Energy (electricity, gas)',
        'B14': 'Water',
        'B15': 'Internet and phones',
        'B16': 'Insurance (home, car, health)',
        'B17': 'Groceries',
        'B18': 'Transport (fuel, public transport)',
        'B19': 'Children (school meals, childcare, activities)',
        'B20': 'Subscriptions (streaming, gym…)',
        'B21': 'Taxes (monthly share)', 'D21': 'Yearly property tax: see the Year tab',
        'B22': 'Health (out of pocket)',
        'B23': 'Fun and going out',
        'B24': 'Other',
        'B25': 'Total bills',
        'B27': 'Savings', 'C27': 'Monthly amount', 'D27': 'Note',
        'B28': 'Emergency fund', 'D28': 'Usual target: 3 to 6 months of bills',
        'B29': 'Holidays',
        'B30': 'Goal (down payment, car…)',
        'B31': 'Total savings',
        'B33': 'Summary',
        'B34': 'Income',
        'B35': 'Bills',
        'B36': 'Savings',
        'B37': 'Left for the month', 'D37': 'Everyone’s spending money included. Negative: money is short this month.',
        'B38': 'Share of income saved', 'D38': 'Common benchmark: aim for 10 to 20% of income.',
    },
    'Pot commun': {
        'B2': 'Joint pot: who pays in how much?',
        'B3': 'Pay and needs come from the “Monthly budget” tab.',
        'B5': 'Take-home pay: person 1',
        'B6': 'Take-home pay: person 2',
        'B7': 'Needed this month (bills + savings)',
        'B9': 'Method', 'C9': 'Pays in: person 1', 'D9': 'Pays in: person 2',
        'E9': 'Spending money 1', 'F9': 'Spending money 2', 'G9': 'Spending money gap',
        'B10': 'Equal shares (50/50)',
        'B11': 'In proportion to pay',
        'B12': 'Same spending money',
        'B14': '50/50: each pays in the same amount; spending money follows the pay gap.',
        'B15': 'In proportion: each pays in the same share of their pay; the most common method when incomes differ.',
        'B16': 'Same spending money: each keeps the same amount for themselves (if the pay gap is larger than the need, the higher earner pays it all).',
    },
    'Année': {
        'B2': 'My year',
        'B3': 'Each month starts from the monthly budget. Add in yellow what doesn’t come every month.',
        'B5': 'Month', 'C5': 'Income', 'D5': 'Extra income', 'E5': 'Bills', 'F5': 'Extra bills',
        'G5': 'Savings', 'H5': 'Left for the month', 'I5': 'Running total',
        'B6': 'January', 'B7': 'February', 'B8': 'March', 'B9': 'April', 'B10': 'May', 'B11': 'June',
        'B12': 'July', 'B13': 'August', 'B14': 'September', 'B15': 'October', 'B16': 'November', 'B17': 'December',
        'B18': 'Total',
        'B20': 'Saved over the year',
    },
}

wb = openpyxl.load_workbook(SRC)
for ws in wb.worksheets:
    words = TEXT[ws.title]
    for row in ws.iter_rows():
        for cell in row:
            v = cell.value
            if isinstance(v, str) and v.startswith('='):
                for fr, en in SHEETS.items():
                    v = v.replace(f"'{fr}'!", f"'{en}'!")
                cell.value = v
            elif isinstance(v, str):
                if cell.coordinate not in words:
                    raise SystemExit(f'untranslated {ws.title}!{cell.coordinate}: {v!r}')
                cell.value = words[cell.coordinate]
            if '€' in cell.number_format:
                cell.number_format = MONEY
    ws.title = SHEETS[ws.title]

wb.properties.title = 'Free family budget template'
wb.properties.creator = 'Budget Famille'
wb.properties.language = 'en'
wb.save(OUT)
print(f'wrote {OUT}')
