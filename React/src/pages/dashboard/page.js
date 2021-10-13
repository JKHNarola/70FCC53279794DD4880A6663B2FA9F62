import React, { Suspense } from 'react';
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Redirect,
    withRouter
} from "react-router-dom";
import { anotherPageUrl, dashboardPageUrl, multiFileUploadPageUrl, thirdPageUrl } from '../../common/app-consts';
import AuthService from '../../common/auth-service';
import BlockLoader from '../../common/components/block-loader';
import LoaderService from '../../common/components/loader';
import NotFoundPage from '../404notfound/page';
import Header from './header.component';

const FileUploaderPage = React.lazy(() => import('../fileuploader/page'));

class DashboardPage extends React.Component {
    constructor(props) {
        super(props);
        this.isLoggedIn = AuthService.isUserLoggedIn();
    }

    render = () => {
        const content =
            <div className="container page-area p-3">
                <div className="row">
                    <div className="col-sm-12">
                        <Switch>
                            <Route exact path={dashboardPageUrl}>
                                <Redirect to={multiFileUploadPageUrl} />
                            </Route>
                            <Route path={multiFileUploadPageUrl}>
                                <Suspense fallback={<BlockLoader isShow={true} isBackDropVisible={false} />}>
                                    <FileUploaderPage />
                                </Suspense>
                            </Route>
                            <Route path={anotherPageUrl}>
                                <BlockLoader isShow={true} isBackDropVisible={false} />
                            </Route>
                            <Route path={thirdPageUrl}>
                                <div>Third Page</div>
                            </Route>
                            <Route component={NotFoundPage} />
                        </Switch>
                    </div>
                </div>
            </div>;

        return <>
            {this.isLoggedIn && <Header />}
            {this.isLoggedIn && content}
        </>
    };
}

export default DashboardPage;
