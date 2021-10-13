import React from 'react';
import { withRouter } from 'react-router';
import { anotherPageUrl, multiFileUploadPageUrl, thirdPageUrl } from '../../common/app-consts';
import AuthService from '../../common/auth-service';
import LoaderService from '../../common/components/loader';
import NavLink from './navlink.component';

class Header extends React.Component {
    logOut = () => {
        LoaderService.show();
        AuthService.logOut(this.props.history);
    };

    render = () => {
        const header =
            <nav className="navbar fixed-top navbar-expand-sm p-0 header">
                <button className="btn btn-link navbar-brand mr-0" ><i className="fab fa-react"></i>&nbsp;React JS Demo</button>
                <ul className="navbar-nav mr-auto widemenu">
                    <NavLink to={multiFileUploadPageUrl} title="Multiple file upload" iconClass="fas fa-cloud-upload-alt" />
                    <NavLink to={anotherPageUrl} title="Another Page" iconClass="fab fa-artstation" />
                    <NavLink to={thirdPageUrl} title="Third page" iconClass="fas fa-cloud-meatball" />
                </ul>
                <ul className="navbar-nav px-3 widemenu">
                    <li className="nav-item">
                        <button className="btn btn-link" type="button" onClick={this.logOut}><i className="fas fa-sign-out-alt"></i>&nbsp;Log out</button>
                    </li>
                </ul>
                <div className="hamburger-menu">
                    <button type="button" className="btn navbar-toggle collapsed" data-toggle="collapse" data-target="#hamburger-main-menu">
                        <span className="sr-only">Toggle navigation</span>
                        <i className="fas fa-bars"></i>
                    </button>
                </div>
            </nav>;

        const hambMenu =
            <div className="collapse navbar-collapse" id="hamburger-main-menu">
                <ul className="navbar-nav" data-toggle="collapse" data-target="#hamburger-main-menu">
                    <NavLink buttonStyle={{ width: "100%" }} to={multiFileUploadPageUrl} title="Multiple file upload" iconClass="fas fa-cloud-upload-alt" />
                    <NavLink buttonStyle={{ width: "100%" }} to={anotherPageUrl} title="Another Page" iconClass="fab fa-artstation" />
                    <NavLink buttonStyle={{ width: "100%" }} to={thirdPageUrl} title="Third page" iconClass="fas fa-cloud-meatball" />
                    <li className="nav-item">
                        <button style={{ width: "100%" }} className="btn btn-link" type="button" onClick={this.logOut}><i className="fas fa-sign-out-alt"></i>&nbsp;Log out</button>
                    </li>
                </ul>
            </div>;

        return <>
            {hambMenu}
            {header}
        </>;
    };
}

export default withRouter(Header);
