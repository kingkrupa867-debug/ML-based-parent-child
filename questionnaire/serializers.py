from rest_framework import serializers
from .models import QuestionnaireResponse, PredictionResult, Recommendation


LIKERT_RANGE = range(1, 6)


def validate_likert(value):
    if value not in LIKERT_RANGE:
        raise serializers.ValidationError("Answer must be between 1 and 5.")
    return value


class QuestionnaireResponseSerializer(serializers.ModelSerializer):
    # Demographic fields
    parent_age = serializers.IntegerField(min_value=18, max_value=100)
    child_age = serializers.IntegerField(min_value=1, max_value=30)
    family_type = serializers.ChoiceField(
        choices=['Joint', 'Single-Parent', 'Extended', 'Nuclear']
    )

    # Parent questionnaire (Likert 1-5)
    pq1 = serializers.IntegerField(required=False, validators=[validate_likert])
    pq2 = serializers.IntegerField(required=False, validators=[validate_likert])
    pq3 = serializers.IntegerField(required=False, validators=[validate_likert])
    pq4 = serializers.IntegerField(required=False, validators=[validate_likert])
    pq5 = serializers.IntegerField(required=False, validators=[validate_likert])
    pq6 = serializers.IntegerField(required=False, validators=[validate_likert])
    pq7 = serializers.IntegerField(required=False, validators=[validate_likert])
    pq8 = serializers.IntegerField(required=False, validators=[validate_likert])
    pq9 = serializers.IntegerField(required=False, validators=[validate_likert])
    pq10 = serializers.IntegerField(required=False, validators=[validate_likert])

    # Child questionnaire (Likert 1-5)
    cq1 = serializers.IntegerField(required=False, validators=[validate_likert])
    cq2 = serializers.IntegerField(required=False, validators=[validate_likert])
    cq3 = serializers.IntegerField(required=False, validators=[validate_likert])
    cq4 = serializers.IntegerField(required=False, validators=[validate_likert])
    cq5 = serializers.IntegerField(required=False, validators=[validate_likert])
    cq6 = serializers.IntegerField(required=False, validators=[validate_likert])
    cq7 = serializers.IntegerField(required=False, validators=[validate_likert])
    cq8 = serializers.IntegerField(required=False, validators=[validate_likert])
    cq9 = serializers.IntegerField(required=False, validators=[validate_likert])
    cq10 = serializers.IntegerField(required=False, validators=[validate_likert])

    class Meta:
        model = QuestionnaireResponse
        fields = ['id', 'parent_age', 'child_age', 'family_type',
                  'pq1', 'pq2', 'pq3', 'pq4', 'pq5',
                  'pq6', 'pq7', 'pq8', 'pq9', 'pq10',
                  'cq1', 'cq2', 'cq3', 'cq4', 'cq5',
                  'cq6', 'cq7', 'cq8', 'cq9', 'cq10',
                  'submitted_at']
        read_only_fields = ['id', 'submitted_at']

    def validate(self, attrs):
        parent_keys = [f'pq{i}' for i in range(1, 11)]
        child_keys = [f'cq{i}' for i in range(1, 11)]

        has_parent_answers = all(key in attrs for key in parent_keys)
        has_child_answers = all(key in attrs for key in child_keys)

        if not has_parent_answers and not has_child_answers:
            raise serializers.ValidationError(
                "Please answer all questionnaire items before submitting."
            )

        # Child-only submissions are normalized into pq1..pq10 so the existing
        # ML pipeline and result logic can score them consistently.
        if not has_parent_answers and has_child_answers:
            for index in range(1, 11):
                attrs[f'pq{index}'] = attrs[f'cq{index}']
                attrs[f'cq{index}'] = None

        return attrs


class RecommendationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Recommendation
        fields = ['id', 'text']


class PredictionResultSerializer(serializers.ModelSerializer):
    recommendations = RecommendationSerializer(many=True, read_only=True)
    submitted_at = serializers.DateTimeField(source='response.submitted_at', read_only=True)
    result_id = serializers.IntegerField(source='id', read_only=True)
    username = serializers.CharField(source='response.user.username', read_only=True)
    role = serializers.CharField(source='response.user.role', read_only=True)
    parent_age = serializers.IntegerField(source='response.parent_age', read_only=True)
    child_age = serializers.IntegerField(source='response.child_age', read_only=True)
    family_type = serializers.CharField(source='response.family_type', read_only=True)

    class Meta:
        model = PredictionResult
        fields = [
            'id', 'result_id', 'score', 'category', 'predicted_at', 'submitted_at',
            'username', 'role', 'parent_age', 'child_age', 'family_type', 'recommendations'
        ]
