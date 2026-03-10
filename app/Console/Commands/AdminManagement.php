<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AdminManagement extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'admin:manage 
                            {action : Action to perform (list|delete|reset-password)}
                            {--email= : Admin email for delete/reset operations}
                            {--password= : New password for reset operation}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Manage admin users (list, delete, reset password)';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $action = $this->argument('action');

        switch ($action) {
            case 'list':
                return $this->listAdmins();
            case 'delete':
                return $this->deleteAdmin();
            case 'reset-password':
                return $this->resetPassword();
            default:
                $this->error('Invalid action. Available actions: list, delete, reset-password');
                return 1;
        }
    }

    /**
     * List all admin users
     */
    private function listAdmins()
    {
        $admins = User::where('role', 'admin')->get();

        if ($admins->isEmpty()) {
            $this->info('No admin users found.');
            return 0;
        }

        $this->info('Admin Users:');
        $this->newLine();

        $headers = ['ID', 'Name', 'Email', 'Created At', 'Updated At'];
        $rows = $admins->map(function ($admin) {
            return [
                $admin->id,
                $admin->name,
                $admin->email,
                $admin->created_at->format('Y-m-d H:i:s'),
                $admin->updated_at->format('Y-m-d H:i:s'),
            ];
        })->toArray();

        $this->table($headers, $rows);
        return 0;
    }

    /**
     * Delete an admin user
     */
    private function deleteAdmin()
    {
        $email = $this->option('email');

        if (!$email) {
            $email = $this->ask('Enter admin email to delete');
        }

        $admin = User::where('email', $email)->where('role', 'admin')->first();

        if (!$admin) {
            $this->error("Admin user with email '{$email}' not found.");
            return 1;
        }

        // Prevent deleting the last admin
        $adminCount = User::where('role', 'admin')->count();
        if ($adminCount <= 1) {
            $this->error('Cannot delete the last admin user. At least one admin must remain.');
            return 1;
        }

        if ($this->confirm("Are you sure you want to delete admin user '{$admin->name}' ({$admin->email})?")) {
            $admin->delete();
            $this->info("✅ Admin user '{$admin->name}' has been deleted.");
            return 0;
        }

        $this->info('Operation cancelled.');
        return 0;
    }

    /**
     * Reset admin password
     */
    private function resetPassword()
    {
        $email = $this->option('email');
        $password = $this->option('password');

        if (!$email) {
            $email = $this->ask('Enter admin email to reset password');
        }

        $admin = User::where('email', $email)->where('role', 'admin')->first();

        if (!$admin) {
            $this->error("Admin user with email '{$email}' not found.");
            return 1;
        }

        if (!$password) {
            $password = $this->secret('Enter new password (min 8 characters)');
        }

        if (strlen($password) < 8) {
            $this->error('Password must be at least 8 characters long.');
            return 1;
        }

        $admin->update([
            'password' => Hash::make($password),
        ]);

        $this->info("✅ Password for admin user '{$admin->name}' has been reset.");
        $this->warn('🔐 Security Reminder: The user should change this password on next login.');
        return 0;
    }
}
