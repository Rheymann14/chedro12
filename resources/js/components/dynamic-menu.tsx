import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Edit, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

// Menu item interface
export interface MenuItem {
    id: string;
    title: string;
    href: string;
    description: string;
}

// Default localStorage key
const DEFAULT_MENU_ITEMS_KEY = 'menuItems';

// Default menu items (used as fallback)
const DEFAULT_MENU_ITEMS: MenuItem[] = [
    {
        id: '1',
        title: 'Historical Background',
        href: 'historicalBackground',
        description: "Learn about our organization's history and development",
    },
    {
        id: '2',
        title: 'Mandate',
        href: 'mandate',
        description: 'Our official mandate and responsibilities',
    },
    {
        id: '3',
        title: 'Vision and Mission',
        href: 'visionMission',
        description: 'Our vision for the future and mission statement',
    },
    {
        id: '4',
        title: 'Quality Policy Statement',
        href: 'policyStatement',
        description: 'Our commitment to quality and excellence',
    },
];

interface DynamicMenuProps {
    /** Default menu items to use if localStorage is empty */
    defaultItems?: MenuItem[];
    /** User role to determine if admin controls should be shown */
    userRole?: 'user' | 'admin';
    /** Custom localStorage key for storing menu items (defaults to 'menuItems') */
    storageKey?: string;
}

/**
 * DynamicMenu Component
 * A localStorage-based menu system with role-based admin controls
 */
export function DynamicMenu({
    defaultItems = DEFAULT_MENU_ITEMS,
    userRole,
    storageKey = DEFAULT_MENU_ITEMS_KEY,
}: DynamicMenuProps) {
    // Check if user is admin
    const isAdmin = userRole === 'admin';

    // State management
    const [menuItems, setMenuItems] = useState<MenuItem[]>(defaultItems);
    const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
    const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
    const [itemToDelete, setItemToDelete] = useState<MenuItem | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        href: '',
        description: '',
    });

    // Load data from localStorage on mount
    useEffect(() => {
        loadMenuItems();
    }, []);

    // Load menu items from localStorage
    const loadMenuItems = () => {
        try {
            const stored = localStorage.getItem(storageKey);
            if (stored) {
                const parsed = JSON.parse(stored) as MenuItem[];
                if (Array.isArray(parsed) && parsed.length > 0) {
                    setMenuItems(parsed);
                    return;
                }
            }
            // If no stored items, use defaults and save them
            setMenuItems(defaultItems);
            saveMenuItems(defaultItems);
        } catch (error) {
            console.error('Error loading menu items:', error);
            setMenuItems(defaultItems);
        }
    };

    // Save menu items to localStorage
    const saveMenuItems = (items: MenuItem[]) => {
        try {
            localStorage.setItem(storageKey, JSON.stringify(items));
        } catch (error) {
            console.error('Error saving menu items:', error);
        }
    };

    // Open dialog for adding new item
    const handleAddItem = () => {
        setEditingItem(null);
        setFormData({ title: '', href: '', description: '' });
        setIsDialogOpen(true);
    };

    // Open dialog for editing existing item
    const handleEditItem = (item: MenuItem) => {
        setEditingItem(item);
        setFormData({
            title: item.title,
            href: item.href,
            description: item.description,
        });
        setIsDialogOpen(true);
    };

    // Open delete confirmation dialog
    const handleDeleteClick = (item: MenuItem) => {
        setItemToDelete(item);
        setIsDeleteDialogOpen(true);
    };

    // Confirm and execute delete
    const handleConfirmDelete = () => {
        if (itemToDelete) {
            const updatedItems = menuItems.filter((item) => item.id !== itemToDelete.id);
            // Update state first for immediate UI update
            setMenuItems(updatedItems);
            // Save to localStorage
            saveMenuItems(updatedItems);
            // Close dialog and clear item
            setIsDeleteDialogOpen(false);
            setItemToDelete(null);
        }
    };

    // Handle form submission (add or edit)
    const handleSubmit = () => {
        if (!formData.title.trim() || !formData.href.trim() || !formData.description.trim()) {
            alert('Please fill in all fields');
            return;
        }

        let updatedItems: MenuItem[];

        if (editingItem) {
            // Update existing item
            updatedItems = menuItems.map((item) =>
                item.id === editingItem.id
                    ? {
                          ...item,
                          title: formData.title.trim(),
                          href: formData.href.trim(),
                          description: formData.description.trim(),
                      }
                    : item,
            );
        } else {
            // Add new item
            const newItem: MenuItem = {
                id: Date.now().toString(),
                title: formData.title.trim(),
                href: formData.href.trim(),
                description: formData.description.trim(),
            };
            updatedItems = [...menuItems, newItem];
        }

        // Update state first for immediate UI update
        setMenuItems(updatedItems);
        // Save to localStorage
        saveMenuItems(updatedItems);
        // Close dialog and reset form
        setIsDialogOpen(false);
        setEditingItem(null);
        setFormData({ title: '', href: '', description: '' });
    };

    return (
        <div className="space-y-4">
            {/* Admin Controls - Only show for admin users */}
            {isAdmin && (
                <div className="mb-6 flex justify-end">
                    <Button onClick={handleAddItem} className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Add New Menu Item
                    </Button>
                </div>
            )}

            {/* Menu Items Grid */}
            <div className="grid gap-4">
                {menuItems.map((item) => (
                    <div key={item.id} className="group relative">
                        <a href={item.href} className="block">
                            <Card className="transition-all hover:border-blue-400 hover:shadow-lg">
                                <CardContent className="p-4">
                                    <h3 className="text-lg font-semibold text-gray-900 transition-colors group-hover:text-blue-600 dark:text-gray-100">
                                        {item.title}
                                    </h3>
                                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
                                </CardContent>
                            </Card>
                        </a>

                        {/* Admin Action Buttons - Only visible for admin users */}
                        {isAdmin && (
                            <div className="absolute right-2 top-2 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 bg-white hover:bg-blue-50 dark:bg-gray-800 dark:hover:bg-gray-700"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleEditItem(item);
                                    }}
                                >
                                    <Edit className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 bg-white hover:bg-red-50 dark:bg-gray-800 dark:hover:bg-red-950/20"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleDeleteClick(item);
                                    }}
                                >
                                    <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                                </Button>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Add/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}</DialogTitle>
                        <DialogDescription>
                            {editingItem ? 'Update the menu item details below.' : 'Fill in the details to create a new menu item.'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div>
                            <label htmlFor="title" className="mb-2 block text-sm font-medium">
                                Title
                            </label>
                            <Input
                                id="title"
                                placeholder="Menu item title"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>

                        <div>
                            <label htmlFor="href" className="mb-2 block text-sm font-medium">
                                Link (href)
                            </label>
                            <Input
                                id="href"
                                placeholder="e.g., /about, historicalBackground, https://example.com"
                                value={formData.href}
                                onChange={(e) => setFormData({ ...formData, href: e.target.value })}
                            />
                        </div>

                        <div>
                            <label htmlFor="description" className="mb-2 block text-sm font-medium">
                                Description
                            </label>
                            <Input
                                id="description"
                                placeholder="Brief description of the menu item"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsDialogOpen(false);
                                setEditingItem(null);
                                setFormData({ title: '', href: '', description: '' });
                            }}
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleSubmit}>{editingItem ? 'Update' : 'Add'} Item</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Menu Item</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "{itemToDelete?.title}"? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsDeleteDialogOpen(false);
                                setItemToDelete(null);
                            }}
                        >
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleConfirmDelete}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

