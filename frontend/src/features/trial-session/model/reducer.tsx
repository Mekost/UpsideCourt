import type {Question, TrialSessionState, Verdict} from "./types";
import { mockEvaluateAnswer } from "../api/mock";

type Action =
    | { type: "START" }
    | { type: "GO_PLEAD" }
    | { type: "SET_ANSWER"; value: string }
    | { type: "SUBMIT" }
    | { type: "NEXT" }
    | { type: "INIT_QUESTIONS"; questions: Question[] }
    | { type: "SET_VERDICT"; verdict: Verdict };


export function createInitialState(trialId: string, questions: TrialSessionState["questions"]): TrialSessionState {
    return {
        phase: "INTRO",
        trialId,
        index: 0,
        questions,
        answerDraft: "",
        transcript: [],
    };
}

export function reducer(state: TrialSessionState, action: Action): TrialSessionState {
    switch (action.type) {
        case "START":
            return { ...state, phase: "QUESTION" };

        case "GO_PLEAD":
            return { ...state, phase: "PLEAD" };

        case "SET_ANSWER":
            return { ...state, answerDraft: action.value };

        case "SUBMIT": {
            const q = state.questions[state.index];
            const verdict: Verdict = mockEvaluateAnswer(state.answerDraft);

            return {
                ...state,
                phase: "VERDICT",
                lastVerdict: verdict,
                transcript: [
                    ...state.transcript,
                    { questionId: q.id, questionText: q.text, answer: state.answerDraft, verdict },
                ],
            };
        }

        case "NEXT": {
            const nextIndex = state.index + 1;
            const finished = nextIndex >= state.questions.length;
            return {
                ...state,
                index: nextIndex,
                phase: finished ? "FINISH" : "QUESTION",
                answerDraft: "",
                lastVerdict: undefined,
            };
        }
        case "INIT_QUESTIONS":
            return {
                ...state,
                questions: action.questions,
                index: 0,
                phase: "INTRO",     // albo "QUESTION" jak wolisz start od razu
                answerDraft: "",
                lastVerdict: undefined,
                transcript: [],
            };
        case "SET_VERDICT": {
            const q = state.questions[state.index];
            const verdict = action.verdict;

            return {
                ...state,
                phase: "VERDICT",
                lastVerdict: verdict,
                transcript: [
                    ...state.transcript,
                    { questionId: q.id, questionText: q.text, answer: state.answerDraft, verdict },
                ],
            };
        }



        default:
            return state;
    }
}
