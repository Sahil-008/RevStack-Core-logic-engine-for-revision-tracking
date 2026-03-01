#include "Commit.h"

Commit::Commit(string id,
               string msg,
               unordered_map<string, string> snapshot,
               Commit* parentCommit)
{
    commitID = id;
    message  = msg;
    files    = snapshot;

    if (parentCommit != nullptr) {
        parents.push_back(parentCommit);
    }
}