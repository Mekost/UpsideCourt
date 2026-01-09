import type { Question, Verdict } from "../model/types";

const BASE = import.meta.env.VITE_API_BASE_URL ?? ""; // albo zostaw "" i użyj proxy

async function postJSON<T>(path: string, body: unknown): Promise<T> {
    const res = await fetch(`${BASE}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });

    if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`HTTP ${res.status}: ${text}`);
    }

    return res.json() as Promise<T>;
}

// Zakładam, że backend generuje pytania na podstawie trialId lub jakiegoś payloadu.
// Jeśli macie inne pola — podmień tylko body.
export async function generateQuestion(trialId: string): Promise<Question> {
    const data = await postJSON<Question>("/generate-question", { trialId });
    return data;
}

export async function validateAnswer(args: {
    trialId: string;
    questionId: string;
    questionText?: string; // jeśli backend tego potrzebuje
    answer: string;
}): Promise<Verdict> {
    const data = await postJSON<{ verdict: Verdict }>("/validate-answers", args);
    return data.verdict;
}
