import { AzureCliCredential } from "@azure/identity";
export interface AzureSubscription {
    subscriptionId: string;
    displayName: string;
    tenantId: string;
}
export interface EligibleAzureRole {
    id: string;
    roleEligibilityScheduleId: string;
    roleDefinitionId: string;
    roleName: string;
    roleDescription: string;
    scope: string;
    scopeDisplayName: string;
    principalId: string;
}
export interface ActiveAzureRole {
    id: string;
    roleDefinitionId: string;
    roleName: string;
    scope: string;
    scopeDisplayName: string;
    principalId: string;
    linkedRoleEligibilityScheduleId: string;
    startDateTime: string;
    endDateTime: string;
    subscriptionId: string;
    subscriptionName: string;
}
export interface AzureActivationRequest {
    roleEligibilityScheduleId: string;
    roleDefinitionId: string;
    roleName: string;
    scope: string;
    principalId: string;
    justification: string;
    durationHours: number;
}
export declare const fetchSubscriptions: (credential: AzureCliCredential) => Promise<AzureSubscription[]>;
export declare const fetchEligibleRolesForSubscription: (credential: AzureCliCredential, subscriptionId: string, subscriptionName: string, principalId: string) => Promise<EligibleAzureRole[]>;
export declare const listActiveAzureRoles: (credential: AzureCliCredential, subscriptionId: string, subscriptionName: string, principalId: string) => Promise<ActiveAzureRole[]>;
export declare const activateAzureRole: (credential: AzureCliCredential, request: AzureActivationRequest, subscriptionId: string) => Promise<void>;
export declare const deactivateAzureRole: (credential: AzureCliCredential, scope: string, roleEligibilityScheduleId: string, subscriptionId: string, principalId: string, roleDefinitionId: string) => Promise<void>;
//# sourceMappingURL=azure-pim.d.ts.map