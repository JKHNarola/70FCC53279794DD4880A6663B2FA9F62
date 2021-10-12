import React from 'react';

class NotFoundPageComponent extends React.Component {

    render = () => {
        return <div className="container">
            <div className="row">
                <div className="col-sm-6 not-found">
                    <div className="card mt-4">
                        <div className="card-body text-center">
                            <div className="text-danger" style={{ fontSize: "80px" }}>
                                <i classNames="fas fa-exclamation-triangle"></i>
                            </div>
                            <h1 className="text-warning" style={{ fontSize: "100px" }}>404</h1>
                            <div className="text-danger">Page you are looking for is not found!!</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>;
    };
}

export default NotFoundPageComponent;
