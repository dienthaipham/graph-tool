import React from 'react';

function DetailTooltip(props) {
    const { node, position } = props;
    return (
        <div className='detail-tooltip' style={position}>
            <div>Details</div>
            <hr></hr>
            <div>Name: {node.properties.name}</div>
        </div>
    );
}

export default DetailTooltip;
