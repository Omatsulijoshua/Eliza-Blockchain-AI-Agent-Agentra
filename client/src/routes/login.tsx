import { useState } from "react";
import { NavLink, useNavigate } from "react-router";
import { apiClient } from "../lib/api";
import { useAuth } from "../App";
import { useToast } from "../hooks/use-toast";
import { Bot, LogIn, Key, User, ArrowLeft, Loader2 } from "lucide-react";

export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!username.trim() || !password) {
            toast({
                title: "Error",
                description: "Username and password are required",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);

        try {
            const response = await apiClient.login(username, password);
            login(response.user);
            toast({
                title: "Success",
                description: `Welcome back, ${response.user.username}!`,
            });
            if (response.user.role === "admin") {
                navigate("/admin");
            } else {
                navigate("/agents");
            }
        } catch (error: any) {
            toast({
                title: "Login Failed",
                description: error.message || "Invalid username or password",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-6 relative overflow-hidden font-sans">
            {/* Background ambient light */}
            <div className="absolute w-[400px] h-[400px] rounded-full bg-blue-900/10 blur-[120px] pointer-events-none" />

            <div className="absolute top-8 left-8">
                <NavLink to="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm">
                    <ArrowLeft className="size-4" /> Back to Home
                </NavLink>
            </div>

            <div className="w-full max-w-md bg-slate-900/40 border border-slate-900/80 backdrop-blur-xl rounded-2xl p-8 shadow-2xl relative">
                <div className="flex flex-col items-center mb-8 text-center">
                    <div className="size-12 bg-gradient-to-tr from-purple-600 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/20 mb-4">
                        <Bot className="size-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight text-white">Sign in to your platform</h2>
                    <p className="text-xs text-slate-500 mt-1">Manage and access your agents swarm</p>
                </div>

                <div className="mb-6 p-4 rounded-xl border border-purple-500/25 bg-purple-950/20 text-xs text-purple-400 leading-relaxed text-center font-medium">
                    ⚡ Demo Admin Credentials: <strong className="text-white">admin</strong> / Password: <strong className="text-white">admin123</strong>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    {/* Username */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-slate-400">Username</label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                                <User className="size-4" />
                            </span>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Enter username"
                                className="w-full pl-9 pr-4 py-3 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-100 placeholder-slate-600 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-sm outline-none transition duration-200"
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-slate-400">Password</label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                                <Key className="size-4" />
                            </span>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter password"
                                className="w-full pl-9 pr-4 py-3 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-100 placeholder-slate-600 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-sm outline-none transition duration-200"
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 mt-2 rounded-xl font-semibold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-lg shadow-purple-500/20 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="size-4 animate-spin" /> Signing In...
                            </>
                        ) : (
                            <>
                                <LogIn className="size-4" /> Sign In
                            </>
                        )}
                    </button>
                </form>

                <div className="text-center mt-6 text-xs text-slate-500">
                    Don't have an account?{" "}
                    <NavLink to="/signup" className="text-purple-400 hover:text-purple-300 font-semibold transition-colors">
                        Sign Up
                    </NavLink>
                </div>
            </div>
        </div>
    );
}
