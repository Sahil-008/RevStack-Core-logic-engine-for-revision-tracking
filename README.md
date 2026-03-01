RevStack
Core Logic Engine for Revision Tracking (C++)

RevStack is a simplified revision tracking engine built from scratch in C++.
It models the internal working of version control systems using core Data Structures and system-level design principles.

This project focuses on understanding how revision history, branching, merging, undo/redo, and snapshot management work internally.

RevStack is not built on top of Git.
It is an independent implementation designed for deep conceptual clarity.

🚀 Why RevStack?

The goal of this project was to move beyond using Git commands and instead build the underlying engine logic using:
Directed Acyclic Graphs (DAG)
Stack-based state management
Hash-based lookup
Snapshot-based version storage
Pointer-driven architecture
This project demonstrates strong fundamentals in Data Structures and system design.

🏗️ Architecture Overview

RevStack internally uses:
Component	Data Structure
Commit history	Directed Acyclic Graph
Parent tracking	vector<Commit*>
Branch tracking	Linked List
Working directory	unordered_map<string,string>
Commit lookup	Hash Map
Undo / Redo	Stack
📦 Core Concepts Implemented
1️⃣ Snapshot-Based Commit Model
Each commit stores a complete snapshot of the working directory.
Ensures immutability of past revisions
Provides isolated historical states
Enables safe branching and reverting
Time Complexity: O(n)
(where n = number of files)
2️⃣ Branching System
Branches are implemented as named pointers to commits using a linked list structure.
Branch = pointer to latest commit
Switching branch restores snapshot
Supports independent development timelines
3️⃣ Merge Mechanism (Simplified)
Merge creates a commit with two parents.
Preserves DAG structure
Maintains history integrity
Current branch remains dominant in case of file overlap
4️⃣ Undo / Redo Engine (Stack-Based)
Implemented using two stacks:
Undo → Moves HEAD backward
Redo → Moves HEAD forward
Snapshot restoration ensures consistency
5️⃣ Revert (Backtracking-Based Recovery)
Revert creates a new commit that restores a previous snapshot without rewriting history.
This maintains:
Historical accuracy
Non-destructive revision control
Clean DAG continuity

🧠 Key Learning Outcomes
RevStack demonstrates:
Deep understanding of revision tracking systems
Graph-based history modeling
Stack-driven state transitions
Snapshot vs differential storage concepts
Branch pointer mechanics
Memory and pointer management in C++

📊 Complexity Summary
Operation	Time Complexity
add	O(1)
commit	O(n)
undo	O(n)
redo	O(n)
merge	O(n)
log	O(k)

🔮 Future Scope
Planned improvements include:
🗑️ Garbage Collection for unreachable commits
⚔️ Conflict Detection during merge
📂 Real file-system integration
🕒 Commit timestamps
🧠 Replace raw pointers with smart pointers
📌 Staging area implementation
🌳 Commit graph visualization
⚡ Differential storage to reduce memory usage
