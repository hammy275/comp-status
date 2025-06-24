import React from "react";

import Dropdown from "../components/Dropdown";
import SmallHero from "../components/SmallHero";
import Title from "../components/Title";

class ComputerInfo extends React.Component {
    /**
     * Props:
     *  removeFromArray: Function that removes items from an array
     *  removeFromArrayPartialMatch: Function that removes items from an array with a partial match
     *  postWithAuth: Post with authentication function
     * 
     *  ip: IP address
     *  isDark: If in dark theme
     *  textColor: Text Color
     *  buttonTextColor: Button text color
     *  backgroundColor: Background color
     */

    constructor(props) {
        super(props);

        this.getData = this.getData.bind(this);

        this.state = {computerData: {}, selectedComputer: null, interval: null};
    }

    componentDidMount() {
        const interval = setInterval(this.getData, 3000);
        this.setState({interval: interval});
        this.getData();
    }

    componentWillUnmount() {
        if (this.state.interval !== null) {
            clearInterval(this.state.interval);
        }
    }

    async getData() {
        const data = await this.props.postWithAuth(this.props.ip + "/api/data/get", {});
        if (data === null) {
            this.setState({haveGoodData: false});
            return;
        }
        this.setState({computerData: data.data, haveGoodData: true});
    }


    render() {
        let showStatuses = false;
        let computers = ["Select a computer..."];
        let ramInfo = "";
        let cpuInfo = "";
        let cpuTemps = "";
        let cpuUsages = "";
        let turboInfo = "";
        let pcInfo = "";
        let pcHeroType = "is-success";
        let ramHeroType = "is-success";
        let cpuHeroType = "is-success";
        let cpuTempHeroType = "is-success";
        let cpuUsageHeroType = "is-success";
        if (this.state.haveGoodData) {
            computers = computers.concat(Object.keys(this.state.computerData));
            if (this.state.selectedComputer && this.state.selectedComputer !== "Select a computer..." && computers.includes(this.state.selectedComputer)) {
                let cd = this.state.computerData[this.state.selectedComputer];
                let memUsage = (cd["used_memory"] / cd["current_memory"] * 100).toFixed(1);
                if (memUsage >= 70 && memUsage < 90) {
                   ramHeroType = "is-warning";
                } else if (memUsage >= 90) {
                    ramHeroType = "is-danger";
                }
                if (cd["cpu_usage"] >= 90 || cd["cpu_pack_temp"] >= 82) {
                    cpuHeroType = "is-danger";
                } else if (cd["cpu_usage"] >= 70 || cd["cpu_pack_temp"] >= 70) {
                    cpuHeroType = "is-warning";
                }
                if (cd["cpu_pack_temp"] >= 82) {
                    cpuTempHeroType = "is-danger";
                } else if (cd["cpu_pack_temp"] >= 70) {
                    cpuTempHeroType = "is-warning";
                }
                if (cd["cpu_usage"] >= 90) {
                    cpuUsageHeroType = "is-danger";
                } else if (cd["cpu_usage"] >= 70) {
                    cpuUsageHeroType = "is-warning";
                }   
                pcInfo = this.state.selectedComputer;
                showStatuses = true;
                if (cd["cpu_temps"][0]) {
                    cpuTemps = cd["cpu_temps"].split(",").join("°C, ") + "°C";
                    cpuTemps = `Individual CPU Temperatures: ${cpuTemps}`;
                } else {
                    cpuTemps = null;
                }
                if (cd["cpu_pack_temp"]) {
                    cpuInfo = `CPU Stats: ${cd["cpu_usage"]}% Usage at ${cd["cpu_pack_temp"]}°C`;
                } else {
                    cpuInfo = `CPU Stats: ${cd["cpu_usage"]}% Usage`;
                }
                cpuUsages = cd["cpu_usages"].split(",").join("%, ") + "%";
                ramInfo = `Memory: ${cd["used_memory"]} GB/${cd["current_memory"]} GB (${memUsage}% usage)`;
                turboInfo = `Turbo: ${cd["current_turbo"]} MHz/${cd["max_turbo"]} MHz`;
                if (cd["current_turbo"] === null) {
                    turboInfo = null;
                }
                cpuUsages = `Individual CPU Usages: ${cpuUsages}`;
                let timeDiff = Math.floor(Date.now() / 1000) - cd["time"];
                if (timeDiff <= 9) {
                    pcHeroType = "is-success";
                } else {
                    pcInfo = `${this.state.selectedComputer} (No response for ${timeDiff} seconds!):`;
                    if (timeDiff <= 59) {
                        pcHeroType = "is-warning";
                    } else {
                        pcHeroType = "is-danger";
                    }
                }
            }

        }
        return (
            <div>
                <Title textColor={this.props.textColor} title="Computer Status"/>
                <br/>
                <div className="columns">
                    <div className="column is-one-quarter">
                        <Dropdown handleChange={(event) => this.setState({selectedComputer: event.target.value})} items={computers} textColor={this.props.textColor} bgColor={this.props.backgroundColor}/>
                        <br/>
                        <br/>
                        <SmallHero isVisible={true} textColor={this.props.buttonTextColor} heroType={this.state.statusHeroType} text={this.state.statusInfo}/>
                    </div>

                    <div className="column">
                        <SmallHero isVisible={showStatuses} textColor={this.props.buttonTextColor} heroType={pcHeroType} text={pcInfo}/>
                        <SmallHero isVisible={showStatuses} textColor={this.props.buttonTextColor} heroType={ramHeroType} text={ramInfo}/>
                        <SmallHero isVisible={showStatuses} textColor={this.props.buttonTextColor} heroType={cpuHeroType} text={cpuInfo}/>
                        <SmallHero isVisible={showStatuses && turboInfo !== null} textColor={this.props.buttonTextColor} heroType="is-success" text={turboInfo}/>
                        <SmallHero isVisible={showStatuses && cpuTemps !== null} textColor={this.props.buttonTextColor} heroType={cpuTempHeroType} text={cpuTemps}/>
                        <SmallHero isVisible={showStatuses} textColor={this.props.buttonTextColor} heroType={cpuUsageHeroType} text={cpuUsages}/>
                    </div>
                </div>
            </div>
            
        );
    }
}

export default ComputerInfo;