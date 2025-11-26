# 🗺️ THE BIG PICTURE: DoctorsFlow (닥터스플로우) Strategic Roadmap

This document outlines the high-level vision, architecture, and flow of the **DoctorsFlow** platform. It connects the dots between Automation, Marketing, Korean Localization, and User Success.

---

## 🏗️ 1. The Core: Automation Engine (The Brain)
*Automating patient care journeys so doctors can focus on treatment.*

The system is built around **Workflows** that trigger based on patient events (Appointments, Surgery Dates).

### 🔄 The Automation Flow
```mermaid
graph TD
    A[Trigger Event] --> B{Workflow Engine}
    
    subgraph Triggers
    A1[Surgery Completed] --> A
    A2[New Appointment] --> A
    A3[External Webhook] --> A
    A4[Daily Cron Job] --> A
    end

    B --> C[Decision/Logic]
    C -->|If 1 Day Post-Op| D[Send Check-up Msg]
    C -->|If 3 Days Post-Op| E[Request Photo]
    C -->|If Birthday| F[Send Coupon]
    C -->|If No Show| G[Re-booking Campaign]

    subgraph Actions
    D --> H[Channel Selector]
    E --> H
    F --> H
    G --> H
    end
```

### 🛠️ Key Automation Features
- **Visual Builder**: n8n-style drag-and-drop interface for creating complex flows.
- **Smart Delays**: "Wait 3 days", "Wait until 10 AM next day".
- **Conditionals**: "If patient had LASIK" vs "If patient had LASEK".
- **Reliability**: Automatic retries for failed messages, detailed execution logs.

---

## 📢 2. Marketing & Communication (The Voice)
*Delivering the right message, at the right time, in the right channel.*

We focus on the **Korean Market** ecosystem, prioritizing KakaoTalk with SMS fallbacks.

### 📉 Smart Failover Strategy
```mermaid
sequenceDiagram
    participant System as DoctorsFlow
    participant Kakao as KakaoTalk API
    participant SMS as NHN Cloud SMS
    participant Patient as Patient Phone

    System->>Kakao: 1. Try sending AlimTalk
    alt Kakao Success
        Kakao->>Patient: Delivers Message
        Kakao-->>System: Success Response
    else Kakao Failure (Blocked/No User)
        Kakao-->>System: Error / Fail
        System->>SMS: 2. Fallback to LMS/SMS
        SMS->>Patient: Delivers Text Message
        SMS-->>System: Success Response
    end
```

### 🇰🇷 Korean Localization Strategy
1.  **KakaoTalk First**: The primary channel. High engagement, rich media support.
    *   *AlimTalk* (Informational)
    *   *FriendTalk* (Marketing)
2.  **SMS/LMS Fallback**: Used via **NHN Cloud** when Kakao delivery fails or user blocks the channel.
3.  **AI Copywriter (Groq/Llama)**:
    *   Generates friendly, polite Korean marketing copy.
    *   **Compliance Filter**: Automatically removes prohibited medical terms (e.g., "guaranteed cure", "best").

### 📈 Campaign Lifecycle
```mermaid
stateDiagram-v2
    [*] --> Draft
    Draft --> Scheduling: User Schedules
    Scheduling --> Active: Start Date Reached
    Active --> Sending: Processing Batches
    Sending --> Completed: All Sent
    Sending --> Failed: Some Errors
    Failed --> Retrying: Auto-Retry
    Retrying --> Completed
    Completed --> [*]
```

---

## 🖥️ 3. The Dashboard (The Command Center)
*A unified interface for doctors and staff to manage everything.*

The dashboard connects the data (Patients) with the actions (Workflows).

### 🌐 Ecosystem View
```mermaid
graph LR
    subgraph "Clinic Operations"
    Staff[Doctors & Staff] --> Dashboard[DoctorsFlow Dashboard]
    end

    subgraph "Core Services"
    Dashboard --> Auth[Clerk Auth]
    Dashboard --> DB[(Supabase DB)]
    Dashboard --> AI[Groq AI Engine]
    end

    subgraph "External Channels"
    Dashboard --> Kakao[KakaoTalk Business]
    Dashboard --> SMS[NHN Cloud SMS]
    Dashboard --> Naver[Naver Booking Sync]
    end

    Kakao --> Patient((Patient))
    SMS --> Patient
    Naver --> Patient
```

### 📊 Data Architecture Entity Map
```mermaid
erDiagram
    CLINIC ||--o{ PATIENT : manages
    PATIENT ||--o{ APPOINTMENT : books
    APPOINTMENT ||--o{ WORKFLOW_EXECUTION : triggers
    WORKFLOW ||--o{ WORKFLOW_EXECUTION : defines
    WORKFLOW_EXECUTION ||--o{ MESSAGE_LOG : generates
    
    PATIENT {
        string id
        string name
        string phone
        date birth_date
    }
    
    WORKFLOW {
        string id
        string trigger_type
        json visual_data
    }
    
    MESSAGE_LOG {
        string id
        string channel
        string status
        string content
    }
```

---

## 🎓 4. User Success & Training ("Train")
*Empowering clinic staff to use the tool effectively.*

We don't just build software; we build a system that staff can learn easily.

### 🗺️ User Journey Map
```mermaid
journey
    title Clinic Staff Success Journey
    section 1. Onboarding
      Sign Up: 5: Staff
      Connect Kakao/SMS Keys: 3: Staff
      Import Patients: 4: Staff
    section 2. First Win
      Create First Template: 4: Staff
      Send Test Message: 5: Staff
      Verify Delivery: 5: Staff
    section 3. Automation
      Set up "Post-Op Care": 5: Staff
      Enable Daily Cron: 5: System
      Review Weekly Stats: 4: Staff
```

### 📚 Onboarding & Training Pillars
1.  **Interactive Onboarding**:
    *   Step-by-step wizard for setting up API keys (Kakao, NHN).
    *   "First Message" tutorial.
2.  **Template Library**:
    *   Pre-built "Best Practice" workflows for common specialties (Ophthalmology, Plastic Surgery, Dermatology).
    *   *Example*: "Standard Cataract Surgery Recovery Path".
3.  **Documentation**:
    *   Clear guides on obtaining business licenses for Kakao.
    *   Video tutorials (future).

---

## 🚀 5. Future Roadmap: The "Bigger" Picture

Where we go from here to dominate the market.

1.  **AI Agents**: Instead of just static templates, AI agents that can reply to basic patient queries via Kakao.
2.  **Payment Integration**: Collect deposits or consultation fees directly via link (PortOne).
3.  **EMR/CRM Deep Integration**: Two-way sync with major Korean EMRs so manual entry is zero.
4.  **Advanced Analytics**: ROI tracking per campaign (Did the patient book after the message?).

---

### 🔗 Quick Links to Deep Dives
- **Architecture**: `BACKEND_ARCHITECTURE.md`
- **User Flows**: `USER_FLOW_DOCUMENTATION.md`
- **Automation Details**: `WORKFLOW_AUTOMATION_FEATURES.md`
- **Next Steps**: `NEXT_STEPS.md`
