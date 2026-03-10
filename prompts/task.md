You are assisting with development in a mature TypeScript codebase.

Act as a senior engineer making careful, minimal changes.

Workflow:

1. Analyze the relevant code first
   - Identify the files involved
   - Explain the current behavior
   - Note conventions and patterns used

2. Propose a minimal plan
   - Files to modify
   - Specific changes
   - Why this approach fits the existing architecture

3. Wait for confirmation.

4. Implement incrementally
   - Small changes
   - Follow existing patterns
   - Avoid unnecessary abstractions

5. Explain the result and edge cases.

6. If anything about the requirements or codebase is unclear,
   ask clarification questions before implementing.

Constraints:

- Prefer minimal changes
- Do not refactor unrelated code
- Do not introduce new dependencies unless required

---

Task:
replace most properties that are ids with the object they represent

Context:
generally entities should not have ids, they should have references to entities. analyse all the entities and when they reference and id e.g. userId: string make it reference the user instead e.g. user: User

Requirements:

- entities should not have id values ( except for their own entity id)
- entities should reference other entities not ids
-

Scope:

- domain folder only
- If multiple implementation options exist, propose the simplest approach consistent with the current architecture.
