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

function processEdge(newEdge, thisGraph) {
    // if any of the edge ends is a Task Graph source or sink
    if (newEdge.source.isGraphIO || newEdge.target.isGraphIO) {
        // prevent incoming edges to Task Graph source
        if (newEdge.target.isGraphIO && newEdge.target.title === 'source') {
            alert('Error! A Task Graph source cannot have any incoming edge!');
        }
        // prevent source from directly connecting to the sink
        else if (newEdge.source.isGraphIO && newEdge.target.isGraphIO) {
            alert('Error! A Task Graph source cannot connect directly to a Task Graph sink.');
        }
        else if (newEdge.source.isGraphIO) {
            const targetClassType = graphObj.taskClasses[newEdge.target.taskClass].type;
            // prevent outgoing edges from Task Graph sink
            if (newEdge.source.title === 'sink') {
                alert('Error! A Task Graph sink cannot have any outgoing edge!');
            }
            else if (targetClassType === 'bookkeeper-rule') {
                alert('Error! Invalid edge. A Bookkeeper Rule\'s input must come from a Bookkeeper.');
            }
            // make sure the Task Graph source doesn't have more than one outgoing edge
            else if (newEdge.source.title === 'source') {
                let alreadyHasEdge = false;
                for (let edge of thisGraph.edges) {
                    if (edge.source.title === 'source' && edge.source.isGraphIO) {
                        alert('Error! A Task Graph source cannot have more than one outgoing edge');
                        alreadyHasEdge = true;
                        break;
                    }
                }
                if (!alreadyHasEdge) {
                    thisGraph.edges.push(newEdge);
                    thisGraph.nodes[0].edgesOut.add(newEdge.target.title); // source node will always be at index 0
                    graphObj.instances[newEdge.target.title].edgesIn.add('source');
                    thisGraph.updateGraph();
                }
            }
        }
        // check if legal edge involving a Task Graph sink. if so, add it and update GUI
        else if(newEdge.target.isGraphIO && newEdge.target.title === 'sink') {
            let src = graphObj.instances[newEdge.source.title];
            if (src.edgesOut.size === 0 && src.taskClass !== 'Bookkeeper') {
                let validEdge = true;
                // sink node will always be at index 1
                for (let nodeName of thisGraph.nodes[1].edgesIn.values()) {
                    // Tasks currently only have one output class so we're selecting the first one in all cases
                    // get the dataclass output of the source Task Class
                    let sourceOut = Array.from(graphObj.taskClasses[newEdge.source.taskClass].outputs)[0];
                    // get the Task Class of a Graph Producer so we can compare if it matches the source's output
                    let sinkInClass = graphObj.taskClasses[graphObj.instances[nodeName].taskClass];
                    let sinkOut = Array.from(sinkInClass.outputs)[0];
                    if (sourceOut !== sinkOut) {
                        validEdge = false;
                    }
                }
                // true even if sink doesn't have any edgesIn yet
                if (validEdge) {
                    thisGraph.edges.push(newEdge);
                    src.edgesOut.add('sink');
                    thisGraph.nodes[1].edgesIn.add(newEdge.source.title);
                    thisGraph.updateGraph();
                }
                else {
                    let sinkIn = thisGraph.nodes[1].edgesIn.values().next().value;
                    let sinkInClass = graphObj.taskClasses[graphObj.instances[sinkIn].taskClass];
                    let graphOut = sinkInClass.outputs.values().next().value;
                    let srcOut = graphObj.taskClasses[newEdge.source.taskClass].outputs.values().next().value;
                    alert(`Error! Graph currently has an output of dataclass ${graphOut}, but `+
                        `${newEdge.source.title} has an output class of ${srcOut}. ` +
                        `Delete existing edges, or change the output class of ${newEdge.source.title}`);
                }
            }
            else if (src.taskClass === 'Bookkeeper') {
                alert('Error! A Bookkeeper cannot connect directly to a graph sink\n' +
                    'i.e. a bookkeeper cannot be a graph producer.');
            }
            else {
                alert(`Error! ${newEdge.source.title} already has an Output Edge.`);
            }
        }
    }
    // edge between 2 non-graphIO nodes
    else {
        const src = newEdge.source;
        const dst = newEdge.target;

        let srcTaskClass = null;
        let srcInstance = graphObj.instances[src.title];
        if (src.taskClass !== 'Bookkeeper') {
            srcTaskClass = graphObj.taskClasses[src.taskClass];
        }
        let dstTaskClass = null;
        let dstInstance = graphObj.instances[dst.title];
        if (dst.taskClass !== 'Bookkeeper') {
            dstTaskClass = graphObj.taskClasses[dst.taskClass];
        }

        // handle source node is not a bookkeeper
        if (srcTaskClass !== null ) {
            const srcClassType = srcTaskClass.type;
            // handle if source node is a simple task or bookkeeper rule
            if (srcClassType === 'simple-task' || srcClassType === 'bookkeeper-rule') {
                // avoid more than one outgoing edge a simple Task node
                if (srcInstance.edgesOut.size !== 0) {
                    let outs = [];
                    for (let out of srcInstance.edgesOut.values()) {
                        outs.push(out);
                    }
                    outs.join(', ');
                    alert(`${src.title} already has output edge(s) to ${outs}!\n` +
                        `Simple task instances can only have one output edge.` +
                        `Please delete the existing edge if you wish to change it.`);
                }
                // target node is a bookkeeper
                else if (dstTaskClass === null) {
                    const srcOuts = srcTaskClass.outputs;
                    const dstIns = dstInstance.inputs;
                    if (thisGraph.isValidEdge(srcOuts, dstIns)) {
                        thisGraph.edges.push(newEdge);
                        srcInstance.edgesOut.add(dst.title);
                        dstInstance.edgesIn.add(src.title);
                        thisGraph.updateGraph();
                    }
                    else {
                        alert('Can\'t create this edge! Source node\'s output type doesn\'t match\n' +
                            'the input type of the target node.');
                    }
                }
                else if (srcClassType === 'simple-task' && dstTaskClass.type === 'bookkeeper-rule') {
                    alert('Error! Invalid edge. A Bookkeeper Rule\'s input must come from a Bookkeeper.');
                }
                // edge between a simple task and some other non-bookkeeper task
                // if the edge is valid (input and output data classes match)
                // then add the edg, update the instances, and update the GUI
                else if (thisGraph.isValidEdge(srcTaskClass.outputs, dstTaskClass.inputs)) {
                    thisGraph.edges.push(newEdge);
                    srcInstance.edgesOut.add(newEdge.target.title);
                    dstInstance.edgesIn.add(newEdge.source.title);
                    thisGraph.updateGraph();
                }
                // throw an error for an invalid edge
                else {
                    alert('Can\'t create this edge! Source node\'s output type doesn\'t match\n' +
                        'the input type of the target node.');
                }
            }
        }
        // source is bookkeeper
        else {
            if (dstTaskClass === null) {
                alert('Error! A bookkeeper cannot connect directly to another bookkeeper.' +
                    '\nAn edge coming from a bookkeeper can only connect to a Rule.');
            }
            else if (dstTaskClass.type === 'bookkeeper-rule') {
                // Rule input must match bookkeeper input
                const srcOuts = srcInstance.inputs;
                const dstIns = dstTaskClass.inputs;
                if (thisGraph.isValidEdge(srcOuts, dstIns)) {
                    thisGraph.edges.push(newEdge);
                    srcInstance.edgesOut.add(dst.title);
                    dstInstance.edgesIn.add(src.title);
                    thisGraph.updateGraph();
                }
                else {
                    alert('Can\'t create this edge! Source node\'s output type doesn\'t match\n' +
                        'the input type of the target node.');
                }
            }
            else {
                alert('Error! An edge coming from a bookkeeper can only connect to a Rule. ');
            }
        }

    }
}

function updateDataClasses(userName, dataClasses) {
    for (let name of dataClasses.values()) {
        if (name in graphObj.dataClasses) {
            graphObj.dataClasses[name].users.add(userName);
        }
        else {
            graphObj.dataClasses[name] = {
                parameters: {},
                users: new Set([userName])
            };
            $('#dataclass-selection').append(`<option value="${name}">${name}</option>`);
        }
    }
}

function updateEdgeInfo(oldNodeName, newNodeName) {
    let srcNodes = graphObj.instances[newNodeName].edgesIn;
    for (let nodeName of srcNodes) {
        let srcInst = graphObj.instances[nodeName];
        srcInst.edgesOut.delete(oldNodeName);
        srcInst.edgesOut.add(newNodeName);
    }

    let dstNodes = graphObj.instances[newNodeName].edgesOut;
    for (let nodeName of dstNodes) {
        let dstInst = graphObj.instances[nodeName];
        dstInst.edgesIn.delete(oldNodeName);
        dstInst.edgesIn.add(newNodeName);
    }
}

function createNode(d3node, node, thisGraph, multithreaded= false, inputs= null) {
    const newNodeName = $('#node-name').val();
    newNodeName.replace(/\s/g,'');
    let threadCnt = null;
    if (multithreaded) {
        threadCnt = (graphObj.taskClasses[node.taskClass].multithreaded)?  $('#thread-cnt').val() : 1;
    }
    const oldNodeName = node.title;
    const instances = graphObj.instances;

    /*
        if task instance has a new name, then if the instance was declared, then delete the previous
        instance and create a new instance with the same properties; otherwise, declare an instance with the new
        name in graphObj.instances. update node in GUI accordingly
    */
    if (newNodeName !== oldNodeName) {
        if(!(newNodeName in instances)) {
            if (oldNodeName in instances) {
                const oldNode = instances[oldNodeName];
                const oldEdgesIn = oldNode.edgesIn;
                const oldEdgesOut = oldNode.edgesOut;
                node.title = newNodeName;
                instances[newNodeName] = {
                    graphID: node.id,
                    taskClass: node.taskClass,
                    edgesIn: new Set(oldEdgesIn),
                    edgesOut: new Set(oldEdgesOut)
                };
                delete instances[oldNodeName];
                graphObj.taskClasses[node.taskClass].instances.delete(oldNodeName);
                graphObj.taskClasses[node.taskClass].instances.add(node.title);
                if (multithreaded) {
                    instances[newNodeName].threads = threadCnt;
                }
                if (inputs !== null) {
                    instances[newNodeName].inputs = inputs;
                    updateDataClasses(newNodeName, inputs);
                }
                // propagate name change through all the edge data
                updateEdgeInfo(oldNodeName, newNodeName);

                thisGraph.updateNode(d3node, node);


            }
            else {
                node.title = newNodeName;
                instances[newNodeName] = {
                    graphID: node.id,
                    taskClass: node.taskClass,
                    edgesIn: new Set([]),
                    edgesOut: new Set([])
                };
                if (multithreaded) {
                    instances[newNodeName].threads = threadCnt;
                }
                if (inputs !== null) {
                    instances[newNodeName].inputs = inputs;
                    updateDataClasses(newNodeName, inputs);
                }
                graphObj.taskClasses[node.taskClass].instances.add(newNodeName);
                thisGraph.updateNode(d3node, node);
            }
        }
        // throw an error if new name already exists
        else {
            alert('A Task Instance with that name already exists.\n Instance names must be unique!');
        }
    }
    /*
        node name hasn't changed. if the node wasn't declared then add it to graphObj.instances.
        otherwise, check if any attributes have changed and update accordingly. if nothing has changed
        update the node in the GUI so it no longer appears as a node that is being edited
    */
    else {
        if(!(newNodeName in graphObj.instances)) {
            graphObj.instances[node.title] = {
                graphID: node.id,
                taskClass: node.taskClass,
                edgesIn: new Set([]),
                edgesOut: new Set([])
            };
            if (multithreaded) {
                instances[newNodeName].threads = threadCnt;
            }
            if (inputs !== null) {
                instances[newNodeName].inputs = inputs;
                updateDataClasses(newNodeName, inputs);
            }
            graphObj.taskClasses[node.taskClass].instances.add(node.title);
            thisGraph.updateNode(d3node, node);
        }
        else {
            let currNode = graphObj.instances[oldNodeName];
            const nodeThrds = currNode.threads;
            //const nodeClass = currNode.taskClass;
            if (currNode.graphID === node.id) {
                if (multithreaded && nodeThrds !== threadCnt) {
                    currNode.threads = threadCnt;
                }
                // save any changes to a bookkeepers inputs
                if (inputs !== null) {
                    instances[newNodeName].inputs = inputs;
                    updateDataClasses(newNodeName, inputs);
                }
                thisGraph.updateNode(d3node, node);
            }
            else {
                alert('A Task Instance with that name already exists.\n Instance names must be unique!');
            }
        }
    }
}

function handleNodeForm(thisGraph, d3node, d) {
    d3node.selectAll("text").attr('fill', 'lightgray');
    onInstanceMenu = true;
    let nodeIdx = thisGraph.nodes.indexOf(d);
    let nodes = thisGraph.nodes;
    let nodeClass = d.taskClass;
    let classType = graphObj.taskClasses[nodeClass].type;
    // node list - offset should never be larger than the declared instances unless
    // a node was left undeclared. ( offset is -3 to account for the source, sink nodes,
    // and the newly created node. If the node list is still larger, delete the undeclared node
    // (i.e. the one that's not in graphObj.instances). kinda ugly. should rethink
    if ((nodes.length - 3) > Object.keys(graphObj.instances).length
        && !nodes[nodeIdx].isGraphIO) {
        const unsetNode = thisGraph.removeUnsetNode();
        const title = 'Deleted undeclared task instance.';
        const msg = 'Deleted ' + unsetNode.title + ' because \nno properties were set so the instance wasn\'t created';

        notify({title: title, message: msg});
    }
    else {
        formHandler(classType, nodeClass, nodeIdx);
    }

    const node = thisGraph.nodes[nodeIdx];
    // used to keep track of what data classes an existing bookkeeper is using
    let oldInputs = null;

    //doesn't handle pasting with mouse
    // really funky and bad code IMO. should change (removing text, inserting, then changing color)
    $('#node-name').keyup(function () {
        d3node.selectAll("text").remove();
        let tmpNode = JSON.parse(JSON.stringify(d));
        thisGraph.insertTitleLinebreaks(d3node, tmpNode);
        d3node.selectAll("text").attr('fill', 'lightgray');
    });

    if (graphObj.taskClasses[nodeClass].multithreaded) {
        $('#thread-cnt').keyup(function () {
            d3node.selectAll("text").remove();
            thisGraph.insertTitleLinebreaks(d3node, d);
            d3node.selectAll("text").attr('fill', 'lightgray');
        });
    }

    // from stackunderflow (find link later...oops)
    $('input.htgs-var').keydown(function(e) {
        // When a new character was typed in
        // 32 - ASCII for Space;
        // `return false` cancels the keypress
        if (e.which === 32) {
            return false;
        }
    });

    if (classType === 'bookkeeper') {
        const inputButton = $('#add-class-input');

        // keep track of which task classes are using a data class
        if (d.title in graphObj.instances) {
            oldInputs = graphObj.instances[d.title].inputs;
        }

        for (let dataClass in graphObj.dataClasses) {
            let entry = `<option value="${dataClass}">`;
            $('#data-classes').append(entry);
        }

        inputButton.on('click', function(){
            const input = $('#class-input');
            let inputList = $('#input-list');
            const validId = validIdentifier(input.val());
            if (inputList.children().length < 1 && validId) {
                addIO(input, inputList);
            }
            else if (!validId) {
                alert('Invalid identifier!\n' +
                    'By convention, classes must start with an uppercase letter\n' +
                    'and are followed by any combination of upper and lower case letters.');
            }
            else {
                alert('Error! Currently, tasks can only have one input.');
            }
        });

        $('.IO-list').on('click', '.rm-item', function () {
            $(this).parent().fadeOut(500, function () { $(this).remove(); });
        });
    }

    let add_task_button = $('#create-class-done');
    add_task_button.on('click', function () {
        thisGraph.createNode(d3node, node, classType);
        if (classType === 'bookkeeper') {
            $("#class-type option[value='bookkeeper']").remove();
            if (oldInputs !== null) {
                let newInputs = graphObj.instances[node.title].inputs;
                for (let inp of oldInputs.values()) {
                    if(!newInputs.has(inp)) {
                        graphObj.dataClasses[inp].users.delete(node.title);
                    }
                }
            }
        }
    });
}

function getAvailableName(taskClassName) {
    let taskClass = graphObj.taskClasses[taskClassName];
    let instances = taskClass.instances;

    // initial name
    let i = instances.size;
    if (i === 0) { i++; }
    let name = `${taskClassName[0].toLowerCase() + taskClassName.slice(1)}${i}`;

    while(instances.has(name)) {
        i++;
        name = `${taskClassName[0].toLowerCase() + taskClassName.slice(1)}${i}`;
    }

    return name;
}

function processUpload(uploadGraph, thisGraph) {
    const bookkeeper = JSON.parse(JSON.stringify(graphObj.taskClasses.Bookkeeper));
    thisGraph.deleteGraph(true);
    graphObj = JSON.parse(JSON.stringify(uploadGraph));
    // save and add Bookkeeper since it's kind of hardcoded and needs to be an option in any graph
    graphObj.taskClasses.Bookkeeper = bookkeeper;
    graphObj.taskClasses.Bookkeeper.instances = new Set(uploadGraph.taskClasses.Bookkeeper.instances);
    let taskClassSelection = $('#taskclass-selection');
    taskClassSelection.children().remove();
    taskClassSelection.append('<option value="Bookkeeper>Bookkeeper</option>');

    // very annoying process due to the fact that sets are not saved with JSON.stringify()
    // this means I have to save any set as an array and convert those to sets on upload
    for (let name in graphObj.taskClasses) {
        let taskClass = graphObj.taskClasses[name];
        if (taskClass.type !== 'bookkeeper') {
            graphObj.taskClasses[name].inputs = new Set(taskClass.inputs);
            graphObj.taskClasses[name].outputs = new Set(taskClass.outputs);
        }
        else {
            for (let inst of taskClass.instances) {
                graphObj.instances[inst].inputs = new Set(graphObj.instances[inst].inputs);
            }
        }
        graphObj.taskClasses[name].instances = new Set(taskClass.instances);
        taskClassSelection.append(`<option value="${name}">${name}</option>`);
    }
    for (let name in graphObj.instances) {
        let instance = graphObj.instances[name];
        graphObj.instances[name].edgesIn = new Set(instance.edgesIn);
        graphObj.instances[name].edgesOut = new Set(instance.edgesOut);
    }

    let dataClassSelection = $('#dataclass-selection');
    dataClassSelection.children().remove();
    dataClassSelection.append('<option value="new">New Dataclass</option>');
    for (let name in graphObj.dataClasses) {
        let dataClass = graphObj.dataClasses[name];
        graphObj.dataClasses[name].users = new Set(dataClass.users);
        dataClassSelection.append(`<option value="${name}">${name}</option>`);
    }
    thisGraph.nodes = uploadGraph.nodes;
    // save GraphIO edges in/out as a set since they're saved as an array in the JSON
    thisGraph.nodes[0].edgesOut = new Set(uploadGraph.nodes[0].edgesOut);
    thisGraph.nodes[1].edgesIn = new Set(uploadGraph.nodes[1].edgesIn);
    // get new idCt for the graph larger than any of the existing nodes to avoid overwriting them
    let idCt = Math.max(...uploadGraph.nodes.map(node => node.id)) + 1;
    thisGraph.setIdCt(idCt);
    let newEdges = uploadGraph.edges;
    newEdges.forEach(function(e, i){
        newEdges[i] = {source: thisGraph.nodes.filter(function(n){return n.id === e.source;})[0],
            target: thisGraph.nodes.filter(function(n){return n.id === e.target;})[0]};
    });
    thisGraph.edges = newEdges;

    thisGraph.updateGraph();

    graphObj.nodes = thisGraph.nodes;
    graphObj.edges = thisGraph.edges;
}