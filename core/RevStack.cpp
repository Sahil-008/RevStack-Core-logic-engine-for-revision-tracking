#include "RevStack.h"
#include <iostream>

using namespace std;

RevStack::RevStack() {

    HEAD = nullptr;

    branchList = new Branch();
    branchList->name = "main";
    branchList->head = nullptr;
    branchList->next = nullptr;

    currentBranch = branchList;

    
}

string RevStack::generateID() {
    return to_string(rand());
}

void RevStack::addFile(string filename, string content) {
    workingDir[filename] = content;
}


void RevStack::commit(string message) {

    if (HEAD != nullptr) {
        undoStack.push(HEAD);
    }

    while (!redoStack.empty()) {
        redoStack.pop();
    }

    string id = generateID();

    Commit* newCommit = new Commit(
        id,
        message,
        workingDir,
        currentBranch->head
    );

    currentBranch->head = newCommit;
    HEAD = newCommit;

    commitMap[id] = newCommit;

    cout << "Committed: " << message << endl;
}


void RevStack::undo() {

    if (undoStack.empty()) {
        cout << "Nothing to undo\n";
        return;
    }

    redoStack.push(HEAD);

    HEAD = undoStack.top();
    undoStack.pop();

    currentBranch->head = HEAD;
    workingDir = HEAD->files;

    cout << "Undo successful\n";
}


void RevStack::redo() {

    if (redoStack.empty()) {
        cout << "Nothing to redo\n";
        return;
    }

    undoStack.push(HEAD);

    HEAD = redoStack.top();
    redoStack.pop();

    currentBranch->head = HEAD;
    workingDir = HEAD->files;

    cout << "Redo successful\n";
}


void RevStack::revert(string id) {

    if (commitMap.find(id) == commitMap.end()) {
        cout << "Commit not found\n";
        return;
    }

    Commit* target = commitMap[id];

    if (target->parents.empty()) {
        cout << "Cannot revert root commit\n";
        return;
    }

    Commit* parentCommit = target->parents[0];

    unordered_map<string, string> revertedFiles = parentCommit->files;

    string newID = generateID();

    Commit* newCommit = new Commit(
        newID,
        "Revert commit",
        revertedFiles,
        currentBranch->head
    );

    currentBranch->head = newCommit;
    HEAD = newCommit;

    commitMap[newID] = newCommit;

    cout << "Reverted commit " << id << endl;
}


void RevStack::log() {

    Commit* temp = HEAD;

    while (temp != nullptr) {

        cout << "Commit ID: " << temp->commitID << endl;
        cout << "Message  : " << temp->message  << endl;
        cout << "------------------------\n";

        if (!temp->parents.empty())
            temp = temp->parents[0];
        else
            temp = nullptr;
    }
}

void RevStack::createBranch(string name) {

    Branch* newBranch = new Branch();
    newBranch->name = name;
    newBranch->head = currentBranch->head;

    newBranch->next = branchList;
    branchList = newBranch;

    cout << "Branch created: " << name << endl;
}


void RevStack::switchBranch(string name) {

    Branch* temp = branchList;

    while (temp != nullptr) {

        if (temp->name == name) {

            currentBranch = temp;
            HEAD = temp->head;

            if (HEAD != nullptr)
                workingDir = HEAD->files;
            else
                workingDir.clear();

            cout << "Switched to branch " << name << endl;
            return;
        }

        temp = temp->next;
    }

    cout << "Branch not found\n";
}


void RevStack::merge(string branchName) {

    Branch* temp = branchList;

    while (temp != nullptr) {

        if (temp->name == branchName)
            break;

        temp = temp->next;
    }

    if (temp == nullptr) {
        cout << "Branch not found\n";
        return;
    }

    Commit* currentCommit = currentBranch->head;
    Commit* otherCommit   = temp->head;

    if (currentCommit == nullptr || otherCommit == nullptr) {
        cout << "Cannot merge. One branch has no commits.\n";
        return;
    }

    unordered_map<string, string> mergedFiles = currentCommit->files;

    for (auto &file : otherCommit->files) {
        if (mergedFiles.find(file.first) == mergedFiles.end()) {
            mergedFiles[file.first] = file.second;
        }
    }

    string newID = generateID();

    Commit* mergeCommit = new Commit(
        newID,
        "Merge commit",
        mergedFiles,
        currentCommit
    );

    mergeCommit->parents.push_back(otherCommit);

    currentBranch->head = mergeCommit;
    HEAD = mergeCommit;

    commitMap[newID] = mergeCommit;

    cout << "Merged branch " << branchName << endl;
}