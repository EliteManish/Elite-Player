# Elite Player integration Guide

Elite Player is a high-performance web-based video player built with React, Tailwind CSS, and HLS.js. It supports Hls (.m3u8), MP4, MKV, and other common video formats with premium controls.

## 1. Using in React Projects

If you are building a React application, you can directly import the `Player` component.

### Prerequisites
Install the following dependencies:
```bash
npm install hls.js lucide-react motion clsx tailwind-merge
```

### Basic Usage
```tsx
import { Player } from './components/Player';

function MyVideoPage() {
  return (
    <div className="w-full max-w-4xl mx-auto aspect-video">
      <Player 
        url="https://example.com/video.m3u8"
        title="Sample Video"
        category="Entertainment"
        poster="https://example.com/thumbnail.jpg"
      />
    </div>
  );
}
```

### Props
| Prop | Type | Description |
|------|------|-------------|
| `url` | `string` | The URL of the video stream or file (M3U8, MP4, etc.) |
| `title` | `string` (Optional) | Title shown in the player header |
| `category` | `string` (Optional) | Subtitle or category shown below the title |
| `poster` | `string` (Optional) | URL for the thumbnail image before play |
| `onError` | `function` | Callback function when a playback error occurs |

---

## 2. Using in Standard HTML/JS (via Iframe)

The easiest way to embed Elite Player in any website (Wordpress, Static HTML, PHP, etc.) is via an Iframe integration.

### Simple Embed
```html
<iframe 
  src="https://your-deployment-url.app/?v=VIDEO_URL&t=VIDEO_TITLE" 
  width="100%" 
  height="500px" 
  frameborder="0" 
  allowfullscreen
  allow="autoplay; encrypted-media; picture-in-picture"
></iframe>
```

---

## 3. Advanced Features

- **Brilliant Mode**: Optimized black levels for OLED screens.
- **Gesture Controls**: Double tap to seek 10s, Long press to see branding.
- **HLS Optimization**: Automatic quality switching based on internet speed.
- **Multi-Audio**: Supports multiple audio tracks in HLS streams.
- **Resize Modes**: Toggle between Contain, Cover, and Fill (Stretch).

## 4. Custom Styling (Tailwind)

The player is styled using Tailwind CSS classes. You can customize the theme by modifying the `tailwind.config.js` or the CSS variables in `index.css`.

Example: To change the primary blue color:
```css
/* src/index.css */
@theme {
  --color-blue-500: #3b82f6; /* Change this to your brand color */
}
```
