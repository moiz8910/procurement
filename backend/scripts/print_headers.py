import openpyxl
wb = openpyxl.load_workbook(r'c:\Users\Moiz\Desktop\Procurement\backend\Database\Database for Procurement.xlsx', read_only=True)
for sn in wb.sheetnames:
    print(f"--- {sn} ---")
    headers = [c.value for c in wb[sn][1]]
    for i, h in enumerate(headers):
        print(f"{i}: {h}")
    print("\n")
