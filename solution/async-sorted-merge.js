module.exports = async (logSources, printer, concurrencyLimit = 5, batchSize = 10) => {
  try {
    // Define a function to fetch the next batch of log entries from a source
    const getNextLogBatch = async (logSource) => {
      const logBatch = [];
      for (let i = 0; i < batchSize; i++) {
        const logEntry = await logSource.popAsync();
        if (!logEntry) break; // Exit the loop if the source is drained
        logBatch.push(logEntry);
      }
      return logBatch;
    };

    // Create a priority queue to keep track of the next log batch from each source
    const PriorityQueue = require("fastpriorityqueue");
    const queue = new PriorityQueue((a, b) => a.batch[0].date - b.batch[0].date);

    // Initialize the queue with the first log batch from the first 'concurrencyLimit' sources
    const initialSources = logSources.slice(0, concurrencyLimit);
    for (const logSource of initialSources) {
      const logBatch = await getNextLogBatch(logSource);
      if (logBatch.length > 0) {
        queue.add({ source: logSource, batch: logBatch });
      }
    }

    // Process and print log entries in chronological order with batch processing and parallelism control
    while (!queue.isEmpty()) {
      const { source, batch } = queue.poll();
      for (const logEntry of batch) {
        if (logEntry.date >= source.last.date) {
          // Print the log entry only if it satisfies the condition
          printer.print(logEntry);
        }
      }

      // Fetch the next log batch from the source and add it to the queue
      const nextLogBatch = await getNextLogBatch(source);
      if (nextLogBatch.length > 0) {
        queue.add({ source, batch: nextLogBatch });
      }
    }

    // Print statistics
    printer.done();
  } catch (error) {
    console.error("An error occurred:", error);
    // Handle the error as needed
  }
};
