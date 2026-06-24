import { useState, useEffect, useRef } from "react";
import { apiClient } from "../lib/api";
import { useToast } from "../hooks/use-toast";
import { 
    Activity, Users, CreditCard, Settings, Terminal, Shield, 
    RefreshCw, Check, X, AlertTriangle, Play, HelpCircle, Save 
} from "lucide-react";

interface AdminUser {
    id: string;
    username: string;
    role: "admin" | "user";
    subscription: "none" | "pending" | "approved";
    subscriptionTier: "free" | "pro" | "enterprise";
    createdAt: string;
}

interface SystemStats {
    totalUsers: number;
    subscribers: number;
    pendingSubscriptions: number;
    activeAgents: number;
    uptime: number;
    memoryUsage: { rss: number; heapTotal: number; heapUsed: number; external: number };
    cpuUsage: { user: number; system: number };
}

export default function Admin() {
    const [activeTab, setActiveTab] = useState<"overview" | "users" | "subscriptions" | "config">("overview");
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [stats, setStats] = useState<SystemStats | null>(null);
    const [logs, setLogs] = useState<string[]>([]);
    const [config, setConfig] = useState<Record<string, string>>({});
    
    // Config form inputs
    const [configUpdates, setConfigUpdates] = useState<Record<string, string>>({});
    
    const [isLoading, setIsLoading] = useState(false);
    const [isSavingConfig, setIsSavingConfig] = useState(false);
    const [isRestarting, setIsRestarting] = useState(false);
    
    const logsEndRef = useRef<HTMLDivElement>(null);
    const { toast } = useToast();

    // Load Overview/Stats & Logs
    const loadOverview = async () => {
        try {
            const statsRes = await apiClient.getAdminStats();
            setStats(statsRes.stats);
            
            const logsRes = await apiClient.getAdminLogs();
            setLogs(logsRes.logs);
        } catch (e: any) {
            console.error("Failed to load admin stats:", e);
        }
    };

    // Load Users
    const loadUsers = async () => {
        try {
            const res = await apiClient.getUsers();
            setUsers(res.users);
        } catch (e: any) {
            toast({
                title: "Failed to Load Users",
                description: e.message || "Could not retrieve user directory",
                variant: "destructive",
            });
        }
    };

    // Load Config (.env keys)
    const loadConfig = async () => {
        try {
            const res = await apiClient.getConfig();
            setConfig(res.config);
            // Copy keys to state for editing
            setConfigUpdates(res.config);
        } catch (e: any) {
            toast({
                title: "Failed to Load Configuration",
                description: e.message || "Could not read environmental keys",
                variant: "destructive",
            });
        }
    };

    useEffect(() => {
        if (activeTab === "overview") {
            loadOverview();
            const interval = setInterval(loadOverview, 6000);
            return () => clearInterval(interval);
        } else if (activeTab === "users" || activeTab === "subscriptions") {
            loadUsers();
        } else if (activeTab === "config") {
            loadConfig();
        }
    }, [activeTab]);

    useEffect(() => {
        if (activeTab === "overview" && logsEndRef.current) {
            logsEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [logs]);

    // Handle User Actions
    const handleApproveSub = async (userId: string) => {
        try {
            await apiClient.approveSubscription(userId);
            toast({ title: "Success", description: "User subscription approved!" });
            loadUsers();
        } catch (e: any) {
            toast({ title: "Action Failed", description: e.message, variant: "destructive" });
        }
    };

    const handleCancelSub = async (userId: string) => {
        try {
            await apiClient.cancelSubscription(userId);
            toast({ title: "Success", description: "Subscription cancelled / reset to Free tier." });
            loadUsers();
        } catch (e: any) {
            toast({ title: "Action Failed", description: e.message, variant: "destructive" });
        }
    };

    const handleToggleAdmin = async (userId: string) => {
        try {
            await apiClient.toggleAdmin(userId);
            toast({ title: "Success", description: "User permissions updated successfully!" });
            loadUsers();
        } catch (e: any) {
            toast({ title: "Action Failed", description: e.message, variant: "destructive" });
        }
    };

    // Handle Config Save
    const handleSaveConfig = async () => {
        setIsSavingConfig(true);
        try {
            await apiClient.saveConfig(configUpdates);
            toast({
                title: "Configuration Saved",
                description: ".env file updated successfully! Restart the agent to apply updates.",
            });
            loadConfig();
        } catch (e: any) {
            toast({
                title: "Save Failed",
                description: e.message || "Failed to edit config",
                variant: "destructive",
            });
        } finally {
            setIsSavingConfig(false);
        }
    };

    // Restart server
    const handleRestartServer = async () => {
        if (!confirm("Are you sure you want to stop the agent server? It will trigger an immediate process exit to load new keys. Please ensure a process runner (like PM2) is managing it to auto-restart.")) return;
        setIsRestarting(true);
        try {
            await apiClient.restartServer();
            toast({
                title: "Server Restart Triggered",
                description: "The Agent server process is closing gracefully. It will auto-reload in a few seconds.",
            });
        } catch (e: any) {
            toast({
                title: "Restart Failed",
                description: "Process exit command failed: " + e.message,
                variant: "destructive",
            });
            setIsRestarting(false);
        }
    };

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    const formatUptime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);
        return `${h}h ${m}m ${s}s`;
    };

    // Select keys we care about showing first or categorized
    const configCategories = {
        apiKeys: [
            { key: "GROQ_API_KEY", label: "Groq API Key", placeholder: "gsk_..." },
            { key: "OPENAI_API_KEY", label: "OpenAI API Key", placeholder: "sk-..." },
            { key: "GOOGLE_GENERATIVE_AI_API_KEY", label: "Gemini API Key", placeholder: "AIzaSy..." },
            { key: "ANTHROPIC_API_KEY", label: "Anthropic API Key", placeholder: "sk-ant-..." },
            { key: "DEEPSEEK_API_KEY", label: "DeepSeek API Key", placeholder: "sk-..." },
            { key: "TAVILY_API_KEY", label: "Tavily Web Search Key", placeholder: "tvly-..." },
        ],
        server: [
            { key: "SERVER_PORT", label: "Server Port", placeholder: "3000" },
            { key: "SERVER_URL", label: "Server URL", placeholder: "http://localhost" },
            { key: "CACHE_STORE", label: "Cache Store Type", placeholder: "database" },
            { key: "USE_CHARACTER_STORAGE", label: "Character Persistence (true/false)", placeholder: "false" },
        ],
        clients: [
            { key: "TWITTER_USERNAME", label: "Twitter Username", placeholder: "MyAgentX" },
            { key: "TWITTER_PASSWORD", label: "Twitter Password", placeholder: "..." },
            { key: "TWITTER_EMAIL", label: "Twitter Email", placeholder: "agent@gmail.com" },
            { key: "TELEGRAM_BOT_TOKEN", label: "Telegram Bot Token", placeholder: "123456:ABC..." },
            { key: "DISCORD_API_TOKEN", label: "Discord Bot Token", placeholder: "Mzkz..." },
        ]
    };

    return (
        <div className="flex-1 flex flex-col gap-6 p-6 bg-slate-950/80 min-h-screen font-sans max-w-7xl mx-auto w-full text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-900 pb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent flex items-center gap-2">
                        <Shield className="size-8 text-purple-500" /> Admin Control Suite
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">Monitor server resources, manage user accounts, subscriptions, and update credentials.</p>
                </div>

                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => activeTab === "overview" ? loadOverview() : activeTab === "config" ? loadConfig() : loadUsers()}
                        className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 active:scale-95 transition"
                    >
                        <RefreshCw className="size-3.5 animate-hover-spin" /> Reload Data
                    </button>
                    <button 
                        onClick={handleRestartServer}
                        disabled={isRestarting}
                        className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-red-950/50 border border-red-500/30 hover:bg-red-900/40 text-red-400 disabled:opacity-50 transition"
                    >
                        <AlertTriangle className="size-3.5" /> {isRestarting ? "Exiting Server..." : "Restart Server"}
                    </button>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-slate-900 gap-2">
                <button
                    onClick={() => setActiveTab("overview")}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all -mb-px ${activeTab === "overview" ? "border-purple-500 text-purple-400" : "border-transparent text-slate-400 hover:text-white"}`}
                >
                    <Activity className="size-4" /> Overview & Logs
                </button>
                <button
                    onClick={() => setActiveTab("users")}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all -mb-px ${activeTab === "users" ? "border-purple-500 text-purple-400" : "border-transparent text-slate-400 hover:text-white"}`}
                >
                    <Users className="size-4" /> Users Directory
                </button>
                <button
                    onClick={() => setActiveTab("subscriptions")}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all -mb-px ${activeTab === "subscriptions" ? "border-purple-500 text-purple-400" : "border-transparent text-slate-400 hover:text-white"}`}
                >
                    <CreditCard className="size-4" /> Subscription Requests
                </button>
                <button
                    onClick={() => setActiveTab("config")}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all -mb-px ${activeTab === "config" ? "border-purple-500 text-purple-400" : "border-transparent text-slate-400 hover:text-white"}`}
                >
                    <Settings className="size-4" /> Configuration (.env)
                </button>
            </div>

            {/* Active Tab Panel */}
            <div className="flex-1 flex flex-col min-h-0">
                {/* 1. OVERVIEW / MONITORING PANEL */}
                {activeTab === "overview" && (
                    <div className="flex flex-col gap-6 flex-1 min-h-0">
                        {/* Stats Cards */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-900 backdrop-blur-xl flex flex-col justify-between">
                                <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Active Agents</span>
                                <div className="text-3xl font-extrabold text-white mt-2">{stats?.activeAgents ?? 0}</div>
                            </div>
                            <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-900 backdrop-blur-xl flex flex-col justify-between">
                                <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Total Users</span>
                                <div className="text-3xl font-extrabold text-white mt-2">{stats?.totalUsers ?? 0}</div>
                            </div>
                            <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-900 backdrop-blur-xl flex flex-col justify-between">
                                <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Subscribers (Pro/Ent)</span>
                                <div className="text-3xl font-extrabold text-purple-400 mt-2">{stats?.subscribers ?? 0}</div>
                            </div>
                            <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-900 backdrop-blur-xl flex flex-col justify-between">
                                <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">System Uptime</span>
                                <div className="text-md font-bold text-slate-200 mt-4">{stats?.uptime ? formatUptime(stats.uptime) : "0s"}</div>
                            </div>
                        </div>

                        {/* System memory usages */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-900 backdrop-blur p-4 text-xs font-mono text-slate-300 flex flex-col gap-2">
                                <h3 className="font-semibold font-sans text-sm text-white mb-2 flex items-center gap-1.5"><Activity className="size-4 text-purple-400" /> Memory Profiler</h3>
                                <div className="flex justify-between border-b border-slate-800/40 py-1.5">
                                    <span>RSS (Resident Set Size):</span>
                                    <span className="text-white font-bold">{stats?.memoryUsage?.rss ? formatBytes(stats.memoryUsage.rss) : "0 MB"}</span>
                                </div>
                                <div className="flex justify-between border-b border-slate-800/40 py-1.5">
                                    <span>Heap Total:</span>
                                    <span className="text-white font-bold">{stats?.memoryUsage?.heapTotal ? formatBytes(stats.memoryUsage.heapTotal) : "0 MB"}</span>
                                </div>
                                <div className="flex justify-between border-b border-slate-800/40 py-1.5">
                                    <span>Heap Used:</span>
                                    <span className="text-purple-400 font-bold">{stats?.memoryUsage?.heapUsed ? formatBytes(stats.memoryUsage.heapUsed) : "0 MB"}</span>
                                </div>
                            </div>

                            <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-900 backdrop-blur p-4 text-xs font-sans text-slate-300 flex flex-col justify-center gap-4">
                                <div className="flex items-center gap-2">
                                    <span className="size-2.5 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="font-semibold text-white">Active Express Server Bind</span>
                                </div>
                                <p className="text-xs text-slate-400 leading-relaxed">
                                    The Direct API server interface is currently active and listening on port <strong className="text-white">3000</strong>. Database caching state is fully running.
                                </p>
                            </div>
                        </div>

                        {/* Console Logger Terminal */}
                        <div className="flex-1 flex flex-col min-h-[350px] max-h-[500px] border border-slate-900 bg-slate-950 rounded-2xl p-4 overflow-hidden relative shadow-2xl">
                            <div className="flex items-center justify-between border-b border-slate-900 pb-3 mb-3 text-slate-400 text-xs font-semibold">
                                <span className="flex items-center gap-1.5"><Terminal className="size-4 text-purple-400" /> ElizaOS Log Console Buffer</span>
                                <span className="text-[10px] text-slate-500 font-normal">Auto-scrolling active</span>
                            </div>
                            <div className="flex-1 overflow-y-auto font-mono text-[11px] text-slate-300 flex flex-col gap-1.5 pr-2 custom-scrollbar">
                                {logs.length === 0 ? (
                                    <div className="text-slate-600 italic">No console logs captured yet. Triggering actions will stream logs here.</div>
                                ) : (
                                    logs.map((log, index) => {
                                        let color = "text-slate-300";
                                        if (log.includes("[ERROR]")) color = "text-rose-400 font-bold";
                                        else if (log.includes("[WARN]")) color = "text-amber-400 font-bold";
                                        else if (log.includes("[INFO]")) color = "text-sky-300";
                                        return (
                                            <div key={index} className={`${color} leading-relaxed break-all`}>
                                                {log}
                                            </div>
                                        );
                                    })
                                )}
                                <div ref={logsEndRef} />
                            </div>
                        </div>
                    </div>
                )}

                {/* 2. USER DIRECTORY PANEL */}
                {activeTab === "users" && (
                    <div className="rounded-2xl border border-slate-900 bg-slate-950/40 backdrop-blur-xl overflow-hidden shadow-2xl">
                        <div className="p-6 border-b border-slate-900 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-white">Registered Swarm Accounts</h3>
                            <span className="text-xs font-semibold bg-slate-900 border border-slate-800 text-slate-400 px-3 py-1.5 rounded-lg">{users.length} Users Total</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-900 bg-slate-950 text-slate-400 font-semibold uppercase tracking-wider">
                                        <th className="p-4">Username</th>
                                        <th className="p-4">Account ID</th>
                                        <th className="p-4">Role</th>
                                        <th className="p-4">Subscription Status</th>
                                        <th className="p-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((userItem) => (
                                        <tr key={userItem.id} className="border-b border-slate-900/60 hover:bg-slate-900/10 transition">
                                            <td className="p-4 font-bold text-white">{userItem.username}</td>
                                            <td className="p-4 text-slate-500 font-mono">{userItem.id}</td>
                                            <td className="p-4">
                                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${userItem.role === "admin" ? "bg-purple-950/40 border-purple-500/30 text-purple-400" : "bg-slate-900 border-slate-800 text-slate-400"}`}>
                                                    {userItem.role}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-slate-200 capitalize">{userItem.subscriptionTier} tier</span>
                                                    <span className={`text-[10px] uppercase font-bold tracking-wider ${userItem.subscription === "approved" ? "text-emerald-400" : userItem.subscription === "pending" ? "text-amber-400 animate-pulse" : "text-slate-500"}`}>
                                                        {userItem.subscription}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-right">
                                                <button
                                                    onClick={() => handleToggleAdmin(userItem.id)}
                                                    className="px-3 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-900/60 text-slate-300 font-semibold transition"
                                                >
                                                    Toggle Admin
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* 3. SUBSCRIPTIONS PANEL */}
                {activeTab === "subscriptions" && (
                    <div className="rounded-2xl border border-slate-900 bg-slate-950/40 backdrop-blur-xl overflow-hidden shadow-2xl">
                        <div className="p-6 border-b border-slate-900">
                            <h3 className="text-lg font-bold text-white">Subscription Management Console</h3>
                            <p className="text-xs text-slate-500 mt-1">Approve pending subscription request logs and manage active licenses.</p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-900 bg-slate-950 text-slate-400 font-semibold uppercase tracking-wider">
                                        <th className="p-4">User</th>
                                        <th className="p-4">Requested Tier</th>
                                        <th className="p-4">Request Status</th>
                                        <th className="p-4">Registered On</th>
                                        <th className="p-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((userItem) => (
                                        <tr key={userItem.id} className="border-b border-slate-900/60 hover:bg-slate-900/10 transition">
                                            <td className="p-4 font-bold text-white">{userItem.username}</td>
                                            <td className="p-4">
                                                <span className="font-semibold text-slate-300 capitalize">{userItem.subscriptionTier}</span>
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                                                    userItem.subscription === "approved" ? "bg-emerald-950/30 border-emerald-500/20 text-emerald-400" :
                                                    userItem.subscription === "pending" ? "bg-amber-950/30 border-amber-500/20 text-amber-400 animate-pulse" :
                                                    "bg-slate-900 border-slate-800 text-slate-500"
                                                }`}>
                                                    {userItem.subscription}
                                                </span>
                                            </td>
                                            <td className="p-4 text-slate-500">{new Date(userItem.createdAt).toLocaleDateString()}</td>
                                            <td className="p-4 text-right">
                                                <div className="flex gap-2 justify-end">
                                                    {userItem.subscription === "pending" && (
                                                        <button
                                                            onClick={() => handleApproveSub(userItem.id)}
                                                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-950/50 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-900/40 text-xs font-semibold transition"
                                                        >
                                                            <Check className="size-3.5" /> Approve
                                                        </button>
                                                    )}
                                                    {userItem.subscription !== "none" && (
                                                        <button
                                                            onClick={() => handleCancelSub(userItem.id)}
                                                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-950/50 border border-red-500/30 text-red-400 hover:bg-red-900/40 text-xs font-semibold transition"
                                                        >
                                                            <X className="size-3.5" /> Cancel / Revoke
                                                        </button>
                                                    )}
                                                    {userItem.subscription === "none" && (
                                                        <span className="text-[10px] text-slate-600 font-semibold italic uppercase">No Requests</span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* 4. CONFIGURATION PANEL (.env Editor) */}
                {activeTab === "config" && (
                    <div className="flex flex-col gap-6">
                        {/* Warnings banner */}
                        <div className="p-4 rounded-2xl border border-amber-500/30 bg-amber-950/10 text-xs text-amber-400 leading-relaxed flex items-start gap-3">
                            <AlertTriangle className="size-5 text-amber-400 mt-0.5 flex-shrink-0" />
                            <div>
                                <strong className="text-white block mb-1">Warning: Changing environmental keys directly impacts agent runtimes</strong>
                                Saving configurations writes changes to the root <code className="text-white font-bold bg-slate-900 px-1 py-0.5 rounded">.env</code> file. To load updated keys into running clients, click <strong>Save Config</strong> and then trigger <strong>Restart Server</strong>.
                            </div>
                        </div>

                        {/* Config groups */}
                        <div className="grid grid-cols-1 gap-6">
                            {/* Group A: LLMs */}
                            <div className="p-6 rounded-2xl border border-slate-900 bg-slate-950/40 backdrop-blur-xl">
                                <h3 className="text-md font-bold text-white mb-6 border-b border-slate-900 pb-3 flex items-center gap-2">
                                    <Bot className="size-5 text-purple-400" /> AI Provider API Keys & Settings
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {configCategories.apiKeys.map((item) => (
                                        <div key={item.key} className="flex flex-col gap-1.5">
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="font-semibold text-slate-400">{item.label}</span>
                                                <span className="font-mono text-slate-600 text-[10px]">{item.key}</span>
                                            </div>
                                            <input
                                                type="text"
                                                value={configUpdates[item.key] || ""}
                                                onChange={(e) => setConfigUpdates({ ...configUpdates, [item.key]: e.target.value })}
                                                placeholder={item.placeholder}
                                                className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-100 placeholder-slate-600 focus:border-purple-500 text-xs outline-none font-mono"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Group B: Server Settings */}
                            <div className="p-6 rounded-2xl border border-slate-900 bg-slate-950/40 backdrop-blur-xl">
                                <h3 className="text-md font-bold text-white mb-6 border-b border-slate-900 pb-3 flex items-center gap-2">
                                    <Settings className="size-5 text-blue-400" /> Server Port & Cache Settings
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {configCategories.server.map((item) => (
                                        <div key={item.key} className="flex flex-col gap-1.5">
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="font-semibold text-slate-400">{item.label}</span>
                                                <span className="font-mono text-slate-600 text-[10px]">{item.key}</span>
                                            </div>
                                            <input
                                                type="text"
                                                value={configUpdates[item.key] || ""}
                                                onChange={(e) => setConfigUpdates({ ...configUpdates, [item.key]: e.target.value })}
                                                placeholder={item.placeholder}
                                                className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-100 placeholder-slate-600 focus:border-purple-500 text-xs outline-none font-mono"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Group C: Client settings */}
                            <div className="p-6 rounded-2xl border border-slate-900 bg-slate-950/40 backdrop-blur-xl">
                                <h3 className="text-md font-bold text-white mb-6 border-b border-slate-900 pb-3 flex items-center gap-2">
                                    <Settings className="size-5 text-violet-400" /> Twitter, Telegram & Discord Bot Connectors
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {configCategories.clients.map((item) => (
                                        <div key={item.key} className="flex flex-col gap-1.5">
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="font-semibold text-slate-400">{item.label}</span>
                                                <span className="font-mono text-slate-600 text-[10px]">{item.key}</span>
                                            </div>
                                            <input
                                                type={item.key.includes("PASSWORD") ? "password" : "text"}
                                                value={configUpdates[item.key] || ""}
                                                onChange={(e) => setConfigUpdates({ ...configUpdates, [item.key]: e.target.value })}
                                                placeholder={item.placeholder}
                                                className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-100 placeholder-slate-600 focus:border-purple-500 text-xs outline-none font-mono"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Save Trigger */}
                        <div className="flex justify-end gap-3 mt-4 mb-10">
                            <button
                                onClick={loadConfig}
                                className="px-6 py-3 rounded-xl border border-slate-800 bg-slate-900/60 text-slate-400 text-xs font-semibold hover:text-white transition active:scale-95"
                            >
                                Reset Form Changes
                            </button>
                            <button
                                onClick={handleSaveConfig}
                                disabled={isSavingConfig}
                                className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-xs font-semibold shadow-lg shadow-purple-500/20 active:scale-95 transition"
                            >
                                <Save className="size-4" /> {isSavingConfig ? "Saving..." : "Save Config to .env"}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
