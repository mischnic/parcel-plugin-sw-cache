import "./style.css";

const htmlParser = sel => res => {
	const parser = new DOMParser();
	const xmlDoc = parser.parseFromString(res, "text/html");
	return xmlDoc.querySelector(sel).innerText.split(" ")[0];
};

fetch("https://cors-anywhere.herokuapp.com/https://www.unixtimestamp.com", {
	headers: { "x-requested-with": "fetch" }
})
	.then(res => res.text())
	.then(htmlParser(".page-header ~ .text-danger"))
	.then(res => (document.getElementById("content").innerText = res));
