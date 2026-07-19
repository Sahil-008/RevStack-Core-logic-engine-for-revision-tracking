export class Commit {
  public commitID: string;
  public message: string;
  public files: Record<string, string>;
  public parents: Commit[];
  public branch: string;

  constructor(id: string, msg: string, snapshot: Record<string, string>, parentCommit: Commit | null, branch: string = "main") {
    this.commitID = id;
    this.message = msg;
    this.files = { ...snapshot }; // Clone the files snapshot
    this.parents = [];
    this.branch = branch;
    if (parentCommit !== null) {
      this.parents.push(parentCommit);
    }
  }
}

export class Branch {
  public name: string;
  public head: Commit | null;
  public next: Branch | null;

  constructor(name: string, head: Commit | null = null, next: Branch | null = null) {
    this.name = name;
    this.head = head;
    this.next = next;
  }
}

export class RevStackEngine {
  private workingDir: Record<string, string> = {};
  private commitMap: Map<string, Commit> = new Map();

  private HEAD: Commit | null = null;
  private branchList: Branch | null = null;
  private currentBranch: Branch | null = null;

  private undoStack: Commit[] = [];
  private redoStack: Commit[] = [];

  constructor() {
    // Initialize main branch
    this.branchList = new Branch("main");
    this.currentBranch = this.branchList;
  }

  private generateID(): string {
    // Generate a random ID between 1000 and 9999 for cleaner display in UI
    return Math.floor(1000 + Math.random() * 9000).toString();
  }

  public addFile(filename: string, content: string): string {
    this.workingDir[filename] = content;
    return `File added/updated: ${filename}`;
  }

  public commit(message: string): string {
    if (this.HEAD !== null) {
      this.undoStack.push(this.HEAD);
    }

    // Clear redo stack on new commit
    this.redoStack = [];

    const id = this.generateID();
    const newCommit = new Commit(
      id,
      message,
      this.workingDir,
      this.currentBranch ? this.currentBranch.head : null,
      this.currentBranch ? this.currentBranch.name : "main"
    );

    if (this.currentBranch) {
      this.currentBranch.head = newCommit;
    }
    this.HEAD = newCommit;
    this.commitMap.set(id, newCommit);

    return `Committed: ${message} (ID: ${id})`;
  }

  public undo(): string {
    if (this.undoStack.length === 0) {
      return "Nothing to undo";
    }

    if (this.HEAD !== null) {
      this.redoStack.push(this.HEAD);
    }

    const previousHEAD = this.undoStack.pop()!;
    this.HEAD = previousHEAD;

    if (this.currentBranch) {
      this.currentBranch.head = this.HEAD;
    }
    this.workingDir = { ...this.HEAD.files };

    return "Undo successful";
  }

  public redo(): string {
    if (this.redoStack.length === 0) {
      return "Nothing to redo";
    }

    if (this.HEAD !== null) {
      this.undoStack.push(this.HEAD);
    }

    const nextHEAD = this.redoStack.pop()!;
    this.HEAD = nextHEAD;

    if (this.currentBranch) {
      this.currentBranch.head = this.HEAD;
    }
    this.workingDir = { ...this.HEAD.files };

    return "Redo successful";
  }

  public revert(id: string): string {
    const target = this.commitMap.get(id);
    if (!target) {
      return "Commit not found";
    }

    if (target.parents.length === 0) {
      return "Cannot revert root commit";
    }

    const parentCommit = target.parents[0];
    const revertedFiles = { ...parentCommit.files };

    const newID = this.generateID();
    const newCommit = new Commit(
      newID,
      `Revert commit ${id}`,
      revertedFiles,
      this.currentBranch ? this.currentBranch.head : null,
      this.currentBranch ? this.currentBranch.name : "main"
    );

    if (this.currentBranch) {
      this.currentBranch.head = newCommit;
    }
    this.HEAD = newCommit;
    this.commitMap.set(newID, newCommit);

    return `Reverted commit ${id} (New Commit ID: ${newID})`;
  }

  public log(): string[] {
    const output: string[] = [];
    let temp = this.HEAD;

    while (temp !== null) {
      output.push(`Commit ID: ${temp.commitID}`);
      output.push(`Message  : ${temp.message}`);
      output.push(`------------------------`);

      if (temp.parents.length > 0) {
        temp = temp.parents[0];
      } else {
        temp = null;
      }
    }

    if (output.length === 0) {
      output.push("No commits yet.");
    }
    return output;
  }

  public createBranch(name: string): string {
    if (!name || name.trim() === "") {
      return "Branch name cannot be empty";
    }

    // Check if branch already exists
    let temp = this.branchList;
    while (temp !== null) {
      if (temp.name === name) {
        return `Branch already exists: ${name}`;
      }
      temp = temp.next;
    }

    const newBranch = new Branch(
      name,
      this.currentBranch ? this.currentBranch.head : null,
      this.branchList
    );
    this.branchList = newBranch;

    return `Branch created: ${name}`;
  }

  public switchBranch(name: string): string {
    let temp = this.branchList;

    while (temp !== null) {
      if (temp.name === name) {
        this.currentBranch = temp;
        this.HEAD = temp.head;

        if (this.HEAD !== null) {
          this.workingDir = { ...this.HEAD.files };
        } else {
          this.workingDir = {};
        }

        return `Switched to branch ${name}`;
      }
      temp = temp.next;
    }

    return `Branch not found`;
  }

  public merge(branchName: string): string {
    let temp = this.branchList;

    while (temp !== null) {
      if (temp.name === branchName) {
        break;
      }
      temp = temp.next;
    }

    if (temp === null) {
      return "Branch not found";
    }

    const currentCommit = this.currentBranch ? this.currentBranch.head : null;
    const otherCommit = temp.head;

    if (currentCommit === null || otherCommit === null) {
      return "Cannot merge. One branch has no commits.";
    }

    const mergedFiles = { ...currentCommit.files };

    for (const [filename, content] of Object.entries(otherCommit.files)) {
      if (!(filename in mergedFiles)) {
        mergedFiles[filename] = content;
      }
    }

    const newID = this.generateID();
    const mergeCommit = new Commit(
      newID,
      `Merge branch ${branchName}`,
      mergedFiles,
      currentCommit,
      this.currentBranch ? this.currentBranch.name : "main"
    );

    mergeCommit.parents.push(otherCommit);

    if (this.currentBranch) {
      this.currentBranch.head = mergeCommit;
    }
    this.HEAD = mergeCommit;
    this.commitMap.set(newID, mergeCommit);

    return `Merged branch ${branchName} (ID: ${newID})`;
  }

  // Visual snapshot helper for React binding
  public getSnapshot() {
    // Return a deeply serialized structure of the internal states
    const branchesListArray: { name: string; headId: string | null }[] = [];
    let tempBranch = this.branchList;
    while (tempBranch !== null) {
      branchesListArray.push({
        name: tempBranch.name,
        headId: tempBranch.head ? tempBranch.head.commitID : null,
      });
      tempBranch = tempBranch.next;
    }

    const commitsMapObj: Record<string, { id: string; message: string; files: Record<string, string>; parents: string[]; branch: string }> = {};
    for (const [id, commitObj] of this.commitMap.entries()) {
      commitsMapObj[id] = {
        id: commitObj.commitID,
        message: commitObj.message,
        files: { ...commitObj.files },
        parents: commitObj.parents.map((p) => p.commitID),
        branch: commitObj.branch,
      };
    }

    return {
      workingDirectory: { ...this.workingDir },
      headId: this.HEAD ? this.HEAD.commitID : null,
      currentBranchName: this.currentBranch ? this.currentBranch.name : "main",
      branches: branchesListArray.reverse(), // Match createBranch linked-list prepend or display order
      commitMap: commitsMapObj,
      undoStack: this.undoStack.map((c) => c.commitID),
      redoStack: this.redoStack.map((c) => c.commitID),
    };
  }

  // Load a state snapshot to override internal state (useful for timeline scrub/reconstruct)
  public loadState(
    workingDir: Record<string, string>,
    commitMapObj: Record<string, { id: string; message: string; files: Record<string, string>; parents: string[]; branch: string }>,
    headId: string | null,
    currentBranchName: string,
    branchesArr: { name: string; headId: string | null }[],
    undoStackIds: string[],
    redoStackIds: string[]
  ) {
    this.workingDir = { ...workingDir };
    this.commitMap = new Map();

    // Reconstruct Commits
    for (const [id, cData] of Object.entries(commitMapObj)) {
      const commit = new Commit(cData.id, cData.message, cData.files, null, cData.branch || "main");
      this.commitMap.set(id, commit);
    }

    // Link parents
    for (const [id, cData] of Object.entries(commitMapObj)) {
      const commit = this.commitMap.get(id)!;
      commit.parents = cData.parents
        .map((pId) => this.commitMap.get(pId))
        .filter((c): c is Commit => !!c);
    }

    // Reconstruct Branch Linked List
    let lastBranch: Branch | null = null;
    let newBranchList: Branch | null = null;
    let activeBranch: Branch | null = null;

    // Build linked list of branches
    for (const bData of branchesArr) {
      const bHead = bData.headId ? this.commitMap.get(bData.headId) || null : null;
      const bNode = new Branch(bData.name, bHead, null);

      if (newBranchList === null) {
        newBranchList = bNode;
      } else if (lastBranch !== null) {
        lastBranch.next = bNode;
      }
      lastBranch = bNode;

      if (bData.name === currentBranchName) {
        activeBranch = bNode;
      }
    }

    this.branchList = newBranchList;
    this.currentBranch = activeBranch || newBranchList;
    this.HEAD = headId ? this.commitMap.get(headId) || null : null;

    // Reconstruct Undo/Redo Stacks
    this.undoStack = undoStackIds
      .map((id) => this.commitMap.get(id))
      .filter((c): c is Commit => !!c);
    this.redoStack = redoStackIds
      .map((id) => this.commitMap.get(id))
      .filter((c): c is Commit => !!c);
  }
}
