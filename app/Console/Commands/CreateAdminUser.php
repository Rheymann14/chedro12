<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class CreateAdminUser extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'admin:create 
                            {--name= : Admin user name}
                            {--email= : Admin user email}
                            {--password= : Admin user password}
                            {--interactive : Run in interactive mode}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create a new admin user for the application';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Creating Admin User');
        $this->newLine();

        // Check if interactive mode is requested or if required options are missing
        if ($this->option('interactive') || !$this->option('name') || !$this->option('email') || !$this->option('password')) {
            return $this->interactiveMode();
        }

        return $this->nonInteractiveMode();
    }

    /**
     * Handle interactive mode
     */
    private function interactiveMode()
    {
        $name = $this->option('name') ?: $this->ask('Admin Name', 'Super Admin');
        $email = $this->option('email') ?: $this->ask('Admin Email');
        $password = $this->option('password') ?: $this->secret('Admin Password');

        // Validate inputs
        $validator = Validator::make([
            'name' => $name,
            'email' => $email,
            'password' => $password,
        ], [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
        ]);

        if ($validator->fails()) {
            $this->error('Validation failed:');
            foreach ($validator->errors()->all() as $error) {
                $this->error($error);
            }
            return 1;
        }

        return $this->createAdminUser($name, $email, $password);
    }

    /**
     * Handle non-interactive mode
     */
    private function nonInteractiveMode()
    {
        $name = $this->option('name');
        $email = $this->option('email');
        $password = $this->option('password');

        // Validate inputs
        $validator = Validator::make([
            'name' => $name,
            'email' => $email,
            'password' => $password,
        ], [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
        ]);

        if ($validator->fails()) {
            $this->error('Validation failed:');
            foreach ($validator->errors()->all() as $error) {
                $this->error($error);
            }
            return 1;
        }

        return $this->createAdminUser($name, $email, $password);
    }

    /**
     * Create the admin user
     */
    private function createAdminUser($name, $email, $password)
    {
        try {
            $user = User::updateOrCreate(
                ['email' => $email],
                [
                    'name' => $name,
                    'email' => $email,
                    'role' => 'admin',
                    'password' => Hash::make($password),
                    'email_verified_at' => now(),
                ]
            );

            $this->info('✅ Admin user created/updated successfully!');
            $this->newLine();
            $this->info('Admin Details:');
            $this->table(
                ['Field', 'Value'],
                [
                    ['Name', $user->name],
                    ['Email', $user->email],
                    ['Role', $user->role],
                    ['Created/Updated', $user->updated_at->format('Y-m-d H:i:s')],
                ]
            );

            $this->newLine();
            $this->warn('🔐 Security Reminder:');
            $this->warn('• Change the default password after first login');
            $this->warn('• Use a strong, unique password');
            $this->warn('• Enable two-factor authentication if available');

            return 0;
        } catch (\Exception $e) {
            $this->error('❌ Failed to create admin user: ' . $e->getMessage());
            return 1;
        }
    }
}
