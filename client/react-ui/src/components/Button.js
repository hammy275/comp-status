import React from "react";

export default function Button(props) {
    return (
        <button style={{color: props.textColor}}
        onClick={props.handleClick}
        className={"button " + props.buttonType}>{props.value}</button>
    );
}