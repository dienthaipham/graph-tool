import React, { useState } from 'react';
import { getLineById, getNodeById } from '../utils';

function ConfirmDelete(props) {
    const { onClose, actionData, nodeList, lineList, onDelete } = props;

    // const line1 = actionData.line;
    // const line2 = getLineById(lineList, line1.id2, line1.id1);

    const [bool1, setBool1] = useState(true);
    const [bool2, setBool2] = useState(false);

    const node1 = getNodeById(nodeList, actionData.line.id1);
    const node2 = getNodeById(nodeList, actionData.line.id2);

    const handleSubmit = () => {
        const checkedValues = [bool1, bool2];
        onDelete(checkedValues);
        onClose();
    };

    return (
        <div>
            <div className='overlay'></div>
            <div className='form-wrapper'>
                <div className='form-title'>
                    <span className='title'>Edge selection</span>
                    <span className='back-icon' onClick={() => onClose()}>
                        X
                    </span>
                </div>
                <div className='form'>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px' }}>
                        <input
                            type='checkbox'
                            id='vehicle1'
                            name='vehicle1'
                            checked={bool1}
                            onChange={() => setBool1(!bool1)}
                        />
                        <label for='vehicle1'>
                            Edge from {node1.properties.name} to {node2.properties.name}
                        </label>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px' }}>
                        <input
                            type='checkbox'
                            id='vehicle2'
                            name='vehicle2'
                            checked={bool2}
                            onChange={() => setBool2(!bool2)}
                        />
                        <label for='vehicle2'>
                            Edge from {node2.properties.name} to {node1.properties.name}
                        </label>
                    </div>
                </div>

                <div className='button-wrapper'>
                    <button onClick={handleSubmit}>Save</button>
                </div>
            </div>
        </div>
    );
}

export default ConfirmDelete;
