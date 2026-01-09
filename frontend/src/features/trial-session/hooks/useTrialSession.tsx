import { useEffect, useMemo, useReducer, useState } from "react";
import { createInitialState, reducer } from "../model/reducer";
import { generateQuestions, validateAnswer } from "../api/trailSessionApi.tsx";
import type { Verdict } from "../model/types";

export function useTrialSession(trialId: string) {
    const [loadingQuestions, setLoadingQuestions] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [state, dispatch] = useReducer(reducer, createInitialState(trialId, []));

    // 1) Generuj pytania na start
    useEffect(() => {
        let alive = true;

        (async () => {
            try {
                setLoadingQuestions(true);
                setError(null);
                const qs = await generateQuestions(trialId);
                if (!alive) return;
                dispatch({ type: "INIT_QUESTIONS", questions: qs });
            } catch (e: any) {
                if (!alive) return;
                setError(e?.message ?? "Nie udało się wygenerować pytań");
            } finally {
                if (alive) setLoadingQuestions(false);
            }
        })();

        return () => {
            alive = false;
        };
    }, [trialId]);

    const currentQuestion = useMemo(
        () => state.questions[state.index],
        [state.questions, state.index]
    );

    // 2) Waliduj odpowiedź
    const submitToBackend = async (): Promise<Verdict> => {
        if (!currentQuestion) throw new Error("Brak aktualnego pytania");
        setSubmitting(true);
        setError(null);
        try {
            return await validateAnswer({
                trialId,
                questionId: currentQuestion.id,
                questionText: currentQuestion.text, // jeśli niepotrzebne, usuń z API
                answer: state.answerDraft,
            });
        } finally {
            setSubmitting(false);
        }
    };

    return { state, dispatch, currentQuestion, loadingQuestions, submitting, error, submitToBackend };
}
