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

function genDataClass(graphName, dataClass) {
    let params = graphObj.dataClasses[dataClass].parameters;
    let priv = '';
    let protec = '';
    let publ = '\n  public:\n    ';
    let constructor = `${dataClass}(`;
    let constructorParams = [];
    let constructorInits = [];
    let getters = [];
    let setters = [];
    let privateMembers = [];
    let publicMembers = [];
    let protectedMembers = [];
    let includes = new Set([]);
    // go through the parameters for a dataclass
    for (let name in params) {
        let param = params[name];
        // handle data class parameter
        if (param.type in graphObj.dataClasses) {
            constructorParams.push(`const std::shared_ptr<${param.type}> &${name}`);
            if (param.access === 'private') {
                privateMembers.push(`std::shared_ptr<${param.type}> ${name};`);
            }
            else if (param.access === 'protected') {
                protectedMembers.push(`std::shared_ptr<${param.type}> ${name};`);
            }
            else {
                publicMembers.push(`std::shared_ptr<${param.type}> ${name};`);
            }

            includes.add(`#include "${param.type}.h"`);

            if (param.getter) {
                const getterName = `get${name[0].toUpperCase() + name.slice(1)}`;
                getters.push(`const std::shared_ptr<${param.type}> &${getterName}() const { return ${name}; }`);
            }

            if (param.setter) {
                const setterName = `set${name[0].toUpperCase() + name.slice(1)}`;
                const newName = `new${name[0].toUpperCase() + name.slice(1)}`;
                setters.push(`void ${setterName}(const std::shared_ptr<${param.type}> &${newName}) { ${name} = ${newName}; }`);
            }
        }
        else {
            if (param.pointer) {
                constructorParams.push(`${param.type} *${name}`);
                if (param.access === 'private') {
                    privateMembers.push(`${param.type} *${name};`);
                }
                else if (param.access === 'protected') {
                    protectedMembers.push(`${param.type} *${name};`);
                }
                else {
                    publicMembers.push(`${param.type} *${name};`);
                }
            }
            else {
                constructorParams.push(`${param.type} ${name}`);
                if (param.access === 'private') {
                    privateMembers.push(`${param.type} ${name};`);
                }
                else if (param.access === 'protected') {
                    protectedMembers.push(`${param.type} ${name};`);
                }
                else {
                    publicMembers.push(`${param.type} ${name};`);
                }
            }

            // check if we need to generate getters and/or setters
            // if so are the data members pointers or not
            if (param.getter) {
                const getterName = `get${name[0].toUpperCase() + name.slice(1)}`;
                if (param.pointer) {
                    getters.push(`${param.type}* ${getterName}() const { return ${name}; }`);
                }
                else {
                    getters.push(`${param.type} ${getterName}() const { return ${name}; }`);
                }
            }

            if (param.setter) {
                const setterName = `set${name[0].toUpperCase() + name.slice(1)}`;
                if (param.pointer) {
                    setters.push(`void ${setterName}(${param.type} *new${name}) { ${name} = new${name}; }`);
                }
                else {
                    setters.push(`void ${setterName}(${param.type} new${name}) { ${name} = new${name}; }`);
                }
            }
        }
        constructorInits.push(`${name}(${name})`);
    }
    // check if we have any parameter generation or not for cleaner looking code (no needless new lines)
    if (Object.keys(params).length > 0) {
        constructor += `${constructorParams.join(', ')}) : ${constructorInits.join(', ')} {}\n`;
        getters = getters.length > 0? `    ${getters.join('\n    ')}\n` : '';
        setters = setters.length > 0? `    ${setters.join('\n    ')}\n` : '';
        includes = includes.size > 0? `\n${Array.from(includes).join('\n')}\n` : '';
        priv = privateMembers.length > 0? `  private:\n    ${privateMembers.join('\n    ')}\n` : '';
        protec = protectedMembers.length > 0? `  protected:    ${protectedMembers.join('\n    ')}\n` : '';
        publicMembers = publicMembers.length > 0? `    ${publicMembers.join('\n    ')}\n` : '';
        publ += `${constructor}${publicMembers}${getters}${setters}\n`;
    }
    else {
        includes = '';
        priv = '';
        protec = '';
        publ = '';
    }
    return dataClassSrc(graphName, dataClass, includes, priv, protec, publ);
}

function genSimpleTaskClass(graphName, taskName) {
    // get necessary info from task Class to generate source code for the Class
    const constructor = graphObj.taskClasses[taskName].multithreaded ? `${taskName}(size_t numThreads);` : `${taskName}();`;
    const inputs = graphObj.taskClasses[taskName].inputs;
    const outputs = graphObj.taskClasses[taskName].outputs;
    // simple tasks currently only have one input and output class. change accordingly in the future:
    const input = Array.from(inputs)[0];
    const output = Array.from(outputs)[0];
    const dataClasses = new Set([...inputs, ...outputs]);
    const includes = Array.from(dataClasses).map(dataClass => '#include "../data/' + dataClass + '.h"').join('\n');

    return taskClassSrc(graphName, taskName, includes, constructor, input, output);
}

function genTaskImplementation(taskName) {
    // get necessary info from task Class to generate source code for the implemenation
    const taskClass = graphObj.taskClasses[taskName];
    const constructor = taskClass.multithreaded ?
        `${taskName}::${taskName}(size_t numThreads) : ITask(numThreads) {\n\n}` : `${taskName}::${taskName}(){\n\n}`;
    const copyExpr = taskClass.multithreaded ?
        `return new ${taskName}(this->getNumThreads());` : `return new ${taskName}();`;
    // kinda pointless right now, but might be useful when there's multiple inputs:
    const inputs = taskClass.inputs;
    // simple tasks currently only have one input class. change accordingly in the future:
    const input = Array.from(inputs)[0];
    const taskLabel = taskClass.label;

    return taskImplementationSrc(taskName, taskLabel, constructor, input, copyExpr);
}

function genRuleClass(graphName, ruleName) {
    const inputs = graphObj.taskClasses[ruleName].inputs;
    const outputs = graphObj.taskClasses[ruleName].outputs;
    const input = Array.from(inputs)[0]; // rules currently only have one input class
    const output = Array.from(outputs)[0]; // rules currently only have one output class
    const dataClasses = new Set([...inputs, ...outputs]);
    // probably too elaborate for a simple task with one input and output. might be useful in the future:
    const includes = Array.from(dataClasses).map(dataClass => '#include "../data/' + dataClass + '.h"').join('\n');

    return ruleClassSrc(graphName, ruleName, includes, input, output);
}

function genRuleImplementation(ruleName) {
    const ruleClass = graphObj.taskClasses[ruleName];
    // kinda pointless right now, but might be useful when there's multiple inputs
    const inputs = ruleClass.inputs;
    const input = Array.from(inputs)[0]; // rules currently only have one input class
    const outputs = ruleClass.outputs;
    const output = Array.from(outputs)[0]; // rules currently only have one output class
    const ruleLabel = ruleClass.label;

    return ruleImplementationSrc(ruleName, ruleLabel, input, output);
}

function genMain(graphName, edges, instances, tasks) {
    // get task Classses to include in main. only generate tasks that were explicitly declared in the graph
    let taskClasses = new Set(Object.values(instances).map(instance => instance.taskClass));
    let taskIncludes = [];
    for (let task of taskClasses) {
        const classType = graphObj.taskClasses[task].type;
        if (classType === 'simple-task') {
            taskIncludes.push(`#include "tasks/${task}.h"`);
        }
        else if (classType === 'bookkeeper-rule') {
            taskIncludes.push(`#include "rules/${task}.h"`);
        }
    }
    taskIncludes = taskIncludes.join('\n');

    // get instances to be declared in main
    let instanceDecs = [];
    let threadVars = [];
    for (let name of Object.keys(instances)) {
        const taskClass = tasks[instances[name].taskClass];
        if (taskClass.type === 'simple-task') {
            if (taskClass.multithreaded) {
                let taskName = instances[name].taskClass;
                let threadVar = `int ${name}ThreadNum = ${instances[name].threads};`;
                threadVars.push(threadVar);
                let dec = `${taskName} *${name} = new ${taskName}(${name}ThreadNum);`;
                instanceDecs.push(dec);
            }
            else {
                let taskName = instances[name].taskClass;
                let dec = `${taskName} *${name} = new ${taskName}();`;
                instanceDecs.push(dec);
            }
        }
        else if (taskClass.type === 'bookkeeper-rule') {
            let taskName = instances[name].taskClass;
            let dec = `${taskName} *${name} = new ${taskName}();`;
            instanceDecs.push(dec);
        }
        else if (taskClass.type === 'bookkeeper') {
            let input = Array.from(instances[name].inputs)[0]; // bookkeeper currently only takes one input class
            let dec = `auto ${name} = new htgs::Bookkeeper<${input}>();`;
            instanceDecs.push(dec);
        }
    }
    instanceDecs = threadVars.concat(instanceDecs).join('\n  ');

    // get IO type of the Task Graph. set task consumer and producer(s)
    let srcType = null;
    let sinkType = null;
    let graphConsumer = null;
    let graphProducers = [];
    let edgeDecs = [];
    let graphVar = graphName[0].toLowerCase() + graphName.slice(1);
    for (let edge of edges) {
        if (!edge.source.isGraphIO && !edge.target.isGraphIO) {
            const srcClass = graphObj.taskClasses[edge.source.taskClass];
            //const dstClass = graphObj.taskClasses[edge.target.taskClass];
            if(srcClass.type === 'bookkeeper-rule') {
                const srcInEdges = graphObj.instances[edge.source.title].edgesIn;
                const bookkeeper = Array.from(srcInEdges)[0];
                let edgeDec = `${graphVar}->addRuleEdge(${bookkeeper}, ${edge.source.title}, ${edge.target.title});`;
                edgeDecs.push(edgeDec);
            }
            else if (srcClass.type === 'simple-task') {
                let edgeDec = `${graphVar}->addEdge(${edge.source.title}, ${edge.target.title});`;
                edgeDecs.push(edgeDec);
            }
        }
        // maybe this part of the loop could be eliminated if the graphObj explicitly states
        // which nodes act as consumer and producers
        else if (edge.source.isGraphIO) {
            // base the input of the graph based on the input DataClass of the target of the source edge
            let inputClasses = null;
            if (edge.target.taskClass === 'Bookkeeper') {
                inputClasses = instances[edge.target.title].inputs;
            }
            else {
                inputClasses = tasks[edge.target.taskClass].inputs;
            }
            // first element of a set
            srcType = inputClasses.values().next().value;
            graphConsumer = edge.target.title;
        }
        else if (edge.target.isGraphIO) {
            // base the output of the graph based on the output DataClass of the source of the sink edge(s);
            let outputClasses = tasks[edge.source.taskClass].outputs;
            sinkType = outputClasses.values().next().value;
            graphProducers.push(edge.source.title);
        }

    }
    // really long. separate?
    let graphDec = `htgs::TaskGraphConf<${srcType}, ${sinkType}> *${graphVar} = new htgs::TaskGraphConf<${srcType}, ${sinkType}>();`;
    let graphConsumerDec = `${graphVar}->setGraphConsumerTask(${graphConsumer});`;
    edgeDecs = edgeDecs.join('\n  ');
    let graphProducerDecs = graphProducers.map(prod => `${graphVar}->addGraphProducerTask(${prod});`).join('\n');

    let runtimeDec = `htgs::TaskGraphRuntime *runtime = new htgs::TaskGraphRuntime(${graphVar});`;
    let finishDec = `${graphVar}->finishedProducingData();`;
    let vizDec = `${graphVar}->writeDotToFile("${graphName}.dot");`;

    // kinda ridiculous amount of parameters. maybe pass them as an object??
    return mainSrc(graphName, taskIncludes, instanceDecs, graphDec, graphConsumerDec, edgeDecs, graphProducerDecs, runtimeDec, finishDec, vizDec);
}

function getCMakeLists(graphName, minVer= 2.7, srcs) {
    return cMakeListsSrc(graphName, minVer, srcs);
}

function genGraph(graphName) {
    graphObj.graphName = graphName;
    let instances = graphObj.instances;
    let edges = graphObj.edges;
    // only generate and save data classes that were used by the tasks in the graph
    let finalDataClasses = {};
    for (let name in graphObj.dataClasses) {
        let dataClass = graphObj.dataClasses[name];
        if (dataClass.users.size > 0) {
            finalDataClasses[name] = dataClass;
        }
    }
    // only generate and save tasks that were explicitly declared in the graph
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

    // annoying process due to the fact that sets are not saved with JSON.stringify():

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

    for (let name in finalDataClasses) {
        let dataClass = graphObj.dataClasses[name];
        savableGraph.dataClasses[name].parameters = JSON.parse(JSON.stringify(dataClass.parameters));
        savableGraph.dataClasses[name].users = Array.from(dataClass.users);
    }

    let saveEdges = [];
    guiGraph.edges.forEach(function(val){
        saveEdges.push({source: val.source.id, target: val.target.id});
    });
    savableGraph.edges = saveEdges;
    savableGraph.nodes[0].edgesOut = Array.from(graphObj.nodes[0].edgesOut);
    savableGraph.nodes[1].edgesIn = Array.from(graphObj.nodes[1].edgesIn);
    let graphJSON = JSON.stringify(savableGraph);

    //create zip file object
    let zip = new JSZip();

    zip.file(`${graphName}.json`, graphJSON);
    zip.file('cmake-modules/FindHTGS.cmake', findHTGS);
    // get a string of all the src files separated by a new line to insert in CMakeLists.txt
    let files = [];
    for (let taskClass in finalTaskClasses) {
        const classType =graphObj.taskClasses[taskClass].type;
        if (classType === 'simple-task') {
            let classFile = `src/tasks/${taskClass}.h`;
            let implFile = `src/tasks/${taskClass}.cpp`;
            files.push(classFile, implFile);
            let classSrc = genSimpleTaskClass(graphName, taskClass);
            let implSrc = genTaskImplementation(taskClass);
            zip.file(classFile, classSrc);
            zip.file(implFile, implSrc);
        }
        else if (classType === 'bookkeeper-rule') {
            let classFile = `src/rules/${taskClass}.h`;
            let implFile = `src/rules/${taskClass}.cpp`;
            files.push(classFile, implFile);
            let classSrc = genRuleClass(graphName, taskClass);
            let implSrc = genRuleImplementation(taskClass);
            zip.file(classFile, classSrc);
            zip.file(implFile, implSrc);
        }
    }
    for (let dataClass in finalDataClasses) {
        let classFile = `src/data/${dataClass}.h`;
        files.push(classFile);
        let classSrc = genDataClass(graphName, dataClass);
        zip.file(classFile, classSrc);
    }
    let srcs = files.join('\n    ');
    let cMakeListsFile = getCMakeLists(graphName, 2.7, srcs);
    zip.file('CMakeLists.txt', cMakeListsFile);
    zip.folder('build');

    let mainSrc = genMain(graphName, edges, instances, finalTaskClasses);
    zip.file('src/main.cpp', mainSrc);

    // create zip file and download
    zip.generateAsync({type:"blob"}).then(function (blob) {
        saveAs(blob, `${graphName}.zip`);
    });
}