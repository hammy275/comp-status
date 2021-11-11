import React from "react";

export default function Checkbox(props) {
    const checked = props.checked === true;
    return (
        <input checked={checked} type="checkbox" onChange={(event) => props.handleChange(event.target.checked)}/>
    );
}