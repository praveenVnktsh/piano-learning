export class TimerManager {
  constructor({ onTick, onExpired }) {
    this.onTick = onTick || (() => {});
    this.onExpired = onExpired || (() => {});
    this._intervalId = null;
    this._endTime = 0;
    this._duration = 0;
  }

  start(seconds) {
    this.stop();
    this._duration = seconds;
    this._endTime = Date.now() + seconds * 1000;
    this.onTick(seconds, seconds);

    this._intervalId = setInterval(() => {
      const remaining = Math.max(0, (this._endTime - Date.now()) / 1000);
      this.onTick(remaining, this._duration);
      if (remaining <= 0) {
        this.stop();
        this.onExpired();
      }
    }, 100);
  }

  stop() {
    if (this._intervalId !== null) {
      clearInterval(this._intervalId);
      this._intervalId = null;
    }
  }

  getRemaining() {
    if (this._intervalId === null) return 0;
    return Math.max(0, (this._endTime - Date.now()) / 1000);
  }

  isRunning() {
    return this._intervalId !== null;
  }
}
