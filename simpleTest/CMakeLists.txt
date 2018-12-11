cmake_minimum_required(VERSION 3.9)
project(Test)

set(CMAKE_CXX_STANDARD 11)
list(APPEND CMAKE_MODULE_PATH "${CMAKE_CURRENT_SOURCE_DIR}")

find_package (Threads REQUIRED)

find_package(NVTX QUIET)
if(NVTX_FOUND)
    message(STATUS "FOUND IT")
    add_definitions(-DUSE_NVTX)
    include_directories(${NVTX_INCLUDE_DIR})
    link_libraries(${NVTX_LIBRARY})
endif()

add_definitions(-DPROFILE)

set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -std=c++11 -pthread -Wall -Wextra -Wno-unused-parameter")


#Specify path of HTGS/src directory
include_directories(/home/tjb3/phd-research/HTGS/src)

add_executable(Test main.cpp)