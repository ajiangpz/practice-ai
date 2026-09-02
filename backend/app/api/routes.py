from fastapi import APIRouter, HTTPException, status

from app.repositories import MemoryPracticeRepository, PracticeRecord
from app.schemas import (
    CoachResultResponse,
    PracticeCompleteResponse,
    PracticeCreateRequest,
    PracticeResponse,
    SubmissionCreateRequest,
    SubmissionResponse,
)
from app.services import get_mock_coach_result

router = APIRouter()
repository = MemoryPracticeRepository()


def _practice_response(practice: PracticeRecord) -> PracticeResponse:
    return PracticeResponse(
        id=practice.id,
        template_id=practice.template_id,
        skill=practice.skill,
        title=practice.title,
        max_attempts=practice.max_attempts,
        attempt_count=practice.attempt_count,
        status=practice.status,
    )


@router.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@router.post(
    "/api/v1/practices",
    response_model=PracticeResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_practice(request: PracticeCreateRequest) -> PracticeResponse:
    if request.template_id != "BG-01":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported practice template",
        )
    return _practice_response(repository.create_practice())


@router.get("/api/v1/practices/{practice_id}", response_model=PracticeResponse)
def get_practice(practice_id: str) -> PracticeResponse:
    practice = repository.get_practice(practice_id)
    if practice is None:
        raise HTTPException(status_code=404, detail="Practice not found")
    return _practice_response(practice)


@router.post(
    "/api/v1/practices/{practice_id}/submissions",
    response_model=SubmissionResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_submission(
    practice_id: str,
    request: SubmissionCreateRequest,
) -> SubmissionResponse:
    practice = repository.get_practice(practice_id)
    if practice is None:
        raise HTTPException(status_code=404, detail="Practice not found")
    if request.attempt > practice.max_attempts:
        raise HTTPException(status_code=400, detail="Attempt exceeds maxAttempts")

    submission = repository.save_submission(
        practice,
        request.attempt,
        request.image_client_ref,
    )
    return SubmissionResponse(
        submission_id=submission.id,
        practice_id=submission.practice_id,
        attempt=submission.attempt,
        status="completed",
    )


@router.get(
    "/api/v1/submissions/{submission_id}/result",
    response_model=CoachResultResponse,
    response_model_exclude_none=True,
)
def get_submission_result(submission_id: str) -> CoachResultResponse:
    submission = repository.get_submission(submission_id)
    if submission is None:
        raise HTTPException(status_code=404, detail="Submission not found")
    return get_mock_coach_result(submission)


@router.post(
    "/api/v1/practices/{practice_id}/complete",
    response_model=PracticeCompleteResponse,
)
def complete_practice(practice_id: str) -> PracticeCompleteResponse:
    practice = repository.get_practice(practice_id)
    if practice is None:
        raise HTTPException(status_code=404, detail="Practice not found")
    repository.complete_practice(practice)
    return PracticeCompleteResponse(practice_id=practice.id, status="completed")
