import 'bootstrap/dist/css/bootstrap.css';
import './index.css';
import "animate.css";

import React from 'react';
import ReactDOM from 'react-dom';
import { restRequest } from './RESTRequest';
import { v1 as uuidv1 } from 'uuid';
import * as mime from 'mime';
import { BehaviorSubject } from 'rxjs';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import moment from "moment";
import { MessageBoxContainer, MessageBoxService } from './messagebox';

const reloadListRequestSubject = new BehaviorSubject(null);
const reloadListRequestObservable = reloadListRequestSubject.asObservable();
const createReloadListRequest = () => {
    reloadListRequestSubject.next();
};
const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0B';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + sizes[i];
};
const apiBaseUrl = "https://localhost:5001/api/";
const apiUrlFileUpload = apiBaseUrl + "file/upload";
const apiUrlFileDownload = apiBaseUrl + "file/download";
const apiUrlFileList = apiBaseUrl + "file/list";
const apiUrlFileDelete = apiBaseUrl + "file/delete";

class MultipleFileUpload extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedFiles: [],
            uploadStatus: "Init"
        };
    }

    onFilesSelected = files => {
        files = files.filter(x => this.state.selectedFiles.findIndex(y => y.name === x.name) === -1);
        files.forEach(f => {
            f.id = uuidv1();
            f.formattedSize = formatBytes(f.size);
            f.progress = 0;
            f.status = "Ready";
            f.uploaded = formatBytes(0);
            f.borderClass = "border-info";
            f.backgroundColor = "#f5f5f5";
            f.statusTextColorClass = "text-info";
            f.progressBarColorClass = "bg-info";
            f.response = null;
            f.request = null;
        });
        this.setState(prevState => ({ selectedFiles: prevState.selectedFiles.concat(files) }));
    };

    onReset = () => {
        this.setState({
            selectedFiles: [],
            uploadStatus: "Init"
        });
    };

    onFileUpload = () => {
        let readyFiles = this.state.selectedFiles.filter(x => x.status === "Ready");
        if (readyFiles.length === 0) return;
        let promises = [];
        readyFiles.forEach(x => {
            let fileid = x.id;
            this.setState(prevState => ({
                selectedFiles: prevState.selectedFiles.map(
                    el => el.id === fileid ? {
                        ...el,
                        id: fileid,
                        name: x.name,
                        progress: 0,
                        status: "Ready",
                        formattedSize: formatBytes(x.size),
                        uploaded: formatBytes(0),
                        borderClass: "border-info",
                        backgroundColor: "#f5f5f5",
                        statusTextColorClass: "text-info",
                        progressBarColorClass: "bg-info"
                    } : el
                )
            }));
            let formData = new FormData();
            formData.append("file", x, x.name);
            promises.push(
                new Promise(resolve => {
                    let id = fileid;
                    let q = restRequest({
                        url: apiUrlFileUpload,
                        data: formData,
                        method: "PATCH",
                        onSuccess: (res) => {
                            this.setState(prevState => ({
                                selectedFiles: prevState.selectedFiles.map(el =>
                                    el.id === id ? {
                                        ...el,
                                        status: "Uploaded",
                                        response: res,
                                        borderClass: "border-success",
                                        backgroundColor: "#ddffe5",
                                        statusTextColorClass: "text-success",
                                        progressBarColorClass: "bg-success"
                                    } : el
                                )
                            }));
                            createReloadListRequest();
                        },
                        onError: (res) => {
                            this.setState(prevState => ({
                                selectedFiles: prevState.selectedFiles.map(el =>
                                    el.id === id ? {
                                        ...el,
                                        status: res && res.status === 604 ? "Aborted" : "Failed",
                                        response: res,
                                        borderClass: "border-danger",
                                        backgroundColor: "#ffdddd",
                                        statusTextColorClass: "text-danger",
                                        progressBarColorClass: "bg-danger"
                                    } : el)
                            }));
                        },
                        onComplete: () => {
                            resolve();
                        },
                        onUploadProgress: (p) => {
                            let formattedSize = formatBytes(p.totalBytes);
                            let uploaded = formatBytes(p.uploadedBytes);
                            this.setState(prevState => ({
                                selectedFiles: prevState.selectedFiles.map(el =>
                                    el.id === id ? {
                                        ...el,
                                        progress: p.percentComplete,
                                        status: "Uploading",
                                        formattedSize: formattedSize,
                                        uploaded: uploaded,
                                        borderClass: "border-warning",
                                        backgroundColor: "#fff9dd",
                                        statusTextColorClass: "text-warning",
                                        progressBarColorClass: "bg-warning"
                                    } : el)
                            }));
                        }
                    });

                    this.setState(prevState => ({
                        selectedFiles: prevState.selectedFiles.map(el => el.id === id ? { ...el, request: q } : el)
                    }));
                })
            );
        });

        this.setState({ uploadStatus: "InProgress" });
        Promise.all(promises).then(() => {
            this.setState({ uploadStatus: "Done" });
            let successCnt = this.state.selectedFiles.filter(x => x.status === "Uploaded").length;
            let totalCnt = this.state.selectedFiles.length;
            if (totalCnt !== successCnt) MessageBoxService.info("Uploaded", "<b>" + successCnt + "</b> of <b>" + totalCnt + "</b> files successfully uploaded to the server.");
            else MessageBoxService.success("Hurray!!", "All the file are successfully uploaded to server.");
        });
    };

    onAbort = (req) => {
        req.abort();
    };

    onRemoveSelectedFile = (file) => {
        this.setState({ selectedFiles: this.state.selectedFiles.filter(item => item.id !== file.id) });
    };

    render = () => {
        return (
            <div className="main-area mt-4">
                <div className="card">
                    <div className="card-body">
                        <BrowseOrDropFiles disabled={this.state.uploadStatus !== "Init"} onFilesSelected={this.onFilesSelected} />
                        {
                            this.state.selectedFiles.length > 0 &&
                            <>
                                <div className="row mt-2">
                                    <div className="col-sm-12">
                                        <div className="btn-group d-flex mb-2" role="group">
                                            <button className="btn btn-primary w-100" disabled={this.state.uploadStatus !== "Init"} onClick={this.onFileUpload}>
                                                {this.state.uploadStatus === "InProgress" && <i className="fas fa-spinner fa-spin"></i>} {this.state.uploadStatus === "InProgress" ? "Uploading " + this.state.selectedFiles.length + " file(s)" : this.state.uploadStatus === "Done" ? "Uploading completed" : this.state.uploadStatus === "Init" ? "Upload " + this.state.selectedFiles.length + " file(s)" : ""}
                                            </button>
                                            <button className="btn btn-danger w-100" disabled={this.state.uploadStatus === "InProgress"} onClick={this.onReset}>
                                                Reset
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <UploadStatusCounts
                                    total={this.state.selectedFiles.length}
                                    uploaded={this.state.selectedFiles.filter(x => x.status === "Uploaded").length}
                                    failed={this.state.selectedFiles.filter(x => x.status === "Failed").length}
                                    aborted={this.state.selectedFiles.filter(x => x.status === "Aborted").length} />
                            </>
                        }
                        {
                            this.state.selectedFiles.length > 0 &&
                            <div className="fileblock-area">
                                {
                                    this.state.selectedFiles.map((e, i) => { return <FileBlock style={{ marginBottom: (i === (this.state.selectedFiles.length - 1)) ? 0 : 0.5 + "rem" }} key={e.id} obj={e} onRemove={this.onRemoveSelectedFile} onAbort={this.onAbort} /> })
                                }
                            </div>
                        }
                    </div>
                </div>
            </div >
        );
    };
}

class BrowseOrDropFiles extends React.Component {
    constructor(props) {
        super(props);
        this.state = { dragging: false };
        this.inputRef = React.createRef();
    }

    onBrowseClick = () => {
        this.inputRef.current.click();
    };

    handleDragEnter = (e) => {
        e.stopPropagation();
        e.preventDefault();
        if (e.dataTransfer.items && e.dataTransfer.items.length > 0)
            this.setState({ dragging: true });
    };

    handleDragLeave = (e) => {
        e.stopPropagation();
        e.preventDefault();
        this.setState({ dragging: false });
    };

    handleDragOver = (e) => {
        e.stopPropagation();
        e.preventDefault();
    };

    handleDrop = (e) => {
        e.stopPropagation();
        e.preventDefault();
        this.setState({ dragging: false });
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0)
            this.onFilesSelected(e.dataTransfer.files);
    };

    onFileChange = event => {
        this.onFilesSelected(event.target.files);
    };

    onFilesSelected = (f) => {
        let files = Array.from(f);
        this.props.onFilesSelected(files);
    };

    render = () => {
        return (
            <div className="row">
                <div className="col-sm-12">
                    <input multiple disabled={this.props.disabled} ref={this.inputRef} style={{ display: "none" }} className="form-control" type="file" onChange={this.onFileChange} />
                    <div className="browse-area" onClick={this.onBrowseClick}>
                        {
                            this.props.disabled && <div className="browse-area-disabled"></div>
                        }
                        {
                            !this.state.dragging &&
                            <div className="text-center browse-text">
                                <i className="fas fa-upload fa-2x"></i>
                                <br />
                                Browse or drag file(s) here to upload
                            </div>
                        }
                        <div className="browse-box"
                            style={{ borderWidth: this.state.dragging ? 2 + "px" : 1 + "px", backgroundColor: this.state.dragging ? "#9cb4cc" : "" }}
                            onDragEnter={this.handleDragEnter}
                            onDragLeave={this.handleDragLeave}
                            onDragOver={this.handleDragOver}
                            onDrop={this.handleDrop}>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

class UploadStatusCounts extends React.Component {
    render = () => {
        return (
            <div className="row">
                <div className="col-sm-12">
                    <div className="main-status-box">
                        <span className="text-info">Total files: <b>{this.props.total}</b></span>&nbsp;|&nbsp;
                        <span className="text-success">Uploaded: <b>{this.props.uploaded}</b></span>&nbsp;|&nbsp;
                        <span className="text-danger">Failed: <b>{this.props.failed}</b></span>&nbsp;|&nbsp;
                        <span className="text-danger">Aborted: <b>{this.props.aborted}</b></span>
                    </div>
                </div>
            </div>
        );
    }
}

class FileBlock extends React.Component {
    render = () => {
        return (
            <div className="row" style={this.props.style}>
                <div className="col-sm-12">
                    <div className={'file-block ' + this.props.obj.borderClass} style={{ background: this.props.obj.backgroundColor }}>
                        {
                            this.props.obj.status === "Ready" &&
                            <div className="file-remove-btn" onClick={() => this.props.onRemove(this.props.obj)}>
                                <i className="fas fa-times-circle"></i>
                            </div>
                        }
                        <div className="row">
                            <div className="col-sm-8">
                                <span className="text-muted" style={{ fontSize: 14, fontWeight: 600 }}>{this.props.obj.name}</span>
                            </div>
                            <div className="col-sm-4 text-end">
                                {this.props.obj.status === "Uploading" && <button type="button" onClick={() => this.props.onAbort(this.props.obj.request)} className="btn btn-sm btn-danger"><i className="fas fa-times-circle"></i>&nbsp;Abort</button>}
                            </div>
                        </div>
                        <div className="row mt-1">
                            <div className="col-sm-12">
                                <div className="progress" style={{ height: 5 }}>
                                    <div className={'progress-bar progress-bar-animated ' + this.props.obj.progressBarColorClass} role="progressbar" style={{ width: this.props.obj.progress + '%' }} aria-valuenow={this.props.obj.progress} aria-valuemin="0" aria-valuemax="100"></div>
                                </div>
                            </div>
                        </div>
                        <div className="row mt-2">
                            <div className="col-sm-6">
                                <span className={this.props.obj.statusTextColorClass} style={{ fontSize: 14, fontWeight: 700 }}>{this.props.obj.status}</span>
                            </div>
                            <div className="col-sm-6 text-end text-muted" style={{ fontSize: 11, fontWeight: 600 }}>
                                {this.props.obj.uploaded} of {this.props.obj.formattedSize}
                            </div>
                        </div>
                        {
                            this.props.obj.status === "Failed" && this.props.obj.response && this.props.obj.response.msg &&
                            <>
                                <div className="row">
                                    <div className="col-sm-12">
                                        <span className={this.props.obj.statusTextColorClass} style={{ fontSize: 12 }}>{this.props.obj.response.msg}</span>
                                    </div>
                                </div>
                            </>
                        }
                    </div>
                </div>
            </div>
        );
    };
}

class FileList extends React.Component {
    constructor() {
        super();
        this.state = {
            data: [],
            isLoading: false
        };
    }

    componentDidMount = () => {
        this.subscription = reloadListRequestObservable.subscribe(() => {
            this.getList();
        });
    }

    componentWillUnmount = () => {
        this.subscription.unsubscribe();
    }

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
                if (res.status !== 604) toast.error("Some error occured while getting list of files.");
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
            responseType: "arraybuffer",
            onSuccess: (res) => {
                var blob = new Blob([res.response], { type: mime.getType(obj.name.split('.').pop().toString().toLowerCase()) });
                var url = URL.createObjectURL(blob);
                var a = document.createElement("a");
                document.body.appendChild(a);
                a.style = "display: none";
                a.href = url;
                a.download = obj.name;
                a.click();
                window.URL.revokeObjectURL(url);
            },
            onError: (res) => {
                if (res && res.status !== 604)
                    toast.error("Some error occured while downloading file.");
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

    deleteFile = obj => {
        MessageBoxService.confirmYesNo("Please confirm", "Are you sure you want to delete file from the server?<br/><small class='text-danger'><i>What's done cannot be undone.</i></small>", () => {
            this.setState(prevState => ({
                data: prevState.data.map(el => el.path === obj.path ? { ...el, isDeleting: true } : el)
            }));
            restRequest({
                url: apiUrlFileDelete,
                data: obj.name,
                method: "DELETE",
                isJson: true,
                onSuccess: (res) => {
                    if (res.status === 200)
                        this.getList();
                },
                onError: (res) => {
                    console.log(res);
                    toast.error("Some error occured while deleting file.");
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
                                <div className="col-sm-10">
                                    <span className="text-muted" style={{ fontSize: 14, fontWeight: 600 }}>{obj.name}</span>
                                    <div className="text-muted" style={{ fontSize: 12 }}><b>Size: </b>{formatBytes(obj.size)}</div>
                                    <div className="text-muted" style={{ fontSize: 12 }}>Created {moment(obj.createdAt).fromNow()}, Last modified {moment(obj.lastModified).fromNow()}</div>
                                </div>
                                <div className="col-sm-2">
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
                        <h5>Previously uploaded files ({this.state.data.length})</h5>
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

class App extends React.Component {
    render = () => {
        return (
            <>
                <div className="container">
                    <div className="row">
                        <div className="col-6 filelist-area">
                            <FileList />
                        </div>
                        <div className="col-6 fileupload-area">
                            <MultipleFileUpload />
                        </div>
                    </div>
                </div>
                <ToastContainer
                    position="top-right"
                    autoClose={5000}
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover />
                <MessageBoxContainer />
            </>
        );
    }
}

ReactDOM.render(<App />, document.getElementById('root'));
