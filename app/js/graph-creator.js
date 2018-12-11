// // NIST-developed software is provided by NIST as a public service. You may use, copy and distribute copies of the
// software in any medium, provided that you keep intact this entire notice. You may improve, modify and create derivative
// works of the software or any portion of the software, and you may copy and distribute such modifications or works.
//     Modified works should carry a notice stating that you changed the software and should note the date and nature of any
// such change. Please explicitly acknowledge the National Institute of Standards and Technology as the source of the
// software.
// // NIST-developed software is expressly provided "AS IS." NIST MAKES NO WARRANTY OF ANY KIND, EXPRESS, IMPLIED, IN FACT
//     OR ARISING BY OPERATION OF LAW, INCLUDING, WITHOUT LIMITATION, THE IMPLIED WARRANTY OF MERCHANTABILITY, FITNESS FOR A
// PARTICULAR PURPOSE, NON-INFRINGEMENT AND DATA ACCURACY. NIST NEITHER REPRESENTS NOR WARRANTS THAT THE OPERATION OF THE
// SOFTWARE WILL BE UNINTERRUPTED OR ERROR-FREE, OR THAT ANY DEFECTS WILL BE CORRECTED. NIST DOES NOT WARRANT OR MAKE ANY
// REPRESENTATIONS REGARDING THE USE OF THE SOFTWARE OR THE RESULTS THEREOF, INCLUDING BUT NOT LIMITED TO THE CORRECTNESS,
//     ACCURACY, RELIABILITY, OR USEFULNESS OF THE SOFTWARE.
// // You are solely responsible for determining the appropriateness of using and distributing the software and you assume
//     all risks associated with its use, including but not limited to the risks and costs of program errors, compliance with
//     applicable laws, damage to or loss of data, programs or equipment, and the unavailability or interruption of operation.
//     This software is not intended to be used in any situation where a failure could cause risk of injury or damage to
// property. The software developed by NIST employees is not subject to copyright protection within the United States.

let graphObj = {
    graphName: null,
    // class definitions:
    taskClasses: {
        Bookkeeper: {
            type: 'bookkeeper',
            instances: new Set([])
        }
        // examples for reference
        // ExampleTask: {
        //     label: 'basic task example',
        //     inputs: new Set(['SomeDataClass']),
        //     multithreaded: true,
        //     type: 'simple-task',
        //     outputs: new Set(['SomeDataClass']),
        //     instances: new Set([])
        // },
        // ExampleRule: {
        //     label: 'basic rule example',
        //     inputs: new Set(['SomeDataClass']),
        //     type: 'bookkeeper-rule',
        //     outputs: new Set(['SomeDataClass']),
        //     instances: new Set([])
        // }
    },
    instances: {},
    dataClasses: {
        // example for reference
        // SomeDataClass: {
        //     parameters: {},
        //     users: new Set(['ExampleTask', 'ExampleRule'])
        // }
    },
    // class instances:
    nodes: [],
    edges: []
};

let guiGraph = null;
let validateEdges = false;

// deleted undefined as 4th parameter
window.onload = function(){
    //"use strict";
    let d3 = window.d3;

    //let consts = {};
    let settings = {
	    appendElSpec: "#graph"
    };

    // define graphcreator object
    let GraphCreator = function(svg, nodes, edges){
        let thisGraph = this;
        thisGraph.idct = 2;

        thisGraph.nodes = nodes || [];
        thisGraph.edges = edges || [];

        thisGraph.state = {
          selectedNode: null,
          selectedEdge: null,
          mouseDownNode: null,
          mouseDownLink: null,
          justDragged: false,
          justScaleTransGraph: false,
          lastKeyDown: -1,
          shiftNodeDrag: false,
          selectedText: null
        };



	// define arrow markers for graph links
    // established arrow line edge
    let defs = svg.append('svg:defs');
    defs.append('svg:marker')
        .attr('id', 'end-arrow')
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', "32")
        .attr('markerWidth', 3.5)
        .attr('markerHeight', 3.5)
        .attr('orient', 'auto')
        .append('svg:path')
        .attr('d', 'M0,-5L10,0L0,5');

	// define arrow markers for leading arrow
    // defines the end arrow marker when dragging line between nodes
	defs.append('svg:marker')
        .attr('id', 'mark-end-arrow')
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 7)
        .attr('markerWidth', 3.5)
        .attr('markerHeight', 3.5)
        .attr('orient', 'auto')
        .append('svg:path')
        .attr('d', 'M0,-5L10,0L0,5');

	// single svg tag (?)
    thisGraph.svg = svg;
    // group of svg tags. each is applied the thisGraph.consts.graphClass class. graph visualization here
    thisGraph.svgG = svg.append("g").classed(thisGraph.consts.graphClass, true);
    let svgG = thisGraph.svgG;

    // displayed when dragging between nodes
    // appends the path with the mark-end-errow at the end
    thisGraph.dragLine = svgG.append('svg:path')
        .attr('class', 'link dragline hidden')
        .attr('d', 'M0,0L0,0')
        .style('marker-end', 'url(#mark-end-arrow)');

	// svg nodes and edges
    thisGraph.paths = svgG.append("g").selectAll("g");
    thisGraph.circles = svgG.append("g").selectAll("g");

    // testing to see how graphInfo is stored

    thisGraph.drag = d3.behavior.drag()
        .origin(function(d){
            return {x: d.x, y: d.y};
        })
        .on("drag", function(args){
            thisGraph.state.justDragged = true;
            thisGraph.dragmove.call(thisGraph, args);
        })
        .on("dragend", function() {
            // inherited from original repo:
            // todo check if edge-mode is selected
        });

    graphObj.nodes = thisGraph.nodes;
    graphObj.edges = thisGraph.edges;

    // listen for key events
    d3.select(window).on("keydown", function(){
        thisGraph.svgKeyDown.call(thisGraph);
    })
        .on("keyup", function(){
            thisGraph.svgKeyUp.call(thisGraph);
        });

    svg.on("mousedown", function(d){thisGraph.svgMouseDown.call(thisGraph, d);});
    svg.on("mouseup", function(d){thisGraph.svgMouseUp.call(thisGraph, d);});

        /*
            listen for dragging
            if holding down shift, window won't zoom, but zoom actions are "accumulated"
        */
        let dragSvg = d3.behavior.zoom()
        .on("zoom", function(){
            if (d3.event.sourceEvent.shiftKey) {
                // inherited from original repo:
                // TODO  the internal d3 state is still changing
                return false;
            }
            else {
			  thisGraph.zoomed.call(thisGraph);
			}
			return true;
        })
        .on("zoomstart", function(){
            let ael = d3.select("#" + thisGraph.consts.activeEditId).node();
            if (ael){
                ael.blur();
            }
            if (!d3.event.sourceEvent.shiftKey) d3.select('body').style("cursor", "move");
        })
        .on("zoomend", function(){
            d3.select('body').style("cursor", "auto");
        });

    svg.call(dragSvg).on("dblclick.zoom", null);

    // listen for resize
    window.onresize = function(){thisGraph.updateWindow(svg);};

    // handle uploaded data
    // ask for JSON file, validate, and assign variables from JSON
    d3.select("#upload-graph").on("mousedown", function(){
        $('#hidden-file-upload').trigger('click');
    });

    d3.select("#hidden-file-upload").on("change", function(){
        if (window.File && window.FileReader && window.FileList && window.Blob) {
            let uploadFile = this.files[0];
            let filereader = new window.FileReader();

            if (uploadFile.type === 'application/json') {
                filereader.onload = function(){
                    let res = filereader.result;
                    let error = null;
                    let uploadGraph = null;
                    try {
                        uploadGraph = JSON.parse(res);
                    }
                    catch(err) {
                        error = err;
                    }

                    if (error === null) {
                        processUpload(uploadGraph, thisGraph);
                    }
                    else {
                        alert("Error parsing uploaded file\nerror message: " + error.message);

                    }
                };
                filereader.readAsText(uploadFile);
            }
            else {
                alert('Error! Uploaded Task Graph file must be a JSON file.');
            }

        } else {
            alert('Your browser is outdated and doesn\'t support file uploads. Please fix this to use this feature.');
        }

    });

    // handle delete graph
    d3.select("#delete-graph").on("mousedown", function(){
        thisGraph.deleteGraph(false);
    });
    }; // end of graph creator object

    GraphCreator.prototype.setIdCt = function(idct){
        this.idct = idct;
    };

    GraphCreator.prototype.consts =  {
        selectedClass: "selected",
        connectClass: "connect-node",
        circleGClass: "conceptG",
        graphClass: "graph",
        activeEditId: "active-editing",
        BACKSPACE_KEY: 8,
        DELETE_KEY: 46,
        ENTER_KEY: 13,
        F_KEY: 70,
        U_KEY: 85,
        nodeRadius: '5%'
    };

    /* PROTOTYPE FUNCTIONS */

    GraphCreator.prototype.dragmove = function(d) {
        let thisGraph = this;
        if (thisGraph.state.shiftNodeDrag) {
            thisGraph.dragLine.attr('d', 'M' + d.x + ',' + d.y +
                'L' + d3.mouse(thisGraph.svgG.node())[0] + ',' + d3.mouse(this.svgG.node())[1]);
        }
        else {
            d.x += d3.event.dx;
            d.y += d3.event.dy;
            thisGraph.updateGraph();
        }
    };

    GraphCreator.prototype.deleteGraph = function(skipPrompt){
        let thisGraph = this,
            doDelete = true;
        if (!skipPrompt){
            doDelete = confirm("Press OK to delete this graph");
        }
        if(doDelete){
            let nodes = [{
                id: 0,
                title: 'source',
                x: x,
                y: sourceY,
                isGraphIO: true,
                edgesOut: new Set([])
            },
                {
                    id: 1,
                    title: 'sink',
                    x: x,
                    y: sinkY,
                    isGraphIO: true,
                    edgesIn: new Set([])
                }];
            let taskClasses = {
                Bookkeeper: {
                    type: 'bookkeeper',
                    instances: new Set([])
                }
            };
            thisGraph.nodes = nodes;
            thisGraph.edges = [];
            graphObj.nodes = thisGraph.nodes;
            graphObj.edges = thisGraph.edges;
            graphObj.taskClasses = taskClasses;
            graphObj.instances = {};
            graphObj.dataClasses = {};
            thisGraph.updateGraph();
        }
    };

    /* insert svg line breaks: taken from http://stackoverflow.com/questions/13241475/how-do-i-include-newlines-in-labels-in-d3-charts */
    GraphCreator.prototype.insertTitleLinebreaks = function (gEl, node) {
        let threadNum = 1;
        if (!node.isGraphIO) {
            let taskClass = graphObj.taskClasses[node.taskClass];
            let classType = graphObj.taskClasses[node.taskClass].type;
            if (classType === 'simple-task' && taskClass.multithreaded) {
                // get the thread count from the form since the instance isn't necessarily created yet
                if(!(node.title in graphObj.instances)) {
                    threadNum = $('#thread-cnt').val();
                }
                else {
                    threadNum = graphObj.instances[node.title].threads;
                }
            }
        }
        // regex to split by camel case
        // split title on node in different rows according to camelCase
        let title = node.title;
        if (!node.isGraphIO) {
            title += `\nX${threadNum}`;
        }
        //title = title.replace(/([a-z\xE0-\xFF0-9])([A-Z\xC0\xDF])/g, '$1 $2');


        let words = title.split(/\s+/g);
        let nwords = words.length;
        let el = gEl.append("text")
            .attr("text-anchor","middle")
            .attr("dy", "-" + (nwords-1)*7.5);

        for (let i = 0; i < words.length; i++) {
            let tspan = el.append('tspan').text(words[i]);
            if (i > 0) { tspan.attr('x', 0).attr('dy', '15'); }
        }
        if (node.title in graphObj.instances || node.isGraphIO) {
            gEl.selectAll("text").attr('fill', 'black');
        }
        else {
            gEl.selectAll("text").attr('fill', 'lightgray');
        }
    };

    // remove edges associated with a node
    GraphCreator.prototype.spliceLinksForNode = function(node) {
        let thisGraph = this;
        let toSplice = thisGraph.edges.filter(function(l) {
            return (l.source === node || l.target === node);
        });
        toSplice.map(function(edge) {
            const edgeIdx = thisGraph.edges.indexOf(edge);
            const src = edge.source.title;
            const target = edge.target.title;
            const instances = graphObj.instances;
            // check if source instance still exists. necessary when deleting a whole task Class
            if (!edge.source.isGraphIO && src in instances && instances[src].edgesOut.has(node.title)) {
                instances[src].edgesOut.delete(node.title);
            }
            // can only be graph source. eliminate from edgesOut
            else if (edge.source.isGraphIO && thisGraph.nodes[0].edgesOut.has(node.title)) {
                thisGraph.nodes[0].edgesOut.delete(node.title);
            }
            // check if target instance still exists. necessary when deleting a whole task Class
            if (!edge.target.isGraphIO && target in instances && instances[target].edgesOut.has(node.title)) {
                instances[target].edgesIn.delete(node.title);
            }
            // can only be a graph sink. eliminate from edgesIn
            else if (edge.target.isGraphIO && thisGraph.nodes[1].edgesIn.has(node.title)) {
                thisGraph.nodes[1].edgesIn.delete(node.title);
            }
            thisGraph.edges.splice(edgeIdx, 1);
        });
    };

    // set a new selected edge. display edge data
    GraphCreator.prototype.replaceSelectEdge = function(d3Path, edgeData){
        let thisGraph = this;
        d3Path.classed(thisGraph.consts.selectedClass, true);
        if (thisGraph.state.selectedEdge){
            thisGraph.removeSelectFromEdge();
        }
        thisGraph.state.selectedEdge = edgeData;
        if (d3.event.shiftKey) {
            ED_modal.iziModal('close');
            edgeMenu(thisGraph, edgeData);
        }
    };

    // set a new selected node
    GraphCreator.prototype.replaceSelectNode = function(d3Node, nodeData){
        let thisGraph = this;
        d3Node.classed(this.consts.selectedClass, true);
        if (thisGraph.state.selectedNode){
            thisGraph.removeSelectFromNode();
        }
        thisGraph.state.selectedNode = nodeData;
    };

    // unset the previous selected node
    GraphCreator.prototype.removeSelectFromNode = function(){
        let thisGraph = this;
        thisGraph.circles.filter(function(cd){
            return cd.id === thisGraph.state.selectedNode.id;
        }).classed(thisGraph.consts.selectedClass, false);
        thisGraph.state.selectedNode = null;
    };

    /*
        if a node was left undeclared (not in graphObj.instances),
        then delete it from the GUI and remove it from the list of nodes
    */
    GraphCreator.prototype.removeUnsetNode = function() {
        let thisGraph = this;
        let taskInstances = graphObj.instances;
        for (const [nodeIdx, node] of thisGraph.nodes.entries()) {
            if (!(node.title in taskInstances) && !node.isGraphIO && !node.isGraphIO) {
                thisGraph.spliceLinksForNode(node);
                thisGraph.nodes.splice(nodeIdx, 1);
                thisGraph.updateGraph();
                return node;
            }
        }
    };

    // validate that the output of a source node matches the inputs of the target node
    GraphCreator.prototype.isValidEdge = function(srcOuts, dstIns) {
        if (srcOuts.size !== dstIns.size) {
            return false;
        }
        else {
            for (let out of srcOuts) {
                if (!dstIns.has(out)) {
                    return false;
                }
            }
        }

        return true;
    };

    // update the title of a node. update GUI
    GraphCreator.prototype.updateNode = function(d3node, node) {
        let thisGraph = this;
        d3node.selectAll("text").remove();
        thisGraph.insertTitleLinebreaks(d3node, node);
        TC_modal.iziModal('close');
        thisGraph.updateGraph();
    };

    GraphCreator.prototype.createNode = function(d3node, node, classType) {
        let thisGraph = this;
        const newNodeName = $('#node-name').val();
        newNodeName.replace(/\s/g,'');

        if (newNodeName in graphObj.taskClasses || newNodeName in graphObj.dataClasses) {
            alert('Error! Node name must be unique and not used by any other node, data class, or task class.');
        }
        else if (validIdentifier(newNodeName, false)) {
            if (classType === 'simple-task') {
                createNode(d3node, node, thisGraph, true);
            }
            else if (classType === 'bookkeeper-rule') {
                createNode(d3node, node, thisGraph);
            }
            else if (classType === 'bookkeeper') {
                const inputList = $('#input-list');
                const inputs = new Set(listValues(inputList));
                if (inputs.size < 1) {
                    alert('Error! A bookkeeper must have an input!')
                }
                else {
                    createNode(d3node, node, thisGraph, false, inputs);
                }
            }
            else {
                alert('Can\'t handle this type of node yet.');
            }
        }
        else {
            alert('Invalid identifier name. Name is a c++ variable and must use lower Camel Case.');
        }
    };

    // unset the currently selected edge
    GraphCreator.prototype.removeSelectFromEdge = function(){
        let thisGraph = this;
        thisGraph.paths.filter(function(cd){
            return cd === thisGraph.state.selectedEdge;
        }).classed(thisGraph.consts.selectedClass, false);
        thisGraph.state.selectedEdge = null;
    };

    // mouse down on a GUI edge
    GraphCreator.prototype.pathMouseDown = function(d3path, d){
        let thisGraph = this,
            state = thisGraph.state;
        d3.event.stopPropagation();
        state.mouseDownLink = d;

        // remove select styling from node
        if (state.selectedNode){
            thisGraph.removeSelectFromNode();
        }

        // replace current selected edge with new selection
        let prevEdge = state.selectedEdge;
        if (!prevEdge || prevEdge !== d){
            thisGraph.replaceSelectEdge(d3path, d);
        }
        // toggle selected edge
        else{
            thisGraph.removeSelectFromEdge();
        }
    };

    // mousedown on node
    GraphCreator.prototype.circleMouseDown = function(d3node, d){
        let thisGraph = this,
            state = thisGraph.state;
        d3.event.stopPropagation();
        state.mouseDownNode = d;
        if (d3.event.shiftKey && drawEdge){
            state.shiftNodeDrag = d3.event.shiftKey;
            // reposition dragged directed edge
            thisGraph.dragLine.classed('hidden', false)
                .attr('d', 'M' + d.x + ',' + d.y + 'L' + d.x + ',' + d.y);
           // return;
        }
    };

    /*
        handle editing node/instance properties. deletes any left-behind, undeclared nodes and pops up a notification.
        while a node is being edited, its text is changed to gray to indicate this (could add color).
        prohibits any spaces in node/instance names for code generation reasons (could be changed and spaces are removed
        before generation).
    */
    GraphCreator.prototype.changeTextOfNode = function(d3node, d){
        onTextMenu = true;

        handleNodeForm(this, d3node, d);
    };

    // mouseup on nodes
    GraphCreator.prototype.circleMouseUp = function(d3node, d){
        let thisGraph = this,
            state = thisGraph.state,
            consts = thisGraph.consts;

        // reset the states
        state.shiftNodeDrag = false;
        d3node.classed(consts.connectClass, false);

        let mouseDownNode = state.mouseDownNode;

        // nasty looking. from original codebase.
        // haven't searched much but could be replaced with a break (the function/method may need a label)
        if (!mouseDownNode) return;

        thisGraph.dragLine.classed("hidden", true);

        if (mouseDownNode !== d) {
            // we're in a different node: create new edge for mousedown edge and add to graph
            let newEdge = {source: mouseDownNode, target: d};
            let filtRes = thisGraph.paths.filter(function(d) {
                return d.source === newEdge.source && d.target === newEdge.target;
            });

            // if there was no existing match to our created newEdge, then push it
            // this probably needs to be generalized and modularized more for handling other types of tasks
            if (!filtRes[0].length) {
                processEdge(newEdge, thisGraph);
            }
            // notify user that an edge already exists. to avoid scenarios where
            // the user stares at the interface wondering why nothing is happening
            else {
                const title = 'Duplicate Edge';
                const msg = 'There\'s already an edge from ' + newEdge.source.title
                    + ' to ' + newEdge.target.title;
                notify({title: title, message: msg});
            }
        }
        else {
            // we're in the same node
            if (state.justDragged) {
                // dragged, not clicked
                state.justDragged = false;
            }
            else {
                // shift clicked on existing node. open node editing menu
                if (d3.event.shiftKey && !d.isGraphIO) {
                    thisGraph.changeTextOfNode(d3node, d);
                }
                else {
                    // remove selection from edge and apply it to a node
                    if (state.selectedEdge) {
                        thisGraph.removeSelectFromEdge();
                    }
                    let prevNode = state.selectedNode;

                    if (!prevNode || prevNode.id !== d.id) {
                        thisGraph.replaceSelectNode(d3node, d);
                    }
                    else {
                        thisGraph.removeSelectFromNode();
                    }
                }
            }
        }
        state.mouseDownNode = null;
        //return;

    }; // end of circles mouseup

    // mousedown on main svg
    GraphCreator.prototype.svgMouseDown = function(){
        this.state.graphMouseDown = true;
    };

    // mouseup on main svg
    GraphCreator.prototype.svgMouseUp = function(){
        let thisGraph = this,
            state = thisGraph.state;
        let taskClass = $('#taskclass-selection').val();
        //let taskType = graphObj.taskClasses[taskClass].type;
        if (state.justScaleTransGraph) {
            // dragged not clicked
            state.justScaleTransGraph = false;
        }
        // create a new node in GUI and open node editing menu
        else if (state.graphMouseDown && drawTask && d3.event.shiftKey && !onTextMenu ) {
            // Note: I believe this works for all types of tasks
            // clicked not dragged from svg
            let xycoords = d3.mouse(thisGraph.svgG.node());
            let d = {
                id: thisGraph.idct++,
                title: getAvailableName(taskClass),
                x: xycoords[0],
                y: xycoords[1],
                taskClass: taskClass,
                isGraphIO: false
            };
            thisGraph.nodes.push(d);
            thisGraph.updateGraph();
            // make title of text immediently editable
            let d3node = thisGraph.circles.filter(function(dval){return dval.id === d.id;});
            thisGraph.changeTextOfNode(d3node, d);

        }
        else if (state.shiftNodeDrag) {
            // dragged from node
            state.shiftNodeDrag = false;
            thisGraph.dragLine.classed("hidden", true);
        }
        state.graphMouseDown = false;
    };

    // keydown on main svg
    GraphCreator.prototype.svgKeyDown = function() {
        let thisGraph = this,
            state = thisGraph.state,
            consts = thisGraph.consts;
        // make sure repeated key presses don't register for each keydown
        // if the line below is set then you need two presses for two-key shortcuts (e.g. CTRL+F)
        //if(state.lastKeyDown !== -1) return;

        state.lastKeyDown = d3.event.keyCode;
        let selectedNode = state.selectedNode,
            selectedEdge = state.selectedEdge;

        if (d3.event.ctrlKey) {
            switch (d3.event.keyCode) {
                case consts.F_KEY:
                    d3.event.preventDefault();
                    let nodeName = prompt('Enter the name of the nodes you would like to find: ');
                    if (nodeName !== null) {
                        if (nodeName !== '') {
                            let nodes = new Set(graphObj.nodes.filter(node => node.title.includes(nodeName)));
                            //nodes = new Set(nodes.map(node => node.id));

                            thisGraph.circles.filter(function (circleData) {
                                return nodes.has(circleData);
                            }).classed(consts.selectedClass, true);
                            state.selectedNode = null;
                        }
                        else {
                            alert('Cannot search for an empty string!');
                        }
                    }
                    break;

                case consts.U_KEY:
                    d3.event.preventDefault();
                    thisGraph.circles.classed(consts.selectedClass, false);
                    break;
            }
        }
        else {
            switch(d3.event.keyCode) {
                case consts.BACKSPACE_KEY:
                case consts.DELETE_KEY:
                    if (!onTextMenu) {
                        d3.event.preventDefault();
                    }
                    if (selectedNode && !selectedNode.isGraphIO && !onTextMenu) {
                        const nodeIdx = thisGraph.nodes.indexOf(selectedNode);
                        const nodeName = selectedNode.title;
                        const className = selectedNode.taskClass;
                        thisGraph.spliceLinksForNode(selectedNode);
                        thisGraph.nodes.splice(nodeIdx, 1);
                        delete graphObj.instances[nodeName];
                        graphObj.taskClasses[className].instances.delete(nodeName);
                        state.selectedNode = null;
                        thisGraph.updateGraph();
                    }
                    else if (selectedEdge && !onTextMenu) {
                        const edgeIdx = thisGraph.edges.indexOf(selectedEdge);
                        // necessary steps for nodes that aren't a graph source or sink
                        if (!selectedEdge.source.isGraphIO) {
                            const target = selectedEdge.target.title;
                            graphObj.instances[selectedEdge.source.title].edgesOut.delete(target);
                        }
                        else if (selectedEdge.source.isGraphIO) {
                            const target = selectedEdge.target.title;
                            thisGraph.nodes[0].edgesOut.delete(target);
                        }
                        if (!selectedEdge.target.isGraphIO) {
                            const src = selectedEdge.source.title;
                            graphObj.instances[selectedEdge.target.title].edgesIn.delete(src);
                        }
                        else if (selectedEdge.target.isGraphIO) {
                            const src = selectedEdge.source.title;
                            thisGraph.nodes[1].edgesIn.delete(src);
                        }
                        thisGraph.edges.splice(edgeIdx, 1);
                        state.selectedEdge = null;
                        thisGraph.updateGraph();
                    }
                    break;
            }
        }
    };

    GraphCreator.prototype.svgKeyUp = function() {
        this.state.lastKeyDown = -1;
    };

    // call to propagate changes to graph
    GraphCreator.prototype.updateGraph = function(){

        let thisGraph = this,
            consts = thisGraph.consts,
            state = thisGraph.state;

        if (validateEdges) {
            for (let edge of thisGraph.edges) {
                if (!edge.source.isGraphIO && !edge.target.isGraphIO) {
                    let src = edge.source;
                    let dst = edge.target;
                    let srcOuts = null;
                    let dstIns = null;

                    if (src.taskClass === 'Bookkeeper') {
                        srcOuts = graphObj.instances[src.title].inputs;
                    }
                    else {
                        srcOuts = graphObj.taskClasses[src.taskClass].outputs;
                    }

                    if (dst.taskClass === 'Bookkeeper') {
                        dstIns = graphObj.instances[dst.title].inputs;
                    }
                    else {
                        dstIns = graphObj.taskClasses[dst.taskClass].inputs;
                    }

                    let id = '#' + src.title + 'TO' + dst.title;
                    if (!thisGraph.isValidEdge(srcOuts, dstIns)) {
                        let id = '#' + edge.source.title + 'TO' + edge.target.title;
                        d3.select(id).attr('class', 'invalid-link');
                    }
                    else {
                        d3.select(id).attr('class', 'link');
                    }


                }
            }

            validateEdges = false;
        }

        thisGraph.paths = thisGraph.paths.data(thisGraph.edges, function(d){
            return String(d.source.id) + "+" + String(d.target.id);
        });
        let paths = thisGraph.paths;
        // update existing paths
        paths.style('marker-end', 'url(#end-arrow)')
            .classed(consts.selectedClass, function(d){
                return d === state.selectedEdge;
            })
            .attr("d", function(d){
                return "M" + d.source.x + "," + d.source.y + "L" + d.target.x + "," + d.target.y;
            });

        // add new paths
        paths.enter()
            .append("path")
            .style('marker-end','url(#end-arrow)')
            .classed("link", true)
            .attr("d", function(d){
                return "M" + d.source.x + "," + d.source.y + "L" + d.target.x + "," + d.target.y;
            })
            .attr('id', function(d) {
                return d.source.title + 'TO' + d.target.title;
            })
            .on("mousedown", function(d){
                thisGraph.pathMouseDown.call(thisGraph, d3.select(this), d);
            })
            //removed unused parameter d
            .on("mouseup", function(){
                state.mouseDownLink = null;
            });

        // remove old links
        paths.exit().remove();

        // update existing nodes
        thisGraph.circles = thisGraph.circles.data(thisGraph.nodes, function(d){ return d.id;});
        thisGraph.circles.attr("transform", function(d){return "translate(" + d.x + "," + d.y + ")";});

        // add new nodes
        let newGs= thisGraph.circles.enter()
            .append("g");

        newGs.classed(consts.circleGClass, true)
            .attr("transform", function(d){return "translate(" + d.x + "," + d.y + ")";})
            // removed unused parameter d
            .on("mouseover", function(){
                if (state.shiftNodeDrag){
                    d3.select(this).classed(consts.connectClass, true);
                }
            })
            // removed unused parameter d
            .on("mouseout", function(){
                d3.select(this).classed(consts.connectClass, false);
            })
            .on("mousedown", function(d){
                thisGraph.circleMouseDown.call(thisGraph, d3.select(this), d);
            })
            .on("mouseup", function(d){
                thisGraph.circleMouseUp.call(thisGraph, d3.select(this), d);
            })
            .call(thisGraph.drag);

        newGs.append("circle")
            .attr("r", String(consts.nodeRadius));

        newGs.each(function(d){
            thisGraph.insertTitleLinebreaks(d3.select(this), d);
        });

        // remove old nodes
        thisGraph.circles.exit().remove();
    };

    GraphCreator.prototype.zoomed = function(){
        this.state.justScaleTransGraph = true;
        d3.select("." + this.consts.graphClass)
            .attr("transform", "translate(" + d3.event.translate + ") scale(" + d3.event.scale + ")");
    };

    GraphCreator.prototype.updateWindow = function(svg){
        // let docEl = document.documentElement,
        //     bodyEl = document.getElementsByTagName('body')[0];
        const midCol = $('#column-middle');
        let x = midCol.width();
        let y = midCol.height();
        svg.attr("width", x).attr("height", y);
    };

    /**** MAIN ****/

    // warn the user when leaving
    window.onbeforeunload = function(){
        return "Make sure to save your graph locally before leaving :-)";
    };

    // let docEl = document.documentElement,
    //     bodyEl = document.getElementsByTagName('body')[0];

    let graphWindow = $('#column-middle');
    //let width = window.innerWidth || docEl.clientWidth || bodyEl.clientWidth;
    let width = graphWindow.width();
    //let height =  window.innerHeight|| docEl.clientHeight|| bodyEl.clientHeight;
    let height = graphWindow.height();
    // let xLoc = width/2 - 25,
    //     yLoc = 100;

    let x = Math.trunc(graphWindow.width() / 2);
    let sourceY = Math.trunc(graphWindow.height() / 3);
    let sinkY = sourceY * 2;
    // initial node data
    let nodes = [{
        id: 0,
        title: 'source',
        x: x,
        y: sourceY,
        isGraphIO: true,
        edgesOut: new Set([])
    },
        {
            id: 1,
            title: 'sink',
            x: x,
            y: sinkY,
            isGraphIO: true,
            edgesIn: new Set([])
        }];
    let edges = [];

    /** MAIN SVG **/
    let svg = d3.select(settings.appendElSpec).append("svg")
        .attr("width", width)
        .attr("height", height);
    let graph = new GraphCreator(svg, nodes, edges);
    guiGraph = graph;
    graph.setIdCt(2);
    graph.updateGraph();
};