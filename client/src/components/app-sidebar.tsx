import { useQuery } from "@tanstack/react-query";
import info from "@/lib/info.json";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSkeleton,
} from "@/components/ui/sidebar";
import { apiClient } from "@/lib/api";
import { NavLink, useLocation, useNavigate } from "react-router";
import type { UUID } from "@elizaos/core";
import { Book, Cog, User, Shield, LogOut, Zap, Clock } from "lucide-react";
import ConnectionStatus from "./connection-status";
import { useAuth } from "../App";
import { useToast } from "../hooks/use-toast";

export function AppSidebar() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout, refreshUser } = useAuth();
    const { toast } = useToast();

    const query = useQuery({
        queryKey: ["agents"],
        queryFn: () => apiClient.getAgents(),
        refetchInterval: 5_000,
    });

    const agents = query?.data?.agents;

    const handleUpgradeRequest = async () => {
        if (!user) return;
        try {
            await apiClient.requestSubscription(user.id, "pro");
            toast({
                title: "Upgrade Requested",
                description: "Your request for Pro tier subscription has been sent to the Admin portal for approval.",
            });
            refreshUser({
                ...user,
                subscription: "pending",
                subscriptionTier: "pro",
            });
        } catch (e: any) {
            toast({
                title: "Request Failed",
                description: e.message,
                variant: "destructive",
            });
        }
    };

    const handleLogout = () => {
        logout();
        toast({
            title: "Logged Out",
            description: "Successfully signed out of session.",
        });
        navigate("/");
    };

    return (
        <Sidebar>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <NavLink to="/agents">
                                <img
                                    alt="elizaos-icon"
                                    src="/elizaos-icon.png"
                                    width="100%"
                                    height="100%"
                                    className="size-7"
                                />

                                <div className="flex flex-col gap-0.5 leading-none">
                                    <span className="font-semibold text-white">
                                        ElizaOS Swarm
                                    </span>
                                    <span className="text-[10px] text-slate-500">v{info?.version}</span>
                                </div>
                            </NavLink>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                {/* Platform Navigation */}
                <SidebarGroup>
                    <SidebarGroupLabel>Menu</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <NavLink to="/agents">
                                    <SidebarMenuButton isActive={location.pathname === "/agents"}>
                                        <User className="size-4" />
                                        <span>Agent Directory</span>
                                    </SidebarMenuButton>
                                </NavLink>
                            </SidebarMenuItem>
                            
                            {user?.role === "admin" && (
                                <SidebarMenuItem>
                                    <NavLink to="/admin">
                                        <SidebarMenuButton isActive={location.pathname === "/admin"}>
                                            <Shield className="size-4 text-purple-400" />
                                            <span className="text-purple-400 font-semibold">Admin Panel</span>
                                        </SidebarMenuButton>
                                    </NavLink>
                                </SidebarMenuItem>
                            )}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                {/* Agents List */}
                <SidebarGroup>
                    <SidebarGroupLabel>Active Agents</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {query?.isPending ? (
                                <div>
                                    {Array.from({ length: 3 }).map(
                                        (_, index) => (
                                            <SidebarMenuItem key={`skeleton-${index}`}>
                                                <SidebarMenuSkeleton />
                                            </SidebarMenuItem>
                                        )
                                    )}
                                </div>
                            ) : (
                                <div>
                                    {agents?.map(
                                        (agent: { id: UUID; name: string }) => (
                                            <SidebarMenuItem key={agent.id}>
                                                <NavLink
                                                    to={`/chat/${agent.id}`}
                                                >
                                                    <SidebarMenuButton
                                                        isActive={location.pathname.includes(
                                                            agent.id
                                                        )}
                                                    >
                                                        <User className="size-4" />
                                                        <span>
                                                            {agent.name}
                                                        </span>
                                                    </SidebarMenuButton>
                                                </NavLink>
                                            </SidebarMenuItem>
                                        )
                                    )}
                                </div>
                            )}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="border-t border-slate-900 bg-slate-950/40 p-4">
                <SidebarMenu className="gap-3">
                    {/* User Profile Summary */}
                    {user && (
                        <div className="flex flex-col gap-1 px-2 py-1 text-xs">
                            <div className="font-bold text-white flex items-center gap-1.5">
                                {user.username}
                                <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${user.role === "admin" ? "bg-purple-950 text-purple-400 border border-purple-500/20" : "bg-slate-900 text-slate-400"}`}>
                                    {user.role}
                                </span>
                            </div>
                            <div className="text-[10px] text-slate-500 flex items-center justify-between mt-1">
                                <span className="capitalize">{user.subscriptionTier} Account</span>
                                <span className={user.subscription === "approved" ? "text-emerald-500 font-semibold" : "text-slate-400"}>
                                    ({user.subscription})
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Subscription Upgrades for Standard Users */}
                    {user?.role === "user" && user.subscription === "none" && (
                        <SidebarMenuItem>
                            <SidebarMenuButton 
                                onClick={handleUpgradeRequest}
                                className="w-full bg-purple-950/20 hover:bg-purple-950/40 border border-purple-500/20 text-purple-400 flex items-center gap-2 justify-center py-2.5 rounded-lg text-xs font-semibold hover:text-purple-300 transition duration-200"
                            >
                                <Zap className="size-3.5 fill-purple-400/20" /> Request Pro Upgrade
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    )}
                    
                    {user?.role === "user" && user.subscription === "pending" && (
                        <div className="px-2.5 py-2 rounded-lg bg-slate-900/60 border border-slate-800 text-[10px] text-amber-500 font-medium flex items-center justify-center gap-2">
                            <Clock className="size-3.5 animate-pulse" /> Upgrade Request Pending...
                        </div>
                    )}

                    {/* Logout Button */}
                    <SidebarMenuItem>
                        <SidebarMenuButton 
                            onClick={handleLogout}
                            className="w-full hover:bg-red-950/20 text-slate-400 hover:text-red-400 transition"
                        >
                            <LogOut className="size-4" />
                            <span>Log Out</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    
                    <ConnectionStatus />
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
}
