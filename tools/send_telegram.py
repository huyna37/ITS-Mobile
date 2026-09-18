#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
ITS Mobile VEC - CI/CD Telegram Notification & Artifact Uploader
Tự động gửi file APK / IPA và thông báo trạng thái build lên Telegram.
Sử dụng thuần thư viện chuẩn Python (urllib), không cần cài đặt thêm dependency.
"""

import os
import sys
import json
import mimetypes
import argparse
import urllib.request
import urllib.error
from pathlib import Path

# Đảm bảo in UTF-8 không lỗi trên các môi trường CI/CD
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

TELEGRAM_API_URL = "https://api.telegram.org"
MAX_TELEGRAM_BOT_FILE_SIZE = 50 * 1024 * 1024  # Giới hạn Telegram Bot API là 50MB

def send_message(bot_token: str, chat_id: str, text: str, thread_id: str = None) -> bool:
    """Gửi tin nhắn văn bản dạng Markdown/HTML lên Telegram."""
    url = f"{TELEGRAM_API_URL}/bot{bot_token}/sendMessage"
    payload = {
        "chat_id": chat_id,
        "text": text,
        "parse_mode": "HTML",
        "disable_web_page_preview": False
    }
    if thread_id:
        payload["message_thread_id"] = thread_id

    data = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            res_body = json.loads(resp.read().decode('utf-8'))
            return res_body.get("ok", False)
    except Exception as e:
        print(f"[!] Lỗi khi gửi tin nhắn văn bản lên Telegram: {e}")
        return False

def send_document(bot_token: str, chat_id: str, file_path: Path, caption: str = "", thread_id: str = None) -> bool:
    """Gửi file tài liệu (APK/IPA) lên Telegram qua multipart/form-data."""
    if not file_path.exists():
        print(f"[ERROR] Không tìm thấy file artifact tại: {file_path}")
        return False

    file_size = file_path.stat().st_size
    file_size_mb = file_size / (1024 * 1024)
    print(f"[*] Đang tải file lên Telegram: {file_path.name} ({file_size_mb:.2f} MB)...")

    if file_size > MAX_TELEGRAM_BOT_FILE_SIZE:
        print(f"[WARN] Dung lượng file ({file_size_mb:.2f} MB) vượt quá giới hạn 50MB của Telegram Bot API.")
        warning_msg = (
            f"⚠️ <b>File {file_path.name}</b> vượt quá giới hạn 50MB của Telegram Bot API "
            f"({file_size_mb:.2f} MB / 50 MB max).\n"
            f"Vui lòng tải trực tiếp artifact từ trang quản trị CI/CD."
        )
        return send_message(bot_token, chat_id, warning_msg, thread_id)

    boundary = f"----WebKitFormBoundary{os.urandom(16).hex()}"
    body = bytearray()

    def add_field(name: str, value: str):
        body.extend(f"--{boundary}\r\n".encode('utf-8'))
        body.extend(f'Content-Disposition: form-data; name="{name}"\r\n\r\n'.encode('utf-8'))
        body.extend(f"{value}\r\n".encode('utf-8'))

    add_field("chat_id", chat_id)
    if caption:
        add_field("caption", caption)
        add_field("parse_mode", "HTML")
    if thread_id:
        add_field("message_thread_id", thread_id)

    # Thêm file nhị phân
    content_type = mimetypes.guess_type(str(file_path))[0] or "application/octet-stream"
    body.extend(f"--{boundary}\r\n".encode('utf-8'))
    body.extend(f'Content-Disposition: form-data; name="document"; filename="{file_path.name}"\r\n'.encode('utf-8'))
    body.extend(f"Content-Type: {content_type}\r\n\r\n".encode('utf-8'))
    
    with open(file_path, "rb") as f:
        body.extend(f.read())
    body.extend(b"\r\n")

    body.extend(f"--{boundary}--\r\n".encode('utf-8'))

    url = f"{TELEGRAM_API_URL}/bot{bot_token}/sendDocument"
    req = urllib.request.Request(
        url,
        data=body,
        headers={
            "Content-Type": f"multipart/form-data; boundary={boundary}",
            "Content-Length": str(len(body))
        }
    )

    try:
        with urllib.request.urlopen(req, timeout=180) as resp:
            res_body = json.loads(resp.read().decode('utf-8'))
            if res_body.get("ok"):
                print(f"[SUCCESS] Đã gửi thành công {file_path.name} lên Telegram!")
                return True
            else:
                print(f"[ERROR] Telegram trả về lỗi: {res_body}")
                return False
    except urllib.error.HTTPError as e:
        err_msg = e.read().decode('utf-8', errors='ignore')
        print(f"[ERROR] HTTP Error {e.code}: {err_msg}")
        return False
    except Exception as e:
        print(f"[ERROR] Lỗi kết nối khi tải file lên Telegram: {e}")
        return False

def build_default_caption(platform_name: str, file_path: Path) -> str:
    """Tạo caption chuẩn hiển thị đầy đủ thông tin build từ biến môi trường CI."""
    branch = os.environ.get("CM_BRANCH") or os.environ.get("GIT_BRANCH", "main")
    commit = (os.environ.get("CM_COMMIT") or os.environ.get("GIT_COMMIT", ""))[:7]
    commit_msg = os.environ.get("CM_COMMIT_MESSAGE", "Automated build release").splitlines()[0]

    icon = "🍏" if "ios" in platform_name.lower() or file_path.suffix == ".ipa" else "🤖"
    file_size_mb = file_path.stat().st_size / (1024 * 1024) if file_path.exists() else 0

    lines = [
        f"{icon} <b>ITS MOBILE VEC - BUILD THÀNH CÔNG</b>",
        f"━━━━━━━━━━━━━━━━━━━━━━",
        f"📦 <b>Nền tảng:</b> {platform_name.upper()}",
        f"🏷️ <b>File:</b> <code>{file_path.name}</code> ({file_size_mb:.2f} MB)",
        f"🌿 <b>Nhánh:</b> <code>{branch}</code> | <b>Commit:</b> <code>{commit}</code>",
        f"💬 <b>Nội dung:</b> {commit_msg}",
        f"⏰ Tuyến cao tốc Nội Bài - Lào Cai (ITS-Mobile)"
    ]
    return "\n".join(lines)

def main():
    parser = argparse.ArgumentParser(description="Gửi file build và thông báo lên Telegram qua Bot API.")
    parser.add_argument("--file", "-f", type=str, required=True, help="Đường dẫn đến file artifact (.ipa, .apk, .aab)")
    parser.add_argument("--platform", "-p", type=str, default="App", help="Tên nền tảng (iOS / Android)")
    parser.add_argument("--bot-token", type=str, help="Telegram Bot Token (mặc định lấy từ TELEGRAM_BOT_TOKEN)")
    parser.add_argument("--chat-id", type=str, help="Telegram Chat ID (mặc định lấy từ TELEGRAM_CHAT_ID)")
    parser.add_argument("--thread-id", type=str, help="Telegram Message Thread ID nếu dùng Topic")
    parser.add_argument("--caption", type=str, help="Tùy biến caption")

    args = parser.parse_args()

    bot_token = args.bot_token or os.environ.get("TELEGRAM_BOT_TOKEN")
    chat_id = args.chat_id or os.environ.get("TELEGRAM_CHAT_ID")
    thread_id = args.thread_id or os.environ.get("TELEGRAM_THREAD_ID")

    if not bot_token or not chat_id:
        print("[SKIP] Bỏ qua gửi Telegram vì chưa cấu hình TELEGRAM_BOT_TOKEN hoặc TELEGRAM_CHAT_ID.")
        print("Vui lòng cấu hình 2 biến môi trường này trong thiết lập CI/CD hoặc truyền qua CLI arguments.")
        sys.exit(0)

    file_path = Path(args.file)
    caption = args.caption or build_default_caption(args.platform, file_path)

    success = send_document(bot_token, chat_id, file_path, caption, thread_id)
    if not success:
        print("[WARN] Gửi artifact lên Telegram không thành công nhưng không ngắt quãng tiến trình CI/CD.")
        sys.exit(0)

if __name__ == "__main__":
    main()
