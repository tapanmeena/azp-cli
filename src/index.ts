import { authenticate } from "@/auth";
import { showMainMenu } from "@/cli";
import chalk from "chalk";
import { Command } from "commander";
import { version } from "../package.json";

const program = new Command();

program.name("azp-cli").description("Azure PIM CLI - A CLI tool for Azure Privilege Identity Management (PIM)").version(version);

program
  .command("activate", { isDefault: true })
  .description("Activate a role in Azure PIM")
  .alias("a")
  .action(async () => {
    try {
      // Authenticate
      const authContext = await authenticate();

      // show mainmenu
      await showMainMenu(authContext);
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(chalk.redBright(`An error occurred during activation: ${errorMessage}`));

      if (errorMessage.includes("AADSTS")) {
        console.log(chalk.redBright("Authentication error detected. Please ensure you have the necessary permissions and try again."));
      }

      process.exit(1);
    }
  });

program
  .command("deactivate")
  .description("Deactivate a role in Azure PIM")
  .alias("d")
  .action(async () => {
    console.log("Deactivate role command invoked");
  });

program
  .command("help")
  .description("Display help information about azp-cli commands")
  .action(() => {
    program.outputHelp();
  });

program.parse();
