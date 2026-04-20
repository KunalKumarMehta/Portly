/**
 * @vitest-environment jsdom
 */
import { expect, test } from "vitest";
import React from "react";
import { render } from "@testing-library/react";
import { ProfileHeader } from "../../app/components/ProfileHeader";

const mockUser = {
  login: "testuser",
  avatarUrl: "https://example.com/avatar.png",
  name: "Test User",
  bio: "Software Engineer",
  followers: 100,
  publicRepos: 10,
  url: "https://github.com/testuser"
};

test("ProfileHeader renders user information correctly", () => {
  const { getByText, getByAltText } = render(<ProfileHeader user={mockUser} />);
  
  expect(getByText("Test User")).toBeTruthy();
  expect(getByText("Software Engineer")).toBeTruthy();
  expect(getByText("👥 100 followers")).toBeTruthy();
  expect(getByText("📝 10 repos")).toBeTruthy();
  expect(getByAltText("testuser").getAttribute("src")).toBe("https://example.com/avatar.png");
});

test("ProfileHeader fallback to login when name is empty", () => {
  const userWithoutName = { ...mockUser, name: "" };
  const { getByText } = render(<ProfileHeader user={userWithoutName} />);
  
  expect(getByText("testuser")).toBeTruthy();
});
