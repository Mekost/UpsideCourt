type JudgeMood = "neutral" | "angry" | "happy";

import judgeNeutral from "../assets/judge/judge-happy.png";
import judgeAngry from "../assets/judge/judge-happy.png";
import judgeHappy from "../assets/judge/judge-happy.png";

function getJudgeImage(mood: JudgeMood) {
    if (mood === "happy") return judgeHappy;
    if (mood === "angry") return judgeAngry;
    return judgeNeutral;
}

export function CourtBanner(props: {
    judgeMood: JudgeMood;
    caseNo: string;
    progress: string;
}) {
    return (
        <div className="court-banner">
            <div  className="court-banner__left">
                <img style={{width:"500px"}} src={getJudgeImage(props.judgeMood)} alt="Sędzia" />
                <div>
                    <div className="court-banner__title">Sędzia przewodniczący</div>
                    <div className="court-banner__name">SSR Jan Kowalski</div>
                </div>
            </div>
        </div>
    );
}
