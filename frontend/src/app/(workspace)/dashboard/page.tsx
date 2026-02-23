'use client';

import { TrendingUp, Activity, Lock, Target, Plus, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const strategies = [
    {
        name: "Arbitrage Alpha",
        desc: "Cross-DEX Delta Neutral",
        roi: "+12.5%",
        status: "LIVE",
        icon: Target,
        color: "text-white"
    },
    {
        name: "Yield Maximizer",
        desc: "Compound Interest Engine",
        roi: "+8.2%",
        status: "LIVE",
        icon: TrendingUp,
        color: "text-white"
    }
];

export default function DashboardPage() {
    return (
        <div className="p-8 space-y-8 max-w-7xl mx-auto">
            {/* Dashboard Header / Vault Stats */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-4">
                <div>
                    <h1 className="text-3xl font-semibold tracking-tight mb-2">Monitor</h1>
                    <p className="text-white/40 font-medium">Institutional Grade DeFi Intelligence</p>
                </div>

                <div className="flex gap-4">
                    <Button variant="outline" className="border-white/10 bg-white/5 hover:bg-white/10 text-white rounded-xl h-12 px-6 font-semibold transition-all">
                        <Plus className="size-4 mr-2" /> New Agent
                    </Button>
                    <Button className="bg-white text-black hover:bg-white/90 rounded-xl h-12 px-6 font-semibold shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all">
                        Deploy Logic
                    </Button>
                </div>
            </div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Total Vault Value Card */}
                <div className="lg:col-span-2 bg-[#050505] border border-white/5 rounded-[32px] p-8 relative overflow-hidden group">
                    <div className="absolute inset-x-0 -top-px h-32 bg-gradient-to-b from-white/[0.02] to-transparent" />

                    <div className="flex justify-between items-start mb-12 relative z-10">
                        <div>
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/20 mb-3 block">Total Vault Value</span>
                            <div className="flex items-baseline gap-4">
                                <h2 className="text-5xl font-semibold tracking-tighter">$1,240,500.00</h2>
                                <span className="text-green-500 font-bold text-sm flex items-center gap-1">
                                    <TrendingUp className="size-4" /> 4.2%
                                </span>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            {['1D', '1W', '1M', 'ALL'].map((time) => (
                                <button key={time} className="px-3 py-1.5 rounded-lg text-[10px] font-bold border border-white/5 hover:bg-white/5 text-white/40 hover:text-white transition-all">
                                    {time}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Chart Visualization Placeholder - Monochromatic Wave */}
                    <div className="h-64 mt-8 relative z-10">
                        <div className="absolute inset-0 flex items-end">
                            <svg className="w-full h-full" preserveAspectRatio="none">
                                <path
                                    d="M0 200 Q 150 150 300 180 T 600 100 T 900 150 T 1200 50"
                                    fill="none"
                                    stroke="white"
                                    strokeWidth="3"
                                    className="opacity-80 shadow-[0_0_15px_rgba(255,255,255,0.5)]"
                                />
                                <path
                                    d="M0 200 Q 150 150 300 180 T 600 100 T 900 150 T 1200 50 V 256 H 0 Z"
                                    fill="url(#chartGradient)"
                                    className="opacity-20"
                                />
                                <defs>
                                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="white" />
                                        <stop offset="100%" stopColor="transparent" />
                                    </linearGradient>
                                </defs>
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Account Security / Tier Card */}
                <div className="bg-[#050505] border border-white/5 rounded-[32px] p-8 flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute inset-x-0 -top-px h-32 bg-gradient-to-b from-white/[0.02] to-transparent" />

                    <div className="relative z-10">
                        <div className="size-14 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center mb-6">
                            <Lock className="size-6 text-white/40" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Non-Custodial</h3>
                        <p className="text-white/30 text-sm leading-relaxed">
                            Your assets remain secure in the smart contract vault. The AI Agent only executes verified trade proofs.
                        </p>
                    </div>

                    <div className="space-y-4 relative z-10 mt-12">
                        <div className="p-4 bg-white/[0.03] border border-white/5 rounded-2xl">
                            <div className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-1">Status</div>
                            <div className="text-sm font-semibold flex items-center gap-2">
                                <span className="size-2 rounded-full bg-green-500" /> Fully Secured
                            </div>
                        </div>
                        <Button variant="outline" className="w-full border-white/10 hover:bg-white/5 font-bold h-12 rounded-xl text-xs uppercase tracking-widest">
                            Withdraw Funds
                        </Button>
                    </div>
                </div>
            </div>

            {/* Active AI Strategies Section */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold tracking-tight">Active AI Strategies</h2>
                    <Button variant="link" className="text-white/40 hover:text-white text-xs font-bold uppercase tracking-widest">
                        View All Agents <ArrowUpRight className="size-3 ml-1" />
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                    {strategies.map((strat) => (
                        <div key={strat.name} className="bg-[#050505] border border-white/5 rounded-[32px] p-8 flex items-center justify-between group hover:border-white/10 transition-all cursor-pointer">
                            <div className="flex items-center gap-6">
                                <div className="size-14 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center group-hover:bg-white/[0.05] transition-all">
                                    <strat.icon className="size-6 text-white/40 group-hover:text-white" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">{strat.name}</h3>
                                    <p className="text-white/30 text-sm">{strat.desc}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-green-500 font-bold text-xl mb-2">{strat.roi}</div>
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-[10px] font-bold tracking-widest uppercase">
                                    <span className="size-1.5 rounded-full bg-green-500 animate-pulse" />
                                    {strat.status}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
