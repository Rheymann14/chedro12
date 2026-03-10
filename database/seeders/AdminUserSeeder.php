<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Check if admin user already exists
        $existingAdmin = User::where('role', 'admin')->first();
        
        if ($existingAdmin) {
            $this->command->info('Admin user already exists:');
            $this->command->info("Email: {$existingAdmin->email}");
            $this->command->warn('Use "php artisan admin:create" to create additional admin users.');
            return;
        }

        // Generate secure random credentials for initial setup
        $adminEmail = 'admin@' . config('app.url', 'localhost');
        $adminPassword = Str::random(16); // Generate a secure random password
        
        $user = User::create([
            'name' => 'System Administrator',
            'email' => $adminEmail,
            'role' => 'admin',
            'password' => Hash::make($adminPassword),
            'email_verified_at' => now(),
        ]);

        $this->command->info('🔐 Initial Admin User Created');
        $this->command->newLine();
        $this->command->info('Admin Details:');
        $this->command->table(
            ['Field', 'Value'],
            [
                ['Name', $user->name],
                ['Email', $user->email],
                ['Role', $user->role],
                ['Password', $adminPassword],
            ]
        );

        $this->command->newLine();
        $this->command->warn('🚨 SECURITY IMPORTANT:');
        $this->command->warn('• Save these credentials securely');
        $this->command->warn('• Change the password immediately after first login');
        $this->command->warn('• Use "php artisan admin:create" to create additional admin users');
        $this->command->warn('• Consider using environment variables for production');
    }
}
