import { useEffect, useMemo, useState } from "react";

export function useTypewriter(text: string, opts?: { cps?: number; enabled?: boolean }) {
    const cps = opts?.cps ?? 45; // chars per second
    const enabled = opts?.enabled ?? true;

    const [i, setI] = useState(0);

    const safeText = useMemo(() => text ?? "", [text]);

    useEffect(() => {
        setI(0);
    }, [safeText]);

    useEffect(() => {
        if (!enabled) return;
        if (i >= safeText.length) return;

        const delay = Math.max(10, Math.floor(1000 / cps));
        const t = setTimeout(() => setI((x) => Math.min(safeText.length, x + 1)), delay);
        return () => clearTimeout(t);
    }, [i, safeText, cps, enabled]);

    const done = i >= safeText.length;
    return { shown: enabled ? safeText.slice(0, i) : safeText, done };
}
