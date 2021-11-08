import React from "react";

import Button from "../components/Button";
import DropdownButton from "../components/DropdownButton";

class TokenManager extends React.Component {
    /**
     * Props:
     *  buttonTextColor: Text color for button
     *  textColor: Text color
     *  backgroundColor: Background color for dropdown
     *  removeFromArray: Function to remove items from an array
     *  removeFromArrayPartialMatch: Function for array removal
     *  postWithAuth: Function to post with authentication
     *  ip: IP address
     *  
     * 
     */

    constructor(props) {
        super(props);
        this.state = {permaTokens: [], selectedPermaToken: null, selectedTempToken: null, tempTokens: []};

        this.refreshTokens = this.refreshTokens.bind(this);
        this.deletePermaToken = this.deletePermaToken.bind(this);
        this.deleteTempToken = this.deleteTempToken.bind(this);
        this.afterTokenDelete = this.afterTokenDelete.bind(this);
    }

    componentDidMount() {
        this.refreshTokens();
    }

    async refreshTokens() {
        const returned = await this.props.postWithAuth("https://" + this.props.ip + "/get_tokens", {});
        if (returned === null) return;
        let permaTokensList = [];
        let tempTokensList = [];
        // eslint-disable-next-line
        for (const [key, value] of Object.entries(returned["perma_tokens"])) {
            for (let i = 0; i < value.length; i++) {
                permaTokensList = permaTokensList.concat(key + ": " + value[i]);
            }
        }
        // eslint-disable-next-line
        for (const [key, value] of Object.entries(returned["temp_tokens"])) {
            tempTokensList = tempTokensList.concat(value["user"] + ": " + key);
        }
        this.setState({permaTokens: permaTokensList, tempTokens: tempTokensList});
    }

    afterTokenDelete(returned) {
        console.log(returned);
        if (returned === null) return;
        let heroType = "is-success";
        if (returned["message"] !== "Perma-token deleted successfully!" && returned["message"] !== "Temp-token deleted successfully!") {
            heroType = "is-danger";
        } else {
            if (returned["message"] === "Perma-token deleted successfully!") {
                this.setState({permaTokens: this.props.removeFromArrayPartialMatch(this.state.permaTokens, this.state.selectedPermaToken)});
            } else {
                this.setState({tempTokens: this.props.removeFromArray(this.state.tempTokens, this.state.selectedTempToken)});
            }
        }
        this.setState({statusInfo: returned["message"], statusHeroType: heroType});
    }

    async deleteTempToken(token) {
        this.setState({selectedTempToken: token});
        const resp = await this.props.postWithAuth("https://" + this.props.ip + "/delete_token", {"type": "temp", "token_to_delete": token.split(": ")[1]});
        this.afterTokenDelete(resp);
    }

    async deletePermaToken(token) {
        this.setState({selectedPermaToken: token});
        const resp = await this.props.postWithAuth("https://" + this.props.ip + "/delete_token", {"type": "perma", "token_to_delete": token.split(": ")[1]});
        this.afterTokenDelete(resp);
    }

    render() {
        let tempTokens = ["Select a temporary token..."];
        let permaTokens = ["Select a permanent token..."];

        tempTokens = tempTokens.concat(this.state.tempTokens);
        permaTokens = permaTokens.concat(this.state.permaTokens);
        return (
            <>
                <Button textColor={this.props.buttonTextColor} 
                handleClick={this.refreshTokens} value={"Refresh Token List"} buttonType="is-success"/>
                <br/>
                <DropdownButton 
                    items={tempTokens} textColor={this.props.textColor} bgColor={this.props.backgroundColor} buttonTextColor={this.props.buttonTextColor}
                    handleClick={this.deleteTempToken} buttonLabel="Delete Selected Temporary Token"
                />
                <DropdownButton 
                    items={permaTokens} textColor={this.props.textColor} bgColor={this.props.backgroundColor} buttonTextColor={this.props.buttonTextColor}
                    handleClick={this.deletePermaToken} buttonLabel="Delete Selected Permanent Token"
                />
            </>
        );
    }

}

export default TokenManager;