import React from "react";

import Button from "./Button";
import SmallHero from "./SmallHero";

class SettingManager extends React.Component {
    /**
     * Props:
     *  showManager - Whether or not to show
     *  hasPermission - Whether or not user has permission for this setting
     *  textColor - Color for text
     *  bgColor - Background color
     *  buttonTextColor - Color for button text
     *  elemType - String of the type of thing being managed; "Token", "User", etc.
     *  refreshFunction - Function used to refresh lists 
     *  elems - Elements to have inside the manager
     *  label (optional) - Label for settings manager
     *  showLabel - Label for button to show/hide the manager.
     */
    constructor(props) {
        super(props);
        this.state = {show: false, firstRefresh: false};
    }
    render() {
        if (!this.props.hasPermission) {
            return <SmallHero isVisible="true" heroType="is-danger" textColor={this.props.textColor} text="Your user account does not have permission to adjust this setting!"/>
        } else {
            if (!this.state.firstRefresh) {
                this.props.refreshFunction();
                this.setState({firstRefresh: true});
            }
            let elems = [];
            if (this.props.label) {
                elems.push(<label className="label" style={{color: this.props.textColor}}>{this.props.label}</label>);
            }
            elems.push(<Button textColor={this.props.buttonTextColor} handleClick={this.props.refreshFunction} value={"Refresh " + this.props.elemType + " List"} buttonType="is-success"/>);
            elems.push(<br/>);
            let all_elems = elems.concat(this.props.elems);
           return (all_elems);
        }
    }
}

export default SettingManager;