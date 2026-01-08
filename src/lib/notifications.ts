"use client";

export interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
  requireInteraction?: boolean;
}

export interface SoundOptions {
  frequency?: number;
  duration?: number;
  volume?: number;
  type?: OscillatorType;
}

class NotificationManager {
  private audioContext: AudioContext | null = null;
  private permissionGranted: boolean = false;
  private inAppNotifications: Array<{id: string; title: string; body: string; timestamp: number}> = [];

  constructor() {
    // Initialize audio context on first user interaction
    if (typeof window !== 'undefined') {
      this.initAudioContext();
      // Add event listener to resume audio context on user interaction
      document.addEventListener('click', this.handleResumeAudioContext);
      document.addEventListener('keydown', this.handleResumeAudioContext);
    }
  }

  private initAudioContext() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
  }

  private handleResumeAudioContext = () => {
    this.resumeAudioContext();
  };

  private resumeAudioContext() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume().catch(console.warn);
    }
  };

  async requestPermission(): Promise<boolean> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      console.warn('Notifications not supported');
      return false;
    }

    if (Notification.permission === 'granted') {
      this.permissionGranted = true;
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      this.permissionGranted = permission === 'granted';
      return this.permissionGranted;
    }

    return false;
  }

  async showNotification(options: NotificationOptions): Promise<void> {
    // Try browser notification first
    if (!this.permissionGranted) {
      const granted = await this.requestPermission();
      if (!granted) {
        this.showInAppNotification(options);
        return;
      }
    }
    
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const notification = new Notification(options.title, {
          body: options.body,
          icon: options.icon || '/favicon.ico',
          tag: options.tag || 'chrona-timer',
          requireInteraction: options.requireInteraction || false,
          silent: true, // Let our own sound handle audio
        });

        // Auto-close after 5 seconds unless requireInteraction is true
        if (!options.requireInteraction) {
          setTimeout(() => notification.close(), 5000);
        }
        
        // Flash window if supported
        this.flashWindow();
        
        // Only show in-app notification if page is visible (user is actively using the app)
        if (!document.hidden) {
          this.showInAppNotification(options);
        }
        
      } catch (error) {
        console.error('Failed to show browser notification:', error);
        this.showInAppNotification(options);
      }
    } else {
      this.showInAppNotification(options);
    }
  }

  private showInAppNotification(options: NotificationOptions): void {
    // Use a stable id when tag is provided, so we can dedupe/replace noisy notifications
    // Add timestamp to ensure React key uniqueness while maintaining deduplication
    const id = options.tag ? `tag:${options.tag}:${Date.now()}` : Date.now().toString();
    const notification = { id, title: options.title, body: options.body, timestamp: Date.now() };
    
    // If a notification with the same tag already exists, remove the old one before adding new
    if (options.tag) {
      const tagPrefix = `tag:${options.tag}:`;
      this.inAppNotifications = this.inAppNotifications.filter((n) => !n.id.startsWith(tagPrefix));
    }
    this.inAppNotifications.unshift(notification);
    
    // Keep only last 10 notifications
    if (this.inAppNotifications.length > 10) {
      this.inAppNotifications = this.inAppNotifications.slice(0, 10);
    }

    // Auto-remove after 5 seconds unless requireInteraction is true
    if (!options.requireInteraction) {
      setTimeout(() => {
        this.removeInAppNotification(id);
      }, 5000);
    }

    // Dispatch custom event for UI components to listen to
    window.dispatchEvent(new CustomEvent('in-app-notification', { detail: notification }));
  }

  private removeInAppNotification(id: string): void {
    this.inAppNotifications = this.inAppNotifications.filter(n => n.id !== id);
    window.dispatchEvent(new CustomEvent('in-app-notification-removed', { detail: { id } }));
  }

  getInAppNotifications(): Array<{id: string; title: string; body: string; timestamp: number}> {
    return this.inAppNotifications;
  }

  playSound(options: SoundOptions = {}): void {
    if (!this.audioContext) {
      this.initAudioContext();
    }

    if (!this.audioContext) return;

    // Resume if suspended (handles autoplay restrictions)
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume().then(() => {
        // After resuming, play the sound
        this.playSoundInternal(options);
      }).catch(console.warn);
    } else {
      // Play immediately if not suspended
      this.playSoundInternal(options);
    }
  }

  private playSoundInternal(options: SoundOptions = {}): void {
    if (!this.audioContext) return;

    const {
      frequency = 800,
      duration = 200,
      volume = 0.3,
      type = 'sine'
    } = options;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
    
    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration / 1000);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration / 1000);
  }

  playCompletionSound(): void {
    // Play a pleasant completion sound (ascending notes)
    this.playSound({ frequency: 523.25, duration: 150, volume: 0.3 }); // C5
    setTimeout(() => {
      this.playSound({ frequency: 659.25, duration: 150, volume: 0.3 }); // E5
    }, 100);
    setTimeout(() => {
      this.playSound({ frequency: 783.99, duration: 200, volume: 0.3 }); // G5
    }, 200);
  }

  playPhaseChangeSound(): void {
    // Play a subtle phase change sound
    this.playSound({ frequency: 440, duration: 100, volume: 0.2 }); // A4
  }

  playTickSound(): void {
    // Play a subtle tick sound
    this.playSound({ frequency: 1000, duration: 50, volume: 0.1, type: 'square' });
  }

  private flashWindow(): void {
    if (typeof window !== 'undefined' && document.hidden) {
      // Flash the window title
      const originalTitle = document.title;
      let flashCount = 0;
      const flashInterval = setInterval(() => {
        document.title = flashCount % 2 === 0 ? '⏰ Timer Complete!' : originalTitle;
        flashCount++;
        if (flashCount >= 6) {
          clearInterval(flashInterval);
          document.title = originalTitle;
        }
      }, 500);
    }
  }

  // Method to create different notification types
  notifyTimerComplete(timerName: string): void {
    this.showNotification({
      title: 'Timer Complete!',
      body: `${timerName} has finished.`,
      tag: 'timer-complete',
      requireInteraction: false, // Allow auto-close for better UX
    });
    this.playCompletionSound();
  }

  notifyPomodoroPhaseChange(phase: string, timerName: string): void {
    const phaseMessages = {
      work: 'Time to focus! Work session started.',
      shortBreak: 'Quick break time! Take 5 minutes.',
      longBreak: 'Extended break! Well deserved rest.',
    };

    this.showNotification({
      title: `Pomodoro: ${phase.charAt(0).toUpperCase() + phase.slice(1)}`,
      body: phaseMessages[phase as keyof typeof phaseMessages] || `${timerName} phase changed.`,
      tag: 'pomodoro-phase',
    });
    this.playPhaseChangeSound();
  }

  notifyPomodoroCycleComplete(timerName: string, cycleTotal: number): void {
    this.showNotification({
      title: 'Pomodoro Cycle Complete!',
      body: `${timerName}: ${cycleTotal}/${cycleTotal}. Great job — enjoy your long break.`,
      tag: 'pomodoro-cycle-complete',
      requireInteraction: false,
    });
    this.playCompletionSound();
  }
}

// Singleton instance
export const notificationManager = new NotificationManager();

// Hook for React components
export function useNotifications() {
  return {
    requestPermission: () => notificationManager.requestPermission(),
    showNotification: (options: NotificationOptions) => notificationManager.showNotification(options),
    playSound: (options?: SoundOptions) => notificationManager.playSound(options),
    playCompletionSound: () => notificationManager.playCompletionSound(),
    playPhaseChangeSound: () => notificationManager.playPhaseChangeSound(),
    notifyTimerComplete: (timerName: string) => notificationManager.notifyTimerComplete(timerName),
    notifyPomodoroPhaseChange: (phase: string, timerName: string) => 
      notificationManager.notifyPomodoroPhaseChange(phase, timerName),
    notifyPomodoroCycleComplete: (timerName: string, cycleTotal: number) =>
      notificationManager.notifyPomodoroCycleComplete(timerName, cycleTotal),
    getInAppNotifications: () => notificationManager.getInAppNotifications(),
  };
}