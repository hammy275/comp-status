import React from "react";

export default function InputField(props) {
    /** 
     * Params:
     *  handleChange - Function to run on text change.
     *  value (optional) - Text to put in field
     *  textColor - Text color
     *  bgColor - Background color
     *  inputText - Label for text box
     *  type - Type of input ("text", "password", etc.)
     *  autocomplete (optional) - Autocomplete type
    */
    let value = "";
    if (props.value) {
        value = props.value;
    }
    let autocomplete = undefined;
    if (props.autocomplete) {
        autocomplete = props.autocomplete;
    }
    return (
        <label className="label" style={{color: props.textColor}}>
            {props.inputText}
            <input autoComplete={autocomplete} value={value} style={{backgroundColor: props.bgColor, color: props.textColor}} className="input" type={props.type} onChange={props.handleChange} />
        </label>
    )
}