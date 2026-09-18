/**
 * Script tự động sinh Version OTA và cập nhật manifest.json & manifest-ios.json
 * Định dạng version tự động: 1.8.YYYYMMDD.HHmm (ví dụ: 1.8.20260918.1405)
 * Hỗ trợ nhận biến môi trường OTA_VERSION và OTA_NOTES hoặc tham số dòng lệnh.
 */
const fs = require('fs');
const path = require('path');

const targetDir = process.argv[2] 
    ? path.resolve(process.argv[2]) 
    : path.resolve(__dirname, '../ITS-MOBILE-API/wwwroot/ota');

const manifestRefPath = process.argv[3] 
    ? path.resolve(process.argv[3]) 
    : path.resolve(__dirname, '../ITS-MOBILE-API/wwwroot/ota/manifest.json');

if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
}

// 1. Trích xuất prefix version từ manifest cũ (ví dụ: "1.8.2" -> "1.8")
let basePrefix = '1.8';
if (fs.existsSync(manifestRefPath)) {
    try {
        let raw = fs.readFileSync(manifestRefPath, 'utf8');
        raw = raw.replace(/^\uFEFF/, '').trim();
        const parsed = JSON.parse(raw);
        if (parsed && parsed.latestVersion) {
            const parts = parsed.latestVersion.split('.');
            if (parts.length >= 2) {
                basePrefix = `${parts[0]}.${parts[1]}`;
            }
        }
    } catch (e) {
        console.warn('[OTA] Không đọc được manifest cũ, sử dụng prefix mặc định:', basePrefix);
    }
}

// 2. Tính toán thời gian theo múi giờ Việt Nam (UTC+7)
const now = new Date(Date.now() + 7 * 3600 * 1000);
const pad = (n) => String(n).padStart(2, '0');
const timestamp = `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}.${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}`;
const releaseDate = `${now.getUTCFullYear()}-${pad(now.getUTCMonth() + 1)}-${pad(now.getUTCDate())} ${pad(now.getUTCHours())}:${pad(now.getUTCMinutes())}`;

// 3. Xác định phiên bản (ưu tiên OTA_VERSION nếu được chỉ định cụ thể)
let version = process.env.OTA_VERSION;
if (!version || version === 'auto' || version.trim() === '') {
    version = `${basePrefix}.${timestamp}`;
} else {
    version = version.trim();
}

// 4. Xác định nội dung ghi chú cập nhật
let notes = process.env.OTA_NOTES;
if (!notes || notes.trim() === '') {
    notes = `Bản cập nhật tự động v${version} (Build: ${releaseDate}): Tối ưu hiệu năng và cập nhật mới nhất.`;
} else {
    notes = notes.trim();
}

// 5. Cấu trúc manifest cho Android và iOS
const manifestAndroid = {
    latestVersion: version,
    mandatory: false,
    releaseDate: releaseDate,
    hasUpdate: true,
    changeLog: notes,
    bundleUrl: '/api/ota/bundle/latest?platform=android'
};

const manifestIos = {
    latestVersion: version,
    mandatory: false,
    releaseDate: releaseDate,
    hasUpdate: true,
    changeLog: notes,
    bundleUrl: '/api/ota/bundle/latest?platform=ios'
};

fs.writeFileSync(path.join(targetDir, 'manifest.json'), JSON.stringify(manifestAndroid, null, 4), 'utf8');
fs.writeFileSync(path.join(targetDir, 'manifest-ios.json'), JSON.stringify(manifestIos, null, 4), 'utf8');

console.log('==========================================================');
console.log(' [OTA] Đã tự động sinh OTA Version mới thành công!');
console.log(` - Phiên bản mới (latestVersion): ${version}`);
console.log(` - Thời gian build (releaseDate): ${releaseDate}`);
console.log(` - Thư mục lưu trữ             : ${targetDir}`);
console.log('==========================================================');
