'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, Menu, Plus, MessageSquare, Settings, User, Moon, Sun, LogOut, UserPlus, Users } from 'lucide-react';
import { useTheme } from '@/components/theme-provider';
import { useSession, signOut } from 'next-auth/react';
import { InviteDialog } from '@/components/invite-dialog';

type Message = {
  id: string;
  role: string;
  content: string;
  createdAt: string;
  user?: {
    name: string;
    avatar?: string | null;
  };
};

type Conversation = {
  id: string;
  title: string;
  updatedAt: string;
  _count?: {
    messages: number;
  };
};

type Member = {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string | null;
  };
};

export default function Home() {
  const { data: session } = useSession();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showNewRoomDialog, setShowNewRoomDialog] = useState(false);
  const [newRoomTitle, setNewRoomTitle] = useState('');
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showMembersPanel, setShowMembersPanel] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { theme, toggleTheme } = useTheme();

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  const fetchConversations = async () => {
    try {
      const res = await fetch('/api/conversations');
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
        if (data.length > 0 && !currentConversation) {
          setCurrentConversation(data[0].id);
        }
      }
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    }
  };

  const createNewRoom = async () => {
    if (!newRoomTitle.trim()) return;

    try {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newRoomTitle })
      });

      if (res.ok) {
        const newConv = await res.json();
        setConversations(prev => [newConv, ...prev]);
        setCurrentConversation(newConv.id);
        setNewRoomTitle('');
        setShowNewRoomDialog(false);
      }
    } catch (error) {
      console.error('Failed to create conversation:', error);
    }
  };

  const fetchMembers = async (conversationId: string) => {
    try {
      const res = await fetch(`/api/conversations/${conversationId}/members`);
      if (res.ok) {
        const data = await res.json();
        setMembers(data);
      }
    } catch (error) {
      console.error('Failed to fetch members:', error);
    }
  };

  const fetchMessages = async (conversationId?: string) => {
    try {
      const url = conversationId
        ? `/api/messages?conversationId=${conversationId}`
        : '/api/messages';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (currentConversation) {
      fetchMessages(currentConversation);
      fetchMembers(currentConversation);
    }
  }, [currentConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setInput('');

    // Optimistic update
    const tempId = Date.now().toString();
    setMessages(prev => [...prev, { id: tempId, role: 'user', content: userMessage, createdAt: new Date().toISOString() }]);

    try {
      setIsLoading(true);
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: userMessage,
          role: 'user',
          conversationId: currentConversation
        }),
      });

      if (res.ok) {
        const savedMessage = await res.json();
        // Replace optimistic message with real one (simplified here by refetching or just updating)
        // For now, we'll just fetch all to be safe and simple
        if (currentConversation) {
          fetchMessages(currentConversation);
        }
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border flex flex-col hidden md:flex">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h1 className="font-bold text-xl tracking-tight text-primary">Antigravity</h1>
          <button
            onClick={() => setShowNewRoomDialog(true)}
            className="p-2 hover:bg-secondary rounded-md transition-colors"
            title="新規チャットルーム"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* New Room Dialog */}
        {showNewRoomDialog && (
          <div className="p-4 border-b border-border bg-secondary/20">
            <input
              type="text"
              value={newRoomTitle}
              onChange={(e) => setNewRoomTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') createNewRoom();
                if (e.key === 'Escape') setShowNewRoomDialog(false);
              }}
              placeholder="ルーム名を入力..."
              className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-ring"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={createNewRoom}
                className="flex-1 px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90"
              >
                作成
              </button>
              <button
                onClick={() => {
                  setShowNewRoomDialog(false);
                  setNewRoomTitle('');
                }}
                className="flex-1 px-3 py-1.5 bg-secondary text-secondary-foreground rounded-md text-sm hover:bg-secondary/80"
              >
                キャンセル
              </button>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Recent Chats
          </div>
          {conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => setCurrentConversation(conv.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-left group ${currentConversation === conv.id ? 'bg-primary/10 border border-primary/20' : 'hover:bg-secondary/50'
                }`}
            >
              <MessageSquare className={`w-4 h-4 transition-colors ${currentConversation === conv.id ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'
                }`} />
              <span className="text-sm font-medium flex-1 truncate">{conv.title}</span>
              {conv._count && conv._count.messages > 0 && (
                <span className="text-xs text-muted-foreground">{conv._count.messages}</span>
              )}
            </button>
          ))}
        </div>

        <div className="p-4 border-t border-border">
          <div className="w-full flex items-center gap-3 px-3 py-2 rounded-md mb-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
              {session?.user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{session?.user?.name || 'User'}</p>
              <p className="text-xs text-muted-foreground truncate">{session?.user?.email || 'user@example.com'}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-destructive/10 hover:text-destructive transition-colors text-left text-sm"
          >
            <LogOut className="w-4 h-4" />
            <span>ログアウト</span>
          </button>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-background/50 relative">
        {/* Header */}
        <header className="h-14 border-b border-border flex items-center justify-between px-4 bg-background/80 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button className="md:hidden p-2 hover:bg-secondary rounded-md">
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="font-semibold">
              {conversations.find(c => c.id === currentConversation)?.title || 'Chat'}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowInviteDialog(true)}
              className="p-2 hover:bg-secondary rounded-full text-muted-foreground hover:text-foreground transition-colors"
              title="ユーザーを招待"
            >
              <UserPlus className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowMembersPanel(!showMembersPanel)}
              className="p-2 hover:bg-secondary rounded-full text-muted-foreground hover:text-foreground transition-colors"
              title="メンバー一覧"
            >
              <Users className="w-5 h-5" />
            </button>
            <button
              onClick={toggleTheme}
              className="p-2 hover:bg-secondary rounded-full text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button className="p-2 hover:bg-secondary rounded-full text-muted-foreground hover:text-foreground transition-colors">
              <User className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <MessageSquare className="w-12 h-12 mb-4 opacity-20" />
              <p>No messages yet. Start a conversation!</p>
            </div>
          )}

          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-4 max-w-3xl mx-auto ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>
                {msg.role === 'user' ? (msg.user?.name?.[0]?.toUpperCase() || 'U') : 'AI'}
              </div>
              <div className={`space-y-1 ${msg.role === 'user' ? 'text-right' : ''}`}>
                <div className={`flex items-center gap-2 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                  <span className="font-semibold text-sm">{msg.role === 'user' ? (msg.user?.name || 'User') : 'Antigravity AI'}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className={`inline-block text-sm text-left ${msg.role === 'user' ? 'bg-primary text-primary-foreground px-4 py-2 rounded-2xl rounded-tr-sm' : 'text-muted-foreground leading-relaxed'}`}>
                  {msg.content}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-border bg-background">
          <div className="max-w-3xl mx-auto relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className="w-full bg-secondary/50 border border-input hover:border-ring/50 focus:border-ring focus:ring-1 focus:ring-ring rounded-full py-3 pl-4 pr-12 text-sm transition-all outline-none placeholder:text-muted-foreground/70"
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <div className="text-center mt-2">
            <p className="text-[10px] text-muted-foreground">
              AI can make mistakes. Please review generated code.
            </p>
          </div>
        </div>
      </main>

      {/* Members Panel */}
      {showMembersPanel && currentConversation && (
        <aside className="w-64 bg-card border-l border-border p-4">
          <h3 className="font-semibold mb-4">メンバー ({members.length})</h3>
          <div className="space-y-2">
            {members.map((member) => (
              <div key={member.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-secondary/50">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                  {member.user.name[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{member.user.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{member.user.email}</p>
                </div>
              </div>
            ))}
          </div>
        </aside>
      )}

      {/* Invite Dialog */}
      {showInviteDialog && currentConversation && (
        <InviteDialog
          conversationId={currentConversation}
          onClose={() => setShowInviteDialog(false)}
          onInviteSuccess={() => {
            fetchMembers(currentConversation);
            setShowInviteDialog(false);
          }}
        />
      )}
    </div>
  );
}
