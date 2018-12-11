#include <iostream>
#include <htgs/api/IData.hpp>
#include <htgs/api/ITask.hpp>
#include <htgs/api/TaskGraphConf.hpp>
#include <htgs/api/TaskGraphRuntime.hpp>


class SimpleAllocator : public htgs::IMemoryAllocator<int> {
 public:
  SimpleAllocator(size_t size) : IMemoryAllocator(size) {}

  int *memAlloc(size_t size) override {
    return new int[size];
  }
  int *memAlloc() override {
    return new int[size()];
  }
  void memFree(int *&memory) override {
    delete []memory;
  }
};

class SimpleReleaseRule : public htgs::IMemoryReleaseRule {
 public:
  SimpleReleaseRule() {}

  void memoryUsed() override {
  }
  bool canReleaseMemory() override {
    return true;
  }
};


class MyData : public htgs::IData {

 public:
  MyData(int x, int y, int z) : x(x), y(y), z(z), memData(nullptr){}

  int getX() const {
    return x;
  }
  int getY() const {
    return y;
  }
  int getZ() const {
    return z;
  }

  void setXYZ(int x, int y, int z) {
    this->x = x;
    this->y = y;
    this->z = z;
  }

  const htgs::m_data_t<int> &getMemData() const {
    return memData;
  }
  void setMemData(const htgs::m_data_t<int> &memData) {
    this->memData = memData;
  }

  friend std::ostream &operator<<(std::ostream &os, MyData &data) {
    os << " x: " << data.x << " y: " << data.y << " z: " << data.z;
    return os;
  }
 private:
  int x;
  int y;
  int z;
  htgs::m_data_t<int> memData;
};


class AddData : public htgs::ITask<MyData, MyData> {
 public:
  AddData(size_t numThreads, double scalar) : ITask(numThreads), scalar(scalar) {}

  void executeTask(std::shared_ptr<MyData> data) override {


    int x, y, z;

    x = data->getX() + data->getX() * scalar;
    y = data->getY() + data->getY() * scalar;
    z = data->getZ() + data->getZ() * scalar;

    data->setXYZ(x, y, z);

    if (scalar == 1.5) {
      htgs::m_data_t<int> memData = this->getMemory<int>("intData", new SimpleReleaseRule());
      data->setMemData(memData);
    }

    this->addResult(data);

//    if (scalar == 1.0)
//    {
//      this->releaseMemory(data->getMemData());
//    }

  }

  ITask<MyData, MyData> *copy() override {
    return new AddData(this->getNumThreads(), scalar);
  }

  std::string getName() override {
    return "AddData(" + std::to_string(scalar) + ")";
  }




 private:
  double scalar;
};

class EvenRule : public htgs::IRule<MyData, MyData> {
 public:
  EvenRule() {}

  void applyRule(std::shared_ptr<MyData> data, size_t pipelineId) override {
    if ((data->getX() % 2) == 0) {
      addResult(data);
    }
  }

  std::string getName() override {
    return "EvenRule";
  }

};



int main() {

  htgs::TaskGraphConf<MyData, MyData> *graph = new htgs::TaskGraphConf<MyData, MyData>();

  AddData *addData1 = new AddData(2, 1.5);
  AddData *addData2 = new AddData(1, 2.0);
  AddData *addData3 = new AddData(10, 1.0);

  htgs::Bookkeeper<MyData> *bookkeeper = new htgs::Bookkeeper<MyData>();

  EvenRule *evenRule = new EvenRule();

  graph->setGraphConsumerTask(addData1);
  graph->addEdge(addData1, addData2);
  graph->addEdge(addData2, bookkeeper);

  graph->addRuleEdge(bookkeeper, evenRule, addData3);

  graph->addGraphProducerTask(addData3);

  graph->addMemoryManagerEdge("intData", addData1, new SimpleAllocator(1), 50, htgs::MMType::Static);


  graph->writeDotToFile("pre-execute.dot", DOTGEN_FLAG_SHOW_IN_OUT_TYPES | DOTGEN_FLAG_SHOW_CONNECTOR_VERBOSE);



  htgs::TaskGraphRuntime *runtime = new htgs::TaskGraphRuntime(graph);
  runtime->executeRuntime();

  for (int i = 0; i < 100; ++i)
  {
    graph->produceData(new MyData(i, i+1, i+2));
  }

  graph->finishedProducingData();

  while(!graph->isOutputTerminated()) {
    std::shared_ptr<MyData> data = graph->consumeData();

    if (data != nullptr)
    {
      std::cout << *data << std::endl;
      graph->releaseMemory(data->getMemData());
    }

  }


  runtime->waitForRuntime();

  graph->writeDotToFile("post-exec.dot", DOTGEN_COLOR_COMP_TIME);



  return 0;
}