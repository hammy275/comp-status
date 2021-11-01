import React from "react";

import Checkbox from "./Checkbox";

export default function CheckboxLabel(props) {
    return (
        <label className="label" style={{color: props.textColor}}>
            {props.label}
            <Checkbox handleChange={props.handleChange}/>
        </label>
    );
}