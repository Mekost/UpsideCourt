const BASE = import.meta.env.VITE_API_BASE_URL ?? "";

export async function http<T>(path: string, init?: RequestInit): Promise<T> {
    const res = await fetch(`${BASE}${path}`, {
        ...init,
        headers: {
            "Content-Type": "application/json",
            ...(init?.headers ?? {}),
        },
    });

    if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`HTTP ${res.status} ${res.statusText}: ${text}`);
    }

    // jeśli backend czasem zwraca пустy body
    const ct = res.headers.get("content-type") || "";
    if (!ct.includes("application/json")) {
        return undefined as T;
    }

    return res.json() as Promise<T>;
}
