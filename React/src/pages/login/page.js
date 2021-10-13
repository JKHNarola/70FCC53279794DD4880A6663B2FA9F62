import React from 'react';
import MessageBox from '../../common/components/messagebox';
import AuthService from '../../common/auth-service';
import LoaderService from '../../common/components/loader';
import { withRouter } from 'react-router';
import { dashboardPageUrl } from '../../common/app-consts';

class LoginPage extends React.Component {
    componentDidMount = () => {
        setTimeout(() => {
            LoaderService.hide();
        }, 200);
    }
    onLogin = () => {
        if (Math.random() < 0.5) {
            AuthService.setLoggedInUser();
            this.props.history.push(dashboardPageUrl);
        }
        else
            MessageBox.warning("Login failed", "Email and password you entered are seems to be wrong. Please try again.");
    };

    render = () => {
        return <div className="container">
            <div className="row">
                <div className="col-md-12">
                    <div className="card login-card">
                        <article className="card-body">
                            <button type="button" className="float-right btn btn-outline-primary">Sign up</button>
                            <h4 className="card-title mb-4 mt-1">Log in</h4>
                            <form>
                                <div className="form-group">
                                    <label>Your email</label>
                                    <input name="txtemail" className="form-control" placeholder="Email" type="email" />
                                </div>
                                <div className="form-group">
                                    <a className="float-right" href="/forgotemail">Forgot?</a>
                                    <label>Your password</label>
                                    <input className="form-control" placeholder="******" type="password" autoComplete="" />
                                </div>
                                <div className="form-group">
                                    <div className="checkbox">
                                        <label> <input type="checkbox" /> Save password </label>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <button type="button" className="btn btn-primary btn-block" onClick={this.onLogin}> Login  </button>
                                </div>
                            </form>
                        </article>
                    </div>
                </div>
            </div>
        </div>;
    };
}

export default withRouter(LoginPage);