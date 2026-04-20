/** @vitest-environment jsdom */
import { expect, test } from "vitest";
import React from "react";
import { render } from "@testing-library/react";
import { ProjectGrid } from "../../app/components/ProjectGrid";

const mockRepos = [
  {
    name: "test-repo",
    url: "https://github.com/test/test-repo",
    description: "A test repository",
    stargazerCount: 10,
    forkCount: 5,
    primaryLanguage: { name: "TypeScript", color: "#3178c6" },
  },
];

test("renders no projects found when repos list is empty", () => {
  const { getByText } = render(<ProjectGrid repos={[]} />);
  expect(getByText("No projects found.")).toBeTruthy();
});

test("renders project grid with repo details", () => {
  const { getByText } = render(<ProjectGrid repos={mockRepos} />);
  expect(getByText("Top Projects")).toBeTruthy();
  expect(getByText("test-repo")).toBeTruthy();
  expect(getByText("A test repository")).toBeTruthy();
  expect(getByText(/TypeScript/)).toBeTruthy();
  expect(getByText(/10/)).toBeTruthy();
  expect(getByText(/5/)).toBeTruthy();
});
