#include <htgs/api/TaskGraphConf.hpp>
#include <htgs/api/TaskGraphRuntime.hpp>
#include "tasks/AddTask.h"
int main() {

  // declarations of instances from GUI with number of threads in constructor if applicable
  AddTask *addTask1 = new AddTask();

  // Create the graph instance with name given to the Task Graph when it was generated
  htgs::TaskGraphConf<InputData, OutputData> *tutorialOne = new htgs::TaskGraphConf<InputData, OutputData>();

  // declaration of the graph consumer, its edges, and graph producer(s)
  tutorialOne->setGraphConsumerTask(addTask1);

  tutorialOne->addGraphProducerTask(addTask1);

  // Execute the graph
  htgs::TaskGraphRuntime *runtime = new htgs::TaskGraphRuntime(tutorialOne);

  runtime->executeRuntime();
  // BEGIN ADDED_CODE1
  // Produce data for the graph
  int numData = 10;
  for (int i = 0; i < numData; i++)
  {
      auto inputData = new InputData(i, i);
      tutorialOne->produceData(inputData);
  }
  // END ADDED_CODE1

  // Mark done executing
  tutorialOne->finishedProducingData();

  // Wait for the graph to finish running
  runtime->waitForRuntime();

  //BEGIN ADDED_CODE2
  // process the output of the TaskGraph until no more data is available
  // could process this data prior to runtime->WaitForRuntime()
  while (!tutorialOne->isOutputTerminated())
  {
    auto data = tutorialOne->consumeData();

    // good practice to check for nullptr data in case termination makes its way out of consumeData from tutorialOne
    if (data != nullptr)
    {
        auto result = data->getResult();
        std::cout << "Result of x + x: " << result << std::endl;
    }
  }
  //END ADDED_CODE2

  // TutorialOne Visualization
  tutorialOne->writeDotToFile("TutorialOne.dot");

  // Release memory
  delete runtime;
}
