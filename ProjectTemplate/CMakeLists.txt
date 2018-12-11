cmake_minimum_required(VERSION 2.7)
project(ProjectTemplate)

set(CMAKE_MODULE_PATH ${CMAKE_MODULE_PATH} "${CMAKE_CURRENT_SOURCE_DIR}/cmake-modules")

find_package(HTGS REQUIRED)

include_directories(${HTGS_INCLUDE_DIR})
link_libraries(${HTGS_LIBRARIES})
set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} ${HTGS_CXX_FLAGS}")

set(ProjectTemplate_SRC
    src/data/ExampleData.h
    src/tasks/ExampleTask.cpp
    src/tasks/ExampleTask.h)

add_executable(ProjectTemplate src/main.cpp ${ProjectTemplate_SRC})

