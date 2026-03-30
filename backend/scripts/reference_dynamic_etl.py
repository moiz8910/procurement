import pandas as pd
import sqlite3
import os
import sys

# Reference Code provided by the User.
# This script contains an advanced dynamic ETL pipeline capable of translating 
# any Excel file into a relational SQLite database strictly by analyzing an 'FK Map' sheet.
# 
# While our application uses a hardcoded, SQLAlchemy-driven declarative approach for tight API integration,
# this reference code is preserved here for future generic data migrations.

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
excel_file = os.path.join(BASE_DIR, 'data', 'Supply Chain_Data Dictionary_Company.xlsx')
db_file = os.path.join(BASE_DIR, 'data', 'supply_chain_new.db')
log_file = os.path.join(BASE_DIR, 'scripts', 'migration.log')

def log(msg):
    print(msg)
    with open(log_file, 'a', encoding='utf-8') as f:
        f.write(str(msg) + '\n')

import re

def normalize(name):
    if not isinstance(name, str): return str(name)
    name = name.lower().strip()
    name = name.replace(' ', '_').replace('.', '').replace('-', '_')
    name = re.sub(r'_?\([^)]*\)', '', name)
    return name

def extract_constraints(xls):
    fk_list = []
    pks = {}
    try:
        if 'FK Map' not in xls.sheet_names:
            log("Warning: 'FK Map' sheet not found.")
            return pks, fk_list
        df = pd.read_excel(xls, sheet_name='FK Map')
        df.columns = [c.strip() for c in df.columns]
        for _, row in df.iterrows():
            if pd.isna(row.get('Table')) or pd.isna(row.get('Column')): continue
            tbl = normalize(row['Table'])
            col = normalize(row['Column'])
            if 'Reference Table' in df.columns and not pd.isna(row['Reference Table']):
                ref_tbl = normalize(row['Reference Table'])
                ref_col_raw = str(row['Reference Column'])
                ref_col = normalize(ref_col_raw.replace('(Primary Key)', '').replace('(Foreign Key)', ''))
                fk_list.append({'table': tbl, 'col': col, 'ref_table': ref_tbl, 'ref_col': ref_col})
                pks[ref_tbl] = ref_col
    except Exception as e: log(f"Error parsing FK Map: {e}")
    return pks, fk_list

def get_sql_type(dtype):
    if pd.api.types.is_integer_dtype(dtype): return 'INTEGER'
    elif pd.api.types.is_float_dtype(dtype): return 'REAL'
    else: return 'TEXT'

def find_header_row(xls, sheet_name, expected_cols_normalized):
    try:
        df_scan = pd.read_excel(xls, sheet_name=sheet_name, header=None, nrows=20)
        best_row, max_matches = 0, 0
        for i, row in df_scan.iterrows():
            row_values = [normalize(str(x)) for x in row.values if pd.notna(x)]
            matches = sum(1 for x in row_values if x in expected_cols_normalized)
            if matches > max_matches:
                max_matches = matches
                best_row = i
        return best_row if max_matches > 0 else 0
    except Exception as e:
        log(f"Error searching header for {sheet_name}: {e}")
        return 0

def convert_excel_to_sqlite(excel_file, db_file):
    with open(log_file, 'w') as f: f.write("Starting conversion...\n")
    if not os.path.exists(excel_file): return log(f"Error: Let's explicitly check input file '{excel_file}'")
    try:
        xls = pd.ExcelFile(excel_file)
        log("Analyzing schema constraints from FK Map...")
        pks, fk_list = extract_constraints(xls)
        
        table_fks = {}
        expected_cols = {}
        for fk in fk_list:
            table_fks.setdefault(fk['table'], []).append(fk)
            expected_cols.setdefault(fk['table'], set()).add(fk['col'])
            expected_cols.setdefault(fk['ref_table'], set()).add(fk['ref_col'])
        
        log("Reading data sheets with dynamic header detection...")
        data_frames = {}
        for sheet_name in xls.sheet_names:
            if sheet_name in ['FK Map', 'Data Dictionary', 'About', 'Schema', 'Meta']: continue
            tbl = normalize(sheet_name)
            header_idx = find_header_row(xls, sheet_name, expected_cols.get(tbl, set()))
            df = pd.read_excel(xls, sheet_name=sheet_name, header=header_idx)
            df.columns = [normalize(c) for c in df.columns]
            data_frames[tbl] = df
            
            if tbl not in pks:
                possible_id = [c for c in df.columns if c == 'id' or c == f"{tbl}_id" or c.endswith('_id')]
                if possible_id: pks[tbl] = next((x for x in possible_id if x == 'id' or x == f"{tbl}_id"), possible_id[0])

        sorted_tables = []
        visited = set()
        deps = {t: set() for t in data_frames}
        for t in data_frames:
            if t in table_fks:
                for fk in table_fks[t]:
                    if fk['ref_table'] in data_frames: deps[t].add(fk['ref_table'])

        while len(sorted_tables) < len(data_frames):
            progress = False
            for t in data_frames:
                if t not in visited and all(d in visited for d in deps[t]):
                    visited.add(t)
                    sorted_tables.append(t)
                    progress = True
            if not progress:
                log("Warning: Circular dependency detected. Breaking cycle.")
                remaining = [t for t in data_frames if t not in visited]
                if not remaining: break
                t = remaining[0]
                visited.add(t)
                sorted_tables.append(t)
                
        if os.path.exists(db_file): os.remove(db_file)
        conn = sqlite3.connect(db_file)
        cursor = conn.cursor()
        cursor.execute("PRAGMA foreign_keys = OFF;")
        
        for tbl in sorted_tables:
            df = data_frames[tbl]
            cols_def = []
            seen_cols = set()
            for col_name, dtype in df.dtypes.items():
                orig_col = col_name
                counter = 1
                while col_name in seen_cols:
                    col_name = f"{orig_col}_{counter}"
                    counter += 1
                seen_cols.add(col_name)
                parts = [f'"{col_name}"', get_sql_type(dtype)]
                if tbl in pks and pks[tbl] == orig_col: parts.append("PRIMARY KEY")
                cols_def.append(" ".join(parts))
            
            if tbl in table_fks:
                for fk in table_fks[tbl]:
                    cols_def.append(f'FOREIGN KEY ("{fk["col"]}") REFERENCES "{fk["ref_table"]}" ("{fk["ref_col"]}")')

            if not cols_def: continue
            create_sql = f'CREATE TABLE "{tbl}" (\n  ' + ',\n  '.join(cols_def) + '\n);'
            
            try: cursor.execute(create_sql)
            except sqlite3.OperationalError as e: continue

            if tbl in pks and pks[tbl] in df.columns:
                df = df.dropna(subset=[pks[tbl]])
                df = df.drop_duplicates(subset=[pks[tbl]], keep='first')

            try: df.to_sql(tbl, conn, if_exists='append', index=False)
            except Exception as e: log(f"Error inserting data into '{tbl}': {e}")

        conn.commit()
        conn.close()
        log("\nConversion completed.")

    except Exception as e:
        import traceback
        log(f"Fatal error: {traceback.format_exc()}")

if __name__ == "__main__":
    convert_excel_to_sqlite(excel_file, db_file)
