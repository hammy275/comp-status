import React from "react";

export default function Dropdown(props) {
    let items = props.items;
    return (
        <span className="select">
            <select onChange={props.handleChange} className="select">
            {items.map((item) =>
            <option key={item}>{item}</option>
            )}
            </select>
        </span>
    );
}