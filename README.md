# CityHealth Clinic - Appointment Request Portal
**Subject:** Human-Computer Interaction (HCI) – Interface Design and Programming  
**Activity:** Plan It, Build It, Test It  
**Design System:** Google Material Design 3 (MD3)  
**Project Root Directory:** `C:\clinic-appointment-app\`

---

## Deliverables Directory & Submission Map

All deliverables required by the activity instructions and grading rubric are organized inside this repository:

| Submission Item | File Location | Format | Description |
| :--- | :--- | :---: | :--- |
| **1. Project Code** | [`index.html`](index.html)<br>[`styles.css`](styles.css)<br>[`script.js`](script.js) | HTML / CSS / JS | • Complete responsive web application.<br>• Screen 1 (Main Form) & Screen 2 (Confirmation).<br>• Google MD3 design tokens & floating Toast.<br>• Pure JavaScript Model-View-Controller (MVC). |
| **2. Design Documents** | [`docs/Design_Documents.docx`](docs/Design_Documents.docx)<br>[`docs/planning_and_design.md`](docs/planning_and_design.md) | Word (.docx) & Markdown | • Complete **Field Table** (8 fields with controls, required flags, and validation rules).<br>• **Two Interface Design Patterns** with HCI rationales.<br>• **2D Visual Element** specification. |
| **3. Sketches & Wireframes** | [`docs/sketch_screen1_desktop_1280px.svg`](docs/sketch_screen1_desktop_1280px.svg)<br>[`docs/sketch_screen1_mobile_360px.svg`](docs/sketch_screen1_mobile_360px.svg)<br>[`docs/sketch_screen2_desktop_1280px.svg`](docs/sketch_screen2_desktop_1280px.svg)<br>[`docs/sketch_screen2_mobile_360px.svg`](docs/sketch_screen2_mobile_360px.svg) | Vector SVG (Figma-Ready) | • Screen 1 (Main Request Form) at Desktop (~1280px) & Mobile (~360px).<br>• Screen 2 (Confirmation View) at Desktop (~1280px) & Mobile (~360px).<br>• Directly importable into Figma via drag-and-drop. |
| **4. MVC Architecture** | [`docs/mvc_diagram.svg`](docs/mvc_diagram.svg)<br>[`docs/mvc_architecture.md`](docs/mvc_architecture.md) | Vector SVG & Markdown | • **One-Page MVC Diagram** with zero crossing lines and dedicated tracks.<br>• Code mapping table detailing exact file line numbers, functions, and responsibilities. |
| **5. Test Notes** | [`docs/Test_Notes.docx`](docs/Test_Notes.docx)<br>[`docs/test_notes.md`](docs/test_notes.md) | Word (.docx) & Markdown | • **Three Widths Testing Table**: 360px (mobile), 768px (tablet), 1280px (desktop).<br>• **Keyboard Accessibility Audit**: 7-step test (Tab, Space, Enter).<br>• **Usability Testing Notes**: At least 3 problems found and fixed with HCI analysis and code fixes. |
| **6. Demo Recording Script** | [`docs/Demo_Script_Step7.docx`](docs/Demo_Script_Step7.docx)<br>[`docs/demo_recording_script.md`](docs/demo_recording_script.md) | Word (.docx) & Markdown | • Concise ~3-minute presentation script formatted for all 4 group roles (Designer, Developer, Tester, Documenter) in a conversational Filipino college student presentation style. |
| **7. Events & Handlers Spec** | [`docs/step4_events_and_handlers.md`](docs/step4_events_and_handlers.md) | Markdown | • Detailed audit of all 7 event handlers across 5 event types (`submit`, `input`, `blur`, `change`, `click`). |

---

## How to Run the Application

No build tools, npm packages, or server installations are required:

1. Navigate to the project root: `C:\clinic-appointment-app\`
2. Double-click **`index.html`** or right-click and choose **Open with Google Chrome / Microsoft Edge**.
3. **To test responsive viewports:** Press `F12` to open Developer Tools, click the **Device Toggle** (`Ctrl + Shift + M`), and select:
   * **Mobile View:** Set width to `360px`.
   * **Tablet View:** Set width to `768px`.
   * **Desktop View:** Set width to `1280px`.

---

## Group Roles & Responsibilities

| Role | Responsibilities Fulfilled |
| :--- | :--- |
| **Designer** | UI wireframes (desktop & mobile SVGs), Google MD3 design tokens, color palette, custom 2D SVG clinic cross logo. |
| **Developer** | Semantic HTML5 structure, responsive CSS layout, JavaScript MVC implementation, submit-first validation, and Google MD3 floating Toast. |
| **Tester** | Viewport responsiveness audit (360px, 768px, 1280px), keyboard accessibility check, and logging/fixing 3 usability issues. |
| **Documenter** | Field table, MVC architecture diagram, Word documents generation (`.docx`), test notes, and 3-minute demo script. |

---
