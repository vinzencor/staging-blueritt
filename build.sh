if [ "$CF_PAGES_BRANCH" == "main" ]; then
  npm run build -- --mode production
elif [ "$CF_PAGES_BRANCH" == "staging" ]; then
  npm run build -- --mode staging
else
  npm run build -- --mode staging
fi
