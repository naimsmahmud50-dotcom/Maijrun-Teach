import { AdminAuditLog } from "./types"

const auditLogs: AdminAuditLog[] = []
const MAX_LOGS = 2000

export function recordAdminAudit({
  adminId,
  adminEmail,
  action,
  entityType,
  entityId,
  details = {},
}: {
  adminId: string
  adminEmail: string
  action: string
  entityType: AdminAuditLog["entityType"]
  entityId?: string
  details?: Record<string, any>
}): AdminAuditLog {
  const log: AdminAuditLog = {
    id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    adminId,
    adminEmail,
    action,
    entityType,
    entityId,
    details,
    timestamp: new Date().toISOString(),
  }

  auditLogs.push(log)
  if (auditLogs.length > MAX_LOGS) {
    auditLogs.shift()
  }

  if (process.env.NODE_ENV !== "test") {
    console.info(`[ADMIN_AUDIT] ${JSON.stringify(log)}`)
  }

  return log
}

export function getAdminAuditLogs(limit = 100): AdminAuditLog[] {
  return auditLogs.slice(-limit).reverse()
}

export function clearAdminAuditLogsForTests(): void {
  auditLogs.length = 0
}
