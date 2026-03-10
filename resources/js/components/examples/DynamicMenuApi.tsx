import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Edit, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

type MenuItem = {
    id: string;
    title: string;
    href: string;
    description: string;
};

export function DynamicMenuApi({ isAdmin = false, namespaceKey }: { isAdmin?: boolean; namespaceKey?: string }) {
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
    const [itemToDelete, setItemToDelete] = useState<MenuItem | null>(null);
    const [formData, setFormData] = useState({ title: '', href: '', description: '' });

    const baseUrl = namespaceKey ? `/api/menu-items/${namespaceKey}` : '/api/menu-items';

    const fetchItems = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(baseUrl, { credentials: 'same-origin' });
            const json = await res.json();
            setMenuItems(Array.isArray(json.items) ? json.items : []);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
    }, []);

    const openAdd = () => {
        setEditingItem(null);
        setFormData({ title: '', href: '', description: '' });
        setIsDialogOpen(true);
    };

    const openEdit = (item: MenuItem) => {
        setEditingItem(item);
        setFormData({ title: item.title, href: item.href, description: item.description });
        setIsDialogOpen(true);
    };

    const submit = async () => {
        if (!formData.title || !formData.href || !formData.description) return;
        const method = editingItem ? 'PUT' : 'POST';
        const url = editingItem ? `${baseUrl}/${editingItem.id}` : baseUrl;
        await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify(formData),
        });
        setIsDialogOpen(false);
        setEditingItem(null);
        setFormData({ title: '', href: '', description: '' });
        fetchItems();
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;
        await fetch(`${baseUrl}/${itemToDelete.id}`, { method: 'DELETE', credentials: 'same-origin' });
        setIsDeleteDialogOpen(false);
        setItemToDelete(null);
        fetchItems();
    };

    if (isLoading) {
        return <div className="text-center text-sm text-gray-500">Loading menu items…</div>;
    }

    return (
        <div className="space-y-4">
            {isAdmin && (
                <div className="mb-6 flex justify-end">
                    <Button onClick={openAdd} className="flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-600">
                        <Plus className="h-4 w-4" />
                        Add New Menu Item 
                    </Button>
                </div>
            )}

            <div className="grid gap-4">
                {menuItems.map((item) => (
                    <div key={item.id} className="group relative">
                        <a href={item.href} className="block">
                            <Card className="transition-all hover:border-blue-400 hover:shadow-lg">
                                <CardContent className="p-4">
                                    <h3 className="text-lg font-semibold text-gray-900 transition-colors group-hover:text-blue-600">
                                        {item.title}
                                    </h3>
                                    <p className="mt-1 text-sm text-gray-600">{item.description}</p>
                                </CardContent>
                            </Card>
                        </a>

                        {isAdmin && (
                            <div className="absolute right-2 top-2 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                                <Button variant="ghost" size="icon" onClick={() => openEdit(item)}>
                                    <Edit className="h-4 w-4 text-blue-600" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => { setItemToDelete(item); setIsDeleteDialogOpen(true); }}>
                                    <Trash2 className="h-4 w-4 text-red-600" />
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
                            <label htmlFor="title" className="mb-2 block text-sm font-medium">Title</label>
                            <Input id="title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
                        </div>
                        <div>
                            <label htmlFor="href" className="mb-2 block text-sm font-medium">Link (href)</label>
                            <Input id="href" value={formData.href} onChange={(e) => setFormData({ ...formData, href: e.target.value })} />
                        </div>
                        <div>
                            <label htmlFor="description" className="mb-2 block text-sm font-medium">Description</label>
                            <Input id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                        <Button onClick={submit}>{editingItem ? 'Update' : 'Add'} Item</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Menu Item</DialogTitle>
                        <DialogDescription>Are you sure you want to delete "{itemToDelete?.title}"?</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={confirmDelete}>Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default DynamicMenuApi;
