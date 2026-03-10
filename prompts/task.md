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
create smartEnums for all value types

Context:
smartEnums should be used whenever there is a collection of names such as resourceType

Requirements:

- anywhere that a type is defined as "this value" | "that value" use an existing or create a smartEnum for those values
- smartEnums should be created in the packages/contracts/src/enums folder

Scope:

- domain folder and packages/contracts/src/enums folder

If multiple implementation options exist, propose the simplest approach consistent with the current architecture.
