"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivateAzureRole = exports.activateAzureRole = exports.listActiveAzureRoles = exports.fetchEligibleRolesForSubscription = exports.fetchSubscriptions = void 0;
const arm_authorization_1 = require("@azure/arm-authorization");
const arm_resources_subscriptions_1 = require("@azure/arm-resources-subscriptions");
const chalk_1 = __importDefault(require("chalk"));
const uuid_1 = require("uuid");
const fetchSubscriptions = async (credential) => {
    console.log(chalk_1.default.blueBright("Fetching Azure subscriptions..."));
    const subscriptionClient = new arm_resources_subscriptions_1.SubscriptionClient(credential);
    const subscriptions = [];
    for await (const sub of subscriptionClient.subscriptions.list()) {
        subscriptions.push({
            subscriptionId: sub.subscriptionId || "",
            displayName: sub.displayName || "N/A",
            tenantId: sub.tenantId || "",
        });
    }
    console.log(chalk_1.default.greenBright(`Fetched ${subscriptions.length} subscriptions.`));
    return subscriptions;
};
exports.fetchSubscriptions = fetchSubscriptions;
const fetchEligibleRolesForSubscription = async (credential, subscriptionId, subscriptionName, principalId) => {
    console.log(chalk_1.default.blueBright(`Fetching eligible roles for subscription ${subscriptionName}...`));
    const client = new arm_authorization_1.AuthorizationManagementClient(credential, subscriptionId);
    const scope = `/subscriptions/${subscriptionId}`;
    const eligibleRoles = [];
    try {
        const schedules = client.roleEligibilitySchedules.listForScope(scope, {
            filter: `asTarget()`,
        });
        for await (const schedule of schedules) {
            if (schedule.id && schedule.roleDefinitionId) {
                eligibleRoles.push({
                    id: schedule.id,
                    roleEligibilityScheduleId: schedule.id,
                    roleDefinitionId: schedule.roleDefinitionId,
                    roleName: schedule.expandedProperties?.roleDefinition?.displayName || "Unknown Role",
                    roleDescription: "No description available",
                    scope: schedule.scope || scope,
                    scopeDisplayName: getScopeDisplayName(schedule.scope || scope),
                    principalId: schedule.principalId || principalId,
                });
            }
        }
        console.log(chalk_1.default.greenBright(`Fetched ${eligibleRoles.length} eligible roles for subscription ${subscriptionName}.`));
        return eligibleRoles;
    }
    catch (error) {
        if (error.statusCode === 403 || error.code === "AuthorizationFailed") {
            console.log(chalk_1.default.redBright(`Insufficient permissions to fetch eligible roles for subscription ${subscriptionId}.`));
            return [];
        }
        throw error;
    }
};
exports.fetchEligibleRolesForSubscription = fetchEligibleRolesForSubscription;
const listActiveAzureRoles = async (credential, subscriptionId, subscriptionName, principalId) => {
    console.log(chalk_1.default.blueBright(`Fetching active roles for subscription ${subscriptionName}...`));
    const client = new arm_authorization_1.AuthorizationManagementClient(credential, subscriptionId);
    const scope = `/subscriptions/${subscriptionId}`;
    const activeRoles = [];
    try {
        const schedules = client.roleAssignmentSchedules.listForScope(scope, {
            filter: `asTarget()`,
        });
        for await (const schedule of schedules) {
            if (schedule.id && schedule.roleDefinitionId && schedule.assignmentType === "Activated") {
                activeRoles.push({
                    id: schedule.id,
                    roleDefinitionId: schedule.roleDefinitionId,
                    roleName: schedule.expandedProperties?.roleDefinition?.displayName || "Unknown Role",
                    scope: schedule.scope || scope,
                    scopeDisplayName: getScopeDisplayName(schedule.scope || scope),
                    principalId: schedule.principalId || principalId,
                    linkedRoleEligibilityScheduleId: schedule.linkedRoleEligibilityScheduleId || "",
                    startDateTime: schedule.startDateTime?.toISOString() || "",
                    endDateTime: schedule.endDateTime?.toISOString() || "",
                    subscriptionId,
                    subscriptionName,
                });
            }
        }
        console.log(chalk_1.default.greenBright(`Fetched ${activeRoles.length} active roles for subscription ${subscriptionName}.`));
        return activeRoles;
    }
    catch (error) {
        if (error.statusCode === 403 || error.code === "AuthorizationFailed") {
            console.log(chalk_1.default.redBright(`Insufficient permissions to fetch active roles for subscription ${subscriptionId}.`));
            return [];
        }
        throw error;
    }
};
exports.listActiveAzureRoles = listActiveAzureRoles;
const activateAzureRole = async (credential, request, subscriptionId) => {
    const client = new arm_authorization_1.AuthorizationManagementClient(credential, subscriptionId);
    const requestName = (0, uuid_1.v4)();
    const now = new Date();
    const durationISO = `PT${request.durationHours}H`;
    const linkedScheduleId = request.roleEligibilityScheduleId.includes("/")
        ? request.roleEligibilityScheduleId
        : `${request.scope}/providers/Microsoft.Authorization/roleEligibilitySchedules/${request.roleEligibilityScheduleId}`;
    const requestBody = {
        principalId: request.principalId,
        roleDefinitionId: request.roleDefinitionId,
        requestType: "SelfActivate",
        linkedRoleEligibilityScheduleId: linkedScheduleId,
        scheduleInfo: {
            startDateTime: now,
            expiration: {
                type: "AfterDuration",
                duration: durationISO,
            },
        },
        justification: request.justification,
    };
    console.log(chalk_1.default.blueBright(`Submitting activation request for role ${request.roleName}...`));
    try {
        const response = await client.roleAssignmentScheduleRequests.create(request.scope, requestName, requestBody);
        console.log(chalk_1.default.greenBright("Activation request submitted successfully."));
        console.log(chalk_1.default.greenBright(`Role Assignment Schedule Request ID: ${response.id}`));
        if (response.status === "Approved") {
            console.log(chalk_1.default.greenBright("Your role activation has been approved."));
        }
        else if (response.status === "Denied") {
            console.log(chalk_1.default.redBright("Your role activation has been denied."));
        }
        else if (response.status === "PendingApproval") {
            console.log(chalk_1.default.yellowBright("Your role activation is pending approval."));
        }
        else {
            console.log(chalk_1.default.yellowBright(`Your role activation is currently in status: ${response.status}`));
        }
    }
    catch (error) {
        console.error(chalk_1.default.redBright("Failed to submit activation request:", error));
    }
};
exports.activateAzureRole = activateAzureRole;
const deactivateAzureRole = async (credential, scope, roleEligibilityScheduleId, subscriptionId, principalId, roleDefinitionId) => {
    const client = new arm_authorization_1.AuthorizationManagementClient(credential, subscriptionId);
    const requestName = (0, uuid_1.v4)();
    const response = await client.roleAssignmentScheduleRequests.create(scope, requestName, {
        principalId,
        roleDefinitionId,
        requestType: "SelfDeactivate",
        linkedRoleEligibilityScheduleId: roleEligibilityScheduleId,
    });
    console.log(chalk_1.default.greenBright(`Deactivation request submitted successfully - ${response.name}`));
};
exports.deactivateAzureRole = deactivateAzureRole;
const getScopeDisplayName = (scope) => {
    if (!scope)
        return "Unknown Scope";
    const parts = scope.split("/");
    if (scope.includes("/managementGroups/")) {
        const mgIndex = parts.indexOf("managementGroups");
        return `Management Group: ${parts[mgIndex + 1]}`;
    }
    if (scope.includes("/resourceGroups/")) {
        const rgIndex = parts.indexOf("resourceGroups");
        const subIndex = parts.indexOf("subscriptions");
        return `Resource Group: ${parts[rgIndex + 1]} (Subscription: ${parts[subIndex + 1]})`;
    }
    if (scope.includes("/subscriptions/")) {
        const subIndex = parts.indexOf("subscriptions");
        return `Subscription: ${parts[subIndex + 1]}`;
    }
    return scope;
};
//# sourceMappingURL=azure-pim.js.map