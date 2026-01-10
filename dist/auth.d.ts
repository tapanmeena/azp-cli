import { AzureCliCredential } from "@azure/identity";
import { Client } from "@microsoft/microsoft-graph-client";
export interface AuthContext {
    credential: AzureCliCredential;
    graphClient: Client;
    userId: string;
    userPrincipalName: string;
}
export declare const authenticate: () => Promise<AuthContext>;
export declare const getArmToken: (credential: AzureCliCredential) => Promise<string>;
//# sourceMappingURL=auth.d.ts.map