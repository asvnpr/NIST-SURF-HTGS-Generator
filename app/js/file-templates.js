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

const findHTGS = '# - Find HTGS includes and required compiler flags and library dependencies\n' +
    '# Dependencies: C++11 support and threading library\n' +
    '#\n' +
    '# The HTGS_CXX_FLAGS should be added to the CMAKE_CXX_FLAGS\n' +
    '#\n' +
    '# This module defines\n' +
    '#  HTGS_INCLUDE_DIR\n' +
    '#  HTGS_LIBRARIES\n' +
    '#  HTGS_CXX_FLAGS\n' +
    '#  HTGS_FOUND\n' +
    '#\n' +
    '\n' +
    'SET(HTGS_FOUND ON)\n' +
    '\n' +
    'include(CheckCXXCompilerFlag)\n' +
    '\n' +
    '#set(CMAKE_CXX_STANDARD 11)\n' +
    '#set(CMAKE_XX_STANDARD_REQUIRED ON)\n' +
    '\n' +
    'CHECK_CXX_COMPILER_FLAG("-std=c++11" COMPILER_SUPPORTS_CXX11)\n' +
    '\n' +
    'if (COMPILER_SUPPORTS_CXX11)\n' +
    '    set(HTGS_CXX_FLAGS "${HTGS_CXX_FLAGS} -std=c++11")\n' +
    'else()\n' +
    '    if (HTGS_FIND_REQUIRED)\n' +
    '        message(FATAL_ERROR "The compiler ${CMAKE_CXX_COMPILER} has no C++11 support. Please use a different C++ compiler for HTGS.")\n' +
    '    else()\n' +
    '        message(STATUS "The compiler ${CMAKE_CXX_COMPILER} has no C++11 support. Please use a different C++ compiler for HTGS.")\n' +
    '    endif()\n' +
    '\n' +
    '    SET(HTGS_FOUND OFF)\n' +
    'endif()\n' +
    '\n' +
    '\n' +
    'find_package(Threads QUIET)\n' +
    '\n' +
    'if (Threads_FOUND)\n' +
    '    if(CMAKE_USE_PTHREADS_INIT)\n' +
    '        set(HTGS_CXX_FLAGS  "${HTGS_CXX_FLAGS} -pthread")\n' +
    '    endif(CMAKE_USE_PTHREADS_INIT)\n' +
    '\n' +
    '    set(HTGS_LIBRARIES "${HTGS_LIBRARIES} ${CMAKE_THREAD_LIBS_INIT}")\n' +
    '\n' +
    'else()\n' +
    '    if (HTGS_FIND_REQUIRED)\n' +
    '        message(FATAL_ERROR "Unable to find threads. HTGS must have a threading library i.e. pthreads.")\n' +
    '    else()\n' +
    '        message(STATUS "Unable to find threads. HTGS must have a threading library i.e. pthreads.")\n' +
    '    endif()\n' +
    '    SET(HTGS_FOUND OFF)\n' +
    'endif()\n' +
    '\n' +
    '\n' +
    'FIND_PATH(HTGS_INCLUDE_DIR htgs/api/TaskGraph.hpp\n' +
    '        /usr/include\n' +
    '        /usr/local/include\n' +
    '        )\n' +
    '\n' +
    '\n' +
    '#    Check include files\n' +
    'IF (NOT HTGS_INCLUDE_DIR)\n' +
    '    SET(HTGS_FOUND OFF)\n' +
    '    MESSAGE(STATUS "Could not find HTGS includes. HTGS_FOUND now off")\n' +
    'ENDIF ()\n' +
    '\n' +
    'IF (HTGS_FOUND)\n' +
    '    IF (NOT HTGS_FIND_QUIETLY)\n' +
    '        MESSAGE(STATUS "Found HTGS include: ${HTGS_INCLUDE_DIR}, CXX_FLAGS: ${HTGS_CXX_FLAGS}, Libs: ${HTGS_LIBRARIES}")\n' +
    '    ENDIF (NOT HTGS_FIND_QUIETLY)\n' +
    'ELSE (HTGS_FOUND)\n' +
    '    IF (HTGS_FIND_REQUIRED)\n' +
    '        MESSAGE(FATAL_ERROR "Could not find HTGS header files")\n' +
    '    ENDIF (HTGS_FIND_REQUIRED)\n' +
    'ENDIF (HTGS_FOUND)\n' +
    '\n' +
    'if (NOT "${HTGS_LIBRARIES}" STREQUAL "")\n' +
    '    string(STRIP ${HTGS_LIBRARIES} HTGS_LIBRARIES)\n' +
    'endif()\n' +
    '\n' +
    'if (NOT "${HTGS_CXX_FLAGS}" STREQUAL "")\n' +
    '    string(STRIP ${HTGS_CXX_FLAGS} HTGS_CXX_FLAGS)\n' +
    'endif()\n' +
    '\n' +
    'MARK_AS_ADVANCED(HTGS_INCLUDE_DIR)\n';

function cMakeListsSrc(graphName, minVer, srcs) {
    return `cmake_minimum_required(VERSION ${minVer})
project(${graphName})

set(CMAKE_MODULE_PATH \${CMAKE_MODULE_PATH} "\${CMAKE_CURRENT_SOURCE_DIR}/cmake-modules")

find_package(HTGS REQUIRED)

include_directories(\${HTGS_INCLUDE_DIR})
link_libraries(\${HTGS_LIBRARIES})
set(CMAKE_CXX_FLAGS "\${CMAKE_CXX_FLAGS} \${HTGS_CXX_FLAGS}")

add_definitions(-DPROFILE)

set(${graphName}_SRC
    ${srcs})

add_executable(${graphName} src/main.cpp \${${graphName}_SRC})`;
}

function dataClassSrc(graphName, dataClass, includes, priv, protec, publ) {
    return `#ifndef ${graphName.toUpperCase()}_${dataClass.toUpperCase()}_H
#define ${graphName.toUpperCase()}_${dataClass.toUpperCase()}_H

#include <htgs/api/IData.hpp>${includes}

class ${dataClass} : public htgs::IData {
${publ}${protec}${priv}
};

#endif //${graphName.toUpperCase()}_${dataClass.toUpperCase()}_H\n`;
}

function taskClassSrc(graphName, taskName, includes, constructor, input, output) {
    return `#ifndef ${graphName.toUpperCase()}_${taskName.toUpperCase()}_H
#define ${graphName.toUpperCase()}_${taskName.toUpperCase()}_H

#include <htgs/api/ITask.hpp>
${includes}
class ${taskName} : public htgs::ITask<${input}, ${output}> {

 public:
  ${constructor}

  std::string getName() override;

  void executeTask(std::shared_ptr<${input}> data) override;

  ${taskName} *copy() override;

};

#endif //${graphName.toUpperCase()}_${taskName}_H\n`;
}

function taskImplementationSrc(taskName, taskLabel, constructor, input, copyExpr) {
    return `#include "${taskName}.h"
${constructor}
std::string ${taskName}::getName() {
  return "${taskLabel}";
}

void ${taskName}::executeTask(std::shared_ptr<${input}> data) {
  // Execute on data
}

${taskName} *${taskName}::copy() {
  ${copyExpr}
}\n`;
}

function ruleClassSrc(graphName, ruleName, includes, input, output) {
    return `#ifndef ${graphName.toUpperCase()}_${ruleName.toUpperCase()}_H
#define ${graphName.toUpperCase()}_${ruleName.toUpperCase()}_H

#include <htgs/api/IRule.hpp>
${includes}
class ${ruleName} : public htgs::IRule<${input}, ${output}> {

 public:
  ${ruleName}();

  std::string getName() override;

  void applyRule(std::shared_ptr<${input}> data, size_t pipelineId) override;

};

#endif //${graphName.toUpperCase()}_${ruleName}_H\\n`;
}

function ruleImplementationSrc(ruleName, ruleLabel, input, output) {
    return `#include "${ruleName}.h"
${ruleName}::${ruleName}() {

}

std::string ${ruleName}::getName() {
  return "${ruleLabel}";
}

void ${ruleName}::applyRule(std::shared_ptr<${input}> data, size_t pipelineId) {
  // Process input data. Use the addResult function to add values to the output edge
  // Remember to use the output type of the rule e.g. this->addResult(new ${output}(<parameters>));
}\n`;
}

// kinda ridiculous amount of parameters. maybe pass them as an object??
function mainSrc(graphName, taskIncludes, instanceDecs, graphDec, graphConsumerDec, edgeDecs, graphProducerDecs, runtimeDec, finishDec, vizDec) {
    return `#include <htgs/api/TaskGraphConf.hpp>
#include <htgs/api/TaskGraphRuntime.hpp>
${taskIncludes}
int main() {

  // number of threads for multi-threaded nodes and node declarations of instances from GUI
  ${instanceDecs}

  // Create the graph instance with name given to the Task Graph when it was generated
  ${graphDec}

  // declaration of the graph consumer, its edges, and graph producer(s)
  ${graphConsumerDec}
  ${edgeDecs}
  ${graphProducerDecs}

  // Execute the graph
  ${runtimeDec}

  runtime->executeRuntime();

  // TODO: Produce data for the graph

  // Mark done executing
  ${finishDec}

  // Wait for the graph to finish running
  runtime->waitForRuntime();
  
  // ${graphName} Visualization 
  ${vizDec}

  // Release memory
  delete runtime;
}`;

}