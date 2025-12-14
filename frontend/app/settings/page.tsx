"use client"

import { useAuth } from "@/context/AuthContext"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function Settings() {
    const { token, logout } = useAuth()
    const [currentPassword, setCurrentPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [deletePassword, setDeletePassword] = useState("")
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null)
    const router = useRouter()

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault()
        setMessage(null)

        try {
            const res = await fetch("/api/auth/update-password", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ currentPassword, newPassword })
            })

            const data = await res.json()
            if (!res.ok) throw new Error(data.error)

            setMessage({ text: "Password updated successfully!", type: 'success' })
            setCurrentPassword("")
            setNewPassword("")
        } catch (err: any) {
            setMessage({ text: err.message, type: 'error' })
        }
    }

    const handleDeleteAccount = async () => {
        if (!confirm("Are you sure? This cannot be undone.")) return;

        try {
            const res = await fetch("/api/auth/delete-account", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ password: deletePassword })
            })

            const data = await res.json()
            if (!res.ok) throw new Error(data.error)

            logout()
        } catch (err: any) {
            setMessage({ text: err.message, type: 'error' })
        }
    }

    return (
        <div className="min-h-screen flex flex-col bg-background text-foreground">

            <main className="container mx-auto px-4 py-8 max-w-2xl">
                <h1 className="text-3xl font-bold mb-8">Settings</h1>

                {message && (
                    <div className={`p-4 rounded mb-6 ${message.type === 'success' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'} border`}>
                        {message.text}
                    </div>
                )}

                <div className="bg-card border border-border rounded-lg p-6 mb-8">
                    <h2 className="text-xl font-semibold mb-4">Change Password</h2>
                    <form onSubmit={handleUpdatePassword} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Current Password</label>
                            <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="w-full p-2 border border-border rounded bg-background" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">New Password</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={e => setNewPassword(e.target.value)}
                                className="w-full p-2 border border-border rounded bg-background"
                                required
                                minLength={6}
                            />
                        </div>
                        <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded hover:opacity-90 transition-opacity">Update Password</button>
                    </form>
                </div>

                <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-4 text-red-600">Danger Zone</h2>
                    <p className="text-sm text-muted-foreground mb-4">Permanently delete your account and all associated data.</p>
                    <div className="flex gap-4 items-center">
                        <input type="password" placeholder="Confirm Password" value={deletePassword} onChange={e => setDeletePassword(e.target.value)} className="flex-1 p-2 border border-border rounded bg-background" />
                        <button onClick={handleDeleteAccount} className="px-4 py-2 bg-destructive text-destructive-foreground rounded hover:opacity-90 transition-opacity whitespace-nowrap">Delete Account</button>
                    </div>
                </div>
            </main>
        </div>
    )
}
