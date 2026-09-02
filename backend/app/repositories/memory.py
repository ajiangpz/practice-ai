from dataclasses import dataclass
from typing import Literal
from uuid import uuid4


PracticeStatus = Literal[
    "ready",
    "in_progress",
    "analyzing",
    "retry",
    "passed",
    "needs_practice",
    "completed",
]


@dataclass
class PracticeRecord:
    id: str
    template_id: Literal["BG-01"] = "BG-01"
    skill: Literal["background_control"] = "background_control"
    title: Literal["背景做减法"] = "背景做减法"
    max_attempts: Literal[3] = 3
    attempt_count: int = 0
    status: PracticeStatus = "ready"


@dataclass
class SubmissionRecord:
    id: str
    practice_id: str
    attempt: Literal[1, 2]
    image_client_ref: str


class MemoryPracticeRepository:
    def __init__(self) -> None:
        self._practices: dict[str, PracticeRecord] = {}
        self._submissions: dict[str, SubmissionRecord] = {}

    def create_practice(self) -> PracticeRecord:
        practice = PracticeRecord(id=f"practice_{uuid4().hex}")
        self._practices[practice.id] = practice
        return practice

    def get_practice(self, practice_id: str) -> PracticeRecord | None:
        return self._practices.get(practice_id)

    def save_submission(
        self,
        practice: PracticeRecord,
        attempt: Literal[1, 2],
        image_client_ref: str,
    ) -> SubmissionRecord:
        submission = SubmissionRecord(
            id=f"submission_{uuid4().hex}",
            practice_id=practice.id,
            attempt=attempt,
            image_client_ref=image_client_ref,
        )
        self._submissions[submission.id] = submission
        practice.attempt_count = max(practice.attempt_count, attempt)
        practice.status = "analyzing"
        return submission

    def get_submission(self, submission_id: str) -> SubmissionRecord | None:
        return self._submissions.get(submission_id)

    def complete_practice(self, practice: PracticeRecord) -> PracticeRecord:
        practice.status = "completed"
        return practice

    def reset(self) -> None:
        self._practices.clear()
        self._submissions.clear()
