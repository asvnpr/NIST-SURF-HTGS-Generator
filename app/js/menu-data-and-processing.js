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

// used by different functions and javascript primitives are passed by value
let editParam = false;

/*
    function that check if intended task name is available for use
    and doesn't conflict with a dataClass name
*/
function validName(name) {
    name.replace(/\s/g,'');
    return !(name in graphObj.taskClasses) && !(name in graphObj.dataClasses) && !(name in graphObj.instances);
}

/*
    function that checks if argument is a valid c++ identifier
*/
function validIdentifier(id, classname= true) {
    // identifier rules from: http://www.c4learn.com/cplusplus/cpp-identifiers-tokens/
    let validClass = /(^[A-Z][a-z0-9]+[A-Z]$)|(^[A-Z][a-z0-9]+([A-Z][a-z0-9]+)*$)|(^[A-Z][a-z0-9]+([A-Z][a-z0-9]+)*[A-Z]$)/;
    let validId = /[a-z]+((\d)|([A-Z0-9][a-z0-9]+))*([A-Z])?/;
    // keyword list from http://www.c4learn.com/cplusplus/cpp-keywords/
    let keywords = ['asm', 'auto','break', 'case', 'catch', 'char', 'class', 'const', 'continue',
        'default', 'delete', 'double', 'else', 'enum', 'extern', 'for', 'float', 'friend', 'goto',
        'if', 'inline', 'int', 'long', 'new', 'operator', 'private', 'protected', 'public', 'register',
        'return', 'short', 'signed', 'sizeof', 'static', 'struct', 'switch', 'template', 'this', 'throw',
        'try', 'typedef', 'union', 'unsigned', 'virtual', 'void', 'volatile', 'while'];

    if (classname) {
        return validClass.test(id) && !(keywords.includes(id));
    }
    else {
        return validId.test(id) && !(keywords.includes(id));
    }
}

/*
    function that handles adding IO to an <div> IO container:
    - checks that the input isn't empty
    - checks that the input is a valid identifier in c++, and alerts the user if it's not
    - adds IO in appropriate format with delete button and simple animation
*/
function addIO(newIo, ioList) {
    if (newIo.val() !== '') {
        let newIOVal = newIo.val();
        newIOVal.replace(/\s/g,'');
        let taskName = $('#class-name').val();
        if (validIdentifier(newIOVal) && !(newIOVal in graphObj.taskClasses) && newIOVal !== taskName) {
            const rmItemBtn = '<a href="#" class="rm-item"><i class="glyphicon glyphicon-remove-sign"></i></a>';
            const liItem = `<li class="IO-item"><span>${newIOVal}\t${rmItemBtn}</span></li>`;
            $(liItem).appendTo(ioList).hide().fadeIn(500);
            newIo.val('');
        }
        else {
            alert("Error! Invalid identifier. \n Must start with an upppercase character" +
                "followed by any combination of alphanumerical characters.\n" +
                "Input/Output classes cannot be any of the Task Class names.");
        }
    }
}

/*
    function that extracts the values inside a JQUERY objects
    particularly the values of <li> tags in a <ul>
*/
function listValues(list) {
    let vals = [];
    list.children().map(function () {
        vals.push(this.textContent.replace(/\s/g,''));
    });
    return vals;
}

/*
    when a task class is deleted, delete all of it's instances, nodes, and edges
*/
function deleteTaskNodes(taskName) {
    let instances = graphObj.taskClasses[taskName].instances;
    let nodeToDel = new Set([]);
    for (let inst of instances.values()) {
        nodeToDel.add(graphObj.instances[inst].graphID);
        delete graphObj.instances[inst];
    }
    // start at 2 since the first two nodes are always the source and sink
    let i = 2;
    // kinda ugly solution. would be more elegant if we change guiGraph.nodes to be a Set
    // but this requires refactoring a bunch of graph-creator.js, but I didn't have time this summer
    // TODO: if there's time, refactor graph-creator.js to use nodes as a Set and change this function accordingly
    while (nodeToDel.size > 0) {
        let nodeID = guiGraph.nodes[i].id;
        if (nodeToDel.has(nodeID)) {
            guiGraph.spliceLinksForNode(graphObj.nodes[i]);
            graphObj.nodes.splice(i, 1);
            nodeToDel.delete(nodeID);
        }
        else {
            i++;
        }
    }
}

function isInvalidGraph(graphName) {
    const edges = guiGraph.edges;
    const nodes = guiGraph.nodes;
    const instances = graphObj.instances;
    let tasks = Array.from(new Set(Object.keys(instances).map(inst => instances[inst].taskClass)));
    const invalEdges = [];
    const invalNodes = [];
    const unconnedtedNodes = [];
    const invalNodeNames = [];
    const invalTaskNames = [];
    const invalDataNames = [];
    let invalid = false;

    // check for any invalid edges
    for (let edge of edges) {
        if (!edge.source.isGraphIO && !edge.target.isGraphIO) {
            let srcOuts = graphObj.taskClasses[edge.source.taskClass].outputs;
            if (edge.source.taskClass === 'Bookkeeper') {
                srcOuts = graphObj.instances[edge.source.title].inputs;
            }
            let dstIns = graphObj.taskClasses[edge.target.taskClass].inputs;
            if (edge.target.taskClass === 'Bookkeeper') {
                dstIns = graphObj.instances[edge.target.title].inputs;
            }
            if (!guiGraph.isValidEdge(srcOuts, dstIns)) {
                let errItem = `\t<li>The edge from ${edge.source.title} to ${edge.target.title} is invalid.</li>`;
                invalEdges.push(errItem);
                invalid = true;
            }
        }
    }
    validateEdges = true;
    guiGraph.updateGraph();

    // check for any undefined nodes (i.e. "drawn" , but not part of graphObj.instances)
    for (let node of nodes) {
        if (!node.isGraphIO && !(node.title in instances)) {
            let errItem = `\t<li> Node ${node.title} is not declared as part of the Graph Task Instances.</li>`;
            invalNodes.push(errItem);
            invalid = true;
        }
    }

    // check for invalid instance names
    for (let nodeName in instances) {
        if (!validIdentifier(nodeName, false)) {
            let errItem = `\t<li>${nodeName} is an invalid C++ identifier for an instance. You must use lowerCamelCase</li>`;
            invalNodeNames.push(errItem);
            invalid = true;
        }
    }

    // check for invalid task class names
    for (let taskName of tasks) {
        if (!validIdentifier(taskName)) {
            let errItem = `\t<li>${taskName} is an invalid C++ identifier for a Class. You must use UpperCamelCase.</li>`;
            invalTaskNames.push(errItem);
            invalid = true;
        }
    }

    // check for invalid data class names
    for (let dataClass in graphObj.dataClasses) {
        if (!validIdentifier(dataClass)) {
            let errItem = `\t<li>${dataClass} is an invalid Class Name for a Data Class.</li>`;
            invalDataNames.push(errItem);
            invalid = true;
        }
    }

    // check for any unconnected/loose nodes in the tree
    for (let name in instances) {
        const inst = instances[name];
        if (inst.edgesIn.size === 0 && inst.edgesOut.size === 0) {
            let errItem = `\t<li>${name} node has no incoming nor outgoing edge and is disconnected from the graph. </li>`;
            unconnedtedNodes.push(errItem);
            invalid = true;
        }
    }
    // check if Graph has input
    if (graphObj.nodes[0].edgesOut.size === 0) {
        let errItem = '\t<li>The Graph has no input (i.e. the source node isn\'t connected to any node).</li>';
        unconnedtedNodes.push(errItem);
        invalid = true;
    }

    // check if Graph has output
    if (graphObj.nodes[1].edgesIn.size === 0) {
        let errItem = '\t<li>The Graph has no output (i.e. there is no node connected to the sink node).</li>';
        unconnedtedNodes.push(errItem);
        invalid = true;
    }

    if (!invalid) {
        let dialog = $('#graph-gen-dialog');
        dialog.empty();
        let msg = `Your ${graphName} Task Graph has been validated and can now be downloaded.`;
        msg += `\nYour project and zip file will be named ${graphName}Graph`;
        dialog.append(`<br><p>${msg}</p>`);

        let buttons = $('#graph-gen-buttons');
        buttons.append(graphGenBtn);
        buttons.append(htgsDownloadBtn);
    }
    else {
        let dialog = $('#graph-gen-dialog');
        dialog.empty();
        const msg = `<p>Your ${graphName} Task Graph is invalid and has the following errors: <br></p>`;
        dialog.append(msg);
        let errs = invalEdges.concat(invalNodes).concat(invalNodeNames).concat(invalTaskNames).concat(invalDataNames).concat(unconnedtedNodes);
        for (let err of errs) {
            dialog.append(err);
        }

        const title = 'ERROR. Invalid HTGS Task Graph!';
        const notifyMsg = `Your ${graphName} Task Graph has ${errs.length} errors that 
        need to be fixed before code can be generated`;
        notify({title: title, message:notifyMsg});
    }
    return invalid;
}

/*
    function that creates a new Task by:
    creating a new task in the tasks object in graphObj
    adding the new task to the Task Selector in the GUI unless it's an edit
    adding the IO to our Set of data classes
 */
function createTaskClass(className, label, inputs, classType, outputs, simpleTask= false, threading= false) {

    // add new class to class selection in toolbar
    if (!(className in graphObj.taskClasses)) {
        $('#taskclass-selection').append(`<option value="${className}">${className}</option>`);
    }

    // define a new task class in our graph object
    graphObj.taskClasses[className] = {
        label: label,
        inputs: new Set(inputs),
        type: classType,
        outputs: new Set(outputs),
        instances: (onEditMenu)? graphObj.taskClasses[className].instances : new Set([])
    };
    if (simpleTask) {
        graphObj.taskClasses[className].multithreaded = threading;
    }
    // add any new data classes to our data classes object
    let taskDataClasses = new Set([...inputs, ...outputs]);
    updateDataClasses(className, taskDataClasses);
}

const supportedTypes = new Set(['bool', 'short', 'int', 'long', 'float', 'double', 'string', 'Dataclass']);

function handleParamEdit(params, name) {
    let paramType = $('#new-param-type');
    let paramName = $('#new-param-name');
    let paramGetter = $('#new-param-getter');
    let paramSetter = $('#new-param-setter');
    let paramAccess = $('#new-param-access');
    let paramPointer = $('#new-param-pointer');
    let param = params[name];

    if (!supportedTypes.has(param.type)) {
        let dataclassSelect = $('#new-param-dataclass');
        let customParam = $('#custom-param-type');
        if (param.type in graphObj.dataClasses) {
            paramPointer.prop('checked', false);
            paramPointer.prop('disabled', true);
            customParam.remove();
            $('#custom-param-warn').remove();
            paramType.after(dataclassParamSelect);
            for (let dataclass in graphObj.dataClasses) {
                dataclassSelect.append(`<option value="${dataclass}">${dataclass}</option>`);
            }
            paramType.val('Dataclass');
            dataclassSelect.val(param.type);
        }
        else {
            paramType.after(customParamType);
            $('#new-param-header').after(customParamWarning);
            dataclassSelect.remove();
            paramType.val('Custom');
            customParam.val(param.type);
        }
    }
    else {
        paramType.val(param.type);
    }
    paramAccess.val(param.access);
    paramName.val(name);
    paramGetter.prop('checked', param.getter);
    paramSetter.prop('checked', param.setter);

    if (param.pointer === null) {
        paramPointer.prop('disabled', true);
    }
    else {
        paramPointer.prop('checked', param.pointer);
    }
    delete params[name];
    editParam = true;
}

function fillParametersInfo(dataClassName) {
    let params = graphObj.dataClasses[dataClassName].parameters;

    for (let key in params) {
        const param = params[key];

        let access = param.access;
        let type = param.type;
        let name = key;
        let getter = params[name].getter;
        let getterVal = getter? checkedIcon : uncheckedIcon;
        let setter = params[name].setter;
        let setterVal = setter? checkedIcon : uncheckedIcon;
        let pointer = params[name].pointer;
        let pointerVal = pointer === null? 'N/A' : (pointer? checkedIcon : uncheckedIcon);

        let paramRow = genParameterRow(type, name, getterVal, setterVal, pointerVal);
        if (access === 'private') {
            $('#private-params').append(paramRow);
        }
        else if (access === 'protected') {
            $('#protected-params').append(paramRow);
        }
        else if (access === 'public') {
            $('#public-params').append(paramRow);
        }
    }

    $('.param-edit').click(function() {
        const tableRow = $(this).parent().parent();
        const name = tableRow.prop('id');
        tableRow.remove();
        handleParamEdit(params, name);
    });

    $('.param-rm').click(function() {
        const tableRow = $(this).parent().parent();
        const name = tableRow.prop('id');
        tableRow.remove();
        delete params[name];
    });
}

function processParam(params) {
    let paramType = $('#new-param-type');
    let paramName = $('#new-param-name');
    let name = paramName.val();
    if (name === '') {
        alert('Error! Parameter name can\'t be empty.');
    }
    else if (validIdentifier(name, false)) {
        if (validName(name) && (!(name in params) || editParam)) {
            let paramGetter = $('#new-param-getter');
            let paramSetter = $('#new-param-setter');
            let paramAccess = $('#new-param-access');
            let access = paramAccess.val();
            let type = paramType.val();
            let customParam = $('#custom-param-type');
            let dataclassSelect = $('#new-param-dataclass');
            if (type === 'Custom') {
                type = customParam.val();
            }
            else if (type === 'Dataclass') {
                type = dataclassSelect.val();
            }
            let getter = paramGetter.prop('checked');
            let getterVal = getter? checkedIcon : uncheckedIcon;
            let setter = paramSetter.prop('checked');
            let setterVal = setter? checkedIcon : uncheckedIcon;
            let paramPointer = $('#new-param-pointer');
            let pointer = paramPointer.prop('checked');
            let pointerVal = paramPointer.prop('disabled')? 'N/A' : (pointer? checkedIcon : uncheckedIcon);

            let paramRow = genParameterRow(type, name, getterVal, setterVal, pointerVal);

            if (access === 'private') {
                $('#private-params').append(paramRow);
            }
            else if (access === 'protected') {
                $('#protected-params').append(paramRow);
            }
            else if (access === 'public') {
                $('#public-params').append(paramRow);
            }
            params[name] = {
                access: access,
                type: type,
                getter: getter,
                setter: setter,
                pointer: paramPointer.prop('disabled')? null : pointer
            };

            // reset editing Parameter check
            editParam = false;

            // remove and fix edge case elements on successful addition of parameter
            $('#new-param-container')[0].reset();
            paramPointer.prop('disabled', false);
            customParam.remove();
            $('#custom-param-warn').remove();
            dataclassSelect.remove();

            $('.param-edit').click(function() {
                const tableRow = $(this).parent().parent();
                const name = tableRow.prop('id');
                tableRow.remove();
                handleParamEdit(params, name);
            });

            $('.param-rm').click(function() {
                const tableRow = $(this).parent().parent();
                const name = tableRow.prop('id');
                tableRow.remove();
                delete params[name];
            });
        }
        else {
            alert(`Error! The identifier ${name} is already in use.`);
        }
    }
    else {
        alert(`Error! ${name} is an invalid C++ identifier`);
    }
}

function saveParams(dataClassName, params) {
    let dataClass = graphObj.dataClasses[dataClassName];
    dataClass.parameters = JSON.parse(JSON.stringify(params));
    DC_modal.iziModal('close');
}

function dataClassMenu(dataClassName) {
    let dataClass = null;
    if (dataClassName in graphObj.dataClasses) {
        dataClass = graphObj.dataClasses[dataClassName];
    }
    else {
        dataClass = {
            parameters: {},
            users: new Set([])
        };
        $('#params-wrapper').prepend(newDataClassWarning);
    }
    let params = {};
    if (Object.keys(dataClass.parameters).length > 0) {
        params = JSON.parse(JSON.stringify(dataClass.parameters));
        fillParametersInfo(dataClassName);
    }
    let paramType =$('#new-param-type');

    const menuTitle = `Editing ${dataClassName} parameters: `;
    DC_modal.iziModal('setTitle', menuTitle);
    DC_modal.iziModal('open');

    $('input.htgs-var').keydown(function(e) {
        // When a new character was typed in
        // 32 - ASCII for Space;
        // `return false` cancels the keypress
        if (e.which === 32) {
            return false;
        }
    });

    paramType.change(function() {
        let type = paramType.val();
        let pointerCheck = $('#new-param-pointer');
        if(type === 'Dataclass') {
            pointerCheck.prop('checked', false);
            pointerCheck.prop('disabled', true);
            $('#custom-param-type').remove();
            $('#custom-param-warn').remove();
            paramType.after(dataclassParamSelect);
            let dataclassSelect = $('#new-param-dataclass');
            for (let dataclass in graphObj.dataClasses) {
                if (dataclass !== dataClassName) {
                    dataclassSelect.append(`<option value="${dataclass}">${dataclass}</option>`);
                }
            }
        }
        else if (type === 'Custom') {
            pointerCheck.prop('disabled', false);
            paramType.after(customParamType);
            $('#new-param-header').after(customParamWarning);
            $('#new-param-dataclass').remove();
        }
        else {
            pointerCheck.prop('disabled', false);
            $('#custom-param-type').remove();
            $('#custom-param-warn').remove();
            $('#new-param-dataclass').remove();
        }
    });

    $('#add-dataclass-param').click(function() {
        processParam(params);
        $('#new-param-access').focus();
    });

    $('#dataclass-done').click(function() {
        if (!(dataClassName in graphObj.dataClasses)) {
            graphObj.dataClasses[dataClassName] = dataClass;
            $('#dataclass-selection').append(`<option value="${dataClassName}">${dataClassName}</option>`);
        }
        saveParams(dataClassName, params);
    });
}

/*
    function that fills out, validates, and informs of errors for the input
    for the form of a Simple Task and the creation or edits of said Task
*/
function classMenu (oldName= '') {

    const inputButton = $('#add-class-input');
    const outputButton = $('#add-class-output');
    let oldClasses = null;

    // keep track of which task classes are using a data class
    if (onEditMenu) {
        let classIns = graphObj.taskClasses[oldName].inputs;
        let classOuts = graphObj.taskClasses[oldName].outputs;
        oldClasses = new Set([...classIns, ...classOuts]);
    }

    // NOTE: datalist is not shown unless you start typing, press arrow down, or double click on the field

    for (let dataClass in graphObj.dataClasses) {
        let entry = `<option value="${dataClass}">`;
        $('#data-classes').append(entry);
    }

    inputButton.click(function(){
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
            alert('Error! Currently, tasks and rules can only have one input.');
        }
    });
    outputButton.click(function(){
        let outputList = $('#output-list');
        const output = $('#class-output');
        const validId = validIdentifier(output.val());
        if (outputList.children().length < 1 && validId) {
            addIO(output, outputList);
        }
        else if (!validId) {
            alert('Invalid identifier!\n' +
                'By convention, classes must start with an uppercase letter\n' +
                'and are followed by any combination of alphabetic characters.');
        }
        else {
            alert('Error! Currently, tasks and rules can only have one output.');
        }
    });

    let addTaskButton = $('#create-class-done');
    addTaskButton.click(function () {

        const className = $('#class-name').val();
        let label = $('#class-label').val();
        label = (label === '')? className : label;
        const classType = $('#class-type').val();
        const inputList = $('#input-list');
        const outputList = $('#output-list');
        const inputs = listValues(inputList);
        const outputs = listValues(outputList);

        if (inputs.length < 1) {
            alert('Error! Tasks must have at least one input.');
        }
        else if (outputs.length < 1) {
            alert('Error! Tasks must have at least one output.');
        }
        else if ((validIdentifier(className) && validName(className)) || (onEditMenu && className === oldName)) {
            if (classType === 'simple-task') {
                const threading = $('#threading-check').prop('checked');
                createTaskClass(className, label, inputs, classType, outputs, true, threading);
                if (onEditMenu) {
                    validateEdges = true;
                    for (let name of oldClasses.values()) {
                        let classIns = graphObj.taskClasses[className].inputs;
                        let classOuts = graphObj.taskClasses[className].outputs;
                        if (!classIns.has(name) && !classOuts.has(name)) {
                            let dataClass = graphObj.dataClasses[name];
                            dataClass.users.delete(className);
                        }
                    }
                    guiGraph.updateGraph();
                }
                TC_modal.iziModal('close');
            }
            else if (classType === 'bookkeeper-rule') {
                createTaskClass(className, label, inputs, classType, outputs);
                if (onEditMenu) {
                    validateEdges = true;
                    for (let name of oldClasses.values()) {
                        let classIns = graphObj.taskClasses[className].inputs;
                        let classOuts = graphObj.taskClasses[className].outputs;
                        if (!classIns.has(name) && !classOuts.has(name)) {
                            let dataClass = graphObj.dataClasses[name];
                            dataClass.users.delete(className);
                        }
                    }
                    guiGraph.updateGraph();
                }
                TC_modal.iziModal('close');
            }

        }
        else if (!validIdentifier(className)) {
            alert('Error! Task names must use upper Camel Case');
        }
        else {
            alert('Error!\n Task names must be unique. Please correct this error to create your task.\n' +
                'Task names cannot be any of the Input/Output Classes.');
        }

    });

    /*
        remove IO from an IO container:
            - remove a <li> IO item with appropriate animation
    */

    $('.IO-list').on('click', '.rm-item', function() {
        $(this).parent().fadeOut(500, function() { $(this).remove(); });
    });

    // delete task button is pressed
    $('#rm-class-btn').click(function() {
        // maybe should add pop-up dialog to confirm task deletion??
        //e.preventDefault();
        const task = $('#taskclass-selection');
        const taskName = task.val();
        let taskClass = graphObj.taskClasses[taskName];
        let taskDataClasses = new Set([...taskClass.inputs, ...taskClass.outputs]);
        for (let name of taskDataClasses) {
            graphObj.dataClasses[name].users.delete(taskName);
        }
        deleteTaskNodes(taskName);
        delete graphObj.taskClasses[taskName];
        task.find('option:selected').remove().end();
        TC_modal.iziModal('close');
        const title = `Deleted ${taskName}`;
        const msg = 'This task class and all of it\'s instances have been deleted';
        notify({title: title, message:msg});
        guiGraph.updateGraph();
    });

    // from: https://stackoverflow.com/questions/14236873/disable-spaces-in-input-and-allow-back-arrow
    $('input.htgs-var').keydown(function(e) {
        // When a new character was typed in
        // 32 - ASCII for Space;
        // `return false` cancels the keypress
        if (e.which === 32) {
            return false;
        }
    });
}

/*
    function to fill out the fields of the form of an existing task
*/
function fillSimpleTaskInfo(taskName, nodeIdx = null) {

    const task = graphObj.taskClasses[taskName];
    const taskLabel = task.label;

    if (onInstanceMenu) {
        const nodeName = graphObj.nodes[nodeIdx].title;
        $('#node-name').val(nodeName);
    }
    $('#class-type').val(task.type);
    $('#class-name').val(taskName);
    $('#class-label').val(taskLabel);
    let optBtn = (onInstanceMenu)? '' : `\t${ioRmBtn}`;

    if(task.multithreaded) {
        if(onInstanceMenu) {
            $('#task-threading').append(threadCountField);
            const nodeName = graphObj.nodes[nodeIdx].title;
            if (nodeName in graphObj.instances) {
                $('#thread-cnt').val(graphObj.instances[nodeName].threads);
            }
        }
        else {
            $('#threading-check').prop('checked', true);
        }
    }

    const inputList = $('#input-list');
    for (let input of task.inputs) {
        const li_item = `<li> ${input}${optBtn}</li>`;
        $(li_item).appendTo(inputList).hide().fadeIn(500);
    }

    const outputList = $('#output-list');
    for (let output of task.outputs) {
        const li_item = `<li> ${output}${optBtn}</li>`;
        $(li_item).appendTo(outputList).hide().fadeIn(500);
    }
}

function fillRuleInfo(ruleName, nodeIdx= null) {
    const rule = graphObj.taskClasses[ruleName];
    const ruleLabel = rule.label;

    if (onInstanceMenu) {
        const nodeName = graphObj.nodes[nodeIdx].title;
        $('#node-name').val(nodeName);
    }
    $('#class-type').val(rule.type);
    $('#class-name').val(ruleName);
    $('#class-label').val(ruleLabel);
    let optBtn = (onInstanceMenu)? '' : `\t${ioRmBtn}`;

    const inputList = $('#input-list');
    for (let input of rule.inputs) {
        const liItem = `<li> ${input} ${optBtn}</li>`;
        $(liItem).appendTo(inputList).hide().fadeIn(500);
    }

    const outputList = $('#output-list');
    for (let output of rule.outputs) {
        const liItem = `<li> ${output} ${optBtn}</li>`;
        $(liItem).appendTo(outputList).hide().fadeIn(500);
    }
}

function fillBookkeeeperInfo(nodeName) {
    const bookkeeper = graphObj.instances[nodeName];
    const inputList = $('#input-list');
    for (let input of bookkeeper.inputs) {
        const liItem = `<li> ${input}\t${ioRmBtn}</li>`;
        $(liItem).appendTo(inputList).hide().fadeIn(500);
    }
}

function handleSimpleTask(form, taskName= '', nodeIdx= null) {
    if (onInstanceMenu) {
        form.append(taskInstanceForm);
        $('#class-label').prop('disabled', true);
    }
    else {
        form.append(simpleTaskForm);
    }

    if (onEditMenu || onInstanceMenu) {
        $('#class-type').prop('disabled',true);
        $('#class-name').prop('disabled', true);
        $('#create-class-done').text('Done');
        let menuTitle = '';

        if(!onInstanceMenu) {
            $('#create-done').append(rmClassBtn);
            menuTitle = `Editing ${taskName}: `;
        }
        else {
            const nodeName = graphObj.nodes[nodeIdx].title;
            menuTitle = `Editing ${nodeName}: `;
        }

        TC_modal.iziModal('setTitle', menuTitle);
        TC_modal.iziModal('open');
        fillSimpleTaskInfo(taskName, nodeIdx);
    }
    if (!onInstanceMenu) {
        if (onEditMenu) {
            classMenu(taskName);
        }
        else {
            classMenu();
        }
    }
}

function handleBookkeeperRule(form, ruleName= '', nodeIdx= null) {
    if (onInstanceMenu) {
        form.append(ruleInstanceForm);
        $('#class-label').prop('disabled', true);
    }
    else {
        form.append(ruleForm);
    }

    if (onEditMenu || onInstanceMenu) {
        $('#class-type').prop('disabled', true);
        $('#class-name').prop('disabled', true);
        $('#create-class-done').val('Done');
        let menuTitle = '';

        if(!onInstanceMenu) {
            $('#create-done').append(rmClassBtn);
            menuTitle = `Editing ${ruleName}: `;
        }
        else {
            const nodeName = graphObj.nodes[nodeIdx].title;
            menuTitle = `Editing ${nodeName}: `;

        }

        TC_modal.iziModal('setTitle', menuTitle);
        TC_modal.iziModal('open');
        fillRuleInfo(ruleName, nodeIdx);
    }

    if (!onInstanceMenu) {
        if (onEditMenu) {
            classMenu(ruleName);
        }
        else {
            classMenu();
        }
    }
}

function handleBookkeeperNode(form, className, nodeIdx) {
    form.append(bookkeeperInstanceForm);

    let classType = $('#class-type');
    classType.val('bookkeeper');
    classType.prop('disabled', true);
    const nodeName = graphObj.nodes[nodeIdx].title;
    $('#node-name').val(nodeName);
    if (nodeName in graphObj.instances) {
        fillBookkeeeperInfo(nodeName);
    }
    const menuTitle = `Editing ${nodeName}: `;
    TC_modal.iziModal('setTitle', menuTitle);
    TC_modal.iziModal('open');
}

function saveGraph(graphName) {
    graphObj.graphName = graphName;
    let instances = graphObj.instances;
    // only save data classes that were used by instances in the graph
    let finalDataClasses = {};
    for (let name in graphObj.dataClasses) {
        let dataClass = graphObj.dataClasses[name];
        if (dataClass.users.size > 0) {
            finalDataClasses[name] = {
                parameters: dataClass.parameters,
                users: Array.from(dataClass.users)
            };
        }
    }
    // only save tasks that were explicitly declared in the graph
    let finalTaskClasses = {};
    for (let name in graphObj.taskClasses) {
        let taskClass = graphObj.taskClasses[name];
        if (taskClass.instances.size > 0) {
            finalTaskClasses[name] = taskClass;
        }
    }

    let savableGraph = JSON.parse(JSON.stringify(graphObj));
    savableGraph.taskClasses = JSON.parse(JSON.stringify(finalTaskClasses));
    savableGraph.dataClasses = JSON.parse(JSON.stringify(finalDataClasses));

    // very annoying process due to the fact that sets are not saved with JSON.stringify()
    for (let name in finalTaskClasses) {
        let taskClass = graphObj.taskClasses[name];
        if (taskClass.type !== 'bookkeeper') {
            savableGraph.taskClasses[name].inputs = Array.from(taskClass.inputs);
            savableGraph.taskClasses[name].outputs = Array.from(taskClass.outputs);
        }
        else {
            for (let inst of taskClass.instances.values()) {
                savableGraph.instances[inst].inputs = Array.from(graphObj.instances[inst].inputs);
            }
        }
        savableGraph.taskClasses[name].instances = Array.from(taskClass.instances);
    }

    for (let name in graphObj.instances) {
        let instance = graphObj.instances[name];
        savableGraph.instances[name].edgesIn = Array.from(instance.edgesIn);
        savableGraph.instances[name].edgesOut = Array.from(instance.edgesOut);
    }

    let saveEdges = [];
    guiGraph.edges.forEach(function(val){
        saveEdges.push({source: val.source.id, target: val.target.id});
    });
    savableGraph.edges = saveEdges;
    savableGraph.nodes[0].edgesOut = Array.from(graphObj.nodes[0].edgesOut);
    savableGraph.nodes[1].edgesIn = Array.from(graphObj.nodes[1].edgesIn);
    let graphJSON = JSON.stringify(savableGraph);

    let fileName = `${graphName}.json`;
    let graphFile = new Blob([graphJSON], {type: 'application/json', name: fileName});
    saveAs(graphFile, fileName);
}