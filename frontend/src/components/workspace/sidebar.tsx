'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
    LayoutDashboard,
    Beaker,
    Library,
    Settings,
    Info,
    Activity,
    Coins
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAccount } from "wagmi";
import { fetchUserStats } from "@/lib/api";

const navItems = [
    { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
    { label: "Strategy Lab", icon: Beaker, href: "/strategy-lab" },
    { label: "Vault Management", icon: Library, href: "/vaults" },
    { label: "Trade Receipts", icon: Info, href: "/receipts" },
];

export function Sidebar() {
    const pathname = usePathname();
    const { address, isConnected } = useAccount();
    const [credits, setCredits] = useState<number | null>(null);

    useEffect(() => {
        if (!isConnected || !address) {
            setCredits(null);
            return;
        }

        fetchUserStats(address).then((stats) => {
            setCredits(stats.credits);
        });
    }, [address, isConnected]);

    return (
        <aside className="w-64 border-r border-white/5 bg-[#050505] flex flex-col z-20">
            {/* Branding */}
            <div className="p-8 pb-10">
                <div className="flex items-center gap-3">
                    <div>
                        <div className="font-bold text-sm tracking-widest uppercase">Aletheia</div>
                        <div className="text-[10px] text-white/30 font-bold uppercase tracking-tight">Finance</div>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-1">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all group",
                                isActive
                                    ? "bg-white/5 text-white border border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.02)]"
                                    : "text-white/40 hover:text-white hover:bg-white/[0.02]"
                            )}
                        >
                            <item.icon className={cn(
                                "size-4 transition-colors",
                                isActive ? "text-white" : "text-white/20 group-hover:text-white/40"
                            )} />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom Utilities */}
            <div className="px-4 py-6 border-t border-white/5 space-y-4">
                <Link
                    href="/settings"
                    className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all",
                        pathname === "/settings"
                            ? "bg-white/5 text-white"
                            : "text-white/40 hover:text-white"
                    )}
                >
                    <Settings className="size-4" />
                    Settings
                </Link>

                {/* Credits Card */}
                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-white/20">Credits</span>
                        <Coins className="size-3 text-white/20" />
                    </div>
                    <div className="text-xl font-semibold mb-1 tracking-tight">
                        {credits !== null ? credits : "—"}
                    </div>
                    <div className="text-[10px] text-white/30 font-medium">
                        {isConnected ? "Available Balance" : "Connect Wallet"}
                    </div>
                </div>

                {/* User Profile Hook */}
                <div className="flex items-center gap-3 px-4 pt-4">
                    <div className="size-8 rounded-full bg-white/10 border border-white/10 flex items-center justify-center shrink-0">
                        <Activity className="size-4 text-white/40" />
                    </div>
                    <div className="overflow-hidden">
                        <div className="text-[11px] font-bold text-white truncate">
                            {isConnected && address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Not Connected"}
                        </div>
                        <div className="text-[9px] text-white/40 uppercase tracking-tighter">
                            {isConnected ? "Active Session" : "Disconnected"}
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
}
