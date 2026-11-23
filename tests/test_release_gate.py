"""Regresión del control de publicación sin acceder a GitHub ni integrar cambios."""
import contextlib
import io
import json
import os
from pathlib import Path
import runpy
import unittest
from unittest.mock import patch
from urllib.parse import urlparse

GATE = Path(__file__).resolve().parents[1] / ".github/scripts/verify-release.py"
QUALITY = ".github/workflows/offgrid-quality.yml"
BROWSER = ".github/workflows/offgrid-e2e.yml"
EXPECTED = QUALITY + "," + BROWSER


def accepted_pr():
    return {
        "number": 5,
        "merged_at": "2026-11-23T18:00:00Z",
        "base": {"ref": "main"},
        "merge_commit_sha": "merged-sha",
        "head": {"sha": "tested-head-sha"},
    }


def passing_run(path, run_id, date="2026-11-23T18:00:00Z"):
    return {
        "id": run_id,
        "path": path,
        "head_sha": "tested-head-sha",
        "event": "pull_request",
        "status": "completed",
        "conclusion": "success",
        "updated_at": date,
        "run_attempt": 1,
    }


class VerifyReleaseGateTest(unittest.TestCase):
    def run_gate(self, prs=None, runs=None, ref="refs/heads/main", expected=EXPECTED, fail_api=False):
        if prs is None:
            prs = [accepted_pr()]
        if runs is None:
            runs = [passing_run(QUALITY, 101), passing_run(BROWSER, 102)]
        urls = []

        def fake_urlopen(request, timeout=20):
            urls.append(request.full_url)
            if fail_api:
                from urllib.error import URLError
                raise URLError("simulated GitHub outage")
            path = urlparse(request.full_url).path
            if "/commits/" in path and path.endswith("/pulls"):
                value = prs
            elif path.endswith("/actions/runs"):
                value = {"workflow_runs": runs}
            else:
                raise AssertionError("Unexpected GitHub API request: " + path)
            return io.BytesIO(json.dumps(value).encode("utf-8"))

        env = {
            "GH_TOKEN": "fake-for-unit-test",
            "GITHUB_REPOSITORY": "PiolAngel/offgrid-store",
            "GITHUB_SHA": "merged-sha",
            "GITHUB_REF": ref,
            "EXPECTED_WORKFLOWS": expected,
        }
        output, errors = io.StringIO(), io.StringIO()
        with patch.dict(os.environ, env), patch("urllib.request.urlopen", side_effect=fake_urlopen):
            with contextlib.redirect_stdout(output), contextlib.redirect_stderr(errors):
                try:
                    runpy.run_path(str(GATE), run_name="__main__")
                    exit_code = 0
                except SystemExit as error:
                    exit_code = error.code if isinstance(error.code, int) else 1
        return exit_code, output.getvalue(), errors.getvalue(), urls

    def test_all_required_checks_pass_and_match_tested_head(self):
        code, output, errors, urls = self.run_gate()
        self.assertEqual(code, 0, errors)
        self.assertIn("RELEASE APPROVED: PR #5", output)
        self.assertEqual(len(urls), 2)
        self.assertIn("head_sha=tested-head-sha", urls[1])

    def test_rejects_direct_push_without_merged_pr(self):
        code, _, err, _ = self.run_gate(prs=[])
        self.assertNotEqual(code, 0)
        self.assertIn("not the merge result", err)

    def test_rejects_foreign_merge_or_other_branch(self):
        bad = accepted_pr()
        bad["merge_commit_sha"] = "another-commit"
        self.assertNotEqual(self.run_gate(prs=[bad])[0], 0)
        self.assertNotEqual(self.run_gate(ref="refs/heads/feature")[0], 0)

    def test_rejects_no_required_workflows(self):
        self.assertNotEqual(self.run_gate(expected="")[0], 0)

    def test_rejects_missing_browser_check(self):
        code, _, err, _ = self.run_gate(runs=[passing_run(QUALITY, 101)])
        self.assertNotEqual(code, 0)
        self.assertIn(BROWSER, err)

    def test_rejects_newest_failed_run_even_if_old_run_passed(self):
        failed = passing_run(QUALITY, 303, "2026-11-23T18:10:00Z")
        failed["conclusion"] = "failure"
        code, _, err, _ = self.run_gate(
            runs=[passing_run(QUALITY, 101), passing_run(BROWSER, 102), failed]
        )
        self.assertNotEqual(code, 0)
        self.assertIn("failure", err)

    def test_rejects_incomplete_workflow(self):
        waiting = passing_run(BROWSER, 102)
        waiting["status"] = "in_progress"
        waiting["conclusion"] = None
        self.assertNotEqual(self.run_gate(runs=[passing_run(QUALITY, 101), waiting])[0], 0)

    def test_rejects_checks_from_different_head_commit(self):
        foreign = passing_run(BROWSER, 102)
        foreign["head_sha"] = "unreviewed-head"
        self.assertNotEqual(self.run_gate(runs=[passing_run(QUALITY, 101), foreign])[0], 0)

    def test_rejects_unavailable_github_api(self):
        code, _, err, _ = self.run_gate(fail_api=True)
        self.assertNotEqual(code, 0)
        self.assertIn("GitHub API could not be verified", err)


if __name__ == "__main__":
    unittest.main()
