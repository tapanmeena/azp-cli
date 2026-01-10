"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const auth_1 = require("@/auth");
const cli_1 = require("@/cli");
const chalk_1 = __importDefault(require("chalk"));
const commander_1 = require("commander");
const package_json_1 = require("../package.json");
const program = new commander_1.Command();
program.name("azp-cli").description("Azure PIM CLI - A CLI tool for Azure Privilege Identity Management (PIM)").version(package_json_1.version);
program
    .command("activate", { isDefault: true })
    .description("Activate a role in Azure PIM")
    .alias("a")
    .action(async () => {
    try {
        const authContext = await (0, auth_1.authenticate)();
        await (0, cli_1.showMainMenu)(authContext);
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(chalk_1.default.redBright(`An error occurred during activation: ${errorMessage}`));
        if (errorMessage.includes("AADSTS")) {
            console.log(chalk_1.default.redBright("Authentication error detected. Please ensure you have the necessary permissions and try again."));
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
//# sourceMappingURL=index.js.map