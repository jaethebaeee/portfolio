# User Personas & Onboarding Flow Analysis

## Current State
The current onboarding only asks for:
- Hospital/Clinic name
- Business type (medical vs education)

This doesn't account for different roles within medical practices.

## Key User Personas

### 1. **개원의 (Individual Doctor)**
- **Profile**: Single doctor running their own clinic
- **Needs**: Handles both medical care AND business operations
- **Pain Points**:
  - Too busy with patients to handle admin work
  - Needs automated patient communication
  - Wants to focus on medicine, not marketing
- **Current Fit**: ✅ Good fit for our current system

### 2. **의사 (Medical Doctor)**
- **Profile**: Doctor in a clinic with separate admin staff
- **Needs**:
  - Patient care coordination
  - Quick access to patient history
  - Communication with admin staff
- **Pain Points**:
  - Frustrated with inefficient admin processes
  - Wants better patient follow-up
  - Needs to delegate admin tasks
- **Current Fit**: ⚠️ Partial fit - needs role separation

### 3. **원무과장/매니저 (Business Manager/Admin)**
- **Profile**: Handles clinic operations, scheduling, billing
- **Needs**:
  - Patient management system
  - Automated reminders and follow-ups
  - Marketing campaign management
  - Analytics and reporting
- **Pain Points**:
  - Manual patient communication
  - No-show management
  - Marketing effectiveness tracking
- **Current Fit**: ✅ Excellent fit for our current system

### 4. **병원장/관리자 (Clinic/Hospital Manager)**
- **Profile**: Oversees multiple doctors and staff
- **Needs**:
  - Multi-doctor scheduling coordination
  - Staff performance analytics
  - Patient flow optimization
  - Compliance and reporting
- **Pain Points**:
  - Coordinating multiple doctors
  - Staff communication issues
  - Patient experience management
- **Current Fit**: ⚠️ Limited fit - needs multi-user features

## Recommended Onboarding Flow

### Step 1: Business Type Selection
```
[의료 기관] [교육 기관]
```

### Step 2: Practice Size & Role Identification
```typescript
// For Medical Practices
if (businessType === 'medical') {
  // Ask about practice setup
  "귀하의 진료실은 어떤 형태인가요?"

  - "개인 진료실 (나 혼자 운영)"          // Individual Doctor
  - "의사 + 원무과장 (2-3명 팀)"         // Small Team
  - "병원/클리닉 (여러 의사 + 스태프)"    // Multi-doctor Clinic
  - "병원 체인/그룹 (다수의 지점)"       // Hospital Chain
}
```

### Step 3: Role Selection
```typescript
// Based on practice size, show relevant roles
if (practiceSize === 'individual') {
  // Skip role selection - assume they're the doctor/manager
} else {
  "귀하는 어떤 역할을 하시나요?"

  - "의사 (환자 진료 담당)"              // Doctor
  - "원무과장/관리자 (업무 운영 담당)"    // Admin
  - "병원장/총괄 (전체 관리 담당)"       // Manager
  - "기타 (직접 입력)"                   // Custom
}
```

### Step 4: Feature Customization
Based on role, show relevant onboarding questions:

#### For Doctors:
- "어떤 진료과인가요?" (Specialty)
- "하루 진료 환자 수는?" (Patient volume)
- "수술 여부?" (Surgical procedures)

#### For Admins/Managers:
- "주요 업무는 무엇인가요?" (Main responsibilities)
- "사용할 기능들" (Feature preferences)
- "팀 규모는?" (Team size)

## Database Schema Updates Needed

### Add to profiles table:
```sql
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS practice_size TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS user_role TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS specialty TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS team_size INTEGER;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS responsibilities TEXT[];
```

### New onboarding_questions table:
```sql
CREATE TABLE onboarding_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_type TEXT NOT NULL,
  practice_size TEXT,
  user_role TEXT,
  question_key TEXT NOT NULL,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL, -- 'select', 'input', 'multiselect'
  options TEXT[], -- for select/multiselect
  required BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0
);
```

## Dashboard Customization

### Role-Based Dashboards:

#### Doctor Dashboard:
- Patient schedule focus
- Quick patient search
- Recent patient communications
- Basic analytics (my patients)

#### Admin Dashboard:
- Full workflow management
- Marketing campaign management
- Comprehensive analytics
- Team coordination tools

#### Manager Dashboard:
- Multi-user analytics
- Staff performance metrics
- Resource allocation
- Compliance reporting

## Implementation Priority

### Phase 1: Basic Role Detection
1. Add practice size question to onboarding
2. Add user role question
3. Store in database
4. Basic dashboard customization

### Phase 2: Advanced Customization
1. Role-specific onboarding questions
2. Feature preferences
3. Advanced dashboard customization

### Phase 3: Multi-User Features
1. Staff accounts
2. Role-based permissions
3. Team coordination tools

## Migration Strategy

### Current Users:
- Assume `individual` practice size for existing users
- Assume `admin` role for business operations
- Gradual migration to new system

### New Users:
- Full new onboarding flow
- Clear role identification
- Personalized experience from day one

## Success Metrics

### User Experience:
- Time to first value (TTFV)
- Feature adoption rate by role
- User satisfaction by persona

### Business Impact:
- Conversion rate by user type
- Feature usage patterns
- Customer retention by role

## Conclusion

The current "one-size-fits-all" approach doesn't serve different user personas well. By identifying roles early in onboarding, we can:

1. **Reduce friction** for each user type
2. **Increase adoption** by showing relevant features first
3. **Improve satisfaction** with role-appropriate workflows
4. **Enable future growth** into multi-user clinic management

**Recommendation**: Implement Phase 1 role detection immediately, then build role-specific features iteratively.
