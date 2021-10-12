import './polyfills.js';
import "animate.css";
import React from 'react';
import ReactDOM from 'react-dom';
import { MessageBoxContainer } from './common/messagebox.js';
import { ToastNotificationContainer } from './common/toastnotification.js';
import { MultipleFileUpload } from './fileuploader/multiple-file-upload.component.js';
import { FileList } from './fileuploader/filelist.component.js';

class App extends React.Component {
    render = () => {
        return (
            <>
                <div className="container">
                    <div className="row">
                        <div className="col-md-6 fileupload-area">
                            <MultipleFileUpload />
                        </div>
                        <div className="col-md-6 filelist-area">
                            <FileList />
                        </div>
                    </div>
                </div>
                <ToastNotificationContainer position="tr" />
                <MessageBoxContainer />
            </>
        );
    }
}

ReactDOM.render(<App />, document.getElementById('root'));
