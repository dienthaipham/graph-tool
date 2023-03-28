import { D_MAX, DELTA_R_MAX, K } from './constants';

export function getDistance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
}

function shortestDistance(x, y, x1, y1, x2, y2) {
    var A = x - x1;
    var B = y - y1;
    var C = x2 - x1;
    var D = y2 - y1;

    var dot = A * C + B * D;
    var len_sq = C * C + D * D;
    var param = -1;
    if (len_sq != 0)
        //in case of 0 length line
        param = dot / len_sq;

    var xx, yy;

    if (param < 0) {
        xx = x1;
        yy = y1;
    } else if (param > 1) {
        xx = x2;
        yy = y2;
    } else {
        xx = x1 + param * C;
        yy = y1 + param * D;
    }

    var dx = x - xx;
    var dy = y - yy;
    return Math.sqrt(dx * dx + dy * dy);
}

export function validClickLine(x, y, lineObject) {
    const { x1, y1, x2, y2 } = lineObject;
    const d = shortestDistance(x, y, x1, y1, x2, y2);
    return d < D_MAX;
}

export function findTwoCenter(x1, y1, x2, y2) {
    // prevent divided by 0
    x2 = x2 + 0.0636478263216342672131;
    y2 = y2 + 0.07816782637825326282721;

    const c1 = x2 ** 2 - x1 ** 2 + y2 ** 2 - y1 ** 2;
    const c2 = (x2 - x1) / (y1 - y2);
    const c3 = c1 / (2 * (y1 - y2));
    const c4 = 1 + c2 ** 2;
    const c5 = -(2 * x1 + 2 * c2 * c3 + 2 * c2 * y1);
    const c6 =
        x1 ** 2 + c3 ** 2 + 2 * c3 * y1 + y1 ** 2 - K ** 2 * ((x1 - x2) ** 2 + (y1 - y2) ** 2);
    const delta = c5 ** 2 - 4 * c4 * c6;

    const X1 = (-c5 - Math.sqrt(delta)) / (2 * c4);
    const Y1 = c2 * X1 - c3;

    const X2 = (-c5 + Math.sqrt(delta)) / (2 * c4);
    const Y2 = c2 * X2 - c3;

    return [
        { x: X1, y: Y1 },
        { x: X2, y: Y2 },
    ];
}

export function validClickArcLine(x, y, lineObject) {
    let { x1, y1, x2, y2 } = lineObject;
    if (x2 === x1) x2 = x1 + 0.0128372163621732135945;
    if (y2 === y1) y2 = y1 + 0.0782376782364213821893;

    const { x: centerX, y: centerY } = findTwoCenter(x1, y1, x2, y2)[x1 > x2 ? 0 : 1];
    const R = Math.sqrt((x1 - centerX) ** 2 + (y1 - centerY) ** 2);
    const d = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);

    const xI = (x1 + x2) / 2;
    const yI = (y1 + y2) / 2;
    const f1 = (xi, yi) => {
        return ((y1 - centerY) / (x1 - centerX)) * (xi - centerX) + centerY - yi;
    };
    const f2 = (xj, yj) => {
        return ((y2 - centerY) / (x2 - centerX)) * (xj - centerX) + centerY - yj;
    };

    const boundedCondition = f1(x, y) * f1(xI, yI) > 0 && f2(x, y) * f2(xI, yI) > 0;
    if (Math.abs(d - R) < DELTA_R_MAX && boundedCondition) return true;

    return false;
}

export function getLineCoordinate(x1, y1, x2, y2, r) {
    if (x2 === x1) x2 = x1 + 0.0128372163621732135945;
    if (y2 === y1) y2 = y1 + 0.0782376782364213821893;

    const a = (y2 - y1) / (x2 - x1);
    const b = y1 - a * x1;

    const c01 = r ** 2 - (x1 ** 2 + y1 ** 2);
    const a1 = 1 + a ** 2;
    const b1 = 2 * (a * b - x1 - y1 * a);
    const c1 = b ** 2 - c01 - 2 * y1 * b;
    const delta1 = b1 ** 2 - 4 * a1 * c1;
    const X1 = (-b1 + Math.sqrt(delta1)) / (2 * a1);
    const X2 = (-b1 - Math.sqrt(delta1)) / (2 * a1);

    const c02 = r ** 2 - (x2 ** 2 + y2 ** 2);
    const a2 = 1 + a ** 2;
    const b2 = 2 * (a * b - x2 - y2 * a);
    const c2 = b ** 2 - c02 - 2 * y2 * b;
    const delta2 = b2 ** 2 - 4 * a2 * c2;
    const X3 = (-b2 + Math.sqrt(delta2)) / (2 * a2);
    const X4 = (-b2 - Math.sqrt(delta2)) / (2 * a2);

    const sortedList = [X1, X2, X3, X4].sort(function (a, b) {
        return a - b;
    });

    let final_X1;
    let final_X2;
    if (Math.abs(x1 - sortedList[1]) < Math.abs(x2 - sortedList[1])) {
        final_X1 = sortedList[1];
        final_X2 = sortedList[2];
    } else {
        final_X1 = sortedList[2];
        final_X2 = sortedList[1];
    }

    const final_Y1 = a * final_X1 + b;
    const final_Y2 = a * final_X2 + b;

    return {
        x1: final_X1,
        y1: final_Y1,
        x2: final_X2,
        y2: final_Y2,
    };
}

export function getNodeById(nodeList, id) {
    return nodeList.filter((node) => node.id === id)[0];
}

export function checkExistEdge(lineList, id1, id2) {
    return lineList.some((line) => line.id1 === id1 && line.id2 === id2);
}

export function checkExistLink(lineList, id1, id2) {
    return lineList.some((line) => line.id1 === id2 && line.id2 === id1);
}

export function randomNodeId() {
    return Math.round(Math.random() * 10000000000);
}

export function compareTwoGraphHistory(graph1, graph2) {
    return JSON.stringify(graph1) === JSON.stringify(graph2);
}

export function getNodeByClick(nodeList, clickX0, clickY0) {
    for (const node of nodeList) {
        const distanceToCenter = getDistance(node.x, node.y, clickX0, clickY0);

        if (distanceToCenter <= node.radius) {
            return node;
        }
    }
    return null;
}

export function getLineByClick(lineList, clickX0, clickY0) {
    for (const line of lineList) {
        const isClick = line.multiple
            ? validClickArcLine(clickX0, clickY0, line)
            : validClickLine(clickX0, clickY0, line);
        if (isClick) return line;
    }
    return null;
}

export function getIndexOfLine(lineList, id1, id2) {
    return lineList.findIndex((line) => {
        return line.id1 === id1 && line.id2 === id2;
    });
}

export function getIndexOfNode(nodeList, id) {
    return nodeList.findIndex((node) => {
        return node.id === id;
    });
}
