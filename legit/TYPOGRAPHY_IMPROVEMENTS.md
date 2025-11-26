# Typography Improvements for Doctors Flow

## Overview

Enhanced typography system optimized for Korean medical content, providing better readability and professional appearance for healthcare applications.

## Font Stack

### Primary Font: Noto Sans KR
- **Source**: Google Fonts
- **Weights**: 300, 400, 500, 600, 700 (Light to Bold)
- **Optimized for**: Korean text rendering
- **Fallback**: Inter (Latin), system-ui

### Secondary Font: Inter
- **Source**: Google Fonts
- **Optimized for**: Latin text, UI elements
- **Display**: Swap (prevents invisible text during load)

## Typography Classes

### Headings
```tsx
<h1 className="text-4xl font-bold tracking-tight medical-heading">
  환자 관리 시스템
</h1>

<h2 className="text-3xl font-semibold tracking-tight medical-heading">
  예약 현황
</h2>

<h3 className="text-2xl font-semibold tracking-tight medical-heading">
  오늘의 일정
</h3>
```

### Body Text
```tsx
<p className="text-base leading-relaxed medical-text">
  환자분의 회복을 위해 정기적인 검진이 중요합니다.
</p>

<p className="text-sm leading-relaxed medical-text">
  수술 후 3일차에 통증이 있을 경우 즉시 연락주세요.
</p>
```

### Medical-Specific Elements
```tsx
// Patient names
<span className="text-base font-semibold medical-text">
  김철수
</span>

// Medical terms
<span className="text-sm font-medium text-primary medical-text">
  백내장 수술
</span>

// Appointment times
<span className="text-sm font-mono medical-text">
  14:30
</span>

// Status indicators
<span className="text-xs font-medium uppercase tracking-wide medical-text">
  완료됨
</span>
```

### Dashboard Elements
```tsx
// Card titles
<h3 className="text-lg font-semibold medical-heading">
  월별 통계
</h3>

// Metrics
<div className="text-2xl font-bold tabular-nums medical-heading">
  1,234
</div>

// Metric labels
<div className="text-sm font-medium text-muted-foreground medical-caption">
  총 예약 수
</div>
```

## Performance Optimizations

### Font Loading
- **Display: swap**: Prevents invisible text during font load
- **Preload**: Korean fonts are preloaded for better performance
- **Subsets**: Only Latin subset for Inter, full Korean support for Noto Sans KR

### Rendering
- **Font smoothing**: Antialiased for crisp text
- **Font features**: Ligatures, kerning, tabular numbers enabled
- **Text rendering**: Optimized for legibility

## Browser Support

### Supported Browsers
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

### Fallback Fonts
- **macOS**: SF Pro Display, SF Pro Text
- **Windows**: Segoe UI
- **Linux**: System UI fonts
- **Mobile**: Native system fonts

## Usage Guidelines

### Korean Text Optimization
- Use `medical-text` class for body content
- Use `medical-heading` class for headings
- Use `font-korean` class for Korean-specific elements

### Medical Terminology
- Medical terms should use `text-primary` color
- Use `font-medium` weight for emphasis
- Maintain consistent spacing with `letter-spacing: -0.01em`

### Accessibility
- Minimum contrast ratio: 4.5:1 for normal text, 3:1 for large text
- Line height: Minimum 1.5 for body text
- Font size: Minimum 14px for body text

## Migration Guide

### Before
```tsx
<h1 className="text-4xl font-bold">
  환자 관리
</h1>
<p className="text-base">
  환자 정보입니다.
</p>
```

### After
```tsx
<h1 className="text-4xl font-bold tracking-tight medical-heading">
  환자 관리
</h1>
<p className="text-base leading-relaxed medical-text">
  환자 정보입니다.
</p>
```

## Testing

### Visual Testing
- Check Korean text rendering across different browsers
- Verify font loading doesn't cause layout shift
- Test readability on mobile devices

### Performance Testing
- Measure font load time
- Check for Cumulative Layout Shift (CLS)
- Verify font display swap prevents invisible text

## Future Enhancements

- **Variable fonts**: For more granular weight control
- **Color fonts**: For medical icons and symbols
- **Advanced features**: Stylistic sets for different contexts
- **Loading states**: Better font loading indicators
