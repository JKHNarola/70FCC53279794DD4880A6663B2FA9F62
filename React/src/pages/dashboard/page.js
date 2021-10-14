import React, { Suspense } from 'react';
import { Switch, Route, Redirect } from "react-router-dom";
import { anotherPageUrl, dashboardPageUrl, multiFileUploadPageUrl, thirdPageUrl } from '../../common/app-consts';
import AuthService from '../../common/auth-service';
import BlockLoader from '../../common/components/block-loader';
import NotFoundPage from '../404notfound/page';
import Header from './header.component';
import PageLayout from '../../common/components/page-layout';

const FileUploaderPage = React.lazy(() => import('../fileuploader/page'));

class DashboardPage extends React.Component {
    constructor(props) {
        super(props);
        this.isLoggedIn = AuthService.isUserLoggedIn();
    }

    render = () => {
        const { location } = this.props;
        const content =
            <PageLayout>
                <Switch location={location}>
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
                    <Route path="*" component={NotFoundPage} />
                </Switch>
            </PageLayout>;

        return <>
            {this.isLoggedIn && <Header />}
            {this.isLoggedIn && content}
        </>
    };
}

export default DashboardPage;
