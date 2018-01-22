import "./style.css";

const xmlParser = (sel) => (res)=>{
	const parser = new DOMParser();
	const xmlDoc = parser.parseFromString(res,"text/xml");
	return xmlDoc.querySelector(sel).innerHTML;
}

fetch("http://cors-anywhere.herokuapp.com/http://tycho.usno.navy.mil/cgi-bin/time.pl", {headers: {"x-requested-with": "fetch"}})
	.then((res)=>res.text())
	.then(xmlParser("usno > t"))
	.then((res)=>document.getElementById("content").innerText = res);
