import React, { useEffect, useRef, useState } from 'react';
import { checkEdgeMerged, getLineById, getNodeById } from '../utils';
import './styles.css';

const FORM_INFO = {
    node: {
        title: 'Update Node',
        label: 'Name',
    },
    line: {
        title: 'Update Edge',
        label: 'Weight Value',
    },
};

function UpdateForm(props) {
    const inputRef = useRef(null);
    const { onClose, actionData, onUpdate, nodeList, lineList } = props;
    const type = actionData.node ? 'node' : 'line';

    const [name, setName] = useState(actionData?.node?.properties.name || '');
    const [weight, setWeight] = useState(actionData?.line?.properties.w || '');

    //  ********************************
    const line1 = actionData.line;
    const line2 = getLineById(lineList, line1?.id2, line1?.id1);

    const [bool1, setBool1] = useState(!!line1);
    const [bool2, setBool2] = useState(!!line2);

    const node1 = getNodeById(nodeList, actionData.line?.id1);
    const node2 = getNodeById(nodeList, actionData.line?.id2);

    const [multipleDirect, setMultipleDirect] = useState(
        checkEdgeMerged(lineList, actionData.line),
    );

    //  ********************************

    const handleSubmit = () => {
        const updatedValue = type === 'node' ? name : { direction: [bool1, bool2], weight };
        onUpdate(updatedValue);
        onClose();
    };

    useEffect(() => {
        if (type === 'line') return;

        const handleEnterInput = (e) => {
            if (e.key === 'Enter') handleSubmit();
        };

        inputRef.current.addEventListener('keyup', handleEnterInput);
        return () => {
            inputRef.current?.removeEventListener('keyup', handleEnterInput);
        };
    }, [name]);

    return (
        <div>
            <div className='overlay'></div>
            <div className='form-wrapper'>
                <div className='form-title'>
                    <span className='title'>{FORM_INFO[type].title}</span>
                    <span className='back-icon' onClick={() => onClose()}>
                        X
                    </span>
                </div>
                <div className='form'>
                    <label>{FORM_INFO[type].label}</label>
                    {type === 'node' && (
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            ref={inputRef}
                        />
                    )}
                    {type === 'line' && (
                        <>
                            <input
                                type={'number'}
                                value={weight}
                                onChange={(e) => setWeight(e.target.value)}
                            />
                            {/* <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'flex-end',
                                    gap: '6px',
                                    marginTop: '12px',
                                }}>
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
                            </div> */}

                            {/* <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px' }}>
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
                            </div> */}
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'flex-end',
                                    gap: '6px',
                                    marginTop: '12px',
                                }}>
                                <input
                                    type='checkbox'
                                    id='vehicle2'
                                    name='vehicle2'
                                    checked={multipleDirect}
                                    onChange={() => setMultipleDirect(!multipleDirect)}
                                />
                                <label for='vehicle2'>Undirected</label>
                            </div>
                        </>
                    )}
                </div>

                <div className='button-wrapper'>
                    <button onClick={handleSubmit}>Save</button>
                </div>
            </div>
        </div>
    );
}

export default UpdateForm;
