#!/usr/bin/env python3
import argparse
import json
import os
import sys
import urllib.error
import urllib.request


def _extract_suffix(value: str, prefix: str) -> int | None:
    suffix = value[len(prefix) :]
    if suffix.isdigit():
        return int(suffix)
    return None


def _next_tag(repository: str, tag_prefix: str) -> str:
    page_size = 100
    url = (
        f"https://hub.docker.com/v2/repositories/{repository}/tags"
        f"?page_size={page_size}&ordering=last_updated"
    )
    matching_suffixes: list[int] = []

    try:
        while url:
            request = urllib.request.Request(
                url,
                headers={
                    "User-Agent": "curl/7.90.0",
                    "Accept": "application/json",
                },
            )
            with urllib.request.urlopen(request, timeout=30) as response:
                payload = json.load(response)

            for item in payload.get("results", []):
                name = item.get("name")
                if not isinstance(name, str):
                    continue
                if not name.startswith(tag_prefix):
                    continue

                suffix = _extract_suffix(name, tag_prefix)
                if suffix is not None:
                    matching_suffixes.append(suffix)

            url = payload.get("next")
    except urllib.error.HTTPError as exc:
        raise RuntimeError(f"Failed to fetch tags for {repository}: {exc}") from exc
    except urllib.error.URLError as exc:
        raise RuntimeError(
            f"Network error fetching tags for {repository}: {exc}"
        ) from exc
    except json.JSONDecodeError as exc:
        raise RuntimeError("Invalid JSON received from Docker Hub") from exc

    if not matching_suffixes:
        return f"{tag_prefix}0"

    return f"{tag_prefix}{max(matching_suffixes) + 1}"


def cmd_next_tag(_args: argparse.Namespace) -> None:
    repository = os.environ.get("DOCKER_IMAGE_NAME")
    if not repository:
        raise RuntimeError("Environment variable DOCKER_IMAGE_NAME is required")

    tag_prefix = os.environ.get("TAG_PREFIX", "")
    tag = _next_tag(repository, tag_prefix)
    print(tag)


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Docker helper utilities")
    subparsers = parser.add_subparsers(dest="command", required=True)

    next_tag_parser = subparsers.add_parser(
        "next-tag", help="determine the next Docker image tag"
    )
    next_tag_parser.set_defaults(func=cmd_next_tag)

    return parser


def main(argv: list[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)
    try:
        args.func(args)
    except Exception as exc:  # pylint: disable=broad-except
        sys.stderr.write(f"{exc}\n")
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
