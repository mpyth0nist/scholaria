"""
Seed a complete, coherent demo: a teacher, three courses with modules,
published lessons and quizzes, a student roster with enrollments, quiz
attempts and lesson progress, and the RAG index for the AI tutor.

Safe to rerun: content is synced by name, and the demo students' activity
is regenerated from the same random seed, so counts stay the same.
"""
import datetime
import json
import os
import random
import re
import unicodedata
from contextlib import contextmanager
from decimal import Decimal
from pathlib import Path

from django.conf import settings
from django.contrib.auth.hashers import make_password
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from django.db.models import Count, ProtectedError, Sum
from django.db.models.signals import post_save
from django.utils import timezone

from courses.models import Course, Lesson, Module, UserLessonProgress
from quizzes.models import Assignment, Choice, Question, Quiz, UserAnswer, UserAttempt
from users.models import CustomUser

CONTENT_FILE = Path(__file__).with_name("demo_content.json")
DEMO_EMAIL_DOMAIN = "scholaria.ai"
DEFAULT_DEMO_PASSWORD = "ScholariaDemo2026!"

# Account for trying the student experience; it gets enrollments but no
# activity, so visitors can take quizzes and complete lessons themselves.
DEMO_STUDENT = ("demo_student", "Sara", "Alaoui", datetime.date(2003, 2, 9))

STUDENT_ROSTER = [
    ("Youssef", "El Amrani", datetime.date(2002, 4, 12)),
    ("Fatima-Zahra", "Benali", datetime.date(2003, 1, 25)),
    ("Mehdi", "Tazi", datetime.date(2001, 11, 8)),
    ("Salma", "Bennani", datetime.date(2002, 9, 17)),
    ("Amine", "Berrada", datetime.date(2001, 6, 30)),
    ("Kenza", "Chraibi", datetime.date(2003, 3, 14)),
    ("Hamza", "Idrissi", datetime.date(2002, 7, 22)),
    ("Soukaina", "Mansouri", datetime.date(2002, 12, 5)),
    ("Omar", "Alami", datetime.date(2001, 5, 19)),
    ("Nouhaila", "Bennis", datetime.date(2003, 8, 11)),
    ("Tariq", "Daoudi", datetime.date(2002, 2, 28)),
    ("Hiba", "Kabbaj", datetime.date(2003, 10, 3)),
    ("Walid", "Slaoui", datetime.date(2001, 8, 15)),
    ("Zineb", "Bouzid", datetime.date(2002, 11, 20)),
    ("Ayoub", "Lahlou", datetime.date(2001, 3, 9)),
    ("Meriem", "Fassi", datetime.date(2003, 5, 27)),
    ("Reda", "Belkadi", datetime.date(2002, 10, 14)),
    ("Rim", "Tahiri", datetime.date(2003, 7, 1)),
    ("Anas", "Chaoui", datetime.date(2001, 12, 18)),
    ("Imane", "Kadiri", datetime.date(2002, 6, 4)),
]

# Roster indexes enrolled in each course, in demo_content.json order
# (Computer Science, World History, Islamic Art). The ranges overlap so
# some students take several courses.
ENROLLMENT = [range(16), range(6, 20), range(12, 20)]

# Created by earlier versions of this seeder with inconsistent data; --reset removes them
LEGACY_COURSE_NAMES = ["Algorithmique & Structures de Données", "Développement Web & APIs"]

QUIZ_TAKE_RATE = 0.8  # chance an enrolled student has taken a given quiz
ACTIVITY_WINDOW_DAYS = 28


def clean_name_for_username(name_str):
    """Normalizes string to lowercase ASCII alphanumeric."""
    normalized = unicodedata.normalize("NFKD", name_str.lower())
    ascii_only = normalized.encode("ASCII", "ignore").decode("utf-8")
    return re.sub(r"[^a-z0-9]", "", ascii_only)


def roster_username(first_name, last_name):
    return f"{clean_name_for_username(first_name)}.{clean_name_for_username(last_name)}"


def demo_usernames():
    return [roster_username(first, last) for first, last, _ in STUDENT_ROSTER] + [DEMO_STUDENT[0]]


@contextmanager
def ingestion_signals_paused():
    """Seeding indexes everything once at the end instead of queueing a task per save."""
    from courses.signals import on_lesson_saved
    from quizzes.signals import on_assignment_saved, on_question_saved, on_quiz_saved

    receivers = [
        (on_lesson_saved, Lesson),
        (on_quiz_saved, Quiz),
        (on_question_saved, Question),
        (on_assignment_saved, Assignment),
    ]
    for receiver, sender in receivers:
        post_save.disconnect(receiver, sender=sender)
    try:
        yield
    finally:
        for receiver, sender in receivers:
            post_save.connect(receiver, sender=sender)


class Command(BaseCommand):
    help = "Seed a complete demo: teacher, courses with lessons and quizzes, students, activity and the RAG index."

    def add_arguments(self, parser):
        parser.add_argument(
            "--teacher",
            default="youssef_kaddioui",
            help="Username of the demo teacher; created if missing (default: youssef_kaddioui).",
        )
        parser.add_argument(
            "--seed",
            type=int,
            default=42,
            help="Random seed for reproducible scores, answers and progress.",
        )
        parser.add_argument(
            "--anchor-date",
            type=datetime.date.fromisoformat,
            help="Pin generated timestamps to this ISO date instead of now.",
        )
        parser.add_argument(
            "--reset",
            action="store_true",
            help="Delete the demo students and demo courses before seeding.",
        )
        parser.add_argument(
            "--skip-index",
            action="store_true",
            help="Do not build the RAG index (run `manage.py ingest_all_data` later).",
        )
        parser.add_argument(
            "--force",
            action="store_true",
            help="Allow execution even if settings.DEBUG is False.",
        )

    def handle(self, *args, **options):
        if not settings.DEBUG and not options["force"]:
            raise CommandError(
                "Safety guard: seed_demo can only run when DEBUG=True. "
                "Pass --force if you intentionally wish to seed in this environment."
            )

        self.rng = random.Random(options["seed"])
        anchor = options["anchor_date"]
        self.now = (
            datetime.datetime.combine(anchor, datetime.time(12), tzinfo=datetime.UTC)
            if anchor else timezone.now()
        )
        password = os.getenv("DEMO_PASSWORD", getattr(settings, "DEMO_PASSWORD", DEFAULT_DEMO_PASSWORD))
        # Hash once: every demo account shares the password, and hashing is slow by design
        self.password_hash = make_password(password)
        content = json.loads(CONTENT_FILE.read_text(encoding="utf-8"))

        with ingestion_signals_paused(), transaction.atomic():
            if options["reset"]:
                self._reset(options["teacher"], content)
            teacher = self._get_teacher(options["teacher"])
            courses = [self._sync_course(teacher, data) for data in content]
            roster, demo_student = self._get_students()
            enrolled = self._enroll(courses, roster, demo_student)
            self._seed_activity(courses, enrolled, roster)

        if options["skip_index"]:
            self.stdout.write("Skipped RAG indexing; run `manage.py ingest_all_data` before using the AI tutor.")
        else:
            self._index(courses)

        self._print_summary(teacher, courses)

    # ── Accounts ──────────────────────────────────────────────────────────────

    def _get_teacher(self, username):
        teacher = CustomUser.objects.filter(username=username).first()
        if teacher is None:
            return CustomUser.objects.create(
                username=username,
                password=self.password_hash,
                email=f"{username}@{DEMO_EMAIL_DOMAIN}",
                first_name="Youssef",
                last_name="Kaddioui",
                role="Teacher",
                birth_date=datetime.date(1990, 1, 1),
            )
        if teacher.role != "Teacher":
            raise CommandError(f"'{username}' exists but is not a Teacher; pass another --teacher.")
        return teacher

    def _get_student(self, username, first_name, last_name, birth_date):
        email = f"{username}@{DEMO_EMAIL_DOMAIN}"
        student = CustomUser.objects.filter(username=username).first()
        if student is None:
            return CustomUser.objects.create(
                username=username,
                password=self.password_hash,
                email=email,
                first_name=first_name,
                last_name=last_name,
                role="Student",
                birth_date=birth_date,
            )
        if student.email != email or student.role != "Student":
            raise CommandError(f"Username '{username}' belongs to a non-demo account; resolve the collision first.")
        return student

    def _get_students(self):
        roster = [
            self._get_student(roster_username(first, last), first, last, birth_date)
            for first, last, birth_date in STUDENT_ROSTER
        ]
        return roster, self._get_student(*DEMO_STUDENT)

    # ── Content ───────────────────────────────────────────────────────────────

    def _sync_course(self, teacher, data):
        course, _ = Course.objects.update_or_create(
            teacher=teacher,
            course_name=data["course_name"],
            defaults={
                "subject": data["subject"],
                "description": data["description"],
                "published": True,
                "is_published": True,
            },
        )
        for order, module_data in enumerate(data["modules"], start=1):
            module, _ = Module.objects.update_or_create(
                course=course,
                title=module_data["title"],
                defaults={"order": order, "is_published": True},
            )
            for lesson_data in module_data["lessons"]:
                Lesson.objects.update_or_create(
                    module=module,
                    title=lesson_data["title"],
                    defaults={"content": lesson_data["content"], "is_published": True},
                )

        for quiz_data in data["quizzes"]:
            quiz, _ = Quiz.objects.get_or_create(
                course=course,
                name=quiz_data["name"],
                defaults={
                    "teacher": teacher,
                    "description": quiz_data["description"],
                    "due_date": self.now.date() + datetime.timedelta(days=30),
                },
            )
            # Questions are only created once: real attempts may reference them
            if not quiz.questions.exists():
                for question_data in quiz_data["questions"]:
                    question = Question.objects.create(quiz=quiz, question_text=question_data["text"])
                    Choice.objects.bulk_create(
                        Choice(question=question, choice=text, is_correct=is_correct)
                        for text, is_correct in question_data["choices"]
                    )
        return course

    def _reset(self, teacher_username, content):
        students = CustomUser.objects.filter(
            username__in=demo_usernames(), email__endswith=f"@{DEMO_EMAIL_DOMAIN}", role="Student",
        )
        courses = Course.objects.filter(
            teacher__username=teacher_username,
            course_name__in=[data["course_name"] for data in content] + LEGACY_COURSE_NAMES,
        )
        try:
            # Attempts protect their quiz, so the students (and their attempts) go first
            students.delete()
            courses.delete()
        except ProtectedError as exc:
            raise CommandError(
                "Reset blocked: non-demo students have attempts on demo quizzes. Remove them first."
            ) from exc
        self.stdout.write(self.style.WARNING("Reset: removed demo students and demo courses."))

    # ── Enrollment & activity ─────────────────────────────────────────────────

    def _enroll(self, courses, roster, demo_student):
        enrolled = {}
        for course, indexes in zip(courses, ENROLLMENT, strict=True):
            students = [roster[i] for i in indexes]
            course.student.add(*students, demo_student)
            enrolled[course.id] = students
        return enrolled

    def _seed_activity(self, courses, enrolled, roster):
        """Regenerate the roster's attempts and progress so reruns stay identical."""
        lessons = Lesson.objects.filter(module__course__in=courses)
        quizzes = Quiz.objects.filter(course__in=courses)
        UserAttempt.objects.filter(student__in=roster, quiz__in=quizzes).delete()
        UserLessonProgress.objects.filter(student__in=roster, lesson__in=lessons).delete()

        # A stable per-student ability makes scores and progress look consistent
        ability = {student.id: self.rng.uniform(0.45, 0.95) for student in roster}

        for course in courses:
            course_lessons = list(
                Lesson.objects.filter(module__course=course).order_by("module__order", "id")
            )
            course_quizzes = list(
                Quiz.objects.filter(course=course).order_by("id").prefetch_related("questions__choices")
            )
            for student in enrolled[course.id]:
                # Students work through lessons in order
                completed = round(ability[student.id] * len(course_lessons))
                UserLessonProgress.objects.bulk_create(
                    UserLessonProgress(student=student, lesson=lesson) for lesson in course_lessons[:completed]
                )
                for quiz in course_quizzes:
                    if self.rng.random() < QUIZ_TAKE_RATE:
                        self._create_attempt(student, quiz, ability[student.id])

    def _create_attempt(self, student, quiz, ability):
        questions = list(quiz.questions.all())
        # Squaring skews submissions toward recent days, so the dashboard looks active
        days_ago = ACTIVITY_WINDOW_DAYS * self.rng.random() ** 2
        submitted_at = self.now - datetime.timedelta(days=days_ago, minutes=10)
        attempt = UserAttempt.objects.create(student=student, quiz=quiz, submitted_at=submitted_at)

        correct = 0
        for question in questions:
            choices = list(question.choices.all())
            right = [c for c in choices if c.is_correct]
            wrong = [c for c in choices if not c.is_correct]
            if right and (not wrong or self.rng.random() < ability):
                chosen = right
                correct += 1
            else:
                chosen = [self.rng.choice(wrong)]
            answer = UserAnswer.objects.create(attempt=attempt, question=question)
            answer.chosen_choices.add(*chosen)

        # Same formula as SubmitQuiz, so seeded scores match what grading would give
        attempt.score = Decimal(correct * 100 / len(questions)).quantize(Decimal("0.01")) if questions else Decimal(0)
        attempt.save(update_fields=["score"])

    # ── RAG index ─────────────────────────────────────────────────────────────

    def _index(self, courses):
        from rag.ingest import ingest_searchable_object

        objects = [
            *Lesson.objects.filter(module__course__in=courses).select_related("module"),
            *Quiz.objects.filter(course__in=courses),
            *Question.objects.filter(quiz__course__in=courses).select_related("quiz").prefetch_related("choices"),
        ]
        try:
            for obj in objects:
                ingest_searchable_object(obj)
        except Exception as exc:
            self.stdout.write(self.style.WARNING(
                f"RAG indexing failed ({exc}). The demo data is saved; run `manage.py ingest_all_data` to index it."
            ))
            return
        self.stdout.write(self.style.SUCCESS(f"Indexed {len(objects)} lessons, quizzes and questions for the AI tutor."))

    # ── Summary ───────────────────────────────────────────────────────────────

    def _print_summary(self, teacher, courses):
        quizzes = Quiz.objects.filter(course__in=courses)
        expected = quizzes.annotate(enrolled=Count("course__student", distinct=True)).aggregate(
            total=Sum("enrolled"))["total"] or 0
        taken = (
            UserAttempt.objects.filter(quiz__in=quizzes, score__isnull=False)
            .values("student", "quiz").distinct().count()
        )
        students = CustomUser.objects.filter(student_courses__in=courses).distinct().count()
        lessons = Lesson.objects.filter(module__course__in=courses).count()

        self.stdout.write(self.style.MIGRATE_HEADING("\n=== Scholaria demo ready ==="))
        self.stdout.write(f"Courses: {len(courses)}  Lessons: {lessons}  Quizzes: {quizzes.count()}  Students: {students}")
        if expected:
            self.stdout.write(f"Quiz engagement: {taken * 100 / expected:.1f}% ({taken}/{expected})")
        self.stdout.write(f"Teacher login: {teacher.username}")
        self.stdout.write(f"Student login: {DEMO_STUDENT[0]}")
        self.stdout.write("Password for newly created demo accounts: the DEMO_PASSWORD env var, "
                          f"or '{DEFAULT_DEMO_PASSWORD}' if unset.")
