import React from "react";

import { Link } from "react-router-dom";

export default function NavBar(props) {
    /**
     * Props:
     *  textColor: Text Color
     *  backgroundColor: Background color
     * 
     */

    return (
        <nav className="navbar" style={{backgroundColor: props.backgroundColor}}>
            <div className="navbar-brand">
            </div>
            <div className="navbar-menu is-active" style={{backgroundColor: props.backgroundColor}}>
                <div className="navbar-start">
                    <Link to="/">
                        <a className="navbar-item" style={{color: props.textColor, backgroundColor: props.backgroundColor}} href="#/">View Computer Status</a>
                    </Link>
                    <Link to="/gui_users">
                        <a className="navbar-item" style={{color: props.textColor, backgroundColor: props.backgroundColor}} href="#/">Manage Users</a>
                    </Link>
                    <Link to="/gui_tokens">
                        <a className="navbar-item" style={{color: props.textColor, backgroundColor: props.backgroundColor}} href="#/">Manage Tokens</a>
                    </Link>
                    <Link to="/login">
                        <a className="navbar-item" style={{color: props.textColor, backgroundColor: props.backgroundColor}} href="#/">Login/Settings</a>
                    </Link>
                </div>
            </div>
        </nav>  
    );
}