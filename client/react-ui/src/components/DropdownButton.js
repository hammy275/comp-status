import React from "react";

import Button from "./Button";
import Dropdown from "./Dropdown";

class DropdownButton extends React.Component {
    /**
     * Props:
     *  items - List of items for dropdown
     *  textColor - Text color
     *  bgColor - Background color
     *  buttonTextColor - Color for button text
     *  handleClick - Function to call when button is clicked. Must accept a string, which is the item in the dropdown.
     *  buttonLabel - Label for button next to dropdown
     */
    constructor(props) {
        super(props);
        this.state = {value: ""}
    }
    render() {
        let elems = [];
        elems.push(<Dropdown handleChange={(event) => this.setState({value: event.target.value})} items={this.props.items} textColor={this.props.textColor} bgColor={this.props.bgColor}/>)
        elems.push(<Button textColor={this.props.buttonTextColor} handleClick={() => this.props.handleClick(this.state.value)} value={this.props.buttonLabel} buttonType="is-danger"/>)
        return(elems);
    }
}

export default DropdownButton;