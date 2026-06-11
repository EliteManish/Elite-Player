import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import { Player, PlayerAPI } from '../components/Player';

export interface ElitePlayerOptions {
  source?: string;
  url?: string;
  title?: string;
  category?: string;
  poster?: string;
  year?: string;
  language?: string;
  onEnded?: () => void;
  onError?: (error: any) => void;
}

export class ElitePlayer {
  private element: HTMLElement;
  private root: Root | null = null;
  private playerRefValue: PlayerAPI | null = null;
  private options: ElitePlayerOptions;
  private eventListeners: { [event: string]: Function[] } = {};
  private isReadyTriggered = false;

  constructor(selectorOrOptions: string | HTMLElement | ElitePlayerOptions, maybeOptions?: ElitePlayerOptions) {
    let el: HTMLElement | null = null;
    let finalOptions: ElitePlayerOptions = {};

    if (typeof selectorOrOptions === 'string') {
      el = document.querySelector(selectorOrOptions) as HTMLElement;
      finalOptions = maybeOptions || {};
    } else if (selectorOrOptions instanceof HTMLElement) {
      el = selectorOrOptions;
      finalOptions = maybeOptions || {};
    } else if (selectorOrOptions && typeof selectorOrOptions === 'object') {
      finalOptions = selectorOrOptions as ElitePlayerOptions;
      const target = (finalOptions as any).container || (finalOptions as any).element || (finalOptions as any).selector || (finalOptions as any).id;
      if (typeof target === 'string') {
        el = document.querySelector(target);
      } else if (target instanceof HTMLElement) {
        el = target;
      }
    }

    if (!el) {
      console.warn("ElitePlayer SDK: Target element/container not found. Creating a detached element.");
      el = document.createElement('div');
    }

    this.element = el;
    this.options = finalOptions;

    this.init();
  }

  private init() {
    // Clear any existing contents (standard player mount behavior)
    this.element.innerHTML = '';

    // Create wrapper container
    const wrapper = document.createElement('div');
    wrapper.style.width = '100%';
    wrapper.style.height = '100%';
    wrapper.style.position = 'relative';
    wrapper.className = 'elite-player-sdk-container w-full h-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl';
    this.element.appendChild(wrapper);

    // Initialize React Root
    this.root = createRoot(wrapper);

    const onRef = (ref: PlayerAPI | null) => {
      this.playerRefValue = ref;
      if (ref && !this.isReadyTriggered) {
        this.isReadyTriggered = true;
        // Schedule 'ready' trigger to give developer listeners time to bind immediately after setup
        setTimeout(() => {
          this.trigger('ready');
        }, 50);
      }
    };

    const initialUrl = this.options.source || this.options.url || '';

    this.root.render(
      <Player
        ref={onRef}
        url={initialUrl}
        title={this.options.title}
        category={this.options.category || 'Streaming Media'}
        poster={this.options.poster}
        year={this.options.year || '2026'}
        language={this.options.language || 'English'}
        onEnded={() => {
          this.trigger('ended');
          if (this.options.onEnded) this.options.onEnded();
        }}
        onError={(err) => {
          this.trigger('error', err);
          if (this.options.onError) this.options.onError(err);
        }}
        onReady={() => {
          if (this.playerRefValue) {
            this.trigger('ready');
          }
        }}
        onPlay={() => this.trigger('play')}
        onPause={() => this.trigger('pause')}
        onTimeUpdate={(time) => this.trigger('timeupdate', time)}
        onFullscreenChange={(isFs) => this.trigger('fullscreenchange', isFs)}
        onQualityChange={(q) => this.trigger('qualitychange', q)}
      />
    );
  }

  // Event System
  public on(event: string, callback: Function): ElitePlayer {
    if (typeof callback !== 'function') return this;
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = [];
    }
    this.eventListeners[event].push(callback);
    return this;
  }

  public off(event: string, callback: Function): ElitePlayer {
    if (!this.eventListeners[event]) return this;
    this.eventListeners[event] = this.eventListeners[event].filter(cb => cb !== callback);
    return this;
  }

  private trigger(event: string, data?: any) {
    const listeners = this.eventListeners[event] || [];
    listeners.forEach(cb => {
      try {
        cb(data);
      } catch (err) {
        console.error(`Error in ElitePlayer event listener for "${event}":`, err);
      }
    });
  }

  // Public Controlling API
  public play(): Promise<void> | void {
    if (!this.playerRefValue) {
      console.warn('ElitePlayer: Player instance is not ready yet.');
      return;
    }
    return this.playerRefValue.play();
  }

  public pause(): void {
    this.playerRefValue?.pause();
  }

  public seek(seconds: number): void {
    this.playerRefValue?.seek(seconds);
  }

  public mute(): void {
    this.playerRefValue?.mute();
  }

  public unmute(): void {
    this.playerRefValue?.unmute();
  }

  public setVolume(value: number): void {
    this.playerRefValue?.setVolume(value);
  }

  public getCurrentTime(): number {
    return this.playerRefValue ? this.playerRefValue.getCurrentTime() : 0;
  }

  public getDuration(): number {
    return this.playerRefValue ? this.playerRefValue.getDuration() : 0;
  }

  public enterFullscreen(): void {
    this.playerRefValue?.enterFullscreen();
  }

  public exitFullscreen(): void {
    this.playerRefValue?.exitFullscreen();
  }

  public load(url: string, title?: string): void {
    this.playerRefValue?.load(url, title);
  }

  public destroy(): void {
    if (this.root) {
      this.root.unmount();
      this.root = null;
    }
    this.element.innerHTML = '';
    this.playerRefValue = null;
    this.eventListeners = {};
  }

  // Static builder method
  public static create(selector: string | HTMLElement, options: ElitePlayerOptions): ElitePlayer {
    return new ElitePlayer(selector, options);
  }
}

// Expose on the window object
if (typeof window !== 'undefined') {
  (window as any).ElitePlayer = ElitePlayer;
}
