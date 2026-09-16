const fs = require('fs');

const DATA_PATH = 'd:/Etc/ITS_Mobile_VEC/docs/generated/its-mobile-vec-demo/content-data.json';
const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));

const ROLE = 'Nhan vien van hanh hien truong';

function makeExecution() {
  return {
    status: 'not-executed',
    executed_at: null,
    executed_by: null,
    duration_ms: null,
    screenshot_refs: [],
    playwright_script: null,
    notes: null
  };
}

function step(no, action, expected) {
  return { no, action, expected };
}

// Rewrite API cases to match exact same schema as UI cases
// endpoint/method info goes into name and preconditions
const apiCases = [
  {
    id: 'TC-API-001',
    name: '[GET /api/tasks] Lay danh sach nhiem vu cua nhan vien - tra ve 200',
    feature_id: 'F-006',
    feature_module: 'M2',
    source: 'generate-docs/fallback-synthesized',
    role: ROLE,
    priority: 'Rat cao',
    labels: ['api', 'backend'],
    design_technique: 'Use Case Testing',
    preconditions: 'Nhan vien da dang nhap, JWT hop le. Co it nhat 1 nhiem vu trong DB.',
    data_set: 'Authorization: Bearer <JWT-hop-le>',
    steps: [
      step(1, 'Gui GET /api/tasks voi header Authorization: Bearer <JWT>', 'Server nhan yeu cau HTTP'),
      step(2, 'Server truy van DB lay danh sach nhiem vu cua nhan vien', 'Truy van thanh cong'),
      step(3, 'Kiem tra HTTP status code cua response', 'Status code la 200 OK'),
      step(4, 'Kiem tra body response', 'Body chua mang tasks[], moi item co: id, title, status, created_at, location')
    ],
    expected_overall: 'Status 200 OK, response body la JSON chua { tasks: [...], total: N }. Moi task item co day du cac truong co ban.',
    dialog_id: null,
    error_case_id: null,
    transition: null,
    expected_evidence: null,
    execution: makeExecution()
  },
  {
    id: 'TC-API-002',
    name: '[GET /api/tasks/:id] Lay chi tiet nhiem vu theo ID hop le - tra ve 200',
    feature_id: 'F-007',
    feature_module: 'M2',
    source: 'generate-docs/fallback-synthesized',
    role: ROLE,
    priority: 'Cao',
    labels: ['api', 'backend'],
    design_technique: 'Equivalence Partitioning',
    preconditions: 'Nhan vien da dang nhap, JWT hop le. Nhiem vu ID=123 ton tai trong DB.',
    data_set: 'Authorization: Bearer <JWT>; task_id=123',
    steps: [
      step(1, 'Gui GET /api/tasks/123 voi header Authorization hop le', 'Server nhan yeu cau'),
      step(2, 'Server tim nhiem vu id=123 trong DB', 'Tim thay ban ghi'),
      step(3, 'Kiem tra HTTP status code', 'Status 200 OK'),
      step(4, 'Kiem tra body response chua day du truong chi tiet', 'Body chua: id, title, description, status, location, media[], history[]')
    ],
    expected_overall: 'Status 200, response la JSON object nhiem vu voi day du truong chi tiet va lich su trang thai.',
    dialog_id: null,
    error_case_id: null,
    transition: null,
    expected_evidence: null,
    execution: makeExecution()
  },
  {
    id: 'TC-API-003',
    name: '[GET /api/tasks/:id] Nhiem vu khong ton tai - tra ve 404',
    feature_id: 'F-007',
    feature_module: 'M2',
    source: 'generate-docs/fallback-synthesized',
    role: ROLE,
    priority: 'Trung binh',
    labels: ['api', 'backend', 'error-case'],
    design_technique: 'Equivalence Partitioning',
    preconditions: 'Nhan vien da dang nhap, JWT hop le. ID=99999 KHONG ton tai trong DB.',
    data_set: 'Authorization: Bearer <JWT>; task_id=99999',
    steps: [
      step(1, 'Gui GET /api/tasks/99999 voi JWT hop le', 'Server nhan yeu cau'),
      step(2, 'Server tim ID 99999 trong DB, khong tim thay', 'Server tra ve loi not found'),
      step(3, 'Kiem tra HTTP status code', 'Status 404 Not Found'),
      step(4, 'Kiem tra body loi', 'Body chua { error: "not_found", message: "..." }')
    ],
    expected_overall: 'Status 404 Not Found, body JSON chua truong error va message giai thich nguyen nhan.',
    dialog_id: null,
    error_case_id: null,
    transition: null,
    expected_evidence: null,
    execution: makeExecution()
  },
  {
    id: 'TC-API-004',
    name: '[PATCH /api/tasks/:id/status] Cap nhat trang thai nhiem vu thanh cong - tra ve 200',
    feature_id: 'F-008',
    feature_module: 'M2',
    source: 'generate-docs/fallback-synthesized',
    role: ROLE,
    priority: 'Rat cao',
    labels: ['api', 'backend'],
    design_technique: 'Use Case Testing',
    preconditions: 'Nhan vien da dang nhap, JWT hop le. Nhiem vu ID=123 ton tai voi trang thai hien tai la 1 (Da nhan).',
    data_set: 'Authorization: Bearer <JWT>; task_id=123; body: { "status": 2 }',
    steps: [
      step(1, 'Gui PATCH /api/tasks/123/status voi body {"status": 2} va JWT', 'Server nhan yeu cau'),
      step(2, 'Server cap nhat DB, ghi nhan timestamp thay doi', 'Cap nhat thanh cong'),
      step(3, 'Kiem tra HTTP status code', 'Status 200 OK'),
      step(4, 'Kiem tra body response', 'Body chua: { id: 123, status: 2, updated_at: "<ISO-timestamp>" }')
    ],
    expected_overall: 'Status 200, response chua thong tin nhiem vu da cap nhat voi status=2. DB duoc cap nhat chinh xac.',
    dialog_id: null,
    error_case_id: null,
    transition: null,
    expected_evidence: null,
    execution: makeExecution()
  },
  {
    id: 'TC-API-005',
    name: '[POST /api/tasks/:id/media] Upload anh hien truong thanh cong - tra ve 201',
    feature_id: 'F-009',
    feature_module: 'M2',
    source: 'generate-docs/fallback-synthesized',
    role: ROLE,
    priority: 'Cao',
    labels: ['api', 'backend', 'file-upload'],
    design_technique: 'Use Case Testing',
    preconditions: 'Nhan vien da dang nhap, JWT hop le. Nhiem vu ID=123 ton tai voi status=2. File anh JPEG kich thuoc hop le (< 10MB).',
    data_set: 'Authorization: Bearer <JWT>; task_id=123; multipart file: image.jpg (2MB, JPEG)',
    steps: [
      step(1, 'Gui POST /api/tasks/123/media voi Content-Type: multipart/form-data, dinh kem image.jpg', 'Server nhan file upload'),
      step(2, 'Server luu file vao storage, tao ban ghi media trong DB', 'Xu ly thanh cong'),
      step(3, 'Kiem tra HTTP status code', 'Status 201 Created'),
      step(4, 'Kiem tra body response', 'Body chua: { media_id, url, type: "image", created_at }')
    ],
    expected_overall: 'Status 201 Created, response chua URL truy cap file. File co the tai ve tu URL trong response.',
    dialog_id: null,
    error_case_id: null,
    transition: null,
    expected_evidence: null,
    execution: makeExecution()
  },
  {
    id: 'TC-API-006',
    name: '[GET /api/notifications] Lay danh sach thong bao - tra ve 200',
    feature_id: 'F-011',
    feature_module: 'M3',
    source: 'generate-docs/fallback-synthesized',
    role: ROLE,
    priority: 'Cao',
    labels: ['api', 'backend'],
    design_technique: 'Use Case Testing',
    preconditions: 'Nhan vien da dang nhap, JWT hop le. Co it nhat 1 thong bao trong DB.',
    data_set: 'Authorization: Bearer <JWT>',
    steps: [
      step(1, 'Gui GET /api/notifications voi JWT hop le', 'Server nhan yeu cau'),
      step(2, 'Server lay danh sach thong bao cua nhan vien tu DB', 'Truy van thanh cong'),
      step(3, 'Kiem tra HTTP status code', 'Status 200 OK'),
      step(4, 'Kiem tra body response', 'Body chua: { notifications: [...], unread_count: N }, moi item co: id, title, body, read, created_at')
    ],
    expected_overall: 'Status 200, response JSON chua mang notifications[] va so luong chua doc (unread_count).',
    dialog_id: null,
    error_case_id: null,
    transition: null,
    expected_evidence: null,
    execution: makeExecution()
  },
  {
    id: 'TC-API-007',
    name: '[PUT /api/notifications/:id/read] Danh dau thong bao da doc - tra ve 200',
    feature_id: 'F-011',
    feature_module: 'M3',
    source: 'generate-docs/fallback-synthesized',
    role: ROLE,
    priority: 'Trung binh',
    labels: ['api', 'backend'],
    design_technique: 'Use Case Testing',
    preconditions: 'Nhan vien da dang nhap, JWT hop le. Thong bao ID=456 ton tai voi trang thai chua doc (read=false).',
    data_set: 'Authorization: Bearer <JWT>; notification_id=456',
    steps: [
      step(1, 'Gui PUT /api/notifications/456/read voi JWT hop le', 'Server nhan yeu cau'),
      step(2, 'Server cap nhat DB: read=true, ghi read_at', 'Cap nhat thanh cong'),
      step(3, 'Kiem tra HTTP status code', 'Status 200 OK'),
      step(4, 'Kiem tra body response', 'Body chua: { id: 456, read: true, read_at: "<ISO-timestamp>" }')
    ],
    expected_overall: 'Status 200, thong bao duoc danh dau da doc. DB phan anh trang thai moi chinh xac.',
    dialog_id: null,
    error_case_id: null,
    transition: null,
    expected_evidence: null,
    execution: makeExecution()
  }
];

data.test_cases.api = apiCases;

fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), 'utf8');
console.log('Fixed API test cases:', apiCases.length);
console.log('Keys:', Object.keys(apiCases[0]).join(', '));
