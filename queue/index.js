class RequestQueue {
  constructor(maxConcurrent = 3) {
    this.maxConcurrent = maxConcurrent;
    this.active = 0;
    this.pending = [];
  }

  enqueue(task) {
    return new Promise((resolve, reject) => {
      this.pending.push({ task, resolve, reject });
      this._drain();
    });
  }

  _drain() {
    while (this.active < this.maxConcurrent && this.pending.length > 0) {
      const { task, resolve, reject } = this.pending.shift();
      this.active++;
      Promise.resolve()
        .then(() => task())
        .then(resolve)
        .catch(reject)
        .finally(() => {
          this.active--;
          this._drain();
        });
    }
  }

  get queueSize() { return this.pending.length; }
  get activeCount() { return this.active; }
  get isFull() { return this.active >= this.maxConcurrent; }
}

module.exports = RequestQueue;
