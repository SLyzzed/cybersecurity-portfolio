#!/usr/bin/env python3
"""Interactively create schema-valid Astro portfolio content."""

from __future__ import annotations

import re
import subprocess
import sys
from dataclasses import dataclass
from datetime import date
from pathlib import Path


@dataclass(frozen=True)
class PageType:
    key: str
    label: str
    collection: str
    headings: tuple[str, ...]
    questions: tuple[tuple[str, str], ...]


PAGE_TYPES = {
    "1": PageType(
        "project",
        "Project",
        "projects",
        (
            "Overview", "Problem Statement", "Objectives", "Architecture",
            "Technology Stack", "Implementation", "Security Considerations",
            "Testing and Validation", "Results", "Lessons Learned",
            "Future Improvements", "References",
        ),
        (
            ("problem", "What problem does this project solve?"),
            ("objective", "What is the main objective?"),
            ("technologies", "Technologies used (comma-separated):"),
            ("repositoryUrl", "Repository URL (optional):"),
            ("externalUrl", "External/demo URL (optional):"),
            ("outcome", "Current outcome or result (optional):"),
        ),
    ),
    "2": PageType(
        "writeup",
        "Technical write-up",
        "writeups",
        (
            "Objective", "Environment", "Prerequisites", "Procedure",
            "Commands and Explanations", "Validation", "Troubleshooting",
            "Security Considerations", "Outcome", "References",
        ),
        (
            ("objective", "What is being configured or investigated?"),
            ("environment", "What environment was used?"),
            ("prerequisites", "What prerequisites are required?"),
            ("expected_result", "What is the expected result?"),
            ("category", "Category (optional):"),
        ),
    ),
    "3": PageType(
        "blog",
        "Blog post",
        "blog",
        (
            "Introduction", "Current Context", "Main Argument",
            "Supporting Examples", "Counterarguments", "Practical Implications",
            "Conclusion",
        ),
        (
            ("thesis", "What is the central argument?"),
            ("audience", "Who is the intended audience?"),
            ("context", "What problem or trend does it discuss?"),
            ("conclusion", "What conclusion should the reader reach?"),
        ),
    ),
}


def ask(prompt: str, *, required: bool = False, default: str | None = None) -> str:
    while True:
        suffix = f" [{default}]" if default is not None else ""
        value = input(f"{prompt}{suffix} ").strip()
        if value:
            return value
        if default is not None:
            return default
        if not required:
            return ""
        print("This field is required.")


def ask_yes_no(prompt: str, *, default: bool = False) -> bool:
    marker = "Y/n" if default else "y/N"
    value = input(f"{prompt} [{marker}] ").strip().lower()
    return default if not value else value in {"y", "yes"}


def slugify(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", value.lower().strip()).strip("-") or "untitled"


def yaml_quote(value: str) -> str:
    return '"' + value.replace("\\", "\\\\").replace('"', '\\"') + '"'


def sensitive_warnings(text: str) -> list[str]:
    checks = (
        (r"\b[A-Z]:\\(?:[^\\\r\n]+\\)+[^\\\r\n]*", "Possible Windows path"),
        (r"\b[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}\b", "Possible email address"),
        (r"\b(?:10\.(?:\d{1,3}\.){2}\d{1,3}|192\.168\.(?:\d{1,3}\.)\d{1,3}|172\.(?:1[6-9]|2\d|3[01])\.(?:\d{1,3}\.)\d{1,3})\b", "Possible private IP address"),
        (r"(?i)\b(?:api[_-]?key|secret|token|password)\b\s*[:=]\s*\S+", "Possible credential or secret"),
    )
    return sorted({label for pattern, label in checks if re.search(pattern, text)})


def section_content(page_type: PageType, answers: dict[str, str]) -> dict[str, str]:
    if page_type.key == "project":
        return {"Problem Statement": answers["problem"], "Objectives": answers["objective"],
                "Technology Stack": answers["technologies"], "Results": answers["outcome"]}
    if page_type.key == "writeup":
        return {"Objective": answers["objective"], "Environment": answers["environment"],
                "Prerequisites": answers["prerequisites"], "Outcome": answers["expected_result"]}
    return {"Current Context": answers["context"], "Main Argument": answers["thesis"],
            "Conclusion": answers["conclusion"]}


def build_markdown(page_type: PageType, title: str, description: str, tags: list[str],
                   status: str, featured: bool, author_alias: str,
                   category: str, answers: dict[str, str], notes: str) -> str:
    lines = ["---", f"title: {yaml_quote(title)}", f"description: {yaml_quote(description)}",
             f"date: {date.today().isoformat()}", f"status: {status}",
             f"featured: {'true' if featured else 'false'}"]
    if tags:
        lines.append("tags:")
        lines.extend(f"  - {yaml_quote(tag)}" for tag in tags)
    else:
        lines.append("tags: []")

    if page_type.key == "project":
        for field in ("repositoryUrl", "externalUrl"):
            if answers.get(field):
                lines.append(f"{field}: {yaml_quote(answers[field])}")
    elif page_type.key == "writeup" and answers.get("category"):
        lines.append(f"category: {yaml_quote(answers['category'])}")
    elif page_type.key == "blog":
        lines.extend((f"authorAlias: {yaml_quote(author_alias)}", f"category: {yaml_quote(category)}"))

    lines.extend(("---", "", f"# {title}", ""))
    initial = section_content(page_type, answers)
    for heading in page_type.headings:
        lines.extend((f"## {heading}", ""))
        if initial.get(heading):
            lines.extend((initial[heading], ""))
    if notes:
        lines.extend(("## Additional Notes", "", notes, ""))
    return "\n".join(lines).rstrip() + "\n"


def choose_page_type() -> PageType:
    print("\nWhat would you like to create?\n")
    for number, page_type in PAGE_TYPES.items():
        print(f"{number}. {page_type.label}")
    print("4. Exit")
    while True:
        choice = input("\nSelection: ").strip()
        if choice == "4":
            raise SystemExit(0)
        if choice in PAGE_TYPES:
            return PAGE_TYPES[choice]
        print("Choose 1, 2, 3, or 4.")


def create_structured_project(repo_root: Path, title: str, description: str) -> int:
    slug = ask("Project slug:", default=slugify(title))
    category = ask("Project category:", required=True, default="Cybersecurity Project")
    status = ask("Status (draft, published, archived):", default="draft").lower()
    if status not in {"draft", "published", "archived"}:
        print("Error: status must be draft, published, or archived.", file=sys.stderr)
        return 1

    default_pages = (
        "Architecture:architecture,Lab Build:lab-build,"
        "Security and Isolation:security-and-isolation,"
        "Detection Engineering:detection-engineering,"
        "Incident Scenarios:incident-scenarios:incident-scenario,"
        "Investigations:investigations:investigation,"
        "Incident Reports:incident-reports:incident-report,"
        "Runbooks:runbooks:runbook,"
        "Lessons Learned:lessons-learned:lessons-learned,Roadmap:roadmap"
    )
    print(
        "\nSubpages use Title:slug or Title:slug:template. "
        "Separate entries with commas."
    )
    subpages = ask("Subpages:", default=default_pages)
    review_text = "\n".join((title, description, slug, category, subpages))
    warnings = sensitive_warnings(review_text)
    if warnings:
        print("\nSecurity review warnings:")
        for warning in warnings:
            print(f"- {warning}")
        if not ask_yes_no("Create the project anyway?"):
            print("Cancelled. Nothing was written.")
            return 1

    command = [
        "node", str(repo_root / "scripts" / "new-content.mjs"), "project",
        "--structured", "--title", title, "--slug", slug,
        "--description", description, "--category", category,
        "--status", status, "--subpages", subpages,
    ]
    try:
        subprocess.run(command, cwd=repo_root, check=True)
    except FileNotFoundError:
        print("Error: Node.js is required but the 'node' command was not found.", file=sys.stderr)
        return 1
    except subprocess.CalledProcessError as exc:
        return exc.returncode

    image_dir = repo_root / "public" / "images" / "projects" / slug
    image_dir.mkdir(parents=True, exist_ok=True)
    print(f"Image folder: {image_dir.relative_to(repo_root)}")
    print("Review every generated draft and run npm run build before publishing.")
    return 0


def main() -> int:
    repo_root = Path(__file__).resolve().parent.parent
    page_type = choose_page_type()
    title = ask("Title:", required=True)
    description = ask("Short description:", required=True)
    if page_type.key == "project" and ask_yes_no("Create a landing page with ordered subpages?", default=True):
        return create_structured_project(repo_root, title, description)

    tags = [tag.strip() for tag in ask("Tags, comma-separated (optional):").split(",") if tag.strip()]
    status = ask("Status (draft, published, archived):", default="draft").lower()
    if status not in {"draft", "published", "archived"}:
        print("Error: status must be draft, published, or archived.", file=sys.stderr)
        return 1
    featured = ask_yes_no("Feature on the homepage?")
    author_alias = ask("Author alias:", required=True, default="Archive Operator") if page_type.key == "blog" else ""
    category = ask("Blog category:", required=True, default="Research Notes") if page_type.key == "blog" else ""
    answers = {key: ask(prompt, required=key in {"problem", "objective", "thesis"})
               for key, prompt in page_type.questions}
    notes = ask("Additional notes (optional):")

    review_text = "\n".join((title, description, *tags, author_alias, category, notes, *answers.values()))
    warnings = sensitive_warnings(review_text)
    if warnings:
        print("\nSecurity review warnings:")
        for warning in warnings:
            print(f"- {warning}")
        if not ask_yes_no("Create the file anyway?"):
            print("Cancelled. Nothing was written.")
            return 1

    slug = slugify(title)
    output_file = repo_root / "src" / "content" / page_type.collection / f"{slug}.md"
    if output_file.exists():
        print(f"Refusing to overwrite existing file: {output_file}", file=sys.stderr)
        return 1
    output_file.parent.mkdir(parents=True, exist_ok=True)
    output_file.write_text(build_markdown(page_type, title, description, tags, status,
                                          featured, author_alias, category, answers, notes),
                           encoding="utf-8", newline="\n")
    image_dir = repo_root / "public" / "images" / page_type.collection / slug
    image_dir.mkdir(parents=True, exist_ok=True)
    print(f"\nCreated: {output_file.relative_to(repo_root)}")
    print(f"Image folder: {image_dir.relative_to(repo_root)}")
    print("Review the content and run npm run build before publishing.")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except KeyboardInterrupt:
        print("\nCancelled.")
        raise SystemExit(130)
