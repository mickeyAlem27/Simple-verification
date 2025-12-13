# 🎮 Thief vs Police CAPTCHA

An interactive, game-based CAPTCHA library for React applications. Verify users through engaging gameplay instead of boring text challenges!

[![npm version](https://img.shields.io/npm/v/thief-police-captcha.svg)](https://www.npmjs.com/package/thief-police-captcha)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ✨ Features

- 🎯 **3 Engaging Levels**: City Chase, Jungle Hunt, Temple Showdown
- 📱 **Fully Responsive**: Works on all devices (desktop, tablet, mobile)
- 🎨 **Beautiful UI**: Modern design with smooth animations
- ⚡ **Lightweight**: Optimized bundle size
- 🔒 **Secure**: Server-side verification support
- 🎮 **Fun UX**: Users actually enjoy completing it!

## 📦 Installation

```bash
npm install thief-police-captcha
```

or

```bash
yarn add thief-police-captcha
```

## 🚀 Quick Start

```jsx
import { ThiefPoliceGame } from 'thief-police-captcha';
import 'thief-police-captcha/dist/style.css';

function App() {
  const handleSuccess = (data) => {
    console.log('CAPTCHA verified!', data);
    // Proceed with your logic (form submission, etc.)
  };

  return (
    <div>
      <h1>Sign Up</h1>
      <ThiefPoliceGame onSuccess={handleSuccess} />
    </div>
  );
}
```

## 📖 API Reference

### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `onSuccess` | `(data: object) => void` | Yes | - | Callback when all levels are completed successfully |
| `onFailure` | `(reason: string) => void` | No | - | Callback when CAPTCHA fails |

### Success Data Structure

```typescript
{
  success: true,
  level: 3,
  totalScore: 460,
  completedAt: "2024-01-01T12:00:00.000Z"
}
```

## 🎮 Game Levels

### Level 1: City Chase
- **Objective**: Catch the thief by aiming and throwing
- **Controls**: Click to place targeting circle, then throw
- **Difficulty**: Easy

### Level 2: Jungle Hunt  
- **Objective**: Hit 4 real idols, avoid 3 fake ones
- **Controls**: Drag targeting circle, throw darts
- **Difficulty**: Medium

### Level 3: Temple Showdown
- **Objective**: Chase and catch the thief
- **Controls**: Click to catch
- **Difficulty**: Hard

## 🎨 Styling

The library includes default styles. Import the CSS file:

```jsx
import 'thief-police-captcha/dist/style.css';
```

### Custom Styling

You can override styles using CSS:

```css
.game-stage {
  /* Your custom styles */
}

.game-btn {
  /* Custom button styles */
}
```

## 🔧 Advanced Usage

### With Server Verification

```jsx
import { ThiefPoliceGame } from 'thief-police-captcha';

function App() {
  const handleSuccess = async (data) => {
    try {
      const response = await fetch('/api/verify-captcha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (response.ok) {
        console.log('Verified!');
        // Proceed with form submission
      }
    } catch (error) {
      console.error('Verification failed:', error);
    }
  };

  return <ThiefPoliceGame onSuccess={handleSuccess} />;
}
```

## 📱 Responsive Design

The CAPTCHA automatically adapts to different screen sizes:
- **Desktop**: Full-size experience
- **Tablet**: Scaled to fit
- **Mobile**: Touch-optimized controls

## 🌐 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 📄 License

MIT © Mikiyas Alemayehu

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 🐛 Issues

Found a bug? Please [open an issue](https://github.com/mickeyAlem27/Simple-verification/issues).

## 💡 Examples

Check out the [example directory](./example) for complete integration examples.

## 🔗 Links

- [GitHub Repository](https://github.com/mickeyAlem27/Simple-verification)
- [npm Package](https://www.npmjs.com/package/thief-police-captcha)

---

Made with ❤️ by Mikiyas Alemayehu
