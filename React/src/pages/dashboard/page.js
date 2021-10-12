import React from 'react';
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Redirect
} from "react-router-dom";
import { anotherPageUrl, dashboardPageUrl, multiFileUploadPageUrl, thirdPageUrl } from '../../common/app-consts';
import AuthService from '../../common/auth-service';
import NotFoundPageComponent from '../404notfound/page';
import FileUploaderPageComponent from '../fileuploader/page';
import NavLink from './navlink.component';

class DashboardPageComponent extends React.Component {
    constructor(props) {
        super(props);
        this.isLoggedIn = AuthService.isUserLoggedIn();
    }

    logOut = () => {
        AuthService.logOut();
    };

    render = () => {
        const header =
            <nav className="navbar fixed-top navbar-expand-sm p-0 header">
                <button className="btn btn-link navbar-brand col-sm-3 col-md-2 mr-0" >React JS Demo</button>
                <ul className="navbar-nav mr-auto">
                    <NavLink to={multiFileUploadPageUrl} title="Multiple file upload" />
                    <NavLink to={anotherPageUrl} title="Another Page" />
                    <NavLink to={thirdPageUrl} title="Third page" />
                </ul>
                <ul className="navbar-nav px-3">
                    <li className="nav-item">
                        <button className="btn btn-link" type="button" onClick={this.logOut}>Log out</button>
                    </li>
                </ul>
            </nav>;

        const content =
            <div className="container page-area p-3">
                <div className="row">
                    <div className="col-md-12">
                        <Switch>
                            <Route exact path={dashboardPageUrl}>
                                <Redirect to={multiFileUploadPageUrl} />
                            </Route>
                            <Route path={multiFileUploadPageUrl}>
                                <FileUploaderPageComponent />
                            </Route>
                            <Route path={anotherPageUrl}>
                                <div>Another Page</div>
                            </Route>
                            <Route path={thirdPageUrl}>
                                <div>Third Page</div>
                            </Route>
                            <Route component={NotFoundPageComponent} />
                        </Switch>
                    </div>
                </div>
            </div>;

        return <Router>
            {this.isLoggedIn && header}
            {this.isLoggedIn && content}
        </Router>
    };
}

export default DashboardPageComponent;
