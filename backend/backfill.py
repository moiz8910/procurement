import random
import traceback
from sqlalchemy import create_engine, text

try:
    engine = create_engine('sqlite:///backend/procura.db')
    with engine.connect() as con:
        try:
            con.execute(text('ALTER TABLE purchaseorder ADD COLUMN mode_of_purchase VARCHAR;'))
        except Exception as e:
            pass # ignore
        
        res = con.execute(text('SELECT id FROM purchaseorder')).fetchall()
        modes = ['Rate Contract', 'RFX', 'LOI']
        for row in res:
            mode = random.choice(modes)
            con.execute(text(f"UPDATE purchaseorder SET mode_of_purchase = '{mode}' WHERE id = {row[0]}"))
        con.commit()
    print('Schema updated safely.')
except Exception as e:
    with open('backend/py_error.log', 'w') as f:
        f.write(traceback.format_exc())

