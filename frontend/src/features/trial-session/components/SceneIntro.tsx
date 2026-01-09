export function SceneIntro(props: {
    trialId: string;
    total: number;
    onStart: () => void;
}) {
    return (
        <div style={{ maxWidth: 920, margin: "0 auto" }}>
            <div style={{ fontSize: 12, opacity: 0.78, marginBottom: 12 }}>
                POSIEDZENIE • Przygotowanie do rozprawy
            </div>

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

                <h2 style={{ margin: 0, fontSize: 22, letterSpacing: "0.02em" }}>
                    Rozprawa zostaje otwarta
                </h2>

                <div style={{ marginTop: 10, fontSize: 14, opacity: 0.86, lineHeight: 1.5 }}>
                    Sygnatura robocza: <b>{props.trialId}</b>
                    <br />
                    W toku posiedzenia Sąd zada <b>{props.total}</b> pytań. Odpowiedzi proszę formułować jasno, rzeczowo
                    i — w miarę możliwości — z uzasadnieniem.
                </div>

                <div
                    style={{
                        marginTop: 14,
                        borderRadius: 12,
                        padding: 12,
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.10)",
                        fontSize: 13,
                        opacity: 0.9,
                        lineHeight: 1.45,
                    }}
                >
                    <b>Pouczenie:</b> możesz udzielać dłuższych odpowiedzi. Warto trzymać strukturę:
                    <br />
                    <span style={{ opacity: 0.85 }}>
            teza → uzasadnienie → przykład / konsekwencja.
          </span>
                </div>

                <div style={{ marginTop: 18, display: "flex", justifyContent: "flex-end" }}>
                    <button
                        onClick={props.onStart}
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
                        Wejść na salę rozpraw
                    </button>
                </div>
            </div>
        </div>
    );
}
