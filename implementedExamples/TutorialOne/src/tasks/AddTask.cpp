#include "AddTask.h"
AddTask::AddTask(){

}
std::string AddTask::getName() {
  return "add two numbers";
}
void AddTask::executeTask(std::shared_ptr<InputData> data) {
  // BEGIN ADDED_CODE1
  // Execute on data
  // adds x + y
  int sum = data->getX() + data->getY();
  // send data along output edge
  this->addResult(new OutputData(sum));
  // END ADDED_CODE1
}


AddTask *AddTask::copy() {
  return new AddTask();
}
