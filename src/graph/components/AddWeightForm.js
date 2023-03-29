import React, { useState } from 'react';
import './styles.css';

function AddWeightForm(props) {
    const { onClose, onSubmit } = props;
    const [weight, setWeight] = useState('1');
    const [multipleDirect, setMultipleDirect] = useState(false);

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

                    <div>
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
                    </div>
                </div>

                <div className='button-wrapper'>
                    <button
                        onClick={() => {
                            onSubmit(weight, multipleDirect);
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
