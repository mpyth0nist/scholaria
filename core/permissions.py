"""
core/permissions.py — Single source of truth for all DRF permission classes.

Import from here in every app instead of defining local copies:
    from core.permissions import IsTeacher, IsAdmin, IsTeacherOrAdmin
"""

from rest_framework.permissions import SAFE_METHODS, BasePermission


class IsTeacher(BasePermission):
    """Allows access only to authenticated users with role == 'Teacher'."""

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.is_teacher
        )


class IsStudent(BasePermission):
    """Allows access only to authenticated users with role == 'Student'."""

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.is_student
        )


class IsAdmin(BasePermission):
    """Allows access only to authenticated users with role == 'ADMIN'."""

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.is_admin
        )


class IsTeacherOrAdmin(BasePermission):
    """Allows access to Teachers and Admins; blocks Students and unauthenticated."""

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role in ('Teacher', 'ADMIN')
        )


class IsCourseTeacher(BasePermission):
    """
    Object-level permission: allows write access only to the teacher who owns
    the course. Read access (SAFE_METHODS) is granted to all authenticated users.

    The view's queryset must expose a `teacher` attribute on the object.
    """

    lookup_field = ['teacher']

    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        teacher = obj
        for attr in self.lookup_field:
            teacher = getattr(teacher, attr, None)
        return teacher == request.user
