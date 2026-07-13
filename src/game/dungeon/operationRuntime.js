import { operationTotalHours as defaultOperationTotalHours } from "./dungeonOperationModel.js";

export function advancePartyOperations({ operations = [], hours = 1, operationTotalHours = defaultOperationTotalHours }) {
  const remaining = [];
  const completed = [];
  operations.forEach((operation) => {
    operation.elapsed += hours;
    if (operation.elapsed >= operationTotalHours(operation)) {
      completed.push(operation);
    } else {
      remaining.push(operation);
    }
  });
  return {
    remaining,
    completed,
    completedPartyIds: completed.map((operation) => operation.partyId)
  };
}
