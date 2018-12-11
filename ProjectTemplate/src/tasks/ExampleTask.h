//
// Created by tjb3 on 6/19/18.
//

#ifndef PROJECTTEMPLATE_EXAMPLETASK_H
#define PROJECTTEMPLATE_EXAMPLETASK_H

#include <htgs/api/ITask.hpp>
#include "../data/ExampleData.h"
class ExampleTask : public htgs::ITask<ExampleData, ExampleData> {

 public:
  // Constructor if no threading specified
  ExampleTask();

  // Constructor if threading is specified
  ExampleTask(size_t numThreads);

  std::string getName() override;

  void executeTask(std::shared_ptr<ExampleData> data) override;

  ExampleTask *copy() override;

};

#endif //PROJECTTEMPLATE_EXAMPLETASK_H
