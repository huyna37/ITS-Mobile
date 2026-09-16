# User Flows — ITSM-20260429-001 (M1)

**Output mode:** lean  
**Platform:** React Native (iOS + Android)

---

## Flow A — Login success

```mermaid
flowchart LR
  A[LoginView] -->|tap DANG NHAP valid| B{API success}
  B -->|JWT stored| C[CallsView default tab]
```

---

## Flow B — Login validation failure (inline)

```mermaid
flowchart LR
  A[LoginView] -->|tap DANG NHAP| B{client + server validation}
  B -->|missing/invalid/extension not 4 digits| C[Inline errors Vietnamese]
  C --> A
```

---

## Flow C — Session restore (bypass login)

```mermaid
flowchart TD
  S[App launch] --> R{Valid JWT in storage?}
  R -->|yes, not expired| C[CallsView]
  R -->|no or expired| L[LoginView]
```

---

## Flow D — VoIP call (directory)

```mermaid
stateDiagram-v2
  [*] --> Idle: CallsView directory
  Idle --> Ringing: tap call on contact
  Ringing --> Connected: callee answers
  Ringing --> Missed: timeout
  Connected --> Ended: hangup either side
  Missed --> [*]
  Ended --> [*]
```

---

## Flow E — CallsView: directory vs history

```mermaid
flowchart LR
  V[CallsView] --> T1[Tab: Danh ba]
  V --> T2[Tab: Lich su]
  T1 --> D[FlatList directory + presence]
  T2 --> H[FlatList local history]
```

---

## Flow F — SOS from any authenticated screen

```mermaid
flowchart TD
  X[Any authenticated screen incl. VoIP overlay] --> F[tap SOS FAB]
  F --> M[Modal confirm Vietnamese]
  M -->|Huy| X
  M -->|Xac nhan / Goi ngay| T[Linking tel: hotline]
  T --> SYS[Native GSM dialer]
```

---

## Flow G — Profile and logout

```mermaid
flowchart TD
  C[CallsView] -->|navigate| P[ProfileView]
  P -->|Dang xuat + confirm| Q[Clear JWT + history]
  Q --> L[LoginView stack reset]
  L -->|Android back| L
```

---

## ASCII — End-to-end (condensed)

```
[App cold start]
       |
       +-- valid session --> CallsView
       |
       +-- no/expired session --> LoginView --success--> CallsView

CallsView --tab--> Directory | Call history
CallsView --call icon--> Ringing --> Connected | Missed --> history row

Any screen (auth) --SOS FAB--> Confirm --> tel:

CallsView <---> ProfileView --logout confirm--> LoginView (stack reset, no back to authed)
```

---

## UX notes for diagram consumers

| Flow | AC refs |
|---|---|
| A, B | AC-001.1, AC-001.2 |
| C | AC-002.1, AC-002.2 |
| D | AC-004.1, AC-004.2, AC-006.1 |
| E | AC-005.1, AC-006.1 |
| F | AC-007.1, AC-007.2, AC-008.1 |
| G | AC-003.1, AC-003.2, AC-009.1 |
