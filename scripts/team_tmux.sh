#!/usr/bin/env bash
set -euo pipefail

SESSION="codex-team"

usage() {
  cat <<'USAGE'
tmux team helper

Usage:
  team init                 # create session and role windows
  team send <win> <msg>     # send message to a window (lead|integrator|features|qa|docs)
  team capture <win>        # print last 200 lines from a window
  team kickoff              # seed prompts and assign initial tasks
  team kill                 # kill the session

Examples:
  team init
  team send integrator "Run installs per .vibe/TASKS.md"
  team capture integrator
  team kickoff
USAGE
}

team_init() {
  tmux has-session -t "$SESSION" 2>/dev/null && {
    echo "Session $SESSION already exists" >&2
    return 0
  }
  tmux new-session -d -s "$SESSION" -n lead
  for w in integrator features qa docs; do
    tmux new-window -t "$SESSION" -n "$w"
  done
  echo "Created tmux session $SESSION with windows: lead, integrator, features, qa, docs"
}

team_send() {
  local WIN=$1; shift
  local MSG=${*:-}
  [[ -z "$MSG" ]] && { echo "Message required" >&2; exit 1; }
  tmux send-keys -t "$SESSION:$WIN" "$MSG" C-m
}

team_capture() {
  local WIN=$1
  tmux capture-pane -pt "$SESSION:$WIN" -S -200
}

team_kickoff() {
  team_init || true
  # Seed role prompts if present
  local PROMPTS_FILE=".vibe/team_prompts.txt"
  if [[ -f "$PROMPTS_FILE" ]]; then
    # Format: WIN|MESSAGE
    while IFS='|' read -r win msg; do
      [[ -z "$win" || -z "$msg" ]] && continue
      team_send "$win" "$msg"
      sleep 0.1
    done < <(grep -v '^#' "$PROMPTS_FILE")
  fi
  # Assign initial tasks
  team_send integrator "[LEAD] Install modules: npx expo install expo-av expo-video expo-camera expo-image-picker expo-media-library expo-file-system expo-speech"
  team_send features "[LEAD] Add minimal dynamic-import stubs in App.tsx: Speech, ImagePicker, AV, MediaLibrary, FileSystem, Camera."
  team_send qa "[LEAD] Add smoke tests for module imports and basic App render under __tests__/."
  team_send docs "[LEAD] Update README/AGENTS with installed modules and troubleshooting."
  echo "Kickoff messages sent. Use: tmux attach -t $SESSION"
}

team_kill() { tmux kill-session -t "$SESSION"; }

case "${1:-}" in
  init) team_init ;;
  send) shift; team_send "$@" ;;
  capture) shift; team_capture "$@" ;;
  kickoff) team_kickoff ;;
  kill) team_kill ;;
  -h|--help|help|*) usage ;;
esac

