import React from 'react';

export class UploadStatusCounts extends React.Component {
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

