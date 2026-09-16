---
name: fastlane
description: >-
  Bộ công cụ tự động hóa đóng gói, ký số (Code Signing), và phát hành ứng dụng iOS (TestFlight / App Store)
  và Android (APK / Google Play / Firebase) bằng Fastlane cho dự án ITS Mobile VEC.
  Kích hoạt khi cần setup Fastlane, cấu hình Match chứng chỉ, build beta TestFlight, chụp snapshot tự động,
  hoặc release lên App Store / CH Play.
---

# Fastlane Automation Skill — ITS Mobile VEC

Tài liệu quy chuẩn và hướng dẫn tự động hóa quy trình Build, Test, Code Signing và Phát hành đa nền tảng (iOS & Android) bằng **Fastlane**.

Dựa trên chuẩn [greenstevester/fastlane-skill](https://github.com/greenstevester/fastlane-skill) tích hợp chuyên sâu cho hệ sinh thái **ITS Mobile VEC (Tuyến Cao tốc Nội Bài – Lào Cai)**.

---

## 🚀 Tổng quan các Phân hệ Fastlane (Lanes)

```text
┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│    SETUP     │───▶│    MATCH     │───▶│   SNAPSHOT   │───▶│     BETA     │───▶│   RELEASE    │
└──────────────┘    └──────────────┘    └──────────────┘    └──────────────┘    └──────────────┘
  fastlane init       Sync Certs &        Chụp ảnh màn        Build & Upload      Phát hành App
  Appfile/Fastfile    Provisioning        hình tự động        TestFlight / APK    Store / CH Play
```

| Skill / Phân hệ | Mục đích | Lệnh thực thi | Chi tiết |
| :--- | :--- | :--- | :--- |
| **`setup-fastlane`** | Khởi tạo cấu hình `Appfile` và `Fastfile` | `fastlane init` | [setup-fastlane/SKILL.md](../setup-fastlane/SKILL.md) |
| **`match`** | Quản lý chứng chỉ & provisioning profile qua Git repo riêng | `fastlane match` | [match/SKILL.md](../match/SKILL.md) |
| **`snapshot`** | Tự động chụp ảnh màn hình cho các thiết bị & ngôn ngữ | `fastlane snapshot` | [snapshot/SKILL.md](../snapshot/SKILL.md) |
| **`beta`** | Tự động tăng build number, ký số và đẩy bản test (TestFlight / APK) | `fastlane ios beta` / `fastlane android beta` | [beta/SKILL.md](../beta/SKILL.md) |
| **`release`** | Đẩy bản phát hành chính thức lên App Store / Google Play | `fastlane ios release` / `fastlane android release` | [release/SKILL.md](../release/SKILL.md) |

---

## 🛠 Cấu hình Mẫu cho Dự Án ITS Mobile VEC

### 1. `fastlane/Appfile`
```ruby
# Cấu hình định danh cho iOS & Android
app_identifier("vn.etc.its.mobile") # Bundle ID chuẩn ETC
apple_id("apple-dev@etc.vn")        # Email Apple Developer Account của công ty
team_id("XXXXXXXXXX")               # Apple Developer Team ID

# Cấu hình Android
json_key_file("fastlane/google-play-key.json")
package_name("vn.etc.its.mobile")
```

### 2. `fastlane/Fastfile`
```ruby
default_platform(:ios)

platform :ios do
  desc "Chạy kiểm thử unit test"
  lane :test do
    run_tests(workspace: "ios/itsmobile.xcworkspace", scheme: "itsmobile")
  end

  desc "Đẩy bản thử nghiệm lên Apple TestFlight"
  lane :beta do |options|
    # Đồng bộ chứng chỉ qua Match
    match(type: "appstore", readonly: is_ci)
    
    # Tự động tăng build number nếu không có cờ skip
    increment_build_number(xcodeproj: "ios/itsmobile.xcodeproj") unless options[:skip_build_increment]
    
    # Đóng gói IPA
    build_app(
      workspace: "ios/itsmobile.xcworkspace",
      scheme: "itsmobile",
      export_method: "app-store"
    )
    
    # Upload TestFlight
    upload_to_testflight(
      skip_waiting_for_build_processing: true,
      changelog: options[:changelog] || "Bản cập nhật thử nghiệm ITS Mobile VEC"
    )
  end

  desc "Phát hành chính thức lên App Store"
  lane :release do
    match(type: "appstore", readonly: true)
    build_app(workspace: "ios/itsmobile.xcworkspace", scheme: "itsmobile")
    upload_to_app_store(force: true, skip_screenshots: true)
  end
end

platform :android do
  desc "Build bản APK Release gửi nội bộ"
  lane :build_apk do
    gradle(
      task: "assemble",
      build_type: "Release",
      project_dir: "android/"
    )
  end

  desc "Build và phân phối qua Firebase App Distribution"
  lane :beta do
    gradle(task: "assemble", build_type: "Release", project_dir: "android/")
    firebase_app_distribution(
      app: "1:xxxxxxxx:android:xxxxxxxx",
      groups: "etc-internal-testers",
      release_notes: "Bản test nội bộ ITS Mobile VEC"
    )
  end
end
```

---

## 🔑 Biến Môi Trường Cần Thiết (Environment Variables)

Khi chạy trên máy tính hoặc CI/CD GitLab:
* `FASTLANE_APPLE_APPLICATION_SPECIFIC_PASSWORD`: Mật khẩu ứng dụng Apple ID để xác thực không cần OTP.
* `MATCH_PASSWORD`: Mật khẩu mã hóa kho lưu trữ chứng chỉ Git của team.
* `MATCH_GIT_URL`: URL kho Git lưu trữ certificates (ví dụ: `https://git.etc.vn/etc/mobile-certificates.git`).
