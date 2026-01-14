import chalk from "chalk";
import ora, { type Ora } from "ora";

type UiOptions = {
  quiet: boolean;
};

let uiOptions: UiOptions = {
  quiet: false,
};

export const configureUi = (options: Partial<UiOptions>): void => {
  uiOptions = { ...uiOptions, ...options };
};

export const isQuietMode = (): boolean => uiOptions.quiet;

// ===============================
// Spinner Management
// ===============================

let currentSpinner: Ora | null = null;

/**
 * Starts a new spinner with the given text.
 * If a spinner is already running, it will be stopped first.
 */
export const startSpinner = (text: string): Ora => {
  if (isQuietMode()) {
    currentSpinner = ora({ isEnabled: false, text: "" });
    return currentSpinner;
  }
  if (currentSpinner) {
    currentSpinner.stop();
  }
  currentSpinner = ora({
    text: chalk.cyan(text),
    color: "cyan",
  }).start();
  return currentSpinner;
};

/**
 * Updates the text of the current spinner.
 */
export const updateSpinner = (text: string): void => {
  if (isQuietMode()) return;
  if (currentSpinner) {
    currentSpinner.text = chalk.cyan(text);
  }
};

/**
 * Stops the current spinner with a success message.
 */
export const succeedSpinner = (text?: string): void => {
  if (isQuietMode()) {
    currentSpinner = null;
    return;
  }
  if (currentSpinner) {
    if (text) {
      currentSpinner.succeed(chalk.green(text));
    } else {
      currentSpinner.succeed();
    }
    currentSpinner = null;
  }
};

/**
 * Stops the current spinner with a failure message.
 */
export const failSpinner = (text?: string): void => {
  if (isQuietMode()) {
    currentSpinner = null;
    return;
  }
  if (currentSpinner) {
    if (text) {
      currentSpinner.fail(chalk.red(text));
    } else {
      currentSpinner.fail();
    }
    currentSpinner = null;
  }
};

/**
 * Stops the current spinner with a warning message.
 */
export const warnSpinner = (text?: string): void => {
  if (isQuietMode()) {
    currentSpinner = null;
    return;
  }
  if (currentSpinner) {
    if (text) {
      currentSpinner.warn(chalk.yellow(text));
    } else {
      currentSpinner.warn();
    }
    currentSpinner = null;
  }
};

/**
 * Stops the current spinner with an info message.
 */
export const infoSpinner = (text?: string): void => {
  if (isQuietMode()) {
    currentSpinner = null;
    return;
  }
  if (currentSpinner) {
    if (text) {
      currentSpinner.info(chalk.blue(text));
    } else {
      currentSpinner.info();
    }
    currentSpinner = null;
  }
};

/**
 * Stops the current spinner without persisting any text.
 */
export const stopSpinner = (): void => {
  if (isQuietMode()) {
    currentSpinner = null;
    return;
  }
  if (currentSpinner) {
    currentSpinner.stop();
    currentSpinner = null;
  }
};

// ===============================
// Console Log Helpers
// ===============================

/**
 * Logs an info message with a blue info icon.
 */
export const logInfo = (message: string): void => {
  if (isQuietMode()) return;
  console.log(chalk.blue("ℹ"), chalk.blue(message));
};

/**
 * Logs a success message with a green checkmark.
 */
export const logSuccess = (message: string): void => {
  if (isQuietMode()) return;
  console.log(chalk.green("✔"), chalk.green(message));
};

/**
 * Logs an error message with a red cross.
 */
export const logError = (message: string): void => {
  if (isQuietMode()) return;
  console.log(chalk.red("✖"), chalk.red(message));
};

/**
 * Logs a warning message with a yellow warning icon.
 */
export const logWarning = (message: string): void => {
  if (isQuietMode()) return;
  console.log(chalk.yellow("⚠"), chalk.yellow(message));
};

/**
 * Logs a dimmed/secondary message.
 */
export const logDim = (message: string): void => {
  if (isQuietMode()) return;
  console.log(chalk.dim(message));
};

/**
 * Logs a blank line.
 */
export const logBlank = (): void => {
  if (isQuietMode()) return;
  console.log();
};

// ===============================
// UI Elements
// ===============================

/**
 * Displays the application header/banner.
 */
export const showHeader = (): void => {
  if (isQuietMode()) return;

  const margin = "  ";
  const innerWidth = 53;

  const stripAnsi = (value: string): string => value.replace(/\x1B\[[0-?]*[ -/]*[@-~]/g, "");
  const visibleWidth = (value: string): number => Array.from(stripAnsi(value)).length;
  const padCenter = (value: string, numberOfSpecialChars: number): string => {
    const width = visibleWidth(value);
    if (width >= innerWidth) return value;
    const left = Math.floor((innerWidth - width) / 2);
    const right = innerWidth - width - left - numberOfSpecialChars;
    return " ".repeat(left) + value + " ".repeat(right);
  };
  const printLine = (content = "", numberOfSpecialChars = 0): void => {
    console.log(chalk.cyan(`${margin}│`) + padCenter(content, numberOfSpecialChars) + chalk.cyan("│"));
  };

  logBlank();

  const top = `${margin}╭${"─".repeat(innerWidth)}╮`;
  const bottom = `${margin}╰${"─".repeat(innerWidth)}╯`;
  const title = chalk.blueBright("⚡ ") + chalk.bold.white("AZP-CLI") + chalk.dim(" • Azure PIM Manager") + chalk.blueBright(" ⚡");
  const tagline = chalk.dim("Activate & manage your Azure roles");

  console.log(chalk.cyan(top));
  printLine();
  printLine(title, 4);
  printLine();
  printLine(tagline);
  printLine();
  console.log(chalk.cyan(bottom));
  logBlank();
};

/**
 * Displays a section divider.
 */
export const showDivider = (): void => {
  if (isQuietMode()) return;
  console.log(chalk.dim("─".repeat(54)));
};

/**
 * Formats a role display string.
 */
export const formatRole = (roleName: string, scopeDisplayName: string): string => {
  return `${chalk.white.bold(roleName)} ${chalk.dim("@")} ${chalk.cyan(scopeDisplayName)}`;
};

/**
 * Formats an active role display string with additional metadata.
 */
export const formatActiveRole = (roleName: string, scopeDisplayName: string, subscriptionName: string, startDateTime: string): string => {
  const startDate = new Date(startDateTime).toLocaleString();
  return `${chalk.white.bold(roleName)} ${chalk.dim("@")} ${chalk.cyan(scopeDisplayName)} ${chalk.dim(`(${subscriptionName})`)} ${chalk.dim(
    `[Started: ${startDate}]`
  )}`;
};

/**
 * Formats a subscription display string.
 */
export const formatSubscription = (displayName: string, subscriptionId: string): string => {
  return `${chalk.white.bold(displayName)} ${chalk.dim(`(${subscriptionId})`)}`;
};

/**
 * Formats a status display string based on status type.
 */
export const formatStatus = (status: string): string => {
  switch (status.toLowerCase()) {
    case "approved":
    case "provisioned":
    case "activated":
      return chalk.green.bold(`✔ ${status}`);
    case "denied":
    case "failed":
      return chalk.red.bold(`✖ ${status}`);
    case "pendingapproval":
    case "pending":
      return chalk.yellow.bold(`⏳ ${status}`);
    default:
      return chalk.blue.bold(`ℹ ${status}`);
  }
};

/**
 * Displays a summary box for activation/deactivation results.
 */
export const showSummary = (title: string, items: { label: string; value: string }[]): void => {
  if (isQuietMode()) return;
  const boxWidth = 54;
  const titleWidth = Math.max(0, boxWidth - 4 - title.length);
  logBlank();
  console.log(chalk.cyan.bold(`┌─ ${title} ${"─".repeat(titleWidth)}`));
  items.forEach((item) => {
    console.log(chalk.cyan("│ ") + chalk.dim(`${item.label}: `) + chalk.white(item.value));
  });
  console.log(chalk.cyan.bold("└" + "─".repeat(boxWidth)));
  logBlank();
};

// ===============================
// Async Operation Wrapper
// ===============================

/**
 * Wraps an async operation with a spinner.
 * Shows spinner while operation is in progress, then shows success/failure.
 */
export const withSpinner = async <T>(text: string, operation: () => Promise<T>, successText?: string, failText?: string): Promise<T> => {
  startSpinner(text);
  try {
    const result = await operation();
    if (successText) {
      succeedSpinner(successText);
    } else {
      succeedSpinner();
    }
    return result;
  } catch (error) {
    if (failText) {
      failSpinner(failText);
    } else {
      failSpinner();
    }
    throw error;
  }
};
