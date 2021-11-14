import React from "react";
import Button from "../components/Button";
import InputField from "../components/InputField";
import Text from "../components/Text";

import Title from "../components/Title";

class FirstTimeSetup extends React.Component {
    /**
     * Props:
     *  textColor: Text color
     *  buttonTextColor: Text color of buttons
     *  backgroundColor: Background color
     *  ip: IP address of endpoint
     *  postWithAuth: postWithAuth function
     */
    
    constructor(props) {
        super(props);
        this.state = {
            page: 0, responseStatus: null,
            new_username: "", new_password: "", port: 5000, domain: null
        };

        this.getPage0 = this.getPage0.bind(this);
        this.getPage1 = this.getPage1.bind(this);
        this.getPage2 = this.getPage2.bind(this);
        this.getPage3 = this.getPage3.bind(this);
        this.getPage4 = this.getPage4.bind(this);
        this.getNextButton = this.getNextButton.bind(this);
        this.getPrevButton = this.getPrevButton.bind(this);
        this.canGoToNextPage = this.canGoToNextPage.bind(this);
        this.goToNextPage = this.goToNextPage.bind(this);

        this.pages = [this.getPage0, this.getPage1, this.getPage2, this.getPage3, this.getPage4];

    }

    canGoToNextPage(state) {
        if (state.page === 1) {
            return state.new_username !== "" && state.new_password !== "";
        } else if (state.page === 2) {
            return state.port > 0 && state.port < 65536;
        }

        return true;
    }

    async submitData(state) {
        const data = {
            new_username: state.new_username,
            new_password: state.new_password,
            port: state.port,
            domain: state.domain
        };
        const res = await this.props.postWithAuth(this.props.ip + "/api/fts", data);
        this.setState({page: 4, responseStatus: res !== null && res.message.includes("completed")});
    }

    goToNextPage() {
        this.setState((state) => {
            if (this.canGoToNextPage(state)) {
                if (state.page + 1 === 4) {
                    this.submitData(state);
                }
                return {page: state.page + 1}
            }
        });
    }

    getNextButton() {
        if (this.state.page < 4) {
            return <Button buttonType="is-info" value="Next" textColor={this.props.buttonTextColor} 
            handleClick={this.goToNextPage}/>
        }
    }

    getPrevButton() {
        if (this.state.page > 0 && this.state.page < 4) {
            return <Button buttonType="is-info" value="Previous" textColor={this.props.buttonTextColor} 
            handleClick={() => this.setState((state) => {return {page: state.page - 1}})}/>
        }  
    }

    getPage0() {
        return (
            <Text textColor={this.props.textColor} text={`
                Welcome to First Time Setup!
                This short wizard will guide you through setting up the server for regular usage!
                Please click the next button below to continue.`}/>
        );
    }

    getPage1() {
        return (
            <>
                <Text textColor={this.props.textColor} text={`
                    Please enter a username and password below. This username and password will act as an
                    "admin" account, which has permissions to add/remove users, manage login tokens, and
                    access computer data.`}/>

                <InputField value={this.state.new_username} bgColor={this.props.backgroundColor} 
                textColor={this.props.textColor} handleChange={(event) => this.setState({new_username: event.target.value})} 
                inputText="Username: " type="text"/>
                <InputField value={this.state.new_password} bgColor={this.props.backgroundColor} 
                textColor={this.props.textColor} handleChange={(event) => this.setState({new_password: event.target.value})} 
                inputText="Password: " type="password"/>
            </>
        );
    }

    getPage2() {
        return (
            <>
                <Text textColor={this.props.textColor} text={`
                    Please enter the port number you would like the server to be hosted on.
                    This number must be less than 65,536.`}/>
                <InputField value={this.state.port} bgColor={this.props.backgroundColor} 
                textColor={this.props.textColor} handleChange={(event) => this.setState({port: event.target.value})} 
                inputText="Port: " type="number"/>
            </>
        );
    }

    getPage3() {
        return (
            <>
                <Text textColor={this.props.textColor} text={`
                    (Optional) Please enter the domain name for your letsencrypt certificate.
                    If not using a letsencrypt SSL certificate, feel free to ignore this step.`}/>
                <Text textColor={this.props.textColor} text={`
                    (WARNING) Once you click next, first time setup data will be submitted to the
                    server!`}/>
                <InputField value={this.state.domain} bgColor={this.props.backgroundColor} 
                textColor={this.props.textColor} handleChange={(event) => 
                    this.setState({domain: event.target.value === "" ? null : event.target.value})} 
                inputText="Domain: " type="text"/>
            </>
        );
    }

    getPage4() {
        if (this.state.responseStatus === null) {
            return (
                <Text textColor={this.props.textColor} text={`
                    Submitting first time setup data to the server! Do not refresh the page...`}/>
            );
        } else if (!this.state.responseStatus) {
            return (
                <Text textColor={this.props.textColor} text={`
                Failed to complete first time setup! Please refresh this page and try again,
                or check the server log for more information.`}/>
            );
        } else {
            return (
                <>
                    <Text textColor={this.props.textColor} text={`
                    Successfully completed first time setup! It's recommended (but not required)
                    to restart the server.`}/>
                    <Text textColor={this.props.textColor} text={`
                    If you are not using port 5000, you must restart the server
                    to use the new port!`}/>
                    <Text textColor={this.props.textColor} text={`
                    If you specified a domain to use a letsencrypt certificate, you must
                    restart the server to use the certificate!`}/>
                    <Text textColor={this.props.textColor} text={`
                    Please logout and use the new user you created to log in. The account
                    used for first time setup can only be used for first time setup!`}/>
                </>
            );
        }
    }
    

    render() {
        return (
            <>
                <Title textColor={this.props.textColor} title="First Time Setup"/>
                <br/><br/>
                <div className="columns">
                    <div className="column is-one-third">
                        {this.pages[this.state.page]()}
                        {this.getPrevButton()}    {this.getNextButton()}
                    </div>
                </div>
            </>
        );
    }
}

export default FirstTimeSetup;