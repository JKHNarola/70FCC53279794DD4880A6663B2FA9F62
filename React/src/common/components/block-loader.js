import React from 'react';

class BlockLoader extends React.Component {
    render = () => {
        const content =
            <div className="block-loader-backdrop" style={{ visibility: this.props.isShow ? "visible" : "hidden", opacity: this.props.isShow ? 1 : 0, backgroundColor: this.props.isBackDropVisible === false ? "rgba(0, 0, 0, 0)" : "rgba(255, 255, 255, 0.80)" }}>
                <div className="loader">
                    <div className="lds-dual-ring">
                        <div className="lds-dual-ring-inside"></div>
                    </div>
                </div>
            </div>
        return content;
    };
}

export default BlockLoader;
