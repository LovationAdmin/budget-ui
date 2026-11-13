# scripts/templates/make-template-es.py
# Builds the Spanish spreadsheet template
# (public/telechargements/plantilla-presupuesto-familiar.xlsx) from the French
# one: same sheets, styles and formulas, Spanish words, sheet names updated in
# the formulas, and amounts without a currency symbol so the file works in
# euros, pesos, soles or dollars. Run from the repository root:
#   python3 scripts/templates/make-template-es.py

import openpyxl

SRC = 'public/telechargements/tableau-budget-familial-budgetfamille.xlsx'
OUT = 'public/telechargements/plantilla-presupuesto-familiar.xlsx'

SHEETS = {
    "Mode d'emploi": 'Instrucciones',
    'Budget du mois': 'Presupuesto del mes',
    'Pot commun': 'Fondo común',
    'Année': 'Año',
}

MONEY = '#,##0;\\-#,##0;\\-'

TEXT = {
    "Mode d'emploi": {
        'B2': 'Plantilla de presupuesto familiar gratuita',
        'B3': 'De Budget Famille: budgetfamille.com/es',
        'B5': 'Cómo se usa',
        'B6': '1. Pestaña «Presupuesto del mes»: sustituye los importes de las celdas amarillas por los tuyos (sueldos netos, gastos, ahorro).',
        'B7': '2. Pestaña «Fondo común»: en pareja, compara las 3 formas de repartir (50/50, en proporción a los ingresos, mismo dinero de bolsillo).',
        'B8': '3. Pestaña «Año»: añade los gastos que llegan una vez al año (impuestos, seguro del coche…) en la columna amarilla del mes que toca.',
        'B10': 'Leyenda',
        'B11': 'Celdas amarillas: para rellenar con tus cifras (los importes que ya están son un ejemplo: Álex y Sam).',
        'B12': 'Texto verde: valor que viene de otra pestaña. Texto negro: cálculo automático, no lo cambies.',
        'B14': 'Palabras clave',
        'B15': 'Fondo común: el dinero que aporta cada persona para pagar los gastos y el ahorro compartido del hogar.',
        'B16': 'Dinero de bolsillo: lo que le queda a cada persona después de su aportación al fondo común, para gastar como quiera.',
        'B17': 'Resto del mes: lo que le queda al hogar una vez pagados los gastos y el ahorro (incluido el dinero de bolsillo de cada persona).',
        'B19': '¿Prefieres que todo se calcule solo, compartido y en el móvil?',
        'B20': 'Budget Famille hace lo mismo automáticamente cada mes, gratis: https://www.budgetfamille.com/es',
    },
    'Budget du mois': {
        'B2': 'Presupuesto del mes',
        'B3': 'Sustituye las celdas amarillas por tus importes. Los totales se calculan solos.',
        'B5': 'Ingresos', 'C5': 'Importe mensual', 'D5': 'Nota',
        'B6': 'Sueldo neto: persona 1', 'D6': 'Ejemplo: Álex',
        'B7': 'Sueldo neto: persona 2', 'D7': 'Ejemplo: Sam. Pon 0 si llevas el presupuesto a solas.',
        'B8': 'Otros ingresos', 'D8': 'Ayudas, pagas extra, alquileres cobrados…',
        'B9': 'Total de ingresos',
        'B11': 'Gastos del hogar', 'C11': 'Importe mensual', 'D11': 'Nota',
        'B12': 'Vivienda (alquiler o hipoteca)',
        'B13': 'Energía (luz, gas)',
        'B14': 'Agua',
        'B15': 'Internet y teléfonos',
        'B16': 'Seguros (hogar, coche, salud)',
        'B17': 'Compra de alimentación',
        'B18': 'Transporte (gasolina, transporte público)',
        'B19': 'Hijos (comedor, guardería, actividades)',
        'B20': 'Suscripciones (plataformas, gimnasio…)',
        'B21': 'Impuestos (parte mensual)', 'D21': 'Impuestos anuales: ver la pestaña Año',
        'B22': 'Salud (a tu cargo)',
        'B23': 'Ocio y salidas',
        'B24': 'Otros',
        'B25': 'Total de gastos',
        'B27': 'Ahorro', 'C27': 'Importe mensual', 'D27': 'Nota',
        'B28': 'Fondo de emergencia', 'D28': 'Objetivo habitual: de 3 a 6 meses de gastos',
        'B29': 'Vacaciones',
        'B30': 'Objetivo (entrada de una vivienda, coche…)',
        'B31': 'Total de ahorro',
        'B33': 'Resumen',
        'B34': 'Ingresos',
        'B35': 'Gastos',
        'B36': 'Ahorro',
        'B37': 'Resto del mes', 'D37': 'Incluye el dinero de bolsillo de cada persona. Negativo: este mes falta dinero.',
        'B38': 'Parte de los ingresos ahorrada', 'D38': 'Referencia habitual: entre el 10 y el 20 % de los ingresos.',
    },
    'Pot commun': {
        'B2': 'Fondo común: ¿cuánto aporta cada persona?',
        'B3': 'Los sueldos y lo que hace falta vienen de la pestaña «Presupuesto del mes».',
        'B5': 'Sueldo neto: persona 1',
        'B6': 'Sueldo neto: persona 2',
        'B7': 'Necesario este mes (gastos + ahorro)',
        'B9': 'Método', 'C9': 'Aporta: persona 1', 'D9': 'Aporta: persona 2',
        'E9': 'Dinero de bolsillo 1', 'F9': 'Dinero de bolsillo 2', 'G9': 'Diferencia de bolsillo',
        'B10': 'A partes iguales (50/50)',
        'B11': 'En proporción a los sueldos',
        'B12': 'Mismo dinero de bolsillo',
        'B14': '50/50: cada persona aporta lo mismo; el dinero de bolsillo sigue la diferencia de sueldos.',
        'B15': 'En proporción: cada persona aporta la misma parte de su sueldo; el método más habitual cuando los ingresos son distintos.',
        'B16': 'Mismo dinero de bolsillo: cada persona se queda con lo mismo (si la diferencia de sueldos supera lo necesario, quien más gana lo paga todo).',
    },
    'Année': {
        'B2': 'Mi año',
        'B3': 'Cada mes parte del presupuesto del mes. Añade en amarillo lo que no llega todos los meses.',
        'B5': 'Mes', 'C5': 'Ingresos', 'D5': 'Ingresos extra', 'E5': 'Gastos', 'F5': 'Gastos extra',
        'G5': 'Ahorro', 'H5': 'Resto del mes', 'I5': 'Acumulado',
        'B6': 'Enero', 'B7': 'Febrero', 'B8': 'Marzo', 'B9': 'Abril', 'B10': 'Mayo', 'B11': 'Junio',
        'B12': 'Julio', 'B13': 'Agosto', 'B14': 'Septiembre', 'B15': 'Octubre', 'B16': 'Noviembre', 'B17': 'Diciembre',
        'B18': 'Total',
        'B20': 'Ahorrado en el año',
    },
}

wb = openpyxl.load_workbook(SRC)
for ws in wb.worksheets:
    words = TEXT[ws.title]
    for row in ws.iter_rows():
        for cell in row:
            v = cell.value
            if isinstance(v, str) and v.startswith('='):
                for fr, es in SHEETS.items():
                    v = v.replace(f"'{fr}'!", f"'{es}'!")
                cell.value = v
            elif isinstance(v, str):
                if cell.coordinate not in words:
                    raise SystemExit(f'untranslated {ws.title}!{cell.coordinate}: {v!r}')
                cell.value = words[cell.coordinate]
            if '€' in cell.number_format:
                cell.number_format = MONEY
    ws.title = SHEETS[ws.title]

wb.properties.title = 'Plantilla de presupuesto familiar gratuita'
wb.properties.creator = 'Budget Famille'
wb.properties.language = 'es'
wb.save(OUT)
print(f'wrote {OUT}')
