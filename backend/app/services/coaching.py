from app.repositories import SubmissionRecord
from app.schemas.practice import (
    CoachResultResponse,
    CoachingAction,
    ComparisonSummary,
    CriterionIssue,
)


def get_mock_coach_result(submission: SubmissionRecord) -> CoachResultResponse:
    if submission.attempt == 1:
        return CoachResultResponse(
            state="retry",
            positive_observation="主体已经比较明确",
            primary_issue=CriterionIssue(
                type="background_distraction",
                description="右后方的干扰物比较抢眼",
            ),
            action=CoachingAction(
                type="move_left",
                instruction="不要移动主体，向左移动一步，再拍一次。",
            ),
        )

    return CoachResultResponse(
        state="compare",
        comparison=ComparisonSummary(
            summary="改变机位后，主体后方的干扰减少了。"
        ),
    )
