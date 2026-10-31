// The page's sections, in order. Drives the header nav, the mobile menu and the
// active-section marker, and each section component uses its id and index.
export const SECTIONS = [
  { id: "work", index: "01", label: "Work" },
  { id: "experience", index: "02", label: "Experience" },
  { id: "skills", index: "03", label: "Skills" },
  { id: "contact", index: "04", label: "Contact" },
];

export const section = (id) => SECTIONS.find((s) => s.id === id);
