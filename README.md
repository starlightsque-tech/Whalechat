unzip whalechat-render.zip -d whalechat && cd whalechat
git init && git add . && git commit -m "WhaleChat"
git branch -M main
git remote add origin https://github.com/<you>/whalechat.git && git push -u origin main
