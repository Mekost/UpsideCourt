export type Phase = "INTRO" | "QUESTION" | "PLEAD" | "VERDICT" | "FINISH";

export type Speaker = "JUDGE" | "PROSECUTOR" | "DEFENDER";

export interface Question {
    id: string;
    speaker: Speaker;
    text: string;
}

export interface Verdict {
    isCorrect: boolean;
    comment: string;
}

export interface TranscriptEntry {
    questionId: string;
    questionText: string;
    answer: string;
    verdict: Verdict;
}

export interface TrialSessionState {
    phase: Phase;
    trialId: string;
    index: number; // current question index
    questions: Question[];
    answerDraft: string;
    lastVerdict?: Verdict;
    transcript: TranscriptEntry[];
}
