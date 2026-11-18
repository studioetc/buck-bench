#!/bin/zsh
# Sequential Black Buck runs in ~/Dev/buck. Outputs move to ~/Dev/buck-runs/<model>/ after each run.
# Output cap raised to 128000 (Claude Code clamps to each model max) after Sonnet 4.6 looped on the 32k default (issue #102429).
# The run folder is served at http://localhost:8607/ so Claude in Chrome can open the page (it refuses file://).
PROMPT="Research and create a simulation of the refuelling used in Operation Black Buck in the Falklands Vulcan bombing. Something on a map - rich, animated, scaled to be more readable. The output is to be html. Don't use skills or subagents. I want something really impressive."
RUN=~/Dev/buck; OUT=~/Dev/buck-runs; PROJ=~/.claude/projects/-Users-onesteppplusgmai-com-Dev-buck
SCR=/private/tmp/claude-501/-Users-onesteppplusgmai-com-Dev-buck
MODELS=($@); (( ${#MODELS} )) || MODELS=(claude-sonnet-4-5 claude-sonnet-4-6 claude-sonnet-5-5 claude-opus-4-5 claude-opus-4-6)
for m in $MODELS; do
  echo "$(date '+%F %T') START $m" >> $OUT/log.txt
  cd $RUN
  python3 -m http.server 8607 --bind 127.0.0.1 >/dev/null 2>&1 &
  SERVER=$!
  CLAUDE_CODE_DISABLE_FEATURE_FLAGS=1 CLAUDE_CODE_MAX_OUTPUT_TOKENS=128000 timeout 7200 claude -p --safe-mode --chrome --disable-slash-commands --disallowed-tools Artifact \
    --dangerously-skip-permissions --model $m --effort xhigh -n Vulcan --output-format json \
    --append-system-prompt "Files in the working directory are served at http://localhost:8607/." \
    "$PROMPT" > $OUT/$m.result.json 2> $OUT/$m.stderr.txt
  echo "$(date '+%F %T') END $m exit=$?" >> $OUT/log.txt
  kill $SERVER 2>/dev/null
  mkdir -p $OUT/$m/scratchpad
  SID=$(jq -r '.session_id // empty' $OUT/$m.result.json 2>/dev/null)
  [ -n "$SID" ] && [ -d $SCR/$SID ] && cp -Rp $SCR/$SID/. $OUT/$m/scratchpad/
  cd ~
  find $RUN -mindepth 1 -maxdepth 1 -exec mv {} $OUT/$m/ \;
  rm -rf $PROJ/memory
  echo "$(date '+%F %T') ARCHIVED $m session=$SID files=$(ls -A $OUT/$m | wc -l | tr -d ' ') left=$(ls -A $RUN | wc -l | tr -d ' ')" >> $OUT/log.txt
done
echo "$(date '+%F %T') ALL DONE" >> $OUT/log.txt
