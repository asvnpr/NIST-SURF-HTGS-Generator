# HTGS 
The Hybrid Task Graph Scheduler (or HTGS) is an abstract execution model and API used to obtain 
performance on heterogeneous/hybrid systems with multiple CPUs and GPUs. You can read more 
about the HTGS in detail [here](https://pages.nist.gov/HTGS/). 

# HTGS-Generator

The HTGS Generator is a tool for creating a task graph   
within a GUI and generating the boilerplate code associated with executing the graph using 
the HTGS. This project was developed during my participation in the National Institute of 
Standards and Technology (NIST) [SURF](https://www.nist.gov/surf) program. 

## Scope
This program aims to facilitate the usage of the HTGS by allowing the user to 
"draw" the hybrid task graph they will be implementing and generating its 
(generally lengthy) boilerplate code. Correct usage of this project results in a zipped 
HTGS project where the C++ source code is properly generated, and compiles and executes with 
no user input except pointing cmake to the HTGS source code. It's important to note that only 
the source code is defined so execution here refers to running the program and outputing a 
visualization file for the graph. 

## Limitations 
Due to time constraints, this project is limited to CPU tasks like 
[Simple Tasks](https://pages.nist.gov/HTGS/doxygen/classhtgs_1_1_i_task.html) and 
[Bookkeepers](https://pages.nist.gov/HTGS/doxygen/classhtgs_1_1_bookkeeper.html). This code has
seen some usage, but has not been extensively tested nor are the bugs properly documented. 
One known bug is loops in Bookkeepers where a rule must be implemented for successful 
execution of the generated project. This is not a major issue since the user has to implement 
the actual functionality of the graph, but this may be corrected in possible future revisions of 
this software. 

## Repo contents:
* doc: a design document that describes the background and scope of this NIST SURF 2018 
program project
* app: 
    * a GUI interface that serves as a tool to generate boilerplate 
    [HTGS](https://github.com/usnistgov/HTGS) code from the designed graph, tasks, and 
    data classes.  
    * Built with HTML5, css, Javascript, Jquery, and d3js v3  
    * Follow the README in the generator directory for instructions and an explanation 
    of the interface
* implementedExamples: some htgs projects and tutorials that were created with the HTGS-generator 
(except non-generated code)
* ProjectTemplate: an example project of how the structure of a project generated with  
HTGS-Generator should look and behave
* simpleTest: a simple HTGS program that defines several of the available tasks and 
implements a simple example


