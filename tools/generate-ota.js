/**
 * Script tự động sinh Version OTA dạng timestamp (YYYYMMDD.HHmm)
 * và lưu metadata vào version.json để nạp trực tiếp vào Database.
 */
const fs = require('fs');
const path = require('path');

const targetDir = process.argv[2] 
    ? path.resolve(process.argv[2]) 
    : path.resolve(__dirname, '../ITS-MOBILE-API/wwwroot/ota');

if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
}

// 1. Tính toán thời gian theo múi giờ Việt Nam (UTC+7)
const now = new Date(Date.now() + 7 * 3600 * 1000);
const pad = (n) => String(n).padStart(2, '0');
const timestamp = `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}.${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}`;
const releaseDate = `${now.getUTCFullYear()}-${pad(now.getUTCMonth() + 1)}-${pad(now.getUTCDate())} ${pad(now.getUTCHours())}:${pad(now.getUTCMinutes())}`;

// 2. Xác định phiên bản (lấy timestamp đuôi, bỏ hẳn 1.8)
let version = process.env.OTA_VERSION;
if (!version || version === 'auto' || version.trim() === '') {
    version = timestamp;
} else {
    version = version.trim();
}

// 3. Xác định nội dung ghi chú cập nhật
let notes = process.env.OTA_NOTES;
if (!notes || notes.trim() === '') {
    notes = `Bản cập nhật v${version}: Nâng cấp hiệu năng, đồng bộ quy trình nghiệp vụ ca trực và tối ưu hệ thống.`;
} else {
    notes = notes.trim();
}

// 4. Lưu metadata phiên bản vào version.json (thay thế hoàn toàn manifest.json cũ)
const versionInfo = {
    version: version,
    releaseDate: releaseDate,
    changeLog: notes,
    mandatory: false
};

fs.writeFileSync(path.join(targetDir, 'version.json'), JSON.stringify(versionInfo, null, 4), 'utf8');

console.log('==========================================================');
console.log(' [OTA] Đã tự động sinh OTA Version mới thành công!');
console.log(` - Phiên bản mới (version)     : ${version}`);
console.log(` - Thời gian build (releaseDate): ${releaseDate}`);
console.log(` - Thư mục lưu trữ             : ${targetDir}`);
console.log('==========================================================');
