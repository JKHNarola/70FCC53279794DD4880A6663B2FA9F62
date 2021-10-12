import React from 'react';

export class FileBlock extends React.Component {
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
                            <div className="col-sm-4 text-right">
                                {this.props.obj.status === "Uploading" && <button type="button" onClick={() => this.props.onAbort(this.props.obj.request)} className="btn btn-sm btn-danger"><i className="fas fa-times-circle"></i>&nbsp;Abort</button>}
                            </div>
                        </div>
                        <div className="row mt-1">
                            <div className="col-sm-12">
                                <div className="progress" style={{ height: 5 }}>
                                    <div className={'progress-bar ' + this.props.obj.progressBarColorClass} role="progressbar" style={{ width: this.props.obj.progress + '%' }} aria-valuenow={this.props.obj.progress} aria-valuemin="0" aria-valuemax="100"></div>
                                </div>
                            </div>
                        </div>
                        <div className="row mt-2">
                            <div className="col-sm-6">
                                <span className={this.props.obj.statusTextColorClass} style={{ fontSize: 14, fontWeight: 700 }}>{this.props.obj.status}</span>
                            </div>
                            <div className="col-sm-6 text-right text-muted" style={{ fontSize: 11, fontWeight: 600 }}>
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

