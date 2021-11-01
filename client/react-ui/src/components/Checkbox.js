import React from "react";

export default function Checkbox(props) {
    return (
        <input type="checkbox" onChange={(event) => props.handleChange(event.target.checked)}/>
    );
}