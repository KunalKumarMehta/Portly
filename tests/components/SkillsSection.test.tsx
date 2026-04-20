/**
 * @vitest-environment jsdom
 */
import { expect, test, describe } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import { SkillsSection } from "../../app/components/SkillsSection";

describe('SkillsSection', () => {
  test('renders languages sorted by count', () => {
    const languages = { 'TypeScript': 10, 'Rust': 5, 'Go': 15 };
    render(<SkillsSection languages={languages} />);
    
    const items = screen.getAllByRole('generic').filter(el => el.className.includes('bg-gray-100'));
    expect(items[0].textContent).toContain('Go');
    expect(items[1].textContent).toContain('TypeScript');
    expect(items[2].textContent).toContain('Rust');
  });

  test('returns null when no languages', () => {
    const { container } = render(<SkillsSection languages={{}} />);
    expect(container.firstChild).toBeNull();
  });
});
