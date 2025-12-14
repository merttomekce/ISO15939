"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"

interface AuthContextType {
    user: string | null;
    token: string | null;
    login: (username: string, token: string) => void;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    token: null,
    login: () => { },
    logout: () => { },
    isAuthenticated: false,
})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<string | null>(null)
    const [token, setToken] = useState<string | null>(null)
    const router = useRouter()

    useEffect(() => {
        // Initialize from localStorage
        const storedUser = localStorage.getItem("username")
        const storedToken = localStorage.getItem("token")
        if (storedUser && storedToken) {
            setUser(storedUser)
            setToken(storedToken)
        }
    }, [])

    const login = (username: string, token: string) => {
        localStorage.setItem("username", username)
        localStorage.setItem("token", token)
        setUser(username)
        setToken(token)
    }

    const logout = () => {
        localStorage.removeItem("username")
        localStorage.removeItem("token")
        setUser(null)
        setToken(null)
        router.push("/")
    }

    return (
        <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token }}>
            {children}
        </AuthContext.Provider>
    )
}
