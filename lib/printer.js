"use strict";

const _ = require("lodash");

module.exports = class Printer {
  constructor() {
    this.last = new Date(0);
    this.logsPrinted = 0;
  }

  print(log) {
    if (!_.isDate(log.date)) {
      console.error("Error printing log entry: Invalid date");
      return; // Skip invalid log entries
    }

    if (log.date >= this.last) {
      console.log(log.date, log.msg);
      this.last = log.date;
      this.logsPrinted++;
      if (this.logsPrinted === 1) {
        this.startTime = new Date();
      }
    }
  }

  done() {
    var timeTaken = (new Date() - this.startTime) / 1000;
    console.log("\n***********************************");
    console.log("Logs printed:\t\t", this.logsPrinted);
    console.log("Time taken (s):\t\t", timeTaken);
    console.log("Logs/s:\t\t\t", this.logsPrinted / timeTaken);
    console.log("***********************************\n");
  }
};
