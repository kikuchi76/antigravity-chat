'use client';

import { useState } from 'react';
import { Search, X, UserPlus } from 'lucide-react';

type User = {
    id: string;
    name: string;
    email: string;
    avatar?: string | null;
};

type InviteDialogProps = {
    conversationId: string;
    onClose: () => void;
    onInviteSuccess: () => void;
};

export function InviteDialog({ conversationId, onClose, onInviteSuccess }: InviteDialogProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<User[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isInviting, setIsInviting] = useState(false);

    const handleSearch = async (query: string) => {
        setSearchQuery(query);

        if (query.length < 2) {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);
        try {
            const res = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`);
            if (res.ok) {
                const users = await res.json();
                setSearchResults(users);
            }
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setIsSearching(false);
        }
    };

    const handleInvite = async (userId: string) => {
        setIsInviting(true);
        try {
            const res = await fetch(`/api/conversations/${conversationId}/members`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId })
            });

            if (res.ok) {
                onInviteSuccess();
                setSearchQuery('');
                setSearchResults([]);
            } else {
                const error = await res.json();
                console.error('Invite failed:', error);
                alert(error.error || '招待に失敗しました');
            }
        } catch (error) {
            console.error('Invite error:', error);
            alert('招待中にエラーが発生しました');
        } finally {
            setIsInviting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-card border border-border rounded-lg w-full max-w-md shadow-xl">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-border">
                    <h3 className="font-semibold text-lg">ユーザーを招待</h3>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-secondary rounded-md transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Search */}
                <div className="p-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                            placeholder="名前またはメールで検索..."
                            className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                            autoFocus
                        />
                    </div>
                </div>

                {/* Results */}
                <div className="max-h-80 overflow-y-auto px-4 pb-4">
                    {isSearching && (
                        <div className="text-center py-8 text-muted-foreground text-sm">
                            検索中...
                        </div>
                    )}

                    {!isSearching && searchQuery.length >= 2 && searchResults.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground text-sm">
                            ユーザーが見つかりませんでした
                        </div>
                    )}

                    {!isSearching && searchResults.length > 0 && (
                        <div className="space-y-2">
                            {searchResults.map((user) => (
                                <div
                                    key={user.id}
                                    className="flex items-center justify-between p-3 rounded-md hover:bg-secondary/50 transition-colors"
                                >
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold flex-shrink-0">
                                            {user.name[0]?.toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-sm truncate">{user.name}</p>
                                            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleInvite(user.id)}
                                        disabled={isInviting}
                                        className="p-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 flex-shrink-0"
                                        title="招待"
                                    >
                                        <UserPlus className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {searchQuery.length < 2 && (
                        <div className="text-center py-8 text-muted-foreground text-sm">
                            2文字以上入力して検索してください
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
