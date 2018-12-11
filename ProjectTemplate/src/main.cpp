

#include <htgs/api/TaskGraphConf.hpp>
#include <htgs/api/TaskGraphRuntime.hpp>
#include "tasks/ExampleTask.h"
int main() {

  // Specified an instance to have 2 and 3 threads. These are based on the instance names from GUI
  size_t exampleTask1Threads = 2;
  size_t exampleTask2Threads = 3;

  // Create instances with instance names from GUI
  ExampleTask *exampleTask1 = new ExampleTask(exampleTask1Threads);
  ExampleTask *exampleTask2 = new ExampleTask(exampleTask2Threads);

  // Create the graph instance
  htgs::TaskGraphConf<ExampleData, ExampleData> *taskGraph = new htgs::TaskGraphConf<ExampleData, ExampleData>();

  // In this case we have exampleTask1 is consuming data from the source of the graph, and exampleTask2 is producing for the sink of the graph
  taskGraph->setGraphConsumerTask(exampleTask1);
  taskGraph->addEdge(exampleTask1, exampleTask2);
  taskGraph->addGraphProducerTask(exampleTask2);

  // Execute the graph
  htgs::TaskGraphRuntime *runtime = new htgs::TaskGraphRuntime(taskGraph);

  runtime->executeRuntime();

  // TODO: Produce data for the graph

  // Mark done executing
  taskGraph->finishedProducingData();

  // Wait for the graph to finish running
  runtime->waitForRuntime();

  // Release memory
  delete runtime;
}