"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SOLE_ADMIN_EMAIL = void 0;
exports.isSoleAdminEmail = isSoleAdminEmail;
exports.getEffectiveRole = getEffectiveRole;
exports.SOLE_ADMIN_EMAIL = 'admin@socmobile.vn';
function isSoleAdminEmail(email) {
    return email.trim().toLowerCase() === exports.SOLE_ADMIN_EMAIL;
}
function getEffectiveRole(email, role) {
    return role === 'ADMIN' && !isSoleAdminEmail(email) ? 'CUSTOMER' : role;
}
//# sourceMappingURL=admin.constants.js.map