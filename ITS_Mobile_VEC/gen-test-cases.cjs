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

function tc(id, name, feature_id, feature_module, priority, design_technique, preconditions, steps, expected_overall) {
  return {
    id,
    name,
    feature_id,
    feature_module,
    source: 'generate-docs/fallback-synthesized',
    role: ROLE,
    priority,
    labels: [],
    design_technique,
    preconditions,
    data_set: null,
    steps,
    expected_overall,
    dialog_id: null,
    error_case_id: null,
    transition: null,
    expected_evidence: null,
    execution: makeExecution()
  };
}

function step(no, action, expected) {
  return { no, action, expected };
}

const uiCases = [
  // F-001 Dang nhap
  tc('TC-001', 'Dang nhap thanh cong voi extension va mat khau hop le', 'F-001', 'M1',
    'Rat cao', 'Equivalence Partitioning',
    'Ung dung da cai dat, thiet bi co ket noi internet, tai khoan nhan vien ton tai trong he thong',
    [
      step(1, 'Mo ung dung ITS Mobile VEC', 'Man hinh dang nhap hien thi voi 2 truong nhap: Extension va Password'),
      step(2, 'Nhap extension hop le (vi du: 1001)', 'Truong Extension nhan gia tri'),
      step(3, 'Nhap mat khau dung', 'Mat khau hien thi dang che (****)'),
      step(4, 'Nhan nut Dang nhap', 'Ung dung gui yeu cau xac thuc, hien thi loading'),
      step(5, 'Doi ket qua', 'Chuyen sang man hinh chinh (Dashboard), hien thi ten nhan vien va trang thai san sang')
    ],
    'Nhan vien dang nhap thanh cong, session duoc tao, JWT luu vao storage'
  ),

  tc('TC-002', 'Dang nhap that bai khi extension khong ton tai', 'F-001', 'M1',
    'Rat cao', 'Equivalence Partitioning',
    'Ung dung da cai dat, thiet bi co ket noi internet',
    [
      step(1, 'Mo ung dung, nhap extension khong ton tai (vi du: 9999)', 'Truong Extension nhan gia tri'),
      step(2, 'Nhap mat khau bat ky', 'Truong Password nhan gia tri'),
      step(3, 'Nhan nut Dang nhap', 'Ung dung gui yeu cau xac thuc')
    ],
    'Hien thi thong bao loi: "Sai thong tin dang nhap", khong chuyen man hinh, mat khau bi xoa'
  ),

  tc('TC-003', 'Dang nhap that bai khi mat khau sai', 'F-001', 'M1',
    'Cao', 'Equivalence Partitioning',
    'Ung dung da cai dat, tai khoan hop le ton tai trong he thong',
    [
      step(1, 'Mo ung dung, nhap extension hop le', 'Truong Extension nhan gia tri'),
      step(2, 'Nhap mat khau sai', 'Truong Password nhan gia tri (che)'),
      step(3, 'Nhan nut Dang nhap', 'Ung dung gui yeu cau xac thuc')
    ],
    'Hien thi thong bao loi xac thuc, nguoi dung o lai man hinh dang nhap'
  ),

  tc('TC-004', 'Dang nhap that bai khi de trong extension', 'F-001', 'M1',
    'Trung binh', 'Boundary Value Analysis',
    'Ung dung da cai dat',
    [
      step(1, 'Mo ung dung, bo trong truong Extension', 'Truong Extension rong'),
      step(2, 'Nhap mat khau bat ky', 'Truong Password nhan gia tri'),
      step(3, 'Nhan nut Dang nhap', 'Ung dung kiem tra validation')
    ],
    'Hien thi canh bao "Extension khong duoc de trong", nut Dang nhap bi vo hieu hoa hoac bao loi'
  ),

  tc('TC-005', 'Dang nhap khi khong co ket noi mang', 'F-001', 'M1',
    'Cao', 'Error Guessing',
    'Ung dung da cai dat, thiet bi TAT wi-fi va data di dong',
    [
      step(1, 'Mo ung dung, nhap extension va mat khau hop le', 'Man hinh dang nhap hien thi'),
      step(2, 'Nhan nut Dang nhap', 'Ung dung thu ket noi')
    ],
    'Hien thi thong bao "Khong co ket noi mang. Vui long kiem tra lai.", nguoi dung o lai man hinh dang nhap'
  ),

  // F-002 Dang xuat
  tc('TC-006', 'Dang xuat thanh cong tu menu', 'F-002', 'M1',
    'Cao', 'Use Case Testing',
    'Nhan vien da dang nhap thanh cong, dang o man hinh chinh',
    [
      step(1, 'Nhan vao menu/icon tai khoan hoac nut Dang xuat', 'Hien thi xac nhan dang xuat'),
      step(2, 'Xac nhan dang xuat', 'He thong xu ly dang xuat'),
      step(3, 'Doi ket qua', 'Chuyen ve man hinh dang nhap, JWT bi xoa khoi storage')
    ],
    'Nhan vien dang xuat thanh cong, phien lam viec ket thuc, chuyen ve man hinh dang nhap'
  ),

  tc('TC-007', 'Tat ung dung va mo lai kiem tra trang thai dang nhap', 'F-002', 'M1',
    'Trung binh', 'Use Case Testing',
    'Nhan vien da dang nhap, token con hieu luc',
    [
      step(1, 'Tat ung dung (background/foreground)', 'Ung dung dong'),
      step(2, 'Mo lai ung dung', 'Ung dung khoi dong'),
      step(3, 'Doi ket qua', 'Kiem tra trang thai')
    ],
    'Neu token con hieu luc: tu dong chuyen sang man hinh chinh. Neu token het han: hien thi man hinh dang nhap'
  ),

  // F-003 Goi VoIP noi bo
  tc('TC-008', 'Goi VoIP noi bo thanh cong den extension khac', 'F-003', 'M1',
    'Rat cao', 'Use Case Testing',
    'Nhan vien da dang nhap, ket noi VoIP den tong dai PBX thanh cong, thiet bi co micro va loa',
    [
      step(1, 'Truong danh ba noi bo, chon mot extension de goi', 'Hien thi thong tin extension dich'),
      step(2, 'Nhan nut Goi', 'He thong SIP thiet lap phien goi, hien thi man hinh cuoc goi'),
      step(3, 'Doi nguoi nhan nhac may', 'Ket noi duoc thiet lap, hien thi "Dang goi"'),
      step(4, 'Noi chuyen binh thuong', 'Am thanh truyen theo 2 chieu ro rang'),
      step(5, 'Nhan nut Ket thuc goi', 'SIP BYE duoc gui, ket noi dong lai'),
      step(6, 'Doi man hinh', 'Tro ve man hinh truoc do, hien thi lich su cuoc goi')
    ],
    'Cuoc goi VoIP noi bo thanh cong, am thanh ro rang, ket noi dong sau khi hang may'
  ),

  tc('TC-009', 'Cuoc goi bi tu choi (extension dich ban)', 'F-003', 'M1',
    'Cao', 'Error Guessing',
    'Nhan vien da dang nhap, ket noi VoIP hoat dong, extension dich dang trong cuoc goi khac',
    [
      step(1, 'Chon extension dich dang ban, nhan nut Goi', 'He thong gui yeu cau goi'),
      step(2, 'Doi ket qua', 'Nhan tin hieu "Busy" tu tong dai')
    ],
    'Hien thi thong bao "May ban - Tu choi cuoc goi", tro ve man hinh cuoc goi sau 3 giay'
  ),

  tc('TC-010', 'Mat ket noi VoIP trong khi goi', 'F-003', 'M1',
    'Cao', 'Error Guessing',
    'Dang trong cuoc goi VoIP, sau do mat ket noi mang',
    [
      step(1, 'Tat wi-fi/data trong khi dang co cuoc goi', 'Mang bi mat'),
      step(2, 'Doi ket qua', 'He thong phat hien mat ket noi SIP')
    ],
    'Cuoc goi tu dong ket thuc, hien thi thong bao "Mat ket noi - Cuoc goi bi gian doan", SIP re-register khi co mang tro lai'
  ),

  // F-004 Xem danh ba noi bo
  tc('TC-011', 'Xem danh sach toan bo danh ba noi bo', 'F-004', 'M1',
    'Cao', 'Use Case Testing',
    'Nhan vien da dang nhap thanh cong, du lieu danh ba da duoc dong bo tu server',
    [
      step(1, 'Truong menu Danh ba hoac Lien he', 'Hien thi man hinh danh ba'),
      step(2, 'Xem danh sach', 'Hien thi danh sach nhan vien/phong ban voi ten, extension, trang thai')
    ],
    'Danh sach danh ba hien thi day du cac extension noi bo, co chi bao trang thai (san sang/ban/khong co mat)'
  ),

  tc('TC-012', 'Tim kiem nhanh trong danh ba', 'F-004', 'M1',
    'Trung binh', 'Use Case Testing',
    'Nhan vien da dang nhap, danh ba da tai',
    [
      step(1, 'O man hinh danh ba, nhap tu khoa vao o tim kiem', 'O tim kiem nhan gia tri'),
      step(2, 'Nhap ten hoac extension (vi du: "1002")', 'Danh sach loc theo tu khoa'),
      step(3, 'Xem ket qua', 'Chi hien thi cac muc khop voi tu khoa')
    ],
    'Tim kiem hoat dong dung, loc danh sach theo ten hoac so extension'
  ),

  tc('TC-013', 'Danh ba hien thi khi khong co du lieu', 'F-004', 'M1',
    'Thap', 'Error Guessing',
    'Nhan vien da dang nhap, nhung server tra ve danh sach rong',
    [
      step(1, 'Truong man hinh Danh ba khi server tra ve danh sach rong', 'Ung dung xu ly phan hoi')
    ],
    'Hien thi thong bao "Chua co du lieu danh ba" hoac icon phu hop, khong bi crash'
  ),

  // F-005 Nut SOS khan cap
  tc('TC-014', 'Nhan nut SOS de goi khan cap', 'F-005', 'M1',
    'Rat cao', 'Use Case Testing',
    'Nhan vien dang su dung ung dung (bat ky man hinh nao), thiet bi co soc luong pin va ket noi GSM',
    [
      step(1, 'Nhin thay nut SOS tren man hinh hien tai', 'Nut SOS hien thi ro rang (khong bi che khuat)'),
      step(2, 'Nhan giu nut SOS (de tranh goi nham)', 'Hien thi xac nhan hoac dem nguoc'),
      step(3, 'Xac nhan goi khan cap', 'He thong khoi tao cuoc goi GSM den so khan cap dinh san')
    ],
    'Cuoc goi GSM den trung tam khan cap duoc thiet lap, hoat dong ngay ca khi khong co internet (chi can song GSM)'
  ),

  // F-006 Nhan va xem danh sach nhiem vu
  tc('TC-015', 'Nhan push notification nhiem vu moi tu TMC', 'F-006', 'M2',
    'Rat cao', 'Use Case Testing',
    'Nhan vien da dang nhap, FCM/APNs da duoc dang ky, TMC phat nhiem vu moi',
    [
      step(1, 'Nhan vien dang o bat ky man hinh nao khi TMC phat nhiem vu', 'FCM/APNs gui push notification'),
      step(2, 'Thong bao xuat hien tren thiet bi', 'Notification hien thi tieu de va mo ta ngan'),
      step(3, 'Nhan vao thong bao', 'Ung dung mo ra hoac foreground'),
      step(4, 'Man hinh nhiem vu hien ra', 'Nhiem vu moi xuat hien trong danh sach voi trang thai "Da nhan" (status=1)')
    ],
    'Nhan vien nhan duoc push notification va nhiem vu xuat hien trong app'
  ),

  tc('TC-016', 'Xem danh sach nhiem vu duoc giao', 'F-006', 'M2',
    'Rat cao', 'Use Case Testing',
    'Nhan vien da dang nhap, co it nhat 1 nhiem vu trong he thong',
    [
      step(1, 'Truong menu Nhiem vu / Cong viec', 'Man hinh danh sach nhiem vu hien thi'),
      step(2, 'Xem danh sach', 'Hien thi cac nhiem vu voi: ma nhiem vu, mo ta su co, vi tri, thoi gian, trang thai'),
      step(3, 'Keo xuong de lam moi (pull-to-refresh)', 'Dong bo du lieu moi tu server')
    ],
    'Danh sach nhiem vu hien thi dung, sap xep theo thoi gian, trang thai ro rang'
  ),

  // F-007 Xem chi tiet nhiem vu
  tc('TC-017', 'Xem chi tiet nhiem vu va cac truong thong tin', 'F-007', 'M2',
    'Cao', 'Use Case Testing',
    'Nhan vien da dang nhap, co it nhat 1 nhiem vu trong danh sach',
    [
      step(1, 'Tu danh sach nhiem vu, nhan vao mot nhiem vu', 'Chuyen sang man hinh chi tiet'),
      step(2, 'Xem cac truong thong tin', 'Hien thi: ma su co, mo ta, vi tri (km), loai su co, thoi gian giao, uu tien, lich su trang thai'),
      step(3, 'Xem ban do (neu co toa do)', 'Hien thi vi tri tren ban do hoac toa do GPS')
    ],
    'Toan bo thong tin chi tiet nhiem vu hien thi dung, khong bi thieu truong hay hien thi sai gia tri'
  ),

  tc('TC-018', 'Nhiem vu khong co toa do GPS hien thi dung', 'F-007', 'M2',
    'Trung binh', 'Error Guessing',
    'Nhiem vu ton tai nhung khong co truong toa do GPS',
    [
      step(1, 'Mo chi tiet nhiem vu khong co toa do', 'Man hinh chi tiet hien thi'),
      step(2, 'Kiem tra khu vuc ban do/vi tri', 'Phan ban do hoac vi tri xu ly an toan')
    ],
    'Phan ban do hien thi "Khong co toa do" hoac an di, khong bi crash, cac truong con lai van hien thi binh thuong'
  ),

  // F-008 Cap nhat trang thai xu ly
  tc('TC-019', 'Cap nhat trang thai "Dang xu ly" (status=2)', 'F-008', 'M2',
    'Rat cao', 'Use Case Testing',
    'Nhan vien dang xem chi tiet nhiem vu co trang thai "Da nhan" (status=1)',
    [
      step(1, 'Nhan nut "Bat dau xu ly" hoac doi trang thai thanh Dang xu ly', 'Hien thi xac nhan hoac tu dong cap nhat'),
      step(2, 'Xac nhan', 'Ung dung gui PATCH /tasks/:id/status len server'),
      step(3, 'Doi phan hoi', 'Server tra ve 200 OK'),
      step(4, 'Man hinh cap nhat', 'Trang thai chuyen thanh "Dang xu ly" (status=2), thoi gian bat dau ghi lai')
    ],
    'Trang thai nhiem vu duoc cap nhat len server thanh cong, hien thi dung tren ung dung'
  ),

  tc('TC-020', 'Cap nhat trang thai "Hoan thanh" (status=3)', 'F-008', 'M2',
    'Rat cao', 'Use Case Testing',
    'Nhan vien dang xu ly nhiem vu (status=2)',
    [
      step(1, 'Nhan nut "Hoan thanh" hoac doi trang thai thanh Hoan thanh', 'Hien thi xac nhan'),
      step(2, 'Xac nhan hoan thanh', 'Ung dung gui PATCH /tasks/:id/status'),
      step(3, 'Doi phan hoi', 'Server tra ve 200 OK'),
      step(4, 'Man hinh cap nhat', 'Trang thai "Hoan thanh" (status=3), nhiem vu chuyen sang nhom da xong')
    ],
    'Nhiem vu duoc danh dau hoan thanh tren ca ung dung lan server, TMC co the thay cap nhat'
  ),

  tc('TC-021', 'Cap nhat trang thai that bai do mat mang', 'F-008', 'M2',
    'Cao', 'Error Guessing',
    'Nhan vien dang xu ly nhiem vu, sau do mat ket noi internet',
    [
      step(1, 'Nhan nut cap nhat trang thai khi khong co mang', 'Ung dung thu gui yeu cau'),
      step(2, 'Doi phan hoi', 'Yeu cau that bai do timeout hoac loi mang')
    ],
    'Hien thi thong bao loi "Khong the cap nhat - mat ket noi", trang thai tren ung dung khong thay doi (rollback UI), co option thu lai'
  ),

  tc('TC-022', 'Lich su trang thai hien thi theo thu tu thoi gian', 'F-008', 'M2',
    'Trung binh', 'Use Case Testing',
    'Nhiem vu da duoc cap nhat trang thai nhieu lan',
    [
      step(1, 'Mo chi tiet nhiem vu da co nhieu lan thay doi trang thai', 'Man hinh chi tiet hien thi'),
      step(2, 'Xem phan lich su trang thai', 'Hien thi chuoi trang thai theo thu tu: Da nhan -> Dang xu ly -> Hoan thanh')
    ],
    'Lich su trang thai hien thi dung thu tu, co timestamp cho moi buoc thay doi'
  ),

  // F-009 Gui anh/video hien truong
  tc('TC-023', 'Gui anh hien truong dinh kem vao nhiem vu', 'F-009', 'M2',
    'Cao', 'Use Case Testing',
    'Nhan vien dang trong nhiem vu status=2, thiet bi co camera, ket noi internet',
    [
      step(1, 'Tu chi tiet nhiem vu, nhan nut "Them anh/video"', 'Mo tuy chon: chup anh hoac chon tu thu vien'),
      step(2, 'Chup anh bang camera', 'Camera mo, nhan vien chup anh hien truong'),
      step(3, 'Xac nhan anh da chup', 'Preview anh hien ra'),
      step(4, 'Nhan Gui / Upload', 'Ung dung gui POST /tasks/:id/media len server'),
      step(5, 'Doi ket qua', 'Server tra ve URL cua anh da upload')
    ],
    'Anh duoc upload thanh cong, hien thi thumbnail trong danh sach media cua nhiem vu'
  ),

  tc('TC-024', 'File upload qua lon (qua gioi han)', 'F-009', 'M2',
    'Trung binh', 'Boundary Value Analysis',
    'Nhan vien co file anh/video qua lon (vi du: video > 100MB)',
    [
      step(1, 'Chon file qua lon de upload', 'Ung dung kiem tra kich thuoc file'),
      step(2, 'Doi phan hoi', 'He thong phat hien file vuot gioi han')
    ],
    'Hien thi thong bao "File qua lon, vui long chon file nho hon [X]MB", upload khong duoc thuc hien'
  ),

  tc('TC-025', 'Upload that bai do mat mang, thu lai thanh cong', 'F-009', 'M2',
    'Cao', 'Error Guessing',
    'Nhan vien dang upload anh, mat ket noi internet giua chung',
    [
      step(1, 'Bat dau upload anh, mat mang giua chung', 'Upload that bai'),
      step(2, 'Thong bao loi xuat hien', 'Hien thi tuy chon "Thu lai"'),
      step(3, 'Ket noi mang duoc phuc hoi, nhan "Thu lai"', 'Ung dung thu upload lai'),
      step(4, 'Doi ket qua', 'Upload thanh cong')
    ],
    'Co che retry hoat dong, anh duoc upload thanh cong sau khi co mang tro lai'
  ),

  // F-010 Xem ban do vi tri su co
  tc('TC-026', 'Xem ban do vi tri su co tren nhiem vu', 'F-010', 'M2',
    'Trung binh', 'Use Case Testing',
    'Nhan vien dang xem chi tiet nhiem vu co toa do GPS hop le',
    [
      step(1, 'Mo chi tiet nhiem vu co toa do GPS', 'Man hinh chi tiet hien thi'),
      step(2, 'Truong phan ban do/vi tri', 'Ban do hien thi diem danh dau vi tri su co'),
      step(3, 'Phan phong to/thu nho ban do', 'Ban do co the zoom in/out'),
      step(4, 'So sanh vi tri hien tai voi vi tri su co', 'Co the thay duong di den vi tri su co')
    ],
    'Ban do hien thi dung vi tri su co, co the tuong tac (zoom), giup nhan vien dinh huong den hien truong'
  ),

  // F-011 Xem thong bao su co
  tc('TC-027', 'Xem danh sach thong bao su co chua doc', 'F-011', 'M3',
    'Cao', 'Use Case Testing',
    'Nhan vien da dang nhap, co it nhat 1 thong bao chua doc trong he thong',
    [
      step(1, 'Truong man hinh Thong bao / Bell icon', 'Man hinh danh sach thong bao hien thi'),
      step(2, 'Xem danh sach', 'Thong bao chua doc duoc noi bat (bold/dot do), co nhan bao so luong chua doc'),
      step(3, 'Nhan vao mot thong bao', 'Xem noi dung chi tiet thong bao')
    ],
    'Danh sach thong bao hien thi dung, phan biet ro chua doc/da doc, nhan bao so luong cap nhat'
  ),

  tc('TC-028', 'Danh dau thong bao la da doc', 'F-011', 'M3',
    'Trung binh', 'Use Case Testing',
    'Nhan vien dang xem danh sach thong bao, co thong bao chua doc',
    [
      step(1, 'Mo thong bao chua doc', 'Thong bao mo ra, duoc danh dau la da doc (PUT /notifications/:id/read)'),
      step(2, 'Quay lai danh sach', 'So badge giam di 1'),
      step(3, 'Kiem tra trang thai', 'Thong bao vua mo khong con highlight "chua doc"')
    ],
    'Thong bao duoc danh dau da doc, badge dem giam dung, trang thai dong bo len server'
  ),

  // F-012 Badge dem thong bao
  tc('TC-029', 'Badge dem thong bao cap nhat dung khi nhan thong bao moi', 'F-012', 'M3',
    'Trung binh', 'Use Case Testing',
    'Nhan vien da dang nhap, ung dung dang chay (foreground hoac background)',
    [
      step(1, 'Ung dung o trang thai binh thuong, badge = 0', 'Badge tren icon thong bao = 0 hoac an'),
      step(2, 'TMC gui thong bao moi den nhan vien', 'FCM/APNs gui push notification'),
      step(3, 'Nhan notification tren thiet bi', 'Badge tang len 1 (hien thi so 1 tren icon)'),
      step(4, 'Mo thong bao, doc thong bao', 'Badge giam ve 0 sau khi doc')
    ],
    'Badge dem chinh xac so thong bao chua doc, tang khi nhan moi, giam khi doc'
  ),

  // F-013 Quan ly thiet bi token
  tc('TC-030', 'Dang ky device token khi cai dat lan dau', 'F-013', 'M3',
    'Cao', 'Use Case Testing',
    'Nguoi dung cai dat ung dung lan dau, chua dang nhap',
    [
      step(1, 'Mo ung dung lan dau sau khi cai dat', 'Ung dung yeu cau quyen gui thong bao (iOS) hoac tu dong (Android)'),
      step(2, 'Chap nhan quyen thong bao (iOS)', 'He thong cap phep'),
      step(3, 'Dang nhap thanh cong', 'Ung dung lay FCM/APNs device token'),
      step(4, 'Gui token len server', 'PATCH /users/:id/device-token duoc goi voi token moi')
    ],
    'Device token duoc dang ky thanh cong, nhan vien co the nhan push notification tu luc nay'
  )
];

const apiCases = [
  {
    id: 'TC-API-001',
    name: 'GET /tasks tra ve danh sach nhiem vu cua nhan vien',
    endpoint: 'GET /api/tasks',
    method: 'GET',
    source: 'generate-docs/fallback-synthesized',
    priority: 'Rat cao',
    preconditions: 'Nhan vien da dang nhap, JWT hop le. Co it nhat 1 nhiem vu trong DB.',
    request: { headers: { Authorization: 'Bearer <JWT>' }, params: {}, body: null },
    expected_status: 200,
    expected_response_fields: ['tasks (array)', 'total', 'page'],
    steps: [
      step(1, 'Gui GET /api/tasks voi JWT hop le trong header', 'Server nhan yeu cau'),
      step(2, 'Server xu ly truy van DB', 'Lay danh sach nhiem vu cua nhan vien'),
      step(3, 'Kiem tra response', 'Status 200, body chua mang tasks[]')
    ],
    expected_overall: 'Status 200 OK, tra ve mang tasks[], moi item co: id, title, status, created_at, location',
    execution: makeExecution()
  },
  {
    id: 'TC-API-002',
    name: 'GET /tasks/:id tra ve chi tiet nhiem vu hop le',
    endpoint: 'GET /api/tasks/:id',
    method: 'GET',
    source: 'generate-docs/fallback-synthesized',
    priority: 'Cao',
    preconditions: 'Nhan vien da dang nhap, JWT hop le. Ton tai nhiem vu voi ID cu the.',
    request: { headers: { Authorization: 'Bearer <JWT>' }, params: { id: '123' }, body: null },
    expected_status: 200,
    expected_response_fields: ['id', 'title', 'description', 'status', 'location', 'media[]', 'history[]'],
    steps: [
      step(1, 'Gui GET /api/tasks/123 voi JWT hop le', 'Server nhan yeu cau'),
      step(2, 'Server tim nhiem vu id=123 trong DB', 'Tim thay ban ghi'),
      step(3, 'Kiem tra response', 'Status 200, body chua day du truong chi tiet')
    ],
    expected_overall: 'Status 200, tra ve object nhiem vu day du cac truong chi tiet va lich su trang thai',
    execution: makeExecution()
  },
  {
    id: 'TC-API-003',
    name: 'GET /tasks/:id tra ve 404 khi ID khong ton tai',
    endpoint: 'GET /api/tasks/:id',
    method: 'GET',
    source: 'generate-docs/fallback-synthesized',
    priority: 'Trung binh',
    preconditions: 'Nhan vien da dang nhap, JWT hop le. ID nhiem vu KHONG ton tai trong DB.',
    request: { headers: { Authorization: 'Bearer <JWT>' }, params: { id: '99999' }, body: null },
    expected_status: 404,
    expected_response_fields: ['error', 'message'],
    steps: [
      step(1, 'Gui GET /api/tasks/99999 voi JWT hop le', 'Server nhan yeu cau'),
      step(2, 'Server tim ID 99999, khong tim thay', 'Tra ve loi 404')
    ],
    expected_overall: 'Status 404 Not Found, body chua { error: "not_found", message: "Task not found" }',
    execution: makeExecution()
  },
  {
    id: 'TC-API-004',
    name: 'PATCH /tasks/:id/status cap nhat trang thai nhiem vu',
    endpoint: 'PATCH /api/tasks/:id/status',
    method: 'PATCH',
    source: 'generate-docs/fallback-synthesized',
    priority: 'Rat cao',
    preconditions: 'Nhan vien da dang nhap, JWT hop le. Nhiem vu ID ton tai, trang thai hien tai la 1 (Da nhan).',
    request: { headers: { Authorization: 'Bearer <JWT>', 'Content-Type': 'application/json' }, params: { id: '123' }, body: { status: 2 } },
    expected_status: 200,
    expected_response_fields: ['id', 'status', 'updated_at'],
    steps: [
      step(1, 'Gui PATCH /api/tasks/123/status voi body {"status": 2}', 'Server nhan yeu cau'),
      step(2, 'Server cap nhat DB, ghi nhan timestamp', 'Cap nhat thanh cong'),
      step(3, 'Kiem tra response', 'Status 200, tra ve thong tin nhiem vu voi status moi')
    ],
    expected_overall: 'Status 200, tra ve { id, status: 2, updated_at }, trang thai trong DB duoc cap nhat chinh xac',
    execution: makeExecution()
  },
  {
    id: 'TC-API-005',
    name: 'POST /tasks/:id/media upload media len nhiem vu',
    endpoint: 'POST /api/tasks/:id/media',
    method: 'POST',
    source: 'generate-docs/fallback-synthesized',
    priority: 'Cao',
    preconditions: 'Nhan vien da dang nhap, JWT hop le. Nhiem vu ID ton tai, trang thai 2 (Dang xu ly).',
    request: { headers: { Authorization: 'Bearer <JWT>', 'Content-Type': 'multipart/form-data' }, params: { id: '123' }, body: 'file: <image.jpg>' },
    expected_status: 201,
    expected_response_fields: ['media_id', 'url', 'type', 'created_at'],
    steps: [
      step(1, 'Gui POST /api/tasks/123/media voi file anh trong form-data', 'Server nhan file'),
      step(2, 'Server luu file vao storage, tao ban ghi media', 'Xu ly thanh cong'),
      step(3, 'Kiem tra response', 'Status 201, body chua URL de truy cap file')
    ],
    expected_overall: 'Status 201 Created, tra ve { media_id, url, type: "image", created_at }, file co the truy cap qua URL',
    execution: makeExecution()
  },
  {
    id: 'TC-API-006',
    name: 'GET /notifications tra ve danh sach thong bao',
    endpoint: 'GET /api/notifications',
    method: 'GET',
    source: 'generate-docs/fallback-synthesized',
    priority: 'Cao',
    preconditions: 'Nhan vien da dang nhap, JWT hop le. Co it nhat 1 thong bao trong DB.',
    request: { headers: { Authorization: 'Bearer <JWT>' }, params: {}, body: null },
    expected_status: 200,
    expected_response_fields: ['notifications (array)', 'unread_count'],
    steps: [
      step(1, 'Gui GET /api/notifications voi JWT hop le', 'Server nhan yeu cau'),
      step(2, 'Server lay danh sach thong bao cua nhan vien', 'Truy van DB'),
      step(3, 'Kiem tra response', 'Status 200, mang notifications[]')
    ],
    expected_overall: 'Status 200, tra ve { notifications: [...], unread_count: N }, moi item co: id, title, body, read, created_at',
    execution: makeExecution()
  },
  {
    id: 'TC-API-007',
    name: 'PUT /notifications/:id/read danh dau thong bao da doc',
    endpoint: 'PUT /api/notifications/:id/read',
    method: 'PUT',
    source: 'generate-docs/fallback-synthesized',
    priority: 'Trung binh',
    preconditions: 'Nhan vien da dang nhap, JWT hop le. Ton tai thong bao chua doc voi ID cu the.',
    request: { headers: { Authorization: 'Bearer <JWT>' }, params: { id: '456' }, body: null },
    expected_status: 200,
    expected_response_fields: ['id', 'read', 'read_at'],
    steps: [
      step(1, 'Gui PUT /api/notifications/456/read voi JWT hop le', 'Server nhan yeu cau'),
      step(2, 'Server cap nhat trang thai read=true, ghi read_at', 'Cap nhat DB'),
      step(3, 'Kiem tra response', 'Status 200, thong bao duoc danh dau da doc')
    ],
    expected_overall: 'Status 200, tra ve { id: 456, read: true, read_at: "<timestamp>" }, DB cap nhat chinh xac',
    execution: makeExecution()
  }
];

// Add test_cases block to content-data.json
data.test_cases = {
  ui: uiCases,
  api: apiCases
};

fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), 'utf8');

console.log('Done. UI test cases:', uiCases.length, '| API test cases:', apiCases.length);
console.log('content-data.json updated at:', DATA_PATH);
