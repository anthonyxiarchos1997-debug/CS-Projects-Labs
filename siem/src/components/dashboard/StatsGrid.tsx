import { HoloPanel } from "@/components/ui/HoloPanel";
import { Activity, ShieldAlert, Zap, Server } from "lucide-react";

export function StatsGrid() {
    const stats = [
        {
            label: "THREAT LEVEL",
            value: "CRITICAL",
            icon: ShieldAlert,
            color: "red" as const,
            sub: "APT-29 DETECTED"
        },
        {
            label: "EVENTS / SEC",
            value: "24,592",
            icon: Zap,
            color: "cyan" as const,
            sub: "+12% SPIKE"
        },
        {
            label: "ACTIVE NODES",
            value: "842",
            icon: Server,
            color: "violet" as const,
            sub: "98% HEALTHY"
        },
        {
            label: "AI ANOMALIES",
            value: "3",
            icon: Activity,
            color: "magenta" as const,
            sub: "BEHAVIORAL MISMATCH"
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {stats.map((stat, i) => (
                <HoloPanel key={i} glowColor={stat.color} className="flex flex-col justify-between h-32">
                    <div className="flex justify-between items-start">
                        <div className="text-xs text-muted-foreground font-orbitron tracking-wider">{stat.label}</div>
                        <stat.icon className={`w-5 h-5 text-neon-${stat.color === 'red' ? 'destructive' : stat.color}`} />
                    </div>
                    <div>
                        <div className={`text-3xl font-bold text-white tracking-tight ${stat.color === 'red' ? 'text-destructive animate-pulse' : ''}`}>
                            {stat.value}
                        </div>
                        <div className="text-[10px] text-muted-foreground mt-1 font-mono">
                            {stat.sub}
                        </div>
                    </div>
                </HoloPanel>
            ))}
        </div>
    );
}
