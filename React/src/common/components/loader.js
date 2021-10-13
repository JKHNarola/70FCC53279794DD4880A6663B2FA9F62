import React from 'react';
import { hideLoaderRequest, hideLoaderRequestObservable, showLoaderRequest, showLoaderRequestObservable } from '../service';

const LoaderService = {
    show: () => {
        showLoaderRequest();
    },
    hide: () => {
        hideLoaderRequest();
    }
}

export class Loader extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isShow: false
        };
    }

    componentDidMount = () => {
        this.showRequestSubscription = showLoaderRequestObservable.subscribe(() => {
            this.setState({ isShow: true });
        });

        this.hideReqeustSubscription = hideLoaderRequestObservable.subscribe(() => {
            this.setState({ isShow: false });
        });
    };

    componentWillUnmount = () => {
        this.showRequestSubscription.unsubscribe();
        this.hideReqeustSubscription.unsubscribe();
    };

    render = () => {
        return <div className="loader-backdrop" style={{ visibility: this.state.isShow ? "visible" : "hidden", opacity: this.state.isShow ? 1 : 0 }}>
            <div className="loader">
                <div className="lds-dual-ring">
                    <div className="lds-dual-ring-inside"></div>
                </div>
                <div style={{ color: "white", fontWeight: 600 }}>Plaese wait</div>
            </div>
        </div>;
    };
}

export default LoaderService;
