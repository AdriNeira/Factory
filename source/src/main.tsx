import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Game, type Store } from './game/Game';
import './style.css';

const useStore: Store = <T,>(key: string, initial: T) => {
    const [value, setValue] = useState<T>(initial);
    const [ready, setReady] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        try {
            const raw = localStorage.getItem(key);
            if (raw !== null) setValue(JSON.parse(raw) as T);
        } catch {
            setMessage('Este navegador no permite guardar partidas.');
        }
        setReady(true);
    }, [key]);

    const save = (next: T) => {
        setValue(next);
        try {
            localStorage.setItem(key, JSON.stringify(next));
            setMessage('');
        } catch {
            setMessage('No se pudo guardar en este navegador.');
        }
    };

    return [value, save, { ready, message }];
};

createRoot(document.getElementById('root')!).render(<Game useStore={useStore} />);

if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js');
