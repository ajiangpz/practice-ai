from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator
from pydantic.alias_generators import to_camel


class ApiModel(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        serialize_by_alias=True,
    )


class PracticeCreateRequest(ApiModel):
    template_id: str = Field(min_length=1)


class PracticeResponse(ApiModel):
    id: str
    template_id: Literal["BG-01"]
    skill: Literal["background_control"]
    title: Literal["背景做减法"]
    max_attempts: Literal[3]
    attempt_count: int = Field(ge=0)
    status: Literal[
        "ready",
        "in_progress",
        "analyzing",
        "retry",
        "passed",
        "needs_practice",
        "completed",
    ]


class SubmissionCreateRequest(ApiModel):
    attempt: Literal[1, 2]
    image_client_ref: str = Field(min_length=1)

    @field_validator("image_client_ref")
    @classmethod
    def image_reference_must_not_be_blank(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("imageClientRef must not be blank")
        return value


class SubmissionResponse(ApiModel):
    submission_id: str
    practice_id: str
    attempt: Literal[1, 2]
    status: Literal["completed"]


class CriterionIssue(ApiModel):
    type: Literal["background_distraction"]
    description: str


class CoachingAction(ApiModel):
    type: Literal["move_left"]
    instruction: str


class ComparisonSummary(ApiModel):
    summary: str


class CoachResultResponse(ApiModel):
    state: Literal["retry", "compare"]
    positive_observation: str | None = None
    primary_issue: CriterionIssue | None = None
    action: CoachingAction | None = None
    comparison: ComparisonSummary | None = None


class PracticeCompleteResponse(ApiModel):
    practice_id: str
    status: Literal["completed"]
