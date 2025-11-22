"use client";

import { ReactNode } from "react";
import { Shield, Activity, Network, Database, Settings, Search, Bell, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface ShellProps {
    children: ReactNode;
}

export function Shell({ children }: ShellProps) {
    const pathname = usePathname();

    const navItems = [
        { icon: Shield, label: "DASHBOARD", href: "/" },
        { icon: Database, label: "LOGS", href: "/logs" },
        { icon: Activity, label: "THREATS", href: "/threats" },
        { icon: Network, label: "NETWORK", href: "/network" },
        { icon: Settings, label: "SYSTEM", href: "/settings" },
    ];

    return (
        <div className="flex h-screen w-full bg-cyber-black text-foreground font-rajdhani relative overflow-hidden">
            {/* Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,243,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,243,255,0.03)_1px,transparent_1px)] bg-[length:40px_40px] pointer-events-none z-0" />

            {/* Sidebar */}
            <aside className="w-20 lg:w-64 border-r border-white/10 bg-card/80 backdrop-blur-xl z-20 flex flex-col">
                <div className="h-16 flex items-center justify-center lg:justify-start lg:px-6 border-b border-white/10">
                    <Shield className="w-8 h-8 text-neon-cyan animate-pulse-slow" />
                    <span className="hidden lg:block ml-3 font-orbitron font-bold text-xl tracking-widest text-white">
                        SIEM<span className="text-neon-cyan">.AI</span>
                    </span>
                </div>

                <nav className="flex-1 py-6 flex flex-col gap-2 px-2">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center p-3 rounded-sm transition-all duration-300 group relative overflow-hidden",
                                    isActive ? "bg-neon-cyan/10 text-neon-cyan border-l-2 border-neon-cyan" : "text-muted-foreground hover:text-white hover:bg-white/5"
                                )}
                            >
                                <item.icon className={cn("w-6 h-6", isActive && "drop-shadow-[0_0_5px_rgba(0,243,255,0.8)]")} />
                                <span className="hidden lg:block ml-3 font-medium tracking-wide">{item.label}</span>

                                {/* Hover Glitch Effect */}
                                <div className="absolute inset-0 bg-neon-cyan/5 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300 skew-x-12 pointer-events-none" />
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neon-cyan to-neon-blue p-[1px]">
                            <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                                <span className="font-bold text-xs">OP</span>
                            </div>
                        </div>
                        <div className="hidden lg:block">
                            <div className="text-sm font-bold text-white">OPERATOR</div>
                            <div className="text-xs text-neon-cyan">LEVEL 5 ACCESS</div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col relative z-10 overflow-hidden">
                {/* Header */}
                <header className="h-16 border-b border-white/10 bg-card/50 backdrop-blur-sm flex items-center justify-between px-6">
                    <div className="flex items-center gap-4 w-1/3">
                        <div className="relative w-full max-w-md group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-neon-cyan transition-colors" />
                            <input
                                type="text"
                                placeholder="SEARCH LOGS / THREATS..."
                                className="w-full bg-black/50 border border-white/10 rounded-sm py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-neon-cyan/50 focus:ring-1 focus:ring-neon-cyan/50 transition-all placeholder:text-muted-foreground/50 font-rajdhani"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="relative p-2 hover:bg-white/5 rounded-sm transition-colors">
                            <Bell className="w-5 h-5 text-muted-foreground hover:text-neon-magenta transition-colors" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-neon-magenta rounded-full animate-pulse" />
                        </button>
                        <div className="h-8 w-[1px] bg-white/10" />
                        <div className="flex items-center gap-2 text-xs text-neon-cyan font-mono">
                            <span className="w-2 h-2 bg-neon-cyan rounded-full animate-pulse" />
                            SYSTEM ONLINE
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-neon-cyan/20 scrollbar-track-black">
                    {children}
                </main>
            </div>
        </div>
    );
}
