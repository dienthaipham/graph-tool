import React, { useEffect, useRef, useState } from 'react';
import './styles.css';

// Refactor: merge add w and add to 1 component
function AddNodeForm(props) {
    const inputRef = useRef(null);
    const { onClose, onSubmit } = props;
    const [name, setName] = useState('');

    useEffect(() => {
        const handleEnterInput = (e) => {
            if (e.key === 'Enter') {
                // console.log({ name });
                onSubmit(name);
                onClose();
            }
        };
        // console.log(inputRef.current);
        // inputRef.current.focus();
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
                    <span className='title'>Add Node</span>
                    <span className='back-icon' onClick={() => onClose()}>
                        X
                    </span>
                </div>
                <div className='form'>
                    <label>Name</label>
                    <input value={name} onChange={(e) => setName(e.target.value)} ref={inputRef} />
                </div>

                <div className='button-wrapper'>
                    <button
                        onClick={() => {
                            onSubmit(name);
                            onClose();
                            // inputRef.current.focus();
                        }}>
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
}

export default AddNodeForm;
