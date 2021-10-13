import React, { Component } from 'react';
import { Link, withRouter } from "react-router-dom";

class NavLink extends Component {
    render = () => {
        let isActive = this.props.location.pathname === this.props.to;
        let className = isActive ? "active" : "";

        return (
            <li className={"nav-item " + className}>
                <Link to={this.props.to}>
                    <button style={this.props.buttonStyle} className="btn btn-link">{this.props.iconClass && <i className={this.props.iconClass}></i>}&nbsp;{this.props.title} {isActive && <span className="sr-only">(current)</span>}</button>
                </Link>
            </li>
        );
    };
}

export default withRouter(NavLink);