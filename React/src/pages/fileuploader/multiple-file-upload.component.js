import React from 'react';
import restRequest from '../../common/RESTRequest';
import { v1 as uuidv1 } from 'uuid';
import ToastNotification from '../../common/components/toastnotification.js';
import { apiUrlFileUpload } from '../../common/app-consts';
import { formatBytes } from '../../common/utils';
import { createReloadListRequest } from '../../common/service';
import UploadStatusCounts from './upload-status-counts.component';
import FileBlock from './fileblock.component';
import BrowseOrDropFiles from './browse-or-drop-files.component';

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
            if (totalCnt !== successCnt) ToastNotification.info("<b>" + successCnt + "</b> of <b>" + totalCnt + "</b> files successfully uploaded to the server.");
            else if (successCnt === 0) ToastNotification.error("All the files failed to upload.");
            else ToastNotification.success("All the file are successfully uploaded to server.", null, 5000);
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
            <div className="main-area">
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

export default MultipleFileUpload;
