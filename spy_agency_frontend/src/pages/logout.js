"use client"
import 'tailwindcss/tailwind.css';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Logout() {
    const router = useRouter();

    useEffect(() => {
        localStorage.clear()

        // Redirect to the home page
        router.push('/');
    }, []);

    return null;
}
