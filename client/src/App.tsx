import "./index.css";
import { createContext, useContext, useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./components/app-sidebar";
import { TooltipProvider } from "./components/ui/tooltip";
import { Toaster } from "./components/ui/toaster";
import { BrowserRouter, Route, Routes, Navigate, useLocation } from "react-router";
import Chat from "./routes/chat";
import Overview from "./routes/overview";
import Home from "./routes/home";
import Landing from "./routes/landing";
import Login from "./routes/login";
import Signup from "./routes/signup";
import Admin from "./routes/admin";
import useVersion from "./hooks/use-version";

// ==========================================
// ============ AUTHENTICATION ==============
// ==========================================

export interface User {
    id: string;
    username: string;
    role: "admin" | "user";
    subscription: "none" | "pending" | "approved";
    subscriptionTier: "free" | "pro" | "enterprise";
    createdAt: string;
}

interface AuthContextType {
    user: User | null;
    login: (user: User) => void;
    logout: () => void;
    refreshUser: (user: User) => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within an AuthProvider");
    return context;
}

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: Number.POSITIVE_INFINITY,
        },
    },
});

// Protected Route wrapper
function ProtectedRoute({ children, requireAdmin = false }: { children: React.ReactNode; requireAdmin?: boolean }) {
    const { user } = useAuth();
    
    if (!user) {
        return <Navigate to="/login" replace />;
    }
    
    if (requireAdmin && user.role !== "admin") {
        return <Navigate to="/agents" replace />;
    }
    
    return <>{children}</>;
}

// Guest Route wrapper (redirects to dashboard if logged in)
function GuestRoute({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    if (user) {
        return <Navigate to="/agents" replace />;
    }
    return <>{children}</>;
}

// Layout wrapper that hides sidebar on Landing, Login, and Signup pages
function MainLayout({ children }: { children: React.ReactNode }) {
    const location = useLocation();
    const isAuthPage = ["/", "/login", "/signup"].includes(location.pathname);

    if (isAuthPage) {
        return <div className="flex flex-1 flex-col size-full bg-slate-950 text-slate-50 min-h-screen">{children}</div>;
    }

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <div className="flex flex-1 flex-col gap-4 size-full container p-0">
                    {children}
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}

function App() {
    useVersion();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const stored = localStorage.getItem("eliza_user");
        if (stored) {
            try {
                setUser(JSON.parse(stored));
            } catch (e) {
                localStorage.removeItem("eliza_user");
            }
        }
        setLoading(false);
    }, []);

    const login = (newUser: User) => {
        setUser(newUser);
        localStorage.setItem("eliza_user", JSON.stringify(newUser));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem("eliza_user");
    };

    const refreshUser = (updatedUser: User) => {
        setUser(updatedUser);
        localStorage.setItem("eliza_user", JSON.stringify(updatedUser));
    };

    if (loading) {
        return (
            <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 text-purple-400 font-medium">
                Loading ElizaOS Platform...
            </div>
        );
    }

    return (
        <QueryClientProvider client={queryClient}>
            <AuthContext.Provider value={{ user, login, logout, refreshUser }}>
                <div
                    className="dark antialiased"
                    style={{
                        colorScheme: "dark",
                    }}
                >
                    <BrowserRouter>
                        <TooltipProvider delayDuration={0}>
                            <MainLayout>
                                <Routes>
                                    {/* Public Routes */}
                                    <Route path="/" element={<Landing />} />
                                    
                                    {/* Guest Routes */}
                                    <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
                                    <Route path="/signup" element={<GuestRoute><Signup /></GuestRoute>} />

                                    {/* User Protected Routes */}
                                    <Route path="/agents" element={<ProtectedRoute><Home /></ProtectedRoute>} />
                                    <Route
                                        path="chat/:agentId"
                                        element={<ProtectedRoute><Chat /></ProtectedRoute>}
                                    />
                                    <Route
                                        path="settings/:agentId"
                                        element={<ProtectedRoute><Overview /></ProtectedRoute>}
                                    />

                                    {/* Admin Protected Routes */}
                                    <Route path="/admin" element={<ProtectedRoute requireAdmin><Admin /></ProtectedRoute>} />
                                    
                                    {/* Fallback */}
                                    <Route path="*" element={<Navigate to="/" replace />} />
                                </Routes>
                            </MainLayout>
                            <Toaster />
                        </TooltipProvider>
                    </BrowserRouter>
                </div>
            </AuthContext.Provider>
        </QueryClientProvider>
    );
}

export default App;
