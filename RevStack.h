#ifndef RevStack_H
#define RevStack_H

#include <unordered_map>
#include <stack>
#include "Commit.h"
#include "Branch.h"

using namespace std;

class RevStack {

private:
    unordered_map<string, string> workingDir;
    unordered_map<string, Commit*> commitMap;

    Commit* HEAD;
    Branch* branchList;
    Branch* currentBranch;

    stack<Commit*> undoStack;
    stack<Commit*> redoStack;

    string generateID();

public:
    RevStack();

    void addFile(string filename, string content);
    void commit(string message);
    void undo();
    void redo();
    void revert(string id);
    void log();
    void createBranch(string name);
    void switchBranch(string name);
    void merge(string branchName);
};

#endif