#ifndef TUTORIALONE_INPUTDATA_H
#define TUTORIALONE_INPUTDATA_H

#include <htgs/api/IData.hpp>

class InputData : public htgs::IData {
  // BEGIN ADDED_CODE1
  // this can be generated too I think
  public:
      InputData(int x, int y) : x(x), y(y) {}

      int getX() const { return x; }
      int getY() const { return y; }

  private:
      int x;
      int y;
  // END ADDED_CODE1
};

#endif //TUTORIALONE_InputData_H
