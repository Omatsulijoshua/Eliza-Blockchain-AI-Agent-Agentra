import { NavLink } from "react-router";
import { useAuth } from "../App";
import { Bot, Shield, Cpu, Zap, Activity, CheckCircle, ArrowRight } from "lucide-react";

export default function Landing() {
    const { user } = useAuth();

    return (
        <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col font-sans overflow-x-hidden selection:bg-purple-500 selection:text-white relative">
            {/* Ambient Background Glows */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-900/10 blur-[150px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-900/10 blur-[150px] pointer-events-none" />

            {/* Header Navbar */}
            <header className="sticky top-0 z-50 backdrop-blur-md border-b border-slate-900/80 bg-slate-950/70 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="size-10 bg-gradient-to-tr from-purple-600 to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                        <Bot className="size-6 text-white" />
                    </div>
                    <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                        ElizaOS Platform
                    </span>
                </div>

                <nav className="flex items-center gap-4">
                    {user ? (
                        <NavLink to="/agents">
                            <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-lg shadow-purple-500/20 active:scale-95 transition-all duration-200">
                                Enter Dashboard <ArrowRight className="size-4" />
                            </button>
                        </NavLink>
                    ) : (
                        <>
                            <NavLink to="/login" className="text-slate-400 hover:text-white font-medium transition-colors">
                                Log In
                            </NavLink>
                            <NavLink to="/signup">
                                <button className="px-5 py-2.5 rounded-xl font-medium bg-slate-900 border border-slate-800 hover:bg-slate-800/80 hover:border-slate-700 text-white transition-all duration-200 active:scale-95">
                                    Sign Up
                                </button>
                            </NavLink>
                        </>
                    )}
                </nav>
            </header>

            {/* Hero Section */}
            <main className="flex-1 flex flex-col items-center px-6 py-20 text-center relative max-w-7xl mx-auto">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-900/25 border border-purple-500/30 text-purple-400 text-xs font-semibold uppercase tracking-wider mb-8 animate-pulse">
                    <Zap className="size-3.5 fill-purple-400/20" /> Next Generation AI Blockchain Agents
                </div>

                <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight max-w-4xl leading-tight mb-8">
                    Rebuild Your Swarm. <br />
                    <span className="bg-gradient-to-r from-purple-400 via-violet-400 to-blue-500 bg-clip-text text-transparent">
                        Monitor, Edit & Scale
                    </span>
                </h1>

                <p className="text-lg md:text-xl text-slate-400 max-w-2xl leading-relaxed mb-12">
                    Deploy AI-powered blockchain autonomous agents. Setup and swap LLMs like Groq in seconds, approve subscription tiers, and monitor real-time system performance from a unified admin center.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full mb-24">
                    {user ? (
                        <NavLink to="/agents">
                            <button className="w-full sm:w-auto px-8 py-4 rounded-xl font-semibold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-xl shadow-purple-500/25 flex items-center justify-center gap-2 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0">
                                Open Platform Dashboard <ArrowRight className="size-5" />
                            </button>
                        </NavLink>
                    ) : (
                        <>
                            <NavLink to="/signup" className="w-full sm:w-auto">
                                <button className="w-full px-8 py-4 rounded-xl font-semibold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-xl shadow-purple-500/25 flex items-center justify-center gap-2 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0">
                                    Get Started Free <ArrowRight className="size-5" />
                                </button>
                            </NavLink>
                            <NavLink to="/login" className="w-full sm:w-auto">
                                <button className="w-full px-8 py-4 rounded-xl font-semibold bg-slate-900 border border-slate-800 hover:bg-slate-800/80 hover:border-slate-700 text-white flex items-center justify-center transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0">
                                    Admin Demo Access
                                </button>
                            </NavLink>
                        </>
                    )}
                </div>

                {/* Dashboard Showcase Mockup */}
                <div className="w-full max-w-5xl rounded-2xl border border-slate-900 bg-slate-950 p-3 shadow-2xl shadow-purple-500/5 relative group mb-32">
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                    <div className="rounded-xl overflow-hidden border border-slate-900 bg-slate-900/40 backdrop-blur-xl p-4 flex flex-col md:flex-row gap-6 items-stretch text-left">
                        {/* Sidebar Mock */}
                        <div className="w-full md:w-56 border-b md:border-b-0 md:border-r border-slate-800/60 pb-4 md:pb-0 md:pr-4 flex flex-col gap-4 text-slate-400 text-xs">
                            <div className="flex items-center gap-2 text-white font-semibold">
                                <Bot className="size-4 text-purple-400" /> ElizaOS Swarm
                            </div>
                            <div className="flex flex-col gap-2">
                                <div className="p-2 rounded bg-purple-950/30 text-purple-300 font-medium">🤖 CryptoAgent</div>
                                <div className="p-2 rounded hover:bg-slate-800/30 transition">👾 TradingBot</div>
                                <div className="p-2 rounded hover:bg-slate-800/30 transition">🛡️ AuditorBot</div>
                            </div>
                            <div className="mt-auto pt-4 border-t border-slate-800/60 flex items-center justify-between text-[10px]">
                                <span className="flex items-center gap-1.5"><span className="size-1.5 rounded-full bg-emerald-500 animate-ping"></span> Live Portal</span>
                                <span>v2.1.0</span>
                            </div>
                        </div>

                        {/* Content Mock */}
                        <div className="flex-1 flex flex-col gap-4 min-h-[300px]">
                            <div className="flex items-center justify-between">
                                <div className="flex flex-col gap-0.5">
                                    <h4 className="font-semibold text-sm">CryptoAgent</h4>
                                    <span className="text-[10px] text-slate-500">Active model: Groq Llama-3-70b</span>
                                </div>
                                <span className="text-[11px] px-2.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold uppercase tracking-wider">Approved</span>
                            </div>
                            <div className="flex-1 rounded-lg border border-slate-800/40 bg-slate-950/80 p-4 font-mono text-xs flex flex-col gap-3 justify-end text-slate-300">
                                <div className="text-slate-500 text-[10px] border-b border-slate-800 pb-2 mb-2">CHAT SESSION STARTED</div>
                                <div className="text-slate-400">User: How is the SOL price lookup performing?</div>
                                <div className="text-purple-400 flex items-start gap-2">
                                    <Bot className="size-3.5 mt-0.5 text-purple-400 flex-shrink-0" />
                                    <span>Querying Solana cluster devnet... Transaction speed is 0.4s. The answering logic has been improved to handle cross-chain queries efficiently.</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Features Section */}
                <div className="w-full py-12 mb-32">
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-center mb-16">
                        State-of-the-Art Platform Features
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left w-full">
                        <div className="p-8 rounded-2xl border border-slate-900 bg-slate-950/40 backdrop-blur hover:border-slate-800/80 hover:bg-slate-900/10 transition-all duration-300 group">
                            <div className="size-12 rounded-xl bg-purple-950/50 border border-purple-500/25 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Cpu className="size-6 text-purple-400" />
                            </div>
                            <h3 className="text-lg font-bold mb-3">Multi-Provider Integration</h3>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                Swap and choose between Groq, OpenAI, Gemini, Anthropic, or DeepSeek models. Edit credentials instantly in the admin backend.
                            </p>
                        </div>

                        <div className="p-8 rounded-2xl border border-slate-900 bg-slate-950/40 backdrop-blur hover:border-slate-800/80 hover:bg-slate-900/10 transition-all duration-300 group">
                            <div className="size-12 rounded-xl bg-blue-950/50 border border-blue-500/25 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Shield className="size-6 text-blue-400" />
                            </div>
                            <h3 className="text-lg font-bold mb-3">Subscription Controls</h3>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                Admins can manage users, upgrade levels to Pro/Enterprise, and approve or reject client API subscription tier requests dynamically.
                            </p>
                        </div>

                        <div className="p-8 rounded-2xl border border-slate-900 bg-slate-950/40 backdrop-blur hover:border-slate-800/80 hover:bg-slate-900/10 transition-all duration-300 group">
                            <div className="size-12 rounded-xl bg-violet-950/50 border border-violet-500/25 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Activity className="size-6 text-violet-400" />
                            </div>
                            <h3 className="text-lg font-bold mb-3">Live Monitor Dashboard</h3>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                Check memory allocation, agent status, logs stream, and modify `.env` configurations from a secure dashboard.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Pricing Section */}
                <div className="w-full pb-20">
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-center mb-4">
                        Flexible Pricing & Subscriptions
                    </h2>
                    <p className="text-slate-400 text-sm md:text-base max-w-xl mx-auto mb-16">
                        Request subscription access. Admins can approve your status on the dashboard panel.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto items-stretch">
                        {/* Free Tier */}
                        <div className="p-8 rounded-2xl border border-slate-900 bg-slate-950/60 flex flex-col justify-between text-left">
                            <div>
                                <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-2">Free</h4>
                                <div className="text-4xl font-extrabold mb-4">$0 <span className="text-xs font-normal text-slate-500">/ forever</span></div>
                                <p className="text-slate-400 text-xs leading-relaxed mb-6">Explore the features and communicate with default AI agent bots.</p>
                                <ul className="flex flex-col gap-3 text-xs text-slate-300 mb-8">
                                    <li className="flex items-center gap-2"><CheckCircle className="size-3.5 text-purple-500" /> Access to 1 default Agent</li>
                                    <li className="flex items-center gap-2"><CheckCircle className="size-3.5 text-purple-500" /> Basic answering logic</li>
                                    <li className="flex items-center gap-2"><CheckCircle className="size-3.5 text-purple-500" /> Standard API speed</li>
                                </ul>
                            </div>
                            <NavLink to="/signup" className="w-full">
                                <button className="w-full py-2.5 rounded-xl border border-slate-800 bg-slate-900/50 hover:bg-slate-800 text-white text-xs font-semibold transition">
                                    Get Started
                                </button>
                            </NavLink>
                        </div>

                        {/* Pro Tier (Popular) */}
                        <div className="p-8 rounded-2xl border-2 border-purple-500 bg-slate-950 relative flex flex-col justify-between text-left shadow-xl shadow-purple-500/5">
                            <span className="absolute top-0 right-6 -translate-y-1/2 px-3 py-1 rounded-full bg-purple-600 text-white text-[10px] font-bold uppercase tracking-wider">Most Popular</span>
                            <div>
                                <h4 className="text-sm font-semibold uppercase tracking-wider text-purple-400 mb-2">Pro</h4>
                                <div className="text-4xl font-extrabold mb-4">$29 <span className="text-xs font-normal text-slate-500">/ month</span></div>
                                <p className="text-slate-400 text-xs leading-relaxed mb-6">Unlock powerful LLM models like Groq, OpenAI key settings, and custom memory size.</p>
                                <ul className="flex flex-col gap-3 text-xs text-slate-300 mb-8">
                                    <li className="flex items-center gap-2"><CheckCircle className="size-3.5 text-purple-500" /> Access to all AI Agents</li>
                                    <li className="flex items-center gap-2"><CheckCircle className="size-3.5 text-purple-500" /> Premium Groq API speed</li>
                                    <li className="flex items-center gap-2"><CheckCircle className="size-3.5 text-purple-500" /> Memory and context settings</li>
                                    <li className="flex items-center gap-2"><CheckCircle className="size-3.5 text-purple-500" /> High-fidelity output templates</li>
                                </ul>
                            </div>
                            <NavLink to="/signup" className="w-full">
                                <button className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-xs font-semibold shadow-lg shadow-purple-500/20 transition">
                                    Subscribe Pro
                                </button>
                            </NavLink>
                        </div>

                        {/* Enterprise Tier */}
                        <div className="p-8 rounded-2xl border border-slate-900 bg-slate-950/60 flex flex-col justify-between text-left">
                            <div>
                                <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-2">Enterprise</h4>
                                <div className="text-4xl font-extrabold mb-4">$99 <span className="text-xs font-normal text-slate-500">/ month</span></div>
                                <p className="text-slate-400 text-xs leading-relaxed mb-6">Build complete on-chain systems with full custom databases, Web3 modules, and custom tools.</p>
                                <ul className="flex flex-col gap-3 text-xs text-slate-300 mb-8">
                                    <li className="flex items-center gap-2"><CheckCircle className="size-3.5 text-purple-500" /> Unlimited Agents and Swarms</li>
                                    <li className="flex items-center gap-2"><CheckCircle className="size-3.5 text-purple-500" /> Web3/Blockchain integration</li>
                                    <li className="flex items-center gap-2"><CheckCircle className="size-3.5 text-purple-500" /> Real-time server monitor controls</li>
                                    <li className="flex items-center gap-2"><CheckCircle className="size-3.5 text-purple-500" /> Dedicated developer support</li>
                                </ul>
                            </div>
                            <NavLink to="/signup" className="w-full">
                                <button className="w-full py-2.5 rounded-xl border border-slate-800 bg-slate-900/50 hover:bg-slate-800 text-white text-xs font-semibold transition">
                                    Go Enterprise
                                </button>
                            </NavLink>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-slate-900 bg-slate-950 px-6 py-8 text-center text-xs text-slate-500">
                <p>© {new Date().getFullYear()} ElizaOS Blockchain Agent Platform. Built with React, Vite, and Node.</p>
            </footer>
        </div>
    );
}
