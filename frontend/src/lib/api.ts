const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

export interface UserStats {
    credits: number;
    strategies_count: number;
}

export interface Strategy {
    strategy_id: string;
    owner_address: string;
    logic_nlp: string;
    status: string;
    deployment_tx: string;
    created_at: string;
}

export interface WatcherAlert {
    id: string;
    type: string;
    title: string;
    summary: string;
    source: string;
    timestamp: string;
    severity: string;
}

export async function fetchUserStats(address: string): Promise<UserStats> {
    try {
        const res = await fetch(`${API_BASE}/user/stats?address=${address}`);
        if (!res.ok) throw new Error("Failed to fetch user stats");
        return res.json();
    } catch {
        return { credits: 0, strategies_count: 0 };
    }
}

export async function fetchUserStrategies(address: string): Promise<Strategy[]> {
    try {
        const res = await fetch(`${API_BASE}/user/strategies?address=${address}`);
        if (!res.ok) throw new Error("Failed to fetch strategies");
        return res.json();
    } catch {
        return [];
    }
}

export async function fetchWatcherAlerts(): Promise<WatcherAlert[]> {
    try {
        const res = await fetch(`${API_BASE}/watcher/alerts`);
        if (!res.ok) throw new Error("Failed to fetch watcher alerts");
        return res.json();
    } catch {
        return [];
    }
}

export interface TradeResult {
    strategy_id: string;
    decision: string;
    signature: string;
    attestation: string;
    vault_action: string;
    tx_receipt: string;
}

export async function executeTradeTrigger(strategyId: string): Promise<TradeResult | null> {
    try {
        const res = await fetch(`${API_BASE}/watcher/execute?id=${strategyId}`, {
            method: "POST"
        });
        if (!res.ok) throw new Error("Trade execution failed");
        return res.json();
    } catch {
        return null;
    }
}
