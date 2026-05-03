import auditRepository from './audit.repository.js';
import { sanitizeAuditData } from '../../utils/sanitize.js';

class AuditService {
  async log(req, action, resource, resourceId, details = {}) {
    try {
      const sanitizedDetails = sanitizeAuditData(details);
      
      const logData = {
        user_id: req.user ? req.user.id : null,
        action,
        resource,
        resource_id: resourceId,
        details: sanitizedDetails,
        ip_address: req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress
      };
      await auditRepository.create(logData);
    } catch (error) {
      console.error('Audit Log Error:', error);
      // Don't throw error to not break the main flow
    }
  }

  async getLogs(filters) {
    return await auditRepository.findAll(filters);
  }
}

export default new AuditService();
