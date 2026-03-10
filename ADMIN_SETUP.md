# Admin User Management System

This document explains how to create and manage admin users for the CHEDRO12 application.

## 🚀 Quick Start

### 1. Create Your First Admin User

```bash
# Interactive mode (recommended for first setup)
php artisan admin:create --interactive

# Non-interactive mode
php artisan admin:create --name="Your Name" --email="admin@yourdomain.com" --password="SecurePassword123!"
```

### 2. Run Database Seeder (Alternative)

```bash
# This will create an initial admin with random credentials
php artisan db:seed --class=AdminUserSeeder
```

## 📋 Available Commands

### Create Admin User
```bash
php artisan admin:create [options]

Options:
  --name=NAME          Admin user name
  --email=EMAIL        Admin user email  
  --password=PASSWORD  Admin user password
  --interactive        Run in interactive mode
```

**Examples:**
```bash
# Interactive mode
php artisan admin:create --interactive

# Quick creation
php artisan admin:create --name="John Doe" --email="john@example.com" --password="MySecurePass123!"

# Interactive with pre-filled name
php artisan admin:create --name="Jane Doe" --interactive
```

### Manage Admin Users
```bash
php artisan admin:manage {action} [options]

Actions:
  list                 List all admin users
  delete               Delete an admin user
  reset-password       Reset admin password

Options:
  --email=EMAIL        Admin email for delete/reset operations
  --password=PASSWORD  New password for reset operation
```

**Examples:**
```bash
# List all admins
php artisan admin:manage list

# Delete an admin
php artisan admin:manage delete --email="oldadmin@example.com"

# Reset password
php artisan admin:manage reset-password --email="admin@example.com" --password="NewPassword123!"

# Interactive delete
php artisan admin:manage delete
```

## 🔐 Security Best Practices

### For Development
1. Use the seeder for initial setup:
   ```bash
   php artisan db:seed --class=AdminUserSeeder
   ```
2. Save the generated credentials securely
3. Change passwords after first login

### For Production
1. **Never use the seeder in production**
2. Create admin users manually:
   ```bash
   php artisan admin:create --name="Production Admin" --email="admin@yourdomain.com" --password="VerySecurePassword123!"
   ```
3. Use strong, unique passwords
4. Consider implementing two-factor authentication
5. Regularly audit admin users with `php artisan admin:manage list`

## 🛠️ Deployment Workflow

### Initial Setup
```bash
# 1. Run migrations
php artisan migrate

# 2. Create your first admin
php artisan admin:create --interactive

# 3. Verify admin was created
php artisan admin:manage list
```

### Adding Additional Admins
```bash
# Create additional admin
php artisan admin:create --name="Secondary Admin" --email="admin2@yourdomain.com" --password="AnotherSecurePass123!"

# Verify all admins
php artisan admin:manage list
```

### Removing Admins
```bash
# List current admins
php artisan admin:manage list

# Delete specific admin (system prevents deleting the last admin)
php artisan admin:manage delete --email="oldadmin@example.com"
```

## 🔧 Troubleshooting

### Common Issues

**1. "Admin user already exists"**
- Use `php artisan admin:manage list` to see existing admins
- Use `php artisan admin:manage delete` to remove unwanted admins

**2. "Cannot delete the last admin user"**
- Create another admin first, then delete the old one
- This prevents locking yourself out of the system

**3. "Validation failed"**
- Ensure email is valid and unique
- Password must be at least 8 characters
- Name is required

### Reset All Admins (Emergency)
```bash
# If you're locked out, you can reset via database
php artisan tinker

# In tinker:
User::where('role', 'admin')->delete();
exit

# Then create a new admin
php artisan admin:create --interactive
```

## 📝 Environment Variables (Optional)

For production environments, you can set default admin credentials in your `.env`:

```env
ADMIN_DEFAULT_NAME="System Administrator"
ADMIN_DEFAULT_EMAIL="admin@yourdomain.com"
ADMIN_DEFAULT_PASSWORD="YourSecurePassword123!"
```

Then modify the seeder to use these values instead of generating random ones.

## 🚨 Security Warnings

1. **Never commit admin credentials to version control**
2. **Change default passwords immediately after first login**
3. **Use strong, unique passwords (minimum 8 characters)**
4. **Regularly audit admin users and remove unused accounts**
5. **Consider implementing additional security measures like 2FA**

## 📞 Support

If you encounter issues with admin user management:

1. Check the Laravel logs: `storage/logs/laravel.log`
2. Verify database connection: `php artisan migrate:status`
3. Test user creation: `php artisan admin:create --interactive`
4. List existing users: `php artisan admin:manage list`
