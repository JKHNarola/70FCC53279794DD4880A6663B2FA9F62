import React from 'react';
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Redirect
} from "react-router-dom";
import AuthService from '../../common/auth-service';
import NotFoundPageComponent from '../404notfound/page';
import FileUploaderPageComponent from '../fileuploader/page';
import NavLink from './navlink.component';

class DashboardPageComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isMultiFileUploadPageActive: false,
            isAnotherPageActive: false,
            isThirdPageActive: false
        }
        this.isLoggedIn = AuthService.isUserLoggedIn();
    }

    render = () => {
        const header =
            <nav className="navbar fixed-top navbar-expand-sm p-0 header">
                <button className="btn btn-link navbar-brand col-sm-3 col-md-2 mr-0" >React JS Demo</button>
                <ul className="navbar-nav mr-auto">
                    <NavLink to="/dashboard/multifileupload" title="Multiple file upload" />
                    <NavLink to="/dashboard/anotherpage" title="Another Page" />
                    <NavLink to="/dashboard/thirdpage" title="Third page" />
                </ul>
                <ul className="navbar-nav px-3">
                    <li className="nav-item">
                        <button className="btn btn-link">Sign out</button>
                    </li>
                </ul>
            </nav>;

        const content =
            <div className="container page-area p-3">
                <div className="row">
                    <div className="col-md-12">
                        <Switch>
                            <Route exact path="/dashboard">
                                <Redirect to="/dashboard/multifileupload" />
                            </Route>
                            <Route path="/dashboard/multifileupload">
                                <FileUploaderPageComponent />
                            </Route>
                            <Route path="/dashboard/anotherpage">
                                <div>Another Page</div>
                            </Route>
                            <Route path="/dashboard/thirdpage">
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
