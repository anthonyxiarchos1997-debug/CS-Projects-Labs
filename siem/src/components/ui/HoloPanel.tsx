import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface HoloPanelProps {
    children: ReactNode;
    className?: string;
    title?: string;
    glowColor?: "cyan" | "magenta" | "violet" | "red";
}

export function HoloPanel({ children, className, title, glowColor = "cyan" }: HoloPanelProps) {
    const glowMap = {
        cyan: "border-neon-cyan/30 shadow-[0_0_15px_rgba(0,243,255,0.1)]",
        magenta: "border-neon-magenta/30 shadow-[0_0_15px_rgba(255,0,255,0.1)]",
        violet: "border-neon-violet/30 shadow-[0_0_15px_rgba(188,19,254,0.1)]",
        red: "border-destructive/30 shadow-[0_0_15px_rgba(255,0,60,0.1)]",
    };

    return (
        <div className={cn(
            "relative bg-card/60 backdrop-blur-md border p-4 rounded-sm overflow-hidden",
            glowMap[glowColor],
            className
        )}>
            {/* Holographic Scanline Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] pointer-events-none opacity-20" />

            {/* Corner Accents */}
            <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-current opacity-50" />
            <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-current opacity-50" />
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-current opacity-50" />
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-current opacity-50" />

            {title && (
                <div className="mb-4 flex items-center gap-2 border-b border-white/10 pb-2">
                    <div className={cn("w-1 h-4",
                        glowColor === "cyan" && "bg-neon-cyan",
                        glowColor === "magenta" && "bg-neon-magenta",
                        glowColor === "violet" && "bg-neon-violet",
                        glowColor === "red" && "bg-destructive",
                    )} />
                    <h3 className="font-orbitron text-sm tracking-wider uppercase text-white/90">{title}</h3>
                </div>
            )}

            <div className="relative z-10">
                {children}
            </div>
        </div>
    );
}
