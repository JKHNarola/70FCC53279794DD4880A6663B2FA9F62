import React from 'react';

class NotFoundPage extends React.Component {

    render = () => {
        return <div className="container">
            <div className="row">
                <div className="col-sm-6 not-found">
                    <div className="card">
                        <div className="card-body text-center">
                            <div className="text-danger" style={{ fontSize: "60px" }}>
                                <i className="fas fa-exclamation-triangle"></i>
                            </div>
                            <h1 className="text-warning" style={{ fontSize: "130px", fontWeight: "700", margin: 0, padding: 0 }}>404</h1>
                            <div className="text-danger">Page you are looking for is not found!!</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>;
    };
}

export default NotFoundPage;
