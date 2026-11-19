export type AuditAction =
  "BORROW" | "RETURN" | "CREATE_BOOK" | "UPDATE_BOOK" | "DELETE_BOOK";

export function logAudit(
  userId: string,
  action: AuditAction,
  entityId: string,
) {
  console.log(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      userId,
      action,
      entityId,
    }),
  );
}
