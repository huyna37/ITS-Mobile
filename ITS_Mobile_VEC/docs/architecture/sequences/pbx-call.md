# Sequence Diagram — Cuộc gọi nội bộ PBX (VoIP Flow)

## Journey: Field Op thực hiện cuộc gọi VoIP qua PBX

```mermaid
sequenceDiagram
  participant FieldOp as Nhân viên hiện trường
  participant App as ITS Mobile VEC App (SIP Client)
  participant PBX as PBX / SIP Server
  participant Callee as Người nhận (TMC/đồng nghiệp)

  Note over App,PBX: [App startup — SIP registration]
  App->>PBX: SIP REGISTER (extension, credentials)
  PBX-->>App: 200 OK (registered, keep-alive every 30s)

  FieldOp->>App: Mở tab Liên lạc
  App->>PBX: GET /directory (hoặc SIP SUBSCRIBE presence)
  PBX-->>App: Danh bạ + online/offline status của từng extension
  App-->>FieldOp: Hiển thị danh bạ với badge online/offline

  FieldOp->>App: Tap nút gọi (icon Phone) bên cạnh contact
  App->>PBX: SIP INVITE (extension_nguoi_nhan, SDP offer)
  PBX->>Callee: SIP INVITE (forward to extension)
  Callee-->>PBX: 180 Ringing
  PBX-->>App: 180 Ringing
  App-->>FieldOp: UI "Đang gọi..." / ringing tone

  alt Callee answers
    Callee->>PBX: 200 OK (SDP answer)
    PBX-->>App: 200 OK
    App->>PBX: SIP ACK
    Note over App,Callee: RTP audio stream (VoIP active)
    App-->>FieldOp: UI "Đang kết nối"

    Note over FieldOp,Callee: [Conversation happens]

    FieldOp->>App: Kết thúc cuộc gọi
    App->>PBX: SIP BYE
    PBX->>Callee: SIP BYE
    App-->>FieldOp: Cập nhật lịch sử cuộc gọi (trạng thái: ended)

  else Callee does not answer
    PBX-->>App: 408 Timeout / 486 Busy
    App-->>FieldOp: Cập nhật lịch sử (trạng thái: missed)
  end
```

## Notes

- **NAT traversal:** Mobile networks require STUN/TURN server for ICE negotiation.
- **iOS background:** CallKit + PushKit required for incoming calls when app is backgrounded/killed.
- **Android background:** Foreground service required for SIP registration keep-alive.
- **Prototype status:** Mock only — `addMockCallHistory()` writes to localStorage; no real SIP connection.
