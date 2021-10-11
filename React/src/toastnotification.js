import React from 'react';
import { BehaviorSubject } from 'rxjs';
import { v1 as uuidv1 } from 'uuid';

const newToastNotificationRequestSubject = new BehaviorSubject(null);
const newToastNotificationObservable = newToastNotificationRequestSubject.asObservable();
const newToastNotificationRequest = (config) => {
    newToastNotificationRequestSubject.next(config);
};

const removeToastNotificationRequestSubject = new BehaviorSubject(null);
const removeToastNotificationRequestObservable = removeToastNotificationRequestSubject.asObservable();
const removeToastNotificationRequest = (id) => {
    removeToastNotificationRequestSubject.next(id);
};

export const ToastNotification = {
    /**
     * Shows new toast notification with customizable settings through config object as parameter.
     * config object can have below properties 
     * 
     * {message, isShowIcon, icon, isAutoClose, closeTimer, onClose}
     */
    show: (config) => {
        newToastNotificationRequest(config);
    },
    success: (message, onCloseCallback = () => { }, closeTimer = 0) => {
        newToastNotificationRequest({
            onClose: onCloseCallback,
            message: message,
            isShowIcon: true,
            icon: "success",
            isAutoClose: closeTimer > 0,
            closeTimer: closeTimer
        });
    },
    error: (message, onCloseCallback = () => { }, closeTimer = 0) => {
        newToastNotificationRequest({
            onClose: onCloseCallback,
            message: message,
            isShowIcon: true,
            icon: "error",
            isAutoClose: closeTimer > 0,
            closeTimer: closeTimer
        });
    },
    warning: (message, onCloseCallback = () => { }, closeTimer = 0) => {
        newToastNotificationRequest({
            onClose: onCloseCallback,
            message: message,
            isShowIcon: true,
            icon: "warning",
            isAutoClose: closeTimer > 0,
            closeTimer: closeTimer
        });
    },
    info: (message, onCloseCallback = () => { }, closeTimer = 0) => {
        newToastNotificationRequest({
            onClose: onCloseCallback,
            message: message,
            isShowIcon: true,
            icon: "info",
            isAutoClose: closeTimer > 0,
            closeTimer: closeTimer
        });
    },
};


export class ToastNotificationContainer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            toastNotificationList: []
        }
    }

    componentDidMount = () => {
        this.subscribeForEvents();
    };

    componentWillUnmount = () => {
        this.unsubscribeForEvents();
    };

    subscribeForEvents = () => {
        this.addToastNotificationSubscription = newToastNotificationObservable.subscribe(config => {
            if (config && typeof config === "object") {
                config.id = uuidv1();
                if (this.props.position && this.props.position.indexOf("b") > -1)
                    this.setState({ toastNotificationList: [...this.state.toastNotificationList, config] });
                else
                    this.setState({ toastNotificationList: [{ ...config }, ...this.state.toastNotificationList] });
            }
        });

        this.removeToastNotificationSubscription = removeToastNotificationRequestObservable.subscribe(id => {
            if (id)
                setTimeout(() => {
                    this.setState(prevstate => ({ toastNotificationList: prevstate.toastNotificationList.filter(item => item.id !== id) }));
                }, 1000);
        });
    };

    unsubscribeForEvents = () => {
        this.addToastNotificationSubscription.unsubscribe();
        this.removeToastNotificationSubscription.unsubscribe();
    };

    render = () => {
        const position = this.props.position ? this.props.position : "tr";
        return <div id="toastnotificationarea" className={"toast-notification-container " + position}>
            {
                this.state.toastNotificationList.map(x =>
                    <ToastNotificationBlock
                        key={x.id}
                        id={x.id}
                        message={x.message}
                        isShowIcon={x.isShowIcon}
                        icon={x.icon}
                        isAutoClose={x.isAutoClose}
                        closeTimer={x.closeTimer}
                        onClose={x.onClose}
                    />
                )
            }
        </div>
    };
}

class ToastNotificationBlock extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isShow: false,
            // timer: 0,
            // ticked: 0
        }
    }

    componentDidMount = () => {
        this.open();
    };

    open = () => {
        this.setState({ isShow: true });
        if (this.props.closeTimer) {
            setTimeout(() => {
                this.setState({ isShow: false });
                // clearInterval(this.interval);
                this.close();
            }, this.props.closeTimer);

            // this.interval = setInterval(() => {
            //     this.setState(prev => ({ timer: 1000 * prev.ticked / this.props.closeTimer, ticked: prev.ticked + 1 }));
            // }, 10);
            // setTimeout(() => {
            //     this.setState({ isShow: false });
            //     clearInterval(this.interval);
            //     this.close();
            // }, this.props.closeTimer);
        }
    };

    close = () => {
        this.setState({ isShow: false });
        removeToastNotificationRequest(this.props.id);

        if (this.props.onClose && typeof this.props.onClose === "function")
            this.props.onClose();
    };

    render = () => {
        const iconBlock = this.props.isShowIcon &&
            <div className="icon text-center">
                {
                    this.props.icon === "success" && <i className="fas fa-check-circle text-success"></i>
                }
                {
                    this.props.icon === "info" && <i className="fas fa-info-circle text-info"></i>
                }
                {
                    this.props.icon === "error" && <i className="fas fa-exclamation-circle text-danger"></i>
                }
                {
                    this.props.icon === "warning" && <i className="fas fa-exclamation-triangle text-warning"></i>
                }
            </div>;

        const body =
            <div className="row">
                <div className="col-sm-12">
                    <table>
                        <tbody>
                            <tr>
                                <td>{iconBlock}</td>
                                {
                                    this.props.message &&
                                    <td style={{ width: "100%" }}>
                                        <div className="message" style={{ wordBreak: "break-word", fontSize: 16 }} dangerouslySetInnerHTML={{ __html: this.props.message }}></div>
                                    </td>
                                }
                                {
                                    !this.props.isAutoClose &&
                                    <td><div className="toast-close" onClick={this.close}><i className="fas fa-times close-size"></i></div></td>
                                }
                            </tr>
                        </tbody>
                    </table>
                    {
                        // this.props.isAutoClose && this.props.closeTimer > 0 &&
                        // <div id={"prg_" + this.props.id} className="timer-progress">
                        //     <div style={{ width: this.state.timer + "%" }}></div>
                        // </div>
                    }
                </div>
            </div>;

        return <>
            <div className={"toast animate__animated animate__bounceIn " + this.props.icon} id={this.props.id} style={{ display: this.state.isShow ? "block" : "none" }}>
                <div className="toast-body">
                    {body}
                </div>
            </div>
        </>;
    };
}