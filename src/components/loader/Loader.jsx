import './Loader.scss';
import React from 'react'
import { Spin } from 'antd';
import './Loader.scss';

export const Loader = (props) => {
    return(
        props.isLoading &&
        <div className="spin-div-backdrop">
            <div className="spin-div-styles"><Spin size="large"/></div>
        </div>
    )
}

export default Loader