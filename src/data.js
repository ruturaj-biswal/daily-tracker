// Daily blocks: start/end in minutes from midnight
export const BLOCKS = [
  { id: "wake", s: 480, e: 540, icon: "🌅", t: "Wake up & get ready", d: "Freshen up, drink water, have breakfast at mess timing." },
  { id: "prep", s: 540, e: 720, icon: "🎯", t: "Placement preparation", d: "Study only 1–2 subjects today (see rotation)." },
  { id: "lunch", s: 720, e: 840, icon: "🍛", t: "Bath, lunch & rest", d: "Lunch at mess timing, 20–30 min nap, relax." },
  { id: "backend", s: 840, e: 1020, icon: "⚙️", t: "Backend development", d: "2:00 learn a concept · 2:30 implement · 4:30 test, debug, push to GitHub." },
  { id: "run", s: 1020, e: 1080, icon: "🏃", t: "Running / recovery", d: "Run 20–30 min on 3–4 days a week. Walk or recover otherwise." },
  { id: "snack", s: 1080, e: 1110, icon: "🥜", t: "Hostel snacks", d: "Tea with roasted chana, peanuts, fruit or whatever is available." },
  { id: "cs", s: 1110, e: 1230, icon: "🧠", t: "CS fundamentals", d: "OOP, DBMS, SQL, OS, CN per weekly plan. Practise interview questions." },
  { id: "dinner", s: 1260, e: 1290, icon: "🍽️", t: "Hostel dinner", d: "Include the available protein source where possible." },
  { id: "revise", s: 1290, e: 1350, icon: "🔁", t: "Daily revision", d: "Recall today's concepts, revise coding mistakes, review what you built." },
  { id: "plan", s: 1350, e: 1380, icon: "📝", t: "Plan tomorrow", d: "Choose subjects, backend task and workout plan." },
  { id: "wind", s: 1380, e: 1470, icon: "🌙", t: "Personal time & wind-down", d: "Relax, prep for sleep. Don't let study push bedtime." },
];

// index = JS getDay(): 0 = Sunday
export const WEEK = [
  { day: "Sunday", prep: "Review mistakes + light practice", cs: "Weekly recap or rest" },
  { day: "Monday", prep: "Java + DSA", cs: "OOP" },
  { day: "Tuesday", prep: "Aptitude + practice tests", cs: "DBMS + SQL" },
  { day: "Wednesday", prep: "Java + DSA", cs: "Operating Systems" },
  { day: "Thursday", prep: "Aptitude + practice tests", cs: "Computer Networks" },
  { day: "Friday", prep: "Java + DSA", cs: "OOP + DBMS interview questions" },
  { day: "Saturday", prep: "Weekly revision + mock test", cs: "Revise weakest CS topic" },
];

export const RULES = [
  "Consistency over perfection: missed a block? Resume at the next one.",
  "Running: 20–30 min, 3–4 days a week. Skip it if you're tired.",
  "Sleep: 12:30 AM–8:00 AM. Move bedtime earlier if you feel tired.",
  "Sunday: review progress and prep the week, don't cram missed tasks.",
];
