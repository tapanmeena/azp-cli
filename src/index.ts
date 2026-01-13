#!/usr/bin/env node

import { Command } from "commander";
import { version } from "../package.json";
import { authenticate } from "./auth";
import { activateOnce, deactivateOnce, showMainMenu } from "./cli";
import { configureUi, logBlank, logDim, logError, showHeader } from "./ui";

type OutputFormat = "text" | "json";

type ActivateCommandOptions = {
  subscriptionId?: string;
  roleName?: string[];
  durationHours?: number;
  justification?: string;
  noInteractive?: boolean;
  yes?: boolean;
  allowMultiple?: boolean;
  dryRun?: boolean;
  output?: OutputFormat;
  quiet?: boolean;
};

type DeactivateCommandOptions = {
  subscriptionId?: string;
  roleName?: string[];
  justification?: string;
  noInteractive?: boolean;
  yes?: boolean;
  allowMultiple?: boolean;
  dryRun?: boolean;
  output?: OutputFormat;
  quiet?: boolean;
};

const program = new Command();

program.name("azp-cli").description("Azure PIM CLI - A CLI tool for Azure Privilege Identity Management (PIM)").version(version);

program
  .command("activate", { isDefault: true })
  .description("Activate a role in Azure PIM")
  .alias("a")
  .option("--subscription-id <id>", "Azure subscription ID (required for non-interactive one-shot activation)")
  .option(
    "--role-name <name>",
    "Role name to activate (can be repeated). In --no-interactive mode, ambiguous matches error unless --allow-multiple is set.",
    (value: string, previous: string[] | undefined) => {
      const list = previous ?? [];
      list.push(value);
      return list;
    },
    []
  )
  .option("--duration-hours <n>", "Duration hours (1-8)", (value: string) => Number.parseInt(value, 10))
  .option("--justification <text>", "Justification for activation")
  .option("--no-interactive", "Do not prompt; require flags to be unambiguous")
  .option("-y, --yes", "Skip confirmation prompt")
  .option("--allow-multiple", "Allow activating multiple eligible matches for a role name")
  .option("--dry-run", "Resolve targets and print summary without submitting activation requests")
  .option("--output <text|json>", "Output format", "text")
  .option("--quiet", "Suppress non-essential output (recommended with --output json)")
  .action(async (cmd: ActivateCommandOptions) => {
    try {
      const output = (cmd.output ?? "text") as OutputFormat;
      const quiet = Boolean(cmd.quiet || output === "json");
      configureUi({ quiet });

      // Show header (text mode only)
      showHeader();

      // Authenticate
      const authContext = await authenticate();

      const requestedRoleNames = cmd.roleName ?? [];
      const wantsOneShot = Boolean(cmd.noInteractive || cmd.subscriptionId || requestedRoleNames.length > 0 || cmd.dryRun);

      if (!wantsOneShot) {
        await showMainMenu(authContext);
        return;
      }

      const result = await activateOnce(authContext, {
        subscriptionId: cmd.subscriptionId ?? "",
        roleNames: requestedRoleNames,
        durationHours: cmd.durationHours,
        justification: cmd.justification,
        dryRun: cmd.dryRun,
        noInteractive: cmd.noInteractive,
        yes: cmd.yes,
        allowMultiple: cmd.allowMultiple,
      });

      if (output === "json") {
        process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
      }
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      const output = (cmd.output ?? "text") as OutputFormat;
      if (output === "json") {
        process.stdout.write(`${JSON.stringify({ ok: false, error: errorMessage }, null, 2)}\n`);
        process.exit(1);
      }

      logBlank();
      logError(`An error occurred: ${errorMessage}`);

      if (errorMessage.includes("AADSTS")) {
        logBlank();
        logError("Authentication error detected. Please ensure you have the necessary permissions and try again.");
        logDim("Tip: Make sure you are logged in with 'az login' before running this command.");
      }

      if (errorMessage.includes("Azure CLI not found") || errorMessage.includes("AzureCliCredential")) {
        logBlank();
        logDim("Tip: Make sure Azure CLI is installed and you are logged in with 'az login'.");
      }

      logBlank();
      process.exit(1);
    }
  });

program
  .command("deactivate")
  .description("Deactivate a role in Azure PIM")
  .alias("d")
  .option("--subscription-id <id>", "Azure subscription ID (optional; if omitted, searches all subscriptions)")
  .option(
    "--role-name <name>",
    "Role name to deactivate (can be repeated). In --no-interactive mode, ambiguous matches error unless --allow-multiple is set.",
    (value: string, previous: string[] | undefined) => {
      const list = previous ?? [];
      list.push(value);
      return list;
    },
    []
  )
  .option("--justification <text>", "Justification for deactivation")
  .option("--no-interactive", "Do not prompt; require flags to be unambiguous")
  .option("-y, --yes", "Skip confirmation prompt")
  .option("--allow-multiple", "Allow deactivating multiple active matches for a role name")
  .option("--dry-run", "Resolve targets and print summary without submitting deactivation requests")
  .option("--output <text|json>", "Output format", "text")
  .option("--quiet", "Suppress non-essential output (recommended with --output json)")
  .action(async (cmd: DeactivateCommandOptions) => {
    try {
      const output = (cmd.output ?? "text") as OutputFormat;
      const quiet = Boolean(cmd.quiet || output === "json");
      configureUi({ quiet });

      // Show header (text mode only)
      showHeader();

      // Authenticate
      const authContext = await authenticate();

      const requestedRoleNames = cmd.roleName ?? [];
      const wantsOneShot = Boolean(cmd.noInteractive || cmd.subscriptionId || requestedRoleNames.length > 0 || cmd.dryRun);

      if (!wantsOneShot) {
        await showMainMenu(authContext);
        return;
      }

      const result = await deactivateOnce(authContext, {
        subscriptionId: cmd.subscriptionId,
        roleNames: requestedRoleNames,
        justification: cmd.justification,
        dryRun: cmd.dryRun,
        noInteractive: cmd.noInteractive,
        yes: cmd.yes,
        allowMultiple: cmd.allowMultiple,
      });

      if (output === "json") {
        process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
      }
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      const output = (cmd.output ?? "text") as OutputFormat;
      if (output === "json") {
        process.stdout.write(`${JSON.stringify({ ok: false, error: errorMessage }, null, 2)}\n`);
        process.exit(1);
      }

      logBlank();
      logError(`An error occurred: ${errorMessage}`);

      if (errorMessage.includes("AADSTS")) {
        logBlank();
        logError("Authentication error detected. Please ensure you have the necessary permissions and try again.");
        logDim("Tip: Make sure you are logged in with 'az login' before running this command.");
      }

      if (errorMessage.includes("Azure CLI not found") || errorMessage.includes("AzureCliCredential")) {
        logBlank();
        logDim("Tip: Make sure Azure CLI is installed and you are logged in with 'az login'.");
      }

      logBlank();
      process.exit(1);
    }
  });

program
  .command("help")
  .description("Display help information about azp-cli commands")
  .action(() => {
    showHeader();
    program.outputHelp();
  });

program.parse();
