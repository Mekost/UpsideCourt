import type { Verdict } from "../model/types";

export function SceneVerdict(props: {
    verdict: Verdict;
    isLast: boolean;
    onNext: () => void;
}) {
    const title = props.verdict.isCorrect ? "Sąd przyjmuje odpowiedź" : "Sąd zgłasza zastrzeżenia";

    // Możesz tu dodać “pominięte elementy” później, jeśli backend/LLM je zwróci.
    return (
        <div style={{ maxWidth: 920, margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 16, marginBottom: 12 }}>
                <div style={{ fontSize: 12, opacity: 0.78 }}>
                    POSTANOWIENIE • Informacja zwrotna
                </div>
                <div style={{ fontSize: 12, opacity: 0.78 }}>
                    Ogłasza: <b>Sąd</b>
                </div>
            </div>

            <div
                style={{
                    borderRadius: 14,
                    padding: 18,
                    background: props.verdict.isCorrect ? "rgba(130,255,170,0.08)" : "rgba(255,120,120,0.08)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    boxShadow: "0 18px 60px rgba(0,0,0,0.25)",
                }}
            >
                <div style={{ fontSize: 12, letterSpacing: "0.16em", opacity: 0.78, marginBottom: 10 }}>
                    SĄD
                </div>

                <h3 style={{ margin: 0, fontSize: 20 }}>
                    {title}
                </h3>

                <div
                    style={{
                        marginTop: 10,
                        borderRadius: 12,
                        padding: 12,
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.10)",
                    }}
                >
                    <div style={{ fontSize: 12, opacity: 0.72, marginBottom: 6 }}>Uzasadnienie:</div>
                    <div style={{ fontSize: 15, lineHeight: 1.5, whiteSpace: "pre-wrap", opacity: 0.92 }}>
                        {props.verdict.comment}
                    </div>
                </div>

                <div style={{ marginTop: 14, fontSize: 13, opacity: 0.85, lineHeight: 1.45 }}>
                    {props.verdict.isCorrect ? (
                        <>Proszę kontynuować. Sąd przechodzi do kolejnego pytania.</>
                    ) : (
                        <>Proszę doprecyzować i kontynuować. Sąd przechodzi do kolejnego pytania.</>
                    )}
                </div>

                <div style={{ marginTop: 18, display: "flex", justifyContent: "flex-end" }}>
                    <button
                        onClick={props.onNext}
                        style={{
                            padding: "10px 14px",
                            borderRadius: 12,
                            border: "1px solid rgba(255,255,255,0.14)",
                            background: "rgba(255,255,255,0.10)",
                            color: "rgba(255,255,255,0.92)",
                            cursor: "pointer",
                            minWidth: 220,
                        }}
                    >
                        {props.isLast ? "Zamknąć posiedzenie" : "Proszę kontynuować"}
                    </button>
                </div>
            </div>
        </div>
    );
}
