const urlParams = new URLSearchParams(window.location.search);

const add = (elem) => document.querySelector("#output").append(elem);

let index = undefined;

async function loadIndex() {
  const json = await fetch("/search_index.json").then((response) => {
    if (!response.ok) {
      throw new Error("failed to fetch data");
    }
    return response.json();
  });
  return lunr.Index.load(json);
}

async function search(term) {
  if (!index) {
    index = await loadIndex();
  }
  return index.search(term + "~" + Math.floor(Math.log(term.length)));
}

function displayResults(results) {
  const headline = document.createElement("h2");
  headline.className = "text-muted";
  headline.innerText = results.length + " Treffer gefunden:";
  add(headline);
  document.querySelector("#spinner").style.display = "none";
  if (results.length > 0) {
    const list = document.createElement("ul");
    list.className = "mb-5";
    for ({ ref } of results) {
      const { url, title } = JSON.parse(ref);
      const listElem = document.createElement("li");
      const link = document.createElement("a");
      link.href = url;
      link.innerText = `${url} - ${title}`;
      listElem.append(link);
      list.append(listElem);
    }
    add(list);
  }
}

function handleSearch(event) {
  event.preventDefault();
  /* change url param */
  const query = document.querySelector("#queryfield").value;
  const url = new URL(window.location);
  url.searchParams.set("query", query);
  window.history.pushState({}, "", url);
  /* clear output */
  document.querySelectorAll("#output > *").forEach((element) => element.remove());
  /* display spinner */
  document.querySelector("#spinner").style.display = "block";
  /* search and display results */
  search(query).then(displayResults);
}

function init() {
  document.querySelector("#searchform").addEventListener("submit", handleSearch);

  const urlParams = new URLSearchParams(window.location.search);

  if (urlParams.has("query") && urlParams.get("query")) {
    const query = urlParams.get("query");
    document.querySelector("#queryfield").value = query;
    search(query).then(displayResults);
  }
}

init();
