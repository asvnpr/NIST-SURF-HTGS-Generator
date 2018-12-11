//
// Created by tjb3 on 6/19/18.
//

#include "ExampleTask.h"
ExampleTask::ExampleTask() {

}

ExampleTask::ExampleTask(size_t numThreads) : ITask(numThreads) {

}
std::string ExampleTask::getName() {
  return "ExampleTask";
}
void ExampleTask::executeTask(std::shared_ptr<ExampleData> data) {
  // Execute on data
}


ExampleTask *ExampleTask::copy() {
  return new ExampleTask();
  // If threading was specified then should be:
  // return new ExampleTask(this->getNumThreads());
}


