# PocketWorth Enhanced Features - UI/UX Design System

## 📐 Design Principles

### 1. **Visual Hierarchy**
- Clear distinction between title, sections, and details
- Font size progression: 60pt → 28pt → 18pt → 12pt
- Weight progression: Black → SemiBold → Regular

### 2. **Consistency**
- Rounded corners: 2rem (32px) for cards, 2.25rem for components
- Padding: 5px-8px spacing throughout
- Button height: 10-11 height units (40-44px)
- Icons: 5-6 width units (20-24px for display)

### 3. **Dark Mode First**
- Primary dark background: #0f1419
- Card background: #1e293b
- Text color: #e5e7eb (light)
- Accent: #00d9ff (teal)

### 4. **Interactive Feedback**
- Hover: scale(1.01-1.05) or opacity increase
- Active: scale(0.95)
- Transition: all 0.2s-0.3s ease-out

---

## 🎨 Color System

### Primary Palette
```css
Primary Dark Blue:    #1e3a5f    /* Headers, main content */
Accent Teal:         #00d9ff    /* Highlights, interactions */
Success Green:       #10b981    /* Positive states */
Warning Red:         #ef4444    /* Alerts, negatives */
Background Dark:     #0f1419    /* Main background */
```

### Secondary Palette (Dark Mode)
```css
Slate 900:  #0f172a    /* Darkest backgrounds */
Slate 800:  #1e293b    /* Card backgrounds */
Slate 700:  #334155    /* Secondary backgrounds */
Slate 600:  #475569    /* Text secondary */
Slate 500:  #64748b    /* Text tertiary */
Slate 400:  #94a3b8    /* Text disabled */
Slate 200:  #e2e8f0    /* Light text backgrounds */
```

### Light Mode Counterparts
```css
Background:     #ffffff       /* Cards */
Surface:        #f8fafc       /* Backgrounds */
Primary Text:   #0f172a       /* Headings */
Secondary Text: #64748b       /* Body text */
Borders:        #e2e8f0       /* Dividers */
```

---

## 📦 Component Patterns

### 1. Card Component

**Usage**:
```jsx
<div className={cn(
  "rounded-[2.5rem] border p-6 transition-all hover:scale-[1.02]",
  dark ? "bg-slate-800 border-slate-700 shadow-xl shadow-black/10" 
        : "bg-white border-slate-100 shadow-sm"
)}>
  {/* Content */}
</div>
```

**Sizes**:
- Standard: p-6
- Compact: p-4
- Large: p-8

**Shadows**:
- Dark mode: shadow-xl shadow-black/10
- Light mode: shadow-sm

---

### 2. Button Component

**Primary Button**:
```jsx
<button className="bg-blue-600 text-white font-bold py-3 rounded-xl 
  hover:bg-blue-700 active:scale-95 transition-all">
  Action
</button>
```

**Secondary Button**:
```jsx
<button className={cn(
  "px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-widest",
  dark ? "bg-slate-800 text-slate-400 hover:bg-slate-700"
        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
)}>
  Secondary
</button>
```

**Icon Button**:
```jsx
<button className="flex h-10 w-10 items-center justify-center 
  rounded-xl bg-blue-600 text-white active:scale-95 transition-all">
  <Icon className="h-5 w-5" />
</button>
```

---

### 3. Input Component

**Text Input**:
```jsx
<input 
  type="text"
  placeholder="Enter text..."
  className={cn(
    "w-full px-4 py-3 rounded-xl border font-medium",
    dark ? "bg-slate-800 border-slate-700 text-white placeholder-slate-500"
          : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400"
  )}
/>
```

**Select Input**:
```jsx
<select className={cn(
  "w-full px-4 py-3 rounded-xl border font-medium",
  dark ? "bg-slate-800 border-slate-700 text-white"
        : "bg-slate-50 border-slate-200 text-slate-900"
)}>
  <option>Option 1</option>
</select>
```

---

### 4. Progress Bar Component

**Standard Progress**:
```jsx
<div className={cn(
  "h-3 w-full rounded-full p-0.5 border shadow-inner overflow-hidden",
  dark ? "bg-slate-900 border-slate-700" 
        : "bg-slate-100 border-slate-200"
)}>
  <div 
    className="h-full rounded-full transition-all duration-500 bg-green-500"
    style={{ width: `${percentage}%` }}
  />
</div>
```

**Status Colors**:
- 🟢 Green (0-75%): On track
- 🟡 Yellow (75-99%): Approaching
- 🔴 Red (100%+): Over limit

---

### 5. Modal Component

**Modal Structure**:
```jsx
{showModal && (
  <div className="fixed inset-0 bg-black/50 flex items-end z-50">
    <div className={cn(
      "w-full max-w-lg rounded-t-[3rem] p-6 space-y-4",
      dark ? "bg-slate-900" : "bg-white"
    )}>
      <h2 className={cn("text-xl font-black", 
        dark ? "text-white" : "text-slate-900")}>
        Title
      </h2>
      {/* Form content */}
    </div>
  </div>
)}
```

**Features**:
- Slides up from bottom
- Rounded top corners (3rem)
- Semi-transparent overlay
- Click outside to close

---

### 6. Summary Card Pattern

**Structure**:
```jsx
<div className="rounded-[2.5rem] bg-gradient-to-br from-blue-600 to-blue-500 
  p-8 text-white shadow-xl shadow-blue-500/20">
  <div className="flex items-center justify-between">
    <div>
      <p className="text-xs font-black uppercase tracking-widest">Label</p>
      <h3 className="mt-2 text-4xl font-black tracking-tight">Value</h3>
    </div>
    <div className="flex h-14 w-14 items-center justify-center 
      rounded-2xl bg-white/20 backdrop-blur-md">
      <Icon className="h-8 w-8 text-yellow-300" />
    </div>
  </div>
</div>
```

**Gradient Options**:
- Blue: from-blue-600 to-blue-500
- Purple: from-purple-600 to-pink-500
- Green: from-green-600 to-emerald-500

---

## 📊 Layout Patterns

### 1. Dashboard Layout
```
┌─────────────────────────────┐
│ Header + Navigation          │
├─────────────────────────────┤
│ Hero/Summary Card            │
├─────────────────────────────┤
│ Status Indicator             │
├─────────────────────────────┤
│ Quick Actions (Grid 2x3)     │
├─────────────────────────────┤
│ Content Cards (Vertical)     │
├─────────────────────────────┤
│ Charts/Analytics             │
├─────────────────────────────┤
│ Bottom Navigation            │
└─────────────────────────────┘
```

### 2. Form Layout
```
┌─────────────────────────────┐
│ Modal Title                  │
├─────────────────────────────┤
│ Input 1                      │
│ Input 2                      │
│ Input 3 (Grid 2x2)          │
├─────────────────────────────┤
│ Submit Button (Full Width)   │
└─────────────────────────────┘
```

### 3. List Layout
```
┌─────────────────────────────┐
│ Title + Action Button        │
├─────────────────────────────┤
│ [List Item 1]                │
│ [List Item 2]                │
│ [List Item 3]                │
│ [List Item 4]                │
└─────────────────────────────┘
```

---

## 🎯 Typography System

### Font Stack
```css
Headers:     'Inter', 'Poppins', sans-serif;
Body:        'Inter', 'Roboto', sans-serif;
```

### Type Scale
```
Title (60pt):           font-black, tracking-tight
Heading (28pt):        font-black, tracking-tight
Subheading (18pt):     font-semibold, tracking-tight
Body (14pt):           font-medium
Caption (12pt):        font-bold, uppercase, tracking-widest
Hint (10pt):           font-bold, uppercase, tracking-widest
```

### Text Styles
```css
Uppercase Labels:    uppercase tracking-widest text-[10px] font-bold
Headlines:           tracking-tight font-black text-2xl+
Descriptions:        leading-relaxed text-sm
```

---

## 🖼️ Icon Usage

### Icon Sizes
- Display: 20-24px (h-5, w-5)
- Large: 28-32px (h-7, w-7)
- Extra Large: 32-40px (h-8, w-8)
- Hero: 40-48px (h-10, w-10)

### Icon Colors
```javascript
// Primary icon
className="text-blue-600"

// Secondary icon
className="text-slate-400"

// Status icon (success)
className="text-green-500"

// Status icon (warning)
className="text-amber-500"

// Status icon (error)
className="text-red-500"
```

### Icon Backgrounds
```jsx
// Circle background
<div className="flex h-12 w-12 items-center justify-center 
  rounded-full bg-blue-100 text-blue-600">
  <Icon className="h-6 w-6" />
</div>

// Square background
<div className="flex h-12 w-12 items-center justify-center 
  rounded-xl bg-blue-600 text-white">
  <Icon className="h-6 w-6" />
</div>
```

---

## ⚡ Animation Guidelines

### Duration Standards
- Quick: 150ms (hover effects)
- Standard: 300ms (transitions)
- Slow: 500ms+ (progress animations)

### Easing Functions
```javascript
// Standard transitions
ease-in-out   // Default smooth
ease-out      // Decelerate (for dismiss)
ease-in       // Accelerate (for reveal)
linear        // Consistent (for progress bars)
```

### Common Animations
```jsx
// Hover scale
hover:scale-[1.01]

// Active scale
active:scale-95

// Fade in
opacity-0 → opacity-100

// Slide down
-translate-y-full → translate-y-0

// Spin
animate-spin
```

---

## 📱 Responsive Design

### Breakpoints
```css
sm:   640px
md:   768px
lg:   1024px
xl:   1280px
2xl:  1536px
```

### Mobile-First Patterns
```jsx
// Stack on mobile, grid on tablet+
className="flex flex-col md:grid md:grid-cols-2"

// Hide on mobile, show on tablet+
className="hidden md:block"

// Full width on mobile, constrained on desktop
className="w-full max-w-lg"
```

### Touch Targets
- Minimum: 44x44px (buttons, links)
- Comfortable: 48x48px (interactive elements)
- Spacing: 8px minimum between targets

---

## 🎨 Visual States

### Button States
```
Default:    bg-blue-600
Hover:      bg-blue-700 (or scale-105)
Active:     scale-95
Disabled:   bg-gray-300 opacity-50 cursor-not-allowed
Loading:    spinner animation
```

### Input States
```
Default:    border-slate-200
Focused:    border-blue-600 outline-none
Error:      border-red-500
Disabled:   bg-gray-100 opacity-50 cursor-not-allowed
Success:    border-green-500
```

### Card States
```
Default:    shadow-sm
Hover:      scale-[1.01] shadow-md
Active:     scale-95
Disabled:   opacity-50 cursor-not-allowed
```

---

## 📋 Component Checklist

### Every Screen Should Have
- [ ] Consistent header with back button
- [ ] Appropriate padding (px-5)
- [ ] Dark mode support
- [ ] Loading state
- [ ] Error handling
- [ ] Empty state message
- [ ] Accessible text contrast

### Every Card Should Have
- [ ] Rounded corners (2rem minimum)
- [ ] Proper spacing
- [ ] Hover effect
- [ ] Border in appropriate color
- [ ] Shadow (dark mode special)

### Every Form Should Have
- [ ] Clear labels
- [ ] Placeholder text
- [ ] Input validation
- [ ] Success/error feedback
- [ ] Submit button with loading state
- [ ] Cancel option

---

## 🔍 Quality Checklist

### Before Deployment
- [ ] Typography is readable (minimum 12pt)
- [ ] Colors meet WCAG contrast requirements
- [ ] Buttons are 44x44px minimum
- [ ] Spacing is consistent (8px grid)
- [ ] Dark mode works throughout
- [ ] Mobile responsive
- [ ] Touch targets have minimum 8px gap
- [ ] Loading states visible
- [ ] Error messages clear
- [ ] Animations smooth and purposeful

---

## 📚 Design References

- [Material Design 3](https://m3.material.io/)
- [Tailwind UI](https://tailwindui.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)

---

**Version**: 2.0  
**Last Updated**: January 2024  
**Maintained By**: Design System Team
