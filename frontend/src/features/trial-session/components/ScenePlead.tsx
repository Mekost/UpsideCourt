import type { Question } from "../model/types";

export function ScenePlead(props: {
    question: Question;
    value: string;
    onChange: (v: string) => void;
    onSubmit: () => void;
}) {
    const words = props.value.trim() ? props.value.trim().split(/\s+/).length : 0;

    return (
        <div style={{ maxWidth: 920, margin: "0 auto" }}>
            {/* pasek protokołu */}
            <div style={{ display: "flex", justifyContent: "space-between", gap: 16, marginBottom: 12 }}>
                <div style={{ fontSize: 12, opacity: 0.78 }}>MÓWNICA • Oświadczenie strony</div>
                <div style={{ fontSize: 12, opacity: 0.78 }}>
                    Objętość: <b>{words}</b> słów • <span style={{ opacity: 0.75 }}>Cmd/Ctrl+Enter = zatwierdź</span>
                </div>
            </div>

            {/* “mównica” */}
            <div
                style={{
                    borderRadius: 14,
                    padding: 18,
                    background: "rgba(70,55,38,0.18)", // lekko “drewniana” nuta
                    border: "1px solid rgba(255,255,255,0.12)",
                    boxShadow: "0 18px 60px rgba(0,0,0,0.25)",
                }}
            >
                <div style={{ fontSize: 12, letterSpacing: "0.16em", opacity: 0.78, marginBottom: 10 }}>
                    OŚWIADCZENIE DO PROTOKOŁU
                </div>

                {/* przypomnienie pytania “na kartce” */}
                <div
                    style={{
                        borderRadius: 12,
                        padding: 12,
                        background: "rgba(255,255,255,0.06)",
                        border: "1px solid rgba(255,255,255,0.10)",
                        marginBottom: 12,
                    }}
                >
                    <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 6 }}>Pytanie Sądu:</div>
                    <div style={{ fontSize: 14, lineHeight: 1.5, opacity: 0.92, whiteSpace: "pre-wrap" }}>
                        {props.question.text}
                    </div>
                </div>

                <textarea
                    value={props.value}
                    onChange={(e) => props.onChange(e.target.value)}
                    rows={9}
                    placeholder="Wysoki Sądzie, w odpowiedzi oświadczam, że…"
                    style={{
                        width: "100%",
                        borderRadius: 12,
                        padding: 12,
                        background: "rgba(255,255,255,0.07)",
                        border: "1px solid rgba(255,255,255,0.14)",
                        color: "rgba(255,255,255,0.92)",
                        outline: "none",
                        resize: "vertical",
                        lineHeight: 1.5,
                    }}
                    onKeyDown={(e) => {
                        if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                            props.onSubmit();
                        }
                    }}
                />

                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginTop: 12 }}>
                    <div style={{ fontSize: 12, opacity: 0.75, lineHeight: 1.4 }}>
                        Wskazówka: teza → uzasadnienie → przykład. Unikaj odpowiedzi jednowyrazowych.
                    </div>

                    <button
                        onClick={props.onSubmit}
                        disabled={props.value.trim().length < 10}
                        style={{
                            padding: "10px 14px",
                            borderRadius: 12,
                            border: "1px solid rgba(255,255,255,0.14)",
                            background: "rgba(255,255,255,0.10)",
                            color: "rgba(255,255,255,0.92)",
                            cursor: props.value.trim().length < 10 ? "not-allowed" : "pointer",
                            opacity: props.value.trim().length < 10 ? 0.55 : 1,
                            minWidth: 180,
                        }}
                    >
                        Złóż oświadczenie
                    </button>
                </div>
            </div>
        </div>
    );
}
