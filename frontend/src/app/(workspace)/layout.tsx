import { Sidebar } from "@/components/workspace/sidebar";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Bell } from "lucide-react";

export default function WorkspaceLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen bg-black text-white selection:bg-white/20 overflow-hidden font-sans">
            {/* Nav Sidebar */}
            <Sidebar />

            <div className="flex-1 flex flex-col min-w-0">
                {/* Top Header */}
                <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-[#050505]/50 backdrop-blur-xl z-10 shrink-0">
                    <div>
                        {/* Dynamic title would go here, for now placeholder */}
                        <div className="flex items-center gap-3">
                            <span className="text-white/20 font-bold uppercase tracking-[0.2em] text-[10px]">Aletheia Workspace</span>
                            <div className="w-px h-3 bg-white/10" />
                            <span className="text-white font-medium text-sm tracking-tight capitalize">Dashboard</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        {/* Network Status Indicator */}
                        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-white/[0.03] border border-white/5 rounded-full text-[10px] font-bold uppercase tracking-widest text-white/40">
                            <span className="size-1.5 rounded-full bg-white shadow-[0_0_5px_rgba(255,255,255,0.5)]" />
                            Network: Galileo Testnet
                        </div>

                        <button className="relative p-2 text-white/40 hover:text-white transition-colors">
                            <Bell className="size-5" />
                            <span className="absolute top-2 right-2 size-2 bg-white rounded-full border-2 border-black" />
                        </button>

                        <div className="w-px h-6 bg-white/10" />

                        <ConnectButton
                            accountStatus="address"
                            chainStatus="none"
                            showBalance={false}
                        />

                        <div className="size-8 rounded-full bg-gradient-to-br from-white/20 to-transparent border border-white/10 shrink-0" />
                    </div>
                </header>

                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto bg-[#020202] custom-scrollbar">
                    {children}
                </main>
            </div>
        </div>
    );
}
