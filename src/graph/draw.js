import {
    ARROW_COLOR,
    ARROW_RADIUS,
    LINE_COLOR,
    LINE_COLOR_SELECTED,
    NODE_COLOR,
    NODE_COLOR_SELECTED,
    NODE_NAME_COLOR,
    NODE_NAME_FONT,
    NODE_RADIUS,
    WEIGHT_COLOR,
    WEIGHT_COLOR_SELECTED,
    WEIGHT_FONT,
    WEIGHT_FONT_SELECTED,
} from './constants';
import { findTwoCenter } from './utils';

export function drawNode({ context, nodeObject, isSelected }) {
    const { x, y, radius, properties } = nodeObject;

    context.beginPath();
    context.arc(x, y, radius, 0, 2 * Math.PI);
    context.fillStyle = isSelected ? NODE_COLOR_SELECTED : NODE_COLOR;
    context.fill();
    context.strokeStyle = 'transparent';
    context.stroke();
    context.closePath();

    // ****** draw node name ********
    context.beginPath();
    context.fillStyle = NODE_NAME_COLOR;
    context.font = NODE_NAME_FONT;
    context.fillText(properties.name, x - NODE_RADIUS / 2, y + NODE_RADIUS / 4);
    context.closePath();
}

// 1 -> 2
function canvasArrow(context, x1, y1, x2, y2, r, isSelected) {
    // *************** extra step to move the end point of arrow *******************
    const a = (y2 - y1) / (x2 - x1);
    const b = y1 - a * x1;
    const a1 = a ** 2 + 1;
    const b1 = 2 * (a * b - x2 - y2 * a);
    const c1 = b ** 2 - 2 * y2 * b + x2 ** 2 + y2 ** 2 - NODE_RADIUS ** 2;
    const delta = b1 ** 2 - 4 * a1 * c1;
    const X1 = (-b1 + Math.sqrt(delta)) / (2 * a1);
    const X2 = (-b1 - Math.sqrt(delta)) / (2 * a1);

    let x2_new;
    if (X1 < Math.max(x1, x2) && X1 > Math.min(x1, x2)) {
        x2_new = X1;
    } else x2_new = X2;
    const y2_new = a * x2_new + b;
    // *****************************************************************************

    var x_center = x2_new;
    var y_center = y2_new;

    var angle;
    var x;
    var y;

    const k1 = 1.5;
    const k2 = 0.5;

    context.beginPath();
    context.fillStyle = isSelected ? LINE_COLOR_SELECTED : ARROW_COLOR;

    angle = Math.atan2(y2_new - y1, x2_new - x1);
    x = r * Math.cos(angle) * k1 + x_center;
    y = r * Math.sin(angle) * k1 + y_center;

    context.moveTo(x, y);

    angle += (1 / 3) * (2 * Math.PI);
    x = r * Math.cos(angle) * k2 + x_center;
    y = r * Math.sin(angle) * k2 + y_center;

    context.lineTo(x, y);

    angle += (1 / 3) * (2 * Math.PI);
    x = r * Math.cos(angle) * k2 + x_center;
    y = r * Math.sin(angle) * k2 + y_center;

    context.lineTo(x, y);

    context.closePath();

    context.fill();
}

export function drawLine({ context, lineObject, isSelected }) {
    const { x1, y1, x2, y2, properties } = lineObject;

    context.beginPath();

    context.strokeStyle = isSelected ? LINE_COLOR_SELECTED : LINE_COLOR;
    context.lineWidth = 2;

    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    context.stroke();

    context.closePath();

    // ************** draw arrow ******************
    canvasArrow(context, x1, y1, x2, y2, ARROW_RADIUS, isSelected);
    // ***********************************************

    // ************** draw weight ******************
    const xI = (x1 + x2) / 2 + (isSelected ? 5 : 0);
    const yI = (y1 + y2) / 2;
    context.beginPath();
    context.fillStyle = isSelected ? WEIGHT_COLOR_SELECTED : WEIGHT_COLOR;
    context.font = isSelected ? WEIGHT_FONT_SELECTED : WEIGHT_FONT;
    context.fillText(properties.w, xI, yI);
    context.closePath();
    // ***********************************************
}

export function drawArcLine({ context, lineObject, isSelected }) {
    let { x1, y1, x2, y2, properties } = lineObject;

    const { x, y } = findTwoCenter(x1, y1, x2, y2)[x1 > x2 ? 0 : 1];

    if (x2 === x1) x2 = x1 + 0.0128372163621732135945;
    if (y2 === y1) y2 = y1 + 0.0782376782364213821893;

    let startX;
    let startY;
    let endX;
    let endY;
    if (x1 < x2) {
        startX = x1;
        startY = y1;
        endX = x2;
        endY = y2;
    } else {
        startX = x2;
        startY = y2;
        endX = x1;
        endY = y1;
    }

    const delta = y - ((y2 - y1) / (x2 - x1)) * (x - x1) - y1;
    let counterClockwise = false;
    if (delta < 0) counterClockwise = true;

    const diffX = startX - x;
    const diffY = startY - y;
    const radius = Math.abs(Math.sqrt(diffX * diffX + diffY * diffY));
    let startAngle = Math.atan2(diffY, diffX);
    let endAngle = Math.atan2(endY - y, endX - x);

    context.beginPath();
    context.arc(x, y, radius, startAngle, endAngle, counterClockwise);
    context.lineWidth = 2;
    context.strokeStyle = isSelected ? LINE_COLOR_SELECTED : LINE_COLOR;
    context.stroke();

    // ************** draw arrow ********************
    const a1 = (y2 - y) / (x2 - x);
    const b1 = y1 - a1 * x1;
    const a2 = -1 / a1;
    const b2 = y2 - x2 * a2;

    const startArrowX = -(b2 - b1) / (a2 - a1);
    const startArrowY = a1 * startArrowX + b1;
    canvasArrow(context, startArrowX, startArrowY, x2, y2, ARROW_RADIUS, isSelected);
    // ***********************************************

    // ************** draw weight ******************
    const R_square = (x1 - x) ** 2 + (y1 - y) ** 2;
    const xI = (x1 + x2) / 2;
    const yI = (y1 + y2) / 2;
    const a = (yI - y) / (xI - x);
    const b = y - a * x;
    const A = a ** 2 + 1;
    const B = 2 * (a * b - x - y * a);
    const C = b ** 2 - 2 * y * b + x ** 2 + y ** 2 - R_square;
    const del = B ** 2 - 4 * A * C;

    const X1 = (-B + Math.sqrt(del)) / (2 * A);
    const Y1 = X1 * a + b;
    const d1 = Math.sqrt((X1 - xI) ** 2 + (Y1 - yI) ** 2);
    const X2 = (-B - Math.sqrt(del)) / (2 * A);
    const Y2 = X2 * a + b;
    const d2 = Math.sqrt((X2 - xI) ** 2 + (Y2 - yI) ** 2);

    const x_text = (d1 < d2 ? X1 : X2) + (isSelected ? 5 : 0);
    const y_text = d1 < d2 ? Y1 : Y2;

    context.beginPath();
    context.fillStyle = isSelected ? WEIGHT_COLOR_SELECTED : WEIGHT_COLOR;
    context.font = isSelected ? WEIGHT_FONT_SELECTED : WEIGHT_FONT;
    context.fillText(properties.w, x_text, y_text);
    context.closePath();
    // ***********************************************
}

export function drawFunc(
    canvasElement,
    scale,
    translatePos,
    nodeList,
    selectedNode,
    lineList,
    selectedLine,
) {
    var context = canvasElement.getContext('2d');

    // clear canvas
    context.clearRect(0, 0, canvasElement.width, canvasElement.height);

    context.save();
    context.translate(translatePos.x, translatePos.y);
    context.scale(scale, scale);

    for (const line of lineList) {
        if (line.multiple)
            drawArcLine({
                context,
                lineObject: line,
                isSelected: line.id1 === selectedLine?.id1 && line.id2 === selectedLine?.id2,
            });
        else
            drawLine({
                context,
                lineObject: line,
                isSelected:
                    (line.id1 === selectedLine?.id1 && line.id2 === selectedLine?.id2) ||
                    (line.id1 === selectedLine?.id2 && line.id2 === selectedLine?.id1),
            });
    }
    for (const node of nodeList)
        drawNode({ context, nodeObject: node, isSelected: node.id === selectedNode?.id });

    context.restore();
}
