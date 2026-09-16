const fs = require('fs');

const DATA_PATH = 'd:/Etc/ITS_Mobile_VEC/docs/generated/its-mobile-vec-demo/content-data.json';
const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));

const ROLE = 'Nhân viên vận hành hiện trường';

function exec() {
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

function s(no, action, expected) {
  return { no, action, expected };
}

const ui = [
  // ─── F-001 Đăng nhập ───────────────────────────────────────────
  {
    tc_id: 'TC-001', id: 'TC-001',
    name: 'Đăng nhập thành công với extension và mật khẩu hợp lệ',
    feature_id: 'F-001', feature_module: 'M1',
    source: 'generate-docs/fallback-synthesized',
    role: ROLE, priority: 'Rất cao', labels: [],
    design_technique: 'Equivalence Partitioning',
    preconditions: 'Ứng dụng đã cài đặt, thiết bị có kết nối internet, tài khoản nhân viên tồn tại trong hệ thống.',
    data_set: null,
    steps: [
      s(1, 'Mở ứng dụng ITS Mobile VEC', 'Màn hình đăng nhập hiển thị với 2 trường nhập: Extension và Mật khẩu'),
      s(2, 'Nhập extension hợp lệ (ví dụ: 1001)', 'Trường Extension nhận giá trị'),
      s(3, 'Nhập mật khẩu đúng', 'Mật khẩu hiển thị dạng ẩn (****)'),
      s(4, 'Nhấn nút Đăng nhập', 'Ứng dụng gửi yêu cầu xác thực, hiển thị loading'),
      s(5, 'Chờ kết quả', 'Chuyển sang màn hình chính, hiển thị tên nhân viên và trạng thái sẵn sàng')
    ],
    expected_overall: 'Nhân viên đăng nhập thành công, phiên làm việc được tạo, JWT lưu vào storage.',
    dialog_id: null, error_case_id: null, transition: null, expected_evidence: null,
    execution: exec()
  },
  {
    tc_id: 'TC-002', id: 'TC-002',
    name: 'Đăng nhập thất bại khi extension không tồn tại',
    feature_id: 'F-001', feature_module: 'M1',
    source: 'generate-docs/fallback-synthesized',
    role: ROLE, priority: 'Rất cao', labels: [],
    design_technique: 'Equivalence Partitioning',
    preconditions: 'Ứng dụng đã cài đặt, thiết bị có kết nối internet.',
    data_set: null,
    steps: [
      s(1, 'Mở ứng dụng, nhập extension không tồn tại (ví dụ: 9999)', 'Trường Extension nhận giá trị'),
      s(2, 'Nhập mật khẩu bất kỳ', 'Trường Mật khẩu nhận giá trị'),
      s(3, 'Nhấn nút Đăng nhập', 'Ứng dụng gửi yêu cầu xác thực')
    ],
    expected_overall: 'Hiển thị thông báo lỗi "Sai thông tin đăng nhập", không chuyển màn hình, mật khẩu bị xóa.',
    dialog_id: null, error_case_id: null, transition: null, expected_evidence: null,
    execution: exec()
  },
  {
    tc_id: 'TC-003', id: 'TC-003',
    name: 'Đăng nhập thất bại khi mật khẩu sai',
    feature_id: 'F-001', feature_module: 'M1',
    source: 'generate-docs/fallback-synthesized',
    role: ROLE, priority: 'Cao', labels: [],
    design_technique: 'Equivalence Partitioning',
    preconditions: 'Ứng dụng đã cài đặt, tài khoản hợp lệ tồn tại trong hệ thống.',
    data_set: null,
    steps: [
      s(1, 'Mở ứng dụng, nhập extension hợp lệ', 'Trường Extension nhận giá trị'),
      s(2, 'Nhập mật khẩu sai', 'Trường Mật khẩu nhận giá trị (ẩn)'),
      s(3, 'Nhấn nút Đăng nhập', 'Ứng dụng gửi yêu cầu xác thực')
    ],
    expected_overall: 'Hiển thị thông báo lỗi xác thực, người dùng ở lại màn hình đăng nhập.',
    dialog_id: null, error_case_id: null, transition: null, expected_evidence: null,
    execution: exec()
  },
  {
    tc_id: 'TC-004', id: 'TC-004',
    name: 'Đăng nhập thất bại khi để trống trường Extension',
    feature_id: 'F-001', feature_module: 'M1',
    source: 'generate-docs/fallback-synthesized',
    role: ROLE, priority: 'Trung bình', labels: [],
    design_technique: 'Boundary Value Analysis',
    preconditions: 'Ứng dụng đã cài đặt.',
    data_set: null,
    steps: [
      s(1, 'Mở ứng dụng, bỏ trống trường Extension', 'Trường Extension rỗng'),
      s(2, 'Nhập mật khẩu bất kỳ', 'Trường Mật khẩu nhận giá trị'),
      s(3, 'Nhấn nút Đăng nhập', 'Ứng dụng kiểm tra validation')
    ],
    expected_overall: 'Hiển thị cảnh báo "Extension không được để trống", không gửi yêu cầu lên server.',
    dialog_id: null, error_case_id: null, transition: null, expected_evidence: null,
    execution: exec()
  },
  {
    tc_id: 'TC-005', id: 'TC-005',
    name: 'Đăng nhập khi không có kết nối mạng',
    feature_id: 'F-001', feature_module: 'M1',
    source: 'generate-docs/fallback-synthesized',
    role: ROLE, priority: 'Cao', labels: [],
    design_technique: 'Error Guessing',
    preconditions: 'Ứng dụng đã cài đặt, thiết bị TẮT Wi-Fi và dữ liệu di động.',
    data_set: null,
    steps: [
      s(1, 'Mở ứng dụng, nhập extension và mật khẩu hợp lệ', 'Màn hình đăng nhập hiển thị'),
      s(2, 'Nhấn nút Đăng nhập', 'Ứng dụng thử kết nối đến server')
    ],
    expected_overall: 'Hiển thị thông báo "Không có kết nối mạng. Vui lòng kiểm tra lại.", người dùng ở lại màn hình đăng nhập.',
    dialog_id: null, error_case_id: null, transition: null, expected_evidence: null,
    execution: exec()
  },

  // ─── F-002 Đăng xuất ───────────────────────────────────────────
  {
    tc_id: 'TC-006', id: 'TC-006',
    name: 'Đăng xuất thành công từ menu',
    feature_id: 'F-002', feature_module: 'M1',
    source: 'generate-docs/fallback-synthesized',
    role: ROLE, priority: 'Cao', labels: [],
    design_technique: 'Use Case Testing',
    preconditions: 'Nhân viên đã đăng nhập thành công, đang ở màn hình chính.',
    data_set: null,
    steps: [
      s(1, 'Nhấn vào menu/icon tài khoản hoặc nút Đăng xuất', 'Hiển thị xác nhận đăng xuất'),
      s(2, 'Xác nhận đăng xuất', 'Hệ thống xử lý đăng xuất'),
      s(3, 'Chờ kết quả', 'Chuyển về màn hình đăng nhập, JWT bị xóa khỏi storage')
    ],
    expected_overall: 'Nhân viên đăng xuất thành công, phiên làm việc kết thúc, chuyển về màn hình đăng nhập.',
    dialog_id: null, error_case_id: null, transition: null, expected_evidence: null,
    execution: exec()
  },
  {
    tc_id: 'TC-007', id: 'TC-007',
    name: 'Tắt ứng dụng và mở lại kiểm tra trạng thái đăng nhập',
    feature_id: 'F-002', feature_module: 'M1',
    source: 'generate-docs/fallback-synthesized',
    role: ROLE, priority: 'Trung bình', labels: [],
    design_technique: 'Use Case Testing',
    preconditions: 'Nhân viên đã đăng nhập, token còn hiệu lực.',
    data_set: null,
    steps: [
      s(1, 'Tắt ứng dụng (chạy nền/foreground)', 'Ứng dụng đóng'),
      s(2, 'Mở lại ứng dụng', 'Ứng dụng khởi động'),
      s(3, 'Chờ kết quả', 'Kiểm tra trạng thái')
    ],
    expected_overall: 'Nếu token còn hiệu lực: tự động chuyển sang màn hình chính. Nếu token hết hạn: hiển thị màn hình đăng nhập.',
    dialog_id: null, error_case_id: null, transition: null, expected_evidence: null,
    execution: exec()
  },

  // ─── F-003 Gọi VoIP nội bộ ─────────────────────────────────────
  {
    tc_id: 'TC-008', id: 'TC-008',
    name: 'Gọi VoIP nội bộ thành công đến extension khác',
    feature_id: 'F-003', feature_module: 'M1',
    source: 'generate-docs/fallback-synthesized',
    role: ROLE, priority: 'Rất cao', labels: [],
    design_technique: 'Use Case Testing',
    preconditions: 'Nhân viên đã đăng nhập, kết nối VoIP đến tổng đài PBX thành công, thiết bị có micro và loa.',
    data_set: null,
    steps: [
      s(1, 'Vào danh bạ nội bộ, chọn một extension để gọi', 'Hiển thị thông tin extension đích'),
      s(2, 'Nhấn nút Gọi', 'Hệ thống SIP thiết lập phiên gọi, hiển thị màn hình cuộc gọi'),
      s(3, 'Chờ người nhận bắt máy', 'Kết nối được thiết lập, hiển thị "Đang gọi"'),
      s(4, 'Nói chuyện bình thường', 'Âm thanh truyền theo 2 chiều rõ ràng'),
      s(5, 'Nhấn nút Kết thúc gọi', 'SIP BYE được gửi, kết nối đóng lại'),
      s(6, 'Chờ màn hình', 'Trở về màn hình trước đó, hiển thị lịch sử cuộc gọi')
    ],
    expected_overall: 'Cuộc gọi VoIP nội bộ thành công, âm thanh rõ ràng, kết nối đóng sau khi cúp máy.',
    dialog_id: null, error_case_id: null, transition: null, expected_evidence: null,
    execution: exec()
  },
  {
    tc_id: 'TC-009', id: 'TC-009',
    name: 'Cuộc gọi bị từ chối vì extension đích bận',
    feature_id: 'F-003', feature_module: 'M1',
    source: 'generate-docs/fallback-synthesized',
    role: ROLE, priority: 'Cao', labels: [],
    design_technique: 'Error Guessing',
    preconditions: 'Nhân viên đã đăng nhập, kết nối VoIP hoạt động, extension đích đang trong cuộc gọi khác.',
    data_set: null,
    steps: [
      s(1, 'Chọn extension đích đang bận, nhấn nút Gọi', 'Hệ thống gửi yêu cầu gọi'),
      s(2, 'Chờ kết quả', 'Nhận tín hiệu "Busy" từ tổng đài')
    ],
    expected_overall: 'Hiển thị thông báo "Máy bận - Từ chối cuộc gọi", trở về màn hình cuộc gọi sau 3 giây.',
    dialog_id: null, error_case_id: null, transition: null, expected_evidence: null,
    execution: exec()
  },
  {
    tc_id: 'TC-010', id: 'TC-010',
    name: 'Mất kết nối VoIP trong khi gọi',
    feature_id: 'F-003', feature_module: 'M1',
    source: 'generate-docs/fallback-synthesized',
    role: ROLE, priority: 'Cao', labels: [],
    design_technique: 'Error Guessing',
    preconditions: 'Đang trong cuộc gọi VoIP, sau đó mất kết nối mạng.',
    data_set: null,
    steps: [
      s(1, 'Tắt Wi-Fi/dữ liệu trong khi đang có cuộc gọi', 'Mạng bị mất'),
      s(2, 'Chờ kết quả', 'Hệ thống phát hiện mất kết nối SIP')
    ],
    expected_overall: 'Cuộc gọi tự động kết thúc, hiển thị thông báo "Mất kết nối - Cuộc gọi bị gián đoạn", SIP tự đăng ký lại khi có mạng trở lại.',
    dialog_id: null, error_case_id: null, transition: null, expected_evidence: null,
    execution: exec()
  },

  // ─── F-004 Xem danh bạ nội bộ ──────────────────────────────────
  {
    tc_id: 'TC-011', id: 'TC-011',
    name: 'Xem danh sách toàn bộ danh bạ nội bộ',
    feature_id: 'F-004', feature_module: 'M1',
    source: 'generate-docs/fallback-synthesized',
    role: ROLE, priority: 'Cao', labels: [],
    design_technique: 'Use Case Testing',
    preconditions: 'Nhân viên đã đăng nhập, dữ liệu danh bạ đã được đồng bộ từ server.',
    data_set: null,
    steps: [
      s(1, 'Vào menu Danh bạ hoặc Liên hệ', 'Hiển thị màn hình danh bạ'),
      s(2, 'Xem danh sách', 'Hiển thị danh sách nhân viên/phòng ban với tên, extension, trạng thái')
    ],
    expected_overall: 'Danh sách danh bạ hiển thị đầy đủ các extension nội bộ, có chỉ báo trạng thái (sẵn sàng/bận/không có mặt).',
    dialog_id: null, error_case_id: null, transition: null, expected_evidence: null,
    execution: exec()
  },
  {
    tc_id: 'TC-012', id: 'TC-012',
    name: 'Tìm kiếm nhanh trong danh bạ',
    feature_id: 'F-004', feature_module: 'M1',
    source: 'generate-docs/fallback-synthesized',
    role: ROLE, priority: 'Trung bình', labels: [],
    design_technique: 'Use Case Testing',
    preconditions: 'Nhân viên đã đăng nhập, danh bạ đã tải.',
    data_set: null,
    steps: [
      s(1, 'Ở màn hình danh bạ, nhập từ khóa vào ô tìm kiếm', 'Ô tìm kiếm nhận giá trị'),
      s(2, 'Nhập tên hoặc extension (ví dụ: "1002")', 'Danh sách lọc theo từ khóa'),
      s(3, 'Xem kết quả', 'Chỉ hiển thị các mục khớp với từ khóa')
    ],
    expected_overall: 'Tìm kiếm hoạt động đúng, lọc danh sách theo tên hoặc số extension.',
    dialog_id: null, error_case_id: null, transition: null, expected_evidence: null,
    execution: exec()
  },
  {
    tc_id: 'TC-013', id: 'TC-013',
    name: 'Danh bạ hiển thị thông báo khi không có dữ liệu',
    feature_id: 'F-004', feature_module: 'M1',
    source: 'generate-docs/fallback-synthesized',
    role: ROLE, priority: 'Thấp', labels: [],
    design_technique: 'Error Guessing',
    preconditions: 'Nhân viên đã đăng nhập, nhưng server trả về danh sách rỗng.',
    data_set: null,
    steps: [
      s(1, 'Vào màn hình Danh bạ khi server trả về danh sách rỗng', 'Ứng dụng xử lý phản hồi')
    ],
    expected_overall: 'Hiển thị thông báo "Chưa có dữ liệu danh bạ" hoặc icon phù hợp, không bị crash.',
    dialog_id: null, error_case_id: null, transition: null, expected_evidence: null,
    execution: exec()
  },

  // ─── F-005 Nút SOS khẩn cấp ────────────────────────────────────
  {
    tc_id: 'TC-014', id: 'TC-014',
    name: 'Nhấn nút SOS để gọi khẩn cấp',
    feature_id: 'F-005', feature_module: 'M1',
    source: 'generate-docs/fallback-synthesized',
    role: ROLE, priority: 'Rất cao', labels: [],
    design_technique: 'Use Case Testing',
    preconditions: 'Nhân viên đang sử dụng ứng dụng (bất kỳ màn hình nào), thiết bị có sóng GSM.',
    data_set: null,
    steps: [
      s(1, 'Nhìn thấy nút SOS trên màn hình hiện tại', 'Nút SOS hiển thị rõ ràng (không bị che khuất)'),
      s(2, 'Nhấn giữ nút SOS (để tránh gọi nhầm)', 'Hiển thị xác nhận hoặc đếm ngược'),
      s(3, 'Xác nhận gọi khẩn cấp', 'Hệ thống khởi tạo cuộc gọi GSM đến số khẩn cấp định sẵn')
    ],
    expected_overall: 'Cuộc gọi GSM đến trung tâm khẩn cấp được thiết lập, hoạt động ngay cả khi không có internet (chỉ cần sóng GSM).',
    dialog_id: null, error_case_id: null, transition: null, expected_evidence: null,
    execution: exec()
  },

  // ─── F-006 Nhận và xem danh sách nhiệm vụ ──────────────────────
  {
    tc_id: 'TC-015', id: 'TC-015',
    name: 'Nhận push notification nhiệm vụ mới từ TMC',
    feature_id: 'F-006', feature_module: 'M2',
    source: 'generate-docs/fallback-synthesized',
    role: ROLE, priority: 'Rất cao', labels: [],
    design_technique: 'Use Case Testing',
    preconditions: 'Nhân viên đã đăng nhập, FCM/APNs đã được đăng ký, TMC phát nhiệm vụ mới.',
    data_set: null,
    steps: [
      s(1, 'Nhân viên đang ở bất kỳ màn hình nào khi TMC phát nhiệm vụ', 'FCM/APNs gửi push notification'),
      s(2, 'Thông báo xuất hiện trên thiết bị', 'Notification hiển thị tiêu đề và mô tả ngắn'),
      s(3, 'Nhấn vào thông báo', 'Ứng dụng mở ra hoặc foreground'),
      s(4, 'Màn hình nhiệm vụ hiện ra', 'Nhiệm vụ mới xuất hiện trong danh sách với trạng thái "Đã nhận" (status=1)')
    ],
    expected_overall: 'Nhân viên nhận được push notification và nhiệm vụ xuất hiện trong ứng dụng.',
    dialog_id: null, error_case_id: null, transition: null, expected_evidence: null,
    execution: exec()
  },
  {
    tc_id: 'TC-016', id: 'TC-016',
    name: 'Xem danh sách nhiệm vụ được giao',
    feature_id: 'F-006', feature_module: 'M2',
    source: 'generate-docs/fallback-synthesized',
    role: ROLE, priority: 'Rất cao', labels: [],
    design_technique: 'Use Case Testing',
    preconditions: 'Nhân viên đã đăng nhập, có ít nhất 1 nhiệm vụ trong hệ thống.',
    data_set: null,
    steps: [
      s(1, 'Vào menu Nhiệm vụ / Công việc', 'Màn hình danh sách nhiệm vụ hiển thị'),
      s(2, 'Xem danh sách', 'Hiển thị các nhiệm vụ với: mã nhiệm vụ, mô tả sự cố, vị trí, thời gian, trạng thái'),
      s(3, 'Kéo xuống để làm mới (pull-to-refresh)', 'Đồng bộ dữ liệu mới từ server')
    ],
    expected_overall: 'Danh sách nhiệm vụ hiển thị đúng, sắp xếp theo thời gian, trạng thái rõ ràng.',
    dialog_id: null, error_case_id: null, transition: null, expected_evidence: null,
    execution: exec()
  },

  // ─── F-007 Xem chi tiết nhiệm vụ ───────────────────────────────
  {
    tc_id: 'TC-017', id: 'TC-017',
    name: 'Xem chi tiết nhiệm vụ và các trường thông tin',
    feature_id: 'F-007', feature_module: 'M2',
    source: 'generate-docs/fallback-synthesized',
    role: ROLE, priority: 'Cao', labels: [],
    design_technique: 'Use Case Testing',
    preconditions: 'Nhân viên đã đăng nhập, có ít nhất 1 nhiệm vụ trong danh sách.',
    data_set: null,
    steps: [
      s(1, 'Từ danh sách nhiệm vụ, nhấn vào một nhiệm vụ', 'Chuyển sang màn hình chi tiết'),
      s(2, 'Xem các trường thông tin', 'Hiển thị: mã sự cố, mô tả, vị trí (km), loại sự cố, thời gian giao, ưu tiên, lịch sử trạng thái'),
      s(3, 'Xem bản đồ (nếu có tọa độ)', 'Hiển thị vị trí trên bản đồ hoặc tọa độ GPS')
    ],
    expected_overall: 'Toàn bộ thông tin chi tiết nhiệm vụ hiển thị đúng, không bị thiếu trường hay hiển thị sai giá trị.',
    dialog_id: null, error_case_id: null, transition: null, expected_evidence: null,
    execution: exec()
  },
  {
    tc_id: 'TC-018', id: 'TC-018',
    name: 'Nhiệm vụ không có tọa độ GPS hiển thị đúng',
    feature_id: 'F-007', feature_module: 'M2',
    source: 'generate-docs/fallback-synthesized',
    role: ROLE, priority: 'Trung bình', labels: [],
    design_technique: 'Error Guessing',
    preconditions: 'Nhiệm vụ tồn tại nhưng không có trường tọa độ GPS.',
    data_set: null,
    steps: [
      s(1, 'Mở chi tiết nhiệm vụ không có tọa độ', 'Màn hình chi tiết hiển thị'),
      s(2, 'Kiểm tra khu vực bản đồ/vị trí', 'Phần bản đồ hoặc vị trí xử lý an toàn')
    ],
    expected_overall: 'Phần bản đồ hiển thị "Không có tọa độ" hoặc ẩn đi, không bị crash, các trường còn lại vẫn hiển thị bình thường.',
    dialog_id: null, error_case_id: null, transition: null, expected_evidence: null,
    execution: exec()
  },

  // ─── F-008 Cập nhật trạng thái xử lý ───────────────────────────
  {
    tc_id: 'TC-019', id: 'TC-019',
    name: 'Cập nhật trạng thái "Đang xử lý" (status=2)',
    feature_id: 'F-008', feature_module: 'M2',
    source: 'generate-docs/fallback-synthesized',
    role: ROLE, priority: 'Rất cao', labels: [],
    design_technique: 'Use Case Testing',
    preconditions: 'Nhân viên đang xem chi tiết nhiệm vụ có trạng thái "Đã nhận" (status=1).',
    data_set: null,
    steps: [
      s(1, 'Nhấn nút "Bắt đầu xử lý" hoặc đổi trạng thái thành Đang xử lý', 'Hiển thị xác nhận hoặc tự động cập nhật'),
      s(2, 'Xác nhận', 'Ứng dụng gửi PATCH /tasks/:id/status lên server'),
      s(3, 'Chờ phản hồi', 'Server trả về 200 OK'),
      s(4, 'Màn hình cập nhật', 'Trạng thái chuyển thành "Đang xử lý" (status=2), thời gian bắt đầu ghi lại')
    ],
    expected_overall: 'Trạng thái nhiệm vụ được cập nhật lên server thành công, hiển thị đúng trên ứng dụng.',
    dialog_id: null, error_case_id: null, transition: null, expected_evidence: null,
    execution: exec()
  },
  {
    tc_id: 'TC-020', id: 'TC-020',
    name: 'Cập nhật trạng thái "Hoàn thành" (status=3)',
    feature_id: 'F-008', feature_module: 'M2',
    source: 'generate-docs/fallback-synthesized',
    role: ROLE, priority: 'Rất cao', labels: [],
    design_technique: 'Use Case Testing',
    preconditions: 'Nhân viên đang xử lý nhiệm vụ (status=2).',
    data_set: null,
    steps: [
      s(1, 'Nhấn nút "Hoàn thành" hoặc đổi trạng thái thành Hoàn thành', 'Hiển thị xác nhận'),
      s(2, 'Xác nhận hoàn thành', 'Ứng dụng gửi PATCH /tasks/:id/status'),
      s(3, 'Chờ phản hồi', 'Server trả về 200 OK'),
      s(4, 'Màn hình cập nhật', 'Trạng thái "Hoàn thành" (status=3), nhiệm vụ chuyển sang nhóm đã xong')
    ],
    expected_overall: 'Nhiệm vụ được đánh dấu hoàn thành trên cả ứng dụng lẫn server, TMC có thể thấy cập nhật.',
    dialog_id: null, error_case_id: null, transition: null, expected_evidence: null,
    execution: exec()
  },
  {
    tc_id: 'TC-021', id: 'TC-021',
    name: 'Cập nhật trạng thái thất bại do mất mạng',
    feature_id: 'F-008', feature_module: 'M2',
    source: 'generate-docs/fallback-synthesized',
    role: ROLE, priority: 'Cao', labels: [],
    design_technique: 'Error Guessing',
    preconditions: 'Nhân viên đang xử lý nhiệm vụ, sau đó mất kết nối internet.',
    data_set: null,
    steps: [
      s(1, 'Nhấn nút cập nhật trạng thái khi không có mạng', 'Ứng dụng thử gửi yêu cầu'),
      s(2, 'Chờ phản hồi', 'Yêu cầu thất bại do timeout hoặc lỗi mạng')
    ],
    expected_overall: 'Hiển thị thông báo lỗi "Không thể cập nhật - mất kết nối", trạng thái trên ứng dụng không thay đổi (rollback UI), có tùy chọn thử lại.',
    dialog_id: null, error_case_id: null, transition: null, expected_evidence: null,
    execution: exec()
  },
  {
    tc_id: 'TC-022', id: 'TC-022',
    name: 'Lịch sử trạng thái hiển thị theo thứ tự thời gian',
    feature_id: 'F-008', feature_module: 'M2',
    source: 'generate-docs/fallback-synthesized',
    role: ROLE, priority: 'Trung bình', labels: [],
    design_technique: 'Use Case Testing',
    preconditions: 'Nhiệm vụ đã được cập nhật trạng thái nhiều lần.',
    data_set: null,
    steps: [
      s(1, 'Mở chi tiết nhiệm vụ đã có nhiều lần thay đổi trạng thái', 'Màn hình chi tiết hiển thị'),
      s(2, 'Xem phần lịch sử trạng thái', 'Hiển thị chuỗi trạng thái theo thứ tự: Đã nhận → Đang xử lý → Hoàn thành')
    ],
    expected_overall: 'Lịch sử trạng thái hiển thị đúng thứ tự, có timestamp cho mỗi bước thay đổi.',
    dialog_id: null, error_case_id: null, transition: null, expected_evidence: null,
    execution: exec()
  },

  // ─── F-009 Gửi ảnh/video hiện trường ───────────────────────────
  {
    tc_id: 'TC-023', id: 'TC-023',
    name: 'Gửi ảnh hiện trường đính kèm vào nhiệm vụ',
    feature_id: 'F-009', feature_module: 'M2',
    source: 'generate-docs/fallback-synthesized',
    role: ROLE, priority: 'Cao', labels: [],
    design_technique: 'Use Case Testing',
    preconditions: 'Nhân viên đang trong nhiệm vụ status=2, thiết bị có camera, kết nối internet.',
    data_set: null,
    steps: [
      s(1, 'Từ chi tiết nhiệm vụ, nhấn nút "Thêm ảnh/video"', 'Mở tùy chọn: chụp ảnh hoặc chọn từ thư viện'),
      s(2, 'Chụp ảnh bằng camera', 'Camera mở, nhân viên chụp ảnh hiện trường'),
      s(3, 'Xác nhận ảnh đã chụp', 'Preview ảnh hiện ra'),
      s(4, 'Nhấn Gửi / Upload', 'Ứng dụng gửi POST /tasks/:id/media lên server'),
      s(5, 'Chờ kết quả', 'Server trả về URL của ảnh đã upload')
    ],
    expected_overall: 'Ảnh được upload thành công, hiển thị thumbnail trong danh sách media của nhiệm vụ.',
    dialog_id: null, error_case_id: null, transition: null, expected_evidence: null,
    execution: exec()
  },
  {
    tc_id: 'TC-024', id: 'TC-024',
    name: 'Tệp upload quá lớn bị từ chối',
    feature_id: 'F-009', feature_module: 'M2',
    source: 'generate-docs/fallback-synthesized',
    role: ROLE, priority: 'Trung bình', labels: [],
    design_technique: 'Boundary Value Analysis',
    preconditions: 'Nhân viên có tệp ảnh/video quá lớn (ví dụ: video > 100MB).',
    data_set: null,
    steps: [
      s(1, 'Chọn tệp quá lớn để upload', 'Ứng dụng kiểm tra kích thước tệp'),
      s(2, 'Chờ phản hồi', 'Hệ thống phát hiện tệp vượt giới hạn')
    ],
    expected_overall: 'Hiển thị thông báo "Tệp quá lớn, vui lòng chọn tệp nhỏ hơn [X]MB", upload không được thực hiện.',
    dialog_id: null, error_case_id: null, transition: null, expected_evidence: null,
    execution: exec()
  },
  {
    tc_id: 'TC-025', id: 'TC-025',
    name: 'Upload thất bại do mất mạng, thử lại thành công',
    feature_id: 'F-009', feature_module: 'M2',
    source: 'generate-docs/fallback-synthesized',
    role: ROLE, priority: 'Cao', labels: [],
    design_technique: 'Error Guessing',
    preconditions: 'Nhân viên đang upload ảnh, mất kết nối internet giữa chừng.',
    data_set: null,
    steps: [
      s(1, 'Bắt đầu upload ảnh, mất mạng giữa chừng', 'Upload thất bại'),
      s(2, 'Thông báo lỗi xuất hiện', 'Hiển thị tùy chọn "Thử lại"'),
      s(3, 'Kết nối mạng được phục hồi, nhấn "Thử lại"', 'Ứng dụng thử upload lại'),
      s(4, 'Chờ kết quả', 'Upload thành công')
    ],
    expected_overall: 'Cơ chế retry hoạt động, ảnh được upload thành công sau khi có mạng trở lại.',
    dialog_id: null, error_case_id: null, transition: null, expected_evidence: null,
    execution: exec()
  },

  // ─── F-010 Xem bản đồ vị trí sự cố ────────────────────────────
  {
    tc_id: 'TC-026', id: 'TC-026',
    name: 'Xem bản đồ vị trí sự cố trên nhiệm vụ',
    feature_id: 'F-010', feature_module: 'M2',
    source: 'generate-docs/fallback-synthesized',
    role: ROLE, priority: 'Trung bình', labels: [],
    design_technique: 'Use Case Testing',
    preconditions: 'Nhân viên đang xem chi tiết nhiệm vụ có tọa độ GPS hợp lệ.',
    data_set: null,
    steps: [
      s(1, 'Mở chi tiết nhiệm vụ có tọa độ GPS', 'Màn hình chi tiết hiển thị'),
      s(2, 'Vào phần bản đồ/vị trí', 'Bản đồ hiển thị điểm đánh dấu vị trí sự cố'),
      s(3, 'Phóng to/thu nhỏ bản đồ', 'Bản đồ có thể zoom in/out'),
      s(4, 'So sánh vị trí hiện tại với vị trí sự cố', 'Có thể thấy đường đi đến vị trí sự cố')
    ],
    expected_overall: 'Bản đồ hiển thị đúng vị trí sự cố, có thể tương tác (zoom), giúp nhân viên định hướng đến hiện trường.',
    dialog_id: null, error_case_id: null, transition: null, expected_evidence: null,
    execution: exec()
  },

  // ─── F-011 Xem thông báo sự cố ─────────────────────────────────
  {
    tc_id: 'TC-027', id: 'TC-027',
    name: 'Xem danh sách thông báo sự cố chưa đọc',
    feature_id: 'F-011', feature_module: 'M3',
    source: 'generate-docs/fallback-synthesized',
    role: ROLE, priority: 'Cao', labels: [],
    design_technique: 'Use Case Testing',
    preconditions: 'Nhân viên đã đăng nhập, có ít nhất 1 thông báo chưa đọc trong hệ thống.',
    data_set: null,
    steps: [
      s(1, 'Vào màn hình Thông báo / icon chuông', 'Màn hình danh sách thông báo hiển thị'),
      s(2, 'Xem danh sách', 'Thông báo chưa đọc được nổi bật (bold/chấm đỏ), có nhãn badge số lượng chưa đọc'),
      s(3, 'Nhấn vào một thông báo', 'Xem nội dung chi tiết thông báo')
    ],
    expected_overall: 'Danh sách thông báo hiển thị đúng, phân biệt rõ chưa đọc/đã đọc, nhãn badge cập nhật đúng.',
    dialog_id: null, error_case_id: null, transition: null, expected_evidence: null,
    execution: exec()
  },
  {
    tc_id: 'TC-028', id: 'TC-028',
    name: 'Đánh dấu thông báo là đã đọc',
    feature_id: 'F-011', feature_module: 'M3',
    source: 'generate-docs/fallback-synthesized',
    role: ROLE, priority: 'Trung bình', labels: [],
    design_technique: 'Use Case Testing',
    preconditions: 'Nhân viên đang xem danh sách thông báo, có thông báo chưa đọc.',
    data_set: null,
    steps: [
      s(1, 'Mở thông báo chưa đọc', 'Thông báo mở ra, được đánh dấu là đã đọc (PUT /notifications/:id/read)'),
      s(2, 'Quay lại danh sách', 'Số badge giảm đi 1'),
      s(3, 'Kiểm tra trạng thái', 'Thông báo vừa mở không còn highlight "chưa đọc"')
    ],
    expected_overall: 'Thông báo được đánh dấu đã đọc, badge đếm giảm đúng, trạng thái đồng bộ lên server.',
    dialog_id: null, error_case_id: null, transition: null, expected_evidence: null,
    execution: exec()
  },

  // ─── F-012 Badge đếm thông báo ─────────────────────────────────
  {
    tc_id: 'TC-029', id: 'TC-029',
    name: 'Badge đếm thông báo cập nhật đúng khi nhận thông báo mới',
    feature_id: 'F-012', feature_module: 'M3',
    source: 'generate-docs/fallback-synthesized',
    role: ROLE, priority: 'Trung bình', labels: [],
    design_technique: 'Use Case Testing',
    preconditions: 'Nhân viên đã đăng nhập, ứng dụng đang chạy (foreground hoặc background).',
    data_set: null,
    steps: [
      s(1, 'Ứng dụng ở trạng thái bình thường, badge = 0', 'Badge trên icon thông báo = 0 hoặc ẩn'),
      s(2, 'TMC gửi thông báo mới đến nhân viên', 'FCM/APNs gửi push notification'),
      s(3, 'Nhận notification trên thiết bị', 'Badge tăng lên 1 (hiển thị số 1 trên icon)'),
      s(4, 'Mở thông báo, đọc thông báo', 'Badge giảm về 0 sau khi đọc')
    ],
    expected_overall: 'Badge đếm chính xác số thông báo chưa đọc, tăng khi nhận mới, giảm khi đọc.',
    dialog_id: null, error_case_id: null, transition: null, expected_evidence: null,
    execution: exec()
  },

  // ─── F-013 Quản lý thiết bị token ──────────────────────────────
  {
    tc_id: 'TC-030', id: 'TC-030',
    name: 'Đăng ký device token khi cài đặt lần đầu',
    feature_id: 'F-013', feature_module: 'M3',
    source: 'generate-docs/fallback-synthesized',
    role: ROLE, priority: 'Cao', labels: [],
    design_technique: 'Use Case Testing',
    preconditions: 'Người dùng cài đặt ứng dụng lần đầu, chưa đăng nhập.',
    data_set: null,
    steps: [
      s(1, 'Mở ứng dụng lần đầu sau khi cài đặt', 'Ứng dụng yêu cầu quyền gửi thông báo (iOS) hoặc tự động (Android)'),
      s(2, 'Chấp nhận quyền thông báo (iOS)', 'Hệ thống cấp phép'),
      s(3, 'Đăng nhập thành công', 'Ứng dụng lấy FCM/APNs device token'),
      s(4, 'Gửi token lên server', 'PATCH /users/:id/device-token được gọi với token mới')
    ],
    expected_overall: 'Device token được đăng ký thành công, nhân viên có thể nhận push notification từ lúc này.',
    dialog_id: null, error_case_id: null, transition: null, expected_evidence: null,
    execution: exec()
  }
];

const api = [
  {
    tc_id: 'TC-API-001', id: 'TC-API-001',
    name: '[GET /api/tasks] Lấy danh sách nhiệm vụ của nhân viên — trả về 200',
    feature_id: 'F-006', feature_module: 'M2',
    source: 'generate-docs/fallback-synthesized',
    role: ROLE, priority: 'Rất cao', labels: ['api', 'backend'],
    design_technique: 'Use Case Testing',
    preconditions: 'Nhân viên đã đăng nhập, JWT hợp lệ. Có ít nhất 1 nhiệm vụ trong DB.',
    data_set: 'Authorization: Bearer <JWT-hợp-lệ>',
    steps: [
      s(1, 'Gửi GET /api/tasks với header Authorization: Bearer <JWT>', 'Server nhận yêu cầu HTTP'),
      s(2, 'Server truy vấn DB lấy danh sách nhiệm vụ của nhân viên', 'Truy vấn thành công'),
      s(3, 'Kiểm tra HTTP status code của response', 'Status code là 200 OK'),
      s(4, 'Kiểm tra body response', 'Body chứa mảng tasks[], mỗi item có: id, title, status, created_at, location')
    ],
    expected_overall: 'Status 200 OK, response body là JSON chứa { tasks: [...], total: N }. Mỗi task item có đủ các trường cơ bản.',
    dialog_id: null, error_case_id: null, transition: null, expected_evidence: null,
    execution: exec()
  },
  {
    tc_id: 'TC-API-002', id: 'TC-API-002',
    name: '[GET /api/tasks/:id] Lấy chi tiết nhiệm vụ theo ID hợp lệ — trả về 200',
    feature_id: 'F-007', feature_module: 'M2',
    source: 'generate-docs/fallback-synthesized',
    role: ROLE, priority: 'Cao', labels: ['api', 'backend'],
    design_technique: 'Equivalence Partitioning',
    preconditions: 'Nhân viên đã đăng nhập, JWT hợp lệ. Nhiệm vụ ID=123 tồn tại trong DB.',
    data_set: 'Authorization: Bearer <JWT>; task_id=123',
    steps: [
      s(1, 'Gửi GET /api/tasks/123 với header Authorization hợp lệ', 'Server nhận yêu cầu'),
      s(2, 'Server tìm nhiệm vụ id=123 trong DB', 'Tìm thấy bản ghi'),
      s(3, 'Kiểm tra HTTP status code', 'Status 200 OK'),
      s(4, 'Kiểm tra body response chứa đầy đủ trường chi tiết', 'Body chứa: id, title, description, status, location, media[], history[]')
    ],
    expected_overall: 'Status 200, response là JSON object nhiệm vụ với đầy đủ trường chi tiết và lịch sử trạng thái.',
    dialog_id: null, error_case_id: null, transition: null, expected_evidence: null,
    execution: exec()
  },
  {
    tc_id: 'TC-API-003', id: 'TC-API-003',
    name: '[GET /api/tasks/:id] Nhiệm vụ không tồn tại — trả về 404',
    feature_id: 'F-007', feature_module: 'M2',
    source: 'generate-docs/fallback-synthesized',
    role: ROLE, priority: 'Trung bình', labels: ['api', 'backend', 'error-case'],
    design_technique: 'Equivalence Partitioning',
    preconditions: 'Nhân viên đã đăng nhập, JWT hợp lệ. ID=99999 KHÔNG tồn tại trong DB.',
    data_set: 'Authorization: Bearer <JWT>; task_id=99999',
    steps: [
      s(1, 'Gửi GET /api/tasks/99999 với JWT hợp lệ', 'Server nhận yêu cầu'),
      s(2, 'Server tìm ID 99999 trong DB, không tìm thấy', 'Server trả về lỗi not found'),
      s(3, 'Kiểm tra HTTP status code', 'Status 404 Not Found'),
      s(4, 'Kiểm tra body lỗi', 'Body chứa { error: "not_found", message: "..." }')
    ],
    expected_overall: 'Status 404 Not Found, body JSON chứa trường error và message giải thích nguyên nhân.',
    dialog_id: null, error_case_id: null, transition: null, expected_evidence: null,
    execution: exec()
  },
  {
    tc_id: 'TC-API-004', id: 'TC-API-004',
    name: '[PATCH /api/tasks/:id/status] Cập nhật trạng thái nhiệm vụ thành công — trả về 200',
    feature_id: 'F-008', feature_module: 'M2',
    source: 'generate-docs/fallback-synthesized',
    role: ROLE, priority: 'Rất cao', labels: ['api', 'backend'],
    design_technique: 'Use Case Testing',
    preconditions: 'Nhân viên đã đăng nhập, JWT hợp lệ. Nhiệm vụ ID=123 tồn tại với trạng thái hiện tại là 1 (Đã nhận).',
    data_set: 'Authorization: Bearer <JWT>; task_id=123; body: { "status": 2 }',
    steps: [
      s(1, 'Gửi PATCH /api/tasks/123/status với body {"status": 2} và JWT', 'Server nhận yêu cầu'),
      s(2, 'Server cập nhật DB, ghi nhận timestamp thay đổi', 'Cập nhật thành công'),
      s(3, 'Kiểm tra HTTP status code', 'Status 200 OK'),
      s(4, 'Kiểm tra body response', 'Body chứa: { id: 123, status: 2, updated_at: "<ISO-timestamp>" }')
    ],
    expected_overall: 'Status 200, response chứa thông tin nhiệm vụ đã cập nhật với status=2. DB được cập nhật chính xác.',
    dialog_id: null, error_case_id: null, transition: null, expected_evidence: null,
    execution: exec()
  },
  {
    tc_id: 'TC-API-005', id: 'TC-API-005',
    name: '[POST /api/tasks/:id/media] Upload ảnh hiện trường thành công — trả về 201',
    feature_id: 'F-009', feature_module: 'M2',
    source: 'generate-docs/fallback-synthesized',
    role: ROLE, priority: 'Cao', labels: ['api', 'backend', 'file-upload'],
    design_technique: 'Use Case Testing',
    preconditions: 'Nhân viên đã đăng nhập, JWT hợp lệ. Nhiệm vụ ID=123 tồn tại với status=2. Tệp ảnh JPEG kích thước hợp lệ (< 10MB).',
    data_set: 'Authorization: Bearer <JWT>; task_id=123; multipart file: image.jpg (2MB, JPEG)',
    steps: [
      s(1, 'Gửi POST /api/tasks/123/media với Content-Type: multipart/form-data, đính kèm image.jpg', 'Server nhận tệp upload'),
      s(2, 'Server lưu tệp vào storage, tạo bản ghi media trong DB', 'Xử lý thành công'),
      s(3, 'Kiểm tra HTTP status code', 'Status 201 Created'),
      s(4, 'Kiểm tra body response', 'Body chứa: { media_id, url, type: "image", created_at }')
    ],
    expected_overall: 'Status 201 Created, response chứa URL truy cập tệp. Tệp có thể tải về từ URL trong response.',
    dialog_id: null, error_case_id: null, transition: null, expected_evidence: null,
    execution: exec()
  },
  {
    tc_id: 'TC-API-006', id: 'TC-API-006',
    name: '[GET /api/notifications] Lấy danh sách thông báo — trả về 200',
    feature_id: 'F-011', feature_module: 'M3',
    source: 'generate-docs/fallback-synthesized',
    role: ROLE, priority: 'Cao', labels: ['api', 'backend'],
    design_technique: 'Use Case Testing',
    preconditions: 'Nhân viên đã đăng nhập, JWT hợp lệ. Có ít nhất 1 thông báo trong DB.',
    data_set: 'Authorization: Bearer <JWT>',
    steps: [
      s(1, 'Gửi GET /api/notifications với JWT hợp lệ', 'Server nhận yêu cầu'),
      s(2, 'Server lấy danh sách thông báo của nhân viên từ DB', 'Truy vấn thành công'),
      s(3, 'Kiểm tra HTTP status code', 'Status 200 OK'),
      s(4, 'Kiểm tra body response', 'Body chứa: { notifications: [...], unread_count: N }, mỗi item có: id, title, body, read, created_at')
    ],
    expected_overall: 'Status 200, response JSON chứa mảng notifications[] và số lượng chưa đọc (unread_count).',
    dialog_id: null, error_case_id: null, transition: null, expected_evidence: null,
    execution: exec()
  },
  {
    tc_id: 'TC-API-007', id: 'TC-API-007',
    name: '[PUT /api/notifications/:id/read] Đánh dấu thông báo đã đọc — trả về 200',
    feature_id: 'F-011', feature_module: 'M3',
    source: 'generate-docs/fallback-synthesized',
    role: ROLE, priority: 'Trung bình', labels: ['api', 'backend'],
    design_technique: 'Use Case Testing',
    preconditions: 'Nhân viên đã đăng nhập, JWT hợp lệ. Thông báo ID=456 tồn tại với trạng thái chưa đọc (read=false).',
    data_set: 'Authorization: Bearer <JWT>; notification_id=456',
    steps: [
      s(1, 'Gửi PUT /api/notifications/456/read với JWT hợp lệ', 'Server nhận yêu cầu'),
      s(2, 'Server cập nhật DB: read=true, ghi read_at', 'Cập nhật thành công'),
      s(3, 'Kiểm tra HTTP status code', 'Status 200 OK'),
      s(4, 'Kiểm tra body response', 'Body chứa: { id: 456, read: true, read_at: "<ISO-timestamp>" }')
    ],
    expected_overall: 'Status 200, thông báo được đánh dấu đã đọc. DB phản ánh trạng thái mới chính xác.',
    dialog_id: null, error_case_id: null, transition: null, expected_evidence: null,
    execution: exec()
  }
];

data.test_cases = { ui, api };

fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), 'utf8');
console.log('Done. UI:', ui.length, '| API:', api.length);
