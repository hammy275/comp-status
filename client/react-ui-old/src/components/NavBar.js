import React from "react";

import { Link } from "react-router-dom";
import Optional from "./Optional";

export default function NavBar(props) {
    /**
     * Props:
     *  textColor: Text Color
     *  backgroundColor: Background color
     *  permissions: List of permissions that user has
     * 
     */

    return (
        <nav className="navbar" style={{backgroundColor: props.backgroundColor}}>
            <div className="navbar-brand">
            </div>
            <div className="navbar-menu is-active" style={{backgroundColor: props.backgroundColor}}>
                <div className="navbar-start">
                    <Optional cond={props.permissions.includes("client_user")} elem={
                        <Link to="/">
                            <h2 className="navbar-item" style={{color: props.textColor, backgroundColor: props.backgroundColor}}>View Computer Status</h2>
                        </Link>}
                    />
                    <Optional cond={props.permissions.includes("manage_users")} elem={
                        <Link to="/gui_users">
                            <h2 className="navbar-item" style={{color: props.textColor, backgroundColor: props.backgroundColor}}>Manage Users</h2>
                        </Link>}
                    />
                    <Optional cond={props.permissions.includes("revoke_tokens")} elem={
                        <Link to="/gui_tokens">
                            <h2 className="navbar-item" style={{color: props.textColor, backgroundColor: props.backgroundColor}}>Manage Tokens</h2>
                        </Link>}
                    />
                    <Optional cond={props.permissions.includes("fts")} elem={
                        <Link to="/fts">
                            <h2 className="navbar-item" style={{color: props.textColor, backgroundColor: props.backgroundColor}}>First Time Setup</h2>
                        </Link>}
                    />
                    <Link to="/login">
                        <h2 className="navbar-item" style={{color: props.textColor, backgroundColor: props.backgroundColor}}>Login/Settings</h2>
                    </Link>
                </div>
            </div>
        </nav>  
    );
}