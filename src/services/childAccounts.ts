// Stub implementation - child accounts feature not fully implemented
export const childAccountsService = {
  async listMyChildren() {
    return [];
  },
  async touchLastActive(childId: string) {
    // No-op
  },
  async logActivity(childId: string, activity: any) {
    // No-op
  },
};

export function timeAgoLabel(date: Date | string): string {
  return 'Recently';
}




