#ifndef COMMIT_H
#define COMMIT_H

#include <string>
#include <unordered_map>
#include <vector>

using namespace std;

class Commit {
public:
    string commitID;
    string message;
    unordered_map<string, string> files;
    vector<Commit*> parents;

    Commit(string id,
           string msg,
           unordered_map<string, string> snapshot,
           Commit* parentCommit);
};

#endif