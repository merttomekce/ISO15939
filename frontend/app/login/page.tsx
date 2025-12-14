"use client"

import { useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import Link from "next/link"


export default function Login() {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const { login } = useAuth()
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password })
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || "Login failed")
            }

            login(data.username, data.token)
            router.push("/dashboard")
        } catch (err: any) {
            setError(err.message)
        }
    }

    return (
        <div className="min-h-screen flex flex-col bg-background text-foreground">

            <main className="flex-1 flex items-center justify-center p-4">
                <div className="w-full max-w-md bg-card border border-border rounded-lg p-8 shadow-lg">
                    <h1 className="text-2xl font-bold mb-6 text-center">Welcome Back</h1>
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded mb-4 text-sm">
                            {error}
                        </div>
                    )}
                    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                        <div>
                            <label className="block text-sm font-medium mb-1">Username</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full p-2 border border-border rounded bg-background focus:ring-2 focus:ring-primary/50"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full p-2 border border-border rounded bg-background focus:ring-2 focus:ring-primary/50"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full py-2 bg-primary text-primary-foreground rounded hover:opacity-90 transition-opacity font-medium"
                        >
                            Login
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setUsername("testuser")
                                setPassword("password123")
                            }}
                            className="w-full text-xs text-primary hover:underline text-right"
                        >
                            Autofill Test Account
                        </button>
                    </form>
                    <p className="mt-4 text-center text-sm text-muted-foreground">
                        Don't have an account? <Link href="/register" className="text-primary hover:underline">Register</Link>
                    </p>
                </div>
            </main>
        </div>
    )
}
