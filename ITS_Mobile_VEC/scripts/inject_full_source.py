# -*- coding: utf-8 -*-
"""Tạo mục H1 'MÃ NGUỒN PHẦN MỀM ỨNG DỤNG DI ĐỘNG' (tự auto-number thành III)
và dán toàn bộ source code phía sau, copy liên tục — không nhãn file, không
chia khối.

Input  : docs/source/05_Bản_mô_tả_..._(không code).docx
Output : docs/source/05_Bản_mô_tả_....docx (ghi đè)
"""
from pathlib import Path
from docx import Document
from docx.oxml import OxmlElement
from docx.oxml.ns import qn

ROOT = Path(r"D:/Etc/ITS_Mobile_VEC")
SRC_DOC = ROOT / "docs/source/05_Bản_mô_tả_Ứng_dụng_di_động_cho_nhân_viên_vận_hành_tuyến_cao_tốc (không code).docx"
OUT_DOC = ROOT / "docs/source/05_Bản_mô_tả_Ứng_dụng_di_động_cho_nhân_viên_vận_hành_tuyến_cao_tốc.docx"

# Thứ tự "đọc liên tục" — quyết định bởi pháp chế: bắt đầu từ entry main.jsx
# rồi đến App.jsx (component chính), index.css (style), cuối cùng index.html (shell).
SOURCE_FILES = [
    ROOT / "src/main.jsx",
    ROOT / "src/App.jsx",
    ROOT / "src/index.css",
    ROOT / "index.html",
]

HEADING_TEXT = "MÃ NGUỒN PHẦN MỀM ỨNG DỤNG DI ĐỘNG"


def _code_run(text):
    r = OxmlElement("w:r")
    rPr = OxmlElement("w:rPr")
    rFonts = OxmlElement("w:rFonts")
    rFonts.set(qn("w:ascii"), "Consolas")
    rFonts.set(qn("w:hAnsi"), "Consolas")
    rFonts.set(qn("w:cs"), "Consolas")
    rPr.append(rFonts)
    sz = OxmlElement("w:sz")
    sz.set(qn("w:val"), "16")  # 8pt
    rPr.append(sz)
    szCs = OxmlElement("w:szCs")
    szCs.set(qn("w:val"), "16")
    rPr.append(szCs)
    color = OxmlElement("w:color")
    color.set(qn("w:val"), "1F2933")
    rPr.append(color)
    r.append(rPr)

    t = OxmlElement("w:t")
    safe = text.replace("\t", "  ")
    t.text = safe if safe else " "
    t.set(qn("xml:space"), "preserve")
    r.append(t)
    return r


def make_code_paragraph(text, first=False, last=False):
    """1 dòng code = 1 paragraph. first/last điều khiển border + spacing."""
    p = OxmlElement("w:p")
    pPr = OxmlElement("w:pPr")

    # alignment LEFT để Word không justify giãn space
    jc = OxmlElement("w:jc")
    jc.set(qn("w:val"), "left")
    pPr.append(jc)

    # border
    pBdr = OxmlElement("w:pBdr")
    sides = ["left", "right"]
    if first:
        sides.append("top")
    if last:
        sides.append("bottom")
    for side in sides:
        b = OxmlElement(f"w:{side}")
        b.set(qn("w:val"), "single")
        b.set(qn("w:sz"), "4")
        b.set(qn("w:space"), "4")
        b.set(qn("w:color"), "BFBFBF")
        pBdr.append(b)
    pPr.append(pBdr)

    # shading
    shd = OxmlElement("w:shd")
    shd.set(qn("w:val"), "clear")
    shd.set(qn("w:color"), "auto")
    shd.set(qn("w:fill"), "F4F4F4")
    pPr.append(shd)

    # spacing chặt
    spacing = OxmlElement("w:spacing")
    spacing.set(qn("w:before"), "60" if first else "0")
    spacing.set(qn("w:after"), "120" if last else "0")
    spacing.set(qn("w:line"), "220")
    spacing.set(qn("w:lineRule"), "auto")
    pPr.append(spacing)

    # tránh tách trang giữa block khi có thể
    pPr.append(OxmlElement("w:keepLines"))
    if not last:
        pPr.append(OxmlElement("w:keepNext"))

    # không thụt lề
    ind = OxmlElement("w:ind")
    ind.set(qn("w:left"), "0")
    ind.set(qn("w:right"), "0")
    ind.set(qn("w:firstLine"), "0")
    pPr.append(ind)

    p.append(pPr)
    p.append(_code_run(text))
    return p


def make_heading1(text):
    p = OxmlElement("w:p")
    pPr = OxmlElement("w:pPr")
    pStyle = OxmlElement("w:pStyle")
    pStyle.set(qn("w:val"), "Heading1")
    pPr.append(pStyle)
    p.append(pPr)

    r = OxmlElement("w:r")
    t = OxmlElement("w:t")
    t.text = text
    t.set(qn("xml:space"), "preserve")
    r.append(t)
    p.append(r)
    return p


def append_before_sectpr(doc, elements):
    body = doc.element.body
    sectPr = body.find(qn("w:sectPr"))
    if sectPr is not None:
        for el in elements:
            sectPr.addprevious(el)
    else:
        for el in elements:
            body.append(el)


def main():
    if not SRC_DOC.exists():
        raise SystemExit(f"❌ Không tìm thấy: {SRC_DOC}")

    doc = Document(SRC_DOC)

    # Gom toàn bộ code thành 1 luồng "copy liên tục"
    all_lines = []
    for f in SOURCE_FILES:
        if not f.exists():
            raise SystemExit(f"❌ Không tìm thấy file source: {f}")
        all_lines.extend(f.read_text(encoding="utf-8").splitlines())

    print(f"Total source files: {len(SOURCE_FILES)}")
    print(f"Total code lines  : {len(all_lines)}")

    # Build các paragraph để chèn
    elements = [make_heading1(HEADING_TEXT)]

    n = len(all_lines)
    for i, line in enumerate(all_lines):
        elements.append(make_code_paragraph(
            line,
            first=(i == 0),
            last=(i == n - 1),
        ))

    append_before_sectpr(doc, elements)
    doc.save(OUT_DOC)
    print(f"\n✅ Saved: {OUT_DOC}")


if __name__ == "__main__":
    main()
