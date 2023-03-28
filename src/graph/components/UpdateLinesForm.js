import React, { useState } from 'react';
import { getLineById, getNodeById } from '../utils';

function UpdateLinesForm(props) {
    const { onClose, actionData, nodeList, lineList, onUpdate } = props;

    const line1 = actionData.line;
    const line2 = getLineById(lineList, line1.id2, line1.id1);

    const [w1, setW1] = useState(line1.properties.w);
    const [w2, setW2] = useState(line2.properties.w);

    const node1 = getNodeById(nodeList, actionData.line.id1);
    const node2 = getNodeById(nodeList, actionData.line.id2);

    const handleSubmit = () => {
        const updatedValue = [w1, w2];
        onUpdate(updatedValue);
        onClose();
    };

    return (
        <div>
            <div className='overlay'></div>
            <div className='form-wrapper'>
                <div className='form-title'>
                    <span className='title'>Update edges</span>
                    <span className='back-icon' onClick={() => onClose()}>
                        X
                    </span>
                </div>
                <div className='form'>
                    <label>
                        Edge from {node1.properties.name} to {node2.properties.name}{' '}
                    </label>
                    <input type={'number'} value={w1} onChange={(e) => setW1(e.target.value)} />

                    <label>
                        Edge from {node2.properties.name} to {node1.properties.name}{' '}
                    </label>
                    <input type={'number'} value={w2} onChange={(e) => setW2(e.target.value)} />
                </div>

                <div className='button-wrapper'>
                    <button onClick={handleSubmit}>Save</button>
                </div>
            </div>
        </div>
    );
}

export default UpdateLinesForm;
