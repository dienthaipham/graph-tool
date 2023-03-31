import React, { useEffect, useRef, useState } from 'react';
import ActionModal from './components/ActionsModal';
import AddNodeForm from './components/AddNodeForm';
import AddWeightForm from './components/AddWeightForm';
import DetailTooltip from './components/DetailTooltip';
import UpdateForm from './components/UpdateForm';
import { MODES, NODE_RADIUS, SCALE_MULTIPLIER } from './constants';
import { drawFunc } from './draw';
import { Line, Node } from './objects';
import './style.css';
import {
    checkExistEdge,
    checkExistLink,
    compareTwoGraphHistory,
    genGraphObject,
    getDistance,
    getIndexOfLine,
    getIndexOfNode,
    getLineByClick,
    getLineCoordinate,
    getNodeByClick,
    getNodeById,
    randomNodeId,
    unLinkTwoNodes,
} from './utils';
import { graphData } from './mockData';

function GraphTool(props) {
    const canvasWrapperRef = useRef(null);
    const canvasRef = useRef(null);
    const dndRef = useRef({
        mouseDown: false,
        translatePos: { x: 0, y: 0 },
        startDragOffset: {},
    });
    const graphHistoryRef = useRef([]);

    const [mode, setMode] = useState(MODES[0]);
    const [scale, setScale] = useState(1.0);
    const [nodeList, setNodeList] = useState([]);
    const [lineList, setLineList] = useState([]);
    const [selectedNode, setSelectedNode] = useState(null);
    const [selectedLine, setSelectedLine] = useState(null);

    const [formOpen, setFormOpen] = useState({ addWeight: false, addNode: false });
    const [formMetaData, setFormMetaData] = useState({ addWeight: {}, addNode: {} });

    const [actionModalOpen, setActionModalOpen] = useState(false);
    const [actionModalPosition, setActionModalPosition] = useState({ top: '100px', left: '190px' });
    const [actionData, setActionData] = useState({ node: null, line: null });
    const [action, setAction] = useState(null);

    const [hoverNode, setHoverNode] = useState(null);
    const [hoverPosition, setHoverPosition] = useState({ top: '0', left: '0' });

    const handleSwitchMode = (o) => {
        setSelectedNode(null);

        if (o.value === 'UNDO') {
            graphHistoryRef.current = graphHistoryRef.current.slice(0, -1);

            const countActions = graphHistoryRef.current.length;
            setNodeList(graphHistoryRef.current[countActions - 1]?.nodeList || []);
            setLineList(graphHistoryRef.current[countActions - 1]?.lineList || []);

            return;
        } else if (o.value === 'CLEAR') {
            setNodeList([]);
            setLineList([]);
            graphHistoryRef.current.push({ nodeList: [], lineList: [] });
            return;
        }
        setMode(o);
    };

    const handleZoom = (type) => {
        setActionModalOpen(false);
        setActionModalPosition({ top: 0, left: 0 });
        setActionData({ node: null, line: null });

        switch (type) {
            case 'OUT':
                setScale(scale / SCALE_MULTIPLIER);
                break;
            case 'IN':
                setScale(scale * SCALE_MULTIPLIER);
                break;
            case 'CENTER':
                dndRef.current.translatePos = {
                    x: 0,
                    y: 0,
                };
                if (scale == 1)
                    drawFunc(
                        canvasRef.current,
                        scale,
                        dndRef.current.translatePos,
                        nodeList,
                        selectedNode,
                        lineList,
                        selectedLine,
                    );
                else setScale(1);
        }
    };

    const handleAddNode = (name) => {
        const { clickX0, clickY0 } = formMetaData.addNode;

        // Add new node here
        const addNode = new Node(randomNodeId(), clickX0, clickY0, NODE_RADIUS, {
            name,
        });
        const newNodeList = [...nodeList, addNode];
        setNodeList(newNodeList);
        graphHistoryRef.current.push({
            nodeList: newNodeList,
            lineList,
        });
    };

    // add two edges with same weight
    const addMergedLine = (node1, node2, w) => {
        const lineCoordinate1 = getLineCoordinate(node1.x, node1.y, node2.x, node2.y, NODE_RADIUS);
        const lineCoordinate2 = getLineCoordinate(node2.x, node2.y, node1.x, node1.y, NODE_RADIUS);
        let newLineList = [...lineList];
        newLineList = unLinkTwoNodes(newLineList, node1, node2);

        newLineList = [
            ...newLineList,
            new Line(node1.id, node2.id, false, ...Object.values(lineCoordinate1), {
                w,
            }),
            new Line(node2.id, node1.id, false, ...Object.values(lineCoordinate2), {
                w,
            }),
        ];
        setLineList(newLineList);
        graphHistoryRef.current.push({
            nodeList,
            lineList: newLineList,
        });
    };

    const handleAddEdge = (w, multipleDirect) => {
        const { selectedNode, targetNode } = formMetaData.addWeight;

        if (multipleDirect) {
            addMergedLine(selectedNode, targetNode, w);
            setSelectedNode(null);
            return;
        }

        const lineCoordinate = getLineCoordinate(
            selectedNode.x,
            selectedNode.y,
            targetNode.x,
            targetNode.y,
            NODE_RADIUS,
        );

        // Check multiple for a link
        const existLink = checkExistLink(lineList, selectedNode.id, targetNode.id);
        let newLineList = [...lineList];
        let multiple = false;

        if (existLink) {
            const idx = getIndexOfLine(newLineList, targetNode.id, selectedNode.id);
            multiple = w !== newLineList[idx].properties.w;
            newLineList[idx] = { ...lineList[idx], multiple };
        }

        newLineList = [
            ...newLineList,
            new Line(selectedNode.id, targetNode.id, multiple, ...Object.values(lineCoordinate), {
                w,
            }),
        ];
        setLineList(newLineList);
        graphHistoryRef.current.push({
            nodeList,
            lineList: newLineList,
        });

        setSelectedNode(null);
    };

    const removeNode = (node) => {
        if (!node) return;

        const newNodeList = nodeList.filter((n) => n.id !== node.id);
        setNodeList(newNodeList);

        // remove edge that is related of removed node
        const newLineList = lineList.filter((line) => line.id1 !== node.id && line.id2 !== node.id);
        setLineList(newLineList);

        graphHistoryRef.current.push({
            nodeList: newNodeList,
            lineList: newLineList,
        });
    };

    const removeLine = (line) => {
        if (!line) return;

        let newLineList = [...lineList];
        if (line.multiple) {
            const idx = getIndexOfLine(newLineList, line.id2, line.id1);
            newLineList[idx] = { ...lineList[idx], multiple: false };
        }
        newLineList = newLineList.filter(
            (l) =>
                !(l.id1 === line.id1 && l.id2 === line.id2) &&
                !(l.id1 === line.id2 && l.id2 === line.id1),
        );

        setLineList(newLineList);
        graphHistoryRef.current.push({
            nodeList,
            lineList: newLineList,
        });
    };

    const handleChooseAction = (v) => {
        if (v === 'REMOVE') {
            removeNode(actionData.node);
            removeLine(actionData.line);
            return;
        } else if (v === 'CREATE_NODE') {
            setFormOpen({ ...formOpen, addNode: true });
            setFormMetaData({ ...formMetaData, addNode: actionData.position });
            return;
        }
        setAction(v);
    };

    const handleUpdate = (value) => {
        if (actionData.node) {
            let newNodeList = [...nodeList];
            const idx = getIndexOfNode(nodeList, actionData.node.id);
            newNodeList[idx] = { ...nodeList[idx], properties: { name: value } };

            setNodeList(newNodeList);
            graphHistoryRef.current.push({
                nodeList: newNodeList,
                lineList,
            });
        } else if (actionData.line) {
            const { direction, weight } = value;
            const line = actionData.line;

            const node1 = getNodeById(nodeList, line.id1);
            const node2 = getNodeById(nodeList, line.id2);

            if (direction[0] && direction[1]) {
                addMergedLine(node1, node2, weight);
                return;
            }

            let NODE1;
            let NODE2;
            if (direction[0]) {
                NODE1 = node1;
                NODE2 = node2;
            } else if (direction[1]) {
                NODE1 = node2;
                NODE2 = node1;
            }

            const lineCoordinate = getLineCoordinate(
                NODE1.x,
                NODE1.y,
                NODE2.x,
                NODE2.y,
                NODE_RADIUS,
            );

            let newLineList = [...lineList];
            newLineList = unLinkTwoNodes(newLineList, NODE1, NODE2);
            let multiple = false;

            newLineList = [
                ...newLineList,
                new Line(NODE1.id, NODE2.id, multiple, ...Object.values(lineCoordinate), {
                    w: weight,
                }),
            ];
            setLineList(newLineList);
            graphHistoryRef.current.push({
                nodeList,
                lineList: newLineList,
            });
        }
    };

    useEffect(() => {
        drawFunc(
            canvasRef.current,
            scale,
            dndRef.current.translatePos,
            nodeList,
            selectedNode,
            lineList,
            selectedLine,
        );

        const handleMouseMove = (evt) => {
            const clickX =
                evt.pageX - canvasWrapperRef.current.offsetLeft - canvasRef.current.offsetLeft;
            const clickY =
                evt.pageY - canvasWrapperRef.current.offsetTop - canvasRef.current.offsetTop;
            const clickX0 = (clickX - dndRef.current.translatePos.x) / scale;
            const clickY0 = (clickY - dndRef.current.translatePos.y) / scale;

            setHoverNode(null);

            if (dndRef.current.mouseDown) {
                if (selectedNode) {
                    const keepNodes = nodeList.filter((node) => node.id !== selectedNode.id);
                    setNodeList([...keepNodes, { ...selectedNode, x: clickX0, y: clickY0 }]);
                    setSelectedNode({ ...selectedNode, x: clickX0, y: clickY0 });

                    // **********   Move line **************
                    const updatedLines = [];
                    for (const line of lineList) {
                        if (selectedNode.id === line.id1) {
                            const node = getNodeById(nodeList, line.id2);
                            const lineCoordinate = getLineCoordinate(
                                clickX0,
                                clickY0,
                                node.x,
                                node.y,
                                NODE_RADIUS,
                            );
                            updatedLines.push({
                                ...line,
                                ...lineCoordinate,
                            });
                        } else if (selectedNode.id === line.id2) {
                            const node = getNodeById(nodeList, line.id1);
                            const lineCoordinate = getLineCoordinate(
                                node.x,
                                node.y,
                                clickX0,
                                clickY0,
                                NODE_RADIUS,
                            );
                            updatedLines.push({
                                ...line,
                                ...lineCoordinate,
                            });
                        }
                    }

                    const keepLines = lineList.filter(
                        (line) => line.id1 !== selectedNode.id && line.id2 !== selectedNode.id,
                    );
                    setLineList([...keepLines, ...updatedLines]);

                    return;
                }

                dndRef.current.translatePos = {
                    x: evt.clientX - dndRef.current.startDragOffset.x,
                    y: evt.clientY - dndRef.current.startDragOffset.y,
                };

                drawFunc(
                    canvasRef.current,
                    scale,
                    dndRef.current.translatePos,
                    nodeList,
                    selectedNode,
                    lineList,
                    selectedLine,
                );
            } else {
                // ********** Hover node ****************
                const targetNode = getNodeByClick(nodeList, clickX0, clickY0);
                if (!actionModalOpen) {
                    setHoverNode(targetNode);
                    setHoverPosition({
                        top:
                            targetNode?.y * scale +
                            dndRef.current.translatePos.y +
                            canvasRef.current.offsetTop +
                            canvasWrapperRef.current.offsetTop +
                            20,
                        left:
                            targetNode?.x * scale +
                            dndRef.current.translatePos.x +
                            canvasRef.current.offsetLeft +
                            canvasWrapperRef.current.offsetLeft,
                    });
                }
                // ********************************************
            }
        };
        // Put in this useEffect because it depends on scale
        canvasRef.current.addEventListener('mousemove', handleMouseMove);

        // ******************Add event listeners to handle screen drag****************
        const handleMouseDown = (evt) => {
            const clickX =
                evt.pageX - canvasWrapperRef.current.offsetLeft - canvasRef.current.offsetLeft;
            const clickY =
                evt.pageY - canvasWrapperRef.current.offsetTop - canvasRef.current.offsetTop;
            const clickX0 = (clickX - dndRef.current.translatePos.x) / scale;
            const clickY0 = (clickY - dndRef.current.translatePos.y) / scale;

            setActionModalOpen(false);
            setActionData({ node: null, line: null });

            const targetNode = getNodeByClick(nodeList, clickX0, clickY0);
            const targetLine = getLineByClick(lineList, clickX0, clickY0);

            switch (evt.which) {
                case 1:
                    dndRef.current.mouseDown = true;
                    dndRef.current.startDragOffset = {
                        x: evt.clientX - dndRef.current.translatePos.x,
                        y: evt.clientY - dndRef.current.translatePos.y,
                    };

                    if (mode.value === 'ADD_NODE') {
                        for (const node of nodeList) {
                            const distanceToCenter = getDistance(node.x, node.y, clickX0, clickY0);
                            if (distanceToCenter <= node.radius) return;
                        }

                        setFormOpen({ ...formOpen, addNode: true });
                        setFormMetaData({ ...formMetaData, addNode: { clickX0, clickY0 } });

                        return;
                    }

                    setSelectedLine(targetLine);

                    if (!selectedNode) setSelectedNode(targetNode);
                    else {
                        if (targetNode) {
                            // Check when clicking on the same node
                            const distanceToCenter = getDistance(
                                selectedNode.x,
                                selectedNode.y,
                                clickX0,
                                clickY0,
                            );
                            if (distanceToCenter < selectedNode.radius) return;

                            // CHeck same link -> return
                            if (
                                checkExistLink(lineList, selectedNode.id, targetNode.id) ||
                                checkExistEdge(lineList, selectedNode.id, targetNode.id)
                            ) {
                                setSelectedNode(targetNode);
                                return;
                            }

                            setFormOpen({ ...formOpen, addWeight: true });
                            setFormMetaData({
                                ...formMetaData,
                                addWeight: { selectedNode, targetNode },
                            });
                            setHoverNode(false);
                        } else setSelectedNode(null);
                    }

                    break;
                case 3:
                    setActionData({
                        node: targetNode,
                        line: targetLine,
                        position: { clickX0, clickY0 },
                    });

                    setActionModalOpen(true);
                    setActionModalPosition({ top: evt.pageY, left: evt.pageX });
                    setHoverNode(null);

                    break;
            }
        };
        canvasRef.current.addEventListener('mousedown', handleMouseDown);

        const handleMouseUp = (evt) => {
            dndRef.current.mouseDown = false;

            const currentGraph = {
                nodeList,
                lineList,
            };
            const previousHistoryGraph =
                graphHistoryRef.current[graphHistoryRef.current.length - 1];
            if (!compareTwoGraphHistory(currentGraph, previousHistoryGraph)) {
                graphHistoryRef.current.push(currentGraph);
            }
        };
        canvasRef.current.addEventListener('mouseup', handleMouseUp);

        const handleMouseOver = (evt) => (dndRef.current.mouseDown = false);
        canvasRef.current.addEventListener('mouseover', handleMouseOver);

        const handleMouseOut = (evt) => (dndRef.current.mouseDown = false);
        canvasRef.current.addEventListener('mouseout', handleMouseOut);

        const handleContextMenu = (event) => event.preventDefault();
        document.addEventListener('contextmenu', handleContextMenu);

        const handleWheel = (event) => {
            // zoom out
            if (event.deltaY < 0) handleZoom('OUT');
            // zoom in
            else if (event.deltaY > 0) handleZoom('IN');
        };
        canvasRef.current.addEventListener('wheel', handleWheel);

        return () => {
            canvasRef.current.removeEventListener('mousemove', handleMouseMove);
            canvasRef.current.removeEventListener('mousedown', handleMouseDown);
            canvasRef.current.removeEventListener('mouseup', handleMouseUp);
            canvasRef.current.removeEventListener('mouseover', handleMouseOver);
            canvasRef.current.removeEventListener('mouseout', handleMouseOut);
            canvasRef.current.removeEventListener('wheel', handleWheel);
            document.removeEventListener('contextmenu', handleContextMenu);
        };
    }, [scale, mode, nodeList, selectedNode, lineList, selectedLine, actionModalOpen]);

    useEffect(() => {
        const handleResizeScreen = () => {
            if (actionModalOpen) {
                setActionModalOpen(false);
                setActionData({ node: null, line: null });
            }
        };
        window.addEventListener('resize', handleResizeScreen);

        return () => window.removeEventListener('resize', handleResizeScreen);
    }, [actionModalOpen]);

    useEffect(() => {
        const { nodes, lines } = genGraphObject(graphData);
        setNodeList(nodes);
        setLineList(lines);
    }, []);

    return (
        <div id='wrapper'>
            {hoverNode && <DetailTooltip node={hoverNode} position={hoverPosition} />}
            {formOpen.addNode && (
                <AddNodeForm
                    onClose={() => setFormOpen({ ...formOpen, addNode: false })}
                    onSubmit={handleAddNode}
                />
            )}
            {formOpen.addWeight && (
                <AddWeightForm
                    addWeightMetaData={formMetaData.addWeight}
                    onClose={() => setFormOpen({ ...formOpen, addWeight: false })}
                    onSubmit={handleAddEdge}
                />
            )}

            {actionModalOpen && (
                <ActionModal
                    styles={actionModalPosition}
                    actionData={actionData}
                    onCloseActionModal={() => setActionModalOpen(false)}
                    onChangeAction={handleChooseAction}
                />
            )}

            {action === 'UPDATE' && (
                <UpdateForm
                    onClose={() => (setAction(null), setActionData({ node: null, line: null }))}
                    actionData={actionData}
                    nodeList={nodeList}
                    lineList={lineList}
                    onUpdate={handleUpdate}
                />
            )}

            <ul className='mode-tabs'>
                {MODES.map((o) => (
                    <li
                        className={`tab${o.value === mode.value ? ' selected' : ''}`}
                        key={o.value}
                        onClick={() => handleSwitchMode(o)}>
                        {o.label}
                    </li>
                ))}
            </ul>
            <div id='canvas-wrapper' ref={canvasWrapperRef}>
                <canvas id='myCanvas' width='720' height='720' ref={canvasRef}></canvas>
                <div id='buttonWrapper'>
                    <input type='button' id='plus' value='+' onClick={() => handleZoom('OUT')} />
                    <input type='button' id='minus' value='-' onClick={() => handleZoom('IN')} />
                    <input
                        type='button'
                        id='reset'
                        value='reset'
                        onClick={() => handleZoom('CENTER')}
                    />
                </div>
            </div>
        </div>
    );
}

export default GraphTool;
