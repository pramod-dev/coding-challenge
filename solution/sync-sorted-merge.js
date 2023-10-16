module.exports = (logSources, printer) => {
  try {
    // Define a function to fetch the next log entry from a source
    const getNextLogEntry = (logSource) => {
      const logEntry = logSource.pop();
      if (logEntry) {
        return { source: logSource, entry: logEntry };
      }
      return null;
    };

    // Create a priority queue to keep track of the next log entry from each source
    const PriorityQueue = require("fastpriorityqueue");
    const queue = new PriorityQueue((a, b) => a.entry.date - b.entry.date);

    // Initialize the queue with the first log entry from each source
    for (const logSource of logSources) {
      const logEntry = getNextLogEntry(logSource);
      if (logEntry) {
        queue.add(logEntry);
      }
    }

    // Process and print log entries in chronological order
    while (!queue.isEmpty()) {
      const { source, entry } = queue.poll();
      if (entry.date >= source.last.date) {
        // Print the log entry only if it satisfies the condition
        printer.print(entry);
      }

      // Fetch the next log entry from the source and add it to the queue
      const nextLogEntry = getNextLogEntry(source);
      if (nextLogEntry) {
        queue.add(nextLogEntry);
      }
    }

    // Print statistics
    printer.done();
  } catch (error) {
    console.error("An error occurred:", error);
    // Handle the error as needed
  }
};
