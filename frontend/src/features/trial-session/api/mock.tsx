import type {Question, Verdict} from "../model/types";

export const mockQuestions: Question[] = Array.from({ length: 10 }).map((_, i) => ({
    id: `q${i + 1}`,
    speaker: "JUDGE",
    text: `Pytanie ${i + 1}: Wyjaśnij pojęcie X oraz podaj przykład zastosowania.`,
}));

export function mockEvaluateAnswer(answer: string): Verdict {
    // prosta reguła na MVP: "dłuższa odpowiedź = lepiej"
    const ok = answer.trim().split(/\s+/).length >= 20;
    return ok
        ? { isCorrect: true, comment: "Sąd uznaje argumentację za spójną i wystarczająco uzasadnioną." }
        : { isCorrect: false, comment: "Odpowiedź zbyt ogólna — brakuje definicji i przykładu." };
}
