#!/usr/bin/env bash
set -euo pipefail

# S3-staged SSM runner:
# - Uploads the remote script to S3 (from the runner)
# - EC2 downloads it via aws s3 cp
# - Runs it with a small env file
#
# Required env:
#   AWS_REGION
#   S3_BUCKET
#
# Optional:
#   SSM_TAG_HOST (default prod-shared)
#   SSM_TAG_ENV (default prod)
#   SSM_TARGETS_OVERRIDE (e.g. 'Key=InstanceIds,Values=i-0123abcd')
#   SSM_POLL_DELAY_SECONDS (default 2)
#   SSM_POLL_MAX_ATTEMPTS  (default 180)

_ssm_default_targets() {
  local host="${SSM_TAG_HOST:-prod-shared}"
  local env="${SSM_TAG_ENV:-prod}"
  echo "Key=tag:Host,Values=${host}" "Key=tag:Env,Values=${env}"
}

_ssm_poll_delay() { echo "${SSM_POLL_DELAY_SECONDS:-2}"; }
_ssm_poll_max()   { echo "${SSM_POLL_MAX_ATTEMPTS:-180}"; }

_ssm_upload_script_to_s3() {
  local local_path="$1"
  local key="$2"

  aws s3 cp "$local_path" "s3://${S3_BUCKET}/${key}" --region "${AWS_REGION}" >/dev/null
}

_ssm_send_command() {
  local comment="$1"
  local remote_script_path="$2"

  if [[ -z "${AWS_REGION:-}" ]]; then echo "AWS_REGION is required" >&2; return 2; fi
  if [[ -z "${S3_BUCKET:-}" ]]; then echo "S3_BUCKET is required" >&2; return 2; fi
  if [[ ! -f "$remote_script_path" ]]; then echo "Remote script not found: $remote_script_path" >&2; return 2; fi

  local -a targets=()
  if [[ -n "${SSM_TARGETS_OVERRIDE:-}" ]]; then
    # shellcheck disable=SC2206
    targets=(${SSM_TARGETS_OVERRIDE})
  else
    # shellcheck disable=SC2206
    targets=($(_ssm_default_targets))
  fi

  local run_id="${GITHUB_RUN_ID:-manual}"
  local attempt="${GITHUB_RUN_ATTEMPT:-0}"
  local sha="${GITHUB_SHA:-nosha}"
  local base
  base="$(basename "$remote_script_path")"

  local script_key="deployments/ssm-scripts/${sha}/${run_id}-${attempt}/${base}"
  _ssm_upload_script_to_s3 "$remote_script_path" "$script_key"

  local env_text=""
  for v in AWS_REGION S3_BUCKET APP_NAME ENV SHA DEPLOY_BACKEND DEPLOY_FRONTEND S3_PREFIX; do
    if [[ -n "${!v:-}" ]]; then
      env_text+="${v}=${!v}"$'\n'
    fi
  done

  local env_key="deployments/ssm-scripts/${sha}/${run_id}-${attempt}/remote.env"
  printf "%s" "$env_text" > /tmp/remote.env
  _ssm_upload_script_to_s3 /tmp/remote.env "$env_key"

  cat > /tmp/ssm-params.json <<JSON
{
  "commands": [
    "bash -lc 'set -euo pipefail; \
aws s3 cp \"s3://${S3_BUCKET}/${env_key}\" /tmp/remote.env --region \"${AWS_REGION}\"; \
aws s3 cp \"s3://${S3_BUCKET}/${script_key}\" /tmp/remote.sh --region \"${AWS_REGION}\"; \
chmod +x /tmp/remote.sh; \
set -a; source /tmp/remote.env; set +a; \
/tmp/remote.sh'"
  ]
}
JSON

  aws ssm send-command \
    --region "${AWS_REGION}" \
    --document-name "AWS-RunShellScript" \
    --targets "${targets[@]}" \
    --comment "$comment" \
    --parameters file:///tmp/ssm-params.json \
    --query "Command.CommandId" \
    --output text
}

_ssm_get_instance_ids() {
  local command_id="$1"
  local max_attempts="${2:-60}"
  local delay="${3:-2}"

  local attempt=0
  while (( attempt < max_attempts )); do
    attempt=$((attempt + 1))

    local ids
    ids="$(
      aws ssm list-command-invocations \
        --region "${AWS_REGION}" \
        --command-id "$command_id" \
        --query "CommandInvocations[].InstanceId" \
        --output text 2>/dev/null || true
    )"

    if [[ -n "${ids// /}" && "${ids}" != "None" ]]; then
      echo "$ids"
      return 0
    fi

    sleep "$delay"
  done

  return 1
}

_ssm_get_status() {
  local command_id="$1"
  local instance_id="$2"

  aws ssm get-command-invocation \
    --region "${AWS_REGION}" \
    --command-id "$command_id" \
    --instance-id "$instance_id" \
    --query "Status" \
    --output text 2>/dev/null || echo ""
}

_ssm_get_response_code() {
  local command_id="$1"
  local instance_id="$2"

  aws ssm get-command-invocation \
    --region "${AWS_REGION}" \
    --command-id "$command_id" \
    --instance-id "$instance_id" \
    --query "ResponseCode" \
    --output text 2>/dev/null || echo ""
}

_ssm_dump_instance_output() {
  local command_id="$1"
  local instance_id="$2"

  aws ssm get-command-invocation \
    --region "${AWS_REGION}" \
    --command-id "$command_id" \
    --instance-id "$instance_id" \
    --query '{
      InstanceId: InstanceId,
      Status: Status,
      ResponseCode: ResponseCode,
      Stdout: StandardOutputContent,
      Stderr: StandardErrorContent
    }' \
    --output json || true
}

ssm_run() {
  local comment="$1"
  local remote_script_path="$2"

  local command_id
  command_id="$(_ssm_send_command "$comment" "$remote_script_path")"
  echo "SSM CommandId: $command_id"

  local delay max_attempts
  delay="$(_ssm_poll_delay)"
  max_attempts="$(_ssm_poll_max)"

  local instance_ids
  if ! instance_ids="$(_ssm_get_instance_ids "$command_id" 60 "$delay")"; then
    echo "Invocation records not visible yet for command-id=$command_id" >&2
    echo "Treating this as a polling failure, not a deploy failure." >&2
    return 2
  fi

  local attempt=0
  while true; do
    attempt=$((attempt + 1))
    local any_in_progress=0

    for iid in $instance_ids; do
      local status
      status="$(_ssm_get_status "$command_id" "$iid")"

      case "$status" in
        Pending|InProgress|Delayed|"")
          any_in_progress=1
          ;;
      esac
    done

    if [[ "$any_in_progress" -eq 0 ]]; then
      break
    fi

    if [[ "$attempt" -ge "$max_attempts" ]]; then
      echo "SSM command did not finish within bounds." >&2
      break
    fi

    sleep "$delay"
  done

  local failed=0
  for iid in $instance_ids; do
    _ssm_dump_instance_output "$command_id" "$iid"

    local final_status response_code
    final_status="$(_ssm_get_status "$command_id" "$iid")"
    response_code="$(_ssm_get_response_code "$command_id" "$iid")"

    [[ "$final_status" == "Success" && "$response_code" == "0" ]] || failed=1
  done

  [[ "$failed" -eq 0 ]]
}

export -f ssm_run
