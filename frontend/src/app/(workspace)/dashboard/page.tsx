'use client';

import { useEffect, useState } from "react";
import { TrendingUp, Lock, Target, Plus, ArrowUpRight, Loader2, Play, ExternalLink, CheckCircle, Activity } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAccount } from "wagmi";
import { fetchUserStats, fetchUserStrategies, fetchWatcherAlerts, executeTradeTrigger, type UserStats, type Strategy, type WatcherAlert, type TradeResult } from "@/lib/api";

export default function DashboardPage() {
    const { address, isConnected } = useAccount();
    const [stats, setStats] = useState<UserStats | null>(null);
    const [strategies, setStrategies] = useState<Strategy[]>([]);
    const [alerts, setAlerts] = useState<WatcherAlert[]>([]);
    const [loading, setLoading] = useState(true);
    const [executingId, setExecutingId] = useState<string | null>(null);
    const [tradeResult, setTradeResult] = useState<TradeResult | null>(null);

    const handleSimulateTrade = async (id: string) => {
        setExecutingId(id);
        const result = await executeTradeTrigger(id);
        setTradeResult(result);
        setExecutingId(null);
    };

    useEffect(() => {
        if (!isConnected || !address) {
            setLoading(false);
            setStats(null);
            setStrategies([]);
            setAlerts([]);
            return;
        }

        const loadData = async () => {
            setLoading(true);
            const [userStats, userStrategies, watcherAlerts] = await Promise.all([
                fetchUserStats(address),
                fetchUserStrategies(address),
                fetchWatcherAlerts(),
            ]);
            setStats(userStats);
            setStrategies(userStrategies);
            setAlerts(watcherAlerts);
            setLoading(false);
        };

        loadData();

        const interval = setInterval(loadData, 30000);
        return () => clearInterval(interval);
    }, [address, isConnected]);

    const vaultValue = stats ? `${stats.credits}` : "0";
    const stratCount = stats?.strategies_count ?? 0;

    return (
        <div className="p-8 space-y-8 max-w-7xl mx-auto">
            {/* Dashboard Header */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-4">
                <div>
                    <h1 className="text-3xl font-semibold tracking-tight mb-2">Monitor</h1>
                    <p className="text-white/40 font-medium">Institutional Grade DeFi Intelligence</p>
                </div>

                <div className="flex gap-4">
                    <Link href="/strategy-lab">
                        <Button variant="outline" className="border-white/10 bg-white/5 hover:bg-white/10 text-white rounded-xl h-12 px-6 font-semibold transition-all">
                            <Plus className="size-4 mr-2" /> New Agent
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-[#050505] border border-white/5 rounded-[32px] p-8 relative overflow-hidden group">
                    <div className="absolute inset-x-0 -top-px h-32 bg-gradient-to-b from-white/[0.02] to-transparent" />
                    <div className="flex justify-between items-start mb-12 relative z-10">
                        <div>
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/20 mb-3 block">Available Credits</span>
                            <div className="flex items-baseline gap-4">
                                {loading ? (
                                    <Loader2 className="size-8 animate-spin text-white/20" />
                                ) : (
                                    <>
                                        <h2 className="text-5xl font-semibold tracking-tighter">{vaultValue}</h2>
                                        <span className="text-white/30 font-bold text-sm">credits</span>
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <div className="px-4 py-2 rounded-xl bg-white/[0.03] border border-white/5 text-center">
                                <div className="text-[9px] font-bold uppercase tracking-widest text-white/20 mb-1">Strategies</div>
                                <div className="text-xl font-semibold">{loading ? "—" : stratCount}</div>
                            </div>
                        </div>
                    </div>
                    {/* Simplified Chart */}
                    <div className="h-48 mt-8 relative z-10">
                        <div className="absolute inset-0 flex items-end">
                            <svg className="w-full h-full" preserveAspectRatio="none">
                                <path
                                    d="M0 150 Q 150 100 300 130 T 600 50 T 900 100 T 1200 30"
                                    fill="none"
                                    stroke="white"
                                    strokeWidth="2"
                                    className="opacity-30"
                                />
                            </svg>
                        </div>
                    </div>
                </div>

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
                                <span className={`size-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-white/20'}`} />
                                {isConnected ? 'Wallet Connected' : 'Not Connected'}
                            </div>
                        </div>
                        <Button variant="outline" className="w-full border-white/10 hover:bg-white/5 font-bold h-12 rounded-xl text-xs uppercase tracking-widest">
                            Withdraw Assets
                        </Button>
                    </div>
                </div>

                <div className="bg-[#050505] border border-white/5 rounded-[32px] p-8 relative overflow-hidden flex flex-col h-full mt-6">
                    <div className="relative z-10 mb-6 flex items-center justify-between">
                        <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-white/40 flex items-center gap-2">
                            <TrendingUp className="size-4 text-white/20" /> Watcher Pulse
                        </h3>
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-green-500/10 border border-green-500/20">
                            <span className="size-1.5 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-[8px] font-bold text-green-500 uppercase tracking-widest">Live</span>
                        </div>
                    </div>
                    <div className="relative z-10 flex-1 space-y-4 overflow-y-auto custom-scrollbar pr-2 max-h-[300px]">
                        {alerts.map((alert) => (
                            <div key={alert.id} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all group">
                                <div className="flex items-center justify-between mb-2">
                                    <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${alert.severity === 'High' ? 'bg-red-500/10 text-red-500' : 'bg-white/10 text-white/40'}`}>
                                        {alert.type}
                                    </span>
                                    <span className="text-[8px] font-bold text-white/20 uppercase tracking-widest">
                                        {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <h4 className="text-xs font-bold text-white mb-1 group-hover:text-white transition-colors">{alert.title}</h4>
                                <p className="text-[10px] text-white/30 leading-relaxed font-medium">{alert.summary}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Active AI Strategies */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold tracking-tight">Active AI Strategies</h2>
                    <Button variant="link" className="text-white/40 hover:text-white text-xs font-bold uppercase tracking-widest">
                        View All Agents <ArrowUpRight className="size-3 ml-1" />
                    </Button>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <Loader2 className="size-6 animate-spin text-white/20" />
                    </div>
                ) : strategies.length === 0 ? (
                    <div className="bg-[#050505] border border-white/5 rounded-[32px] p-12 text-center">
                        <h3 className="text-lg font-semibold mb-2 text-white/60">No Active Strategies</h3>
                        <Button variant="outline" className="border-white/10 bg-white/5 hover:bg-white/10 text-white rounded-xl h-10 px-6 font-semibold text-xs uppercase tracking-widest">
                            Go to Strategy Lab
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                        {strategies.map((strat) => (
                            <div key={strat.strategy_id} className="bg-[#050505] border border-white/5 rounded-[32px] p-8 flex flex-col group hover:border-white/10 transition-all">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-6">
                                        <div className="size-14 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center group-hover:bg-white/[0.05] transition-all">
                                            <Target className="size-6 text-white/40 group-hover:text-white" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-lg truncate max-w-[200px]">{strat.logic_nlp.slice(0, 30)}...</h3>
                                            <p className="text-white/30 text-sm font-mono">{strat.strategy_id.slice(0, 8)}...</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-8 border-white/5 bg-white/[0.02] text-[10px] font-bold uppercase tracking-widest hover:bg-white/10"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleSimulateTrade(strat.strategy_id);
                                            }}
                                            disabled={executingId === strat.strategy_id}
                                        >
                                            {executingId === strat.strategy_id ? <Loader2 className="size-3 animate-spin mr-2" /> : <Play className="size-3 mr-2" />}
                                            Run Agent
                                        </Button>
                                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase ${strat.status === 'active' ? 'bg-green-500/10 text-green-500' : 'bg-white/5 text-white/40'}`}>
                                            <span className={`size-1.5 rounded-full ${strat.status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-white/20'}`} />
                                            {strat.status}
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-auto flex items-center justify-between">
                                    {strat.deployment_tx && (
                                        <a
                                            href={`https://storagescan-galileo.0g.ai/tx/${strat.deployment_tx}`}
                                            target="_blank"
                                            className="text-[9px] font-bold text-white/20 hover:text-white/60 uppercase tracking-widest transition-colors"
                                        >
                                            View Storage Proof →
                                        </a>
                                    )}
                                    <div className="text-xs font-bold text-green-500">+0.00% ROI</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Trade Result Modal */}
            {tradeResult && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
                    <div className="bg-[#050505] border border-white/10 rounded-[32px] p-8 w-full max-w-lg relative overflow-hidden">
                        <div className="absolute inset-x-0 -top-px h-32 bg-gradient-to-b from-green-500/10 to-transparent" />
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-lg font-bold uppercase tracking-widest text-white">0G Execution Proof</h3>
                                <button onClick={() => setTradeResult(null)} className="text-white/40 hover:text-white">✕</button>
                            </div>
                            <div className="space-y-6">
                                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
                                    <div className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-3">Proof of Inference</div>
                                    <div className="text-[10px] font-mono text-white/40 break-all p-3 bg-black/40 rounded-lg border border-white/5">
                                        {tradeResult.signature}
                                    </div>
                                </div>
                                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
                                    <div className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-3">TEE Attestation</div>
                                    <div className="text-[10px] font-mono text-green-500/60 flex items-center gap-2">
                                        <CheckCircle className="size-3 text-green-500" /> {tradeResult.attestation}
                                    </div>
                                </div>
                                <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/10">
                                    <div className="text-[10px] font-bold text-green-500 uppercase tracking-widest mb-1">Vault Outcome</div>
                                    <div className="text-xs font-medium text-green-500/80">{tradeResult.vault_action}</div>
                                </div>
                            </div>
                            <Button onClick={() => setTradeResult(null)} className="w-full mt-8 bg-white text-black font-black h-12 rounded-xl text-[10px] uppercase tracking-widest">
                                Close Proof
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
