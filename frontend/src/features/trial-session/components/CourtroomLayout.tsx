import type {ReactNode} from "react";

type JudgeMood = "neutral" | "angry" | "happy";

// 1) Wrzuć 3 obrazki do: frontend/src/assets/judge/
// - judge-neutral.png
// - judge-angry.png
// - judge-happy.png
import judgeNeutral from "../assets/judge/judge-happy.png";
import judgeAngry from "../assets/judge/judge-happy.png";
import judgeHappy from "../assets/judge/judge-happy.png";

function judgeImg(mood: JudgeMood) {
    if (mood === "happy") return judgeHappy;
    if (mood === "angry") return judgeAngry;
    return judgeNeutral;
}

export function CourtroomLayout(props: {
    judgeMood: JudgeMood;
    headerRight?: ReactNode; // np. sygnatura + progress
    chamber: ReactNode;      // środek: Twoje SceneQuestion/SceneVerdict/SceneIntro/Finish
    podium?: ReactNode;      // dół: sticky mównica (textarea + przyciski)
}) {
    return (
        <div className="rc">
            {/* GÓRA: stół sędziowski */}
            <div className="rc__bench">
                <div className="rc__benchInner">
                    <div className="rc__crest">SALA ROZPRAW • PROTOKÓŁ</div>

                    <div className="rc__benchRow">
                        <div className="rc__judgeBlock">
                            <img className="rc__judgeImg" src={judgeImg(props.judgeMood)} alt="Sędzia" />
                            <div className="rc__judgeMeta">
                                <div className="rc__judgeTitle">Sędzia przewodniczący</div>
                                <div className="rc__judgeName">SSR Jan Kowalski</div>
                            </div>
                        </div>

                        <div className="rc__headerRight">{props.headerRight}</div>
                    </div>
                </div>
            </div>

            {/* ŚRODEK: sala */}
            <div className="rc__hall">
                <div className="rc__hallInner">
                    <div className="rc__chamberCard">{props.chamber}</div>

                    {/* dekor mównicy w tle */}
                    <div className="rc__podiumDecor" aria-hidden="true">
                        <div className="rc__podiumSign">MÓWNICA</div>
                    </div>
                </div>
            </div>

            {/* DÓŁ: sticky mównica */}
            {props.podium && (
                <div className="rc__podiumBar">
                    <div className="rc__podiumBarInner">{props.podium}</div>
                </div>
            )}
        </div>
    );
}
