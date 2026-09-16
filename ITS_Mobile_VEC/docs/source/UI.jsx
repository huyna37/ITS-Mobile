/** @deprecated Wireframe gốc — bản chạy Vite: ../../src/App.jsx */
import React, { useState, useEffect } from 'react';
import { 
  Phone, 
  AlertCircle, 
  ClipboardList, 
  Bell, 
  User, 
  ChevronRight, 
  Camera, 
  MapPin, 
  Clock, 
  ShieldAlert, 
  PhoneCall,
  CheckCircle2,
  Image as ImageIcon,
  LogOut,
  Search,
  History,
  Navigation,
  Info,
  Construction,
  CloudRain
} from 'lucide-react';

const App = () => {
  // Application State
  const [activeTab, setActiveTab] = useState('tasks'); // tasks, calls, alerts, profile
  const [currentView, setCurrentView] = useState('list'); // list, detail, report
  const [selectedTask, setSelectedTask] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  const primaryColor = "#0097f0";

  // Mock Data: Tasks/Incidents (Nhiệm vụ được giao)
  const tasks = [
    {
      id: 'NB-2024-001',
      code: 'TASK-8821',
      type: 'Tai nạn giao thông',
      level: 'Nghiêm trọng',
      location: 'Km 24+500',
      direction: 'Hướng Lào Cai',
      time: '14:20 25/05',
      status: 1, // 1: Đã nhận, 2: Đang xử lý, 3: Hoàn thành
      description: 'Va chạm giữa 2 xe con, gây ùn tắc nhẹ lane ngoài.',
      script: 'Phân luồng từ xa, xe cứu hộ IC3 xuất phát.'
    },
    {
      id: 'NB-2024-002',
      code: 'TASK-8825',
      type: 'Xe hỏng hóc',
      level: 'Trung bình',
      location: 'Km 158+200',
      direction: 'Hướng Hà Nội',
      time: '15:10 25/05',
      status: 2,
      description: 'Xe tải nổ lốp, dừng tại làn khẩn cấp.',
      script: 'Hỗ trợ thay lốp hoặc kéo về trạm dừng nghỉ.'
    }
  ];

  // Mock Data: Events (Sự kiện trên tuyến - để theo dõi)
  const events = [
    {
      id: 'EV-001',
      title: 'Sơn kẻ đường định kỳ',
      location: 'Km 40 - Km 45',
      time: '08:00 - 17:00',
      icon: <Construction size={18} className="text-amber-500" />,
      tag: 'Bảo trì'
    },
    {
      id: 'EV-002',
      title: 'Mưa lớn, tầm nhìn hạn chế',
      location: 'Khu vực Yên Bái',
      time: 'Đang diễn ra',
      icon: <CloudRain size={18} className="text-blue-500" />,
      tag: 'Thời tiết'
    }
  ];

  // Helper: Status label & color
  const getStatusInfo = (status) => {
    switch(status) {
      case 1: return { label: 'Đã tiếp nhận', color: 'bg-amber-100 text-amber-700' };
      case 2: return { label: 'Đang xử lý', color: 'bg-blue-100 text-blue-700' };
      case 3: return { label: 'Hoàn thành', color: 'bg-green-100 text-green-700' };
      default: return { label: 'Chưa xử lý', color: 'bg-gray-100 text-gray-700' };
    }
  };

  // --- Views ---

  // 1. Login View
  const LoginView = () => (
    <div className="min-h-screen bg-white flex flex-col p-8 justify-center">
      <div className="flex flex-col items-center mb-12">
        <div className="w-24 h-24 rounded-3xl flex items-center justify-center text-white mb-4 shadow-xl" style={{ backgroundColor: primaryColor }}>
          <Navigation size={48} fill="white" />
        </div>
        <h1 className="text-2xl font-black tracking-tight uppercase" style={{ color: primaryColor }}>NB-LC Express</h1>
        <p className="text-gray-400 font-medium text-sm">Hệ thống điều hành ITS</p>
      </div>
      
      <div className="space-y-4">
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-500 uppercase ml-1">Tài khoản nội bộ</label>
          <input type="text" placeholder="Nhập username" className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-400" />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-500 uppercase ml-1">Extension PBX</label>
          <input type="text" placeholder="Ví dụ: 8011" className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-400" />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-500 uppercase ml-1">Mật khẩu</label>
          <input type="password" placeholder="••••••••" className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-400" />
        </div>
        <button 
          onClick={() => setIsLoggedIn(true)}
          className="w-full py-4 text-white font-bold rounded-2xl shadow-lg mt-4 transition-transform active:scale-95" 
          style={{ backgroundColor: primaryColor }}
        >
          ĐĂNG NHẬP
        </button>
      </div>
    </div>
  );

  // 2. Task List (Cập nhật có thêm Sự kiện trên tuyến)
  const TaskListView = () => (
    <div className="p-4 space-y-8 pb-32">
      {/* Phần Nhiệm vụ */}
      <div className="space-y-4">
        <div className="flex justify-between items-end px-1">
          <div>
            <h2 className="text-2xl font-black text-gray-800">Nhiệm vụ</h2>
            <p className="text-xs text-gray-400 font-medium">Hôm nay, 25 Tháng 05</p>
          </div>
          <div className="bg-blue-50 px-3 py-1 rounded-full text-[10px] font-bold text-blue-600 uppercase tracking-wider border border-blue-100">
            {tasks.length} Việc cần làm
          </div>
        </div>

        <div className="space-y-3">
          {tasks.map(task => (
            <div 
              key={task.id} 
              onClick={() => { setSelectedTask(task); setCurrentView('detail'); }}
              className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex items-start space-x-3 active:scale-[0.98] transition-transform"
            >
              <div className={`p-3 rounded-2xl ${task.level === 'Nghiêm trọng' ? 'bg-red-50 text-red-500' : 'bg-amber-50 text-amber-500'}`}>
                <AlertCircle size={24} />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">{task.code}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${getStatusInfo(task.status).color}`}>
                    {getStatusInfo(task.status).label}
                  </span>
                </div>
                <h3 className="font-bold text-gray-800 text-lg leading-tight mt-0.5">{task.type}</h3>
                <div className="flex items-center text-gray-500 text-xs mt-1 space-x-3">
                  <span className="flex items-center"><MapPin size={12} className="mr-1" /> {task.location}</span>
                  <span className="flex items-center"><Clock size={12} className="mr-1" /> {task.time}</span>
                </div>
              </div>
              <ChevronRight size={20} className="text-gray-300 self-center" />
            </div>
          ))}
        </div>
      </div>

      {/* Phần Sự kiện trên tuyến (MỚI BỔ SUNG) */}
      <div className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h2 className="text-xl font-black text-gray-800">Sự kiện trên tuyến</h2>
          <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-bold uppercase">Theo dõi</span>
        </div>
        
        <div className="grid grid-cols-1 gap-3">
          {events.map(event => (
            <div key={event.id} className="bg-white/60 backdrop-blur border border-gray-200/50 p-4 rounded-3xl flex items-center space-x-4">
               <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center shrink-0 border border-gray-50">
                  {event.icon}
               </div>
               <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-gray-800 truncate">{event.title}</h4>
                    <span className="text-[9px] font-black text-blue-500 uppercase tracking-tighter">{event.tag}</span>
                  </div>
                  <div className="flex items-center text-[11px] text-gray-500 mt-0.5 space-x-3">
                    <span className="flex items-center"><MapPin size={10} className="mr-1" /> {event.location}</span>
                    <span className="flex items-center"><Clock size={10} className="mr-1" /> {event.time}</span>
                  </div>
               </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // 3. Task Detail
  const TaskDetailView = ({ task }) => (
    <div className="flex flex-col h-full bg-white">
      <div className="p-4 flex items-center justify-between bg-white border-b sticky top-0 z-20">
        <button onClick={() => setCurrentView('list')} className="p-2 -ml-2"><ChevronRight size={24} className="rotate-180" /></button>
        <span className="font-bold text-gray-800">Chi tiết sự cố</span>
        <button className="p-2 -mr-2"><PhoneCall size={20} style={{ color: primaryColor }} /></button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-40">
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 space-y-4">
          <div className="flex justify-between items-center">
             <span className={`text-xs px-3 py-1 rounded-full font-bold ${task.level === 'Nghiêm trọng' ? 'bg-red-500 text-white' : 'bg-amber-500 text-white'}`}>
                {task.level}
             </span>
             <span className="text-xs text-gray-400 font-medium">Mã: {task.id}</span>
          </div>
          <h2 className="text-2xl font-black text-gray-800">{task.type}</h2>
          
          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-50">
            <div className="space-y-1">
              <p className="text-[10px] text-gray-400 font-bold uppercase">Vị trí</p>
              <p className="text-sm font-bold">{task.location}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-gray-400 font-bold uppercase">Hướng</p>
              <p className="text-sm font-bold">{task.direction}</p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-[10px] text-gray-400 font-bold uppercase">Mô tả hiện trường</p>
            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-xl">{task.description}</p>
          </div>

          <div className="space-y-2">
            <p className="text-[10px] text-gray-400 font-bold uppercase">Phương án xử lý (Script)</p>
            <p className="text-sm font-bold text-blue-700 bg-blue-50 p-3 rounded-xl">{task.script}</p>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-bold text-gray-800 ml-2">Cập nhật trạng thái</h3>
          <div className="grid grid-cols-3 gap-2">
             <button className={`p-3 rounded-2xl border text-xs font-bold transition-all ${task.status === 1 ? 'bg-amber-500 text-white border-amber-500' : 'bg-white text-gray-400 border-gray-100'}`}>Đã nhận (1)</button>
             <button className={`p-3 rounded-2xl border text-xs font-bold transition-all ${task.status === 2 ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-gray-400 border-gray-100'}`}>Đang xử lý (2)</button>
             <button className={`p-3 rounded-2xl border text-xs font-bold transition-all ${task.status === 3 ? 'bg-green-500 text-white border-green-500' : 'bg-white text-gray-400 border-gray-100'}`}>Hoàn thành (3)</button>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-bold text-gray-800 ml-2">Hình ảnh hiện trường</h3>
          <div className="grid grid-cols-3 gap-2">
            <button className="aspect-square bg-gray-100 rounded-2xl flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200">
              <Camera size={24} />
              <span className="text-[10px] mt-1">Chụp ảnh</span>
            </button>
          </div>
        </div>
      </div>
      
      <div className="p-4 bg-white border-t sticky bottom-0 z-20">
        <button className="w-full py-4 text-white font-bold rounded-2xl shadow-lg" style={{ backgroundColor: primaryColor }}>
          CẬP NHẬT KẾT QUẢ
        </button>
      </div>
    </div>
  );

  // 4. Phone/PBX View
  const CallsView = () => (
    <div className="p-4 space-y-6 pb-32">
      <h2 className="text-2xl font-black text-gray-800">Liên lạc PBX</h2>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center px-2">
          <h3 className="font-bold text-gray-800">Danh bạ nội bộ</h3>
          <button className="text-blue-500 text-sm font-bold">Xem tất cả</button>
        </div>
        <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
          {[
            { name: 'Trung tâm điều hành (TMC)', ext: '9901', online: true },
            { name: 'Đội tuần tra IC3', ext: '8021', online: true },
            { name: 'Trạm thu phí IC12', ext: '8501', online: false },
            { name: 'Hỗ trợ kỹ thuật ITS', ext: '8000', online: true },
          ].map((contact, i) => (
            <div key={i} className="p-4 flex items-center justify-between border-b border-gray-50 last:border-0 active:bg-gray-50">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400 font-bold relative">
                   {contact.name[0]}
                   {contact.online && <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>}
                </div>
                <div>
                  <p className="font-bold text-sm text-gray-800">{contact.name}</p>
                  <p className="text-xs text-gray-400">Extension: {contact.ext}</p>
                </div>
              </div>
              <button className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <Phone size={18} fill="currentColor" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // 5. Notifications View
  const NotificationsView = () => (
    <div className="p-4 space-y-4 pb-32">
      <h2 className="text-2xl font-black text-gray-800">Thông báo</h2>
      <div className="space-y-3">
        {[
          { title: 'Phân công nhiệm vụ mới', desc: 'Có sự cố Km 45+200 hướng Hà Nội', time: '10 phút trước', unread: true },
          { title: 'Cập nhật hệ thống', desc: 'Hệ thống Camera IC12 đã hoạt động trở lại', time: '2 giờ trước', unread: false },
        ].map((notif, i) => (
          <div key={i} className={`p-4 rounded-3xl border flex items-start space-x-3 ${notif.unread ? 'bg-blue-50 border-blue-100 shadow-sm' : 'bg-white border-gray-100'}`}>
             <div className={`p-2 rounded-xl ${notif.unread ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                <Bell size={20} />
             </div>
             <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-sm text-gray-800 leading-tight">{notif.title}</h4>
                  <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap">{notif.time}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">{notif.desc}</p>
             </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (!isLoggedIn) return <LoginView />;

  return (
    <div className="max-w-md mx-auto h-screen bg-gray-50 flex flex-col font-sans text-gray-900 relative overflow-hidden">
      {/* Dynamic Background Pattern */}
      <div className="absolute top-0 left-0 w-full h-80 opacity-10 pointer-events-none" style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, #00d2ff 100%)`, borderRadius: '0 0 100px 100px' }}></div>
      <div className="absolute top-10 right-[-50px] w-64 h-64 rounded-full blur-3xl opacity-10" style={{ backgroundColor: primaryColor }}></div>

      {/* Header */}
      {currentView === 'list' && (
        <header className="px-5 pt-8 pb-4 flex justify-between items-center z-10 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg border-2 border-white/30" style={{ backgroundColor: primaryColor }}>
              <Navigation size={26} fill="white" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tighter uppercase" style={{ color: primaryColor }}>NB-LC</h1>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Vận hành ITS</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-3 bg-white/80 backdrop-blur rounded-2xl shadow-sm text-gray-600">
              <Search size={20} />
            </button>
            <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-white shadow-sm">
              <div className="w-full h-full bg-blue-100 flex items-center justify-center font-bold text-blue-600 text-sm italic">OP1</div>
            </div>
          </div>
        </header>
      )}

      {/* Main Content Area */}
      <main className="flex-1 z-10 overflow-y-auto">
        {currentView === 'list' && (
          <>
            {activeTab === 'tasks' && <TaskListView />}
            {activeTab === 'calls' && <CallsView />}
            {activeTab === 'alerts' && <NotificationsView />}
            {activeTab === 'profile' && (
              <div className="p-4 space-y-6">
                <h2 className="text-2xl font-black text-gray-800">Cá nhân</h2>
                <div className="bg-white p-6 rounded-[40px] shadow-sm border border-gray-100 text-center">
                  <div className="w-24 h-24 rounded-[32px] bg-blue-50 mx-auto mb-4 flex items-center justify-center text-blue-500 font-black text-3xl">OP</div>
                  <h3 className="text-xl font-black text-gray-800">Nguyễn Văn Vận Hành</h3>
                  <p className="text-gray-400 text-sm font-medium">Nhân viên tuần tra hiện trường</p>
                  <div className="mt-6 pt-6 border-t border-gray-50 flex justify-around">
                    <div>
                      <p className="text-xs text-gray-400 font-bold uppercase">Extension</p>
                      <p className="text-lg font-black" style={{ color: primaryColor }}>8011</p>
                    </div>
                    <div className="w-px bg-gray-100"></div>
                    <div>
                      <p className="text-xs text-gray-400 font-bold uppercase">Đơn vị</p>
                      <p className="text-lg font-black text-gray-800">Đội số 2</p>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => setIsLoggedIn(false)}
                  className="w-full p-4 flex items-center justify-center space-x-3 text-red-500 font-bold bg-red-50 rounded-2xl"
                >
                  <LogOut size={20} />
                  <span>Đăng xuất hệ thống</span>
                </button>
              </div>
            )}
          </>
        )}
        {currentView === 'detail' && selectedTask && <TaskDetailView task={selectedTask} />}
      </main>

      {/* SOS Floating Action Button (Luôn hiển thị ở mọi màn hình bên trong App) */}
      <button className="absolute right-6 bottom-28 w-14 h-14 bg-red-600 text-white rounded-full flex items-center justify-center shadow-2xl z-50 border-4 border-white active:scale-90 transition-transform animate-bounce hover:animate-none">
        <PhoneCall size={24} />
      </button>

      {/* Navigation Bar */}
      {currentView === 'list' && (
        <nav className="shrink-0 bg-white/90 backdrop-blur-xl border-t border-gray-100 flex justify-around items-center px-4 py-4 z-40 shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.1)] rounded-t-[40px]">
          <button 
            onClick={() => setActiveTab('tasks')}
            className={`flex flex-col items-center space-y-1 transition-all ${activeTab === 'tasks' ? 'scale-110' : 'text-gray-300'}`}
          >
            <ClipboardList size={26} color={activeTab === 'tasks' ? primaryColor : 'currentColor'} />
            <span className={`text-[10px] font-black uppercase tracking-tighter ${activeTab === 'tasks' ? 'opacity-100 text-gray-800' : 'opacity-0'}`}>Công việc</span>
          </button>
          <button 
            onClick={() => setActiveTab('calls')}
            className={`flex flex-col items-center space-y-1 transition-all ${activeTab === 'calls' ? 'scale-110' : 'text-gray-300'}`}
          >
            <Phone size={26} color={activeTab === 'calls' ? primaryColor : 'currentColor'} />
            <span className={`text-[10px] font-black uppercase tracking-tighter ${activeTab === 'calls' ? 'opacity-100 text-gray-800' : 'opacity-0'}`}>Liên lạc</span>
          </button>
          <button 
            onClick={() => setActiveTab('alerts')}
            className={`flex flex-col items-center space-y-1 transition-all ${activeTab === 'alerts' ? 'scale-110' : 'text-gray-300'}`}
          >
            <div className="relative">
              <Bell size={26} color={activeTab === 'alerts' ? primaryColor : 'currentColor'} />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border border-white"></div>
            </div>
            <span className={`text-[10px] font-black uppercase tracking-tighter ${activeTab === 'alerts' ? 'opacity-100 text-gray-800' : 'opacity-0'}`}>Thông báo</span>
          </button>
          <button 
            onClick={() => setActiveTab('profile')}
            className={`flex flex-col items-center space-y-1 transition-all ${activeTab === 'profile' ? 'scale-110' : 'text-gray-300'}`}
          >
            <User size={26} color={activeTab === 'profile' ? primaryColor : 'currentColor'} />
            <span className={`text-[10px] font-black uppercase tracking-tighter ${activeTab === 'profile' ? 'opacity-100 text-gray-800' : 'opacity-0'}`}>Tôi</span>
          </button>
        </nav>
      )}
    </div>
  );
};

export default App;