'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface SearchComponentProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  className?: string;
}

export default function SearchComponent({
  placeholder = 'Search...',
  onSearch,
  className = '',
}: SearchComponentProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch(query);
  };

  return (
    <div className={`relative w-full max-w-sm ${className}`}>
      <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        placeholder={placeholder}
        value={searchQuery}
        onChange={handleInputChange}
        className="pl-8 w-60 bg-background text-foreground border-foreground/20"
      />
    </div>
  );
}