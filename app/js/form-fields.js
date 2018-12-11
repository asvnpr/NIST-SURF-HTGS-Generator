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

// mostly html fragments for forms, buttons, icons, and a function to generate the row for an html table:

const simpleTaskForm = '<div class="removable-parameter" id="class-name-container">\n' +
    '    Task Class Name: <input class="htgs-var" type="text" id="class-name">\n' +
    '</div>\n\n<div class="removable-parameter" id="class-label-container">\n' +
    '    Task Label: <input type="text" id="class-label">\n</div>\n' +
    '\n' +
    '<div class="removable-parameter" id="class-inputs">\n' +
    '    Input class(es):\n' +
    '    <div class="IO-list-box">\n' +
    '        <ul class="IO-list" id="input-list">\n' +
    '        </ul>\n' +
    '    </div>\n' +
    '    <input list="data-classes" class="htgs-var" id="class-input"/>\n' +
    '    <datalist id="data-classes"></datalist>\n' +
    '    <button id="add-class-input" class="htgs-var" type="button">Add</button>\n' +
    '</div>\n' +
    '\n' +
    '<div class="removable-parameter" id="task-threading">\n' +
    '    Multi-threaded?: <input type="checkbox" id="threading-check" min="1">\n' +
    '</div>' +
    '\n' + '<div class="removable-parameter" id="class-outputs">\n' +
    '    Output class(es):\n' +
    '    <div class="IO-list-box">\n' +
    '        <ul class="IO-list" id="output-list">\n' +
    '        </ul>\n' +
    '    </div>\n' +
    '    <input list="data-classes" class="htgs-var" id="class-output"/>\n' +
    '    <button id="add-class-output" type="button">Add</button>\n' +
    '</div>\n' +
    '\n' +
    '<div class="removable-parameter" id="create-done">\n' +
    '    <div id="create-btn">\n' +
    '        <button id="create-class-done">Create  <i class="glyphicon glyphicon-ok"></i></button>\n' +
    '    </div>\n' +
    '</div>';

const ruleForm = '<div class="removable-parameter" id="class-name-container">\n' +
    '    Rule Class Name: <input class="htgs-var" type="text" id="class-name">\n' +
    '</div>\n\n<div class="removable-parameter" id="class-label-container">\n' +
    '    Rule Label: <input type="text" id="class-label">\n</div>\n' +
    '\n' +
    '<div class="removable-parameter" id="class-inputs">\n' +
    '    Input class(es):\n' +
    '    <div class="IO-list-box">\n' +
    '        <ul class="IO-list" id="input-list">\n' +
    '        </ul>\n' +
    '    </div>\n' +
    '    <input list="data-classes" class="htgs-var" id="class-input"/>\n' +
    '    <datalist id="data-classes"></datalist>\n' +
    '    <button id="add-class-input" class="htgs-var" type="button">Add</button>\n' +
    '</div>\n' +
    '\n' +
    '<div class="removable-parameter" id="class-outputs">' +
    ' \n' +
    '    Output class(es):\n' +
    '    <div class="IO-list-box">\n' +
    '        <ul class="IO-list" id="output-list">\n' +
    '        </ul>\n' +
    '    </div>\n' +
    '    <input list="data-classes" class="htgs-var" id="class-output"/>\n' +
    '    <button id="add-class-output" type="button">Add</button>\n' +
    '</div>\n' +
    '\n' +
    '<div class="removable-parameter" id="create-done">\n' +
    '    <div id="create-btn">\n' +
    '        <button id="create-class-done">Create  <i class="glyphicon glyphicon-ok"></i></button>\n' +
    '    </div>\n' +
    '</div>';

const taskInstanceForm = '<div class="removable-parameter" id="node-name-container">\n' +
    '    Node Name: <input class="htgs-var" type="text" id="node-name">\n' +
    '</div>\n'+ '<div class="removable-parameter" id="class-name-container">\n' +
    '    Name: <input class="htgs-var" type="text" id="class-name">\n' +
    '</div>\n\n<div class="removable-parameter" id="class-label-container">\n' +
    '    Task Label: <input type="text" id="class-label">\n</div>\n' +
    '\n' +
    '<div class="removable-parameter" id="class-inputs">\n' +
    '    Input class(es):\n' +
    '    <div class="IO-list-box">\n' +
    '        <ul class="IO-list" id="input-list">\n' +
    '        </ul>\n' +
    '    </div>\n' +
    '</div>\n' +
    '\n' +
    '<div class="removable-parameter" id="task-threading">\n' +
    '</div>' +
    '\n' + '<div class="removable-parameter" id="class-outputs">\n' +
    '    Output class(es):\n' +
    '    <div class="IO-list-box">\n' +
    '        <ul class="IO-list" id="output-list">\n' +
    '        </ul>\n' +
    '    </div>\n' +
    '</div>\n' +
    '\n' +
    '<div class="removable-parameter" id="create-done">\n' +
    '    <div id="create-btn">\n' +
    '        <button id="create-class-done">Done  <i class="glyphicon glyphicon-ok"></i></button>\n' +
    '    </div>\n' +
    '</div>';

const bookkeeperInstanceForm = '<div class="removable-parameter" id="node-name-container">\n' +
    '    Bookkeeper Name: <input class="htgs-var" type="text" id="node-name">\n' +
    '</div>\n' +
    '\n' +
    '<div class="removable-parameter" id="bookkeeper-inputs">\n' +
    '    Input class(es):\n' +
    '    <div class="IO-list-box">\n' +
    '        <ul class="IO-list" id="input-list">\n' +
    '        </ul>\n' +
    '    </div>' +
    '\n    <input list="data-classes" class="htgs-var" id="class-input"/>' +
    '\n    <datalist id="data-classes"></datalist>' +
    '\n    <button id="add-class-input" class="htgs-var" type="button">Add</button>\n' +
    '</div>\n' +
    '\n' +
    '<div class="removable-parameter" id="create-done">\n' +
    '    <div id="create-btn">\n' +
    '        <button id="create-class-done">Done  <i class="glyphicon glyphicon-ok"></i></button>\n' +
    '    </div>\n' +
    '</div>';

const ruleInstanceForm = '<div class="removable-parameter" id="node-name-container">\n' +
    '    Node Name: <input class="htgs-var" type="text" id="node-name">\n' +
    '</div>\n'+ '<div class="removable-parameter" id="class-name-container">\n' +
    '    Rule Name: <input class="htgs-var" type="text" id="class-name">\n' +
    '</div>\n\n<div class="removable-parameter" id="class-label-container">\n' +
    '    Rule Label: <input type="text" id="class-label">\n</div>\n' +
    '\n' +
    '<div class="removable-parameter" id="class-inputs">\n' +
    '    Input class(es):\n' +
    '    <div class="IO-list-box">\n' +
    '        <ul class="IO-list" id="input-list">\n' +
    '        </ul>\n' +
    '    </div>\n' +
    '</div>' +
    '' +
    '\n' +
    '' +
    '\n' + '<div class="removable-parameter" id="class-outputs">\n' +
    '    Output class(es):\n' +
    '    <div class="IO-list-box">\n' +
    '        <ul class="IO-list" id="output-list">\n' +
    '        </ul>\n' +
    '    </div>\n' +
    '</div>\n' +
    '\n' +
    '<div class="removable-parameter" id="create-done">\n' +
    '    <div id="create-btn">\n' +
    '        <button id="create-class-done">Done  <i class="glyphicon glyphicon-ok"></i></button>\n' +
    '    </div>' +
    '\n</div>';

const threadCountField = 'Number of threads: <input type="number" id="thread-cnt" min="1" value="1">\n';

const ioRmBtn = '<a href="#" class="rm-item">' +
    '<i class="glyphicon glyphicon-remove-sign"></i></a>';

const rmClassBtn = '<div id="rm-class">\n' +
    '    <button id="rm-class-btn">Delete Task  ' +
    '<i class="glyphicon glyphicon-trash"></i></button>\n' + '</div>';

const edgeInfoMenu = '<div class="IO-list-box">\n' +
    '    <ul class="IO-list" id="edge-data-info">\n' +
    '        <li id="src-node"></li>\n' +
    '        <li id="dst-node"></li>\n' +
    '        <li id="edge-data"></li>\n' +
    '    </ul>\n'+
    '</div>';

// ugly and not very appealing:
const secondEdgeInfoMenu = '<div class="IO-list-box">\n' +
    '    <ul class="IO-list" id="edge-data-info2">\n' +
    '        <li id="src-node2"></li>\n' +
    '        <li id="dst-node2"></li>\n' +
    '        <li id="edge-data2"></li>\n' +
    '    </ul>\n'+
    '</div>';

const graphGenBtn = '<button id="gen-graph" style="float: left">Download Graph</button>';

const htgsDownloadBtn = '<button id="dl-htgs" onclick="window.open(\'https://github.com/usnistgov/HTGS/archive/master.zip\', \'_blank\')">Download HTGS Source</button>';

const checkedIcon = '<i style="color: limegreen" class="glyphicon glyphicon-ok-sign"></i>';

const uncheckedIcon = '<i style="color: red" class="glyphicon glyphicon-ban-circle"></i>';

const customParamType = '<input class="htgs-var" id="custom-param-type" type="text" placeholder="Name of Type">';

const newDataClassWarning = '<p id="new-DC-warn">Note that new Data Classes aren\'t saved nor created until you click \'Done\'</p>';

const customParamWarning = '<p id="custom-param-warn">' +
    'Note that once you use a custom parameter the project isn\'t guaranteed to compile as downloaded anymore.\n' +
    'Every custom parameter is treated as a primitive when generating code.</p>';

const dataclassParamSelect = '<select id="new-param-dataclass">\n</select>';

function genParameterRow(type, name, getter, setter, pointer) {
    if (!supportedTypes.has(type)) {
        // handling custom datatype. sanitize any html tags
        let cleanType = '';
        for (let chr of type) {
            if (chr === '<') {
                cleanType += '&lt';
            }
            else if (chr === '>') {
                cleanType += '&gt';
            }
            else {
                cleanType += chr;
            }
        }
        type = cleanType;
    }
    return `<tr id="${name}" class="removable-row">
    <td class="param-type">${type}</td>
    <td class="param-name">${name}</td>
    <td class="param-getter">${getter}</td>
    <td class="param-setter">${setter}</td>
    <td class="param-pointer">${pointer}</td>
    <td>
        <a href="#" id="edit-${name}" class="param-edit">
            <i class="edit-item glyphicon glyphicon-edit"></i>
        </a>
    </td>
    <td>
        <a href="#" id="rm-${name}" class="param-rm">
            <i class="rm-item glyphicon glyphicon-remove-sign"></i>
        </a>
    </td>
</tr>`;
}