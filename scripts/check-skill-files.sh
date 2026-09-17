#!/usr/bin/env bash
# Supporting files shipped next to a SKILL.md must be linked from it: agents resolve
# file references one level deep, so an unlinked file is dead weight. Scripts must parse.
# A skill's own README.md is maintainer documentation and is exempt (see AGENTS.md, Layout).
set -euo pipefail
cd "$(dirname "$0")/.."

fail=0

for skill in skills/*/; do
  [ -e "${skill}SKILL.md" ] || continue
  while IFS= read -r -d '' file; do
    [ "$file" = "${skill}SKILL.md" ] && continue
    rel=${file#"$skill"}

    if [ "$rel" != "README.md" ] \
      && ! grep -qF "](${rel}" "${skill}SKILL.md" \
      && ! grep -qF "](./${rel}" "${skill}SKILL.md"; then
      echo "$file: not linked from ${skill}SKILL.md (expected a markdown link like [...](${rel}))"
      fail=1
    fi

    case "$file" in
      *.sh)
        head -1 "$file" | grep -q '^#!' || {
          echo "$file: missing shebang"
          fail=1
        }
        bash -n "$file" || {
          echo "$file: bash syntax check failed"
          fail=1
        }
        ;;
      *.py)
        python3 -c 'import ast, sys; ast.parse(open(sys.argv[1]).read())' "$file" || {
          echo "$file: python syntax check failed"
          fail=1
        }
        ;;
    esac
  done < <(git ls-files -z -- "$skill")
done

exit $fail
