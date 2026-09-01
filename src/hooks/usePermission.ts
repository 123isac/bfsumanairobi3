import { useStaffAuth } from "@/contexts/StaffAuthContext";

/**
 * Returns true if the currently logged-in user has the given permission.
 * Admin users always return true for any permission.
 *
 * Usage:
 *   const canManageInventory = usePermission('manage_inventory');
 */
export const usePermission = (permissionKey: string): boolean => {
  const { hasPermission } = useStaffAuth();
  return hasPermission(permissionKey);
};
