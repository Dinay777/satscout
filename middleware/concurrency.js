const MAX_QUEUE_SIZE = 10;

function concurrencyGuard(queue) {
  return (req, res, next) => {
    if (queue.queueSize >= MAX_QUEUE_SIZE) {
      return res.status(503).json({ error: 'Server is busy. Please try again in a moment.' });
    }
    next();
  };
}

module.exports = concurrencyGuard;
