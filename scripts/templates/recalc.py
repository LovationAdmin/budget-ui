# scripts/templates/recalc.py
# Saves a workbook's formula results in the file, as Excel does. openpyxl keeps
# the formulas but drops their results: Excel and Google Sheets work them out
# again, but phone previews (iPhone Quick Look, Gmail, WhatsApp) only show
# what is stored, so the totals would look empty. LibreOffice opens the file,
# calculates it and writes it back. Needs LibreOffice (soffice) on the PATH.

import os
import shutil
import subprocess
import tempfile


def recalculate(path: str) -> None:
    with tempfile.TemporaryDirectory() as out, tempfile.TemporaryDirectory() as profile:
        subprocess.run(
            [
                'soffice', f'-env:UserInstallation=file://{profile}', '--headless', '--calc',
                '--convert-to', 'xlsx:Calc MS Excel 2007 XML', '--outdir', out, path,
            ],
            check=True, capture_output=True, timeout=180,
        )
        shutil.move(os.path.join(out, os.path.basename(path)), path)
