import datetime
import os
import random
import re
import unicodedata
from decimal import Decimal

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from django.db.models import Count, Sum
from django.db.models.signals import post_save
from django.utils import timezone

from courses.models import Course, Lesson, UserLessonProgress
from quizzes.models import Assignment, Choice, Question, Quiz, UserAnswer, UserAttempt
from users.models import CustomUser

# ── 20 Realistic Moroccan Students ───────────────────────────────────────────
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


def clean_name_for_username(name_str):
    """Normalizes string to lowercase ASCII alphanumeric."""
    normalized = unicodedata.normalize("NFKD", name_str.lower())
    ascii_only = normalized.encode("ASCII", "ignore").decode("utf-8")
    return re.sub(r"[^a-z0-9]", "", ascii_only)


class Command(BaseCommand):
    help = "Seed the database with realistic demo students, courses, quizzes, and attempts for the Teacher Dashboard."

    def add_arguments(self, parser):
        parser.add_argument(
            "--teacher",
            type=str,
            default="youssef_kaddioui",
            help="Username of the target teacher account (default: youssef_kaddioui).",
        )
        parser.add_argument(
            "--reset",
            action="store_true",
            help="Remove previously seeded demo students and their attempts before seeding.",
        )
        parser.add_argument(
            "--seed",
            type=int,
            default=42,
            help="Random seed for reproducible, deterministic generation.",
        )
        parser.add_argument(
            "--force",
            action="store_true",
            help="Allow execution even if settings.DEBUG is False.",
        )

    def handle(self, *args, **options):
        # 1. Environment Safety Check
        if not getattr(settings, "DEBUG", False) and not options.get("force"):
            raise CommandError(
                "Safety guard: seed_demo can only run when DEBUG=True. "
                "Pass --force if you intentionally wish to seed in this environment."
            )

        random.seed(options["seed"])
        teacher_username = options["teacher"]
        is_reset = options["reset"]
        demo_password = os.getenv("DEMO_PASSWORD", getattr(settings, "DEMO_PASSWORD", "ScholariaDemo2026!"))

        # Temporarily disconnect RAG ingestion signals to prevent Celery/Redis dependency during seed
        signals_to_restore = []
        try:
            from courses.signals import on_lesson_saved
            post_save.disconnect(on_lesson_saved, sender=Lesson)
            signals_to_restore.append((on_lesson_saved, Lesson))
        except (ImportError, Exception):  # noqa: S110
            pass

        try:
            from quizzes.signals import (
                on_assignment_saved,
                on_question_saved,
                on_quiz_saved,
            )
            post_save.disconnect(on_quiz_saved, sender=Quiz)
            post_save.disconnect(on_question_saved, sender=Question)
            post_save.disconnect(on_assignment_saved, sender=Assignment)
            signals_to_restore.extend([
                (on_quiz_saved, Quiz),
                (on_question_saved, Question),
                (on_assignment_saved, Assignment),
            ])
        except (ImportError, Exception):  # noqa: S110
            pass

        try:
            with transaction.atomic():
                self._run_seeding(teacher_username, is_reset, demo_password)
        finally:
            # Reconnect signals
            for receiver, sender_model in signals_to_restore:
                post_save.connect(receiver, sender=sender_model)

    def _run_seeding(self, teacher_username, is_reset, demo_password):
        self.stdout.write(self.style.MIGRATE_HEADING("=== Scholaria Demo Seeder ==="))

        # ── 1. Target Teacher Resolution ──────────────────────────────────────
        teacher = CustomUser.objects.filter(username=teacher_username).first()
        if not teacher:
            self.stdout.write(f"Creating teacher account '{teacher_username}'...")
            teacher = CustomUser.objects.create_user(
                username=teacher_username,
                password="yousef1234",
                email=f"{teacher_username}@scholaria.net",
                first_name="Youssef",
                last_name="Kaddioui",
                role="Teacher",
                birth_date=datetime.date(1990, 1, 1),
            )
        elif teacher.role != "Teacher":
            teacher.role = "Teacher"
            teacher.save(update_fields=["role"])

        self.stdout.write(
            self.style.SUCCESS(f"Teacher locked: {teacher.get_full_name()} ({teacher.username})")
        )

        # ── 2. Handle --reset ─────────────────────────────────────────────────
        if is_reset:
            demo_students = CustomUser.objects.filter(
                email__endswith="@scholaria.ai",
                role="Student",
                is_staff=False,
                is_superuser=False,
            )
            deleted_count = demo_students.count()
            demo_students.delete()
            self.stdout.write(
                self.style.WARNING(f"Reset: Removed {deleted_count} demo students (and cascaded attempts).")
            )

        # ── 3. Courses Resolution ─────────────────────────────────────────────
        teacher_courses = list(Course.objects.filter(teacher=teacher))
        if not teacher_courses:
            self.stdout.write("Teacher has no courses. Creating 2 realistic demo courses...")
            c1 = Course.objects.create(
                course_name="Algorithmique & Structures de Données",
                subject="Informatique",
                description="Concepts fondamentaux d'algorithmes, complexité et structures de données avancées.",
                teacher=teacher,
                is_published=True,
                published=True,
            )
            c2 = Course.objects.create(
                course_name="Développement Web & APIs",
                subject="Informatique",
                description="Architecture web moderne, développement d'APIs REST avec Django et bonnes pratiques.",
                teacher=teacher,
                is_published=True,
                published=True,
            )
            teacher_courses = [c1, c2]
        else:
            self.stdout.write(f"Using {len(teacher_courses)} existing courses for teacher.")

        # ── 4. Quizzes & Questions Resolution ─────────────────────────────────
        teacher_quizzes = list(Quiz.objects.filter(teacher=teacher))
        if len(teacher_quizzes) < 2:
            self.stdout.write("Teacher has fewer than 2 quizzes. Creating demo quizzes...")
            primary_course = teacher_courses[0]
            secondary_course = teacher_courses[1] if len(teacher_courses) > 1 else teacher_courses[0]

            q1_name = "Contrôle 1 : Algorithmes & Tris"
            q2_name = "Contrôle 1 : REST APIs & Architecture"

            due = timezone.now().date() + datetime.timedelta(days=30)

            quiz1, _ = Quiz.objects.get_or_create(
                name=q1_name,
                teacher=teacher,
                defaults={"course": primary_course, "due_date": due, "description": "Évaluation sur la complexité et les tris."},
            )
            quiz2, _ = Quiz.objects.get_or_create(
                name=q2_name,
                teacher=teacher,
                defaults={"course": secondary_course, "due_date": due, "description": "Évaluation sur les conventions REST et Django."},
            )

            # Ensure questions exist for quiz 1
            if quiz1.questions.count() == 0:
                self._seed_quiz_questions(
                    quiz1,
                    [
                        ("Quelle est la complexité temporelle moyenne du tri rapide (Quicksort) ?",
                         [("O(n log n)", True), ("O(n^2)", False), ("O(n)", False), ("O(log n)", False)]),
                        ("Quelle structure de données utilise le principe LIFO ?",
                         [("Pile (Stack)", True), ("File (Queue)", False), ("Arbre binaire", False), ("Table de hachage", False)]),
                        ("Dans le pire des cas, la recherche linéaire a une complexité de :",
                         [("O(n)", True), ("O(1)", False), ("O(log n)", False), ("O(n log n)", False)]),
                        ("Un arbre binaire de recherche équilibré garantit une recherche en :",
                         [("O(log n)", True), ("O(n)", False), ("O(1)", False), ("O(n^2)", False)]),
                    ]
                )

            # Ensure questions exist for quiz 2
            if quiz2.questions.count() == 0:
                self._seed_quiz_questions(
                    quiz2,
                    [
                        ("Quel code de statut HTTP indique une création réussie de ressource ?",
                         [("201 Created", True), ("200 OK", False), ("204 No Content", False), ("202 Accepted", False)]),
                        ("Quelle méthode HTTP doit être idempotente selon le standard REST ?",
                         [("PUT", True), ("POST", False), ("PATCH", False), ("CONNECT", False)]),
                        ("Dans Django REST Framework, quel composant transforme les QuerySets en JSON ?",
                         [("Serializer", True), ("ModelForm", False), ("View", False), ("Router", False)]),
                        ("Quel en-tête HTTP est standard pour l'authentification par Token JWT ?",
                         [("Authorization: Bearer <token>", True), ("Auth-Token: <token>", False), ("Token: <token>", False), ("X-Auth: <token>", False)]),
                    ]
                )

            teacher_quizzes = list(Quiz.objects.filter(teacher=teacher))

        self.stdout.write(f"Using {len(teacher_quizzes)} quizzes for attempt seeding.")

        # ── 5. Seed Students with Credentials ─────────────────────────────────
        created_students = []
        for first_name, last_name, b_date in STUDENT_ROSTER:
            f_clean = clean_name_for_username(first_name)
            l_clean = clean_name_for_username(last_name)
            base_username = f"{f_clean}.{l_clean}"

            # Ensure username fits 150-char constraint and resolves collisions deterministically
            candidate = base_username
            suffix = 2
            while CustomUser.objects.filter(username=candidate).exclude(email=f"{candidate}@scholaria.ai").exists():
                candidate = f"{base_username}{suffix}"
                suffix += 1

            email = f"{candidate}@scholaria.ai"

            student, was_created = CustomUser.objects.get_or_create(
                username=candidate,
                defaults={
                    "first_name": first_name,
                    "last_name": last_name,
                    "email": email,
                    "role": "Student",
                    "birth_date": b_date,
                },
            )
            if was_created:
                student.set_password(demo_password)
                student.save()
            created_students.append(student)

        self.stdout.write(self.style.SUCCESS(f"Seeded {len(created_students)} demo students."))

        # ── 6. Enrollment Coverage ────────────────────────────────────────────
        # Varied distribution across courses:
        # e.g. 14 students in Course 0, 7 students in Course 1 (2 overlapping, 1 unenrolled)
        c0 = teacher_courses[0]
        c1 = teacher_courses[1] if len(teacher_courses) > 1 else teacher_courses[0]

        for s in created_students[:14]:
            c0.student.add(s)

        if c1 != c0:
            for s in created_students[12:19]:
                c1.student.add(s)

        total_enrolled = (
            CustomUser.objects
            .filter(student_courses__teacher=teacher)
            .distinct()
            .count()
        )
        self.stdout.write(f"Total enrolled students across teacher courses: {total_enrolled}")

        # ── 7. Generate 50 Quiz Attempts ──────────────────────────────────────
        # Target Distribution:
        # 20% at 90-100% (10 attempts)
        # 40% at 70-89%  (20 attempts)
        # 25% at 50-69%  (13 attempts)
        # 15% < 50%      (7 attempts)
        score_pools = (
            [round(random.uniform(90.0, 100.0), 1) for _ in range(10)]
            + [round(random.uniform(70.0, 89.0), 1) for _ in range(20)]
            + [round(random.uniform(50.0, 69.0), 1) for _ in range(13)]
            + [round(random.uniform(20.0, 48.0), 1) for _ in range(7)]
        )
        random.shuffle(score_pools)

        now = timezone.now()

        # The Top 5 latest attempts: 5 distinct students, alternating quizzes, last 48 hours
        top5_students = created_students[:5]
        top5_offsets_hours = [1.5, 5.0, 14.0, 23.0, 36.0]
        top5_attempts_meta = []

        for idx, s in enumerate(top5_students):
            q = teacher_quizzes[idx % len(teacher_quizzes)]
            submitted_time = now - datetime.timedelta(hours=top5_offsets_hours[idx])
            score_val = score_pools.pop()
            top5_attempts_meta.append((s, q, score_val, submitted_time))

        # Remaining 45 attempts: spread across days 2 to 29
        remaining_attempts_meta = []
        enrolled_students = created_students[:18]  # leave a couple students with 0 attempts

        for _ in range(45):
            s = random.choice(enrolled_students)
            q = random.choice(teacher_quizzes)
            days_ago = random.uniform(2.0, 29.0)
            submitted_time = now - datetime.timedelta(days=days_ago)
            score_val = score_pools.pop()
            remaining_attempts_meta.append((s, q, score_val, submitted_time))

        all_attempts_meta = top5_attempts_meta + remaining_attempts_meta
        # Sort so we create cleanly
        all_attempts_meta.sort(key=lambda item: item[3], reverse=True)

        attempts_created_count = 0
        for student, quiz, score_val, sub_time in all_attempts_meta:
            # Idempotency check: don't create identical attempt at the exact same second
            attempt, created = UserAttempt.objects.get_or_create(
                student=student,
                quiz=quiz,
                submitted_at=sub_time,
                defaults={"score": Decimal(str(score_val))},
            )
            if created:
                attempts_created_count += 1
                self._seed_user_answers(attempt, quiz, score_val)

        self.stdout.write(self.style.SUCCESS(f"Created {attempts_created_count} quiz attempts with answers."))

        # ── 8. Seed Lesson Progress if Teacher has Lessons ────────────────────
        teacher_lessons = list(Lesson.objects.filter(module__course__in=teacher_courses))
        if teacher_lessons:
            # Seed proportional progress to align course_engagement with ~60%
            progress_count = 0
            for lesson in teacher_lessons:
                course_students = list(lesson.module.course.student.all())
                target_completions = int(len(course_students) * 0.60)
                for s in course_students[:target_completions]:
                    _, p_created = UserLessonProgress.objects.get_or_create(student=s, lesson=lesson)
                    if p_created:
                        progress_count += 1
            self.stdout.write(f"Seeded {progress_count} UserLessonProgress records for {len(teacher_lessons)} lessons.")

        # ── 9. Final Dashboard Metric Verification ────────────────────────────
        total_courses_count = Course.objects.filter(teacher=teacher).count()
        total_students_count = CustomUser.objects.filter(student_courses__teacher=teacher).distinct().count()

        # Engagement recalculation
        total_expected_attempts = (
            Quiz.objects.filter(teacher=teacher)
            .annotate(enrolled=Count("course__student", distinct=True))
            .aggregate(total=Sum("enrolled"))
        )["total"] or 0

        actual_completed = (
            UserAttempt.objects
            .filter(quiz__teacher=teacher, score__isnull=False)
            .values("student", "quiz")
            .distinct()
            .count()
        )
        quiz_eng = (actual_completed / total_expected_attempts * 100) if total_expected_attempts > 0 else 0

        recent_5 = (
            UserAttempt.objects
            .filter(quiz__teacher=teacher, score__isnull=False)
            .select_related("student", "quiz")
            .order_by("-submitted_at")[:5]
        )

        self.stdout.write(self.style.MIGRATE_HEADING("\n=== Teacher Dashboard Preview ==="))
        self.stdout.write(f"Teacher          : {teacher.get_full_name()} (@{teacher.username})")
        self.stdout.write(f"Total Courses    : {total_courses_count}")
        self.stdout.write(f"Total Students   : {total_students_count}")
        self.stdout.write(f"Quiz Engagement  : {quiz_eng:.1f}% ({actual_completed}/{total_expected_attempts} completed)")

        self.stdout.write(self.style.MIGRATE_LABEL("\nRecent 5 Submissions:"))
        for idx, att in enumerate(recent_5, 1):
            self.stdout.write(
                f" {idx}. {att.student.get_full_name():<22} | {att.quiz.name:<32} | {att.score}% | {att.submitted_at.strftime('%Y-%m-%d %H:%M')}"
            )

        self.stdout.write(
            self.style.SUCCESS("\n✓ Demo data successfully seeded for Scholaria Teacher Dashboard!")
        )

    def _seed_quiz_questions(self, quiz, questions_data):
        for q_text, choices_data in questions_data:
            question = Question.objects.create(quiz=quiz, question_text=q_text)
            for c_text, is_corr in choices_data:
                Choice.objects.create(question=question, choice=c_text, is_correct=is_corr)

    def _seed_user_answers(self, attempt, quiz, score_val):
        questions = list(quiz.questions.all().prefetch_related("choices"))
        if not questions:
            return

        total_q = len(questions)
        # Determine how many questions should be answered correctly based on score
        target_correct = round(float(score_val) / 100.0 * total_q)

        for idx, question in enumerate(questions):
            choices = list(question.choices.all())
            if not choices:
                continue

            correct_choices = [c for c in choices if c.is_correct]
            incorrect_choices = [c for c in choices if not c.is_correct]

            if idx < target_correct and correct_choices:
                selected_choice = correct_choices[0]
            elif incorrect_choices:
                selected_choice = random.choice(incorrect_choices)
            else:
                selected_choice = choices[0]

            ua = UserAnswer.objects.create(
                attempt=attempt,
                question=question,
            )
            ua.chosen_choices.add(selected_choice)
