import React from 'react';

export class BrowseOrDropFiles extends React.Component {
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
