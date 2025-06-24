import React from "react";

import Button from "./Button";

class Modal extends React.Component {
    /**
     * Props:
     *  elem - Element to show when opening modal
     *  buttonTextColor - Text color of button
     *  label - Label for modal button
     *  onClose (optional) - Optional function to call when closing
     */
    constructor(props) {
        super(props);
        this.state = {show: false};
        this.toggleState = this.toggleState.bind(this);
    }
    toggleState() {
        if (this.state.show) {
            if (this.props.onClose) {
                this.props.onClose();
            }
            window.onscroll = function () {};
        } else {
            window.onscroll = () => window.scrollTo(0, 0);
        }
        this.setState({show: !this.state.show})
    }
    render() {
        if (this.state.show) {
            window.scrollTo(0, 0);
            return (
            <>
                <div className="modal-background" onClick={this.toggleState} style={{height: "250vh"}}></div>
                <div className="modal-content" style={{position: "fixed", left: "2%", top:"15%", right: "15%"}}>
                    {this.props.elem}
                </div>
                <button className="modal-close is-large" onClick={this.toggleState}></button>
            </>
            );
        } else {
            return <Button textColor={this.props.buttonTextColor} handleClick={this.toggleState} value={this.props.label} buttonType="is-info"/>
        }
    }
}

export default Modal;