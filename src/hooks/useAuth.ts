import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

interface User {
    id: number;
    email: string;
    user_name: string;
    avatar_url: string;
    name: string;
}

interface Session {
    access_token: string;
    provider_token: string;
}

interface AuthState {
    user: User | null;
    session: Session | null;
    authLoading: boolean;
    handleSignIn: () => void;
    handleSignOut: () => Promise<void>;
}

export function useAuth(): AuthState {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [authLoading, setAuthLoading] = useState(true);
    const navigate = useNavigate();

    const fetchSession = useCallback(async () => {
        try {
            const response = await fetch('/api/auth/session');
            const data = await response.json();
            setUser(data.user);
            setSession(data.session);
        } catch (err) {
            console.error('Failed to fetch session:', err);
        } finally {
            setAuthLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSession();
    }, [fetchSession]);

    const handleSignIn = () => {
        // Redirect the current page to GitHub OAuth (no popup)
        window.location.href = '/api/auth/github';
    };

    const handleSignOut = async () => {
        await fetch('/api/auth/signout', { method: 'POST' });
        setUser(null);
        setSession(null);
        navigate('/');
    };

    return { user, session, authLoading, handleSignIn, handleSignOut };
}
