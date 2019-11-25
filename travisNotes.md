# In order to be able to deploy builds with travis on github releases:

## 1. Generate a GitHub ‘Personal Access Token’ with the following scopes:

read:org

user:email

repo_deployment

repo:status

write:repo_hook

public_repo

copy the token and paste it in the enviromental variable section of travis-ci

## 2. On the Travis settings for the repository https://travis-ci.org/me/myrepo/settings create an environment variable:

GITHUB_API_KEY = token

and make sure to mark "Display value in build log" as "Off", and use:

api_key: '$GITHUB_API_KEY'

in .travis.yml

While this will not show on logs for pull requests, this method is riskier, as you could my mistake list the environment of a build.

# Sources:
- https://stackoverflow.com/questions/12343452/how-to-publish-artifacts-in-travis-ci/33109519#33109519
- https://travis-ci.community/t/deploy-api-key-github-oauth-token-ambiguity/5092/4
