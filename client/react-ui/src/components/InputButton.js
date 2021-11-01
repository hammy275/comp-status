import React from "react";

import Button from "./Button";
import InputField from "./InputField";

class InputButton extends React.Component {
    /**
     * Props:
     *  textColor - Text color
     *  bgColor - Background color
     *  buttonTextColor - Color for button text
     *  label - Label for text box
     *  buttonLabel - Label for button
     *  handleClick - Function to handle button click. Must accept a string, which contains the value in the textbox
     *  type - Text type
     */
    constructor(props) {
        super(props);
        this.state = {value: ""};
    }
    render() {
        return (
            <>
                <InputField value={this.state["value"]} textColor={this.props.textColor} bgColor={this.props.bgColor} inputText={this.props.label} type={this.props.type} handleChange={(event) => this.setState({value: event.target.value})}/>
                <Button textColor={this.props.buttonTextColor} handleClick={() => this.props.handleClick(this.state["value"])} value={this.props.buttonLabel} buttonType="is-success"/>
            </>
        );
    }
}

export default InputButton;