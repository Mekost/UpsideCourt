import { Routes, Route, Link } from "react-router-dom";
import { TrialSessionPage } from "./features/trial-session/pages/TrialSessionPage";

function DevHome() {
    const ids = ["demo", "osfp", "java", "ai-agent"];

    return (
        <div style={{ padding: 24 }}>
            <h1>Dev Home</h1>
            <p>Wybierz rozprawę testową:</p>

            <ul>
                {ids.map((id) => (
                    <li key={id}>
                        <Link to={`/trials/${id}`}>/trials/{id}</Link>
                    </li>
                ))}
            </ul>

            <p style={{ opacity: 0.7, marginTop: 16 }}>
                Tip: możesz też wejść ręcznie na /trials/cokolwiek
            </p>
        </div>
    );
}

export default function App() {
    return (
        <Routes>
            {/* dev-only home */}
            {import.meta.env.DEV && <Route path="/" element={<DevHome />} />}

            {/* w prod pod / będzie menu */}
            {!import.meta.env.DEV && <Route path="/" element={<div>Menu spraw </div>} />}

            <Route path="/trials/:trialId" element={<TrialSessionPage />} />
            <Route path="*" element={<div>404</div>} />
        </Routes>
    );
}
