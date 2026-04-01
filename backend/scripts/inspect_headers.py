import openpyxl

wb = openpyxl.load_workbook(
    r'c:\Users\Moiz\Desktop\Procurement\backend\Database\Database for Procurement.xlsx',
    read_only=True, data_only=True
)

sheets_to_inspect = [
    'Purchase Order', 'GRN', 'Claims', 'Vendor Rating',
    'Market Intelligence', 'Vendor Discovery', 'Category Workbook',
    'Category Workbook Sections', 'Material Service Master',
    'Master Contract Clause', 'Purchase Requisition',
    'Category Master', 'Employee Master', 'Vendor Master'
]

with open(r'c:\Users\Moiz\Desktop\Procurement\backend\headers_log.txt', 'w', encoding='utf-8') as f:
    for sn in sheets_to_inspect:
        if sn in wb.sheetnames:
            f.write(f"\n--- {sn} ---\n")
            for i, c in enumerate(wb[sn][1]):
                f.write(f"  [{i}] {c.value}\n")
        else:
            f.write(f"\n--- {sn}: NOT FOUND ---\n")
