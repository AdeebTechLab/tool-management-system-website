const STORAGE_KEY = "orbit-board-v1";

export const initialBoard = {
  id: "website-redesign",
  title: "Website redesign",
  subtitle: "Plan, build, and ship the new website.",
  workspace: "Studio North",
  columns: [
    { id: "ideas", title: "Ideas", color: "lavender" },
    { id: "todo", title: "To do", color: "blue" },
    { id: "progress", title: "In progress", color: "orange" },
    { id: "done", title: "Done", color: "green" },
  ],
  tasks: [
    {
      id: "t1",
      columnId: "ideas",
      title: "Explore references for the new homepage",
      description: "Collect a few visual directions and examples we can use for the first design review.",
      priority: "low",
      dueDate: "",
      assignee: "Maya Chen",
      initials: "MC",
      avatar: "coral",
      tag: "Research",
    },
    {
      id: "t2",
      columnId: "ideas",
      title: "Define our brand voice",
      description: "Align on how we want to sound across the site.",
      priority: "medium",
      dueDate: "",
      assignee: "Leo Martin",
      initials: "LM",
      avatar: "blue",
      tag: "Content",
    },
    {
      id: "t3",
      columnId: "todo",
      title: "Create sitemap and page structure",
      description: "Map out the main pages and how visitors move between them.",
      priority: "high",
      dueDate: "2026-11-24",
      assignee: "Maya Chen",
      initials: "MC",
      avatar: "coral",
      tag: "Planning",
    },
    {
      id: "t4",
      columnId: "todo",
      title: "Write homepage copy",
      description: "Draft the hero, product overview, and customer proof sections.",
      priority: "medium",
      dueDate: "2026-11-27",
      assignee: "Sam Rivera",
      initials: "SR",
      avatar: "purple",
      tag: "Content",
    },
    {
      id: "t5",
      columnId: "todo",
      title: "Prepare product photography",
      description: "Choose the product shots that will anchor the new pages.",
      priority: "low",
      dueDate: "",
      assignee: "Leo Martin",
      initials: "LM",
      avatar: "blue",
      tag: "Design",
    },
    {
      id: "t6",
      columnId: "progress",
      title: "Design homepage wireframes",
      description: "Lay out the core sections and test the hierarchy before visual design.",
      priority: "high",
      dueDate: "2026-11-22",
      assignee: "Sam Rivera",
      initials: "SR",
      avatar: "purple",
      tag: "Design",
    },
    {
      id: "t7",
      columnId: "progress",
      title: "Build the component library",
      description: "Set up reusable buttons, cards, and typography styles.",
      priority: "medium",
      dueDate: "",
      assignee: "Maya Chen",
      initials: "MC",
      avatar: "coral",
      tag: "Development",
    },
    {
      id: "t8",
      columnId: "done",
      title: "Project kickoff and team alignment",
      description: "Get the team together and agree on goals, scope, and how we'll work.",
      priority: "low",
      dueDate: "2026-11-18",
      assignee: "Leo Martin",
      initials: "LM",
      avatar: "blue",
      tag: "Planning",
    },
    {
      id: "t9",
      columnId: "done",
      title: "Gather customer feedback",
      description: "Review recent interviews and pull out the most useful themes.",
      priority: "medium",
      dueDate: "",
      assignee: "Sam Rivera",
      initials: "SR",
      avatar: "purple",
      tag: "Research",
    },
    {
      id: "t10",
      columnId: "ideas",
      title: "Map analytics events for the redesign",
      description: "Agree which product and conversion events should be tracked after launch.",
      priority: "medium",
      dueDate: "",
      assignee: "Jordan Davis",
      initials: "JD",
      avatar: "dark",
      tag: "Planning",
    },
    {
      id: "t11",
      columnId: "todo",
      title: "Review accessibility requirements",
      description: "Check keyboard navigation, contrast, and screen reader behavior before handoff.",
      priority: "high",
      dueDate: "2026-11-25",
      assignee: "Jordan Davis",
      initials: "JD",
      avatar: "dark",
      tag: "Planning",
    },
    {
      id: "t12",
      columnId: "progress",
      title: "Approve mobile navigation prototypes",
      description: "Review the small-screen navigation and share final feedback with design.",
      priority: "high",
      dueDate: "2026-11-26",
      assignee: "Jordan Davis",
      initials: "JD",
      avatar: "dark",
      tag: "Design",
    },
    {
      id: "t13",
      columnId: "done",
      title: "Confirm launch success metrics",
      description: "Align the team on the outcomes used to measure the redesign.",
      priority: "low",
      dueDate: "2026-11-19",
      assignee: "Jordan Davis",
      initials: "JD",
      avatar: "dark",
      tag: "Planning",
    },
  ],
};

export function loadBoard() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return structuredClone(initialBoard);
    const board = JSON.parse(saved);
    if (!Array.isArray(board.columns) || !Array.isArray(board.tasks)) {
      throw new Error("Saved board data has an invalid shape.");
    }
    return board;
  } catch (error) {
    console.error("Could not load the saved board.", error);
    return structuredClone(initialBoard);
  }
}

export function saveBoard(board) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(board));
  } catch (error) {
    console.error("Could not save the board.", error);
  }
}

export function loadWorkspace() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return { boards: [structuredClone(initialBoard)], activeBoardId: initialBoard.id };
    const workspace = JSON.parse(saved);
    if (Array.isArray(workspace.boards) && workspace.boards.length) {
      return {
        boards: workspace.boards.filter((board) => Array.isArray(board.columns) && Array.isArray(board.tasks)),
        activeBoardId: workspace.activeBoardId,
      };
    }
    if (Array.isArray(workspace.columns) && Array.isArray(workspace.tasks)) {
      const board = { ...workspace, id: workspace.id || initialBoard.id };
      return { boards: [board], activeBoardId: board.id };
    }
    throw new Error("Saved workspace data has an invalid shape.");
  } catch (error) {
    console.error("Could not load the saved workspace.", error);
    return { boards: [structuredClone(initialBoard)], activeBoardId: initialBoard.id };
  }
}

export function saveWorkspace(boards, activeBoardId) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ boards, activeBoardId }));
  } catch (error) {
    console.error("Could not save the workspace.", error);
  }
}
