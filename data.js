/* Demo content used only when this app is first opened. */
window.ORBIT_DEMO = {
  members: [
    { id: "m1", name: "Alex Morgan", initials: "AM", color: "#e8d9ff" },
    { id: "m2", name: "Jordan Lee", initials: "JL", color: "#c7f0e2" },
    { id: "m3", name: "Sam Rivera", initials: "SR", color: "#ffe0c2" },
    { id: "m4", name: "Taylor Kim", initials: "TK", color: "#d1e4ff" },
    { id: "m5", name: "Casey Patel", initials: "CP", color: "#ffd9df" }
  ],
  labels: [
    { id: "l1", name: "Design", color: "#bc9cff" },
    { id: "l2", name: "Development", color: "#74c7a6" },
    { id: "l3", name: "Research", color: "#71b7ec" },
    { id: "l4", name: "Priority", color: "#f28a82" },
    { id: "l5", name: "Content", color: "#f2c56b" },
    { id: "l6", name: "Review", color: "#f39fc3" }
  ],
  boards: [
    {
      id: "b-website", name: "Website Redesign", favorite: true, background: "linear-gradient(180deg,rgba(31,35,69,.04),rgba(27,30,61,.64)),url(https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1400&q=85)",
      lists: [
        { id: "w-todo", name: "To do", collapsed: false, cards: [
          { id: "w1", title: "Audit current website pages", description: "Review the key journeys and note friction points across the existing site.", labels: ["l3"], members: ["m1"], dueDate: "", checklist: [{id:"wc1",text:"List priority pages",done:true},{id:"wc2",text:"Share findings with team",done:false}], attachments: ["Website audit notes.pdf"], comments: [], activity: [] },
          { id: "w2", title: "Create homepage wireframes", description: "Explore a clearer first-time visitor experience.", cover: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80", labels: ["l1","l4"], members: ["m2","m4"], dueDate: "", checklist: [], attachments: [], comments: [], activity: [] },
          { id: "w3", title: "Write product page copy", description: "Draft concise copy for the three product pages.", labels: ["l5"], members: ["m3"], dueDate: "", checklist: [], attachments: [], comments: [], activity: [] }
        ] },
        { id: "w-doing", name: "In progress", collapsed: false, cards: [
          { id: "w4", title: "Build the design system", description: "Document reusable buttons, type styles, and spacing rules.", cover: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80", labels: ["l1"], members: ["m2"], dueDate: "", checklist: [{id:"wc3",text:"Set color tokens",done:true},{id:"wc4",text:"Document components",done:false}], attachments: ["Brand guidelines.fig"], comments: [], activity: [] },
          { id: "w5", title: "Prepare customer interviews", description: "Plan five short conversations about the current sign-up flow.", labels: ["l3"], members: ["m5"], dueDate: "", checklist: [], attachments: [], comments: [], activity: [] }
        ] },
        { id: "w-done", name: "Done", collapsed: false, cards: [
          { id: "w6", title: "Kickoff and project goals", description: "Agree on scope, success measures, and a review cadence.", labels: ["l6"], members: ["m1","m3"], dueDate: "", checklist: [], attachments: [], comments: [], activity: [] }
        ] }
      ],
      activity: []
    },
    {
      id: "b-mobile", name: "Mobile App Launch", favorite: false, background: "linear-gradient(180deg,rgba(22,44,55,.04),rgba(20,46,49,.64)),url(https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1400&q=85)",
      lists: [
        { id: "a-todo", name: "Backlog", collapsed: false, cards: [
          { id: "a1", title: "Map onboarding flow", description: "Keep setup quick and welcoming for new users.", cover: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9d?auto=format&fit=crop&w=800&q=80", labels: ["l1","l3"], members: ["m4"], dueDate: "", checklist: [], attachments: [], comments: [], activity: [] },
          { id: "a2", title: "Draft launch announcement", description: "Prepare a launch message for the newsletter and social channels.", labels: ["l5"], members: ["m3"], dueDate: "", checklist: [], attachments: [], comments: [], activity: [] },
          { id: "a3", title: "Review app store screenshots", description: "Check that the feature story reads clearly on small screens.", cover: "https://images.unsplash.com/photo-1551650975-87deedd944c3?auto=format&fit=crop&w=800&q=80", labels: ["l6"], members: ["m5"], dueDate: "", checklist: [], attachments: [], comments: [], activity: [] }
        ] },
        { id: "a-doing", name: "Building", collapsed: false, cards: [
          { id: "a4", title: "Connect account settings", description: "Finish the profile and notification preferences screens.", labels: ["l2"], members: ["m2"], dueDate: "", checklist: [{id:"ac1",text:"Add profile form",done:true},{id:"ac2",text:"Test notification settings",done:false}], attachments: [], comments: [], activity: [] },
          { id: "a5", title: "Run accessibility checks", description: "Review contrast, focus order, and screen reader labels.", labels: ["l4"], members: ["m1"], dueDate: "", checklist: [], attachments: [], comments: [], activity: [] }
        ] },
        { id: "a-done", name: "Ready", collapsed: false, cards: [
          { id: "a6", title: "Confirm launch checklist", description: "Align the release steps with the support team.", labels: ["l6"], members: ["m3","m5"], dueDate: "", checklist: [], attachments: ["Release checklist.docx"], comments: [], activity: [] }
        ] }
      ],
      activity: []
    },
    {
      id: "b-exams", name: "Exam Preparation", favorite: false, background: "linear-gradient(180deg,rgba(56,39,25,.03),rgba(53,38,28,.66)),url(https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1400&q=85)",
      lists: [
        { id: "e-todo", name: "Up next", collapsed: false, cards: [
          { id: "e1", title: "Organize biology notes", description: "Group notes by unit and flag topics to revisit.", cover: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80", labels: ["l3"], members: ["m4"], dueDate: "", checklist: [], attachments: [], comments: [], activity: [] },
          { id: "e2", title: "Make a weekly study plan", description: "Balance practice sessions with short review blocks.", labels: ["l4"], members: ["m1"], dueDate: "", checklist: [], attachments: [], comments: [], activity: [] },
          { id: "e3", title: "Review calculus problem sets", description: "Work through missed questions and write down the method.", labels: ["l2"], members: ["m2"], dueDate: "", checklist: [], attachments: [], comments: [], activity: [] }
        ] },
        { id: "e-doing", name: "Studying", collapsed: false, cards: [
          { id: "e4", title: "Practice chemistry equations", description: "Complete one timed set and review each answer.", labels: ["l4","l6"], members: ["m5"], dueDate: "", checklist: [{id:"ec1",text:"Balance reaction set A",done:true},{id:"ec2",text:"Review mistakes",done:false}], attachments: [], comments: [], activity: [] },
          { id: "e5", title: "Create history timeline", description: "Build a one-page timeline for the key course events.", cover: "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&q=80", labels: ["l5"], members: ["m3"], dueDate: "", checklist: [], attachments: [], comments: [], activity: [] }
        ] },
        { id: "e-done", name: "Reviewed", collapsed: false, cards: [
          { id: "e6", title: "Set up study resources", description: "Collect the course calendar, readings, and practice materials.", labels: ["l3"], members: ["m1","m4"], dueDate: "", checklist: [], attachments: [], comments: [], activity: [] }
        ] }
      ],
      activity: []
    }
  ]
};
