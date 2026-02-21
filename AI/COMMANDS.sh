```bash
# Commands used to initialize and create the GitHub repo (run locally if needed)

# initialize repo
git init
git checkout -b main
git add -A
git commit -m "chore(init): scaffold DSC-modernization with README, .gitignore, CI, and AI tracking"

# create GitHub repo with gh (assumes gh is authenticated)
gh repo create rloisell/DSC-modernization --public --source=. --remote=origin --confirm --push

``` 

# Recommended setup commands (macOS)

## Install .NET 10 (per-user)
# curl -sSL https://dot.net/v1/dotnet-install.sh -o /tmp/dotnet-install.sh
# bash /tmp/dotnet-install.sh --channel 10.0 --install-dir "$HOME/.dotnet" --architecture arm64

## Ensure dotnet-ef is available
# dotnet tool install --global dotnet-ef

## MariaDB (Homebrew)
# brew install mariadb
# brew services start mariadb
# mysql_secure_installation
# mysql -uroot -p -e "CREATE DATABASE dsc_modernization_dev; CREATE USER 'dsc_dev'@'localhost' IDENTIFIED BY 'your_strong_password'; GRANT ALL PRIVILEGES ON dsc_modernization_dev.* TO 'dsc_dev'@'localhost'; FLUSH PRIVILEGES;"

## 2026-02-21 — Missing diagrams (activity, state, physical schema)
# Created 5 new PlantUML diagram files:
#   diagrams/plantuml/activity-time-entry.puml
#   diagrams/plantuml/activity-admin-users.puml
#   diagrams/plantuml/state-workitem.puml
#   diagrams/plantuml/state-user.puml
#   diagrams/plantuml/erd-physical.puml
# Updated diagrams/README.md — Required Diagrams table now 10/10 complete
git add diagrams/plantuml/activity-time-entry.puml \
        diagrams/plantuml/activity-admin-users.puml \
        diagrams/plantuml/state-workitem.puml \
        diagrams/plantuml/state-user.puml \
        diagrams/plantuml/erd-physical.puml \
        diagrams/README.md \
        AI/CHANGES.csv AI/COMMANDS.sh AI/WORKLOG.md
git commit -m "docs: add activity, state, and physical schema diagrams — complete required diagram set"
git push
