"use client";

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { ShieldCheck, Brain, Zap } from 'lucide-react'
import { ReactNode } from 'react'
import { motion } from 'framer-motion'

export function Features() {
    return (
        <section id="features" className="py-16 md:py-32 dark:bg-transparent">
            <div className="@container mx-auto max-w-5xl px-6">
                <div className="text-center">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        viewport={{ once: true }}
                        className="text-balance text-4xl font-semibold lg:text-5xl"
                    >
                        Built for Security and Trust
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        viewport={{ once: true }}
                        className="mt-4 text-muted-foreground"
                    >
                        The first non-custodial AI Agent platform powered by the worlds's fastest modular AI chain.
                    </motion.p>
                </div>
                <div className="@min-4xl:max-w-full @min-4xl:grid-cols-3 mx-auto mt-8 grid max-w-sm gap-6 *:text-center md:mt-16">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        viewport={{ once: true }}
                    >
                        <Card className="group h-full shadow-black-950/5 bg-background/50 backdrop-blur-sm border-white/10 hover:border-white/20 transition-colors">
                            <CardHeader className="pb-3">
                                <CardDecorator>
                                    <Brain className="size-6 text-neon-cyan" aria-hidden />
                                </CardDecorator>

                                <h3 className="mt-6 font-medium">Decentralized AI</h3>
                            </CardHeader>

                            <CardContent>
                                <p className="text-sm text-muted-foreground leading-relaxed">Model inference verified on the 0G Compute layer. No black boxes, just verifiable results.</p>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        viewport={{ once: true }}
                    >
                        <Card className="group h-full shadow-black-950/5 bg-background/50 backdrop-blur-sm border-white/10 hover:border-white/20 transition-colors">
                            <CardHeader className="pb-3">
                                <CardDecorator>
                                    <ShieldCheck className="size-6 text-neon-purple" aria-hidden />
                                </CardDecorator>

                                <h3 className="mt-6 font-medium">Non-Custodial</h3>
                            </CardHeader>

                            <CardContent>
                                <p className="text-sm text-muted-foreground leading-relaxed">Your funds never leave your Vault. You grant permission; the AI Agent executes under your rules.</p>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        viewport={{ once: true }}
                    >
                        <Card className="group h-full shadow-black-950/5 bg-background/50 backdrop-blur-sm border-white/10 hover:border-white/20 transition-colors">
                            <CardHeader className="pb-3">
                                <CardDecorator>
                                    <Zap className="size-6 text-neon-cyan" aria-hidden />
                                </CardDecorator>

                                <h3 className="mt-6 font-medium">Verifiable Proofs</h3>
                            </CardHeader>

                            <CardContent>
                                <p className="text-sm text-muted-foreground leading-relaxed">Every trade generates a permanent proof hash stored on 0G Storage, audit-ready and tamper-proof.</p>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}

const CardDecorator = ({ children }: { children: ReactNode }) => (
    <div aria-hidden className="relative mx-auto size-36 [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]">
        <div className="absolute inset-0 [--border:black] dark:[--border:white] bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:24px_24px] opacity-10" />
        <div className="bg-background/20 absolute inset-0 m-auto flex size-12 items-center justify-center border-t border-l backdrop-blur-sm">{children}</div>
    </div>
)
