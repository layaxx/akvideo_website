const urlParams = new URLSearchParams(window.location.search);

const add = (elem) => document.querySelector("#output").append(elem);

if (urlParams.has("query") && urlParams.get("query")) {
  const idx = lunr(function () {
    this.field("content");
    this.field("title");
    this.field("url");
    this.ref("url");

    data.forEach((project) => this.add(project), this);
  });
  const results = idx.search(urlParams.get("query") + "~2");
  const headline = document.createElement("h2");
  headline.className = "text-muted";
  headline.innerText = results.length + " Treffer gefunden:";
  add(headline);
  if (results.length > 0) {
    const list = document.createElement("ul");
    list.className = "mb-5";
    for (res of results) {
      const listElem = document.createElement("li");
      const link = document.createElement("a");
      link.href = res.ref;
      link.innerText = res.ref;
      listElem.append(link);
      list.append(listElem);
    }
    add(list);
  }
}
