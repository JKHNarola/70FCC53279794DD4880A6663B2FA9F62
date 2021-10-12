import React, { Component } from 'react';
import { Link, withRouter } from "react-router-dom";

class NavLink extends Component {
    render = () => {
        let isActive = this.props.location.pathname === this.props.to;
        let className = isActive ? "active" : "";

        return (
            <li className={"nav-item " + className}>
                <Link to={this.props.to}>
                    <button className="btn btn-link">{this.props.title} {isActive && <span className="sr-only">(current)</span>}</button>
                </Link>
            </li>
        );
    };
}

export default withRouter(NavLink);