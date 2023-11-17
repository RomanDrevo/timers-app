export class TimerClass {
    constructor(callback, delay) {
        this.timerId = null;
        this.start = null;
        this.remaining = delay;
        this.callback = callback;

        this.resume();
    }

    pause() {
        window.clearTimeout(this.timerId);
        this.timerId = null;
        this.remaining -= Date.now() - this.start;
    }

    resume() {
        if (this.timerId) {
            return;
        }

        this.start = Date.now();
        this.timerId = window.setTimeout(this.callback, this.remaining);
    }
}