#ifndef BRANCH_H
#define BRANCH_H

#include <string>
using namespace std;

class Commit;

class Branch {
public:
    string name;
    Commit* head;
    Branch* next;
};

#endif