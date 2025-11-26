# 🏥 DoctorsFlow: The "Korean Clinic Dominance" Roadmap

To win in the Korean market (Gangnam Plastic Surgery, Dermatology, Ophthalmology), we need to move beyond "sending SMS". We need to become the **Operating System** for the clinic.

## 1. The "Naver Ecosystem" Integration (Critical)
In Korea, Google Maps is irrelevant. **Naver Place** is everything.
*   **Review Automation**: 
    *   *Current*: "Please review us."
    *   *Future*: Send a Kakao AlimTalk with a **Deep Link** that opens the Naver Map App directly to the "Write Review" screen.
    *   *Impact*: +300% Review Conversion. Reviews = SEO Ranking = New Patients.
*   **Booking Sync**:
    *   *Future*: Sync "Naver Booking" (N-Pay) appointments directly into our calendar. Doctors hate managing two calendars.

## 2. KakaoTalk "AlimTalk" (Biz Message)
*   **No-Show Prevention**:
    *   Send "D-1 Reminder" with a "Confirm" button.
    *   If patient clicks "Confirm", update our DB.
    *   If they click "Cancel", alert the front desk immediately to fill the slot.
*   **Insurance Documents (Silbi)**:
    *   Patients always ask for "Receipts" and "Diagnosis" for private insurance.
    *   *Future*: Doctor clicks 1 button -> Generates PDF -> Sends via Kakao.

## 3. The "Consultation Manager" (Siljangnim) CRM
Korean clinics have a unique role: The **Consultation Manager (Siljangnim)**. They are sales people.
*   **Lead Tracking**:
    *   Track "Lead Source" (e.g., Gangnam Unni, Babitalk, Naver Blog).
    *   Calculate "Conversion Rate" per Siljangnim.
*   **Follow-up Automation**:
    *   If a patient consults but doesn't book surgery, automatically send a "Limited Time Discount" 3 days later.

## 4. EMR "Sidecar" Strategy (The Exit Plan)
We cannot replace EMRs (Ubicare, BitComputer) yet because of insurance billing laws (Simpyeongwon).
*   **Strategy**: Run *alongside* the EMR.
*   **Integration**: Use a localized Windows Agent that "scrapes" patient info from the EMR screen (common practice in Korea) or uses HL7 if available.
*   **Value**: EMRs are ugly and slow. We are the "Beautiful Frontend" for patient communication.

---

## 🏗️ Phase 1: Building Trust (Today's Focus)
Before we can do the fancy stuff, we need to prove our system works.
*   **Workflow Execution History**: "Did the message actually go?" (Doctors are paranoid).
*   **Status Logs**: "Why did it fail?" (Wrong number? Blocked?)

Let's build the **Execution History UI** now.

