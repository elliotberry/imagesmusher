import chalk from "chalk";
const elapsed = start => {
    let ret;
    const end = process.hrtime(start); // end[0] is in seconds, end[1] is in nanoseconds
    const timeInMs = (end[0] * 1000000000 + end[1]) / 1000000;
    if (timeInMs > 1000) {
      return `${(timeInMs / 1000).toFixed(4)}s`;
    } else {
      return `${timeInMs.toFixed(4)}ms`;
    }
  };
  const log = {
    ok(msg) {
      console.log(chalk.white.bgGreen(" OK ") + " " + msg);
    },
    warn(msg) {
      console.log(chalk.white.bgYellow(" WARN ") + " " + msg);
    },
    info(msg) {
      console.log(chalk.white.bgBlue(" INFO ") + " " + msg);
    },
    error(msg, verbose) {
      console.log(chalk.white.bgRed(" ERR ") + " " + msg);
    },
  };
  
  export { elapsed, log };