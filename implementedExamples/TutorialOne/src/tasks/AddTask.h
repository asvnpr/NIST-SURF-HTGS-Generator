#ifndef TUTORIALONE_ADDTASK_H
#define TUTORIALONE_ADDTASK_H

#include <htgs/api/ITask.hpp>
#include "../data/InputData.h"
#include "../data/OutputData.h"
class AddTask : public htgs::ITask<InputData, OutputData> {

 public:
  AddTask();

  std::string getName() override;

  void executeTask(std::shared_ptr<InputData> data) override;

  AddTask *copy() override;

};

#endif //TUTORIALONE_AddTask_H
