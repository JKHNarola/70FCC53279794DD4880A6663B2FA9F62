import React from 'react';

class PageLayout extends React.Component {
    render = () => {
        const content =
            <div className="container page-area p-3">
                <div className="row">
                    <div className="col-sm-12">
                        {this.props.children}
                    </div>
                </div>
            </div>
        return content;
    };
}

export default PageLayout;
