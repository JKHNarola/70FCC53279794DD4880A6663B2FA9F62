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
     * {message, isShowIcon, icon, iconColorClass, isAutoClose, closeTimer, onClose}
     * 
     * iconColorClass is only used for custom icon. set isShowIcon to true and font awesome icon name in icon property to use suctome icon with custom color.
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
                }, 250);
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
                        iconColorClass={x.iconColorClass}
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
            isShow: false
        }
    }

    componentDidMount = () => {
        setTimeout(() => {
            this.open();
        }, 10);
    };

    open = () => {
        this.setState({ isShow: true });
        if (this.props.closeTimer) {
            this.timeout = setTimeout(() => {
                this.close(false);
            }, this.props.closeTimer);
        }
    };

    close = (isbutton) => {
        if (!isbutton && !this.props.isAutoClose) return;
        this.setState({ isShow: false });
        removeToastNotificationRequest(this.props.id);

        if (this.props.onClose && typeof this.props.onClose === "function")
            this.props.onClose();

        clearTimeout(this.timeout);
    };

    render = () => {
        const isCustomIcon = this.props.icon !== "success" && this.props.icon !== "info" && this.props.icon !== "error" && this.props.icon !== "warning";
        const iconBlock =
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
                {
                    isCustomIcon && <i className={"fas " + this.props.icon + " " + (this.props.iconColorClass ? this.props.iconColorClass : "text-info")}></i>
                }
            </div>;

        const body =
            <div className="row">
                <div className="col-sm-12">
                    <table>
                        <tbody>
                            <tr>
                                {
                                    this.props.isShowIcon && <td>{iconBlock}</td>
                                }
                                {
                                    this.props.message &&
                                    <td style={{ width: "100%" }}>
                                        <div className="message" dangerouslySetInnerHTML={{ __html: this.props.message }}></div>
                                    </td>
                                }
                                {
                                    !this.props.isAutoClose &&
                                    <td><div className="toast-close" onClick={() => this.close(true)}><i className="fas fa-times close-size"></i></div></td>
                                }
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>;

        return <>
            <div className={"toast " + (this.state.isShow ? "show " : "") + (!isCustomIcon ? this.props.icon : "")} id={this.props.id} onClick={() => this.close(false)}>
                <div className="toast-body">
                    {body}
                </div>
            </div>
        </>;
    };
}