from rest_framework.throttling import UserRateThrottle


class LLMRateThrottle(UserRateThrottle):
    scope = "llm"

