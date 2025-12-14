"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"


export default function Register() {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [error, setError] = useState("")
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")

        if (!username || !password || !confirmPassword) {
            setError("All fields are required.")
            return
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.")
            return
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters.")
            return
        }

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password })
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || "Registration failed")
            }

            // Redirect to login after success
            router.push("/login")
        } catch (err: any) {
            setError(err.message)
        }
    }

    return (
        <div className="min-h-screen flex flex-col bg-background text-foreground">

            <main className="flex-1 flex items-center justify-center p-4">
                <div className="w-full max-w-md bg-card border border-border rounded-lg p-8 shadow-lg">
                    <h1 className="text-2xl font-bold mb-6 text-center">Create Account</h1>
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
                            <label className="block text-sm font-medium mb-1">Password (min 6 chars)</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full p-2 border border-border rounded bg-background focus:ring-2 focus:ring-primary/50"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Confirm Password</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full p-2 border border-border rounded bg-background focus:ring-2 focus:ring-primary/50"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full py-2 bg-primary text-primary-foreground rounded hover:opacity-90 transition-opacity font-medium"
                        >
                            Register
                        </button>
                    </form>
                    <p className="mt-4 text-center text-sm text-muted-foreground">
                        Already have an account? <Link href="/login" className="text-primary hover:underline">Login</Link>
                    </p>
                </div>
            </main>
        </div>
    )
}
