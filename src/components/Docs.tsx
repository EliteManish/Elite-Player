import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Book, ChevronLeft, Search, Copy, Check, Menu, X, 
  Terminal, Layers, Code, Zap, Globe, Github, ExternalLink,
  Smartphone, Shield, Info, Rocket, Command, Palette, Settings,
  Cpu, Lock, HelpCircle, FileText, Play, Link, Languages
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface DocsProps {
  onBack: () => void;
}

interface DocSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

const CodeBlock = ({ code, language = 'tsx' }: { code: string; language?: string }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group my-6">
      <div className="absolute right-4 top-4 z-10">
        <button
          onClick={copyToClipboard}
          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all backdrop-blur-md border border-white/10"
        >
          {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
        </button>
      </div>
      <div className="overflow-hidden rounded-2xl border border-white/5 shadow-2xl">
        <SyntaxHighlighter
          language={language}
          style={atomDark}
          customStyle={{
            margin: 0,
            padding: '24px',
            fontSize: '14px',
            lineHeight: '1.6',
            background: '#050505',
          }}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};

export function Docs({ onBack }: DocsProps) {
  const [activeSection, setActiveSection] = useState('introduction');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const sections: DocSection[] = [
    {
      id: 'introduction',
      title: 'Introduction',
      icon: <Info size={18} />,
      content: (
        <div className="space-y-6">
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white">Elite Player</h1>
          <p className="text-xl text-white/60 leading-relaxed">
            A high-performance, professional-grade video player for the modern web. Built with React, 
            Tailwind CSS, and HLS.js, designed to handle everything from standard MP4s to adaptive HLS streams with cinematic precision.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-2">
              <Zap className="text-blue-500" />
              <h3 className="font-bold">Ultra Fast</h3>
              <p className="text-sm text-white/40">Zero-latency controls and optimized HLS buffer management for instant playback.</p>
            </div>
            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-2">
              <Palette className="text-purple-500" />
              <h3 className="font-bold">OLED Optimized</h3>
              <p className="text-sm text-white/40">Brilliant Mode with true-black backgrounds and high-contrast glass UI.</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'features',
      title: 'Features',
      icon: <Zap size={18} />,
      content: (
        <div className="space-y-6">
          <h2 className="text-3xl font-bold tracking-tight">Core Features</h2>
          <ul className="grid grid-cols-1 gap-4">
            {[
              { t: 'Multi-Format Support', d: 'Native, comprehensive support for HLS (.m3u8), DASH (.mpd), MPEG-TS (.ts), FLV (.flv), MP4, WebM, and P2P WebTorrent (.torrent / Magnet).' },
              { t: 'Adaptive Bitrate', d: 'Automatic quality switching based on live network conditions via HLS.js and DASH.js.' },
              { t: 'Custom controls', d: 'Fully built with React components and Tailwind CSS for easy modification.' },
              { t: 'OLED/Dark Mode', d: 'Specialized "Brilliant Mode" for deep contrast on professional displays.' },
              { t: 'Gesture Support', d: 'Double-tap to seek, long-press for lock, and swipe for volume/brightness.' },
              { t: 'Picture-in-Picture', d: 'System-level PiP support for multitasking.' }
            ].map((f, i) => (
              <li key={i} className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                <div className="w-2 h-2 mt-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)] flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-white">{f.t}</h4>
                  <p className="text-sm text-white/40">{f.d}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )
    },
    {
      id: 'installation',
      title: 'Installation',
      icon: <Terminal size={18} />,
      content: (
        <div className="space-y-6">
          <h2 className="text-3xl font-bold tracking-tight">Installation</h2>
          <p className="text-white/60">Integrate Elite Player into your project using npm or yarn.</p>
          <CodeBlock 
            language="bash"
            code={`# Install via npm
npm install elite-player-react hls.js lucide-react motion 

# Or via yarn
yarn add elite-player-react hls.js lucide-react motion`}
          />
        </div>
      )
    },
    {
      id: 'react-setup',
      title: 'React Setup',
      icon: <Code size={18} />,
      content: (
        <div className="space-y-6">
          <h2 className="text-3xl font-bold tracking-tight">React Integration</h2>
          <p className="text-white/60">Import the Player component and use it in your React application.</p>
          <CodeBlock 
            code={`import { Player } from './components/Player';

function App() {
  return (
    <div className="aspect-video w-full max-w-4xl">
      <Player 
        url="https://example.com/video.m3u8"
        title="Modern Cinema"
        category="Action"
      />
    </div>
  );
}`}
          />
        </div>
      )
    },
    {
      id: 'vite-setup',
      title: 'Vite Setup',
      icon: <Zap size={18} />,
      content: (
        <div className="space-y-6">
          <h2 className="text-3xl font-bold tracking-tight">Vite Optimization</h2>
          <p className="text-white/60">Elite Player works best with Vite. Ensure your tailwind config handles the component paths.</p>
          <CodeBlock 
            language="javascript"
            code={`// tailwind.config.js
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/elite-player-react/**/*.{js,ts,jsx,tsx}" // If using as a package
  ],
  theme: {
    extend: {
      colors: {
        brand: '#3b82f6'
      }
    }
  },
  plugins: [],
}`}
          />
        </div>
      )
    },
    {
      id: 'cdn-usage',
      title: 'Browser SDK & CDN',
      icon: <Globe size={18} />,
      content: (
        <div className="space-y-6">
          <h2 className="text-3xl font-bold tracking-tight">Browser SDK / CDN Usage</h2>
          <p className="text-white/60">
            For standard HTML/JS websites or non-React frameworks, Elite Player exposes a Video.js-styled, fully functional Browser SDK wrapper (<code className="text-blue-400">ElitePlayer</code>) ready to mount directly in your DOM. It supports multiple instances, full event hooks, and direct stream management.
          </p>

          <h3 className="text-xl font-bold text-white mt-8 mb-4">Quick Start Setup</h3>
          <p className="text-white/60">
            Include the consolidated script and stylesheet directly from your CDN/hosting, create a container element, and initialize the player:
          </p>
          <CodeBlock 
            language="html"
            code={`<!-- Include Elite Player SDK Stylesheet -->
<link rel="stylesheet" href="/sdk/elite-player.min.css">

<!-- Video container element -->
<div id="player-container" style="width: 100%; max-width: 800px; aspect-ratio: 16/9;"></div>

<!-- Include Elite Player SDK Library -->
<script src="/sdk/elite-player.min.js"></script>

<script>
  // Initialise Elite Player using ElitePlayer.create or raw constructor
  const player = ElitePlayer.create('#player-container', {
    source: 'https://cdn.rawgit.com/streamlink/streamlink/master/tests/streams/hls/playlist.m3u8',
    title: 'Cinematic Demo Stream',
    category: 'CDN LIVE STREAM',
    language: 'English'
  });

  // Bind to playback events
  player.on('ready', () => {
    console.log('Player is ready for playback!');
  });

  player.on('play', () => {
    console.log('Video has started playing');
  });

  player.on('timeupdate', (currentTime) => {
    console.log('Playback progress time:', currentTime.toFixed(2));
  });
</script>`}
          />

          <h3 className="text-xl font-bold text-white mt-8 mb-4">Instance Options Configuration</h3>
          <p className="text-white/60">
            The <code className="text-blue-400">ElitePlayer</code> options argument accepts the following options:
          </p>
          <div className="overflow-x-auto border border-white/5 rounded-2xl bg-white/5">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/5 text-xs uppercase text-white/50 font-bold">
                  <th className="p-4">Key</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-white/70">
                <tr>
                  <td className="p-4 font-mono text-blue-400">source / url</td>
                  <td className="p-4 font-mono text-purple-400">string</td>
                  <td className="p-4">The streaming source URL (HLS, DASH, TS, FLV, Magnet/Torrent, or MP4/WebM).</td>
                </tr>
                <tr>
                  <td className="p-4 font-mono text-blue-400">title</td>
                  <td className="p-4 font-mono text-purple-400">string</td>
                  <td className="p-4">Dynamic title displayed in the top bar overlay metadata.</td>
                </tr>
                <tr>
                  <td className="p-4 font-mono text-blue-400">category</td>
                  <td className="p-4 font-mono text-purple-400">string</td>
                  <td className="p-4">Subtitle header overlay category metadata (defaults to 'Video Stream').</td>
                </tr>
                <tr>
                  <td className="p-4 font-mono text-blue-400">language</td>
                  <td className="p-4 font-mono text-purple-400">string</td>
                  <td className="p-4">Starting language track metadata descriptor (e.g. 'English').</td>
                </tr>
                <tr>
                  <td className="p-4 font-mono text-blue-400">poster</td>
                  <td className="p-4 font-mono text-purple-400">string</td>
                  <td className="p-4">Fallback poster image URL while buffering.</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className="text-xl font-bold text-white mt-8 mb-4">Controlling Methods API</h3>
          <p className="text-white/60">
            Use public standard methods on your returned player instance object directly to control playback actions:
          </p>
          <CodeBlock 
            language="javascript"
            code={`// Programmatic playback control
player.play();
player.pause();

// Seek to 1 minute 30 seconds
player.seek(90);

// Set volume level (0.0 to 1.0)
player.setVolume(0.85);

// Audio mute methods
player.mute();
player.unmute();

// Inspect playback status
console.log('Current playhead position:', player.getCurrentTime());
console.log('Total stream duration:', player.getDuration());

// Go fullscreen
player.enterFullscreen();

// Dynamic stream loading on physical container reuse
player.load('https://example.com/another-source.mpd', 'New DASH Title');

// Clean up player on client routing (unmounts React engine nodes seamlessly)
player.destroy();`}
          />

          <h3 className="text-xl font-bold text-white mt-8 mb-4">Event Dispatching Listeners</h3>
          <p className="text-white/60">
            Interact with reactive stream updates by registering standard hooks on <code className="text-blue-400">player.on(event, cb)</code>:
          </p>
          <div className="overflow-x-auto border border-white/5 rounded-2xl bg-white/5">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/5 text-xs uppercase text-white/50 font-bold">
                  <th className="p-4">Event Name</th>
                  <th className="p-4">Callback Parameter</th>
                  <th className="p-4">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-white/70">
                <tr>
                  <td className="p-4 font-mono text-green-400">"ready"</td>
                  <td className="p-4 font-mono text-white/40">void</td>
                  <td className="p-4">Triggered when metadata parses, buffering yields, and streaming mounts successfully.</td>
                </tr>
                <tr>
                  <td className="p-4 font-mono text-green-400">"play"</td>
                  <td className="p-4 font-mono text-white/40">void</td>
                  <td className="p-4">Fires when video transitions to isPlaying = true state.</td>
                </tr>
                <tr>
                  <td className="p-4 font-mono text-green-400">"pause"</td>
                  <td className="p-4 font-mono text-white/40">void</td>
                  <td className="p-4">Fires when video transitions to paused state.</td>
                </tr>
                <tr>
                  <td className="p-4 font-mono text-green-400">"timeupdate"</td>
                  <td className="p-4 font-mono text-purple-400">number</td>
                  <td className="p-4">Yields current accurate currentTime float updates on playhead movement.</td>
                </tr>
                <tr>
                  <td className="p-4 font-mono text-green-400">"ended"</td>
                  <td className="p-4 font-mono text-white/40">void</td>
                  <td className="p-4">Fires when stream playhead reaches the physical end of media duration.</td>
                </tr>
                <tr>
                  <td className="p-4 font-mono text-green-400">"fullscreenchange"</td>
                  <td className="p-4 font-mono text-purple-400">boolean</td>
                  <td className="p-4">Emits true when coming into fullscreen overlay, false when exiting.</td>
                </tr>
                <tr>
                  <td className="p-4 font-mono text-green-400">"qualitychange"</td>
                  <td className="p-4 font-mono text-purple-400">number</td>
                  <td className="p-4">Returns index of HLS or DASH stream quality selected (or -1 for automatic ABR level).</td>
                </tr>
                <tr>
                  <td className="p-4 font-mono text-green-400">"error"</td>
                  <td className="p-4 font-mono text-red-400">any</td>
                  <td className="p-4">Dispatches buffer parsing issues or network source delivery errors.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )
    },
    {
      id: 'basic-player-usage',
      title: 'Basic Usage',
      icon: <Play size={18} />,
      content: (
        <div className="space-y-6">
          <h2 className="text-3xl font-bold tracking-tight">Basic Usage</h2>
          <p className="text-white/60">The Player component requires at least a \`url\` prop. Supported extensions include \`.m3u8\`, \`.mp4\`, \`.webm\`, \`.ogg\`, and \`.mkv\`.</p>
          <CodeBlock 
            code={`<Player 
  url="https://example.com/video.mp4" 
  title="Simple Player" 
/>`}
          />
        </div>
      )
    },
    {
      id: 'mp4-playback',
      title: 'MP4 Playback',
      icon: <FileText size={18} />,
      content: (
        <div className="space-y-6">
          <h2 className="text-3xl font-bold tracking-tight">MP4 & Static Files</h2>
          <p className="text-white/60">MP4 playback uses the native browser capabilities with Elite Player's custom UI overlay.</p>
          <CodeBlock 
            code={`<Player 
  url="/assets/trailers/movie.mp4"
  poster="/assets/images/poster.jpg"
  autoPlay={false}
/>`}
          />
        </div>
      )
    },
    {
      id: 'hls-support',
      title: 'HLS Support',
      icon: <Layers size={18} />,
      content: (
        <div className="space-y-6">
          <h2 className="text-3xl font-bold tracking-tight">HLS & Adaptive Streams</h2>
          <p className="text-white/60">Powered by HLS.js, supporting master playlists, alternative audio tracks, and fragmented MP4s.</p>
          <CodeBlock 
            code={`<Player 
  url="https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
  hlsConfig={{
    enableWorker: true,
    lowLatencyMode: true
  }}
/>`}
          />
        </div>
      )
    },
    {
      id: 'dash-support',
      title: 'DASH Support',
      icon: <Layers size={18} />,
      content: (
        <div className="space-y-6">
          <h2 className="text-3xl font-bold tracking-tight">MPEG-DASH Support</h2>
          <p className="text-white/60">Elite Player includes built-in, native support for MPEG-DASH streaming (.mpd manifests) powered by the robust dash.js library. Adaptive bitrate streaming, quality switching, and loading states are handled automatically.</p>
          <CodeBlock 
            code={`<Player 
  url="https://dash.akamaized.net/envivio/EnvivioDash3/manifest.mpd"
  title="DASH Showcase Stream"
/>`}
          />
        </div>
      )
    },
    {
      id: 'webtorrent-support',
      title: 'WebTorrent Support',
      icon: <Link size={18} />,
      content: (
        <div className="space-y-6">
          <h2 className="text-3xl font-bold tracking-tight">P2P WebTorrent Support</h2>
          <p className="text-white/60">Elite Player incorporates fully-integrated Peer-to-Peer torrent streaming. You can stream media files directly from bittorrent networks, magnet links, or `.torrent` file URLs dynamically using WebTorrent in the browser.</p>
          <CodeBlock 
            code={`<Player 
  url="magnet:?xt=urn:btih:08ada5a7a6183aae1e09d831df6748d566095a10&dn=Sintel"
  title="Sintel open movie torrent"
/>`}
          />
        </div>
      )
    },
    {
      id: 'mpegts-flv-support',
      title: 'MPEG-TS & FLV Support',
      icon: <Cpu size={18} />,
      content: (
        <div className="space-y-6">
          <h2 className="text-3xl font-bold tracking-tight">MPEG-TS & FLV Support</h2>
          <p className="text-white/60">Elite Player has integrated `mpegts.js` support, allowing you to stream low-latency container formats such as HTTP FLV and raw MPEG-TS (.ts) formats on modern browsers without specialized extensions.</p>
          <CodeBlock 
            code={`<Player 
  url="https://example.com/live/stream.ts"
  title="Low Latency MPEG-TS Stream"
/>`}
          />
        </div>
      )
    },
    {
      id: 'subtitle-support',
      title: 'Subtitle Support',
      icon: <Languages size={18} />,
      content: (
        <div className="space-y-6">
          <h2 className="text-3xl font-bold tracking-tight">Subtitles & Captions</h2>
          <p className="text-white/60">Native WebVTT support and embedded HLS captions.</p>
          <CodeBlock 
            code={`<Player 
  url="video.m3u8"
  tracks={[
    {
      label: 'English',
      src: '/subs/en.vtt',
      lang: 'en',
      default: true
    },
    {
      label: 'Hindi',
      src: '/subs/hi.vtt',
      lang: 'hi'
    }
  ]}
/>`}
          />
        </div>
      )
    },
    {
      id: 'embed-player-usage',
      title: 'Embed Usage',
      icon: <Globe size={18} />,
      content: (
        <div className="space-y-6">
          <h2 className="text-3xl font-bold tracking-tight">Embedding</h2>
          <p className="text-white/60">Easily embed the player using an iframe. All options can be passed via URL parameters.</p>
          <CodeBlock 
            language="html"
            code={`<iframe 
  src="https://elite-player.io/embed?v=URL&t=TITLE" 
  width="100%" 
  height="450px" 
  frameborder="0" 
  allowfullscreen
></iframe>`}
          />
        </div>
      )
    },
    {
      id: 'url-parameters',
      title: 'URL Parameters',
      icon: <Link size={18} />,
      content: (
        <div className="space-y-6">
          <h2 className="text-3xl font-bold tracking-tight">URL API</h2>
          <div className="overflow-x-auto rounded-2xl border border-white/5 bg-white/5">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="p-4 font-bold text-white">Parameter</th>
                  <th className="p-4 font-bold text-white">Description</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-white/5 text-white/40">
                  <td className="p-4 font-mono text-blue-400">v</td>
                  <td className="p-4">The video URL (required)</td>
                </tr>
                <tr className="border-b border-white/5 text-white/40">
                  <td className="p-4 font-mono text-blue-400">t</td>
                  <td className="p-4">Stream title</td>
                </tr>
                <tr className="border-b border-white/5 text-white/40">
                  <td className="p-4 font-mono text-blue-400">autoplay</td>
                  <td className="p-4">1 to enable, 0 to disable</td>
                </tr>
                <tr className="border-b border-white/5 text-white/40">
                  <td className="p-4 font-mono text-blue-400">theme</td>
                  <td className="p-4">UI theme name (light, dark, glass)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )
    },
    {
      id: 'api-methods',
      title: 'API Methods',
      icon: <Settings size={18} />,
      content: (
        <div className="space-y-6">
          <h2 className="text-3xl font-bold tracking-tight">Imperative API</h2>
          <p className="text-white/60">Control the player using a ref hook.</p>
          <CodeBlock 
            code={`const playerRef = useRef<PlayerAPI>(null);

// Methods available
playerRef.current?.play();
playerRef.current?.pause();
playerRef.current?.seek(30);
playerRef.current?.setVolume(0.5);
playerRef.current?.toggleFullscreen();`}
          />
        </div>
      )
    },
    {
      id: 'events',
      title: 'Events',
      icon: <Rocket size={18} />,
      content: (
        <div className="space-y-6">
          <h2 className="text-3xl font-bold tracking-tight">Event Listeners</h2>
          <p className="text-white/60">Subscribe to player lifecycle events.</p>
          <CodeBlock 
            code={`<Player 
  onPlay={() => console.log('Playing')}
  onPause={() => console.log('Paused')}
  onEnded={() => console.log('Video Finished')}
  onTimeUpdate={(time) => console.log('Current time:', time)}
  onError={(err) => console.error('Error:', err)}
/>`}
          />
        </div>
      )
    },
    {
      id: 'keyboard-shortcuts',
      title: 'Keyboard Shortcuts',
      icon: <Command size={18} />,
      content: (
        <div className="space-y-6">
          <h2 className="text-3xl font-bold tracking-tight">Keyboard Controls</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { k: 'Space / K', d: 'Toggle Play/Pause' },
              { k: 'F', d: 'Toggle Fullscreen' },
              { k: 'M', d: 'Mute/Unmute' },
              { k: '← / →', d: 'Seek 10s Backward/Forward' },
              { k: '↑ / ↓', d: 'Increase/Decrease Volume' },
              { k: '1-9', d: 'Seek to 10%-90% of duration' },
              { k: 'L', d: 'Lock/Unlock UI Controls' },
              { k: 'P', d: 'Picture-in-Picture' }
            ].map((s, i) => (
              <div key={i} className="flex justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                <span className="font-mono text-blue-400">{s.k}</span>
                <span className="text-white/40 text-sm">{s.d}</span>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 'customization',
      title: 'Customization',
      icon: <Palette size={18} />,
      content: (
        <div className="space-y-6">
          <h2 className="text-3xl font-bold tracking-tight">Styling & Customization</h2>
          <p className="text-white/60">Customize the UI colors and components.</p>
          <CodeBlock 
            language="css"
            code={`/* Example: Neon Red Theme override */
.elite-player {
  --player-accent: #ff0055;
  --player-glass: rgba(0, 0, 0, 0.7);
  --player-border: rgba(255, 255, 255, 0.1);
}`}
          />
        </div>
      )
    },
    {
      id: 'themes',
      title: 'Themes',
      icon: <Palette size={18} />,
      content: (
        <div className="space-y-6">
          <h2 className="text-3xl font-bold tracking-tight">Built-in Themes</h2>
          <p className="text-white/60">Choose from professionally crafted themes.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {['Elite Dark', 'OLED Black', 'Glassmorphism'].map(t => (
              <div key={t} className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
                 <div className="aspect-video bg-gradient-to-br from-zinc-800 to-black rounded-lg mb-3" />
                 <span className="text-sm font-bold">{t}</span>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 'plugins',
      title: 'Plugins',
      icon: <Zap size={18} />,
      content: (
        <div className="space-y-6">
          <h2 className="text-3xl font-bold tracking-tight">Plugin Ecosystem</h2>
          <p className="text-white/60">Extend functionality with the plugin system.</p>
          <ul className="space-y-3">
             <li className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
                <div>
                  <h4 className="font-bold">AdSupport</h4>
                  <p className="text-xs text-white/40">VAST/VMAP digital advertising support.</p>
                </div>
                <button className="text-[10px] uppercase font-bold text-blue-500 bg-blue-500/10 px-2 py-1 rounded">Official</button>
             </li>
             <li className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
                <div>
                  <h4 className="font-bold">Chromecast</h4>
                  <p className="text-xs text-white/40">Cast video to any Google Home / Chromecast device.</p>
                </div>
                <button className="text-[10px] uppercase font-bold text-purple-500 bg-purple-500/10 px-2 py-1 rounded">Pro</button>
             </li>
          </ul>
        </div>
      )
    },
    {
      id: 'mobile-support',
      title: 'Mobile Support',
      icon: <Smartphone size={18} />,
      content: (
        <div className="space-y-6">
          <h2 className="text-3xl font-bold tracking-tight">Mobile Optimization</h2>
          <p className="text-white/60">Elite Player is built mobile-first with touch gestures and landscape rotation support.</p>
          <ul className="list-disc list-inside text-white/60 space-y-2">
            <li>Auto-rotate to landscape on fullscreen (Mobile Android/iOS)</li>
            <li>Native iOS HLS handling fallback</li>
            <li>Touch-friendly progress bar with scrub previews</li>
            <li>Volume and Brightness vertical swipe gestures (optional)</li>
          </ul>
        </div>
      )
    },
    {
      id: 'performance-optimization',
      title: 'Performance',
      icon: <Cpu size={18} />,
      content: (
        <div className="space-y-6">
          <h2 className="text-3xl font-bold tracking-tight">Performance Tuning</h2>
          <p className="text-white/60">Tips for large-scale deployments.</p>
          <CodeBlock 
            code={`<Player 
  hlsConfig={{
    maxBufferSize: 60 * 1024 * 1024, // 60MB
    maxBufferLength: 30, // 30 seconds
    liveSyncDurationCount: 3, 
    enableWorker: true
  }}
/>`}
          />
        </div>
      )
    },
    {
      id: 'security',
      title: 'Security',
      icon: <Shield size={18} />,
      content: (
        <div className="space-y-6">
          <h2 className="text-3xl font-bold tracking-tight">Security & DRM</h2>
          <p className="text-white/60">Elite Player supports authentication headers and basic DRM integrations.</p>
          <CodeBlock 
            code={`hlsConfig: {
  xhrSetup: (xhr, url) => {
    xhr.setRequestHeader('Authorization', 'Bearer YOUR_TOKEN');
  }
}`}
          />
        </div>
      )
    },
    {
      id: 'faq',
      title: 'FAQ',
      icon: <HelpCircle size={18} />,
      content: (
        <div className="space-y-6">
          <h2 className="text-3xl font-bold tracking-tight">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              { q: 'Is it free for commercial use?', a: 'Yes, Elite Player is released under the MIT License and is free for both personal and commercial projects.' },
              { q: 'Does it support 4K/UHD?', a: 'Yes, provided the source file and device support it. Elite Player handles adaptive switching up to the highest available quality.' },
              { q: 'Can I remove the branding?', a: 'Yes, the Elite Player branding can be disabled via the "branding: false" prop.' }
            ].map((item, i) => (
              <div key={i} className="p-6 rounded-3xl bg-white/5 border border-white/5 space-y-2">
                <h4 className="font-bold text-white">Q: {item.q}</h4>
                <p className="text-sm text-white/40">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 'deployment-guide',
      title: 'Deployment Guide',
      icon: <Rocket size={18} />,
      content: (
        <div className="space-y-6">
          <h2 className="text-3xl font-bold tracking-tight">Deployment</h2>
          <p className="text-white/60">Deploy Elite Player to any static hosting provider like Vercel, Netlify, or AWS CloudFront.</p>
          <CodeBlock 
            language="bash"
            code={`npm run build

# Fast deployment with Vercel
vercel deploy --prod`}
          />
        </div>
      )
    },
    {
      id: 'version-information',
      title: 'Version Info',
      icon: <Info size={18} />,
      content: (
        <div className="space-y-6">
          <h2 className="text-3xl font-bold tracking-tight">Version Status</h2>
          <div className="p-6 rounded-[32px] bg-blue-600/10 border border-blue-500/20">
             <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-blue-400 font-black uppercase tracking-widest mb-1">Current Release</p>
                  <h3 className="text-2xl font-bold">v2.4.0 (Stable)</h3>
                </div>
                <div className="text-right">
                  <p className="text-xs text-white/40 uppercase font-bold">Compatibility</p>
                  <p className="text-sm font-medium">React 18/19</p>
                </div>
             </div>
          </div>
        </div>
      )
    }
  ];

  const filteredSections = useMemo(() => {
    if (!searchQuery) return sections;
    return sections.filter(s => 
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.id.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const handleNavClick = (id: string) => {
    setActiveSection(id);
    setIsSidebarOpen(false);
    contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col h-full bg-[#050505] overflow-hidden"
    >
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-white/5 bg-black/50 backdrop-blur-xl z-[100]">
        <button onClick={onBack} className="text-white/40"><ChevronLeft size={24} /></button>
        <div className="text-blue-500 font-black tracking-tighter text-lg">Elite Docs</div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-white">
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar */}
        <aside className={cn(
          "absolute md:relative inset-0 md:inset-auto z-50 md:z-auto w-full md:w-80 bg-[#080808] border-r border-white/5 flex flex-col transition-transform duration-300",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}>
          <div className="p-6 space-y-6 flex flex-col h-full">
            <div className="hidden md:flex items-center justify-between">
              <button 
                onClick={onBack}
                className="flex items-center gap-2 text-white/40 hover:text-white transition-colors group cursor-pointer"
              >
                <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                <span className="font-bold uppercase tracking-widest text-[10px]">Back to Player</span>
              </button>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={16} />
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search documentation..."
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <nav className="flex-1 overflow-y-auto custom-scrollbar space-y-1 pr-2">
              {filteredSections.map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleNavClick(s.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group",
                    activeSection === s.id 
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" 
                      : "text-white/40 hover:text-white hover:bg-white/5"
                  )}
                >
                  <div className={cn(
                    "transition-colors",
                    activeSection === s.id ? "text-white" : "text-white/20 group-hover:text-blue-500"
                  )}>
                    {s.icon}
                  </div>
                  {s.title}
                </button>
              ))}
            </nav>

            <div className="pt-6 border-t border-white/5">
              <a 
                href="https://github.com" 
                target="_blank"
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-white/40 hover:text-white hover:bg-white/5 transition-all"
              >
                <Github size={18} />
                GitHub Repository
              </a>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main 
          ref={contentRef}
          className="flex-1 overflow-y-auto custom-scrollbar bg-[#050505] p-6 md:p-12 lg:p-20 relative"
        >
          {/* Background Gradient */}
          <div className="fixed top-0 right-0 w-[50vw] h-[50vw] bg-blue-600/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          
          <div className="max-w-4xl mx-auto relative text-white">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {sections.find(s => s.id === activeSection)?.content}

                {/* Footer Nav */}
                <div className="mt-32 pt-12 border-t border-white/5 flex items-center justify-between">
                   {sections.findIndex(s => s.id === activeSection) > 0 ? (
                     <button 
                       onClick={() => handleNavClick(sections[sections.findIndex(s => s.id === activeSection) - 1].id)}
                       className="flex flex-col items-start gap-1 p-4 rounded-2xl hover:bg-white/5 transition-all group"
                     >
                       <span className="text-[10px] uppercase font-bold tracking-widest text-white/30">Previous</span>
                       <span className="text-lg font-bold text-white/80 group-hover:text-blue-500 transition-colors">
                         {sections[sections.findIndex(s => s.id === activeSection) - 1].title}
                       </span>
                     </button>
                   ) : <div />}

                   {sections.findIndex(s => s.id === activeSection) < sections.length - 1 && (
                     <button 
                       onClick={() => handleNavClick(sections[sections.findIndex(s => s.id === activeSection) + 1].id)}
                       className="flex flex-col items-end gap-1 p-4 rounded-2xl hover:bg-white/5 transition-all group text-right"
                     >
                       <span className="text-[10px] uppercase font-bold tracking-widest text-white/30">Next</span>
                       <span className="text-lg font-bold text-white/80 group-hover:text-blue-500 transition-colors">
                         {sections[sections.findIndex(s => s.id === activeSection) + 1].title}
                       </span>
                     </button>
                   )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </motion.div>
  );
}
