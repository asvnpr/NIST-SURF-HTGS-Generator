cmake_minimum_required(VERSION 2.7)
project(TutorialOne)

set(CMAKE_MODULE_PATH ${CMAKE_MODULE_PATH} "${CMAKE_CURRENT_SOURCE_DIR}/cmake-modules")

find_package(HTGS REQUIRED)

include_directories(${HTGS_INCLUDE_DIR})
link_libraries(${HTGS_LIBRARIES})
set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} ${HTGS_CXX_FLAGS}")

set(TutorialOne_SRC
    src/tasks/AddTask.h
    src/tasks/AddTask.cpp
    src/data/SomeDataClass.h
    src/data/InputData.h
    src/data/OutputData.h)

add_executable(TutorialOne src/main.cpp ${TutorialOne_SRC})