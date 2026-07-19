# RevStack – Core Logic Engine for Revision Tracking

## Overview

RevStack is a C++ implementation of a lightweight version control system inspired by Git. It focuses on the core backend logic behind revision tracking, allowing users to create commits, manage branches, merge histories, undo and redo changes, and revert to previous versions. The project emphasizes efficient data structure design, graph-based history management, and object-oriented programming.

## Features

* Snapshot-based commit system
* Branch creation and switching
* Merge commits with multiple parents
* Undo and redo functionality
* Revert to previous revisions without rewriting history
* Commit history traversal
* Efficient commit lookup using hash maps

## Tech Stack

* **Language:** C++
* **Concepts:** Object-Oriented Programming (OOP), Data Structures, Algorithms
* **Data Structures Used:**

  * Directed Acyclic Graph (DAG)
  * Hash Map (`unordered_map`)
  * Stack
  * Linked List
  * Vector

## System Design

### Snapshot-Based Commits

Each commit stores a complete snapshot of the working directory, ensuring previous revisions remain immutable and allowing safe restoration of any historical state.

### Branch Management

Branches are implemented as named pointers to commits, enabling independent development paths and seamless branch switching.

### Merge System

Merge operations create commits with two parent references, preserving the commit graph while maintaining a complete revision history.

### Undo / Redo

A dual-stack mechanism enables moving backward and forward through commit history while restoring the correct project snapshot.

### Revert

Reverting creates a new commit based on a previous snapshot instead of modifying existing history, preserving the integrity of the commit graph.

## Time Complexity

| Operation | Complexity |
| --------- | ---------- |
| Add File  | O(1)       |
| Commit    | O(n)       |
| Undo      | O(n)       |
| Redo      | O(n)       |
| Merge     | O(n)       |
| View Log  | O(k)       |

*n = number of files, k = number of commits displayed.*

## Learning Outcomes

Through this project, I gained practical experience with:

* Version control system architecture
* Graph-based history modeling using DAGs
* Pointer and memory management in C++
* Object-oriented software design
* Branch and merge mechanics
* Snapshot versus differential storage approaches
* Stack-based state management

## Future Improvements

* Garbage collection for unreachable commits
* Merge conflict detection and resolution
* Real file system integration
* Commit timestamps and metadata
* Smart pointer implementation
* Staging area support
* Commit graph visualization
* Differential storage to optimize memory usage

## Repository Structure

```
RevStack/
├── src/
├── include/
├── docs/
├── README.md
└── LICENSE
```

## Author

**Sahil Kumar**

Backend Software Engineering Project built to demonstrate the internal architecture and data structures behind modern version control systems.
