// Logs a fatal error and exits — but gives stdout/stderr a moment to
// flush first. On Windows, calling process.exit() immediately after
// console.error()/logger.error() can truncate the output before it's
// actually written, leaving you with a silent crash and no clue why.
export const fatalExit = (message, error) => {
  console.error(`\n❌ ${message}`);
  if (error) {
    console.error(error.stack || error.message || error);
  }

  setTimeout(() => {
    process.exit(1);
  }, 100);
};
