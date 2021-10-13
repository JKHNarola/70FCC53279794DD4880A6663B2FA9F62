import React from 'react';
import MultipleFileUpload from './multiple-file-upload.component';
import FileList from './filelist.component';
import AuthService from '../../common/auth-service';

class FileUploaderPage extends React.Component {
    constructor(props) {
        super(props);
        this.isLoggedIn = AuthService.isUserLoggedIn();
    }

    render = () => {
        const content = <>
            {
                this.isLoggedIn &&
                <div className="row">
                    <div className="col-md-6 fileupload-area">
                        <MultipleFileUpload />
                    </div>
                    <div className="col-md-6 filelist-area">
                        <FileList />
                    </div>
                </div>
            }
        </>
        return content;
    };
}

export default FileUploaderPage;
