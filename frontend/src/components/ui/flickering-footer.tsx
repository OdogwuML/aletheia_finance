"use client";

import { ChevronRightIcon } from "@radix-ui/react-icons";
import { ClassValue, clsx } from "clsx";
import * as Color from "color-bits";
import { motion } from "motion/react";
import Link from "next/link";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import { WordmarkIcon } from "@/components/ui/header-1";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// Helper function to convert any CSS color to rgba
export const getRGBA = (
    cssColor: React.CSSProperties["color"],
    fallback: string = "rgba(180, 180, 180)",
): string => {
    if (typeof window === "undefined") return fallback;
    if (!cssColor) return fallback;

    try {
        // Handle CSS variables
        if (typeof cssColor === "string" && cssColor.startsWith("var(")) {
            const element = document.createElement("div");
            element.style.color = cssColor;
            document.body.appendChild(element);
            const computedColor = window.getComputedStyle(element).color;
            document.body.removeChild(element);
            return Color.formatRGBA(Color.parse(computedColor));
        }

        return Color.formatRGBA(Color.parse(cssColor));
    } catch (e) {
        console.error("Color parsing failed:", e);
        return fallback;
    }
};

// Helper function to add opacity to an RGB color string
export const colorWithOpacity = (color: string, opacity: number): string => {
    if (!color.startsWith("rgb")) return color;
    return Color.formatRGBA(Color.alpha(Color.parse(color), opacity));
};

export const Icons = {
    logo: ({ className }: { className?: string }) => (
        <WordmarkIcon className={className} />
    ),
    soc2: ({ className }: { className?: string }) => (
        <svg
            width="46"
            height="45"
            viewBox="0 0 46 45"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={cn("size-10", className)}
        >
            <rect x="3" y="0.86" width="40" height="40" rx="20" fill="currentColor" fillOpacity="0.1" />
            <text x="23" y="25" textAnchor="middle" fill="currentColor" fontSize="10" fontWeight="bold">SOC2</text>
        </svg>
    ),
};

interface FlickeringGridProps extends React.HTMLAttributes<HTMLDivElement> {
    squareSize?: number;
    gridGap?: number;
    flickerChance?: number;
    color?: string;
    width?: number;
    height?: number;
    className?: string;
    maxOpacity?: number;
    text?: string;
    textColor?: string;
    fontSize?: number;
    fontWeight?: number | string;
}

export const FlickeringGrid: React.FC<FlickeringGridProps> = ({
    squareSize = 3,
    gridGap = 3,
    flickerChance = 0.2,
    color = "#B4B4B4",
    width,
    height,
    className,
    maxOpacity = 0.15,
    text = "",
    fontSize = 140,
    fontWeight = 600,
    ...props
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isInView, setIsInView] = useState(false);
    const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

    const memoizedColor = useMemo(() => getRGBA(color), [color]);

    const drawGrid = useCallback(
        (
            ctx: CanvasRenderingContext2D,
            width: number,
            height: number,
            cols: number,
            rows: number,
            squares: Float32Array,
            dpr: number,
        ) => {
            ctx.clearRect(0, 0, width, height);

            const maskCanvas = document.createElement("canvas");
            maskCanvas.width = width;
            maskCanvas.height = height;
            const maskCtx = maskCanvas.getContext("2d", { willReadFrequently: true });
            if (!maskCtx) return;

            if (text) {
                maskCtx.save();
                maskCtx.scale(dpr, dpr);
                maskCtx.fillStyle = "white";
                maskCtx.font = `${fontWeight} ${fontSize}px sans-serif`;
                maskCtx.textAlign = "center";
                maskCtx.textBaseline = "middle";
                maskCtx.fillText(text, width / (2 * dpr), height / (2 * dpr));
                maskCtx.restore();
            }

            for (let i = 0; i < cols; i++) {
                for (let j = 0; j < rows; j++) {
                    const x = i * (squareSize + gridGap) * dpr;
                    const y = j * (squareSize + gridGap) * dpr;
                    const squareWidth = squareSize * dpr;
                    const squareHeight = squareSize * dpr;

                    const maskData = maskCtx.getImageData(x, y, squareWidth, squareHeight).data;
                    const hasText = maskData.some((value, index) => index % 4 === 0 && value > 0);

                    const opacity = squares[i * rows + j];
                    const finalOpacity = hasText ? Math.min(1, opacity * 3 + 0.4) : opacity;

                    ctx.fillStyle = colorWithOpacity(memoizedColor, finalOpacity);
                    ctx.fillRect(x, y, squareWidth, squareHeight);
                }
            }
        },
        [memoizedColor, squareSize, gridGap, text, fontSize, fontWeight],
    );

    const setupCanvas = useCallback(
        (canvas: HTMLCanvasElement, width: number, height: number) => {
            const dpr = window.devicePixelRatio || 1;
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;
            const cols = Math.ceil(width / (squareSize + gridGap));
            const rows = Math.ceil(height / (squareSize + gridGap));

            const squares = new Float32Array(cols * rows);
            for (let i = 0; i < squares.length; i++) {
                squares[i] = Math.random() * maxOpacity;
            }

            return { cols, rows, squares, dpr };
        },
        [squareSize, gridGap, maxOpacity],
    );

    const updateSquares = useCallback(
        (squares: Float32Array, deltaTime: number) => {
            for (let i = 0; i < squares.length; i++) {
                if (Math.random() < flickerChance * deltaTime) {
                    squares[i] = Math.random() * maxOpacity;
                }
            }
        },
        [flickerChance, maxOpacity],
    );

    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let animationFrameId: number;
        let gridParams: ReturnType<typeof setupCanvas>;

        const updateCanvasSize = () => {
            const newWidth = width || container.clientWidth;
            const newHeight = height || container.clientHeight;
            setCanvasSize({ width: newWidth, height: newHeight });
            gridParams = setupCanvas(canvas, newWidth, newHeight);
        };

        updateCanvasSize();

        let lastTime = 0;
        const animate = (time: number) => {
            if (!isInView) return;
            const deltaTime = (time - lastTime) / 1000;
            lastTime = time;
            updateSquares(gridParams.squares, deltaTime);
            drawGrid(ctx, canvas.width, canvas.height, gridParams.cols, gridParams.rows, gridParams.squares, gridParams.dpr);
            animationFrameId = requestAnimationFrame(animate);
        };

        const resizeObserver = new ResizeObserver(() => updateCanvasSize());
        resizeObserver.observe(container);

        const intersectionObserver = new IntersectionObserver(([entry]) => setIsInView(entry.isIntersecting), { threshold: 0 });
        intersectionObserver.observe(canvas);

        if (isInView) {
            animationFrameId = requestAnimationFrame(animate);
        }

        return () => {
            cancelAnimationFrame(animationFrameId);
            resizeObserver.disconnect();
            intersectionObserver.disconnect();
        };
    }, [setupCanvas, updateSquares, drawGrid, width, height, isInView]);

    return (
        <div ref={containerRef} className={cn(`h-full w-full ${className}`)} {...props}>
            <canvas ref={canvasRef} className="pointer-events-none" style={{ width: canvasSize.width, height: canvasSize.height }} />
        </div>
    );
};

export function useMediaQuery(query: string) {
    const [value, setValue] = useState(false);
    useEffect(() => {
        function checkQuery() {
            const result = window.matchMedia(query);
            setValue(result.matches);
        }
        checkQuery();
        window.addEventListener("resize", checkQuery);
        const mediaQuery = window.matchMedia(query);
        mediaQuery.addEventListener("change", checkQuery);
        return () => {
            window.removeEventListener("resize", checkQuery);
            mediaQuery.removeEventListener("change", checkQuery);
        };
    }, [query]);
    return value;
}

export const siteConfig = {
    footerLinks: [
        {
            title: "Navigation",
            links: [
                { id: 1, title: "Features", url: "#features" },
                { id: 2, title: "Demo", url: "/demo" },
            ],
        },
        {
            title: "Resources",
            links: [
                { id: 3, title: "Audit Report", url: "#" },
                { id: 4, title: "Documentation", url: "#" },
                { id: 5, title: "Whitepaper", url: "#" },
            ],
        },
        {
            title: "Social",
            links: [
                { id: 6, title: "Twitter / X", url: "#" },
                { id: 7, title: "Github", url: "#" },
                { id: 8, title: "Telegram", url: "#" },
            ],
        },
    ],
};

export const FlickeringFooter = () => {
    const tablet = useMediaQuery("(max-width: 1024px)");

    return (
        <footer id="footer" className="w-full pb-0 mt-20 bg-transparent relative z-10">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between p-10 max-w-7xl mx-auto">
                <div className="flex flex-col items-start justify-start gap-y-5 max-w-xs mx-0">
                    <Link href="/">
                        <Icons.logo />
                    </Link>
                    <p className="tracking-tight text-white/50 font-medium text-sm leading-relaxed">
                        The first non-custodial AI Agent platform. Verifiable trading on 0G Network.
                    </p>
                </div>
                <div className="pt-5 md:pt-0 md:w-2/3">
                    <div className="flex flex-wrap items-start justify-start md:justify-end gap-x-12 lg:gap-x-24 gap-y-10">
                        {siteConfig.footerLinks.map((column, columnIndex) => (
                            <ul key={columnIndex} className="flex flex-col gap-y-2">
                                <li className="mb-2 text-sm font-semibold text-white">
                                    {column.title}
                                </li>
                                {column.links.map((link) => (
                                    <li
                                        key={link.id}
                                        className="group inline-flex cursor-pointer items-center justify-start gap-1 text-[14px] text-white/40 hover:text-white transition-colors"
                                    >
                                        <Link href={link.url}>{link.title}</Link>
                                        <div className="flex size-3 items-center justify-center border border-white/10 rounded translate-x-0 transform opacity-0 transition-all duration-300 ease-out group-hover:translate-x-1 group-hover:opacity-100">
                                            <ChevronRightIcon className="h-3 w-3 " />
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ))}
                    </div>
                </div>
            </div>
            <div className="py-8 text-center text-xs text-white/20 mt-12">
                &copy; 2024 Aletheia Finance. Built on 0G Network.
            </div>
        </footer>
    );
};
