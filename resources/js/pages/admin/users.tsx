import AppFooter from '@/components/app-footer';
import { HeaderLogos } from '@/components/global-components';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import axios from 'axios';
import { CheckCircle, Edit, Trash2, UserPlus } from 'lucide-react';
import * as React from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin',
        href: '#',
    },
    {
        title: 'User Management',
        href: '#',
    },
];

type User = {
    id: number;
    name: string;
    email: string;
    role: 'user' | 'admin';
    created_at: string;
};

export default function AdminUsers() {
    const { props } = usePage<{ users: User[] }>();
    const [users, setUsers] = React.useState<User[]>(props.users ?? []);

    // Sync local state with props when page loads
    React.useEffect(() => {
        setUsers(props.users ?? []);
    }, [props.users]);

    const [open, setOpen] = React.useState(false);
    const [editing, setEditing] = React.useState<User | null>(null);
    const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
    const [userToDelete, setUserToDelete] = React.useState<User | null>(null);
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [isDeleting, setIsDeleting] = React.useState(false);
    const [searchTerm, setSearchTerm] = React.useState('');
    const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({});

    const getCsrfToken = () => (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? '';

    const showSuccessMessage = (message: string) => {
        setSuccessMessage(message);
        setErrorMessage(null);
        setTimeout(() => setSuccessMessage(null), 5000);
    };

    const showErrorMessage = (message: string) => {
        setErrorMessage(message);
        setSuccessMessage(null);
        setTimeout(() => setErrorMessage(null), 5000);
    };

    // Filter users based on search term
    const filteredUsers = React.useMemo(() => {
        if (!searchTerm.trim()) {
            return users;
        }

        const term = searchTerm.toLowerCase();
        return users.filter(
            (user) => user.name.toLowerCase().includes(term) || user.email.toLowerCase().includes(term) || user.role.toLowerCase().includes(term),
        );
    }, [users, searchTerm]);

    const { data, setData, post, processing, reset, errors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 'user' as 'user' | 'admin',
    });

    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};

        // Validate name
        if (!data.name || data.name.trim() === '') {
            errors.name = 'Name is required.';
        } else if (data.name.trim().length < 2) {
            errors.name = 'Name must be at least 2 characters.';
        }

        // Validate email
        if (!data.email || data.email.trim() === '') {
            errors.email = 'Email is required.';
        } else {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(data.email)) {
                errors.email = 'Please enter a valid email address.';
            }
        }

        // Validate password
        if (!editing && (!data.password || data.password.trim() === '')) {
            errors.password = 'Password is required.';
        } else if (data.password && data.password.length < 8) {
            errors.password = 'Password must be at least 8 characters.';
        }

        // Validate password confirmation
        if (data.password) {
            if (!data.password_confirmation || data.password_confirmation.trim() === '') {
                errors.password_confirmation = 'Please confirm your password.';
            } else if (data.password !== data.password_confirmation) {
                errors.password_confirmation = 'Passwords do not match.';
            }
        }

        // Validate role
        if (!data.role) {
            errors.role = 'Role is required.';
        }

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validate form before submitting
        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        if (editing) {
            const updateData: any = {
                name: data.name,
                email: data.email,
                role: data.role,
            };

            if (data.password) {
                updateData.password = data.password;
                updateData.password_confirmation = data.password_confirmation;
            }

            const csrfToken = getCsrfToken();
            if (!csrfToken) {
                showErrorMessage('CSRF token not found. Please refresh the page and try again.');
                setIsSubmitting(false);
                return;
            }

            axios
                .put(`/admin/users/${editing.id}`, updateData, {
                    headers: {
                        'X-CSRF-TOKEN': csrfToken,
                        'Accept': 'application/json',
                    },
                    withCredentials: true,
                })
                .then((response) => {
                    const updatedUser = response.data.user;
                    setUsers(users.map((user) => (user.id === editing.id ? updatedUser : user)));
                    reset();
                    setEditing(null);
                    setFieldErrors({});
                    setOpen(false);
                    showSuccessMessage(response.data.message);
                })
                .catch((error) => {
                    console.error('Update failed:', error);
                    let errorMsg = 'Failed to update user. Please try again.';
                    
                    if (error?.response?.status === 419) {
                        errorMsg = 'Session expired. Please refresh the page and try again.';
                    } else if (error?.response?.status === 422) {
                        // Set field errors from backend validation
                        const errors = error?.response?.data?.errors;
                        if (errors) {
                            const backendFieldErrors: Record<string, string> = {};
                            Object.entries(errors).forEach(([field, messages]) => {
                                const msgArray = Array.isArray(messages) ? messages : [messages];
                                backendFieldErrors[field] = msgArray.join(', ');
                            });
                            setFieldErrors(backendFieldErrors);

                            const errorMessages = Object.entries(errors)
                                .map(([field, messages]) => {
                                    const fieldLabel = field === 'name' ? 'Name' :
                                                      field === 'email' ? 'Email' :
                                                      field === 'password' ? 'Password' :
                                                      field === 'password_confirmation' ? 'Password Confirmation' :
                                                      field === 'role' ? 'Role' :
                                                      field;
                                    const msgArray = Array.isArray(messages) ? messages : [messages];
                                    return `${fieldLabel}: ${msgArray.join(', ')}`;
                                })
                                .join(' | ');
                            errorMsg = errorMessages || 'Validation failed. Please check all required fields.';
                        } else {
                            errorMsg = error?.response?.data?.message || 'Validation failed. Please check all required fields.';
                        }
                    } else if (error?.response?.data?.message) {
                        errorMsg = error.response.data.message;
                    }
                    
                    showErrorMessage(errorMsg);
                })
                .finally(() => {
                    setIsSubmitting(false);
                });
        } else {
            const csrfToken = getCsrfToken();
            if (!csrfToken) {
                showErrorMessage('CSRF token not found. Please refresh the page and try again.');
                setIsSubmitting(false);
                return;
            }

            axios
                .post('/admin/users', data, {
                    headers: {
                        'X-CSRF-TOKEN': csrfToken,
                        'Accept': 'application/json',
                    },
                    withCredentials: true,
                })
                .then((response) => {
                    const newUser = response.data.user;
                    setUsers([newUser, ...users]);
                    setData({
                        name: '',
                        email: '',
                        password: '',
                        password_confirmation: '',
                        role: 'user',
                    });
                    setFieldErrors({});
                    setOpen(false);
                    showSuccessMessage(response.data.message);
                })
                .catch((error) => {
                    console.error('Create failed:', error);
                    console.error('Error response:', error?.response?.data);
                    
                    let errorMsg = 'Failed to create user. Please try again.';
                    
                    if (error?.response?.status === 419) {
                        errorMsg = 'Session expired. Please refresh the page and try again.';
                    } else if (error?.response?.status === 422) {
                        // Set field errors from backend validation
                        const errors = error?.response?.data?.errors;
                        if (errors) {
                            const backendFieldErrors: Record<string, string> = {};
                            Object.entries(errors).forEach(([field, messages]) => {
                                const msgArray = Array.isArray(messages) ? messages : [messages];
                                backendFieldErrors[field] = msgArray.join(', ');
                            });
                            setFieldErrors(backendFieldErrors);

                            const errorMessages = Object.entries(errors)
                                .map(([field, messages]) => {
                                    const fieldLabel = field === 'name' ? 'Name' :
                                                      field === 'email' ? 'Email' :
                                                      field === 'password' ? 'Password' :
                                                      field === 'password_confirmation' ? 'Password Confirmation' :
                                                      field === 'role' ? 'Role' :
                                                      field;
                                    const msgArray = Array.isArray(messages) ? messages : [messages];
                                    return `${fieldLabel}: ${msgArray.join(', ')}`;
                                })
                                .join(' | ');
                            errorMsg = errorMessages || 'Validation failed. Please check all required fields.';
                        } else {
                            errorMsg = error?.response?.data?.message || 'Validation failed. Please check all required fields.';
                        }
                    } else if (error?.response?.data?.message) {
                        errorMsg = error.response.data.message;
                    }
                    
                    showErrorMessage(errorMsg);
                })
                .finally(() => {
                    setIsSubmitting(false);
                });
        }
    };

    const handleDeleteClick = (user: User) => {
        setUserToDelete(user);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (userToDelete) {
            setIsDeleting(true);
            const csrfToken = getCsrfToken();
            if (!csrfToken) {
                showErrorMessage('CSRF token not found. Please refresh the page and try again.');
                setIsDeleting(false);
                return;
            }

            axios
                .delete(`/admin/users/${userToDelete.id}`, {
                    headers: {
                        'X-CSRF-TOKEN': csrfToken,
                        'Accept': 'application/json',
                    },
                    withCredentials: true,
                })
                .then((response) => {
                    setUsers(users.filter((user) => user.id !== userToDelete.id));
                    setDeleteDialogOpen(false);
                    setUserToDelete(null);
                    showSuccessMessage(response.data.message);
                })
                .catch((error) => {
                    console.error('Delete failed:', error);
                    let errorMsg = 'Failed to delete user. Please try again.';
                    
                    if (error?.response?.status === 419) {
                        errorMsg = 'Session expired. Please refresh the page and try again.';
                    } else if (error?.response?.data?.message) {
                        errorMsg = error.response.data.message;
                    }
                    
                    showErrorMessage(errorMsg);
                })
                .finally(() => {
                    setIsDeleting(false);
                });
        }
    };

    const openCreate = () => {
        setEditing(null);
        setData({
            name: '',
            email: '',
            password: '',
            password_confirmation: '',
            role: 'user',
        });
        setOpen(true);
    };

    const handleDialogClose = (open: boolean) => {
        setOpen(open);
        if (!open) {
            // Reset form when dialog closes
            setEditing(null);
            setData({
                name: '',
                email: '',
                password: '',
                password_confirmation: '',
                role: 'user',
            });
            // Clear any form errors
            reset();
            setFieldErrors({});
        }
    };

    const openEdit = (user: User) => {
        setEditing(user);
        setData({
            name: user.name,
            email: user.email,
            password: '',
            password_confirmation: '',
            role: user.role,
        });
        setOpen(true);
    };

    return (
        <>
            <AppLayout breadcrumbs={breadcrumbs} searchTerm={searchTerm} onSearchChange={setSearchTerm}>
                <Head title="Admin - User Management" />

                {/**Header*/}
                <div className="mx-w-5 container p-4">
                    <HeaderLogos />
                    <div className="mx-w-5 container flex min-h-[10px] items-center justify-between border-b dark:bg-blend-color">
                        <header className="mb-4">
                            <h1 className="text-2xl font-bold">USER MANAGEMENT</h1>
                        </header>
                        <Button className="bg-blue-700 text-white" onClick={openCreate}>
                            <UserPlus className="mr-2 h-4 w-4" />
                            Create User
                        </Button>
                    </div>

                    {successMessage && (
                        <div className="mx-w-5 container mt-4">
                            <Alert className="border-green-200 bg-green-50 text-green-800">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <AlertDescription>{successMessage}</AlertDescription>
                            </Alert>
                        </div>
                    )}
                    {errorMessage && (
                        <div className="mx-w-5 container mt-4">
                            <Alert className="border-red-200 bg-red-50 text-red-800">
                                <AlertDescription>{errorMessage}</AlertDescription>
                            </Alert>
                        </div>
                    )}

                    <div className="mx-w-5 container mt-2">
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                            {/* Left Column */}
                            <div className="space-y-4 md:col-span-2">
                                {searchTerm && (
                                    <div className="mb-1 text-sm text-gray-600">
                                        {filteredUsers.length} of {users.length} users match your search
                                    </div>
                                )}
                                <div className="grid grid-cols-1 gap-4">
                                    {filteredUsers.length === 0 && users.length === 0 && (
                                        <div className="rounded-md border p-4 text-sm text-gray-600">No users yet.</div>
                                    )}
                                    {filteredUsers.length === 0 && users.length > 0 && (
                                        <div className="rounded-md border p-4 text-sm text-gray-600">No users found matching your search.</div>
                                    )}
                                    {filteredUsers.map((user) => (
                                        <div key={user.id} className="flex gap-6 rounded-lg border p-6">
                                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                                                <span className="text-lg font-semibold text-blue-600">{user.name.charAt(0).toUpperCase()}</span>
                                            </div>

                                            <div className="flex-1">
                                                <h3 className="text-lg font-semibold">{user.name}</h3>
                                                <p className="text-sm text-gray-600">{user.email}</p>
                                                <div className="mt-2 flex items-center gap-2">
                                                    <span
                                                        className={`rounded-full px-2 py-1 text-xs font-medium ${
                                                            user.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                                                        }`}
                                                    >
                                                        {user.role.toUpperCase()}
                                                    </span>
                                                    <span className="text-xs text-gray-500">
                                                        Created: {new Date(user.created_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <div className="items-top mt-4 flex justify-end gap-2">
                                                    <Button variant="outline" onClick={() => openEdit(user)}>
                                                        <Edit className="mr-2 h-4 w-4" />
                                                        Edit
                                                    </Button>
                                                    <Button variant="destructive" onClick={() => handleDeleteClick(user)}>
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Delete
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Right Column */}
                            <div className="space-y-6">
                                {/* Admin Navigation */}
                                <Card>
                                    <CardContent className="p-4">
                                        <h3 className="mb-3 font-semibold">Admin Panel</h3>
                                        <div className="space-y-2">
                                            <Link href="/admin/careerPost" className="block text-sm text-blue-600 hover:underline">
                                                Career Post Management
                                            </Link>
                                            <Link href="/admin/postings" className="block text-sm text-blue-600 hover:underline">
                                                Postings Management
                                            </Link>
                                            <Link href="/admin/users" className="block text-sm text-blue-600 hover:underline">
                                                User Management
                                            </Link>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Statistics */}
                                <Card>
                                    <CardContent className="p-4">
                                        <h3 className="mb-3 font-semibold">User Statistics</h3>
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">Total Users:</span>
                                                <span className="font-semibold">{users.length}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">Admins:</span>
                                                <span className="font-semibold">{users.filter((u) => u.role === 'admin').length}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">Regular Users:</span>
                                                <span className="font-semibold">{users.filter((u) => u.role === 'user').length}</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                </div>
            </AppLayout>
            <Dialog open={open} onOpenChange={handleDialogClose}>
                <DialogContent className="w-full max-w-md">
                    <DialogHeader>
                        <DialogTitle>{editing ? 'Edit User' : 'Create User'}</DialogTitle>
                        <DialogDescription className="sr-only">
                            {editing ? 'Edit existing user details' : 'Create a new user account'}
                        </DialogDescription>
                    </DialogHeader>
                    <form key={editing ? `edit-${editing.id}` : 'create'} onSubmit={submit} className="space-y-4">
                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                Name {fieldErrors.name && <span className="text-destructive text-sm">({fieldErrors.name})</span>}
                            </label>
                            <input
                                className={`w-full rounded border px-3 py-2 ${fieldErrors.name ? 'border-red-500' : ''}`}
                                value={data.name}
                                onChange={(e) => {
                                    setData('name', e.target.value);
                                    if (fieldErrors.name) {
                                        setFieldErrors((prev) => {
                                            const newErrors = { ...prev };
                                            delete newErrors.name;
                                            return newErrors;
                                        });
                                    }
                                }}
                                required
                            />
                            {fieldErrors.name && (
                                <p className="mt-1 text-sm text-red-600">{fieldErrors.name}</p>
                            )}
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                Email {fieldErrors.email && <span className="text-destructive text-sm">({fieldErrors.email})</span>}
                            </label>
                            <input
                                type="email"
                                className={`w-full rounded border px-3 py-2 ${fieldErrors.email ? 'border-red-500' : ''}`}
                                value={data.email}
                                onChange={(e) => {
                                    setData('email', e.target.value);
                                    if (fieldErrors.email) {
                                        setFieldErrors((prev) => {
                                            const newErrors = { ...prev };
                                            delete newErrors.email;
                                            return newErrors;
                                        });
                                    }
                                }}
                                required
                            />
                            {fieldErrors.email && (
                                <p className="mt-1 text-sm text-red-600">{fieldErrors.email}</p>
                            )}
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                Password {fieldErrors.password && <span className="text-destructive text-sm">({fieldErrors.password})</span>}
                            </label>
                            <input
                                type="password"
                                className={`w-full rounded border px-3 py-2 ${fieldErrors.password ? 'border-red-500' : ''}`}
                                value={data.password}
                                onChange={(e) => {
                                    setData('password', e.target.value);
                                    // Clear password confirmation error if password changes
                                    if (fieldErrors.password) {
                                        setFieldErrors((prev) => {
                                            const newErrors = { ...prev };
                                            delete newErrors.password;
                                            return newErrors;
                                        });
                                    }
                                    if (fieldErrors.password_confirmation && data.password_confirmation) {
                                        // Re-validate password confirmation
                                        if (e.target.value !== data.password_confirmation) {
                                            setFieldErrors((prev) => ({
                                                ...prev,
                                                password_confirmation: 'Passwords do not match.',
                                            }));
                                        } else {
                                            setFieldErrors((prev) => {
                                                const newErrors = { ...prev };
                                                delete newErrors.password_confirmation;
                                                return newErrors;
                                            });
                                        }
                                    }
                                }}
                                required={!editing}
                                placeholder={editing ? 'Leave blank to keep current password' : 'Minimum 8 characters'}
                            />
                            {fieldErrors.password && (
                                <p className="mt-1 text-sm text-red-600">{fieldErrors.password}</p>
                            )}
                            {!editing && !fieldErrors.password && (
                                <p className="mt-1 text-xs text-gray-500">Password must be at least 8 characters</p>
                            )}
                        </div>
                        {data.password && (
                            <div>
                                <label className="mb-1 block text-sm font-medium">
                                    Confirm Password {fieldErrors.password_confirmation && <span className="text-destructive text-sm">({fieldErrors.password_confirmation})</span>}
                                </label>
                                <input
                                    type="password"
                                    className={`w-full rounded border px-3 py-2 ${fieldErrors.password_confirmation ? 'border-red-500' : ''}`}
                                    value={data.password_confirmation}
                                    onChange={(e) => {
                                        setData('password_confirmation', e.target.value);
                                        if (fieldErrors.password_confirmation) {
                                            // Clear error if passwords now match
                                            if (e.target.value === data.password) {
                                                setFieldErrors((prev) => {
                                                    const newErrors = { ...prev };
                                                    delete newErrors.password_confirmation;
                                                    return newErrors;
                                                });
                                            } else if (e.target.value) {
                                                setFieldErrors((prev) => ({
                                                    ...prev,
                                                    password_confirmation: 'Passwords do not match.',
                                                }));
                                            }
                                        }
                                    }}
                                    required
                                />
                                {fieldErrors.password_confirmation && (
                                    <p className="mt-1 text-sm text-red-600">{fieldErrors.password_confirmation}</p>
                                )}
                            </div>
                        )}
                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                Role {fieldErrors.role && <span className="text-destructive text-sm">({fieldErrors.role})</span>}
                            </label>
                            <select
                                className={`w-full rounded border px-3 py-2 ${fieldErrors.role ? 'border-red-500' : ''}`}
                                value={data.role}
                                onChange={(e) => {
                                    setData('role', e.target.value as 'user' | 'admin');
                                    if (fieldErrors.role) {
                                        setFieldErrors((prev) => {
                                            const newErrors = { ...prev };
                                            delete newErrors.role;
                                            return newErrors;
                                        });
                                    }
                                }}
                                required
                            >
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                            </select>
                            {fieldErrors.role && (
                                <p className="mt-1 text-sm text-red-600">{fieldErrors.role}</p>
                            )}
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                            <Button type="button" variant="outline" onClick={() => handleDialogClose(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={processing || isSubmitting}>
                                {isSubmitting ? 'Saving...' : editing ? 'Save' : 'Create'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>This action cannot be undone. This will permanently delete this user account.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setDeleteDialogOpen(false)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            disabled={isDeleting}
                            className="bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                        >
                            {isDeleting ? 'Deleting...' : 'Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <AppFooter />
        </>
    );
}
