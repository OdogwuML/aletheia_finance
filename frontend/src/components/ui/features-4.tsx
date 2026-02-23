"use client";

import { motion } from "framer-motion";
import {
    Wallet,
    MessageSquare,
    Bot,
    ShieldCheck,
    Zap,
    LayoutDashboard,
    StopCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

const steps = [
    {
        title: "Secure Your Vault",
        description: "Connect your wallet and deposit trading capital into your personal Smart Contract Vault.",
        icon: Wallet,
    },
    {
        title: "Speak Your Strategy",
        description: "Type your strategy in plain English. Aletheia's NLP instantly understands your intent.",
        icon: MessageSquare,
    },
    {
        title: "Meet Your Agent",
        description: "Your typed logic is converted into a Specialized Trading Agent. Preview before deployment.",
        icon: Bot,
    },
    {
        title: "Authorize Trading",
        description: "Deploy and sign. You grant cryptographic permission—not direct access—to your vault assets.",
        icon: ShieldCheck,
    },
    {
        title: "Autopilot & Verification",
        description: "Agent executes 24/7. Every move generates a verifiable proof on the 0G Network.",
        icon: Zap,
    },
    {
        title: "Total Control",
        description: "Stop anytime with one click. Revoke agent access and withdraw funds instantly.",
        icon: StopCircle,
    },
];

export function Features4() {
    return (
        <section className="py-24 md:py-32 bg-background relative overflow-hidden">
            <div className="mx-auto max-w-5xl space-y-8 px-6 md:space-y-16 relative z-10">
                <div className="relative z-10 mx-auto max-w-2xl space-y-6 text-center md:space-y-8">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        viewport={{ once: true }}
                        className="text-balance text-4xl font-bold tracking-tight lg:text-5xl"
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
                        From natural language to verifiable execution in six simple steps.
                    </motion.p>
                </div>

                <div className="relative mx-auto grid max-w-2xl lg:max-w-4xl divide-x divide-y border border-white/10 overflow-hidden rounded-3xl sm:grid-cols-2 lg:grid-cols-3">
                    {steps.map((step, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            transition={{ duration: 0.8, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className="p-12 space-y-3 group hover:bg-white/[0.02] transition-colors"
                        >
                            <div className="flex items-center gap-2">
                                <step.icon className="size-4 text-cyan-400" />
                                <h3 className="text-sm font-medium text-white/90">{step.title}</h3>
                            </div>
                            <p className="text-sm text-white/40 leading-relaxed group-hover:text-white/60 transition-colors">
                                {step.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
