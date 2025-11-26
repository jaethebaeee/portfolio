# Duplicate Functions and Import Issues Report

## 🔍 Found Duplicate Functions

### 1. `getStatusIcon` (5 instances)
**Status:** ✅ OK - These are local helper functions in different components
- `components/workflow/enhanced-trigger-node.tsx`
- `components/workflow/enhanced-delay-node.tsx`
- `components/workflow/enhanced-action-node.tsx`
- `components/workflow/enhanced-condition-node.tsx`
- `components/workflow/enhanced-time-window-node.tsx`

**Recommendation:** Consider extracting to a shared utility file to reduce code duplication.

### 2. `formatPhoneNumber` (3 instances)
**Status:** ⚠️ ISSUE - Different implementations with same name

1. **`lib/phone-validation.ts`** (exported)
   - Purpose: Display formatting (010-1234-5678)
   - Used by: `app/[locale]/dashboard/page.tsx`, `lib/queries/patients.ts`

2. **`lib/integrations/sms.ts`** (private)
   - Purpose: SMS API formatting (converts to Korean mobile format)
   - Implementation: Converts +82 to 0 prefix

3. **`lib/integrations/kakao.ts`** (private)
   - Purpose: Kakao API formatting (converts to +82 format)
   - Implementation: Adds +82 prefix

**Recommendation:** 
- Keep `lib/phone-validation.ts` as the main exported function for display
- Rename private functions in integrations to be more specific:
  - `formatPhoneNumberForSMS()` in sms.ts
  - `formatPhoneNumberForKakao()` in kakao.ts

### 3. `getTemplateDisplayName` (2 instances)
**Status:** ⚠️ ISSUE - Duplicate implementation

1. **`lib/integrations/email.ts`** (private)
2. **`lib/integrations/kakao.ts`** (private)

**Recommendation:** Extract to shared utility file `lib/utils/template-names.ts`

## 📦 Import Issues Found

### Duplicate Imports
- Multiple files import Card components with different subsets
- Some files have redundant imports

### Missing Imports
- Check for unused imports that should be removed

## ✅ Completed Actions

1. **✅ Extracted `getStatusIcon` to shared utility**
   - Created `lib/utils/node-status.tsx`
   - Exported `getStatusIcon` function
   - Updated all 5 components to import from shared location

2. **✅ Renamed duplicate `formatPhoneNumber` functions**
   - Kept `lib/phone-validation.ts` as main export
   - Renamed private functions in integrations:
     - `formatPhoneNumberForSMS()` in sms.ts
     - `formatPhoneNumberForKakao()` in kakao.ts

3. **✅ Extracted `getTemplateDisplayName` to shared utility**
   - Created `lib/utils/template-names.ts`
   - Updated both integration files to import from shared location

## 📋 Remaining Tasks

4. **Clean up duplicate imports**
   - Review and consolidate Card component imports
   - Remove unused imports

