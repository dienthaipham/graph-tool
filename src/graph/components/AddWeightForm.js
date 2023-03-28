import React, { useState } from 'react';
import './styles.css';

function AddWeightForm(props) {
    const { onClose, onSubmit } = props;
    const [weight, setWeight] = useState('1');

    return (
        <div>
            <div className='overlay'></div>
            <div className='form-wrapper'>
                <div className='form-title'>
                    <span className='title'>Add Weight</span>
                    <span className='back-icon' onClick={() => onClose()}>
                        X
                    </span>
                </div>
                <div className='form'>
                    <label>Weight value</label>
                    <input
                        type={'number'}
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                    />
                </div>

                <div className='button-wrapper'>
                    <button
                        onClick={() => {
                            onSubmit(weight);
                            onClose();
                        }}>
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
}

export default AddWeightForm;
