const express = require('express');
const router = express.Router();
const permitController = require('../controllers/permit.controller');
const { authenticateToken, isApprover } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// Get all permits
router.get('/', permitController.getAllPermits);

// Get permit by ID (with full details)
router.get('/:id', permitController.getPermitById);

// Create new permit
router.post('/', permitController.createPermit);

// Update permit
router.put('/:id', permitController.updatePermit);

// Delete permit (only Draft status)
router.delete('/:id', permitController.deletePermit);

// Submit permit for approval
router.post('/:id/submit', permitController.submitPermit);

// Approve permit (Approvers only)
router.post('/:id/approve', isApprover, permitController.approvePermit);

// Reject permit (Approvers only)
router.post('/:id/reject', isApprover, permitController.rejectPermit);

// Request extension
router.post('/:id/extend', permitController.requestExtension);

// Approve extension (Approvers only)
router.post('/:id/extension/:extensionId/approve', isApprover, permitController.approveExtension);

// Close permit
router.post('/:id/close', permitController.closePermit);

// Get permits by status
router.get('/status/:status', permitController.getPermitsByStatus);

// Get user's permits
router.get('/user/my-permits', permitController.getUserPermits);

// Get permits pending approval
router.get('/pending/approvals', isApprover, permitController.getPendingApprovals);

module.exports = router;