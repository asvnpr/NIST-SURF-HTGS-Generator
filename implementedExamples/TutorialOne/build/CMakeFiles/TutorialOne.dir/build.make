# CMAKE generated file: DO NOT EDIT!
# Generated by "Unix Makefiles" Generator, CMake Version 3.10

# Delete rule output on recipe failure.
.DELETE_ON_ERROR:


#=============================================================================
# Special targets provided by cmake.

# Disable implicit rules so canonical targets will work.
.SUFFIXES:


# Remove some rules from gmake that .SUFFIXES does not remove.
SUFFIXES =

.SUFFIXES: .hpux_make_needs_suffix_list


# Suppress display of executed commands.
$(VERBOSE).SILENT:


# A target that is always out of date.
cmake_force:

.PHONY : cmake_force

#=============================================================================
# Set environment variables for the build.

# The shell in which to execute make rules.
SHELL = /bin/sh

# The CMake executable.
CMAKE_COMMAND = /usr/bin/cmake

# The command to remove a file.
RM = /usr/bin/cmake -E remove -f

# Escaping for special characters.
EQUALS = =

# The top-level source directory on which CMake was run.
CMAKE_SOURCE_DIR = /home/asv/Downloads/TutorialOne

# The top-level build directory on which CMake was run.
CMAKE_BINARY_DIR = /home/asv/Downloads/TutorialOne/build

# Include any dependencies generated for this target.
include CMakeFiles/TutorialOne.dir/depend.make

# Include the progress variables for this target.
include CMakeFiles/TutorialOne.dir/progress.make

# Include the compile flags for this target's objects.
include CMakeFiles/TutorialOne.dir/flags.make

CMakeFiles/TutorialOne.dir/src/main.cpp.o: CMakeFiles/TutorialOne.dir/flags.make
CMakeFiles/TutorialOne.dir/src/main.cpp.o: ../src/main.cpp
	@$(CMAKE_COMMAND) -E cmake_echo_color --switch=$(COLOR) --green --progress-dir=/home/asv/Downloads/TutorialOne/build/CMakeFiles --progress-num=$(CMAKE_PROGRESS_1) "Building CXX object CMakeFiles/TutorialOne.dir/src/main.cpp.o"
	/usr/bin/c++  $(CXX_DEFINES) $(CXX_INCLUDES) $(CXX_FLAGS) -o CMakeFiles/TutorialOne.dir/src/main.cpp.o -c /home/asv/Downloads/TutorialOne/src/main.cpp

CMakeFiles/TutorialOne.dir/src/main.cpp.i: cmake_force
	@$(CMAKE_COMMAND) -E cmake_echo_color --switch=$(COLOR) --green "Preprocessing CXX source to CMakeFiles/TutorialOne.dir/src/main.cpp.i"
	/usr/bin/c++ $(CXX_DEFINES) $(CXX_INCLUDES) $(CXX_FLAGS) -E /home/asv/Downloads/TutorialOne/src/main.cpp > CMakeFiles/TutorialOne.dir/src/main.cpp.i

CMakeFiles/TutorialOne.dir/src/main.cpp.s: cmake_force
	@$(CMAKE_COMMAND) -E cmake_echo_color --switch=$(COLOR) --green "Compiling CXX source to assembly CMakeFiles/TutorialOne.dir/src/main.cpp.s"
	/usr/bin/c++ $(CXX_DEFINES) $(CXX_INCLUDES) $(CXX_FLAGS) -S /home/asv/Downloads/TutorialOne/src/main.cpp -o CMakeFiles/TutorialOne.dir/src/main.cpp.s

CMakeFiles/TutorialOne.dir/src/main.cpp.o.requires:

.PHONY : CMakeFiles/TutorialOne.dir/src/main.cpp.o.requires

CMakeFiles/TutorialOne.dir/src/main.cpp.o.provides: CMakeFiles/TutorialOne.dir/src/main.cpp.o.requires
	$(MAKE) -f CMakeFiles/TutorialOne.dir/build.make CMakeFiles/TutorialOne.dir/src/main.cpp.o.provides.build
.PHONY : CMakeFiles/TutorialOne.dir/src/main.cpp.o.provides

CMakeFiles/TutorialOne.dir/src/main.cpp.o.provides.build: CMakeFiles/TutorialOne.dir/src/main.cpp.o


CMakeFiles/TutorialOne.dir/src/tasks/AddTask.cpp.o: CMakeFiles/TutorialOne.dir/flags.make
CMakeFiles/TutorialOne.dir/src/tasks/AddTask.cpp.o: ../src/tasks/AddTask.cpp
	@$(CMAKE_COMMAND) -E cmake_echo_color --switch=$(COLOR) --green --progress-dir=/home/asv/Downloads/TutorialOne/build/CMakeFiles --progress-num=$(CMAKE_PROGRESS_2) "Building CXX object CMakeFiles/TutorialOne.dir/src/tasks/AddTask.cpp.o"
	/usr/bin/c++  $(CXX_DEFINES) $(CXX_INCLUDES) $(CXX_FLAGS) -o CMakeFiles/TutorialOne.dir/src/tasks/AddTask.cpp.o -c /home/asv/Downloads/TutorialOne/src/tasks/AddTask.cpp

CMakeFiles/TutorialOne.dir/src/tasks/AddTask.cpp.i: cmake_force
	@$(CMAKE_COMMAND) -E cmake_echo_color --switch=$(COLOR) --green "Preprocessing CXX source to CMakeFiles/TutorialOne.dir/src/tasks/AddTask.cpp.i"
	/usr/bin/c++ $(CXX_DEFINES) $(CXX_INCLUDES) $(CXX_FLAGS) -E /home/asv/Downloads/TutorialOne/src/tasks/AddTask.cpp > CMakeFiles/TutorialOne.dir/src/tasks/AddTask.cpp.i

CMakeFiles/TutorialOne.dir/src/tasks/AddTask.cpp.s: cmake_force
	@$(CMAKE_COMMAND) -E cmake_echo_color --switch=$(COLOR) --green "Compiling CXX source to assembly CMakeFiles/TutorialOne.dir/src/tasks/AddTask.cpp.s"
	/usr/bin/c++ $(CXX_DEFINES) $(CXX_INCLUDES) $(CXX_FLAGS) -S /home/asv/Downloads/TutorialOne/src/tasks/AddTask.cpp -o CMakeFiles/TutorialOne.dir/src/tasks/AddTask.cpp.s

CMakeFiles/TutorialOne.dir/src/tasks/AddTask.cpp.o.requires:

.PHONY : CMakeFiles/TutorialOne.dir/src/tasks/AddTask.cpp.o.requires

CMakeFiles/TutorialOne.dir/src/tasks/AddTask.cpp.o.provides: CMakeFiles/TutorialOne.dir/src/tasks/AddTask.cpp.o.requires
	$(MAKE) -f CMakeFiles/TutorialOne.dir/build.make CMakeFiles/TutorialOne.dir/src/tasks/AddTask.cpp.o.provides.build
.PHONY : CMakeFiles/TutorialOne.dir/src/tasks/AddTask.cpp.o.provides

CMakeFiles/TutorialOne.dir/src/tasks/AddTask.cpp.o.provides.build: CMakeFiles/TutorialOne.dir/src/tasks/AddTask.cpp.o


# Object files for target TutorialOne
TutorialOne_OBJECTS = \
"CMakeFiles/TutorialOne.dir/src/main.cpp.o" \
"CMakeFiles/TutorialOne.dir/src/tasks/AddTask.cpp.o"

# External object files for target TutorialOne
TutorialOne_EXTERNAL_OBJECTS =

TutorialOne: CMakeFiles/TutorialOne.dir/src/main.cpp.o
TutorialOne: CMakeFiles/TutorialOne.dir/src/tasks/AddTask.cpp.o
TutorialOne: CMakeFiles/TutorialOne.dir/build.make
TutorialOne: CMakeFiles/TutorialOne.dir/link.txt
	@$(CMAKE_COMMAND) -E cmake_echo_color --switch=$(COLOR) --green --bold --progress-dir=/home/asv/Downloads/TutorialOne/build/CMakeFiles --progress-num=$(CMAKE_PROGRESS_3) "Linking CXX executable TutorialOne"
	$(CMAKE_COMMAND) -E cmake_link_script CMakeFiles/TutorialOne.dir/link.txt --verbose=$(VERBOSE)

# Rule to build all files generated by this target.
CMakeFiles/TutorialOne.dir/build: TutorialOne

.PHONY : CMakeFiles/TutorialOne.dir/build

CMakeFiles/TutorialOne.dir/requires: CMakeFiles/TutorialOne.dir/src/main.cpp.o.requires
CMakeFiles/TutorialOne.dir/requires: CMakeFiles/TutorialOne.dir/src/tasks/AddTask.cpp.o.requires

.PHONY : CMakeFiles/TutorialOne.dir/requires

CMakeFiles/TutorialOne.dir/clean:
	$(CMAKE_COMMAND) -P CMakeFiles/TutorialOne.dir/cmake_clean.cmake
.PHONY : CMakeFiles/TutorialOne.dir/clean

CMakeFiles/TutorialOne.dir/depend:
	cd /home/asv/Downloads/TutorialOne/build && $(CMAKE_COMMAND) -E cmake_depends "Unix Makefiles" /home/asv/Downloads/TutorialOne /home/asv/Downloads/TutorialOne /home/asv/Downloads/TutorialOne/build /home/asv/Downloads/TutorialOne/build /home/asv/Downloads/TutorialOne/build/CMakeFiles/TutorialOne.dir/DependInfo.cmake --color=$(COLOR)
.PHONY : CMakeFiles/TutorialOne.dir/depend

