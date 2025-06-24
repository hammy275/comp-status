import React from "react";

export default function SmallHero(props) {
    if (!props.isVisible) {
        return null;
    }
    return (
        <section className={"hero is-small " + props.heroType}>
            <div className="hero-body">
                <p className="title" style={{color: props.textColor}}>
                    {props.text}
                </p>
            </div>
        </section>
    );
}