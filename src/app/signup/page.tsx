'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';

export default function SignupPage() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const res = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });

            if (!res.ok) {
                const data = await res.json();
                setError(data.error || 'サインアップに失敗しました');
                setIsLoading(false);
                return;
            }

            // Auto login after signup
            const result = await signIn('credentials', {
                email,
                password,
                redirect: false
            });

            if (result?.error) {
                setError('アカウントは作成されましたが、ログインに失敗しました');
            } else {
                router.push('/');
                router.refresh();
            }
        } catch (error) {
            setError('サインアップ中にエラーが発生しました');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
            <div className="w-full max-w-md">
                <div className="bg-card border border-border rounded-lg p-8 shadow-lg">
                    <h1 className="text-3xl font-bold text-center mb-2 text-primary">Antigravity Chat</h1>
                    <p className="text-center text-muted-foreground mb-8">新規アカウント作成</p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-md text-sm">
                                {error}
                            </div>
                        )}

                        <div>
                            <label htmlFor="name" className="block text-sm font-medium mb-2">
                                名前
                            </label>
                            <input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="w-full px-4 py-2 bg-secondary/50 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                                placeholder="山田太郎"
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium mb-2">
                                メールアドレス
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full px-4 py-2 bg-secondary/50 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                                placeholder="you@example.com"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium mb-2">
                                パスワード
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                                className="w-full px-4 py-2 bg-secondary/50 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                                placeholder="••••••••"
                            />
                            <p className="mt-1 text-xs text-muted-foreground">6文字以上で入力してください</p>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-primary text-primary-foreground py-3 rounded-md font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
                        >
                            {isLoading ? 'アカウント作成中...' : 'アカウント作成'}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm text-muted-foreground">
                        すでにアカウントをお持ちですか？{' '}
                        <Link href="/login" className="text-primary hover:underline font-medium">
                            ログイン
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
