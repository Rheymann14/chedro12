import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, rectSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Edit, GripVertical, Plus, Trash2, CheckCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

type HeaderMenuItem = {
    id: string;
    title: string;
    href: string;
    order: number;
};

export function AppHeaderMenuAdmin() {
    const [menuItems, setMenuItems] = useState<HeaderMenuItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<HeaderMenuItem | null>(null);
    const [itemToDelete, setItemToDelete] = useState<HeaderMenuItem | null>(null);
    const [formData, setFormData] = useState({ title: '', href: '' });
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    );

    const fetchItems = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/app-header-menu', { credentials: 'same-origin' });
            const json = await res.json();
            const items = Array.isArray(json.items) ? json.items : [];
            // Sort by order
            items.sort((a: HeaderMenuItem, b: HeaderMenuItem) => (a.order ?? 0) - (b.order ?? 0));
            setMenuItems(items);
        } catch (error) {
            console.error('Error fetching header menu items:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
    }, []);

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setMenuItems((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over.id);
                const newItems = arrayMove(items, oldIndex, newIndex);
                // Update order values
                const reordered = newItems.map((item, index) => ({ ...item, order: index }));
                // Save to API
                saveOrder(reordered);
                return reordered;
            });
        }
    };

    const saveOrder = async (items: HeaderMenuItem[]) => {
        try {
            const response = await fetch('/api/app-header-menu/reorder', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'same-origin',
                body: JSON.stringify({ items }),
            });
            
            if (response.ok) {
                setToastMessage('Menu order updated successfully!');
                setTimeout(() => setToastMessage(null), 3000);
            } else {
                console.error('Error saving order:', response.statusText);
            }
        } catch (error) {
            console.error('Error saving order:', error);
        }
    };

    const openAdd = () => {
        setEditingItem(null);
        setFormData({ title: '', href: '' });
        setIsDialogOpen(true);
    };

    const openEdit = (item: HeaderMenuItem) => {
        setEditingItem(item);
        setFormData({ title: item.title, href: item.href });
        setIsDialogOpen(true);
    };

    const submit = async () => {
        if (!formData.title || !formData.href) return;

        const method = editingItem ? 'PUT' : 'POST';
        const url = editingItem ? `/api/app-header-menu/${editingItem.id}` : '/api/app-header-menu';

        try {
            await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                credentials: 'same-origin',
                body: JSON.stringify(formData),
            });
            setIsDialogOpen(false);
            setEditingItem(null);
            setFormData({ title: '', href: '' });
            fetchItems();
        } catch (error) {
            console.error('Error saving menu item:', error);
            alert('Failed to save menu item. Please try again.');
        }
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;

        try {
            await fetch(`/api/app-header-menu/${itemToDelete.id}`, {
                method: 'DELETE',
                credentials: 'same-origin',
            });
            setIsDeleteDialogOpen(false);
            setItemToDelete(null);
            fetchItems();
        } catch (error) {
            console.error('Error deleting menu item:', error);
            alert('Failed to delete menu item. Please try again.');
        }
    };

    if (isLoading) {
        return <div className="text-center text-sm text-gray-500 py-8">Loading header menu items…</div>;
    }

    return (
        <div className="space-y-4">
            {/* Toast Notification */}
            {toastMessage && (
                <div className="fixed top-4 right-4 z-50 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3 shadow-lg">
                        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                        <p className="text-sm font-medium text-green-800">{toastMessage}</p>
                    </div>
                </div>
            )}

            <div className="mb-6 flex justify-between items-center">
                <Button onClick={openAdd} className="flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700">
                    <Plus className="h-4 w-4" />
                    Add Menu Item
                </Button>
            </div>

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={menuItems.map((item) => item.id)} strategy={rectSortingStrategy}>
                    <div className="grid grid-cols-2 gap-4">
                        {menuItems.map((item, index) => (
                            <SortableMenuItem key={item.id} item={item} index={index} onEdit={openEdit} onDelete={() => { setItemToDelete(item); setIsDeleteDialogOpen(true); }} />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>

            {menuItems.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                    <p>No menu items yet. Click "Add Menu Item" to get started.</p>
                </div>
            )}
    
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
                            <Input id="title" placeholder="Menu item title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
                        </div>

                        <div>
                            <label htmlFor="href" className="mb-2 block text-sm font-medium">
                                Link (href)
                            </label>
                            <Input id="href" placeholder="e.g., /about, /resources, https://example.com" value={formData.href} onChange={(e) => setFormData({ ...formData, href: e.target.value })} />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={submit}>{editingItem ? 'Update' : 'Add'} Item</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Menu Item</DialogTitle>
                        <DialogDescription>Are you sure you want to delete "{itemToDelete?.title}"? This action cannot be undone.</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={confirmDelete}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function SortableMenuItem({ item, index, onEdit, onDelete }: { item: HeaderMenuItem; index: number; onEdit: (item: HeaderMenuItem) => void; onDelete: () => void }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} className="group relative">
            <Card className="transition-all hover:border-blue-400 hover:shadow-lg">
                <CardContent className="flex items-center gap-2 ">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-semibold text-sm flex-shrink-0">
                        {index + 1}
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                        <p className="mt-1 text-sm text-gray-600">{item.href}</p>
                    </div>
                    <div className="flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                        <Button variant="ghost" size="icon" onClick={() => onEdit(item)}>
                            <Edit className="h-4 w-4 text-blue-600" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={onDelete}>
                            <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                    </div>
                    <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600">
                        <GripVertical className=" h-5 w-5" />
                    </button>
                </CardContent>
            </Card>
        </div>
    );
}

