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

// 1. Tính toán thời gian theo múi giờ Việt Nam (UTC+7)
const now = new Date(Date.now() + 7 * 3600 * 1000);
const pad = (n) => String(n).padStart(2, '0');
const timestamp = `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}.${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}`;
const releaseDate = `${now.getUTCFullYear()}-${pad(now.getUTCMonth() + 1)}-${pad(now.getUTCDate())} ${pad(now.getUTCHours())}:${pad(now.getUTCMinutes())}`;

// 2. Xác định phiên bản: lấy trực tiếp đuôi timestamp dạng YYYYMMDD.HHmm (bỏ tiền tố 1.8)
let version = process.env.OTA_VERSION;
if (!version || version === 'auto' || version.trim() === '') {
    version = timestamp;
} else {
    version = version.trim();
}

// 4. Xác định nội dung ghi chú cập nhật
let notes = process.env.OTA_NOTES;
if (!notes || notes.trim() === '') {
    notes = `Bản cập nhật v${version}: Nâng cấp hiệu năng, đồng bộ quy trình nghiệp vụ ca trực và tối ưu hệ thống.`;
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
