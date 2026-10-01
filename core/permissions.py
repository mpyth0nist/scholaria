"""
Centralised DRF permission classes for the Scholaria project.

Import from here instead of defining permission classes in individual app
views files. This eliminates duplication (isAdmin was defined in both
courses/views.py and users/views.py; isTeacher was imported between apps)
and provides a single place to update role logic.

Usage example:
    from core.permissions import IsTeacher, IsAdmin, IsTeacherOrAdmin, IsCourseTeacher

Role values stored in CustomUser.role:
    'Teacher'  — content creators
    'Student'  — learners
    'ADMIN'    — platform administrators
"""

from rest_framework.permissions import SAFE_METHODS, BasePermission

def _get_nested_attrs(obj, attrs):
    """Traverse nested attributes/relations given a list of field names."""
    result = obj
    for attr in attrs:
        if result is None:
            return None
        result = getattr(result, attr, None)
    return result

class IsTeacher(BasePermission):
    """Grants access only to authenticated users with the Teacher role."""
    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == 'Teacher'
        )

class IsStudent(BasePermission):
    """Grants access only to authenticated users with the Student role."""
    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == 'Student'
        )

class IsAdmin(BasePermission):
    """Grants access only to authenticated users with the ADMIN role."""
    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == 'ADMIN'
        )

class IsTeacherOrAdmin(BasePermission):
    """Grants access to Teacher or ADMIN users."""
    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role in ('Teacher', 'ADMIN')
        )

class IsCourseTeacher(BasePermission):
    """
    Object-level permission: write operations require the requesting user
    to be the teacher who owns the course.
    Safe (read) methods are always permitted for authenticated users.
    """
    lookup_field = ['teacher']

    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        course_teacher = _get_nested_attrs(obj, self.lookup_field)
        if request.method in SAFE_METHODS:
            return True
        return course_teacher == request.user

class IsCourseStudent(BasePermission):
    """Object-level permission: the requesting user must be enrolled in the course."""
    lookup_field = ['student']

    def has_object_permission(self, request, view, obj):
        course_students = _get_nested_attrs(obj, self.lookup_field)
        return request.user in course_students
