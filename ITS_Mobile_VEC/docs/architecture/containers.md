# Container Diagram — ITS Mobile VEC

## C4 Level 2: Containers

```mermaid
C4Container
  title Container Diagram — ITS Mobile VEC

  Person(fieldOp, "Nhân viên hiện trường", "iOS/Android device")

  Container_Boundary(mobileApp, "ITS Mobile VEC App") {
    Container(reactApp, "React Native App", "React Native + TypeScript", "Giao diện người dùng. Quản lý trạng thái local, điều hướng, session.")
    ContainerDb(localStorage, "AsyncStorage", "Key-Value Store", "JWT session + call history (local, cleared on logout)")
    Container(sipClient, "SIP/VoIP Client", "SIP.js / react-native-voip", "Đăng ký SIP extension, thực hiện/nhận cuộc gọi VoIP")
    Container(pushHandler, "Push Notification Handler", "react-native-firebase + react-native-push-notification", "Nhận FCM/APNs, hiển thị, deep-link")
  }

  System_Ext(itsApi, "ITS REST API", "HTTPS/JSON — task CRUD, status update, media upload")
  System_Ext(pbxSip, "PBX SIP Server", "SIP/VoIP UDP/TCP — call routing, presence, directory")
  System_Ext(fcmApns, "FCM / APNs", "Push notification delivery")
  System_Ext(gsm, "GSM Network", "Emergency tel: call")

  Rel(fieldOp, reactApp, "Tương tác UI", "Touch")
  Rel(reactApp, localStorage, "Đọc/ghi session + lịch sử", "AsyncStorage API")
  Rel(reactApp, sipClient, "Khởi tạo cuộc gọi, xem danh bạ", "Internal SDK call")
  Rel(reactApp, pushHandler, "Hiển thị thông báo nhận được", "Event listener")
  Rel(reactApp, itsApi, "REST: task list, detail, status PATCH, media POST", "HTTPS REST (axios)")
  Rel(sipClient, pbxSip, "SIP REGISTER, INVITE, BYE", "SIP/VoIP")
  Rel(pushHandler, fcmApns, "Register device token", "FCM/APNs SDK")
  Rel(fcmApns, pushHandler, "Push notification payload", "FCM/APNs")
  Rel(reactApp, gsm, "tel: URI SOS call", "Native OS dialer")
```

## Container Responsibilities

| Container | Technology | Responsibility |
|---|---|---|
| React Native App | React Native + TypeScript | All screens, navigation (react-navigation), state management |
| AsyncStorage | @react-native-async-storage | Session persistence across app restarts |
| SIP/VoIP Client | SIP.js / react-native-sip | SIP registration, VoIP call lifecycle, NAT traversal |
| Push Handler | @react-native-firebase/messaging | Background/foreground push, deep linking |

## Deployment Notes

| Platform | Specific Requirements |
|---|---|
| iOS | CallKit (in-call UI), PushKit (VoIP background), APNs certificate (Dev + Prod) |
| Android | FCM foreground service, CALL_PHONE permission, microphone permission |
| Both | STUN/TURN server for SIP NAT traversal on mobile networks |
