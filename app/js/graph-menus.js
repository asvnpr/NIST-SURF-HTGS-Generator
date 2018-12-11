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

"use strict";

// control if d3 disables or enables the backspace and delete keys.
// needed for default graph key bindings and controls
let onTextMenu = false;
// used to control Edit Task Form parameters and buttons
let onEditMenu = false;
let onInstanceMenu = false;

// both used to control aspects of the graph creation GUI
let drawTask = false;
let drawEdge = false;


// modal for task classes
let TC_modal = $('#class-menu').iziModal({
    title: '',
    headerColor: '#3091FE',
    theme: 'light',
    appendTo: '#column-right',
    overlay: false,
    borderBottom: false,
    radius: 0,
    focusInput: true,
    transitionIn: 'comingIn',
    transitionOut: 'comingOut',
    onOpened: function () {
        onTextMenu = true;
    },
    onClosed: function(){
        let classType = $('#class-type');
        classType.val('simple-task');
        classType.prop('disabled',false);
        // unbinding to avoid repeat bindings of events
        $('#add-class-input').unbind('click');
        $('#add-class-output').unbind('click');
        $('#create-class-done').unbind('click');
        $('.IO-list').unbind('click');
        if (onEditMenu) {
            $('#rm-class-btn').unbind('click');
        }
        guiGraph.updateGraph();
        onTextMenu = false;
        onEditMenu = false;
        onInstanceMenu = false;
        $('.removable-parameter').remove();
    }
});

// modal for edge data
let ED_modal = $('#edge-menu-container').iziModal({
    title: '',
    headerColor: '#F8C163',
    theme: 'light',
    appendTo: '#column-right',
    overlay: false,
    borderBottom: false,
    radius: 0,
    focusInput: true,
    transitionIn: 'comingIn',
    transitionOut: 'comingOut',
    onOpened: function () {
        onTextMenu = true;
    },
    onClosed: function () {
        onTextMenu = false;

    }
});

// modal for graph generation
let GG_modal = $('#graph-gen-container').iziModal({
    title: '',
    headerColor: '#AA382D',
    theme: 'light',
    appendTo: '#column-right',
    overlay: false,
    borderBottom: false,
    radius: 0,
    focusInput: true,
    transitionIn: 'comingIn',
    transitionOut: 'comingOut',
    onOpened: function () {
        onTextMenu = true;
    },
    onClosed: function () {
        onTextMenu = false;
        GG_modal.iziModal('setHeaderColor', '#AA382D');
        $('#graph-gen-buttons').empty();
    }
});

// modal for dataclass parameters
let DC_modal = $('#dataclass-params-container').iziModal({
    title: '',
    headerColor: '#54BDFE',
    theme: 'light',
    width: '45%',
    overlay: false,
    borderBottom: false,
    radius: 0,
    focusInput: true,
    transitionIn: 'comingIn',
    transitionOut: 'comingOut',
    onOpened: function () {
        onTextMenu = true;
    },
    onClosed: function () {
        onTextMenu = false;
        // unbinding to avoid repeat bindings of events
        $('#add-dataclass-param').unbind('click');
        $('#dataclass-done').unbind('click');
        $('#new-param-container')[0].reset();
        $('.removable-row').remove();
        $('#new-DC-warn').remove();
        $('#new-param-type').unbind('change');
        $('#custom-param-type').remove();
        $('#custom-param-warn').remove();
        $('#new-param-dataclass').remove();
    }
});

let notify = window.createNotification({
   closeOnClick: true,
   displayCloseButton: true,
   positionClass: 'nfc-top-right',
   onclick: false,
   showDuration: 5000,
   theme: 'info'
});

function edgeMenu(graph, edge) {

    const title = 'Edge data: ';
    ED_modal.iziModal('setTitle', title);
    const edgeData = $('#edge-data-menu');
    edgeData.html('');
    edgeData.append(edgeInfoMenu);
    $('#src-node').text('Source Node: ' + edge.source.title);
    $('#dst-node').text('Target Node: ' + edge.target.title);

    // if any of the edge involving a Task Graph source or sink
    if (edge.source.isGraphIO || edge.target.isGraphIO) {
        if (edge.source.isGraphIO && edge.source.title === 'source') {
            // get info about what data class is being passed around. handle bookkeepers.
            const dstTaskClass = graphObj.taskClasses[edge.target.taskClass];
            let dstIns = null;
            if (edge.target.taskClass === 'Bookkeeper') {
                dstIns = graphObj.instances[edge.target.title].inputs;
            }
            else {
                dstIns = dstTaskClass.inputs;
            }
            let edgeData = '';
            for (let data of dstIns) {
                edgeData += data + '';
            }
            $('#edge-data').text(`Edge Data: ${edgeData}`);
        }
        else if (edge.target.isGraphIO && edge.target.title === 'sink') {
            // get info about what data class is being passed around.
            // don't have to worry about bookkeeper since GUI prevents bookkeeper->sink edges
            const srcTaskClass = graphObj.taskClasses[edge.source.taskClass];
            let edgeData = '';
            for (let data of srcTaskClass.outputs) {
                edgeData = edgeData + data + '';
            }
            $('#edge-data').text(`Edge Data: ${edgeData}`);
        }
    }
    // edge between 2 non-graphIO nodes
    else {
        const srcTaskClass = graphObj.taskClasses[edge.source.taskClass];
        const dstTaskClass = graphObj.taskClasses[edge.target.taskClass];
        let srcOuts = null;
        if (edge.source.taskClass === 'Bookkeeper') {
            srcOuts = graphObj.instances[edge.source.title].inputs;
        }
        else {
            srcOuts = srcTaskClass.outputs;
        }
        let dstIns = null;
        if (edge.target.taskClass === 'Bookkeeper') {
            dstIns = graphObj.instances[edge.target.title].inputs;
        }
        else {
            dstIns = dstTaskClass.inputs;
        }
        if (graph.isValidEdge(srcOuts, dstIns)) {
            let edgeData = '';
            for (let data of srcOuts.values()) {
                edgeData += data + '';
            }
            $('#edge-data').text(`Edge Data: ${edgeData}`);
        }
        else {
            $('#edge-data').text('Edge Data: INVALID');
        }
    }

    // basic handling of bidirectional edge (loop)
    // ignore if sink node since it can't have an outgoing edge
    if (!edge.target.isGraphIO) {
        let dstOuts = graphObj.instances[edge.target.title].edgesOut;
        // if target node has edge back to source node
        if (dstOuts.has(edge.source.title)) {
            edgeData.append('<h5>Second Edge info: </h5>');
            edgeData.append(secondEdgeInfoMenu);
            $('#src-node2').text('Second Source Node: ' + edge.target.title);
            $('#dst-node2').text('Second Target Node: ' + edge.source.title);

            const srcTaskClass = graphObj.taskClasses[edge.source.taskClass];
            const dstTaskClass = graphObj.taskClasses[edge.target.taskClass];
            let srcIns = null;
            if (edge.source.taskClass === 'Bookkeeper') {
                srcIns = graphObj.instances[edge.source.title].inputs;
            }
            else {
                srcIns = srcTaskClass.inputs;
            }
            let dstOuts = null;
            if (edge.target.taskClass === 'Bookkeeper') {
                dstOuts = graphObj.instances[edge.target.title].inputs;
            }
            else {
                dstOuts = dstTaskClass.outputs;
            }
            if (graph.isValidEdge(dstOuts, srcIns)) {
                let edgeData = '';
                for (let data of dstOuts.values()) {
                    edgeData += data + '';
                }
                $('#edge-data2').text(`Edge Data: ${edgeData}`);
            }
            else {
                $('#edge-data2').text('Edge Data: INVALID');
            }

        }
    }
    // open the edge data modal
    ED_modal.iziModal('open');

}

/*
    function to handle a class and instance creation/editing form:

*/
function formHandler(classType, className= '', nodeIdx= null) {

    const form = $('#class-parameters');

    if (classType === 'simple-task') {
        handleSimpleTask(form, className, nodeIdx);
    }
    else if (classType === 'bookkeeper-rule') {
        handleBookkeeperRule(form, className, nodeIdx);
    }
    else if (classType === 'bookkeeper') {
        if (onInstanceMenu) {
            let classTy = $('#class-type');
            classTy.append('<option value="bookkeeper">Bookkeeper Instance</option>');
            classTy.val('bookkeeper');
            handleBookkeeperNode(form, className, nodeIdx);
        }
        else {
            alert('Error! Bookkeeper Class cannot be edited at all.' +
                '\n Only instances can be created and edited');
        }
    }
    else {
        alert('Can\'t handle this type of task yet.');
    }
}

$(document).ready(function(){

    const taskClassSelection = $('#taskclass-selection');
    for (const task of Object.keys(graphObj.taskClasses)) {
        taskClassSelection.append(`<option value="${task}">${task}</option>`);
    }

    /*
        event handler for creating a task:
        adds appropriate title and calls formHandler to add the rest of the form fields
    */
    $('#create-class').on('click', function(){

        TC_modal.iziModal('setTitle', 'Create a Task:');
        TC_modal.iziModal('open');

        const taskType = $('#class-type').val();
        formHandler(taskType);
    });

    /*
        event handler for editing a task:
        toggles our ediMenu bool to true
        calls formHandler to add and fill the rest of the form fields, title, etc.
    */
    $('#edit-class').click(function(){
        const className = $('#taskclass-selection').val();
        const classType = graphObj.taskClasses[className].type;
        if (classType !== 'bookkeeper') {
            onEditMenu = true;
        }
        formHandler(classType, className);

    });

    $('#class-params').click(function() {
        const className = $('#dataclass-selection').val();
        if (className === 'new') {
            let dataClassName = prompt('Give a valid C++ Class name for your Data Class: ');
            if (dataClassName !== null) {
                if (dataClassName !== '') {
                    if (validIdentifier(dataClassName)) {
                        if (validName(dataClassName)) {
                            dataClassName = dataClassName.replace(/\s/g,'');
                            dataClassMenu(dataClassName);
                        }
                        else {
                            alert(`Error! The name ${dataClassName} is already being used by a Data Class, Task Class, or node.`);
                        }
                    }
                    else {
                        alert('Invalid name for a Data Class!\n' +
                            'To follow conventions, the name must start with an uppercase letter followed by any combination' +
                            'of alphanumeric characters (upper Camel Case).');
                    }
                }
                else {
                    alert('Error! Data Class name cannot be empty.');
                }
            }
        }
        else {
            dataClassMenu(className);
        }
    });

    /*
        if the type of tasks changes, then call formHandler to handle this change in the form
    */
    $('#class-type').change(function() {
        $('.removable-parameter').remove();
        if ($(this).val() === 'bookkeeper') {
            onInstanceMenu = true;
        }
        formHandler($(this).val());
    });

    $('#download-graph').click(function() {
        let graphName = graphObj.graphName;
        if (graphName !== null) {
            let confirmGraphName = confirm(`This Task Graph is currently named: ${graphName}. \nWould you like to change the name?`);
            if (confirmGraphName) {
                graphName = prompt('Enter a name for your task graph:', 'GraphyMcGraphFace');
            }
        }
        else {
            graphName = prompt('Enter a name for your task graph:', 'GraphyMcGraphFace');
        }

        if (graphName !== null) {
            if (graphName !== '') {
                if (validIdentifier(graphName)) {
                    if (validName(graphName, false)) {
                        graphName.replace(/\s/g,'');
                        let inval = isInvalidGraph(graphName);
                        let title = `${graphName} Task Graph: `;
                        GG_modal.iziModal('setTitle', title);
                        GG_modal.iziModal('open');
                        if (!inval) {
                            GG_modal.iziModal('setHeaderColor', '#128B5D');
                            $('#gen-graph').click(function () {
                                graphName += 'Graph';
                                genGraph(graphName);
                            });
                        }
                    }
                    else {
                        alert(`Error! The name ${dataClassName} is already being used by a Data Class, Task Class, or node.`);
                    }
                }
                else {
                    alert('Invalid name for graph!\n' +
                        'To follow conventions, the name must start with an uppercase letter followed by any combination' +
                        'of alphabetic characters (upper Camel Case).');
                }
            }
            else {
                alert('Error! Graph name cannot be empty.');
            }
        }
    });

    $('#save-graph').click(function() {
        let graphName = prompt('Enter a name for your task graph:', 'GraphyMcGraphFace');
        if (graphName !== null) {
            if (graphName !== '') {
                if (validIdentifier(graphName)) {
                    graphName.replace(/\s/g, '');
                    saveGraph(graphName);
                }
                else {
                    alert('Invalid name for graph!\n' +
                        'To follow conventions, the name must start with an uppercase letter followed by any combination' +
                        'of alphabetic characters (upper Camel Case).');
                }
            }
            else {
                alert('Error! Graph name cannot be empty.');
            }
        }
    });

    /*
        event handler for taskbar buttons to:
        set all buttons to transparent and highlight selected button
        toggle the state of our draw button bools
    */
    const barButtons = $('.button-container');
    let currClick = '';
    barButtons.mouseenter(function() {
            $(this).children().css('opacity', '1');
    })
        .mouseleave(function() {
            if ($(this).attr('id') !== currClick) {
                $(this).children().css('opacity', '0.4');
            }
        })
        .click(function() {
            const btnId =$(this).prop('id').replace(/\s/g, '');
            const noToggleBtns = ['taskclass-selector', 'dataclass-selector', 'taskclass-selection', 'dataclass-selection'];
            const selButton = $(this);
            if (!noToggleBtns.includes(btnId)) {
                currClick = $(this).prop('id');
                barButtons.css('background-color', 'transparent');
                barButtons.children().css('opacity', '0.4');
                selButton.css('background-color', 'lightgray');
                selButton.children().css('opacity', '1');
                // toggle state of draw buttons
                drawTask = selButton.prop('id') === 'draw-node';
                drawEdge = selButton.prop('id') === 'draw-edge';
            }
        });

});