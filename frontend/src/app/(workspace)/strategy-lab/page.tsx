"use client";

import { useState } from "react";
import {
    Settings2,
    ShieldAlert,
    LogOut,
    Link2,
    Rocket,
    Play,
    Save,
    Languages,
    RotateCcw,
    Loader2,
    ExternalLink,
    CheckCircle,
    Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAccount } from "wagmi";

export default function StrategyLabPage() {
    const { address, isConnected } = useAccount();
    const [strategyText, setStrategyText] = useState("");
    const [status, setStatus] = useState<'idle' | 'deploying' | 'success' | 'error'>('idle');
    const [deployResult, setDeployResult] = useState<{ txHash?: string; error?: string } | null>(null);

    // Use connected wallet or fall back to a demo address for testing
    const ownerAddress = address || "0xDemoUser0000000000000000000000000000000";

    const handleDeploy = async () => {
        if (!strategyText) return;

        setStatus('deploying');
        setDeployResult(null);

        try {
            const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";
            const response = await fetch(`${API_BASE}/strategies`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    logic_nlp: strategyText,
                    owner_address: ownerAddress,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to deploy strategy");
            }

            setStatus('success');
            setDeployResult({ txHash: data["0g_tx_hash"] });
        } catch (err: any) {
            console.error("Deployment Error:", err);
            setStatus('error');
            setDeployResult({ error: err.message });
        }
    };

    return (
        <div className="flex h-full relative bg-black font-sans overflow-y-auto">
            {/* Main Drafting Area */}
            <div className="flex-1 flex flex-col p-12 lg:p-16">
                <div className="max-w-4xl w-full">
                    <header className="mb-12">
                        <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/20 mb-4 block">Strategy Drafting</span>
                        <h1 className="text-6xl font-semibold tracking-tight text-white/90">Articulate your Strategy</h1>
                        {/* Wallet status indicator */}
                        <div className="mt-4 flex items-center gap-2">
                            <div className={`size-1.5 rounded-full ${isConnected ? 'bg-green-400' : 'bg-yellow-400'} animate-pulse`} />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-white/30">
                                {isConnected ? `Wallet: ${address?.slice(0, 6)}...${address?.slice(-4)}` : 'Demo Mode — Connect wallet to link strategies to your account'}
                            </span>
                        </div>
                    </header>

                    <div className="relative group rounded-2xl border border-white/10 bg-white/[0.02] p-6 focus-within:border-white/25 transition-colors duration-300">
                        {/* Textarea for NLP Input */}
                        <textarea
                            value={strategyText}
                            onChange={(e) => setStrategyText(e.target.value)}
                            placeholder="Define your entry and exit logic in natural language... e.g., 'When the 50-day EMA crosses above the 200-day EMA, buy 5% BTC...'"
                            className="w-full h-80 bg-transparent text-2xl font-medium leading-relaxed text-white/80 placeholder:text-white/10 resize-none outline-none custom-scrollbar focus:placeholder:opacity-0 transition-all"
                        />
                    </div>
                </div>

                {/* Action Bar — directly below the textarea */}
                <div className="mt-10 flex items-center gap-3">
                    <div className="px-6 py-2 bg-[#0A0A0A] border border-white/5 rounded-full flex items-center gap-2 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-xl">
                        <Button variant="ghost" size="icon" className="rounded-full text-white/20 hover:text-white transition-colors">
                            <Languages className="size-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="rounded-full text-white/20 hover:text-white transition-colors">
                            <Save className="size-4" />
                        </Button>
                        <div className="w-px h-4 bg-white/10 mx-2" />
                        <Button variant="outline" className="rounded-full border-white/10 bg-white/5 hover:bg-white/10 text-white/60 font-bold text-[10px] uppercase tracking-widest h-10 px-6">
                            <Play className="size-3 mr-2 fill-current" /> Backtest
                        </Button>
                        <Button
                            className={cn(
                                "rounded-full font-bold text-[10px] uppercase tracking-widest h-10 px-8 flex items-center gap-2 transition-all",
                                status === 'success' ? "bg-green-500 text-white" : "bg-white text-black hover:bg-white/90 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                            )}
                            onClick={handleDeploy}
                            disabled={status === 'deploying' || !strategyText}
                        >
                            {status === 'deploying' ? (
                                <>Deploying... <Loader2 className="size-3 animate-spin" /></>
                            ) : status === 'success' ? (
                                <>Secured <CheckCircle className="size-3" /></>
                            ) : (
                                <>Deploy Agent <Rocket className="size-3" /></>
                            )}
                        </Button>
                    </div>
                </div>

                {/* Status Feedback */}
                {deployResult && (
                    <div className={cn(
                        "mt-8 p-4 rounded-2xl border flex items-center justify-between animate-in slide-in-from-bottom-4 transition-all",
                        status === 'success' ? "bg-green-500/5 border-green-500/20 text-green-500" : "bg-red-500/5 border-red-500/20 text-red-500"
                    )}>
                        <div className="flex items-center gap-3">
                            {status === 'success' ? <ShieldAlert className="size-4" /> : <ShieldAlert className="size-4" />}
                            <span className="text-xs font-bold tracking-tight uppercase">
                                {status === 'success' ? "Strategy Secured on 0G Network" : `Error: ${deployResult.error}`}
                            </span>
                        </div>
                        {status === 'success' && deployResult.txHash && (
                            <a
                                href={`https://storagescan-galileo.0g.ai/tx/${deployResult.txHash}`}
                                target="_blank"
                                className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1 hover:underline"
                            >
                                View Receipt <ExternalLink className="size-3" />
                            </a>
                        )}
                    </div>
                )}
            </div>

            {/* Configuration Sidebar (Right) */}
            <aside className="w-[400px] border-l border-white/5 bg-[#050505]/50 backdrop-blur-md flex flex-col p-8 overflow-y-auto custom-scrollbar">
                <div className="flex items-center justify-between mb-12">
                    <h2 className="flex items-center gap-3 text-sm font-bold uppercase tracking-[0.2em] text-white">
                        <Settings2 className="size-4 text-white/40" /> Configuration
                    </h2>
                    <Button variant="ghost" size="sm" className="text-[10px] uppercase tracking-widest text-white/20 hover:text-white/60 font-bold">
                        <RotateCcw className="size-3 mr-2" /> Reset
                    </Button>
                </div>

                <div className="space-y-12">
                    {/* Watcher Intelligence (New) */}
                    <section>
                        <h3 className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/20 mb-6">
                            <Activity className="size-3" /> Watcher Intelligence
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-[11px] font-medium text-white/40 block mb-3">Watcher Model</label>
                                <div className="p-4 bg-white/[0.04] border border-white/20 rounded-2xl relative overflow-hidden group">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-bold text-white">OpenClaw Autonomous</span>
                                        <div className="px-2 py-0.5 rounded-full bg-white/10 text-white/50 text-[8px] font-bold uppercase">Advanced Web</div>
                                    </div>
                                    <p className="text-[10px] text-white/30 leading-tight">Proactive web-scanning, sentiment analysis, and news-triggered execution.</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Risk Parameters */}
                    <section>
                        <h3 className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/20 mb-6">
                            <ShieldAlert className="size-3" /> Risk Parameters
                        </h3>
                        <div className="space-y-6">
                            <div>
                                <label className="text-[11px] font-medium text-white/40 block mb-2">Max Drawdown (%)</label>
                                <input
                                    type="text"
                                    defaultValue="12.5"
                                    className="w-full h-12 bg-white/[0.02] border border-white/5 rounded-xl px-4 text-sm font-semibold text-white focus:border-white/20 outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="text-[11px] font-medium text-white/40 block mb-2">Position Sizing</label>
                                <select className="w-full h-12 bg-white/[0.02] border border-white/5 rounded-xl px-4 text-sm font-semibold text-white bg-black appearance-none focus:border-white/20 outline-none transition-all cursor-pointer">
                                    <option>Fixed Percentage (2%)</option>
                                    <option>Fixed Amount ($500)</option>
                                    <option>Risk-Weighted</option>
                                </select>
                            </div>
                        </div>
                    </section>

                    {/* Exit Logic */}
                    <section>
                        <h3 className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/20 mb-6">
                            <LogOut className="size-3" /> Exit Logic
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[11px] font-medium text-white/40 block mb-2">Stop Loss</label>
                                <div className="relative">
                                    <input type="text" defaultValue="3.5" className="w-full h-12 bg-white/[0.02] border border-white/5 rounded-xl px-4 text-sm font-semibold text-white outline-none" />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-white/20">%</span>
                                </div>
                            </div>
                            <div>
                                <label className="text-[11px] font-medium text-white/40 block mb-2">Take Profit</label>
                                <div className="relative">
                                    <input type="text" defaultValue="10.0" className="w-full h-12 bg-white/[0.02] border border-white/5 rounded-xl px-4 text-sm font-semibold text-white outline-none" />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-white/20">%</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Fundamental Intelligence */}
                    <section>
                        <h3 className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/20 mb-6">
                            <Languages className="size-3" /> Fundamental Intelligence
                        </h3>
                        <div className="space-y-3">
                            {[
                                { name: 'Social Sentiment', status: 'Active' },
                                { name: 'Protocol TVL (Dune)', status: 'Latency: 5m' },
                                { name: 'Wallet Whale Alerts', status: 'Real-time' },
                            ].map((source) => (
                                <div key={source.name} className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/5 rounded-xl group hover:border-white/20 transition-all cursor-pointer">
                                    <div>
                                        <div className="text-xs font-semibold text-white/40 group-hover:text-white transition-colors">{source.name}</div>
                                        <div className="text-[8px] font-bold text-white/10 uppercase tracking-tighter">{source.status}</div>
                                    </div>
                                    <div className="size-4 rounded border border-white/10 flex items-center justify-center">
                                        <div className="size-2 bg-white/20 rounded-sm group-hover:bg-white transition-colors" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Connectivity */}
                    <section>
                        <h3 className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/20 mb-6">
                            <Link2 className="size-3" /> Connectivity
                        </h3>
                        <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="size-8 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center">
                                        <div className="size-4 border-2 border-white/20" />
                                    </div>
                                    <span className="text-sm font-semibold">Binance Global</span>
                                </div>
                                <div className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 text-[8px] font-bold uppercase tracking-widest">Active</div>
                            </div>
                            <Button variant="link" className="p-0 h-auto text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-white transition-colors">
                                Manage API Keys
                            </Button>
                        </div>
                    </section>
                </div>
            </aside>
        </div>
    );
}
