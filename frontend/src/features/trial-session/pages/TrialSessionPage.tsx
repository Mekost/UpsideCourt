import { useParams } from "react-router-dom";
import { useTrialSession } from "../hooks/useTrialSession";

import { SceneIntro } from "../components/SceneIntro";
import { SceneQuestion } from "../components/SceneQuestion";
import { ScenePlead } from "../components/ScenePlead";
import { SceneVerdict } from "../components/SceneVerdict";

import "../css/courtroom.css";
import {CourtBanner} from "../components/CourtBanner.tsx";


export function TrialSessionPage() {
    const { trialId } = useParams();
    if (!trialId) return <div>Brak trialId w URL</div>;

    const { state, currentQuestion, dispatch } = useTrialSession(trialId);

    return (
        <>
            <center>
            <div style={{width:"100vh"}}>
                <CourtBanner judgeMood={"happy"} caseNo={"2"} progress={"2"}></CourtBanner>
            </div>
            </center>
            {/* ===== TWOJE ISTNIEJĄCE FLOW (BEZ ZMIAN) ===== */}
            <div style={{ minHeight: "100vh", padding: 24 }}>
                {state.phase === "INTRO" && (
                    <SceneIntro
                        onStart={() => dispatch({ type: "START" })}
                        trialId={trialId}
                        total={state.questions.length}
                    />
                )}

                {state.phase === "QUESTION" && (
                    <SceneQuestion
                        question={currentQuestion}
                        index={state.index}
                        total={state.questions.length}
                        onProceed={() => dispatch({ type: "GO_PLEAD" })}
                    />
                )}

                {state.phase === "PLEAD" && (
                    <ScenePlead
                        question={currentQuestion}
                        value={state.answerDraft}
                        onChange={(v) => dispatch({ type: "SET_ANSWER", value: v })}
                        onSubmit={() => dispatch({ type: "SUBMIT" })}
                    />
                )}

                {state.phase === "VERDICT" && state.lastVerdict && (
                    <SceneVerdict
                        verdict={state.lastVerdict}
                        onNext={() => dispatch({ type: "NEXT" })}
                        isLast={state.index >= state.questions.length - 1}
                    />
                )}

                {state.phase === "FINISH" && (
                    <div>
                        <h2>Koniec rozprawy</h2>
                        <p>Ukończono: {state.transcript.length}/{state.questions.length}</p>
                    </div>
                )}
            </div>
        </>
    );
}

