#include <iostream>
#include "RevStack.h"

using namespace std;

int main() {

    RevStack git;
    string command;

    cout << "Type 'help' to see available commands.\n";

    while (true) {

        cout << "\nMiniGit > ";
        cin >> command;

        if (command == "help") {

            cout << "\nAvailable Commands:\n";
            cout << "add <filename> <content>\n";
            cout << "commit <message>\n";
            cout << "undo\n";
            cout << "redo\n";
            cout << "log\n";
            cout << "branch <branch_name>\n";
            cout << "switch <branch_name>\n";
            cout << "merge <branch_name>\n";
            cout << "revert <commit_id>\n";
            cout << "exit\n";
        }

        else if (command == "add") {

            string filename;
            string content;

            cout << "Enter filename: ";
            cin >> filename;

            cin.ignore();

            cout << "Enter content: ";
            getline(cin, content);         

            git.addFile(filename, content);
            cout << "File added/updated.\n";
        }

        else if (command == "commit") {

            cin.ignore();
            string message;
            getline(cin, message);

            git.commit(message);
    }

        else if (command == "undo") {
            git.undo();
        }

        else if (command == "redo") {
            git.redo();
        }

        else if (command == "log") {
            git.log();
        }

        else if (command == "branch") {

            string name;
            cin >> name;

            git.createBranch(name);
        }

        else if (command == "switch") {

            string name;
            cin >> name;

            git.switchBranch(name);
        }

        else if (command == "merge") {

            string name;
            cin >> name;

            git.merge(name);
        }

        else if (command == "revert") {

            string id;
            cin >> id;

            git.revert(id);
        }

        else if (command == "exit") {

            cout << "Exiting MiniGit...\n";
            break;
        }

        else {
            cout << "Invalid command. Type 'help'.\n";
        }
    }

    return 0;
}