const MODES = [
    // { value: 'DEFAULT', label: 'Selection' },
    // { value: 'ADD_NODE', label: 'Add node' },
    // { value: 'ADD_EDGE', label: 'Add edge' },
    // { value: 'REMOVE_OBJECT', label: 'Remove object' },
    { value: 'UNDO', label: 'Undo' },
    { value: 'CLEAR', label: 'Clear' },
    { value: 'EXTRACT', label: 'Extract' },
];

// ************** Node style ************************************
const NODE_RADIUS = 20; //radius of node
const NODE_COLOR = 'rgba(217, 217, 217, 0.35)';
const NODE_COLOR_SELECTED = 'rgba(217, 217, 217, 1)';
const NODE_STROKE_COLOR = 'blue';
const NODE_NAME_COLOR = '#000';
const NODE_NAME_FONT = '12px Arial';
// **************************************************************

// ************** Arrow of line style ***************************
const LINE_COLOR = '#03A9F4';
const LINE_COLOR_SELECTED = 'blue';
const WEIGHT_COLOR = '#000';
const WEIGHT_COLOR_SELECTED = 'blue';
const WEIGHT_FONT = '12px Arial';
const WEIGHT_FONT_SELECTED = 'bold 14px Arial';
// **************************************************************

// ************** Arrow of line style ***************************
const ARROW_COLOR = '#0072C3';
const ARROW_RADIUS = 10; // big arrow or small arrow
// **************************************************************

// ***************** Contants used to computation ***************
const D_MAX = 5; // dmax to validate click straight line action
const DELTA_R_MAX = 5; // Rmax to validate click arc line action
const K = 2; // determine the R of circle when draw arc line
const SCALE_MULTIPLIER = 0.8;
// **************************************************************

export {
    MODES,
    NODE_RADIUS,
    NODE_COLOR,
    NODE_COLOR_SELECTED,
    NODE_STROKE_COLOR,
    NODE_NAME_COLOR,
    NODE_NAME_FONT,
    LINE_COLOR,
    LINE_COLOR_SELECTED,
    WEIGHT_COLOR,
    WEIGHT_COLOR_SELECTED,
    WEIGHT_FONT,
    WEIGHT_FONT_SELECTED,
    ARROW_COLOR,
    ARROW_RADIUS,
    D_MAX,
    DELTA_R_MAX,
    K,
    SCALE_MULTIPLIER,
};
