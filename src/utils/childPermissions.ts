// Stub implementation - child permissions feature not fully implemented
export function checkChildPermission(action: string): boolean {
  return true; // Allow all actions for now
}

export function getChildPermissions(): Record<string, boolean> {
  return {};
}

export function decideChildAction(action: string, callback: () => void) {
  // Always allow action for now
  callback();
}

