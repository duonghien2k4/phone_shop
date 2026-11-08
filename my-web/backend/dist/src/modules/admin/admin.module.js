"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminModule = void 0;
const common_1 = require("@nestjs/common");
const admin_controller_1 = require("./admin.controller");
const admin_service_1 = require("./admin.service");
const database_module_1 = require("../../database/database.module");
const clerk_auth_guard_1 = require("../../common/guards/clerk-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const admin_role_policy_service_1 = require("./admin-role-policy.service");
const cloudinary_upload_service_1 = require("./cloudinary-upload.service");
let AdminModule = class AdminModule {
};
exports.AdminModule = AdminModule;
exports.AdminModule = AdminModule = __decorate([
    (0, common_1.Module)({
        imports: [database_module_1.DatabaseModule],
        controllers: [admin_controller_1.AdminController],
        providers: [
            admin_service_1.AdminService,
            clerk_auth_guard_1.ClerkAuthGuard,
            roles_guard_1.RolesGuard,
            admin_role_policy_service_1.AdminRolePolicyService,
            cloudinary_upload_service_1.CloudinaryUploadService,
        ],
        exports: [admin_service_1.AdminService],
    })
], AdminModule);
//# sourceMappingURL=admin.module.js.map