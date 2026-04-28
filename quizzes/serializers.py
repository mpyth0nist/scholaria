from .models import *

from rest_framework import serializers

class UserChoiceSerializer(serializers.ModelSerializer):
    class Meta:

        model = Choice
        fields = ['id','choice']

class UserQuestionSerializer(serializers.ModelSerializer):
    choices = UserChoiceSerializer(many=True)
    quiz = serializers.PrimaryKeyRelatedField(read_only=True)
    class Meta:
        model = Question
        fields = ['id', 'question_text', 'choices', 'quiz']

class UserQuizSerializer(serializers.ModelSerializer):
    questions = UserQuestionSerializer(many=True)
    class Meta:
        model = Quiz
        fields = ['id', 'name', 'description', 'course', 'questions']

class ChoiceSerializer(serializers.ModelSerializer):

    class Meta:

        model = Choice
        fields = ['id','choice', 'is_correct']

class QuestionSerializer(serializers.ModelSerializer):
    choices = ChoiceSerializer(many=True)
    quiz = serializers.PrimaryKeyRelatedField(read_only=True)


    class Meta:
        model = Question
        fields = ['id','question_text', 'choices', 'quiz']

    def _validate_single_correct(self, choices_data):
        """Raise ValidationError unless exactly one choice is marked is_correct."""
        correct = [c for c in choices_data if c.get('is_correct', False)]
        if len(correct) == 0:
            raise serializers.ValidationError(
                {'choices': 'Each question must have exactly one correct answer.'}
            )
        if len(correct) > 1:
            raise serializers.ValidationError(
                {'choices': 'Each question can only have one correct answer.'}
            )

    def create(self, validated_data, quiz=None):
        choices_data = validated_data.pop('choices')

        if len(choices_data) < 2:
            raise serializers.ValidationError('A question must have at least 2 choices.')

        self._validate_single_correct(choices_data)

        question = Question.objects.create(**validated_data)

        for choice in choices_data:
            Choice.objects.create(question=question, **choice)

        return question

    def update(self, instance, validated_data):
        choices_data = validated_data.pop('choices')

        self._validate_single_correct(choices_data)

        instance.question_text = validated_data.get("question_text", instance.question_text)

        # ── Diff-based choice sync ────────────────────────────────────
        incoming_ids = {c['id'] for c in choices_data if 'id' in c}
        # Delete choices no longer present
        instance.choices.exclude(id__in=incoming_ids).delete()

        for choice_data in choices_data:
            choice_id = choice_data.get('id')
            if choice_id:
                # Update existing choice
                Choice.objects.filter(id=choice_id, question=instance).update(
                    choice=choice_data.get('choice', ''),
                    is_correct=choice_data.get('is_correct', False),
                )
            else:
                # New choice (no id supplied)
                Choice.objects.create(question=instance, **{k: v for k, v in choice_data.items() if k != 'id'})

        instance.save()
        return instance

    

class QuizSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True)
    my_score = serializers.SerializerMethodField()

    class Meta:
        model = Quiz
        fields = ['id', 'name', 'description', 'course', 'due_date', 'questions', 'my_score']

    def get_my_score(self, obj):
        """Return the requesting student's score for this quiz, or None if not yet taken."""
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return None
        if getattr(request.user, 'role', None) == 'Teacher':
            return None
        attempt = (
            UserAttempt.objects
            .filter(quiz=obj, student=request.user, score__isnull=False)
            .order_by('-id')
            .first()
        )
        return float(attempt.score) if attempt else None

    def create(self, validated_data):
        questions_data = validated_data.pop('questions')
        quiz = Quiz.objects.create(**validated_data)

        for question_data in questions_data:
            question_serializer = QuestionSerializer(data=question_data)
            question_serializer.is_valid(raise_exception=True)
            question_serializer.save(quiz=quiz)

        return quiz

    def update(self, instance, validated_data):
        questions_data = validated_data.pop('questions')
        instance.name = validated_data.get('name', instance.name)
        instance.description = validated_data.get('description', instance.description)
        instance.course = validated_data.get('course', instance.course)
        instance.due_date = validated_data.get('due_date', instance.due_date)

        instance.questions.all().delete()
        for question_data in questions_data:
            question_serializer = QuestionSerializer(data=question_data)
            question_serializer.is_valid(raise_exception=True)
            question_serializer.save(quiz=instance)

        instance.save()

        return instance


class UserAnswerSerializer(serializers.ModelSerializer):
    chosen_choices = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Choice.objects.all()
    )

    class Meta:
        model = UserAnswer
        fields = ['id', 'attempt', 'question', 'chosen_choices', 'question_snapshot']
        read_only_fields = ['attempt', 'question', 'question_snapshot']


class UserAttemptSerializer(serializers.ModelSerializer):
    answers = UserAnswerSerializer(many=True, read_only=True, source='attempt_answers')

    class Meta:
        model = UserAttempt
        fields = ['id', 'quiz', 'student', 'score', 'answers']
        read_only_fields = ['student', 'score', 'quiz']