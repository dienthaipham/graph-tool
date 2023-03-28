import React, { useEffect, useRef, useState } from 'react';
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
    const { onClose, actionData, onUpdate } = props;
    const type = actionData.node ? 'node' : 'line';

    const [name, setName] = useState(actionData?.node?.properties.name || '');
    const [weight, setWeight] = useState(actionData?.line?.properties.w || '');

    const handleSubmit = () => {
        const updatedValue = type === 'node' ? name : weight;
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
                        <input
                            type={'number'}
                            value={weight}
                            onChange={(e) => setWeight(e.target.value)}
                        />
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
