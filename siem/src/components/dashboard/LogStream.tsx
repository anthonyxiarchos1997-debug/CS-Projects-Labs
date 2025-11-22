"use client";

import { HoloPanel } from "@/components/ui/HoloPanel";
import { useEffect, useState } from "react";

interface Log {
    id: string;
    time: string;
    level: "INFO" | "WARN" | "ERROR" | "CRIT";
    source: string;
    message: string;
}

export function LogStream() {
    const [logs, setLogs] = useState<Log[]>([]);

    useEffect(() => {
        const interval = setInterval(() => {
            const newLog: Log = {
                id: Math.random().toString(36).substr(2, 9),
                time: new Date().toLocaleTimeString(),
                level: Math.random() > 0.9 ? "CRIT" : Math.random() > 0.7 ? "ERROR" : Math.random() > 0.5 ? "WARN" : "INFO",
                source: Math.random() > 0.5 ? "FIREWALL-01" : "AUTH-SVC",
                message: "Packet dropped from 192.168.1.105 (Rule: DENY_ALL)",
            };
            setLogs(prev => [newLog, ...prev].slice(0, 20));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <HoloPanel title="LIVE LOG STREAM" glowColor="cyan" className="h-full min-h-[300px]">
            <div className="space-y-1 font-mono text-xs h-[250px] overflow-hidden relative">
                {logs.map((log) => (
                    <div key={log.id} className="grid grid-cols-[80px_60px_100px_1fr] gap-2 border-b border-white/5 pb-1 mb-1 animate-in slide-in-from-left-2 fade-in duration-300">
                        <span className="text-muted-foreground">{log.time}</span>
                        <span className={`
              ${log.level === 'CRIT' ? 'text-destructive font-bold' : ''}
              ${log.level === 'ERROR' ? 'text-neon-magenta' : ''}
              ${log.level === 'WARN' ? 'text-neon-cyan' : ''}
              ${log.level === 'INFO' ? 'text-muted-foreground' : ''}
            `}>{log.level}</span>
                        <span className="text-neon-blue">{log.source}</span>
                        <span className="text-white/80 truncate">{log.message}</span>
                    </div>
                ))}
                <div className="absolute bottom-0 left-0 w-full h-10 bg-gradient-to-t from-card to-transparent pointer-events-none" />
            </div>
        </HoloPanel>
    );
}
