import sys
import os
from backend.app.db.session import SessionLocal, engine
from backend.app.db.models import CategoryWorkbook, CategoryWorkbookSection, MaterialServiceMaster, Category, Base

def seed_text_data():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    # 1. Seed Workbooks
    workbooks = [
        ("CWB_001", "External Alumina", "Workbook covering external alumina sourcing strategy, supplier qualification criteria, quality specifications", "EMP_0102", "Complete"),
        ("CWB_002", "Captive Alumina", "Workbook for captive alumina from Lanjigarh refinery - intercompany transfer protocols", "EMP_0102", "Complete"),
        ("CWB_003", "Thermal Coal", "Comprehensive workbook for thermal coal procurement - GCV specifications, linkage coal allocation", "EMP_0105", "Complete"),
        ("CWB_004", "Carbon Anodes", "Workbook for carbon anode requirements - prebaked anode specifications, anode butt recycling protocols", "EMP_0107", "Complete")
    ]
    
    for cwb in workbooks:
        cat = db.query(Category).filter(Category.name == cwb[1]).first()
        db.add(CategoryWorkbook(
            workbook_id=cwb[0],
            category_id=cat.id if cat else None,
            description=cwb[2],
            owner=cwb[3],
            status=cwb[4]
        ))
        
    # 2. Seed Sections
    sections = [
        ("SEC_001", "CWB_001", 1, "Purpose of Category Strategy Workbook - External Alumina", "This workbook defines the strategic sourcing approach for External Alumina at Vedanta Aluminium's Jharsuguda plant. It consolidates market intelligence, supplier analysis, spend data, and optimization opportunities to guide procurement decisions and contract negotiations."),
        ("SEC_004", "CWB_001", 4, "Market Overview - External Alumina", "Global and domestic market analysis for External Alumina: Market size, key producing regions, major suppliers, pricing trends, supply-demand dynamics, geopolitical factors affecting supply, and emerging market developments relevant to Vedanta's sourcing strategy."),
        ("SEC_008", "CWB_001", 8, "Supplier Ecosystem & SWOT Analysis - External Alumina", "Supplier ecosystem mapping and SWOT analysis for External Alumina: Strengths (quality, reliability, capacity), Weaknesses (dependency risks, geographic concentration), Opportunities (new suppliers, technology partnerships), Threats (supply disruptions, price volatility)."),
        ("SEC_009", "CWB_001", 9, "Optimization Levers - External Alumina", "Optimization opportunities for External Alumina: Volume consolidation, contract renegotiation, supplier development, specification optimization, logistics efficiency, inventory optimization, demand forecasting improvements, and TCO reduction initiatives."),
        ("SEC_024", "CWB_003", 4, "Market Overview - Thermal Coal", "Global and domestic market analysis for Thermal Coal: Market size, key producing regions, major suppliers, pricing trends, supply-demand dynamics, geopolitical factors affecting supply, and emerging market developments relevant to Vedanta's sourcing strategy."),
        ("SEC_028", "CWB_003", 8, "Supplier Ecosystem & SWOT Analysis - Thermal Coal", "Supplier ecosystem mapping and SWOT analysis for Thermal Coal: Strengths (quality, reliability, capacity), Weaknesses (dependency risks, geographic concentration), Opportunities (new suppliers, technology partnerships), Threats (supply disruptions, price volatility).")
    ]
    
    for sec in sections:
        db.add(CategoryWorkbookSection(
            section_id=sec[0],
            workbook_id=sec[1],
            section_number=sec[2],
            section_name=sec[3],
            content=sec[4]
        ))
        
    # 3. Seed Materials
    materials = [
        ("MS_0001", "Material", "Raw Material", "External Alumina", "Smelter Grade Alumina (SGA) - Al2O3 min 98.5%", "Premium", 22000, "MT", 5000),
        ("MS_0002", "Material", "Raw Material", "External Alumina", "Smelter Grade Alumina - Import Grade", "Premium", 23500, "MT", 10000),
        ("MS_0006", "Material", "Raw Material", "Thermal Coal", "Thermal Coal GCV 5500+ kcal/kg, Ash max 34%", "Premium", 7200, "MT", 50000),
        ("MS_0007", "Material", "Raw Material", "Thermal Coal", "Imported Coal GCV 6000+ kcal/kg", "Premium", 8500, "MT", 30000),
        ("MS_0049", "Service", "Services", "Power Plant O&M Services", "Annual Boiler Overhauling - includes tube inspection", "Premium", 15000000, "Job", 1)
    ]
    
    for mat in materials:
        cat = db.query(Category).filter(Category.name == mat[3]).first()
        db.add(MaterialServiceMaster(
            ms_id=mat[0],
            type=mat[1],
            sub_type=mat[2],
            category_id=cat.id if cat else None,
            material_name=mat[4],
            description=mat[4],
            grade=mat[5],
            price=mat[6],
            uom=mat[7],
            annual_quantity=mat[8]
        ))
        
    db.commit()
    print("Successfully seeded strategic workbooks, sections, and materials into SQL!")

if __name__ == "__main__":
    seed_text_data()
