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
    getDistance,
    getIndexOfLine,
    getIndexOfNode,
    getLineByClick,
    getLineCoordinate,
    getNodeByClick,
    getNodeById,
    randomNodeId,
} from './utils';

function GraphTool(props) {
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
            console.log('graphHistoryREf: ', graphHistoryRef.current);

            graphHistoryRef.current = graphHistoryRef.current.slice(0, -1);

            const countActions = graphHistoryRef.current.length;
            setNodeList(graphHistoryRef.current[countActions - 1]?.nodeList || []);
            setLineList(graphHistoryRef.current[countActions - 1]?.lineList || []);

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

    const handleAddEdge = (w) => {
        const { selectedNode, targetNode } = formMetaData.addWeight;

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
        newLineList = newLineList.filter((l) => !(l.id1 === line.id1 && l.id2 === line.id2));

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
            const updateLine = actionData.line;
            let newLineList = [...lineList];
            const idx1 = getIndexOfLine(lineList, updateLine.id1, updateLine.id2);
            const idx2 = getIndexOfLine(lineList, updateLine.id2, updateLine.id1);

            if (!updateLine.multiple && !checkExistLink(lineList, updateLine.id1, updateLine.id2)) {
                newLineList[idx1] = { ...lineList[idx1], properties: { w: value } };
                setLineList(newLineList);
            } else if (
                !updateLine.multiple &&
                checkExistLink(lineList, updateLine.id1, updateLine.id2)
            ) {
                console.log(updateLine.properties.w);
                console.log(lineList[idx1].properties.w);

                if (value !== updateLine.properties.w) {
                    newLineList[idx1] = {
                        ...newLineList[idx1],
                        multiple: true,
                        properties: { w: value },
                    };
                    newLineList[idx2] = { ...newLineList[idx2], multiple: true };
                    setLineList(newLineList);
                }
            } else if (updateLine.multiple) {
                newLineList[idx1] = {
                    ...newLineList[idx1],
                    multiple: value !== lineList[idx2].properties.w,
                    properties: { w: value },
                };
                newLineList[idx2] = {
                    ...newLineList[idx2],
                    multiple: value !== lineList[idx2].properties.w,
                };
                setLineList(newLineList);
            }

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
            const clickX = evt.pageX - canvasRef.current.offsetLeft;
            const clickY = evt.pageY - canvasRef.current.offsetTop;
            const clickX0 = (clickX - dndRef.current.translatePos.x) / scale;
            const clickY0 = (clickY - dndRef.current.translatePos.y) / scale;

            setHoverNode(null);

            if (dndRef.current.mouseDown) {
                if (mode.value === 'ADD_NODE') return;
                if (mode.value === 'DEFAULT' && selectedNode) {
                    const keepNodes = nodeList.filter((node) => node.id !== selectedNode.id);
                    setNodeList([...keepNodes, { ...selectedNode, x: clickX0, y: clickY0 }]);

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
                            20,
                        left:
                            targetNode?.x * scale +
                            dndRef.current.translatePos.x +
                            canvasRef.current.offsetLeft,
                    });
                }
                // ********************************************
            }
        };
        // Put in this useEffect because it depends on scale
        canvasRef.current.addEventListener('mousemove', handleMouseMove);

        // ******************Add event listeners to handle screen drag****************
        const handleMouseDown = (evt) => {
            const clickX = evt.pageX - canvasRef.current.offsetLeft;
            const clickY = evt.pageY - canvasRef.current.offsetTop;
            const clickX0 = (clickX - dndRef.current.translatePos.x) / scale;
            const clickY0 = (clickY - dndRef.current.translatePos.y) / scale;

            setActionModalOpen(false);
            setActionData({ node: null, line: null });

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
                    } else if (mode.value === 'ADD_EDGE') {
                        const targetNode = getNodeByClick(nodeList, clickX0, clickY0);
                        if (targetNode) {
                            if (!selectedNode) setSelectedNode(targetNode);
                            else {
                                // Check when clicking on the same node
                                const distanceToCenter = getDistance(
                                    selectedNode.x,
                                    selectedNode.y,
                                    clickX0,
                                    clickY0,
                                );
                                if (distanceToCenter < selectedNode.radius) return;

                                // CHeck same link -> return
                                if (checkExistEdge(lineList, selectedNode.id, targetNode.id))
                                    return;

                                setFormOpen({ ...formOpen, addWeight: true });
                                setFormMetaData({
                                    ...formMetaData,
                                    addWeight: { selectedNode, targetNode },
                                });
                                setHoverNode(false);
                            }
                        } else setSelectedNode(null);
                    } else if (mode.value === 'DEFAULT') {
                        const targetNode = getNodeByClick(nodeList, clickX0, clickY0);
                        const targetLine = getLineByClick(lineList, clickX0, clickY0);

                        setSelectedNode(targetNode);
                        setSelectedLine(targetLine);
                    } else if (mode.value === 'REMOVE_OBJECT') {
                        setHoverNode(false);

                        const targetNode = getNodeByClick(nodeList, clickX0, clickY0);
                        const targetLine = getLineByClick(lineList, clickX0, clickY0);

                        removeNode(targetNode);
                        removeLine(targetLine);
                    }

                    break;
                case 3:
                    const targetNode = getNodeByClick(nodeList, clickX0, clickY0);
                    const targetLine = getLineByClick(lineList, clickX0, clickY0);
                    setActionData({ node: targetNode, line: targetLine });

                    if (targetNode || targetLine) {
                        setActionModalOpen(true);
                        setActionModalPosition({ top: evt.pageY, left: evt.pageX });
                        setHoverNode(null);
                    }
                    console.log('Right Mouse button pressed.');
                    break;
            }
        };
        canvasRef.current.addEventListener('mousedown', handleMouseDown);

        const handleMouseUp = (evt) => {
            dndRef.current.mouseDown = false;
            console.log('MOUSE UP :::::::');

            // compare current graph with previous graph in history
            if (mode.value === 'DEFAULT') {
                const currentGraph = {
                    nodeList,
                    lineList,
                };
                const previousHistoryGraph =
                    graphHistoryRef.current[graphHistoryRef.current.length - 1];
                if (!compareTwoGraphHistory(currentGraph, previousHistoryGraph)) {
                    graphHistoryRef.current.push(currentGraph);
                }
            }
        };
        canvasRef.current.addEventListener('mouseup', handleMouseUp);

        const handleMouseOver = (evt) => (dndRef.current.mouseDown = false);
        canvasRef.current.addEventListener('mouseover', handleMouseOver);

        const handleMouseOut = (evt) => (dndRef.current.mouseDown = false);
        canvasRef.current.addEventListener('mouseout', handleMouseOut);

        const handleContextMenu = (event) => event.preventDefault();
        document.addEventListener('contextmenu', handleContextMenu);

        return () => {
            canvasRef.current.removeEventListener('mousemove', handleMouseMove);
            canvasRef.current.removeEventListener('mousedown', handleMouseDown);
            canvasRef.current.removeEventListener('mouseup', handleMouseUp);
            canvasRef.current.removeEventListener('mouseover', handleMouseOver);
            canvasRef.current.removeEventListener('mouseout', handleMouseOut);
            document.removeEventListener('contextmenu', handleContextMenu);
        };
    }, [scale, mode, nodeList, selectedNode, lineList, selectedLine, actionModalOpen]);

    useEffect(() => {
        const handleResizeScreen = () => {
            console.log('Resize :::::::::::::::::::::::::::::::::::::::::::');
            if (actionModalOpen) {
                setActionModalOpen(false);
                setActionData({ node: null, line: null });
            }
        };
        window.addEventListener('resize', handleResizeScreen);

        return () => window.removeEventListener('resize', handleResizeScreen);
    }, [actionModalOpen]);

    return (
        <>
            {hoverNode && <DetailTooltip node={hoverNode} position={hoverPosition} />}
            {formOpen.addNode && (
                <AddNodeForm
                    onClose={() => setFormOpen({ ...formOpen, addNode: false })}
                    onSubmit={handleAddNode}
                />
            )}
            {formOpen.addWeight && (
                <AddWeightForm
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
            <div id='wrapper'>
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
        </>
    );
}

export default GraphTool;
