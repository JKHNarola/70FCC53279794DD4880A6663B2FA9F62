import React from 'react';
import { v1 as uuidv1 } from 'uuid';
import { newMessageBoxRequest, removeMessageBoxRequest, newMessageBoxRequestObservable, removeMessageBoxRequestObservable } from '../service';

const MessageBox = {
    /**
     * Opens new messagebox with customizable settings through config object as parameter.
     * config object can have below properties 
     * 
     * {title, message, isShowIcon, icon, iconColorClass, isDisableKeyboard, isDisableBackdrop, isOk, isCancel, isNo, isYes, onOK, onCancel, onYes, onNo}
     * 
     *      
     * iconColorClass is only used for custom icon. set isShowIcon to true and font awesome icon name in icon property to use suctome icon with custom color.
     */
    open: (config) => {
        newMessageBoxRequest(config);
    },
    confirm: (title, message, onOKCallback = () => { }, onCancelCallback = () => { }, isDisableKeyboard = true, isDisableBackdrop = true) => {
        newMessageBoxRequest({
            onOK: onOKCallback,
            onCancel: onCancelCallback,
            title: title,
            message: message,
            isShowIcon: true,
            icon: "question",
            isCancel: true,
            isOk: true,
            isNo: false,
            isYes: false,
            isDisableKeyboard: isDisableKeyboard,
            isDisableBackdrop: isDisableBackdrop
        });
    },
    confirmYesNo: (title, message, onYesCallback = () => { }, onNoCallback = () => { }, isDisableKeyboard = true, isDisableBackdrop = true) => {
        newMessageBoxRequest({
            onYes: onYesCallback,
            onNo: onNoCallback,
            title: title,
            message: message,
            isShowIcon: true,
            icon: "question",
            isCancel: false,
            isOk: false,
            isNo: true,
            isYes: true,
            isDisableKeyboard: isDisableKeyboard,
            isDisableBackdrop: isDisableBackdrop
        });
    },
    success: (title, message, isShowOKButton = false, onOKCallback = () => { }, isDisableKeyboard = false, isDisableBackdrop = false) => {
        newMessageBoxRequest({
            onOK: onOKCallback,
            title: title,
            message: message,
            isShowIcon: true,
            icon: "success",
            isCancel: false,
            isOk: isShowOKButton,
            isNo: false,
            isYes: false,
            isDisableKeyboard: isDisableKeyboard,
            isDisableBackdrop: isDisableBackdrop
        });
    },
    error: (title, message, isShowOKButton = false, onOKCallback = () => { }, isDisableKeyboard = true, isDisableBackdrop = true) => {
        newMessageBoxRequest({
            onOK: onOKCallback,
            title: title,
            message: message,
            isShowIcon: true,
            icon: "error",
            isCancel: false,
            isOk: isShowOKButton,
            isNo: false,
            isYes: false,
            isDisableKeyboard: isDisableKeyboard,
            isDisableBackdrop: isDisableBackdrop
        });
    },
    warning: (title, message, isShowOKButton = false, onOKCallback = () => { }, isDisableKeyboard = false, isDisableBackdrop = false) => {
        newMessageBoxRequest({
            onOK: onOKCallback,
            title: title,
            message: message,
            isShowIcon: true,
            icon: "warning",
            isCancel: false,
            isOk: isShowOKButton,
            isNo: false,
            isYes: false,
            isDisableKeyboard: isDisableKeyboard,
            isDisableBackdrop: isDisableBackdrop
        });
    },
    info: (title, message, isShowOKButton = true, onOKCallback = () => { }, isDisableKeyboard = false, isDisableBackdrop = false) => {
        newMessageBoxRequest({
            onOK: onOKCallback,
            title: title,
            message: message,
            isShowIcon: true,
            icon: "info",
            isCancel: false,
            isOk: isShowOKButton,
            isNo: false,
            isYes: false,
            isDisableKeyboard: isDisableKeyboard,
            isDisableBackdrop: isDisableBackdrop
        });
    },
    alert: (title, message, isDisableKeyboard = true, isDisableBackdrop = true) => {
        newMessageBoxRequest({
            title: title,
            message: message,
            isShowIcon: false,
            isCancel: false,
            isOk: false,
            isNo: false,
            isYes: false,
            isDisableKeyboard: isDisableKeyboard,
            isDisableBackdrop: isDisableBackdrop
        });
    }
};

export class MessageBoxContainer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            messageBoxList: []
        }
    }

    componentDidMount = () => {
        this.subscribeForEvents();
    };

    componentWillUnmount = () => {
        this.unsubscribeForEvents();
    };

    subscribeForEvents = () => {
        this.addBoxSubscription = newMessageBoxRequestObservable.subscribe(config => {
            if (config && typeof config === "object") {
                config.id = uuidv1();
                this.setState({ messageBoxList: [...this.state.messageBoxList, config] });
            }
        });

        this.removeBoxSubscription = removeMessageBoxRequestObservable.subscribe(id => {
            if (id)
                setTimeout(() => {
                    this.setState(prevstate => ({ messageBoxList: prevstate.messageBoxList.filter(item => item.id !== id) }));
                }, 1000);
        });
    };

    unsubscribeForEvents = () => {
        this.addBoxSubscription.unsubscribe();
        this.removeBoxSubscription.unsubscribe();
    };

    render = () => {
        return <div id="messageboxarea">
            {
                this.state.messageBoxList.map(x =>
                    <MessageBoxModalPopup
                        key={x.id}
                        id={x.id}
                        title={x.title}
                        message={x.message}
                        isShowIcon={x.isShowIcon}
                        icon={x.icon}
                        iconColorClass={x.iconColorClass}
                        isDisableKeyboard={x.isDisableKeyboard}
                        isDisableBackdrop={x.isDisableBackdrop}
                        isOk={x.isOk}
                        isCancel={x.isCancel}
                        isNo={x.isNo}
                        isYes={x.isYes}
                        onOK={x.onOK}
                        onCancel={x.onCancel}
                        onYes={x.onYes}
                        onNo={x.onNo} />
                )
            }
        </div>
    };
}

class MessageBoxModalPopup extends React.Component {
    componentDidMount = () => {
        this.open();
    };

    open = () => {
        let that = this;
        window.$("#" + this.props.id).modal({
            show: true,
            keyboard: !that.props.isDisableKeyboard,
            backdrop: that.props.isDisableBackdrop === true ? 'static' : true,
            focus: true
        });
    };

    close = res => {
        switch (res) {
            case "ok":
                this.props.onOK && typeof this.props.onOK === "function" && this.props.onOK();
                break;
            case "cancel":
                this.props.onCancel && typeof this.props.onCancel === "function" && this.props.onCancel();
                break;
            case "yes":
                this.props.onYes && typeof this.props.onYes === "function" && this.props.onYes();
                break;
            case "no":
                this.props.onNo && typeof this.props.onNo === "function" && this.props.onNo();
                break;
            default:
                break;
        }
        window.$("#" + this.props.id).modal('hide');
        removeMessageBoxRequest(this.props.id);
    };

    render = () => {
        const isCustomIcon = this.props.icon !== "success" && this.props.icon !== "info" && this.props.icon !== "error" && this.props.icon !== "warning" && this.props.icon !== "question";
        const isHideFooter = !this.props.isCancel && !this.props.isOk && !this.props.isYes && !this.props.isNo;
        const iconBlock = this.props.isShowIcon &&
            <div className="text-center mt-0 animate__animated animate__jackInTheBox" style={{ fontSize: 5 + "rem", lineHeight: 5 + "rem", opacity: 0.5 }}>
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
                    this.props.icon === "question" && <i className="fas fa-question-circle text-primary"></i>
                }
                {
                    isCustomIcon && <i className={"fas " + this.props.icon + " " + (this.props.iconColorClass ? this.props.iconColorClass : "text-primary")}></i>
                }
            </div>;

        const body =
            <div className="row">
                <div className="col-sm-12">
                    {iconBlock}
                    {this.props.message && <div style={{ wordBreak: "break-word", fontSize: 16 }} className="mt-2 text-center" dangerouslySetInnerHTML={{ __html: this.props.message }}></div>}
                </div>
            </div>;

        const footerButtons =
            <>
                {
                    this.props.isCancel && <button tabIndex={2} onClick={() => this.close('cancel')} type="button" className="btn btn-secondary float-right">Cancel</button>
                }
                {
                    this.props.isOk && <button tabIndex={1} onClick={() => this.close('ok')} type="button" className="btn btn-primary float-right">OK</button>
                }
                {
                    this.props.isNo && <button tabIndex={2} onClick={() => this.close('no')} type="button" className="btn btn-secondary float-right">No</button>
                }
                {
                    this.props.isYes && <button tabIndex={1} onClick={() => this.close('yes')} type="button" className="btn btn-primary float-right">Yes</button>
                }
            </>;

        return <>
            <div className="modal fade" id={this.props.id} ref={modal => this.modal = modal} tabIndex={-1}>
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">{this.props.title}</h5>
                            <span className="close m1-2" onClick={this.close}><i className="fas fa-times close-size"></i></span>
                        </div>
                        <div className="modal-body">
                            {body}
                        </div>
                        {
                            !isHideFooter &&
                            <div className="modal-footer">
                                {footerButtons}
                            </div>
                        }
                    </div>
                </div>
            </div>
        </>;
    };
}

export default MessageBox;