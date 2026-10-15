"""Run the existing demo seeder with safer standalone checks and a fixed clock.

Usage: ALLOW_DEMO_SEEDING=1 DEMO_PASSWORD='...' uv run python scripts/seed_demo.py
"""

import argparse
import datetime
import os
import sys
from pathlib import Path

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "scholaria.settings")
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import django

django.setup()

from django.core.management.base import CommandError
from django.db import transaction
from django.utils import timezone

from courses.management.commands.seed_demo import (
    STUDENT_ROSTER,
    clean_name_for_username,
)
from courses.models import Course
from quizzes.models import Quiz
from users.models import CustomUser

DEMO_COURSES = (
    "Algorithmique & Structures de Données",
    "Développement Web & APIs",
)
DEMO_QUIZZES = (
    ("Contrôle 1 : Algorithmes & Tris", DEMO_COURSES[0]),
    ("Contrôle 1 : REST APIs & Architecture", DEMO_COURSES[1]),
)


def validate_demo_scope(teacher_username):
    if os.environ.get("ALLOW_DEMO_SEEDING") != "1":
        raise CommandError("Set ALLOW_DEMO_SEEDING=1 to explicitly enable demo seeding.")
    if not os.environ.get("DEMO_PASSWORD"):
        raise CommandError("Set DEMO_PASSWORD explicitly for the demo student accounts.")

    teacher = CustomUser.objects.filter(username=teacher_username).first()
    if teacher is None:
        raise CommandError(f"Teacher '{teacher_username}' must already exist; this script never creates accounts.")
    if teacher.role != "Teacher":
        raise CommandError(f"'{teacher_username}' must have the Teacher role.")

    courses = list(Course.objects.filter(teacher=teacher).order_by("id"))
    if courses and tuple(course.course_name for course in courses) != DEMO_COURSES:
        raise CommandError(
            "Use a teacher with no courses or only the two demo courses, in demo order. "
            "The existing seeder selects the first two courses."
        )

    quizzes = list(Quiz.objects.filter(teacher=teacher).order_by("id"))
    if quizzes and tuple(quiz.name for quiz in quizzes) != tuple(name for name, _ in DEMO_QUIZZES):
        raise CommandError("Use a teacher with no quizzes or only the two demo quizzes.")
    if courses and quizzes:
        course_by_name = {course.course_name: course for course in courses}
        for quiz, (_, expected_course) in zip(quizzes, DEMO_QUIZZES):
            if quiz.course_id != course_by_name[expected_course].id:
                raise CommandError(f"Demo quiz '{quiz.name}' is attached to the wrong demo course.")

    # The existing command reserves these deterministic identities for demo use.
    for first, last, _birth_date in STUDENT_ROSTER:
        base = f"{clean_name_for_username(first)}.{clean_name_for_username(last)}"
        email = f"{base}@scholaria.ai"
        user = CustomUser.objects.filter(username=base).first()
        if user and (user.email != email or user.role != "Student"):
            raise CommandError(f"'{base}' is already used by a non-demo account; resolve the collision first.")


def main():
    parser = argparse.ArgumentParser(description="Seed a reproducible Scholaria teacher-dashboard demo.")
    parser.add_argument("--teacher", default="youssef_kaddioui", help="Existing teacher username.")
    parser.add_argument("--seed", type=int, default=42, help="Seed for deterministic generated scores and answers.")
    parser.add_argument(
        "--anchor-date",
        type=datetime.date.fromisoformat,
        default=datetime.date(2026, 10, 11),
        help="ISO date used as the fixed demo clock (default: 2026-10-11). Keep it the same on reruns.",
    )
    args = parser.parse_args()

    validate_demo_scope(args.teacher)

    # The original management command uses timezone.now() for due dates and
    # generated attempt timestamps. Pin it for idempotent reruns with same args.
    anchor = datetime.datetime.combine(args.anchor_date, datetime.time(12), tzinfo=datetime.UTC)
    original_now = timezone.now
    timezone.now = lambda: anchor
    try:
        from courses.management.commands.seed_demo import Command

        with transaction.atomic():
            Command().handle(
                teacher=args.teacher,
                seed=args.seed,
                reset=False,
                force=True,
            )
            # The legacy seeder may pair either quiz with any demo student.
            # Enroll the demo roster in both demo courses so every generated
            # attempt belongs to a course the student can access.
            teacher = CustomUser.objects.get(username=args.teacher)
            demo_courses = Course.objects.filter(teacher=teacher, course_name__in=DEMO_COURSES)
            demo_users = CustomUser.objects.filter(
                role="Student",
                email__endswith="@scholaria.ai",
                username__in=[
                    f"{clean_name_for_username(first)}.{clean_name_for_username(last)}"
                    for first, last, _ in STUDENT_ROSTER
                ],
            )
            for course in demo_courses:
                course.student.add(*demo_users)
    finally:
        timezone.now = original_now


if __name__ == "__main__":
    try:
        main()
    except CommandError as exc:
        raise SystemExit(f"Demo seed aborted: {exc}") from exc
