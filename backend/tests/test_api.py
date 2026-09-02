import pytest
from fastapi.testclient import TestClient

from app.api.routes import repository
from app.main import app


client = TestClient(app)


@pytest.fixture(autouse=True)
def reset_repository() -> None:
    repository.reset()


def create_practice() -> dict[str, object]:
    response = client.post("/api/v1/practices", json={"templateId": "BG-01"})
    assert response.status_code == 201
    return response.json()


def create_submission(practice_id: str, attempt: int) -> dict[str, object]:
    response = client.post(
        f"/api/v1/practices/{practice_id}/submissions",
        json={"attempt": attempt, "imageClientRef": f"wxfile://attempt-{attempt}"},
    )
    assert response.status_code == 201
    return response.json()


def test_health() -> None:
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_create_and_get_bg01_practice() -> None:
    practice = create_practice()
    assert practice == {
        "id": practice["id"],
        "templateId": "BG-01",
        "skill": "background_control",
        "title": "背景做减法",
        "maxAttempts": 3,
        "attemptCount": 0,
        "status": "ready",
    }

    response = client.get(f"/api/v1/practices/{practice['id']}")
    assert response.status_code == 200
    assert response.json() == practice


def test_unsupported_template_returns_400() -> None:
    response = client.post("/api/v1/practices", json={"templateId": "OTHER"})
    assert response.status_code == 400
    assert response.json() == {"detail": "Unsupported practice template"}


def test_missing_practice_returns_404() -> None:
    response = client.get("/api/v1/practices/missing")
    assert response.status_code == 404


def test_attempt_one_returns_exactly_one_retry_issue_and_action() -> None:
    practice = create_practice()
    submission = create_submission(str(practice["id"]), 1)

    response = client.get(
        f"/api/v1/submissions/{submission['submissionId']}/result"
    )
    assert response.status_code == 200
    assert response.json() == {
        "state": "retry",
        "positiveObservation": "主体已经比较明确",
        "primaryIssue": {
            "type": "background_distraction",
            "description": "右后方的干扰物比较抢眼",
        },
        "action": {
            "type": "move_left",
            "instruction": "不要移动主体，向左移动一步，再拍一次。",
        },
    }


def test_attempt_two_returns_compare_summary() -> None:
    practice = create_practice()
    submission = create_submission(str(practice["id"]), 2)

    response = client.get(
        f"/api/v1/submissions/{submission['submissionId']}/result"
    )
    assert response.status_code == 200
    assert response.json() == {
        "state": "compare",
        "comparison": {"summary": "改变机位后，主体后方的干扰减少了。"},
    }


def test_missing_submission_result_returns_404() -> None:
    response = client.get("/api/v1/submissions/missing/result")
    assert response.status_code == 404


def test_complete_updates_practice() -> None:
    practice = create_practice()
    practice_id = str(practice["id"])

    response = client.post(f"/api/v1/practices/{practice_id}/complete")
    assert response.status_code == 200
    assert response.json() == {"practiceId": practice_id, "status": "completed"}

    stored = client.get(f"/api/v1/practices/{practice_id}")
    assert stored.json()["status"] == "completed"


@pytest.mark.parametrize(
    "payload",
    [
        {"attempt": 0, "imageClientRef": "wxfile://image"},
        {"attempt": 3, "imageClientRef": "wxfile://image"},
        {"attempt": 1, "imageClientRef": ""},
        {"attempt": 1, "imageClientRef": "   "},
    ],
)
def test_invalid_submission_returns_422(payload: dict[str, object]) -> None:
    practice = create_practice()
    response = client.post(
        f"/api/v1/practices/{practice['id']}/submissions",
        json=payload,
    )
    assert response.status_code == 422
