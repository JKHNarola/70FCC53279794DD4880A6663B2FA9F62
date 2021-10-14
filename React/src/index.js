import './polyfills.js';
import "animate.css";
import React from 'react';
import ReactDOM from 'react-dom';
import { MessageBoxContainer } from './common/components/messagebox.js';
import { ToastNotificationContainer } from './common/components/toastnotification.js';
import LoginPage from './pages/login/page.js';
import DashboardPageComponent from './pages/dashboard/page.js';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import NotFoundPageComponent from './pages/404notfound/page.js';
import { Loader } from './common/components/loader.js';

class App extends React.Component {
    render = () => {
        return (
            <>
                <Router>
                    <Switch>
                        <Route exact path='/' component={LoginPage} />
                        <Route path='/dashboard' component={DashboardPageComponent} />
                        <Route path="*" component={NotFoundPageComponent} />
                    </Switch>
                </Router>
                <ToastNotificationContainer position="tr" />
                <MessageBoxContainer />
                <Loader />
            </>
        );
    }
}

ReactDOM.render(<App />, document.getElementById('root'));
