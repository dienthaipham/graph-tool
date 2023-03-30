import React, { useEffect } from 'react';
import './styles.css';

const NODE_ACTIONS = [
    {
        value: 'UPDATE',
        label: 'Update Node',
    },
    {
        value: 'REMOVE',
        label: 'Remove Node',
    },
];

const EDGE_ACTIONS = [
    {
        value: 'UPDATE',
        label: 'Update Edge',
    },
    {
        value: 'REMOVE',
        label: 'Remove Edge',
    },
];

const CREATE_NODE_ACTIONS = [
    {
        value: 'CREATE_NODE',
        label: 'Create Node',
    },
];

function ActionModal(props) {
    const { styles, actionData, onCloseActionModal, onChangeAction } = props;
    const options = actionData.node
        ? NODE_ACTIONS
        : actionData.line
        ? EDGE_ACTIONS
        : CREATE_NODE_ACTIONS;
    useEffect(() => {}, []);

    const handleChooseAction = (v) => {
        onChangeAction(v);
        onCloseActionModal();
    };

    return (
        <div className='options-modal' style={styles}>
            <ul className='options-list'>
                {options.map((o) => (
                    <li
                        className='option'
                        key={o.value}
                        onClick={() => handleChooseAction(o.value)}>
                        {o.label}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default ActionModal;
