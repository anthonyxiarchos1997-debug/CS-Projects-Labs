import { Shell } from "@/components/layout/Shell";
import { StatsGrid } from "@/components/dashboard/StatsGrid";
import { ThreatSkyline } from "@/components/dashboard/ThreatSkyline";
import { LogStream } from "@/components/dashboard/LogStream";
import { HoloPanel } from "@/components/ui/HoloPanel";

export default function Dashboard() {
  return (
    <Shell>
      <div className="flex flex-col gap-6 h-full">
        {/* Hero Stats */}
        <StatsGrid />

        {/* Main Visuals */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[400px]">
          <div className="lg:col-span-2 h-full">
            <ThreatSkyline />
          </div>
          <div className="h-full">
            <HoloPanel title="SYSTEM STATUS" glowColor="magenta" className="h-full">
              <div className="flex flex-col gap-4 h-full justify-center items-center">
                <div className="relative w-40 h-40 flex items-center justify-center">
                  <div className="absolute inset-0 border-4 border-muted rounded-full" />
                  <div className="absolute inset-0 border-4 border-t-neon-magenta border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" />
                  <div className="text-2xl font-bold text-white">98%</div>
                </div>
                <div className="text-center">
                  <div className="text-neon-magenta font-bold">OPTIMAL</div>
                  <div className="text-xs text-muted-foreground">AI DEFENSE ACTIVE</div>
                </div>
              </div>
            </HoloPanel>
          </div>
        </div>

        {/* Logs & Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-[300px]">
          <LogStream />
          <HoloPanel title="ACTIVE ALERTS" glowColor="red" className="h-full">
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-destructive/10 border border-destructive/20 p-3 rounded-sm flex items-center gap-3">
                  <div className="w-2 h-2 bg-destructive rounded-full animate-pulse" />
                  <div className="flex-1">
                    <div className="text-sm font-bold text-white">UNAUTHORIZED ACCESS ATTEMPT</div>
                    <div className="text-xs text-destructive/80">HOST: SRV-DB-02 // IP: 10.0.0.55</div>
                  </div>
                  <button className="text-xs bg-destructive/20 hover:bg-destructive text-destructive hover:text-white px-2 py-1 rounded transition-colors">
                    INVESTIGATE
                  </button>
                </div>
              ))}
            </div>
          </HoloPanel>
        </div>
      </div>
    </Shell>
  );
}
