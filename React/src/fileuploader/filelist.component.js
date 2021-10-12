import React from 'react';
import { restRequest } from '../common/RESTRequest';
import * as mime from 'mime';
import moment from "moment";
import { reloadListRequestObservable } from '../common/common-service';
import { apiUrlFileList, apiUrlFileDownload, apiUrlFileDelete } from '../common/app-consts';
import { formatBytes } from '../common/utils';
import { MessageBox } from '../common/messagebox';

export class FileList extends React.Component {
    constructor() {
        super();
        this.state = {
            data: [],
            isLoading: false
        };
    }

    componentDidMount = () => {
        setTimeout(() => {
            // ToastNotification.success("Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam scelerisque rutrum elit, vitae luctus ipsum venenatis quis.");
            // ToastNotification.error("Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam scelerisque rutrum elit, vitae luctus ipsum venenatis quis.");
            // ToastNotification.warning("<div class='text-warning'>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</div> <div style='font-style: italic;'>Etiam scelerisque rutrum elit, vitae luctus ipsum venenatis quis.</div>");
        }, 200);

        this.subscription = reloadListRequestObservable.subscribe(() => {
            this.getList();
        });
    };

    componentWillUnmount = () => {
        this.subscription.unsubscribe();
    };

    getList = () => {
        this.setState({ isLoading: true });
        if (this.getRequest) this.getRequest.abort();
        this.getRequest = restRequest({
            url: apiUrlFileList,
            method: "GET",
            onSuccess: (res) => {
                let lst = res.response.map(x => {
                    x.isDownloading = false;
                    x.isDeleting = false;
                    return x;
                });
                this.setState({ data: lst });
            },
            onError: (res) => {
                if (res.status !== 604) MessageBox.error("Error occurred", "Some error occured while getting list of files. Please refresh page to try again.");
            },
            onComplete: () => {
                this.setState({ isLoading: false });
            },
        });
    };

    getFileNameFromPath = (file) => file.split('\\').pop().split('/').pop();

    donwloadFile = obj => {
        let req = restRequest({
            url: apiUrlFileDownload,
            data: { filename: obj.name },
            method: "GET",
            isDebug: true,
            responseType: "arraybuffer",
            onSuccess: (res) => {
                if (window.navigator && window.navigator.msSaveOrOpenBlob) {
                    let blob = new Blob([res.response], { type: mime.getType(obj.name.split('.').pop().toString().toLowerCase()) });
                    window.navigator.msSaveOrOpenBlob(blob, obj.name);
                }
                else {
                    let bl = new Blob([res.response], { type: mime.getType(obj.name.split('.').pop().toString().toLowerCase()) });
                    let url = URL.createObjectURL(bl);
                    let a = document.createElement("a");
                    document.body.appendChild(a);
                    a.style = "display: none";
                    a.href = url;
                    a.download = obj.name;
                    a.click();
                    window.URL.revokeObjectURL(url);
                }
            },
            onError: (res) => {
                if (res && res.status !== 604)
                    MessageBox.error("Error occurred", "Some error occured while downloading file. Please try again.");
            },
            onDownloadProgress: (p) => {
                this.setState(prevState => ({
                    data: prevState.data.map(el => el.path === obj.path ? { ...el, percentComplete: p.percentComplete } : el)
                }));
            },
            onComplete: () => {
                this.setState(prevState => ({
                    data: prevState.data.map(el => el.path === obj.path ? { ...el, isDownloading: false, percentComplete: 0 } : el)
                }));
            },
        });
        this.setState(prevState => ({
            data: prevState.data.map(el => el.path === obj.path ? { ...el, isDownloading: true, percentComplete: 0, request: req } : el)
        }));
    };

    cancelDownload = req => {
        req.abort();
    };

    deleteFile = (obj) => {
        let isDeleteAll = Array.isArray(obj);
        MessageBox.confirmYesNo("Please confirm", "Are you sure you want to delete" + (isDeleteAll ? " all the files " : " <b class='text-info'>" + obj.name + "</b> file ") + "from the server?<br/><small class='text-danger'><i>What's done cannot be undone.</i></small>", () => {
            this.setState(prevState => ({
                data: prevState.data.map(el => el.path === obj.path ? { ...el, isDeleting: true } : el)
            }));
            restRequest({
                url: apiUrlFileDelete,
                data: isDeleteAll ? obj.map(x => x.name) : [obj.name],
                method: "DELETE",
                isJson: true,
                onSuccess: (res) => {
                    if (res.status === 200) {
                        this.getList();
                    }
                },
                onError: () => {
                    MessageBox.error("Error occurred", "Some error occured while deleting file. Please try again.");
                },
                onComplete: () => {
                    this.setState(prevState => ({
                        data: prevState.data.map(el => el.path === obj.path ? { ...el, isDeleting: false } : el)
                    }));
                },
            });
        });
    };

    render = () => {
        const fileBlock =
            <>
                {
                    this.state.data.map((obj, i) =>
                        <div key={i} className="file-block" style={{ marginBottom: i === (this.state.data.length - 1) ? 0 : 0.5 + "rem" }}>
                            {
                                obj.isDownloading &&
                                <div className="file-block-progress-bar" style={{ width: obj.percentComplete + "%" }}></div>
                            }
                            <div className="row" style={{ position: "inherit" }}>
                                <div className="col-sm-9">
                                    <span className="text-muted" style={{ fontSize: 14, fontWeight: 600 }}>{obj.name}</span>
                                    <div className="text-muted" style={{ fontSize: 12 }}><b>Size: </b>{formatBytes(obj.size)}</div>
                                    <div className="text-muted" style={{ fontSize: 12 }}>Created {moment(obj.createdAt).fromNow()}, Last modified {moment(obj.lastModified).fromNow()}</div>
                                </div>
                                <div className="col-sm-3">
                                    {
                                        !obj.isDownloading && !obj.isDeleting &&
                                        <div className="icon-btn text-danger ms-1" onClick={() => this.deleteFile(obj)}>
                                            <i className="fa fa-times" aria-hidden="true"></i>
                                        </div>
                                    }
                                    {
                                        !obj.isDownloading && !obj.isDeleting &&
                                        <div className="icon-btn text-success" onClick={() => this.donwloadFile(obj)}>
                                            <i className="fa fa-download" aria-hidden="true"></i>
                                        </div>
                                    }
                                    {
                                        obj.isDownloading &&
                                        <div className="icon-btn text-danger" onClick={() => this.cancelDownload(obj.request)}>
                                            <i className="fa fa-times" aria-hidden="true"></i>
                                        </div>
                                    }
                                    {
                                        obj.isDeleting &&
                                        <div className="icon-btn text-warning ms-1">
                                            <i className="fa fa-spinner fa-spin" aria-hidden="true"></i>
                                        </div>
                                    }
                                </div>
                            </div>
                        </div>
                    )
                }
            </>

        const noContentBlock = !this.state.isLoading && this.state.data.length === 0 &&
            <div className="row">
                <div className="col-sm-12">
                    <div className="text-center">No files uploaded</div>
                </div>
            </div>

        const loadingBlock = this.state.isLoading &&
            <div className="loader">
                <div className="text-center mt-2">Loading..</div>
            </div>


        return (
            <div className="main-area mt-4">
                <div className="card">
                    <div className="card-header">
                        <h5 className="float-left">Previously uploaded files ({this.state.data.length})</h5>
                        {
                            this.state.data.length > 0 &&
                            <div className="float-right">
                                <button type="button" className="btn btn-danger btn-sm" onClick={() => this.deleteFile(this.state.data)}>Delete All</button>
                            </div>
                        }
                    </div>
                    <div className="card-body">
                        {loadingBlock}
                        {fileBlock}
                        {noContentBlock}
                    </div>
                </div>
            </div >
        );
    };
}
