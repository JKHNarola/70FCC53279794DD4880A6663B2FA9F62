import './polyfills.js';
import "animate.css";
import React from 'react';
import ReactDOM from 'react-dom';
import { MessageBoxContainer } from './common/components/messagebox.js';
import { ToastNotificationContainer } from './common/components/toastnotification.js';
import LoginPageComponent from './pages/login/page.js';
import DashboardPageComponent from './pages/dashboard/page.js';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import NotFoundPageComponent from './pages/404notfound/page.js';

class App extends React.Component {
    render = () => {
        return (
            <>
                <Router>
                    <Switch>
                        <Route exact path='/' component={LoginPageComponent} />
                        <Route path='/dashboard' component={DashboardPageComponent} />
                        <Route component={NotFoundPageComponent} />
                    </Switch>
                </Router>
                <ToastNotificationContainer position="tr" />
                <MessageBoxContainer />
            </>
        );
    }
}

ReactDOM.render(<App />, document.getElementById('root'));
