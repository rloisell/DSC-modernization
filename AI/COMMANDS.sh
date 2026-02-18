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
