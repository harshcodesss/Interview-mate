"use client"

import { useRouter } from "next/navigation";

export default function DashboardPage() {
    const router = useRouter();
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-4">
            <h1 className="text-4xl font-bold mb-6">Welcome to Dashboard</h1>
            <button
                onClick={() => router.push('/login')}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
                Logout
            </button>
        </main>
    );
}