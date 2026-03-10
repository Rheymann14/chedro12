import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';
import * as React from 'react';

interface CareerPostSearchProps {
    searchTerm: string;
    onSearchChange: (term: string) => void;
    isVisible: boolean;
    onToggle: () => void;
}

export function CareerPostSearch({ searchTerm, onSearchChange, isVisible, onToggle }: CareerPostSearchProps) {
    const inputRef = React.useRef<HTMLInputElement>(null);

    React.useEffect(() => {
        if (isVisible && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isVisible]);

    const handleClear = () => {
        onSearchChange('');
    };

    if (!isVisible) {
        return (
            <Button 
                variant="ghost" 
                size="icon" 
                className="h-9 w-9 cursor-pointer"
                onClick={onToggle}
            >
                <Search className="!size-5 opacity-80 hover:opacity-100" />
            </Button>
        );
    }

    return (
        <div className="relative flex items-center">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                    ref={inputRef}
                    type="text"
                    placeholder="Search posts..."
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-64 pl-10 pr-10 h-9"
                />
                {searchTerm && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 hover:bg-gray-100"
                        onClick={handleClear}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                )}
            </div>
            <Button
                variant="ghost"
                size="icon"
                className="ml-2 h-9 w-9"
                onClick={onToggle}
            >
                <X className="h-4 w-4" />
            </Button>
        </div>
    );
}
