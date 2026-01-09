import type { Question } from "../model/types";

export function SceneQuestion(props: {
    question: Question;
    index: number;
    total: number;
    onProceed: () => void;
}) {
    return (
        <div style={{ maxWidth: 920, margin: "0 auto" }}>
            {/* pasek protokołu */}
            <div style={{ display: "flex", justifyContent: "space-between", gap: 16, marginBottom: 12 }}>
                <div style={{ fontSize: 12, opacity: 0.78 }}>
                    PROTOKÓŁ • Punkt {props.index + 1} / {props.total}
                </div>
                <div style={{ fontSize: 12, opacity: 0.78 }}>
                    Mówi: <b>Sąd</b>
                </div>
            </div>

            {/* karta “wypowiedź sądu” */}
            <div
                style={{
                    borderRadius: 14,
                    padding: 18,
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    boxShadow: "0 18px 60px rgba(0,0,0,0.25)",
                }}
            >
                <div style={{ fontSize: 12, letterSpacing: "0.16em", opacity: 0.75, marginBottom: 10 }}>
                    SĄD
                </div>

                <h3 style={{ margin: 0, fontSize: 20 }}>
                    Pytanie do protokołu
                </h3>

                <div style={{ marginTop: 10, fontSize: 16, lineHeight: 1.55, whiteSpace: "pre-wrap", opacity: 0.92 }}>
                    {props.question.text}
                </div>

                <div
                    style={{
                        marginTop: 14,
                        borderRadius: 12,
                        padding: 12,
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.10)",
                    }}
                >
                    <div style={{ fontSize: 12, opacity: 0.72, marginBottom: 6 }}>Pouczenie:</div>
                    <div style={{ fontSize: 13, lineHeight: 1.45, opacity: 0.9 }}>
                        Proszę odpowiedzieć jasno i rzeczowo. Zalecana struktura:{" "}
                        <b>teza → uzasadnienie → przykład / konsekwencja</b>.
                    </div>
                </div>

                <div style={{ marginTop: 18, display: "flex", justifyContent: "flex-end" }}>
                    <button
                        onClick={props.onProceed}
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
                        Proszę podejść do mównicy
                    </button>
                </div>
            </div>
        </div>
    );
}
