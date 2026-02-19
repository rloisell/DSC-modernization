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
