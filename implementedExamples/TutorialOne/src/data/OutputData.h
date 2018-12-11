#ifndef TUTORIALONE_OUTPUTDATA_H
#define TUTORIALONE_OUTPUTDATA_H

#include <htgs/api/IData.hpp>

class OutputData : public htgs::IData {
  // BEGIN ADDED_CODE1
  // this can be generated too
  public:
    OutputData(int result) : IData(result), result(result) {}

    int getResult() const { return result; }

  private:
    int result;
  // END ADDED_CODE1
};

#endif //TUTORIALONE_OutputData_H
