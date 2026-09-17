#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Tool chuyển đổi thư mục .app của iOS thành file .ipa chuẩn Apple.
Tự động cấu hình Unix file permissions (0755 cho Mach-O binaries, 0644 cho file thường, 0755 cho thư mục),
giúp các công cụ sideload (Sideloadly, 3uTools, AltStore, ldid) không bị lỗi "Guru Meditation / Invalid file".
"""

import os
import sys
import zipfile
import tempfile
import shutil
import argparse
from pathlib import Path

# Đảm bảo in UTF-8 không bị lỗi trên Windows Console
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

# Các magic bytes nhận diện file nhị phân Mach-O (ARM64, x86_64, Universal)
MACH_O_MAGICS = (
    b'\xcf\xfa\xed\xfe',  # 64-bit Little Endian (MH_MAGIC_64)
    b'\xfe\xed\xfa\xcf',  # 64-bit Big Endian (MH_CIGAM_64)
    b'\xce\xfa\xed\xfe',  # 32-bit Little Endian (MH_MAGIC)
    b'\xfe\xed\xfa\xce',  # 32-bit Big Endian (MH_CIGAM)
    b'\xca\xfe\xba\xbe',  # Fat / Universal Binary (FAT_MAGIC)
    b'\xbe\xba\xfe\xca',  # Fat / Universal Binary (FAT_CIGAM)
)

KNOWN_EXECUTABLES = {
    'TempApp', 'ITSMobileVEC', 'React', 'hermesvm',
    'ReactNativeDependencies', 'RNSVGFilters'
}

def is_macho_executable(file_path: str, file_name: str, content: bytes) -> bool:
    """Kiểm tra xem file có phải là Mach-O executable hay không."""
    if file_name in KNOWN_EXECUTABLES:
        return True
    if len(content) >= 4 and content[:4] in MACH_O_MAGICS:
        return True
    # Kiểm tra các file dynamic library
    if file_name.endswith('.dylib') or file_name.endswith('.metallib'):
        return True
    return False

def find_app_bundle(source_path: Path) -> Path:
    """Tìm thư mục *.app thực sự, xử lý cả trường hợp lồng thư mục do giải nén."""
    if not source_path.exists():
        raise FileNotFoundError(f"Không tìm thấy đường dẫn nguồn: {source_path}")

    # Nếu truyền vào file zip, giải nén tạm
    if source_path.is_file() and source_path.suffix.lower() == '.zip':
        temp_extract = Path(tempfile.mkdtemp(prefix="ipa_extract_"))
        print(f"[*] Đang giải nén file zip nguồn: {source_path.name}...")
        with zipfile.ZipFile(source_path, 'r') as z:
            z.extractall(temp_extract)
        return find_app_bundle(temp_extract)

    # Nếu chính là thư mục .app chứa Info.plist
    if source_path.suffix.lower() == '.app' and (source_path / 'Info.plist').exists():
        return source_path

    # Kiểm tra thư mục con .app (ví dụ: TempApp.app/TempApp.app)
    for child in source_path.rglob('*.app'):
        if child.is_dir() and (child / 'Info.plist').exists():
            return child

    raise ValueError(f"Không tìm thấy thư mục .app hợp lệ (có chứa Info.plist) trong {source_path}")

def convert_app_to_ipa(app_dir: Path, output_ipa: Path) -> Path:
    """Đóng gói thư mục .app thành file .ipa chuẩn."""
    app_name = app_dir.name
    print("============================================================")
    print(f"[*] BAT DAU DONG GOI IPA CHO: {app_name}")
    print(f"[*] Thu muc nguon : {app_dir}")
    print(f"[*] File dau ra   : {output_ipa}")
    print("============================================================")

    output_ipa.parent.mkdir(parents=True, exist_ok=True)
    temp_output = output_ipa.with_suffix('.tmp')

    macho_count = 0
    total_files = 0

    with zipfile.ZipFile(temp_output, 'w', zipfile.ZIP_DEFLATED) as zipf:
        # 1. Tạo thư mục gốc Payload/ với quyền Unix 0755
        p_info = zipfile.ZipInfo('Payload/')
        p_info.external_attr = 0o40755 << 16
        zipf.writestr(p_info, '')

        # 2. Tạo thư mục Payload/<App>.app/ với quyền Unix 0755
        app_info = zipfile.ZipInfo(f'Payload/{app_name}/')
        app_info.external_attr = 0o40755 << 16
        zipf.writestr(app_info, '')

        # 3. Duyệt và thêm từng thư mục/file con
        for root, dirs, files in os.walk(app_dir):
            rel_root = os.path.relpath(root, app_dir).replace('\\', '/')
            if rel_root == '.':
                prefix = f'Payload/{app_name}'
            else:
                prefix = f'Payload/{app_name}/{rel_root}'
                d_info = zipfile.ZipInfo(f'{prefix}/')
                d_info.external_attr = 0o40755 << 16
                zipf.writestr(d_info, '')

            for file in files:
                full_path = Path(root) / file
                arc_name = f'{prefix}/{file}'

                try:
                    with open(full_path, 'rb') as f:
                        content = f.read()
                except Exception as e:
                    print(f"[-] Bo qua file loi doc {file}: {e}")
                    continue

                info = zipfile.ZipInfo(arc_name)
                is_exec = is_macho_executable(str(full_path), file, content)

                if is_exec:
                    info.external_attr = 0o100755 << 16  # -rwxr-xr-x (Cho phép thực thi trên iOS)
                    macho_count += 1
                    print(f" [+] Executable: {arc_name} (0o100755)")
                else:
                    info.external_attr = 0o100644 << 16  # -rw-r--r-- (File dữ liệu thông thường)

                info.compress_type = zipfile.ZIP_DEFLATED
                zipf.writestr(info, content)
                total_files += 1

    # Đổi tên file tạm sang file chính thức
    if output_ipa.exists():
        output_ipa.unlink()
    temp_output.rename(output_ipa)

    size_mb = output_ipa.stat().st_size / (1024 * 1024)
    print("============================================================")
    print(f"[SUCCESS] DONG GOI IPA THANH CONG!")
    print(f" - Tong so file   : {total_files} files")
    print(f" - Mach-O Binaries: {macho_count} binaries (quyen 0755)")
    print(f" - Dung luong     : {size_mb:.2f} MB")
    print(f" - Duong dan      : {output_ipa.resolve()}")
    print("============================================================")
    return output_ipa

def main():
    parser = argparse.ArgumentParser(description="Chuyển đổi thư mục iOS .app hoặc .app.zip thành file .ipa chuẩn Unix.")
    parser.add_argument('--app', '-a', type=str, help="Đường dẫn đến thư mục .app hoặc file .app.zip")
    parser.add_argument('--output', '-o', type=str, help="Đường dẫn file .ipa đầu ra (Mặc định: build-output/ITSMobile.ipa)")
    args = parser.parse_args()

    # Tìm file mặc định nếu không truyền tham số
    source = None
    if args.app:
        source = Path(args.app)
    else:
        # Tự tìm kiếm ở các vị trí thông dụng
        candidates = [
            Path.home() / 'Downloads' / 'TempApp.app',
            Path.home() / 'Downloads' / 'TempApp.app.zip',
            Path.cwd() / 'build-output' / 'TempApp.app',
        ]
        for c in candidates:
            if c.exists():
                source = c
                break

    if not source:
        print("[!] Không tìm thấy file nguồn mặc định. Vui lòng truyền --app <đường_dẫn>")
        sys.exit(1)

    output = Path(args.output) if args.output else (Path.cwd() / 'build-output' / 'ITSMobile.ipa')
    app_bundle = find_app_bundle(source)
    convert_app_to_ipa(app_bundle, output)

if __name__ == '__main__':
    main()
