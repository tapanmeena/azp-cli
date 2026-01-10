"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getArmToken = exports.authenticate = void 0;
const identity_1 = require("@azure/identity");
const microsoft_graph_client_1 = require("@microsoft/microsoft-graph-client");
const azureTokenCredentials_1 = require("@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials");
const chalk_1 = __importDefault(require("chalk"));
const GRAPH_SCOPES = ["https://graph.microsoft.com/.default"];
const ARM_SCOPES = ["https://management.azure.com/.default"];
let cachedCredential = null;
const getCredential = () => {
    if (!cachedCredential) {
        cachedCredential = new identity_1.AzureCliCredential();
    }
    return cachedCredential;
};
const authenticate = async () => {
    console.log(chalk_1.default.blueBright("Authenticating with Azure CLI..."));
    const credential = getCredential();
    const authProvider = new azureTokenCredentials_1.TokenCredentialAuthenticationProvider(credential, { scopes: GRAPH_SCOPES });
    const graphClient = microsoft_graph_client_1.Client.initWithMiddleware({ authProvider, defaultVersion: "v1.0" });
    const user = await graphClient.api("/me").header("Accept-Language", "en-US").select("id,userPrincipalName,displayName").get();
    const userId = user.id;
    const userPrincipalName = user.userPrincipalName;
    console.log(chalk_1.default.greenBright(`Authenticated as ${user.displayName} (ID: ${userPrincipalName})`));
    return {
        credential,
        graphClient,
        userId,
        userPrincipalName,
    };
};
exports.authenticate = authenticate;
const getArmToken = async (credential) => {
    const tokenResponse = await credential.getToken(ARM_SCOPES);
    if (!tokenResponse) {
        throw new Error("Failed to acquire ARM token");
    }
    return tokenResponse.token;
};
exports.getArmToken = getArmToken;
//# sourceMappingURL=auth.js.map