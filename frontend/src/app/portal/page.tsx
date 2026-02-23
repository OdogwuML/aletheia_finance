'use client';

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Fingerprint, CheckCircle2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function PortalPage() {
    const { isConnected } = useAccount();
    const router = useRouter();

    useEffect(() => {
        if (isConnected) {
            router.push("/strategy-lab");
        }
    }, [isConnected, router]);

    return (
        <div className="min-h-screen bg-black text-white flex flex-col font-sans selection:bg-white/20">
            {/* Minimal Header */}
            <header className="px-8 h-20 flex items-center justify-between border-b border-white/5">
                <div className="flex items-center gap-2">
                    <span className="font-bold tracking-tight text-xl uppercase">Aletheia Finance</span>
                </div>
                <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-white/60">
                    <a href="/" className="hover:text-white transition-colors">Features</a>
                    <a href="/" className="hover:text-white transition-colors">Pricing</a>
                    <a href="/" className="hover:text-white transition-colors">About</a>
                    <ConnectButton />
                </nav>
            </header>

            {/* Main Portal Area */}
            <main className="flex-1 flex items-center justify-center p-6 relative overflow-hidden">
                {/* Subtle Background Surface */}
                <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05)_0%,transparent_100%)]" />
                </div>

                <div className="w-full max-w-xl z-10">
                    <div className="bg-[#050505] border border-white/5 rounded-[32px] p-12 flex flex-col items-center text-center shadow-2xl relative overflow-hidden group">
                        {/* Subtle inner glow */}
                        <div className="absolute inset-x-0 -top-px h-24 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />

                        {/* Icon */}
                        <div className="size-20 rounded-full bg-white/[0.03] border border-white/5 flex items-center justify-center mb-8 group-hover:bg-white/[0.05] transition-colors duration-500">
                            <Fingerprint className="size-10 text-white/40 group-hover:text-white/60 transition-colors" />
                        </div>

                        {/* Text */}
                        <h1 className="text-4xl font-semibold tracking-tight mb-4">Access Portal</h1>
                        <p className="text-white/40 text-lg max-w-[320px] mb-12 leading-relaxed">
                            Connect your decentralized identity to access your dashboard.
                        </p>

                        {/* Primary Action */}
                        <div className="w-full max-w-sm mb-6">
                            <ConnectButton.Custom>
                                {({
                                    account,
                                    chain,
                                    openConnectModal,
                                    authenticationStatus,
                                    mounted,
                                }) => {
                                    const ready = mounted && authenticationStatus !== 'loading';
                                    const connected = ready && account && chain && (!authenticationStatus || authenticationStatus === 'authenticated');

                                    return (
                                        <Button
                                            className="w-full h-14 rounded-xl bg-white text-black hover:bg-white/90 font-semibold text-base transition-all active:scale-[0.98] flex items-center justify-center gap-3 overflow-hidden group"
                                            onClick={openConnectModal}
                                            disabled={!ready}
                                        >
                                            {connected ? (
                                                <div className="flex items-center gap-2">
                                                    <span className="size-2 rounded-full bg-green-500 animate-pulse" />
                                                    {account.displayName}
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="size-5 bg-black rounded flex items-center justify-center border border-white/10 group-hover:border-white/20 transition-colors">
                                                        <div className="size-1.5 bg-white rounded-full opacity-40" />
                                                    </div>
                                                    Connect Wallet
                                                </>
                                            )}
                                        </Button>
                                    );
                                }}
                            </ConnectButton.Custom>
                        </div>

                        {/* Secondary status */}
                        <div className="flex items-center gap-2 text-white/30 text-[11px] font-bold uppercase tracking-[0.1em] mb-16">
                            <CheckCircle2 className="size-3 text-green-500/50" />
                            End-to-end encrypted
                        </div>

                        {/* Footer section of card */}
                        <div className="w-full pt-10 border-t border-white/5">
                            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/20 mb-8">Supported Networks</h3>
                            <div className="flex justify-center gap-12 text-white/20">
                                <div className="flex flex-col items-center gap-3 group/icon">
                                    <div className="size-12 rounded-full border border-white/5 flex items-center justify-center group-hover/icon:border-white/10 transition-colors">
                                        <div className="size-5 bg-white/5 rounded-sm" />
                                    </div>
                                    <span className="text-[9px] font-bold uppercase tracking-widest group-hover/icon:text-white/40 transition-colors">Metamask</span>
                                </div>
                                <div className="flex flex-col items-center gap-3 group/icon">
                                    <div className="size-12 rounded-full border border-white/5 flex items-center justify-center group-hover/icon:border-white/10 transition-colors">
                                        <div className="size-5 border-2 border-white/10 rounded-full" />
                                    </div>
                                    <span className="text-[9px] font-bold uppercase tracking-widest group-hover/icon:text-white/40 transition-colors">Coinbase</span>
                                </div>
                                <div className="flex flex-col items-center gap-3 group/icon">
                                    <div className="size-12 rounded-full border border-white/5 flex items-center justify-center group-hover/icon:border-white/10 transition-colors">
                                        <div className="size-5 grid grid-cols-2 gap-0.5">
                                            <div className="size-2 rounded-full bg-white/10" />
                                            <div className="size-2 rounded-full bg-white/10" />
                                            <div className="size-2 rounded-full bg-white/10" />
                                            <div className="size-2 rounded-full bg-white/10" />
                                        </div>
                                    </div>
                                    <span className="text-[9px] font-bold uppercase tracking-widest group-hover/icon:text-white/40 transition-colors">Connect</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 text-white/30 text-xs">
                            New to DeFi? <a href="#" className="text-white hover:underline underline-offset-4">Get started here</a>
                        </div>
                    </div>
                </div>
            </main>

            {/* Global Footer info */}
            <footer className="h-20 px-8 flex items-center justify-between border-t border-white/5 text-[10px] font-bold uppercase tracking-[0.2em] text-white/25">
                <div className="flex items-center gap-3">
                    <div className="size-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
                    Mainnet Live
                </div>
                <div>V2.4.0</div>
                <div>Security Audit by Certik</div>
            </footer>
        </div>
    );
}
