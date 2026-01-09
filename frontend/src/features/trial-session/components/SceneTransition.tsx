import {type ReactNode, useEffect, useState } from "react";

export function SceneTransition(props: { keyId: string; children: ReactNode }) {
    const [animate, setAnimate] = useState(false);

    useEffect(() => {
        setAnimate(false);
        const t = setTimeout(() => setAnimate(true), 10);
        return () => clearTimeout(t);
    }, [props.keyId]);

    return <div className={`scene ${animate ? "scene--in" : ""}`}>{props.children}</div>;
}
