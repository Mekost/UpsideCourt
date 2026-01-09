import { useEffect, useMemo, useReducer, useState } from "react";
import { createInitialState, reducer } from "../model/reducer";
import { generateQuestion, validateAnswer } from "../api/trailSessionApi.tsx";
import type { Verdict } from "../model/types";

export function useTrialSession(trialId: string) {
    const [loadingQuestions, setLoadingQuestions] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [state, dispatch] = useReducer(reducer, createInitialState(trialId, []));

    const TARGET_COUNT = 10;

    useEffect(() => {
        let alive = true;

        (async () => {
            try {
                setLoadingQuestions(true);
                setError(null);

                const questions = [];
                for (let i = 0; i < TARGET_COUNT; i++) {
                    const q = await generateQuestion(trialId);
                    questions.push(q);
                }

                if (!alive) return;
                dispatch({ type: "INIT_QUESTIONS", questions });
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
