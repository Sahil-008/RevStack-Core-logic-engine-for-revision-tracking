#include <iostream>
#include <unordered_map>
#include <string>
#include <ctime>
using namespace std;

class Commit {
public:
    string commitID;
    string message;
    unordered_map<string, string> files;
    Commit* parent;

    Commit(string id, string msg,
           unordered_map<string, string> snapshot,
           Commit* parentCommit) {

        commitID = id;
        message = msg;
        files = snapshot;
        parent = parentCommit;
    }
};

class RevStack {
private:
    unordered_map<string, string> workingDirectory;
    Commit* HEAD;

    string generateID() {
        return to_string(rand());
    }

public:
    RevStack() {
        HEAD = nullptr;
    }

    void addFile(string filename, string content) {
        workingDirectory[filename] = content;
    }

    void commit(string message) {
        string id = generateID();
        Commit* newCommit = new Commit(id, message, workingDirectory, HEAD);
        HEAD = newCommit;
        cout << "Committed: " << message << endl;
    }

    void log() {
        Commit* temp = HEAD;
        while (temp != nullptr) {
            cout << "Commit ID: " << temp->commitID << endl;
            cout << "Message: " << temp->message << endl;
            cout << "----------------------" << endl;
            temp = temp->parent;
        }
    }
};

int main() {
    RevStack git;

    git.addFile("main.cpp", "int main(){ return 0; }");
    git.commit("Initial commit");

    git.addFile("main.cpp", "int main(){ cout << 1; }");
    git.commit("Added print statement");

    git.log();

    return 0;
}