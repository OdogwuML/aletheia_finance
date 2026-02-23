"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const steps = [
    {
        title: "Vault",
        description: "Connect your wallet and deposit trading capital into your personal Smart Contract Vault.",
    },
    {
        title: "Strategy",
        description: "Type your strategy in plain English. Aletheia's NLP instantly understands your intent.",
    },
    {
        title: "Agent",
        description: "Your typed logic is converted into a Specialized Trading Agent. Preview before deployment.",
    },
    {
        title: "Authorize Trading",
        description: "Deploy and sign. You grant cryptographic permission, not direct access to your vault assets.",
    },
    {
        title: "Autopilot & Verification",
        description: "Agent executes 24/7. Every move generates a verifiable proof on the 0G Network.",
    },
    {
        title: "Real-Time Monitoring",
        description: "Track performance on your dashboard. Every trade has a 'Verifiable' badge.",
    },
    {
        title: "Total Control",
        description: "Stop anytime with one click. Revoke agent access and withdraw funds instantly.",
    },
];

export function HowItWorks() {
    return (
        <section id="how-it-works" className="py-24 md:py-32 bg-background relative overflow-hidden">
            <div className="mx-auto max-w-7xl px-6 relative z-10">
                <div className="relative z-10 mx-auto max-w-2xl space-y-6 text-center md:space-y-8 mb-20">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        viewport={{ once: true }}
                        className="text-balance text-4xl font-bold tracking-tight lg:text-6xl bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent"
                    >
                        How Aletheia Works
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        viewport={{ once: true }}
                        className="text-lg text-white/50"
                    >
                        A non-custodial pipeline for autonomous trading logic.
                    </motion.p>
                </div>

                <div className="relative mx-auto grid max-w-2xl lg:max-w-7xl overflow-hidden rounded-3xl sm:grid-cols-2 lg:grid-cols-4">
                    {steps.map((step, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            transition={{ duration: 1, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className="p-12 space-y-4 group hover:bg-white/[0.02] transition-colors"
                        >
                            <div className="space-y-2">
                                <span className="text-[10px] font-mono font-bold tracking-[0.2em] text-cyan-500/50 uppercase">
                                    Step {String(index + 1).padStart(2, '0')}
                                </span>
                                <h3 className="text-xl font-bold tracking-tight text-white/90 group-hover:text-white transition-colors">
                                    {step.title}
                                </h3>
                            </div>
                            <p className="text-sm text-white/40 leading-relaxed group-hover:text-white/60 transition-colors">
                                {step.description}
                            </p>
                        </motion.div>
                    ))}

                </div>
            </div>

            {/* Subtle Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full -z-10 opacity-10 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-[140px]" />
            </div>
        </section>
    );
}
